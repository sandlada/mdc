/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Pure, framework-agnostic Overlay Tree data structure & state transitions.
 * Supports arbitrarily nested overlays ("popup inside popup"):
 * - Parent-child hierarchy tracking
 * - Sibling exclusion by group
 * - Cascading close (closing a parent closes all descendants first)
 * - Leaf-first Escape resolution (deepest most-recently-opened leaf handles Escape)
 * - Subtree boundary checks (clicking inside a child does not dismiss its parent)
 */

export interface IOverlayTreeNode {
    readonly id: string
    readonly parentId: string | null
    readonly group: string | null
    readonly open: boolean
    readonly openedAt: number
}

export type OverlayTreeMap = ReadonlyMap<string, IOverlayTreeNode>

const assertNonEmptyId = (id: string): void => {
    if (!id || id.trim().length === 0) {
        throw new Error('Overlay node id must be a non-empty string')
    }
}

/**
 * Checks whether `candidateId` is `rootId` itself or a descendant of `rootId`.
 */
export const isOverlayInSubtree = (rootId: string) => (candidateId: string) => (tree: OverlayTreeMap): boolean => {
    if (candidateId === rootId) return true
    let current = tree.get(candidateId)
    const visited = new Set<string>()
    while (current && current.parentId !== null) {
        if (visited.has(current.id)) return false
        visited.add(current.id)
        if (current.parentId === rootId) return true
        current = tree.get(current.parentId)
    }
    return false
}

/**
 * Returns all ancestor IDs of `id`, ordered from immediate parent up to root.
 */
export const getOverlayAncestors = (id: string) => (tree: OverlayTreeMap): string[] => {
    const ancestors: string[] = []
    const visited = new Set<string>([id])
    let current = tree.get(id)
    while (current && current.parentId !== null) {
        if (visited.has(current.parentId)) break
        visited.add(current.parentId)
        ancestors.push(current.parentId)
        current = tree.get(current.parentId)
    }
    return ancestors
}

/**
 * Returns all descendant IDs of `id` in post-order (deepest leaves first).
 */
export const getOverlayDescendantsPostOrder = (id: string) => (tree: OverlayTreeMap): string[] => {
    const result: string[] = []
    const visited = new Set<string>([id])

    const visit = (parentId: string): void => {
        for (const node of tree.values()) {
            if (node.parentId === parentId && !visited.has(node.id)) {
                visited.add(node.id)
                visit(node.id)
                result.push(node.id)
            }
        }
    }

    visit(id)
    return result
}

/**
 * Returns the depth of `id` in the tree (0 for root nodes).
 */
export const getOverlayDepth = (id: string) => (tree: OverlayTreeMap): number =>
    getOverlayAncestors(id)(tree).length

/**
 * Returns open sibling IDs that share the same `parentId` and non-null `group`.
 */
export const getConflictingOpenSiblings = (id: string) => (tree: OverlayTreeMap): string[] => {
    const target = tree.get(id)
    if (!target || !target.group) return []
    const siblings: string[] = []
    for (const node of tree.values()) {
        if (
            node.id !== target.id
            && node.open
            && node.parentId === target.parentId
            && node.group === target.group
        ) {
            siblings.push(node.id)
        }
    }
    return siblings
}

/**
 * Finds the deepest, most-recently-opened active leaf node ID.
 * Returns `null` if no overlay is open.
 */
export const getDeepestActiveLeafId = (tree: OverlayTreeMap): string | null => {
    const openNodes = Array.from(tree.values()).filter((node) => node.open)
    if (openNodes.length === 0) return null

    const parentsWithOpenChildren = new Set<string>()
    for (const node of openNodes) {
        if (node.parentId !== null) {
            parentsWithOpenChildren.add(node.parentId)
        }
    }

    const leaves = openNodes.filter((node) => !parentsWithOpenChildren.has(node.id))
    const candidates = leaves.length > 0 ? leaves : openNodes

    let best = candidates[0]
    let bestDepth = getOverlayDepth(best.id)(tree)
    for (let i = 1; i < candidates.length; i++) {
        const candidate = candidates[i]
        const depth = getOverlayDepth(candidate.id)(tree)
        if (depth > bestDepth || (depth === bestDepth && candidate.openedAt > best.openedAt)) {
            best = candidate
            bestDepth = depth
        }
    }
    return best.id
}

/**
 * Stateful coordinator wrapping the pure OverlayTree helpers for live runtime controllers.
 */
export class OverlayTreeManager {
    private readonly nodes = new Map<string, IOverlayTreeNode>()
    private readonly closeHandlers = new Map<string, (reason: string) => Promise<void> | void>()
    private readonly surfaceElements = new Map<string, () => HTMLElement | null | undefined>()
    private openSequence = 0

    public get snapshot(): OverlayTreeMap {
        return this.nodes
    }

    public register(
        id: string,
        options: {
            parentId?: string | null
            group?: string | null
            getSurface?: () => HTMLElement | null | undefined
            onClose?: (reason: string) => Promise<void> | void
        } = {},
    ): void {
        assertNonEmptyId(id)
        const parentId = options.parentId ?? null
        if (parentId === id) {
            throw new Error(`Overlay node "${id}" cannot be its own parent`)
        }
        const existing = this.nodes.get(id)
        this.nodes.set(id, {
            id,
            parentId,
            group: options.group ?? null,
            open: existing?.open ?? false,
            openedAt: existing?.openedAt ?? 0,
        })
        if (options.getSurface) {
            this.surfaceElements.set(id, options.getSurface)
        }
        if (options.onClose) {
            this.closeHandlers.set(id, options.onClose)
        }
    }

    public setParent(id: string, parentId: string | null): void {
        const node = this.nodes.get(id)
        if (!node) return
        if (parentId === id) {
            throw new Error(`Overlay node "${id}" cannot be its own parent`)
        }
        if (parentId !== null && isOverlayInSubtree(id)(parentId)(this.nodes)) {
            throw new Error(`Circular overlay hierarchy detected: "${parentId}" is a descendant of "${id}"`)
        }
        this.nodes.set(id, { ...node, parentId })
    }

    public unregister(id: string): void {
        this.nodes.delete(id)
        this.closeHandlers.delete(id)
        this.surfaceElements.delete(id)
    }

    /**
     * Marks `id` as open and closes any conflicting open siblings (and their subtrees) in the same group.
     */
    public async markOpen(id: string): Promise<void> {
        const node = this.nodes.get(id)
        if (!node) {
            throw new Error(`Cannot open unregistered overlay node "${id}"`)
        }

        const siblings = getConflictingOpenSiblings(id)(this.nodes)
        for (const siblingId of siblings) {
            await this.closeSubtree(siblingId, 'exclusive')
        }

        const current = this.nodes.get(id)
        if (!current) return
        this.nodes.set(id, {
            ...current,
            open: true,
            openedAt: ++this.openSequence,
        })
    }

    /**
     * Marks `id` as closed and cascades close to all open descendants first.
     */
    public async markClosed(id: string, reason = 'programmatic'): Promise<void> {
        const descendants = getOverlayDescendantsPostOrder(id)(this.nodes)
        for (const childId of descendants) {
            const child = this.nodes.get(childId)
            if (child?.open) {
                this.nodes.set(childId, { ...child, open: false })
                await this.closeHandlers.get(childId)?.(reason)
            }
        }
        const node = this.nodes.get(id)
        if (node) {
            this.nodes.set(id, { ...node, open: false })
        }
    }

    /**
     * Closes `id` and all its open descendants (post-order).
     */
    public async closeSubtree(id: string, reason = 'programmatic'): Promise<void> {
        const descendants = getOverlayDescendantsPostOrder(id)(this.nodes)
        for (const childId of descendants) {
            const child = this.nodes.get(childId)
            if (child?.open) {
                this.nodes.set(childId, { ...child, open: false })
                await this.closeHandlers.get(childId)?.(reason)
            }
        }
        const node = this.nodes.get(id)
        if (node?.open) {
            this.nodes.set(id, { ...node, open: false })
            await this.closeHandlers.get(id)?.(reason)
        }
    }

    public getDeepestActiveLeafId(): string | null {
        return getDeepestActiveLeafId(this.nodes)
    }

    /**
     * Returns all surface elements belonging to open descendants of `id`.
     */
    public getOpenDescendantSurfaces(id: string): HTMLElement[] {
        const surfaces: HTMLElement[] = []
        const descendants = getOverlayDescendantsPostOrder(id)(this.nodes)
        for (const childId of descendants) {
            const node = this.nodes.get(childId)
            if (!node?.open) continue
            const el = this.surfaceElements.get(childId)?.()
            if (el) surfaces.push(el)
        }
        return surfaces
    }

    public clear(): void {
        this.nodes.clear()
        this.closeHandlers.clear()
        this.surfaceElements.clear()
        this.openSequence = 0
    }
}

/**
 * Shared singleton OverlayTree coordinating all overlays across the document.
 */
export const DefaultOverlayTree = new OverlayTreeManager()

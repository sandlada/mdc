/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/**
 * DockLayout tree data model.
 *
 * Pure data — no DOM access. All dock-* components read from and mutate
 * a `GridNode` tree; the tree is the single source of truth.
 */

export type Orientation = 'horizontal' | 'vertical'
export type Direction = 'left' | 'right' | 'top' | 'bottom'

export interface Rect {
    x: number
    y: number
    width: number
    height: number
}

export interface SizeConstraints {
    minPx?: number
    maxPx?: number
    preferred?: number
    snap?: boolean
}

export interface TabSpec {
    id: string
    title: string
    icon?: string
    closable?: boolean
    pinned?: boolean
    dirty?: boolean
}

export interface LeafNode {
    kind: 'leaf'
    id: string
    view: string
    title?: string
    icon?: string
    constraints?: SizeConstraints
    activeTab?: string
    tabs?: TabSpec[]
}

export interface BranchNode {
    kind: 'branch'
    id: string
    orientation: Orientation
    children: GridNode[]
    size?: number
}

export type GridNode = LeafNode | BranchNode

export interface IDockLayoutData {
    root: GridNode
    sidebars?: {
        left?: GridNode[]
        right?: GridNode[]
    }
    panel?: GridNode
}

export function serialize(data: IDockLayoutData): string {
    return JSON.stringify(data)
}

export function deserialize(json: string): IDockLayoutData {
    const parsed = JSON.parse(json) as IDockLayoutData
    return parsed
}

function cloneNode(node: GridNode): GridNode {
    if (node.kind === 'leaf') return { ...node }
    return { ...node, children: node.children.map(cloneNode) }
}

function findParent(tree: GridNode, id: string, parent: BranchNode | null = null): BranchNode | null {
    if (tree.kind === 'leaf') return tree.id === id ? parent : null
    if (tree.id === id) return parent
    for (const child of tree.children) {
        const found = findParent(child, id, tree)
        if (found) return found
    }
    return null
}

function findNode(tree: GridNode, id: string): GridNode | null {
    if (tree.id === id) return tree
    if (tree.kind === 'leaf') return null
    for (const child of tree.children) {
        const found = findNode(child, id)
        if (found) return found
    }
    return null
}

const isHorizontal = (direction: Direction) => direction === 'left' || direction === 'right'
const isLeading = (direction: Direction) => direction === 'left' || direction === 'top'

/**
 * Splits the leaf identified by `refId` and inserts `newLeaf` adjacent to it
 * in the given direction. If the reference is at the root, a new branch wraps
 * the root. If the parent branch already has the right orientation, the new
 * leaf is inserted next to the reference; otherwise a new branch is created.
 */
export function addLeafAt(tree: GridNode, newLeaf: LeafNode, refId: string, direction: Direction): GridNode {
    const cloned = cloneNode(tree)
    const refNode = findNode(cloned, refId)
    if (!refNode) return cloned

    const requiredOrientation: Orientation = isHorizontal(direction) ? 'horizontal' : 'vertical'
    const parent = findParent(cloned, refId)

    if (!parent) {
        // refNode is root. Wrap it.
        const newBranch: BranchNode = {
            kind: 'branch',
            id: `branch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            orientation: requiredOrientation,
            children: isLeading(direction) ? [newLeaf, refNode] : [refNode, newLeaf],
        }
        return newBranch
    }

    if (parent.orientation === requiredOrientation) {
        const idx = parent.children.indexOf(refNode)
        const insertIdx = isLeading(direction) ? idx : idx + 1
        parent.children.splice(insertIdx, 0, newLeaf)
        return cloned
    }

    // Wrong orientation. Replace refNode with a new branch.
    const idx = parent.children.indexOf(refNode)
    const newBranch: BranchNode = {
        kind: 'branch',
        id: `branch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        orientation: requiredOrientation,
        children: isLeading(direction) ? [newLeaf, refNode] : [refNode, newLeaf],
    }
    parent.children[idx] = newBranch
    return cloned
}

export function removeLeaf(tree: GridNode, leafId: string): GridNode {
    const cloned = cloneNode(tree)
    const parent = findParent(cloned, leafId)
    if (!parent) return cloned

    const idx = parent.children.findIndex((c) => c.id === leafId)
    if (idx === -1) return cloned

    parent.children.splice(idx, 1)

    if (parent.children.length === 1) {
        const remaining = parent.children[0]
        const grandParent = findParent(cloned, parent.id)
        if (grandParent) {
            const gIdx = grandParent.children.indexOf(parent)
            grandParent.children[gIdx] = remaining
        } else {
            // Parent is the root and has one child left — collapse.
            // Caller is responsible for replacing the root if this happens.
        }
    }

    return cloned
}

/**
 * Sets the proportional size of `leafId` within its parent branch.
 * Sizes are stored as a fraction (0..1) and the parent distributes
 * available space proportionally. To keep the leaf's size *constant*
 * while siblings grow, use `setSizePx` (added in Task 2 after projection).
 */
export function resizeLeaf(tree: GridNode, leafId: string, newSize: number): GridNode {
    const cloned = cloneNode(tree)
    const parent = findParent(cloned, leafId)
    if (!parent) return cloned

    const idx = parent.children.findIndex((c) => c.id === leafId)
    if (idx === -1) return cloned

    const child = parent.children[idx]
    child.size = Math.max(0.01, Math.min(0.99, newSize))
    return cloned
}

// DropZone is defined in dock-hit-tester.ts. Stub for now.
export interface DropZoneStub {
    kind: 'merge' | 'split' | 'sash' | 'outer'
    leafId?: string
    edge?: Direction | 'left' | 'right' | 'bottom'
}

export function moveLeaf(tree: GridNode, sourceId: string, zone: DropZoneStub): GridNode {
    // Full implementation in Task 8 after DropZone is locked in.
    // For now, just remove the leaf from its current position.
    return removeLeaf(tree, sourceId)
}
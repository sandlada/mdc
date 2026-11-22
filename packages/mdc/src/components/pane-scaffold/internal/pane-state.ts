/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ScaffoldBreakpoints, ScaffoldHeightBreakpoints } from '../../scaffold'
import {
    PaneScaffoldBackNavigationBehavior as BackBehavior,
    PaneExpansionAnchorType,
    type IMDCPaneScaffold, type IPaneExpansionAnchor, type IPaneScaffoldDestination, type IPaneScaffoldDirective,
    type IPaneScaffoldLevitateStrategy, type IPaneScaffoldReflowedPane, type PaneScaffoldPattern,
    type PaneScaffoldAdaptStrategy, type PaneScaffoldPreferredSize, type PaneScaffoldRole,
} from '../pane-scaffold.interface'

export const PaneRoles = {
    'list-detail': ['list', 'detail', 'extra'],
    'supporting-pane': ['main', 'supporting', 'extra'],
} as const

export const paneExpansionLayoutKey = (pattern: PaneScaffoldPattern) => (roles: readonly PaneScaffoldRole[]): string =>
    `${pattern}:${(roles.length === 2 ? PaneRoles[pattern].filter(role => roles.includes(role)) : roles).join(',')}`

export const initialDestination = (pattern: PaneScaffoldPattern): IPaneScaffoldDestination => ({
    pane: PaneRoles[pattern][0],
    contentKey: undefined,
})

export const sameDestination = (previous: IPaneScaffoldDestination) => (next: IPaneScaffoldDestination) =>
    previous.pane === next.pane && previous.contentKey === next.contentKey

export const pruneHistory = (present: ReadonlySet<PaneScaffoldRole>) =>
    <T extends { destination: IPaneScaffoldDestination }>(history: readonly T[]): T[] =>
        history.filter(entry => present.has(entry.destination.pane))

export const findBackDestination = (
    behavior: BackBehavior,
    scaffoldValueAt: (index: number) => string,
) => (destinations: readonly IPaneScaffoldDestination[]): number => {
    if (!Object.values(BackBehavior).includes(behavior)) throw new Error(`Invalid pane back navigation behavior: ${behavior}`)
    const currentIndex = destinations.length - 1
    if (currentIndex < 1) return -1
    if (behavior === BackBehavior.PopLatest) return currentIndex - 1

    const current = destinations[currentIndex]
    const currentLayout = scaffoldValueAt(currentIndex)
    return destinations.findLastIndex((candidate, index) => {
        if (index >= currentIndex) return false
        if (behavior === BackBehavior.PopUntilCurrentDestinationChange) return candidate.pane !== current.pane
        if (behavior === BackBehavior.PopUntilContentChange && candidate.contentKey !== current.contentKey) return true
        return scaffoldValueAt(index) !== currentLayout
    })
}

const panePriority = (pattern: PaneScaffoldPattern): readonly PaneScaffoldRole[] =>
    pattern === 'list-detail' ? ['detail', 'list', 'extra'] : PaneRoles[pattern]

export type PanePreferredLengths = Readonly<Partial<Record<PaneScaffoldRole, number>>>

const resolvePreferredLengths = (available: number) =>
    (sizes: Readonly<Partial<Record<PaneScaffoldRole, PaneScaffoldPreferredSize>>>): PanePreferredLengths =>
        Object.fromEntries(Object.entries(sizes).map(([role, size]) => {
            if (typeof size === 'number' && Number.isFinite(size) && size > 0) return [role, size]
            if (size && typeof size === 'object' && Number.isFinite(size.proportion) && size.proportion >= 0 && size.proportion <= 1) {
                return [role, size.proportion * available]
            }
            throw new Error(`Invalid preferred size for pane: ${role}`)
        }))

export const resolveDirective = (width: number, height: number) => (directive?: IPaneScaffoldDirective) => {
    const partitions = directive?.maxHorizontalPartitions
        ?? (width < ScaffoldBreakpoints.Expanded ? 1 : width < ScaffoldBreakpoints.Large ? 2 : 3)
    const singlePane = partitions === 1
    const spacer = directive?.horizontalPartitionSpacerSize ?? PaneSpacer
    const minimumWidth = directive?.minimumPaneWidth ?? PaneMinimum
    const preferred = directive?.defaultPanePreferredWidth
        ?? (width < ScaffoldBreakpoints.Large ? PanePreferredWidth : PanePreferredWidthXL)
    const verticalPartitions = directive?.maxVerticalPartitions ?? (singlePane && height >= ScaffoldHeightBreakpoints.Expanded ? 2 : 1)
    const verticalSpacer = directive?.verticalPartitionSpacerSize ?? PaneSpacer
    const preferredHeight = directive?.defaultPanePreferredHeight ?? PanePreferredHeight
    if (![1, 2, 3].includes(partitions)) throw new Error('Pane scaffold requires one to three horizontal partitions')
    if (![1, 2].includes(verticalPartitions)) throw new Error('Pane scaffold requires one or two vertical partitions')
    if (!Number.isFinite(spacer) || spacer < 0) throw new Error('Pane scaffold spacer must be a non-negative finite length')
    if (!Number.isFinite(minimumWidth) || minimumWidth < 0) throw new Error('Pane minimum width must be a non-negative finite length')
    if (!Number.isFinite(verticalSpacer) || verticalSpacer < 0) throw new Error('Pane scaffold vertical spacer must be a non-negative finite length')
    if (![preferred, preferredHeight].every(value => Number.isFinite(value) && value > 0)) {
        throw new Error('Pane scaffold default preferred sizes must be positive finite lengths')
    }
    // Keep room for pane tracks when a directive is used in a container narrower than its spacers.
    const capacity = Math.min(partitions, Math.max(1, Math.floor((width + spacer) / (spacer + 1))))
    const canReflow = singlePane && verticalPartitions === 2 && height >= verticalSpacer + 2
    return {
        capacity, spacer, preferred, minimumWidth, singlePane, canReflow, verticalSpacer, preferredHeight,
        preferredWidths: resolvePreferredLengths(width)(directive?.preferredWidths ?? {}),
        preferredHeights: resolvePreferredLengths(height)(directive?.preferredHeights ?? {}),
    }
}

export interface PaneLayout {
    expanded: PaneScaffoldRole[]
    reflowed?: IPaneScaffoldReflowedPane
    levitated?: { pane: PaneScaffoldRole; strategy: IPaneScaffoldLevitateStrategy }
}

const SupportingReflow: PaneScaffoldAdaptStrategy = { type: 'reflow', reflowUnder: 'main' }

export const resolvePaneOrder = (pattern: PaneScaffoldPattern, order?: readonly PaneScaffoldRole[]): readonly PaneScaffoldRole[] => {
    const allowed: readonly PaneScaffoldRole[] = PaneRoles[pattern]
    if (order === undefined) return allowed
    if (!Array.isArray(order) || order.length !== allowed.length || !allowed.every(role => order.includes(role))) {
        throw new Error('Pane order must contain every role for the current pattern exactly once')
    }
    return order
}

export const resolvePaneLayout = (
    pattern: PaneScaffoldPattern,
    { capacity, singlePane, canReflow }: Pick<ReturnType<ReturnType<typeof resolveDirective>>, 'capacity' | 'singlePane' | 'canReflow'>,
    strategies: IMDCPaneScaffold['adaptStrategies'], destinationHistory: readonly PaneScaffoldRole[],
    order?: readonly PaneScaffoldRole[],
) =>
    (present: ReadonlySet<PaneScaffoldRole>): PaneLayout => {
        const inlineOrder = resolvePaneOrder(pattern, order)
        const levitateStrategy = (role: PaneScaffoldRole) => {
            const strategy = strategies[role]
            if (strategy?.type === 'levitate' && (!strategy.onlyIfSinglePane || singlePane)) return strategy
        }
        const current = destinationHistory.at(-1)
        const lift = current && present.has(current) ? levitateStrategy(current) : undefined
        const levitated = current && lift ? { pane: current, strategy: lift } : undefined
        const priority = [...new Set([...destinationHistory.toReversed(), ...panePriority(pattern)])]
            .filter(pane => present.has(pane) && !levitateStrategy(pane))
        if (!canReflow) {
            const expanded = priority.slice(0, capacity)
            return { expanded: inlineOrder.filter(pane => expanded.includes(pane)), levitated }
        }

        let expanded: PaneScaffoldRole | undefined
        for (const pane of priority) {
            if (expanded === pane) continue
            const strategy = strategies[pane] ?? (pattern === 'supporting-pane' && pane === 'supporting' ? SupportingReflow : undefined)
            if (strategy?.type === 'reflow' && strategy.reflowUnder !== pane && priority.includes(strategy.reflowUnder)
                && (!expanded || strategy.reflowUnder === expanded)) {
                return { expanded: [strategy.reflowUnder], reflowed: { pane, reflowUnder: strategy.reflowUnder }, levitated }
            }
            expanded ??= pane
        }
        return { expanded: expanded ? [expanded] : [], levitated }
    }

export const PaneMinimum = 240
export const PaneSpacer = 24
export const PanePreferredWidth = 360
export const PanePreferredWidthXL = 412
export const PanePreferredHeight = 420
export const SharedExpansionKeyPrefix = 'shared:'
export const PendingExpansionKeyPrefix = 'pending:'

const FlingVelocityThreshold = 200

export const findExpansionReleaseAnchor = (position: number, velocity: number) =>
    (anchors: ReturnType<ReturnType<typeof resolveExpansionAnchors>>) => {
        const forward = Math.abs(velocity) < FlingVelocityThreshold ? []
            : anchors.filter(anchor => Math.sign(velocity) * (anchor.width - position) >= 0)
        return (forward.length ? forward : anchors).reduce<(typeof anchors)[number] | undefined>((nearest, anchor) => {
            if (!nearest || Math.abs(anchor.width - position) < Math.abs(nearest.width - position)) return anchor
            return nearest
        }, undefined)
    }

export const preferredWeights = (
    pattern: PaneScaffoldPattern, width: number, preferred: number,
    overrides: PanePreferredLengths,
) => (panes: readonly PaneScaffoldRole[]): number[] => {
    const widths = panes.map(role => overrides?.[role] ?? preferred)
    const extra = width - widths.reduce((sum, length) => sum + length, 0)
    const first = panePriority(pattern).find(role => panes.includes(role))
    if (first && extra > 0) widths[panes.indexOf(first)] += extra
    return widths
}

export const resolveWidths = (width: number, minimum: number) => (weights: readonly number[]): number[] => {
    if (weights.length <= 1) return weights.map(() => width)
    const total = weights.reduce((sum, weight) => sum + weight, 0)
    const undersized = weights.findIndex(weight => width * weight / total < minimum)
    if (undersized < 0) return weights.map(weight => width * weight / total)
    const remaining = resolveWidths(width - minimum, minimum)(weights.filter((_, index) => index !== undersized))
    return remaining.toSpliced(undersized, 0, minimum)
}

export const resizeAdjacent = (index: number, desired: number, minimum: number) => (widths: readonly number[]) => {
    const pairWidth = widths[index] + widths[index + 1]
    const first = Math.min(pairWidth - minimum, Math.max(minimum, desired))
    return widths.toSpliced(index, 2, first, pairWidth - first)
}

export const expansionWidth = (width: number) => (type: PaneExpansionAnchorType, value: number): number => {
    switch (type) {
        case PaneExpansionAnchorType.Proportion: return width * value
        case PaneExpansionAnchorType.OffsetFromStart: return value
        case PaneExpansionAnchorType.OffsetFromEnd: return width - value
    }
}

export const clampExpansionWidth = (width: number, minimum: number) => (position: number): number => {
    if (position <= 0) return 0
    if (position >= width) return width
    return Math.min(width - minimum, Math.max(minimum, position))
}

export const validateExpansion = (type: PaneExpansionAnchorType, value: number): void => {
    if (!Object.values(PaneExpansionAnchorType).includes(type) || !Number.isFinite(value)
        || value < 0 || (type === PaneExpansionAnchorType.Proportion && value > 1)) {
        throw new Error('Invalid pane expansion position')
    }
}

export const resolveExpansionAnchors = (width: number, minimum: number) =>
    (anchors: readonly IPaneExpansionAnchor[]) => {
        const ids = new Set<string>()
        return anchors.map(anchor => {
            if (typeof anchor.id !== 'string' || !anchor.id.trim() || ids.has(anchor.id)) throw new Error('Pane expansion anchor IDs must be unique and nonempty')
            ids.add(anchor.id)
            validateExpansion(anchor.type, anchor.value)
            const position = expansionWidth(width)(anchor.type, anchor.value)
            return { id: anchor.id, width: clampExpansionWidth(width, minimum)(position) }
        }).sort((first, second) => first.width - second.width)
    }

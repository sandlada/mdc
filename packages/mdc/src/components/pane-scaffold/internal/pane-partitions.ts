/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { IPaneScaffoldDirective, IPaneScaffoldExcludedBounds, PaneScaffoldRole, PaneScaffoldPattern } from '../pane-scaffold.interface'
import { preferredWeights, resolveWidths, type PanePreferredLengths } from './pane-state'

export interface PaneRange {
    start: number
    end: number
}

export const transposePaneBounds = ({ left, right, top, bottom }: IPaneScaffoldExcludedBounds): IPaneScaffoldExcludedBounds => ({
    left: top, right: bottom, top: left, bottom: right,
})

export const validatePaneBounds = ({ left, right, top, bottom }: IPaneScaffoldExcludedBounds): void => {
    if (![left, right, top, bottom].every(Number.isFinite) || right < left || bottom < top) {
        throw new Error('Invalid pane exclusion bounds')
    }
}

export const resolvePanePartitions = (width: number, height: number, spacer: number) =>
    (bounds: NonNullable<IPaneScaffoldDirective['excludedBounds']>): PaneRange[] | undefined => {
        const blocked: PaneRange[] = []
        for (const rect of bounds) {
            validatePaneBounds(rect)
            const { left, right, top, bottom } = rect
            if (height <= 0 || width <= 0 || bottom <= 0 || top >= height || right <= 0 || left >= width) continue
            const start = Math.max(0, left)
            const internal = left > 0 && right < width
            blocked.push({ start, end: Math.min(width, internal ? Math.max(right, left + spacer) : right) })
        }
        if (!blocked.length) return undefined

        const available: PaneRange[] = []
        let start = 0
        for (const range of blocked.sort((first, second) => first.start - second.start)) {
            if (range.start > start) available.push({ start, end: range.start })
            start = Math.max(start, range.end)
        }
        if (start < width) available.push({ start, end: width })
        return available
    }

export const partitionTracks = (
    width: number, spacer: number, preferred: number, minimumWidth: number, pattern: PaneScaffoldPattern,
    overrides: PanePreferredLengths,
    ) => (partitions: readonly PaneRange[], panes: readonly PaneScaffoldRole[]): number[] => {
    if (!partitions.length || !panes.length) return []
    const counts = partitions.slice(0, panes.length).map(() => 1)
    const largest = counts.reduce((best, _, index) =>
        partitions[index].end - partitions[index].start >= partitions[best].end - partitions[best].start ? index : best, 0)
    counts[largest] += panes.length - counts.length

    const tracks: number[] = []
    let cursor = 0
    let firstPane = 0
    counts.forEach((count, index) => {
        const { start, end } = partitions[index]
        const length = end - start
        const gap = count === 1 ? 0 : Math.min(spacer, length / count)
        const available = length - gap * (count - 1)
        const roles = panes.slice(firstPane, firstPane + count)
        const weights = preferredWeights(pattern, available, preferred, overrides)(roles)
        const widths = resolveWidths(available, Math.min(minimumWidth, available / count))(weights)
        tracks.push(start - cursor, widths[0])
        for (const paneWidth of widths.slice(1)) tracks.push(gap, paneWidth)
        cursor = end
        firstPane += count
    })
    tracks.push(width - cursor)
    return tracks
}

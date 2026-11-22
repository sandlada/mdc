/**
 * @license
 * Copyright 2024 The Android Open Source Project
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: Apache-2.0
 */
import type { PaneScaffoldRole } from '../pane-scaffold.interface'
import type { PaneRectangle } from './pane-motion'

export interface PanePresenceMotion {
    readonly phase: 'enter' | 'exit'
    readonly direction: 'start' | 'center' | 'end'
    readonly delayed?: boolean
}

// Adapted from the AndroidX PaneMotion calculation, expressed in inline order.
export const resolvePanePresenceMotions = (order: readonly PaneScaffoldRole[]) =>
    (previous: readonly PaneScaffoldRole[], next: readonly PaneScaffoldRole[]) => {
        const retained = order.filter(role => previous.includes(role) && next.includes(role)).map(role => order.indexOf(role))
        const entering = order.filter(role => !previous.includes(role) && next.includes(role)).map(role => order.indexOf(role))
        const exiting = order.filter(role => previous.includes(role) && !next.includes(role)).map(role => order.indexOf(role))
        const motions = new Map<PaneScaffoldRole, PanePresenceMotion>()
        const exitStart: number[] = []
        const exitEnd: number[] = []
        for (const index of exiting) {
            const retainedBefore = retained.some(i => i < index)
            const retainedAfter = retained.some(i => i > index)
            const enteringBefore = entering.some(i => i < index)
            const enteringAfter = entering.some(i => i > index)
            let direction: PanePresenceMotion['direction'] = 'center'
            if (!retainedAfter && !enteringAfter) direction = 'end'
            else if (!retainedBefore && !enteringBefore) direction = 'start'
            else if (!retainedAfter) direction = 'end'
            else if (!retainedBefore) direction = 'start'
            if (direction === 'start') exitStart.push(index)
            if (direction === 'end') exitEnd.push(index)
            motions.set(order[index], { phase: 'exit', direction })
        }
        for (const index of entering) {
            const canEnterFromEnd = !retained.some(i => i > index) && !exitStart.some(i => i > index)
            const canEnterFromStart = !retained.some(i => i < index) && !exitEnd.some(i => i < index)
            let direction: PanePresenceMotion['direction'] = 'center'
            let delayed = false
            if (canEnterFromEnd && !exitEnd.length) direction = 'end'
            else if (canEnterFromStart && !exitStart.length) direction = 'start'
            else if (canEnterFromEnd || canEnterFromStart) {
                direction = canEnterFromEnd ? 'end' : 'start'
                delayed = true
            }
            motions.set(order[index], { phase: 'enter', direction, delayed })
        }
        return motions
    }

export const panePresenceOffset = (
    width: number, rtl: boolean, order: readonly PaneScaffoldRole[],
    motions: ReadonlyMap<PaneScaffoldRole, PanePresenceMotion>,
    previous: ReadonlyMap<PaneScaffoldRole, PaneRectangle>, next: ReadonlyMap<PaneScaffoldRole, PaneRectangle>,
) => (role: PaneScaffoldRole): number => {
    const motion = motions.get(role)
    if (!motion) return 0
    const from = motion.phase === 'enter' ? next : previous
    const to = motion.phase === 'enter' ? previous : next
    const inlineStart = (rect: PaneRectangle) => rtl ? width - rect.left - rect.width : rect.left
    const inlineEnd = (rect: PaneRectangle) => inlineStart(rect) + rect.width
    const rect = from.get(role)
    if (!rect) return 0
    const sign = rtl ? -1 : 1
    if (motion.direction === 'center') {
        const previousRole = order.slice(0, order.indexOf(role)).findLast(candidate => to.has(candidate))
        const previousRect = previousRole && to.get(previousRole)
        return sign * ((previousRect ? inlineEnd(previousRect) : 0) - inlineStart(rect))
    }
    const group = order.filter(candidate => {
        const candidateMotion = motions.get(candidate)
        return from.has(candidate) && candidateMotion?.direction === motion.direction && candidateMotion.phase === motion.phase
    })
    const towardStart = motion.direction === 'start'
    const edgeRole = towardStart ? group.at(-1)! : group[0]
    const edgeIndex = order.indexOf(edgeRole)
    const edge = from.get(edgeRole)!
    const nextRole = towardStart ? order.slice(edgeIndex + 1).find(candidate => from.has(candidate))
        : order.slice(0, edgeIndex).findLast(candidate => from.has(candidate))
    const neighboring = nextRole && from.get(nextRole)
    return sign * (towardStart
        ? -(neighboring ? inlineStart(neighboring) : inlineEnd(edge))
        : width - (neighboring ? inlineEnd(neighboring) : inlineStart(edge)))
}

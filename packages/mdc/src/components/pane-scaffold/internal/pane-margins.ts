/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { IPaneScaffoldMargins } from '../pane-scaffold.interface'
import type { PaneRectangle } from './pane-motion'

export const resolvePaneMargins = (
    width: number, height: number, rtl: boolean, fixed?: IPaneScaffoldMargins, insets?: IPaneScaffoldMargins,
) => (rect: PaneRectangle) => {
    const edge = (side: keyof IPaneScaffoldMargins): number => {
        const requested = [fixed?.[side] ?? 0, insets?.[side] ?? 0]
        if (!requested.every(value => Number.isFinite(value) && value >= 0)) {
            throw new Error('Pane margins and insets must be non-negative finite lengths')
        }
        return Math.max(...requested)
    }
    const start = rtl ? width - rect.left - rect.width : rect.left
    const inlineStart = Math.min(rect.width, Math.max(0, edge('inlineStart') - start))
    const inlineEnd = Math.min(rect.width - inlineStart, Math.max(0, edge('inlineEnd') - (width - start - rect.width)))
    const blockStart = Math.min(rect.height, Math.max(0, edge('blockStart') - rect.top))
    const blockEnd = Math.min(rect.height - blockStart, Math.max(0, edge('blockEnd') - (height - rect.top - rect.height)))
    const box = {
        left: rect.left + (rtl ? inlineEnd : inlineStart),
        top: rect.top + blockStart,
        width: rect.width - inlineStart - inlineEnd,
        height: rect.height - blockStart - blockEnd,
    }
    return { box, inlineStart, inlineEnd, blockStart, blockEnd }
}

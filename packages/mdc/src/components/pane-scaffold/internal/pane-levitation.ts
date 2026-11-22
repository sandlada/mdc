/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import {
    PaneScaffoldDockedEdge, type IPaneScaffoldLevitateStrategy, type IPaneScaffoldLevitationResize,
    type IPaneScaffoldSavedFloatingSize,
} from '../pane-scaffold.interface'

export type LevitationSize = IPaneScaffoldSavedFloatingSize

export const nextLevitationSize = (state: LevitationSize): LevitationSize => ({
    ...state,
    mode: state.mode === 'partial' ? 'expanded' : state.mode === 'expanded' ? 'collapsed' : 'partial',
})

export const resolveLevitationResize = (width: number, height: number, preferredWidth: number, preferredHeight: number) =>
    (config: IPaneScaffoldLevitationResize, state: LevitationSize) => {
        const { dockedEdge, minSize = 48, maxSize } = config
        if (!Object.values(PaneScaffoldDockedEdge).includes(dockedEdge) || !Number.isFinite(minSize) || minSize < 0
            || (maxSize !== undefined && (!Number.isFinite(maxSize) || maxSize < minSize))) {
            throw new Error('Invalid floating pane resize bounds')
        }
        const inline = dockedEdge.startsWith('inline-')
        const available = inline ? width : height
        const max = Math.min(available, maxSize ?? available)
        const min = Math.min(max, minSize)
        const partial = state.partial ?? (inline ? preferredWidth : preferredHeight)
        const value = state.mode === 'expanded' ? max : state.mode === 'collapsed' ? min : Math.max(min, Math.min(max, partial))
        return { inline, min, max, value, dockedEdge }
    }

export const levitationAlignment = (strategy: IPaneScaffoldLevitateStrategy) => {
    const alignment = strategy.alignment ?? 'center'
    const docked = strategy.resize?.dockedEdge
    if (!docked) return alignment
    const logical = alignment === 'center' ? 'block-center-inline-center' : alignment
    return docked.startsWith('inline-') ? logical.replace(/inline-\w+$/, docked) : logical.replace(/^block-\w+/, docked)
}

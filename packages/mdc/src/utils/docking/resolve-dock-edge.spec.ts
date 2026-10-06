/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { resolveDockEdgeOfSide, resolveDockSideOfEdge } from './resolve-dock-edge'

describe('resolveDockSideOfEdge', () => {
    it('maps start/end to left/right under ltr', () => {
        const sideOf = resolveDockSideOfEdge('ltr')
        expect(sideOf('start')).toBe('left')
        expect(sideOf('end')).toBe('right')
    })

    it('maps start/end to right/left under rtl', () => {
        const sideOf = resolveDockSideOfEdge('rtl')
        expect(sideOf('start')).toBe('right')
        expect(sideOf('end')).toBe('left')
    })
})

describe('resolveDockEdgeOfSide', () => {
    it('maps left/right to start/end under ltr', () => {
        const edgeOf = resolveDockEdgeOfSide('ltr')
        expect(edgeOf('left')).toBe('start')
        expect(edgeOf('right')).toBe('end')
    })

    it('maps left/right to end/start under rtl', () => {
        const edgeOf = resolveDockEdgeOfSide('rtl')
        expect(edgeOf('left')).toBe('end')
        expect(edgeOf('right')).toBe('start')
    })

    it('round-trips both directions', () => {
        for (const dir of ['ltr', 'rtl'] as const) {
            const sideOf = resolveDockSideOfEdge(dir)
            const edgeOf = resolveDockEdgeOfSide(dir)
            expect(edgeOf(sideOf('start'))).toBe('start')
            expect(edgeOf(sideOf('end'))).toBe('end')
            expect(sideOf(edgeOf('left'))).toBe('left')
            expect(sideOf(edgeOf('right'))).toBe('right')
        }
    })
})

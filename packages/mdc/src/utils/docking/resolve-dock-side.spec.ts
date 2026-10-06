/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { resolveDockSide } from './resolve-dock-side'

describe('resolveDockSide', () => {
    const dock = resolveDockSide(1000)

    it('docks left when the sheet center sits in the left half', () => {
        expect(dock(0)).toBe('left')
        expect(dock(499)).toBe('left')
    })

    it('docks right when the sheet center sits in the right half', () => {
        expect(dock(501)).toBe('right')
        expect(dock(1000)).toBe('right')
    })

    it('keeps the right dock when the center sits exactly on the midline', () => {
        // Spec: the flip fires only on strict crossing; touching the
        // midline from the right does not relocate.
        expect(dock(500)).toBe('right')
    })
})

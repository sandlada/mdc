/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { MDCScaffold } from './scaffold'

describe('MDCScaffold', () => {
    it('initializes with default properties', () => {
        const el = new MDCScaffold()
        expect(el.railLayout).toBe('full-height')
        expect(el.fabPosition).toBe('bottom-end')
        expect(el.scrollMode).toBe('body')
        expect(el.layoutMode).toBe('auto')
        expect(el.avoidSafeArea).toBe(false)
        expect(el.hasAppbar).toBe(false)
        expect(el.hasRail).toBe(false)
        expect(el.hasDrawer).toBe(false)
        expect(el.hasEndRail).toBe(false)
        expect(el.hasEndDrawer).toBe(false)
        expect(el.hasBottomBar).toBe(false)
        expect(el.hasBottomSheet).toBe(false)
        expect(el.hasFab).toBe(false)
    })

    it('allows updating properties', () => {
        const el = new MDCScaffold()
        el.railLayout = 'below-appbar'
        el.fabPosition = 'bottom-center'
        el.scrollMode = 'window'
        el.layoutMode = 'compact'
        el.avoidSafeArea = true
        expect(el.railLayout).toBe('below-appbar')
        expect(el.fabPosition).toBe('bottom-center')
        expect(el.scrollMode).toBe('window')
        expect(el.layoutMode).toBe('compact')
        expect(el.avoidSafeArea).toBe(true)
    })
})
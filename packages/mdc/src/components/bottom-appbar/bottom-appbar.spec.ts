/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ElevationLevel } from '@sandlada/mdk'
import { describe, expect, it } from 'vitest'
import { MDCBottomAppBar } from './bottom-appbar'
import { BottomAppBarDefinition } from './bottom-appbar.definition'

describe('MDCBottomAppBar', () => {
    it('initializes with default MD3 properties', () => {
        const el = new MDCBottomAppBar()
        expect(el.scrollBehavior).toBe('pinned')
        expect(el.collapsed).toBe(false)
        expect(el.scrollTarget).toBeNull()
        expect(el.label).toBe('Bottom app bar')
    })

    it('supports show() and hide()', () => {
        const el = new MDCBottomAppBar()
        el.hide()
        expect(el.collapsed).toBe(true)
        el.show()
        expect(el.collapsed).toBe(false)
    })

    it('uses 80px container height and Level2 elevation in definition', () => {
        const tokens = (BottomAppBarDefinition as unknown as { tokens: Record<string, unknown> }).tokens
        expect(tokens['enabled-container-height']).toBe('80px')
        expect(tokens['enabled-container-elevation']).toBe(ElevationLevel.Level2)
    })
})

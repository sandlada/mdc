/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { MDCDockedToolbar } from './DockedToolbar'
import { MDCDockedToolbarAction } from './docked-toolbar-action'

describe('MDCDockedToolbar', () => {
    it('initializes with default properties', () => {
        const el = new MDCDockedToolbar()
        expect(el.type).toBe('standard')
    })

    it('allows updating properties', () => {
        const el = new MDCDockedToolbar()
        el.type = 'vibrant'
        expect(el.type).toBe('vibrant')
    })
})

describe('MDCDockedToolbarAction', () => {
    it('initializes with default properties', () => {
        const el = new MDCDockedToolbarAction()
        expect(el.type).toBe('standard')
    })

    it('allows updating properties', () => {
        const el = new MDCDockedToolbarAction()
        el.type = 'vibrant'
        expect(el.type).toBe('vibrant')
    })
})
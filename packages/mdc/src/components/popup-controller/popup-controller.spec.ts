/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { MDCPopupController } from './popup-controller'

describe('MDCPopupController', () => {
    it('initializes with default properties', () => {
        const el = new MDCPopupController()
        expect(el.open).toBe(false)
        expect(el.quick).toBe(false)
        expect(el.placement).toBe('bottom-start')
        expect(el.disableFlip).toBe(false)
        expect(el.customAnimations).toBeUndefined()
    })

    it('allows updating properties', () => {
        const el = new MDCPopupController()
        el.open = true
        el.quick = true
        el.placement = 'top-end'
        el.disableFlip = true
        expect(el.open).toBe(true)
        expect(el.quick).toBe(true)
        expect(el.placement).toBe('top-end')
        expect(el.disableFlip).toBe(true)
    })
})
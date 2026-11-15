/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { MDCTooltipBox } from './tooltip-box'

describe('MDCTooltipBox', () => {
    it('instantiates with defaults', () => {
        const box = new MDCTooltipBox()
        expect(box.placement).toBe('bottom')
        expect(box.offset).toBe(8)
        expect(box.showDelay).toBe(400)
        expect(box.hideDelay).toBe(0)
        expect(box.trigger).toBe('hover')
        expect(box.open).toBe(false)
        expect(box.disableFlip).toBe(false)
        expect(box.quick).toBe(false)
    })

    it('allows updating properties', () => {
        const box = new MDCTooltipBox()
        box.placement = 'top'
        box.offset = 12
        box.showDelay = 200
        box.hideDelay = 100
        box.trigger = 'manual'
        box.open = true
        box.disableFlip = true
        box.quick = true
        expect(box.placement).toBe('top')
        expect(box.offset).toBe(12)
        expect(box.showDelay).toBe(200)
        expect(box.hideDelay).toBe(100)
        expect(box.trigger).toBe('manual')
        expect(box.open).toBe(true)
        expect(box.disableFlip).toBe(true)
        expect(box.quick).toBe(true)
    })
})
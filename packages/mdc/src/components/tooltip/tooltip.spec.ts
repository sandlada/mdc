/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { MDCTooltip } from './tooltip'

describe('MDCTooltip', () => {
    it('instantiates with defaults', () => {
        const tooltip = new MDCTooltip()
        expect(tooltip.position).toBe('top')
        expect(tooltip.open).toBe(false)
        expect(tooltip.rich).toBe(false)
        expect(tooltip.plain).toBe(false)
        expect(tooltip.hasContent).toBe(false)
        expect(tooltip.hasActions).toBe(false)
    })

    it('allows updating properties', () => {
        const tooltip = new MDCTooltip()
        tooltip.position = 'bottom'
        tooltip.open = true
        tooltip.rich = true
        tooltip.plain = true
        expect(tooltip.position).toBe('bottom')
        expect(tooltip.open).toBe(true)
        expect(tooltip.rich).toBe(true)
        expect(tooltip.plain).toBe(true)
    })
})
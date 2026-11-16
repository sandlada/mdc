/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { MDCLegacySlider } from './legacy-slider'
import { BaseSlider } from './internal/base-slider'

describe('MDCLegacySlider', () => {
    it('instantiates with defaults', () => {
        const slider = new MDCLegacySlider()
        expect(slider.min).toBe(0)
        expect(slider.max).toBe(100)
        expect(slider.value).toBeUndefined()
        expect(slider.valueStart).toBeUndefined()
        expect(slider.valueEnd).toBeUndefined()
        expect(slider.valueLabel).toBe('')
        expect(slider.valueLabelStart).toBe('')
        expect(slider.valueLabelEnd).toBe('')
        expect(slider.ariaLabelStart).toBe('')
        expect(slider.ariaValueTextStart).toBe('')
        expect(slider.ariaLabelEnd).toBe('')
        expect(slider.ariaValueTextEnd).toBe('')
        expect(slider.step).toBe(1)
        expect(slider.ticks).toBe(false)
        expect(slider.labeled).toBe(false)
        expect(slider.range).toBe(false)
        expect(slider.disabled).toBe(false)
        expect(slider.name).toBe('')
    })

    it('exposes an input root in render output', () => {
        const slider = new MDCLegacySlider()
        const rendered = (slider as unknown as { render(): { strings: unknown } }).render()
        const html = Array.from(rendered.strings as string[]).join('')
        expect(html).toContain('<div')
    })
})

describe('BaseSlider', () => {
    it('instantiates with defaults', () => {
        const slider = new BaseSlider()
        expect(slider.min).toBe(0)
        expect(slider.max).toBe(100)
        expect(slider.value).toBeUndefined()
        expect(slider.step).toBe(1)
        expect(slider.ticks).toBe(false)
        expect(slider.labeled).toBe(false)
        expect(slider.range).toBe(false)
        expect(slider.disabled).toBe(false)
        expect(slider.name).toBe('')
    })
})
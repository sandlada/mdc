/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { SliderValidator } from './slider-validator'

const Base = { min: 0, max: 100, step: 1, range: false as boolean }

describe('SliderValidator', () => {
    it('in-range single value is valid', () => {
        const v = new SliderValidator(() => ({ ...Base, value: 50 }))
        expect(v.getValidity().validity.rangeOverflow).toBe(false)
        expect(v.getValidity().validity.rangeUnderflow).toBe(false)
        expect(v.getValidity().validity.stepMismatch).toBe(false)
    })

    it('undefined value falls back to min and is valid', () => {
        const v = new SliderValidator(() => ({ ...Base }))
        expect(v.getValidity().validity.valueMissing).toBe(false)
    })

    it('range mode validates both ends', () => {
        const v = new SliderValidator(() => ({ ...Base, range: true, valueStart: 10, valueEnd: 90 }))
        const flags = v.getValidity().validity
        expect(flags.rangeOverflow).toBe(false)
        expect(flags.rangeUnderflow).toBe(false)
    })

    it('recomputes when min/max/step change', () => {
        const state = { ...Base, value: 50 }
        const v = new SliderValidator(() => state)
        const first = v.getValidity()
        state.max = 200
        expect(v.getValidity()).not.toBe(first)
    })

    it('caches identical state', () => {
        const v = new SliderValidator(() => ({ ...Base, value: 1 }))
        expect(v.getValidity()).toBe(v.getValidity())
    })

    it('returns all ten flags as plain booleans', () => {
        const v = new SliderValidator(() => ({ ...Base, value: 1 }))
        const flags = v.getValidity().validity
        expect(Object.keys(flags)).toHaveLength(10)
        for (const value of Object.values(flags)) expect(typeof value).toBe('boolean')
    })
})

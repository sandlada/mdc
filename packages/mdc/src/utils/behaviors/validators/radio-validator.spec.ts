/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { RadioValidator, type RadioGroupState } from './radio-validator'

const Missing = (states: RadioGroupState) =>
    new RadioValidator(() => states).getValidity().validity.valueMissing

describe('RadioValidator', () => {
    it('single required unchecked radio is valueMissing', () => {
        expect(Missing([{ checked: false, required: true }])).toBe(true)
    })

    it('required group with one checked sibling is valid', () => {
        expect(
            Missing([
                { checked: false, required: true },
                { checked: true, required: false },
            ]),
        ).toBe(false)
    })

    it('required on any sibling makes the whole group required', () => {
        expect(
            Missing([
                { checked: false, required: false },
                { checked: false, required: true },
            ]),
        ).toBe(true)
    })

    it('no required radios is always valid', () => {
        expect(
            Missing([
                { checked: false, required: false },
                { checked: false, required: false },
            ]),
        ).toBe(false)
    })

    it('recomputes when the group changes length or membership', () => {
        let group: RadioGroupState = [{ checked: false, required: true }]
        const v = new RadioValidator(() => group)
        expect(v.getValidity().validity.valueMissing).toBe(true)
        group = [
            { checked: false, required: true },
            { checked: true, required: true },
        ]
        expect(v.getValidity().validity.valueMissing).toBe(false)
    })

    it('uses the cache for an equal group snapshot', () => {
        const v = new RadioValidator(() => [{ checked: false, required: true }])
        expect(v.getValidity()).toBe(v.getValidity())
    })
})

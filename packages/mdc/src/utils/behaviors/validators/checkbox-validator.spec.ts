/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { CheckboxValidator } from './checkbox-validator'

describe('CheckboxValidator', () => {
    it('is valueMissing when required and unchecked', () => {
        const v = new CheckboxValidator(() => ({ checked: false, required: true }))
        expect(v.getValidity().validity.valueMissing).toBe(true)
    })

    it('is valid when required and checked', () => {
        const v = new CheckboxValidator(() => ({ checked: true, required: true }))
        expect(v.getValidity().validity.valueMissing).toBe(false)
    })

    it('is valid when not required, regardless of checked', () => {
        for (const checked of [true, false]) {
            const v = new CheckboxValidator(() => ({ checked, required: false }))
            expect(v.getValidity().validity.valueMissing).toBe(false)
        }
    })

    it('re-evaluates when checked flips', () => {
        const state = { checked: false, required: true }
        const v = new CheckboxValidator(() => state)
        expect(v.getValidity().validity.valueMissing).toBe(true)
        state.checked = true
        expect(v.getValidity().validity.valueMissing).toBe(false)
    })
})

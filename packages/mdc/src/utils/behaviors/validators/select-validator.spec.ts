/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { SelectValidator } from './select-validator'

describe('SelectValidator', () => {
    it('required with empty value is valueMissing', () => {
        const v = new SelectValidator(() => ({ value: '', required: true }))
        expect(v.getValidity().validity.valueMissing).toBe(true)
    })

    it('required with a value is valid', () => {
        const v = new SelectValidator(() => ({ value: 'a', required: true }))
        expect(v.getValidity().validity.valueMissing).toBe(false)
    })

    it('not required with empty value is valid', () => {
        const v = new SelectValidator(() => ({ value: '', required: false }))
        expect(v.getValidity().validity.valueMissing).toBe(false)
    })

    it('recomputes on value change', () => {
        const state = { value: '', required: true }
        const v = new SelectValidator(() => state)
        expect(v.getValidity().validity.valueMissing).toBe(true)
        state.value = 'x'
        expect(v.getValidity().validity.valueMissing).toBe(false)
    })
})

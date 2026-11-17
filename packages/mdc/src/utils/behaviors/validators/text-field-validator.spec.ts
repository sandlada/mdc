/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { TextFieldValidator, type InputState, type TextAreaState } from './text-field-validator'

const Input = (over: Partial<InputState> = {}): InputState => ({
    type: 'text',
    value: '',
    required: false,
    minLength: -1,
    maxLength: -1,
    pattern: '',
    min: '',
    max: '',
    step: '',
    ...over,
})

const Area = (over: Partial<TextAreaState> = {}): TextAreaState => ({
    type: 'textarea',
    value: '',
    required: false,
    minLength: -1,
    maxLength: -1,
    ...over,
})

const Validity = (state: InputState | TextAreaState) =>
    new TextFieldValidator(() => ({ state, renderedControl: null })).getValidity().validity

describe('TextFieldValidator (input)', () => {
    it('empty non-required is valid', () => {
        expect(Validity(Input()).valueMissing).toBe(false)
    })

    it('required + empty is valueMissing', () => {
        expect(Validity(Input({ required: true })).valueMissing).toBe(true)
    })

    it('required + value is valid', () => {
        expect(Validity(Input({ required: true, value: 'a' })).valueMissing).toBe(false)
    })

    it('pattern mismatch / match', () => {
        expect(Validity(Input({ pattern: '[0-9]+', value: 'abc' })).patternMismatch).toBe(true)
        expect(Validity(Input({ pattern: '[0-9]+', value: '123' })).patternMismatch).toBe(false)
    })

    it('empty pattern imposes no constraint', () => {
        expect(Validity(Input({ pattern: '', value: 'abc' })).patternMismatch).toBe(false)
    })

    it('email type mismatch', () => {
        expect(Validity(Input({ type: 'email', value: 'nope' })).typeMismatch).toBe(true)
        expect(Validity(Input({ type: 'email', value: 'a@b.co' })).typeMismatch).toBe(false)
    })

    it('url type mismatch', () => {
        expect(Validity(Input({ type: 'url', value: 'nope' })).typeMismatch).toBe(true)
        expect(Validity(Input({ type: 'url', value: 'https://a.co' })).typeMismatch).toBe(false)
    })

    it('number range overflow / underflow', () => {
        expect(Validity(Input({ type: 'number', min: '1', max: '5', value: '9' })).rangeOverflow).toBe(true)
        expect(Validity(Input({ type: 'number', min: '1', max: '5', value: '0' })).rangeUnderflow).toBe(true)
        const ok = Validity(Input({ type: 'number', min: '1', max: '5', value: '3' }))
        expect(ok.rangeOverflow).toBe(false)
        expect(ok.rangeUnderflow).toBe(false)
    })

    it('number step mismatch', () => {
        expect(Validity(Input({ type: 'number', min: '0', step: '2', value: '3' })).stepMismatch).toBe(true)
        expect(Validity(Input({ type: 'number', min: '0', step: '2', value: '4' })).stepMismatch).toBe(false)
    })

    it('does not leak constraints when state is re-used (attributes removed)', () => {
        let state = Input({ pattern: '[0-9]+', value: 'abc' })
        const v = new TextFieldValidator(() => ({ state, renderedControl: null }))
        expect(v.getValidity().validity.patternMismatch).toBe(true)
        state = Input({ pattern: '', value: 'abc' })
        expect(v.getValidity().validity.patternMismatch).toBe(false)
    })

    it('uses a rendered control when provided (tooShort needs dirty control)', () => {
        const control = document.createElement('input')
        const state = Input({ required: true })
        const v = new TextFieldValidator(() => ({ state, renderedControl: control }))
        expect(v.getValidity().validity.valueMissing).toBe(true)
        expect(control.required).toBe(true)
    })

    it('caches while the state is unchanged', () => {
        const state = Input()
        const v = new TextFieldValidator(() => ({ state, renderedControl: null }))
        expect(v.getValidity()).toBe(v.getValidity())
    })

    it('treats null/undefined minLength/maxLength as unset', () => {
        const state = Input({ minLength: null as unknown as number, maxLength: undefined as unknown as number })
        expect(() => Validity(state)).not.toThrow()
    })
})

describe('TextFieldValidator (textarea)', () => {
    it('required + empty is valueMissing', () => {
        expect(Validity(Area({ required: true })).valueMissing).toBe(true)
    })

    it('required + value is valid', () => {
        expect(Validity(Area({ required: true, value: 'x' })).valueMissing).toBe(false)
    })

    it('switching input -> textarea recomputes', () => {
        let state: InputState | TextAreaState = Input({ required: true })
        const v = new TextFieldValidator(() => ({ state, renderedControl: null }))
        expect(v.getValidity().validity.valueMissing).toBe(true)
        state = Area({ required: false })
        expect(v.getValidity().validity.valueMissing).toBe(false)
    })
})

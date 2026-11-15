/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { MDCTextField } from './text-field'

describe('MDCTextField', () => {
    it('instantiates with defaults', () => {
        const field = new MDCTextField()
        expect(field.variant).toBe('filled')
        expect(field.value).toBe('')
        expect(field.type).toBe('text')
        expect(field.label).toBe('')
        expect(field.placeholder).toBe('')
        expect(field.supportingText).toBe('')
        expect(field.errorText).toBe('')
        expect(field.error).toBe(false)
        expect(field.prefixText).toBe('')
        expect(field.suffixText).toBe('')
        expect(field.required).toBe(false)
        expect(field.noAsterisk).toBe(false)
        expect(field.readOnly).toBe(false)
        expect(field.min).toBe('')
        expect(field.max).toBe('')
        expect(field.step).toBe('')
        expect(field.pattern).toBe('')
        expect(field.minLength).toBe(-1)
        expect(field.maxLength).toBe(-1)
        expect(field.autocomplete).toBe('')
        expect(field.autofocus).toBe(false)
        expect(field.inputMode).toBe('')
        expect(field.rows).toBe(2)
        expect(field.cols).toBe(20)
        expect(field.clearable).toBe(false)
        expect(field.counter).toBe(false)
        expect(field.counterText).toBe('')
        expect(field.floatingLabelBehavior).toBe('auto')
        expect(field.alignEnd).toBe(false)
        expect(field.autoValidate).toBe(false)
        expect(field.disabled).toBe(false)
        expect(field.name).toBe('')
    })

    it('participates in form association', () => {
        expect((MDCTextField as unknown as { formAssociated: boolean }).formAssociated).toBe(true)
    })

    it('exposes an input root in render output', () => {
        const field = new MDCTextField()
        const rendered = (field as unknown as { render(): { strings: unknown } }).render()
        const html = Array.from(rendered.strings as string[]).join('')
        expect(html).toContain('<mdc-field')
    })

    it('allows toggling key properties', () => {
        const field = new MDCTextField()
        field.variant = 'outlined'
        field.value = 'hello'
        field.label = 'Name'
        field.required = true
        field.clearable = true
        field.counter = true
        expect(field.variant).toBe('outlined')
        expect(field.value).toBe('hello')
        expect(field.label).toBe('Name')
        expect(field.required).toBe(true)
        expect(field.clearable).toBe(true)
        expect(field.counter).toBe(true)
    })
})
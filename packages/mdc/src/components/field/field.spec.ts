/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { MDCField } from './field'

describe('MDCField', () => {
    it('instantiates with defaults', () => {
        const field = new MDCField()
        expect(field.variant).toBe('filled')
        expect(field.label).toBe('')
        expect(field.supportingText).toBe('')
        expect(field.errorText).toBe('')
        expect(field.prefixText).toBe('')
        expect(field.suffixText).toBe('')
        expect(field.counterText).toBe('')
        expect(field.disabled).toBe(false)
        expect(field.required).toBe(false)
        expect(field.noAsterisk).toBe(false)
        expect(field.populated).toBe(false)
        expect(field.focused).toBe(false)
        expect(field.invalid).toBe(false)
        expect(field.floatingLabelBehavior).toBe('auto')
        expect(field.alignEnd).toBe(false)
        expect(field.multiline).toBe(false)
        expect(field.resizable).toBe(false)
    })

    it('computes shouldLabelFloat from focus and population', () => {
        const field = new MDCField()
        field.label = 'Email'
        expect(field.shouldLabelFloat).toBe(false)
        field.populated = true
        expect(field.shouldLabelFloat).toBe(true)
        field.populated = false
        field.focused = true
        expect(field.shouldLabelFloat).toBe(true)
        field.floatingLabelBehavior = 'always'
        field.focused = false
        expect(field.shouldLabelFloat).toBe(true)
        field.floatingLabelBehavior = 'never'
        expect(field.shouldLabelFloat).toBe(false)
    })

    it('exposes a container root in render output', () => {
        const field = new MDCField()
        const rendered = (field as unknown as { render(): { strings: unknown } }).render()
        const html = Array.from(rendered.strings as string[]).join('')
        expect(html).toContain('<div')
    })

    it('allows toggling key properties', () => {
        const field = new MDCField()
        field.variant = 'outlined'
        field.label = 'Search'
        field.supportingText = 'hint'
        field.disabled = true
        field.populated = true
        field.focused = true
        field.invalid = true
        field.multiline = true
        expect(field.variant).toBe('outlined')
        expect(field.label).toBe('Search')
        expect(field.supportingText).toBe('hint')
        expect(field.disabled).toBe(true)
        expect(field.populated).toBe(true)
        expect(field.focused).toBe(true)
        expect(field.invalid).toBe(true)
        expect(field.multiline).toBe(true)
    })
})
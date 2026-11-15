/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { MDCButton } from './button'
import { MDCTogglableButton } from './toggle-button'

describe('MDCButton', () => {
    it('instantiates with defaults', () => {
        const button = new MDCButton()
        expect(button.variant).toBe('filled')
        expect(button.type).toBe('submit')
        expect(button.disabled).toBe(false)
        expect(button.value).toBe('')
        expect(button.size).toBe('small')
        expect(button.shape).toBe('round')
        expect(button.trailingIcon).toBe(false)
        expect(button.disableMorph).toBe(false)
        expect(MDCButton.formAssociated).toBe(true)
    })

    it('exposes a button root in render output', () => {
        const button = new MDCButton()
        const rendered = (button as unknown as { render(): { strings: unknown } }).render()
        const html = Array.from(rendered.strings as string[]).join('')
        expect(html).toContain('<button')
    })

    it('accepts reset/submit/button types', () => {
        const button = new MDCButton()
        button.type = 'reset'
        expect(button.type).toBe('reset')
        button.type = 'button'
        expect(button.type).toBe('button')
        button.type = 'submit'
        expect(button.type).toBe('submit')
    })
})

describe('MDCTogglableButton', () => {
    it('instantiates with defaults', () => {
        const button = new MDCTogglableButton()
        expect(button.type).toBe('checkbox')
        expect(button.value).toBe('on')
        expect(button.required).toBe(false)
        expect(button.variant).toBe('filled')
        expect(button.checked).toBe(false)
        expect(button.size).toBe('small')
        expect(button.shape).toBe('round')
    })

    it('switches type between checkbox and radio', () => {
        const button = new MDCTogglableButton()
        button.type = 'radio'
        expect(button.type).toBe('radio')
        button.type = 'checkbox'
        expect(button.type).toBe('checkbox')
    })
})

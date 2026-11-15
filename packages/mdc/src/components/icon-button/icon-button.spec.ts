/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { MDCIconButton } from './icon-button'
import { MDCToggleIconButton } from './toggle-icon-button'

describe('MDCIconButton', () => {
    it('instantiates with defaults', () => {
        const button = new MDCIconButton()
        expect(button.variant).toBe('standard')
        expect(button.size).toBe('small')
        expect(button.width).toBe('default')
        expect(button.shape).toBe('round')
        expect(button.disableMorph).toBe(false)
        expect(button.type).toBe('submit')
        expect(button.value).toBe('')
        expect(button.disabled).toBe(false)
        expect(MDCIconButton.formAssociated).toBe(true)
    })

    it('exposes a button root in render output', () => {
        const button = new MDCIconButton()
        const rendered = (button as unknown as { render(): { strings: unknown } }).render()
        const html = Array.from(rendered.strings as string[]).join('')
        expect(html).toContain('<button')
    })
})

describe('MDCToggleIconButton', () => {
    it('instantiates with defaults', () => {
        const button = new MDCToggleIconButton()
        expect(button.variant).toBe('standard')
        expect(button.size).toBe('small')
        expect(button.width).toBe('default')
        expect(button.shape).toBe('round')
        expect(button.disableMorph).toBe(false)
        expect(button.type).toBe('checkbox')
        expect(button.checked).toBe(false)
        expect(button.value).toBe('on')
        expect(button.required).toBe(false)
        expect(button.disabled).toBe(false)
    })

    it('exposes a button root in render output', () => {
        const button = new MDCToggleIconButton()
        const rendered = (button as unknown as { render(): { strings: unknown } }).render()
        const html = Array.from(rendered.strings as string[]).join('')
        expect(html).toContain('<button')
    })
})
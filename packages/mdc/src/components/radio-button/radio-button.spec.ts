/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { RadioButton } from './radio-button'

describe('RadioButton', () => {
    it('instantiates with defaults', () => {
        const radio = new RadioButton()
        expect(radio.checked).toBe(false)
        expect(radio.required).toBe(false)
        expect(radio.value).toBe('on')
        expect(radio.disabled).toBe(false)
        expect(radio.name).toBe('')
        expect(radio.type).toBe('radio')
    })

    it('renders a non-interactive touch target', () => {
        const radio = new RadioButton()
        const rendered = (radio as unknown as { render(): { strings: unknown } }).render()
        const html = Array.from(rendered.strings as string[]).join('')
        expect(html).toContain('class="touch-target"')
        expect(html).not.toContain('<input')
    })
})

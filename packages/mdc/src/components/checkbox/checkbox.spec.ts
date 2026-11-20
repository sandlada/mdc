/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { MDCCheckbox } from './checkbox'
import { CheckboxStyles } from './checkbox.style'

describe('MDCCheckbox', () => {
    it('instantiates with defaults', () => {
        const checkbox = new MDCCheckbox()
        expect(checkbox.checked).toBe(false)
        expect(checkbox.indeterminate).toBe(false)
        expect(checkbox.tristate).toBe(false)
        expect(checkbox.required).toBe(false)
        expect(checkbox.value).toBe('on')
        expect(checkbox.disabled).toBe(false)
        expect(checkbox.name).toBe('')
    })

    it('exposes an input root in render output', () => {
        const checkbox = new MDCCheckbox()
        const rendered = (checkbox as unknown as { render(): { strings: unknown } }).render()
        const html = Array.from(rendered.strings as string[]).join('')
        expect(html).toContain('<div')
    })

    it('delays exit opacity fade-out until scale shrink is underway and resets delay on enter', () => {
        const cssText = CheckboxStyles.cssText
        expect(cssText).toContain('transition-delay: 0ms, 100ms;')
        expect(cssText).toContain('transition-duration: 150ms, 50ms;')
        expect(cssText).toContain('transition-delay: 0ms;')
        expect(cssText).toContain('transition-duration: 350ms, 50ms;')
        expect(cssText).toContain('@media (prefers-reduced-motion: reduce)')
    })
})
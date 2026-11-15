/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { SplitButton } from './split-button'

describe('SplitButton', () => {
    it('instantiates with defaults', () => {
        const button = new SplitButton()
        expect(button.variant).toBe('filled')
        expect(button.size).toBe('small')
        expect(button.disabled).toBe(false)
        expect(button.leadingDisabled).toBe(false)
        expect(button.trailingDisabled).toBe(false)
        expect(button.expanded).toBe(false)
        expect(button.disableMorph).toBe(false)
        expect(button.disableRipple).toBe(false)
        expect(button.disableElevation).toBe(false)
        expect(button.disableFocusRing).toBe(false)
        expect(button.trailingAriaLabel).toBe(null)
    })

    it('exposes a container in render output', () => {
        const button = new SplitButton()
        const rendered = (button as unknown as { render(): { strings: unknown } }).render()
        const html = Array.from(rendered.strings as string[]).join('')
        expect(html).toContain('<div')
    })
})
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { SegmentedButton } from './segmented-button'
import { SegmentedButtonSet } from './segmented-button-set'

describe('SegmentedButton', () => {
    it('instantiates with defaults', () => {
        const button = new SegmentedButton()
        expect(button.selected).toBe(false)
        expect(button.disabled).toBe(false)
        expect(button.noCheckmark).toBe(false)
        expect(button.hasIcon).toBe(false)
        expect(button.hasLabel).toBe(false)
    })

    it('exposes a button root in render output', () => {
        const button = new SegmentedButton()
        const rendered = (button as unknown as { render(): { strings: unknown } }).render()
        const html = Array.from(rendered.strings as string[]).join('')
        expect(html).toContain('<button')
    })
})

describe('SegmentedButtonSet', () => {
    it('instantiates with defaults', () => {
        const set = new SegmentedButtonSet()
        expect(set.multiselect).toBe(false)
    })

    it('exposes a group role in render output', () => {
        const set = new SegmentedButtonSet()
        const rendered = (set as unknown as { render(): { strings: unknown } }).render()
        const html = Array.from(rendered.strings as string[]).join('')
        expect(html).toContain('role="group"')
    })
})
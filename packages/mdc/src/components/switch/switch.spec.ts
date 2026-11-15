/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { MDCSwitch } from './switch'

describe('MDCSwitch', () => {
    it('instantiates with defaults', () => {
        const sw = new MDCSwitch()
        expect(sw.selected).toBe(false)
        expect(sw.required).toBe(false)
        expect(sw.value).toBe('on')
        expect(sw.hideSelectedIcon).toBe(false)
        expect(sw.showUnselectedIcon).toBe(false)
        expect(sw.disabled).toBe(false)
        expect(sw.name).toBe('')
    })

    it('exposes an input root in render output', () => {
        const sw = new MDCSwitch()
        const rendered = (sw as unknown as { render(): { strings: unknown } }).render()
        const html = Array.from(rendered.strings as string[]).join('')
        expect(html).toContain('<div')
    })
})
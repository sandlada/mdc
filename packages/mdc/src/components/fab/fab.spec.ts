/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { MDCFab } from './fab'

describe('MDCFab', () => {
    it('instantiates with defaults', () => {
        const fab = new MDCFab()
        expect(fab.variant).toBe('tonal-secondary')
        expect(fab.size).toBe('small')
        expect(fab.extended).toBe(false)
        expect(fab.trailingIcon).toBe(false)
        expect(fab.open).toBe(false)
    })

    it('exposes a button root in render output', () => {
        const fab = new MDCFab()
        const rendered = (fab as unknown as { render(): { strings: unknown } }).render()
        const html = Array.from(rendered.strings as string[]).join('')
        expect(html).toContain('<button')
    })
})
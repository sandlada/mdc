/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { MDCSearchBar } from './search-bar'

describe('MDCSearchBar', () => {
    it('instantiates with defaults', () => {
        const bar = new MDCSearchBar()
        expect(bar.supportingText).toBe('Type here to search')
        expect(bar.hideAvatar).toBe(false)
        expect(bar.value).toBe('')
    })

    it('exposes a search root in render output', () => {
        const bar = new MDCSearchBar()
        const rendered = (bar as unknown as { render(): { strings: unknown } }).render()
        const html = Array.from(rendered.strings as string[]).join('')
        expect(html).toContain('role="search"')
    })

    it('allows toggling key properties', () => {
        const bar = new MDCSearchBar()
        bar.supportingText = 'Find'
        bar.hideAvatar = true
        bar.value = 'query'
        expect(bar.supportingText).toBe('Find')
        expect(bar.hideAvatar).toBe(true)
        expect(bar.value).toBe('query')
    })
})
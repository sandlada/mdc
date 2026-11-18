// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { html } from 'lit'
import { fixture } from '../../utils/testing/fixture'
import './bottom-appbar'
import type { MDCBottomAppBar } from './bottom-appbar'

describe('mdc-bottom-appbar (DOM)', () => {
    it('renders toolbar landmark and tracks actions/fab slots', async () => {
        const el = await fixture<MDCBottomAppBar>(html`
            <mdc-bottom-appbar label="Editor actions">
                <button>Check</button>
                <button slot="fab">Add</button>
            </mdc-bottom-appbar>
        `)
        await el.updateComplete
        const container = el.shadowRoot?.querySelector('.container')
        expect(container?.getAttribute('role')).toBe('toolbar')
        expect(container?.getAttribute('aria-label')).toBe('Editor actions')
        expect(container?.classList.contains('has-actions')).toBe(true)
        expect(container?.classList.contains('has-fab')).toBe(true)
    })

    it('toggles collapsed state on exit-always scrollTarget', async () => {
        let mockScrollTop = 0
        const scroller = document.createElement('div')
        Object.defineProperty(scroller, 'scrollTop', {
            get: () => mockScrollTop,
            configurable: true,
        })

        const el = await fixture<MDCBottomAppBar>(html`
            <mdc-bottom-appbar scroll-behavior="exit-always"></mdc-bottom-appbar>
        `)
        el.scrollTarget = scroller
        await el.updateComplete

        mockScrollTop = 120
        scroller.dispatchEvent(new Event('scroll'))
        await el.updateComplete
        expect(el.collapsed).toBe(true)

        mockScrollTop = 60
        scroller.dispatchEvent(new Event('scroll'))
        await el.updateComplete
        expect(el.collapsed).toBe(false)
    })
})

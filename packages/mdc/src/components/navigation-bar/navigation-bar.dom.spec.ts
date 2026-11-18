// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { html } from 'lit'
import { fixture } from '../../utils/testing/fixture'
import './navigation-bar'
import type { MDCNavigationBar } from './navigation-bar'
import type { INavigationBarVisibilityChangeDetail } from './navigation-bar.interface'

describe('mdc-navigation-bar (DOM)', () => {
    it('toggles collapsed state and is-hidden class on exit-always scrollTarget', async () => {
        let mockScrollTop = 0
        const scroller = document.createElement('div')
        Object.defineProperty(scroller, 'scrollTop', {
            get         : () => mockScrollTop,
            configurable: true,
        })

        const events: boolean[] = []
        const el = await fixture<MDCNavigationBar>(html`
            <mdc-navigation-bar
                scroll-behavior="exit-always"
                @navigation-bar-visibility-change=${(e: CustomEvent<INavigationBarVisibilityChangeDetail>) => {
                    events.push(e.detail.collapsed)
                }}
            ></mdc-navigation-bar>
        `)
        el.scrollTarget = scroller
        await el.updateComplete

        mockScrollTop = 120
        scroller.dispatchEvent(new Event('scroll'))
        await el.updateComplete
        expect(el.collapsed).toBe(true)
        expect(el.shadowRoot?.querySelector('.container')?.classList.contains('is-hidden')).toBe(true)

        mockScrollTop = 60
        scroller.dispatchEvent(new Event('scroll'))
        await el.updateComplete
        expect(el.collapsed).toBe(false)
        expect(el.shadowRoot?.querySelector('.container')?.classList.contains('is-hidden')).toBe(false)
        expect(events).toEqual([false, true, false])
    })
})

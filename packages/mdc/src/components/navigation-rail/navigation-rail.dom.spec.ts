// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { html } from 'lit'
import { fixture } from '../../utils/testing/fixture'
import './navigation-rail'
import type { NavigationRail } from './navigation-rail'
import type { INavigationRailVisibilityChangeDetail } from './navigation-rail.interface'

describe('mdc-navigation-rail (DOM)', () => {
    it('supports showRail(), hideRail(), toggleRail(), and exit-always scrollTarget', async () => {
        let mockScrollTop = 0
        const scroller = document.createElement('div')
        Object.defineProperty(scroller, 'scrollTop', {
            get         : () => mockScrollTop,
            configurable: true,
        })

        const events: boolean[] = []
        const el = await fixture<NavigationRail>(html`
            <mdc-navigation-rail
                scroll-behavior="exit-always"
                @navigation-rail-visibility-change=${(e: CustomEvent<INavigationRailVisibilityChangeDetail>) => {
                    events.push(e.detail.railHidden)
                }}
            ></mdc-navigation-rail>
        `)
        expect(el.railHidden).toBe(false)

        el.hideRail()
        await el.updateComplete
        expect(el.railHidden).toBe(true)
        expect(el.hasAttribute('rail-hidden')).toBe(true)

        el.showRail()
        await el.updateComplete
        expect(el.railHidden).toBe(false)
        expect(el.hasAttribute('rail-hidden')).toBe(false)

        el.toggleRail()
        await el.updateComplete
        expect(el.railHidden).toBe(true)

        el.showRail()
        el.scrollTarget = scroller
        await el.updateComplete

        mockScrollTop = 120
        scroller.dispatchEvent(new Event('scroll'))
        await el.updateComplete
        expect(el.railHidden).toBe(true)

        mockScrollTop = 40
        scroller.dispatchEvent(new Event('scroll'))
        await el.updateComplete
        expect(el.railHidden).toBe(false)
        expect(events).toEqual([false, true, false, true, false, true, false])
    })
})

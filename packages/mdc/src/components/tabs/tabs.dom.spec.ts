// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { html } from 'lit'
import { fixture } from '../../utils/testing/fixture'
import './tabs'
import './tab'
import type { LitElementLike } from '../../utils/testing/fixture'

interface TabsElement extends LitElementLike {
    activeTabIndex: number
}

describe('mdc-tabs (DOM)', () => {
    it('renders child mdc-tab elements and tracks activeTabIndex', async () => {
        const el = await fixture<TabsElement>(html`
            <mdc-tabs>
                <mdc-tab>One</mdc-tab>
                <mdc-tab>Two</mdc-tab>
                <mdc-tab>Three</mdc-tab>
            </mdc-tabs>
        `)

        expect(el.querySelectorAll('mdc-tab').length).toBe(3)
        expect(el.activeTabIndex).toBe(0)

        el.activeTabIndex = 1
        await el.updateComplete
        expect(el.activeTabIndex).toBe(1)
    })
})

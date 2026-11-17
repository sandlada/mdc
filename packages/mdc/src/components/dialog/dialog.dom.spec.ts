// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { html } from 'lit'
import { fixture } from '../../utils/testing/fixture'
import './basic-dialog'
import type { BasicDialog } from './basic-dialog'

describe('mdc-basic-dialog (DOM)', () => {
    it('renders closed by default and opens via open property', async () => {
        const el = await fixture<BasicDialog>(html`
            <mdc-basic-dialog>
                <div slot="headline">Title</div>
                <div slot="content">Body</div>
            </mdc-basic-dialog>
        `)

        expect(el.open).toBe(false)
        el.open = true
        await el.updateComplete
        expect(el.open).toBe(true)
        expect(el.shadowRoot?.querySelector('dialog')).not.toBeNull()
    })

    it('closes when open is set to false', async () => {
        const el = await fixture<BasicDialog>(html`<mdc-basic-dialog open></mdc-basic-dialog>`)
        expect(el.open).toBe(true)

        el.open = false
        await el.updateComplete
        expect(el.open).toBe(false)
    })
})

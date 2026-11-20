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
import './fullscreen-dialog'
import type { BasicDialog } from './basic-dialog'
import type { FullscreenDialog } from './fullscreen-dialog'

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
        const dialog = el.shadowRoot?.querySelector('dialog')
        expect(dialog).not.toBeNull()
        expect(dialog?.getAttribute('aria-labelledby')).toBe('headline')
        expect(dialog?.getAttribute('aria-describedby')).toBe('content')
    })

    it('closes when open is set to false', async () => {
        const el = await fixture<BasicDialog>(html`<mdc-basic-dialog open></mdc-basic-dialog>`)
        expect(el.open).toBe(true)

        el.open = false
        await el.updateComplete
        expect(el.open).toBe(false)
    })

    it('renders elevation and sets alertdialog role when type="alert"', async () => {
        const el = await fixture<BasicDialog>(html`
            <mdc-basic-dialog type="alert">
                <span slot="headline">Alert</span>
                <p slot="content">Message</p>
            </mdc-basic-dialog>
        `)
        const dialog = el.shadowRoot?.querySelector('dialog')
        expect(dialog?.getAttribute('role')).toBe('alertdialog')
        expect(el.shadowRoot?.querySelector('.container > mdc-elevation')).not.toBeNull()
    })

    it('respects dismiss-on-click-outside="false" and dismiss-on-escape="false"', async () => {
        const el = await fixture<BasicDialog>(html`
            <mdc-basic-dialog open quick dismiss-on-click-outside="false" dismiss-on-escape="false">
                <span slot="headline">Locked</span>
                <p slot="content">Cannot dismiss via scrim or escape.</p>
            </mdc-basic-dialog>
        `)
        expect(el.dismissOnClickOutside).toBe(false)
        expect(el.dismissOnEscape).toBe(false)

        const dialog = el.shadowRoot?.querySelector('dialog')!
        dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        await el.updateComplete
        expect(el.open).toBe(true)

        dialog.dispatchEvent(new Event('cancel', { cancelable: true }))
        await el.updateComplete
        expect(el.open).toBe(true)
    })

    it('traps focus across slotted light-DOM elements', async () => {
        const el = await fixture<BasicDialog>(html`
            <mdc-basic-dialog open quick>
                <span slot="headline">Focus Trap</span>
                <div slot="content">
                    <button id="first-btn">First</button>
                    <button id="last-btn">Last</button>
                </div>
            </mdc-basic-dialog>
        `)
        const firstBtn = el.querySelector('#first-btn') as HTMLButtonElement
        const lastBtn = el.querySelector('#last-btn') as HTMLButtonElement
        const firstTrap = el.shadowRoot?.querySelector('.first-focus-trap') as HTMLElement
        const lastTrap = el.shadowRoot?.querySelector('.last-focus-trap') as HTMLElement

        firstTrap.dispatchEvent(new FocusEvent('focus'))
        expect(document.activeElement).toBe(lastBtn)

        lastTrap.dispatchEvent(new FocusEvent('focus'))
        expect(document.activeElement).toBe(firstBtn)
    })

    it('closes with submitter value on form method="dialog" submission', async () => {
        const el = await fixture<BasicDialog>(html`
            <mdc-basic-dialog quick>
                <span slot="headline">Form</span>
                <form slot="content" id="test-form" method="dialog">
                    <input type="text" name="user" value="Kai" />
                </form>
                <button slot="actions" type="submit" form="test-form" value="saved">Save</button>
            </mdc-basic-dialog>
        `)
        await el.show()
        const form = el.querySelector('#test-form') as HTMLFormElement
        const submitBtn = el.querySelector('button[type="submit"]') as HTMLButtonElement

        form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true, submitter: submitBtn }))
        await new Promise((r) => setTimeout(r, 50))
        await el.updateComplete

        expect(el.returnValue).toBe('saved')
        expect(el.open).toBe(false)
    })

    it('closes with existing returnValue when form method="dialog" submits without submitter', async () => {
        const el = await fixture<BasicDialog>(html`
            <mdc-basic-dialog quick return-value="enter-submit">
                <span slot="headline">Form</span>
                <form slot="content" id="test-form-2" method="dialog">
                    <input type="text" name="user" value="Kai" />
                </form>
            </mdc-basic-dialog>
        `)
        await el.show()
        const form = el.querySelector('#test-form-2') as HTMLFormElement

        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
        await new Promise((r) => setTimeout(r, 0))
        await el.updateComplete

        expect(el.open).toBe(false)
        expect(el.returnValue).toBe('enter-submit')
    })
})

describe('mdc-fullscreen-dialog (DOM)', () => {
    it('renders header with close button, headline, actions, and content', async () => {
        const el = await fixture<FullscreenDialog>(html`
            <mdc-fullscreen-dialog open quick close-label="Dismiss">
                <span slot="headline">New Event</span>
                <button slot="actions" id="save-btn">Save</button>
                <div slot="content">Event form</div>
            </mdc-fullscreen-dialog>
        `)

        expect(el.open).toBe(true)
        const closeBtn = el.shadowRoot?.querySelector('.close-button mdc-icon-button')
        expect(closeBtn).not.toBeNull()
        expect(closeBtn?.getAttribute('aria-label')).toBe('Dismiss')

        closeBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        await new Promise((r) => setTimeout(r, 0))
        await el.updateComplete
        expect(el.open).toBe(false)
    })
})

// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it, vi } from 'vitest'
import { html } from 'lit'
import { fixture } from '../../utils/testing/fixture'
import './snackbar'
import './snackbar-host'
import type { MDCSnackbar } from './snackbar'
import type { MDCSnackbarHost } from './snackbar-host'
import {
    SnackbarActionEvent,
    SnackbarClosedEvent,
    type ISnackbarCloseEventDetail,
} from './snackbar.interface'

describe('mdc-snackbar (DOM)', () => {
    it('renders closed by default and opens when open is set', async () => {
        const el = await fixture<MDCSnackbar>(html`<mdc-snackbar>Saved</mdc-snackbar>`)
        expect(el.open).toBe(false)

        el.open = true
        await el.updateComplete
        expect(el.open).toBe(true)
    })

    it('renders close icon when has-close-icon attribute is set without slotting', async () => {
        const el = await fixture<MDCSnackbar>(html`<mdc-snackbar open has-close-icon>Saved</mdc-snackbar>`)
        await el.updateComplete

        const container = el.shadowRoot!.querySelector('.container')!
        expect(container.classList.contains('has-close-icon')).toBe(true)
        const svg = el.shadowRoot!.querySelector('.close-icon svg')
        expect(svg).not.toBeNull()
    })

    it('applies action-on-new-line class and aria-live assertive for error variant', async () => {
        const el = await fixture<MDCSnackbar>(
            html`<mdc-snackbar open action-on-new-line variant="error">Failed to save</mdc-snackbar>`
        )
        await el.updateComplete

        const container = el.shadowRoot!.querySelector('.container')!
        expect(container.classList.contains('action-on-new-line')).toBe(true)
        expect(container.getAttribute('role')).toBe('alert')
        expect(container.getAttribute('aria-live')).toBe('assertive')
    })

    it('auto-dismisses with reason "action" when action button is clicked', async () => {
        vi.useFakeTimers()
        try {
            const el = await fixture<MDCSnackbar>(
                html`<mdc-snackbar open duration="indefinite">Archived<span slot="action">Undo</span></mdc-snackbar>`
            )
            await el.updateComplete

            let closedReason: string | undefined
            let actionFired = false
            el.addEventListener(SnackbarActionEvent, () => { actionFired = true })
            el.addEventListener(SnackbarClosedEvent, (e) => {
                closedReason = (e as CustomEvent<ISnackbarCloseEventDetail>).detail.reason
            })

            const actionBtn = el.shadowRoot!.querySelector('.action') as HTMLButtonElement
            actionBtn.click()
            await el.updateComplete

            expect(actionFired).toBe(true)
            expect(el.open).toBe(false)

            vi.advanceTimersByTime(200)
            expect(closedReason).toBe('action')
        } finally {
            vi.useRealTimers()
        }
    })

    it('keeps snackbar open if snackbar-action event is prevented', async () => {
        const el = await fixture<MDCSnackbar>(
            html`<mdc-snackbar open duration="indefinite">Archived<span slot="action">Undo</span></mdc-snackbar>`
        )
        await el.updateComplete

        el.addEventListener(SnackbarActionEvent, (e) => e.preventDefault())

        const actionBtn = el.shadowRoot!.querySelector('.action') as HTMLButtonElement
        actionBtn.click()
        await el.updateComplete

        expect(el.open).toBe(true)
    })

    it('dismisses with reason "close" when close icon is clicked', async () => {
        vi.useFakeTimers()
        try {
            const el = await fixture<MDCSnackbar>(
                html`<mdc-snackbar open has-close-icon duration="indefinite">Message</mdc-snackbar>`
            )
            await el.updateComplete

            let closedReason: string | undefined
            el.addEventListener(SnackbarClosedEvent, (e) => {
                closedReason = (e as CustomEvent<ISnackbarCloseEventDetail>).detail.reason
            })

            const closeBtn = el.shadowRoot!.querySelector('.close-icon') as HTMLButtonElement
            closeBtn.click()
            await el.updateComplete

            expect(el.open).toBe(false)
            vi.advanceTimersByTime(200)
            expect(closedReason).toBe('close')
        } finally {
            vi.useRealTimers()
        }
    })

    it('pauses auto-hide timer on pointerenter and resumes on pointerleave', async () => {
        vi.useFakeTimers()
        try {
            const el = await fixture<MDCSnackbar>(
                html`<mdc-snackbar open .duration=${1000}>Message</mdc-snackbar>`
            )
            await el.updateComplete

            await vi.advanceTimersByTimeAsync(600)
            expect(el.open).toBe(true)

            el.dispatchEvent(new Event('pointerenter'))
            await vi.advanceTimersByTimeAsync(2000)
            expect(el.open).toBe(true)

            el.dispatchEvent(new Event('pointerleave'))
            await vi.advanceTimersByTimeAsync(300)
            expect(el.open).toBe(true)

            await vi.advanceTimersByTimeAsync(200)
            expect(el.open).toBe(false)
        } finally {
            vi.useRealTimers()
        }
    })
})

describe('mdc-snackbar-host (DOM)', () => {
    it('resolves with "close" when close icon is clicked and keeps default SVG', async () => {
        vi.useFakeTimers()
        try {
            const host = await fixture<MDCSnackbarHost>(html`<mdc-snackbar-host></mdc-snackbar-host>`)
            const promise = host.show({
                message: 'Hello',
                hasCloseIcon: true,
                duration: 'indefinite',
            })
            await host.updateComplete

            const snackbar = host.shadowRoot!.querySelector('mdc-snackbar')!
            await snackbar.updateComplete

            const svg = snackbar.shadowRoot!.querySelector('.close-icon svg')
            expect(svg).not.toBeNull()

            const closeBtn = snackbar.shadowRoot!.querySelector('.close-icon') as HTMLButtonElement
            closeBtn.click()
            await snackbar.updateComplete

            vi.advanceTimersByTime(200)
            const result = await promise
            expect(result).toBe('close')
        } finally {
            vi.useRealTimers()
        }
    })

    it('replaces current snackbar when replace: true is passed', async () => {
        vi.useFakeTimers()
        try {
            const host = await fixture<MDCSnackbarHost>(html`<mdc-snackbar-host></mdc-snackbar-host>`)
            const firstPromise = host.show({ message: 'First', duration: 'indefinite' })
            await host.updateComplete

            const secondPromise = host.show({ message: 'Second', duration: 'indefinite', replace: true })
            await host.updateComplete
            await vi.advanceTimersByTimeAsync(300)
            await host.updateComplete

            expect(await firstPromise).toBe('dismiss')

            const snackbar = host.shadowRoot!.querySelector('mdc-snackbar')!
            expect(snackbar.textContent).toContain('Second')

            host.dismissCurrent('dismiss')
            await host.updateComplete
            await vi.advanceTimersByTimeAsync(200)
            expect(await secondPromise).toBe('dismiss')
        } finally {
            vi.useRealTimers()
        }
    })

    it('stacks up to maxVisible snackbars and allows independent action clicks', async () => {
        vi.useFakeTimers()
        try {
            const host = await fixture<MDCSnackbarHost>(
                html`<mdc-snackbar-host max-visible="3"></mdc-snackbar-host>`
            )
            const p1 = host.show({ message: 'First', action: 'Undo 1', duration: 'indefinite' })
            const p2 = host.show({ message: 'Second', action: 'Undo 2', duration: 'indefinite' })
            const p3 = host.show({ message: 'Third', action: 'Undo 3', duration: 'indefinite' })
            await host.updateComplete

            const snackbars = Array.from(host.shadowRoot!.querySelectorAll('mdc-snackbar'))
            expect(snackbars.length).toBe(3)

            // Click action on the first (oldest) snackbar while others remain open
            await snackbars[0].updateComplete
            ;(snackbars[0].shadowRoot!.querySelector('.action') as HTMLButtonElement).click()
            await vi.advanceTimersByTimeAsync(200)
            expect(await p1).toBe('action')

            await host.updateComplete
            expect(host.shadowRoot!.querySelectorAll('mdc-snackbar').length).toBe(2)

            host.dismissAll('dismiss')
            await vi.advanceTimersByTimeAsync(200)
            expect(await p2).toBe('dismiss')
            expect(await p3).toBe('dismiss')
        } finally {
            vi.useRealTimers()
        }
    })

    it('coalesces snackbars with the same tag in place without closing', async () => {
        vi.useFakeTimers()
        try {
            const host = await fixture<MDCSnackbarHost>(html`<mdc-snackbar-host></mdc-snackbar-host>`)
            const p1 = host.show({ tag: 'sync', message: 'Synced 1', action: 'Undo', duration: 1000 })
            await host.updateComplete

            await vi.advanceTimersByTimeAsync(600)
            const p2 = host.show({ tag: 'sync', message: 'Synced 2', action: 'Undo', duration: 1000 })
            await host.updateComplete

            expect(await p1).toBe('dismiss')
            const snackbars = host.shadowRoot!.querySelectorAll('mdc-snackbar')
            expect(snackbars.length).toBe(1)
            expect(snackbars[0].textContent).toContain('Synced 2')

            // Timer was reset to 1000ms, so after 600ms it should still be open
            await vi.advanceTimersByTimeAsync(600)
            expect(snackbars[0].open).toBe(true)

            // After another 500ms it times out
            await vi.advanceTimersByTimeAsync(500)
            await vi.advanceTimersByTimeAsync(200)
            expect(await p2).toBe('timeout')
        } finally {
            vi.useRealTimers()
        }
    })
})

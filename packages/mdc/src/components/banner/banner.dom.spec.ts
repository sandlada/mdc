// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html } from 'lit'
import { describe, expect, it } from 'vitest'
import { fixture } from '../../utils/testing/fixture'
import './banner'
import type { MDCBanner } from './banner'
import {
    BannerClosedEvent,
    BannerClosingEvent,
    BannerCloseReason,
    BannerOpenedEvent,
    BannerOpeningEvent,
    BannerPrimaryActionEvent,
    BannerSecondaryActionEvent,
    type IMDCBannerCloseEventDetail,
} from './banner.interface'

describe('mdc-banner (DOM)', () => {
    it('renders open by default and hides optional icon/headline/actions when omitted', async () => {
        const el = await fixture<MDCBanner>(html`<mdc-banner>Connection restored</mdc-banner>`)
        await el.updateComplete

        expect(el.open).toBe(true)
        const collapse = el.shadowRoot!.querySelector('.collapse')!
        expect(collapse.hasAttribute('inert')).toBe(false)
        expect(collapse.getAttribute('aria-hidden')).toBe('false')

        const surface = el.shadowRoot!.querySelector('.surface')!
        expect(surface.getAttribute('role')).toBe('status')
        expect(surface.getAttribute('aria-live')).toBe('polite')

        expect(el.shadowRoot!.querySelector('.icon-wrapper')!.hasAttribute('hidden')).toBe(true)
        expect(el.shadowRoot!.querySelector('.headline')!.hasAttribute('hidden')).toBe(true)
        expect(el.shadowRoot!.querySelector('.actions')!.hasAttribute('hidden')).toBe(true)
    })

    it('renders icon, icon-container, headline, and built-in actions when attributes are set', async () => {
        const el = await fixture<MDCBanner>(html`
            <mdc-banner
                icon="wifi_off"
                icon-container
                headline="Offline"
                primary-action="Retry"
                secondary-action="Dismiss"
                no-divider
            >
                No internet connection.
            </mdc-banner>
        `)
        await el.updateComplete

        const surface = el.shadowRoot!.querySelector('.surface')!
        expect(surface.classList.contains('has-two-actions')).toBe(true)
        expect(surface.classList.contains('has-headline')).toBe(true)
        expect(surface.classList.contains('no-divider')).toBe(true)

        const iconWrapper = el.shadowRoot!.querySelector('.icon-wrapper')!
        expect(iconWrapper.hasAttribute('hidden')).toBe(false)
        expect(iconWrapper.classList.contains('has-icon-container')).toBe(true)
        expect(iconWrapper.querySelector('mdc-icon')?.textContent?.trim()).toBe('wifi_off')

        const headline = el.shadowRoot!.querySelector('.headline')!
        expect(headline.hasAttribute('hidden')).toBe(false)
        expect(headline.textContent?.trim()).toBe('Offline')

        const primaryBtn = el.shadowRoot!.querySelector('.action.primary') as HTMLButtonElement
        const secondaryBtn = el.shadowRoot!.querySelector('.action.secondary') as HTMLButtonElement
        expect(primaryBtn.hasAttribute('hidden')).toBe(false)
        expect(primaryBtn.textContent?.trim()).toBe('Retry')
        expect(secondaryBtn.hasAttribute('hidden')).toBe(false)
        expect(secondaryBtn.textContent?.trim()).toBe('Dismiss')
    })

    it('uses alert role and assertive live region for error-container variant', async () => {
        const el = await fixture<MDCBanner>(html`
            <mdc-banner variant="error-container">Critical sync failure</mdc-banner>
        `)
        await el.updateComplete

        const surface = el.shadowRoot!.querySelector('.surface')!
        expect(surface.getAttribute('role')).toBe('alert')
        expect(surface.getAttribute('aria-live')).toBe('assertive')
    })

    it('dispatches action events and auto-closes only when dismiss-on-action is set and not prevented', async () => {
        const el = await fixture<MDCBanner>(html`
            <mdc-banner quick dismiss-on-action primary-action="Retry" secondary-action="Dismiss">
                Offline
            </mdc-banner>
        `)
        await el.updateComplete

        let primaryFired = false
        let closedReason: string | undefined
        el.addEventListener(BannerPrimaryActionEvent, (e) => {
            primaryFired = true
            e.preventDefault()
        })
        el.addEventListener(BannerClosedEvent, (e) => {
            closedReason = (e as CustomEvent<IMDCBannerCloseEventDetail>).detail.reason
        })

        const primaryBtn = el.shadowRoot!.querySelector('.action.primary') as HTMLButtonElement
        primaryBtn.click()
        await el.updateComplete

        expect(primaryFired).toBe(true)
        expect(el.open).toBe(true)
        expect(closedReason).toBeUndefined()

        let secondaryFired = false
        el.addEventListener(BannerSecondaryActionEvent, () => {
            secondaryFired = true
        })

        const secondaryBtn = el.shadowRoot!.querySelector('.action.secondary') as HTMLButtonElement
        secondaryBtn.click()
        await el.updateComplete

        expect(secondaryFired).toBe(true)
        expect(el.open).toBe(false)
        expect(closedReason).toBe(BannerCloseReason.SecondaryAction)
    })

    it('fires opening/opened and closing/closed lifecycle events via show() and hide()', async () => {
        const el = await fixture<MDCBanner>(html`
            <mdc-banner quick .open=${false}>Notice</mdc-banner>
        `)
        await el.updateComplete

        const events: string[] = []
        el.addEventListener(BannerOpeningEvent, () => events.push('opening'))
        el.addEventListener(BannerOpenedEvent, () => events.push('opened'))
        el.addEventListener(BannerClosingEvent, (e) => {
            events.push(`closing:${(e as CustomEvent<IMDCBannerCloseEventDetail>).detail.reason}`)
        })
        el.addEventListener(BannerClosedEvent, (e) => {
            events.push(`closed:${(e as CustomEvent<IMDCBannerCloseEventDetail>).detail.reason}`)
        })

        await el.show()
        expect(el.open).toBe(true)
        expect(events).toEqual(['opening', 'opened'])

        await el.hide(BannerCloseReason.Dismiss)
        expect(el.open).toBe(false)
        expect(events).toEqual(['opening', 'opened', 'closing:dismiss', 'closed:dismiss'])

        const collapse = el.shadowRoot!.querySelector('.collapse')!
        expect(collapse.hasAttribute('inert')).toBe(true)
        expect(collapse.getAttribute('aria-hidden')).toBe('true')
    })

    it('hides built-in action buttons when custom primary-action/secondary-action slots are used', async () => {
        const el = await fixture<MDCBanner>(html`
            <mdc-banner>
                Custom slotted actions
                <button slot="secondary-action">Later</button>
                <button slot="primary-action">Now</button>
            </mdc-banner>
        `)
        await el.updateComplete

        const surface = el.shadowRoot!.querySelector('.surface')!
        expect(surface.classList.contains('has-two-actions')).toBe(true)
        expect(el.shadowRoot!.querySelector('.actions')!.hasAttribute('hidden')).toBe(false)
        expect(el.shadowRoot!.querySelector('.action.primary')!.hasAttribute('hidden')).toBe(true)
        expect(el.shadowRoot!.querySelector('.action.secondary')!.hasAttribute('hidden')).toBe(true)
    })
})

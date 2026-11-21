// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { afterEach, describe, expect, it } from 'vitest'
import { MDCPopover } from './popover'
import {
    PopoverClosedEvent,
    PopoverDismissReasons,
    PopoverHidingEvent,
    PopoverOpenedEvent,
    PopoverShowingEvent,
    PopoverTriggerModes,
    PopoverVariants,
    type IMDCPopoverLifecycleDetail,
} from './popover.interface'

describe('MDCPopover', () => {
    const mounted: HTMLElement[] = []

    afterEach(() => {
        while (mounted.length > 0) {
            mounted.pop()?.remove()
        }
    })

    const createPopover = async (configure?: (el: MDCPopover) => void): Promise<MDCPopover> => {
        const el = document.createElement('mdc-popover') as MDCPopover
        el.quick = true
        el.innerHTML = `
            <button slot="trigger" type="button">Toggle</button>
            <div slot="header">Popover Header</div>
            <p>Popover body content</p>
            <div slot="footer">Footer</div>
        `
        configure?.(el)
        document.body.appendChild(el)
        mounted.push(el)
        await el.updateComplete
        return el
    }

    it('toggles open on trigger click and emits lifecycle events', async () => {
        const el = await createPopover()
        const events: string[] = []
        el.addEventListener(PopoverShowingEvent, () => events.push('showing'))
        el.addEventListener(PopoverOpenedEvent, () => events.push('opened'))
        el.addEventListener(PopoverHidingEvent, () => events.push('hiding'))
        el.addEventListener(PopoverClosedEvent, () => events.push('closed'))

        const trigger = el.querySelector<HTMLButtonElement>('[slot="trigger"]')!
        trigger.click()
        await new Promise((r) => setTimeout(r, 20))
        expect(el.open).toBe(true)
        expect(trigger.getAttribute('aria-expanded')).toBe('true')
        expect(events).toEqual(['showing', 'opened'])

        trigger.click()
        await new Promise((r) => setTimeout(r, 20))
        expect(el.open).toBe(false)
        expect(trigger.getAttribute('aria-expanded')).toBe('false')
        expect(events).toEqual(['showing', 'opened', 'hiding', 'closed'])
    })

    it('respects cancelable popover-showing event', async () => {
        const el = await createPopover()
        el.addEventListener(PopoverShowingEvent, (e) => e.preventDefault())

        await el.show()
        expect(el.open).toBe(false)
    })

    it('dismisses on Escape key and outside pointerdown with accurate reason', async () => {
        const el = await createPopover()
        let closedReason: string | undefined
        el.addEventListener(PopoverClosedEvent, (e) => {
            closedReason = (e as CustomEvent<IMDCPopoverLifecycleDetail>).detail.reason
        })

        await el.show()
        expect(el.open).toBe(true)

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await new Promise((r) => setTimeout(r, 20))
        expect(el.open).toBe(false)
        expect(closedReason).toBe(PopoverDismissReasons.Escape)

        await el.show()
        expect(el.open).toBe(true)
        document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }))
        await new Promise((r) => setTimeout(r, 20))
        expect(el.open).toBe(false)
        expect(closedReason).toBe(PopoverDismissReasons.OutsideClick)
    })

    it('supports virtual coordinate showAt(x, y), arrow, and modal scrim dismiss', async () => {
        const el = await createPopover((p) => {
            p.variant = PopoverVariants.Outlined
            p.trigger = PopoverTriggerModes.Manual
            p.arrow = true
            p.modal = true
        })

        await el.showAt(150, 220)
        expect(el.open).toBe(true)

        const arrow = el.shadowRoot?.querySelector('.arrow')
        const scrim = el.shadowRoot?.querySelector<HTMLElement>('.scrim')
        expect(arrow).not.toBeNull()
        expect(scrim).not.toBeNull()

        scrim!.click()
        await new Promise((r) => setTimeout(r, 20))
        expect(el.open).toBe(false)
    })

    it('binds external anchor via `for` inside a ShadowRoot', async () => {
        const host = document.createElement('div')
        const shadow = host.attachShadow({ mode: 'open' })
        const extBtn = document.createElement('button')
        extBtn.id = 'ext-anchor'
        extBtn.textContent = 'External'
        const popover = document.createElement('mdc-popover') as MDCPopover
        popover.quick = true
        popover.for = 'ext-anchor'
        popover.innerHTML = '<span>Shadow content</span>'

        shadow.appendChild(extBtn)
        shadow.appendChild(popover)
        document.body.appendChild(host)
        mounted.push(host)
        await popover.updateComplete

        extBtn.click()
        await new Promise((r) => setTimeout(r, 20))
        expect(popover.open).toBe(true)
    })
})

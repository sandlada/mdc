// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html } from 'lit'
import { describe, expect, it, vi } from 'vitest'
import { fixture, oneEvent } from '../../utils/testing/fixture'
import './fab-menu'
import './fab-menu-item'
import type { MDCFabMenu } from './fab-menu'
import type { MDCFabMenuItem } from './fab-menu-item'

describe('mdc-fab-menu (DOM)', () => {
    it('renders toggle FAB and syncs variant to child items', async () => {
        const menu = await fixture<MDCFabMenu>(html`
            <mdc-fab-menu variant="secondary">
                <mdc-fab-menu-item>Edit</mdc-fab-menu-item>
                <mdc-fab-menu-item variant="tertiary">Share</mdc-fab-menu-item>
            </mdc-fab-menu>
        `)

        const items = menu.querySelectorAll('mdc-fab-menu-item')
        expect(items).toHaveLength(2)
        expect(items[0].variant).toBe('secondary')
        expect(items[1].variant).toBe('tertiary')

        menu.variant = 'tertiary'
        await menu.updateComplete
        expect(items[0].variant).toBe('tertiary')
        expect(items[1].variant).toBe('tertiary')

        const toggle = menu.shadowRoot?.querySelector<HTMLButtonElement>('.toggle-fab')
        expect(toggle).not.toBeNull()
        expect(toggle?.getAttribute('aria-expanded')).toBe('false')
    })

    it('opens and closes when clicking the toggle FAB and dispatches lifecycle events', async () => {
        const menu = await fixture<MDCFabMenu>(html`
            <mdc-fab-menu>
                <mdc-fab-menu-item>Compose</mdc-fab-menu-item>
                <mdc-fab-menu-item>Share</mdc-fab-menu-item>
            </mdc-fab-menu>
        `)

        const openSpy = vi.fn()
        const openedSpy = vi.fn()
        const closeSpy = vi.fn()
        const closedSpy = vi.fn()
        const changeSpy = vi.fn()

        menu.addEventListener('open', openSpy)
        menu.addEventListener('opened', openedSpy)
        menu.addEventListener('close', closeSpy)
        menu.addEventListener('closed', closedSpy)
        menu.addEventListener('expanded-change', changeSpy)

        const toggle = menu.shadowRoot!.querySelector<HTMLButtonElement>('.toggle-fab')!
        const openedPromise = oneEvent(menu, 'opened')
        toggle.click()
        await openedPromise
        await menu.updateComplete

        expect(menu.expanded).toBe(true)
        expect(toggle.getAttribute('aria-expanded')).toBe('true')
        expect(openSpy).toHaveBeenCalledTimes(1)
        expect(openedSpy).toHaveBeenCalledTimes(1)
        expect(changeSpy).toHaveBeenLastCalledWith(expect.objectContaining({ detail: { expanded: true } }))

        const closedPromise = oneEvent(menu, 'closed')
        toggle.click()
        await closedPromise
        await menu.updateComplete

        expect(menu.expanded).toBe(false)
        expect(toggle.getAttribute('aria-expanded')).toBe('false')
        expect(closeSpy).toHaveBeenCalledTimes(1)
        expect(closedSpy).toHaveBeenCalledTimes(1)
        expect(changeSpy).toHaveBeenLastCalledWith(expect.objectContaining({ detail: { expanded: false } }))
    })

    it('respects cancelable open and close events', async () => {
        const menu = await fixture<MDCFabMenu>(html`
            <mdc-fab-menu>
                <mdc-fab-menu-item>Item 1</mdc-fab-menu-item>
            </mdc-fab-menu>
        `)

        menu.addEventListener('open', (e) => e.preventDefault(), { once: true })
        await menu.show()
        expect(menu.expanded).toBe(false)

        await menu.show()
        expect(menu.expanded).toBe(true)

        menu.addEventListener('close', (e) => e.preventDefault(), { once: true })
        await menu.close()
        expect(menu.expanded).toBe(true)
    })

    it('closes on item selection unless keep-open or close-on-select=false', async () => {
        const menu = await fixture<MDCFabMenu>(html`
            <mdc-fab-menu expanded>
                <mdc-fab-menu-item id="normal">Normal</mdc-fab-menu-item>
                <mdc-fab-menu-item id="keep" keep-open>Keep Open</mdc-fab-menu-item>
            </mdc-fab-menu>
        `)

        const selectSpy = vi.fn()
        menu.addEventListener('fab-menu-item-select', selectSpy)

        const keepItem = menu.querySelector<MDCFabMenuItem>('#keep')!
        keepItem.shadowRoot!.querySelector<HTMLButtonElement>('.item')!.click()
        await menu.updateComplete
        expect(selectSpy).toHaveBeenCalledTimes(1)
        expect(menu.expanded).toBe(true)

        const normalItem = menu.querySelector<MDCFabMenuItem>('#normal')!
        normalItem.shadowRoot!.querySelector<HTMLButtonElement>('.item')!.click()
        await menu.updateComplete
        await new Promise((r) => setTimeout(r, 0))
        expect(selectSpy).toHaveBeenCalledTimes(2)
        expect(menu.expanded).toBe(false)
    })

    it('does not open when disabled and ignores disabled items', async () => {
        const menu = await fixture<MDCFabMenu>(html`
            <mdc-fab-menu disabled>
                <mdc-fab-menu-item disabled>Disabled Item</mdc-fab-menu-item>
            </mdc-fab-menu>
        `)

        const toggle = menu.shadowRoot!.querySelector<HTMLButtonElement>('.toggle-fab')!
        toggle.click()
        await menu.updateComplete
        expect(menu.expanded).toBe(false)

        const item = menu.querySelector<MDCFabMenuItem>('mdc-fab-menu-item')!
        const selectSpy = vi.fn()
        item.addEventListener('fab-menu-item-select', selectSpy)
        item.shadowRoot!.querySelector<HTMLButtonElement>('.item')!.click()
        expect(selectSpy).not.toHaveBeenCalled()
    })

    it('closes on Escape and outside pointerdown', async () => {
        const menu = await fixture<MDCFabMenu>(html`
            <mdc-fab-menu expanded>
                <mdc-fab-menu-item>Item 1</mdc-fab-menu-item>
            </mdc-fab-menu>
        `)

        menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await menu.updateComplete
        await new Promise((r) => setTimeout(r, 0))
        expect(menu.expanded).toBe(false)

        await menu.show()
        expect(menu.expanded).toBe(true)

        document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }))
        await menu.updateComplete
        await new Promise((r) => setTimeout(r, 0))
        expect(menu.expanded).toBe(false)
    })

    it('supports ArrowUp/ArrowDown/Home/End keyboard navigation skipping disabled items', async () => {
        const menu = await fixture<MDCFabMenu>(html`
            <mdc-fab-menu expanded>
                <mdc-fab-menu-item id="a">A</mdc-fab-menu-item>
                <mdc-fab-menu-item id="b" disabled>B</mdc-fab-menu-item>
                <mdc-fab-menu-item id="c">C</mdc-fab-menu-item>
            </mdc-fab-menu>
        `)

        const itemA = menu.querySelector<MDCFabMenuItem>('#a')!
        const itemC = menu.querySelector<MDCFabMenuItem>('#c')!
        const focusA = vi.spyOn(itemA, 'focus')
        const focusC = vi.spyOn(itemC, 'focus')

        menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
        expect(focusA).toHaveBeenCalledTimes(1)

        menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
        expect(focusC).toHaveBeenCalledTimes(1)

        menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))
        expect(focusA).toHaveBeenCalledTimes(2)
    })

    it('advances ArrowDown/ArrowUp across items even when hosted inside a ShadowRoot', async () => {
        const host = document.createElement('div')
        const shadow = host.attachShadow({ mode: 'open' })
        document.body.appendChild(host)

        const menu = document.createElement('mdc-fab-menu') as MDCFabMenu
        menu.expanded = true
        const itemA = document.createElement('mdc-fab-menu-item') as MDCFabMenuItem
        itemA.textContent = 'A'
        const itemB = document.createElement('mdc-fab-menu-item') as MDCFabMenuItem
        itemB.textContent = 'B'
        const itemC = document.createElement('mdc-fab-menu-item') as MDCFabMenuItem
        itemC.textContent = 'C'
        menu.append(itemA, itemB, itemC)
        shadow.appendChild(menu)

        await Promise.all([menu.updateComplete, itemA.updateComplete, itemB.updateComplete, itemC.updateComplete])

        itemA.focus()
        menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
        expect(shadow.activeElement).toBe(itemB)

        menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
        expect(shadow.activeElement).toBe(itemC)

        menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }))
        expect(shadow.activeElement).toBe(itemB)

        host.remove()
    })

    it('renders an anchor element when href is provided on mdc-fab-menu-item', async () => {
        const item = await fixture<MDCFabMenuItem>(html`
            <mdc-fab-menu-item href="https://example.com" target="_blank">Link</mdc-fab-menu-item>
        `)

        const anchor = item.shadowRoot?.querySelector('a.item')
        expect(anchor).not.toBeNull()
        expect(anchor?.getAttribute('href')).toBe('https://example.com')
        expect(anchor?.getAttribute('target')).toBe('_blank')
        expect(anchor?.getAttribute('role')).toBe('menuitem')
    })
})

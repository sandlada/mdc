// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { afterEach, describe, expect, it } from 'vitest'
import './breadcrumb-item'
import './breadcrumbs'
import type { MDCBreadcrumbItem } from './breadcrumb-item'
import type { MDCBreadcrumbs } from './breadcrumbs'

describe('mdc-breadcrumbs (DOM)', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('marks the last slotted item as current and propagates variant/size/shape', async () => {
        document.body.innerHTML = `
            <mdc-breadcrumbs variant="tonal" size="large" shape="square">
                <mdc-breadcrumb-item href="#home">Home</mdc-breadcrumb-item>
                <mdc-breadcrumb-item href="#docs">Docs</mdc-breadcrumb-item>
                <mdc-breadcrumb-item>Breadcrumbs</mdc-breadcrumb-item>
            </mdc-breadcrumbs>
        `
        const breadcrumbs = document.querySelector('mdc-breadcrumbs') as MDCBreadcrumbs
        await breadcrumbs.updateComplete

        const items = Array.from(breadcrumbs.querySelectorAll('mdc-breadcrumb-item')) as MDCBreadcrumbItem[]
        await Promise.all(items.map((item) => item.updateComplete))

        expect(items[0].current).toBe(false)
        expect(items[1].current).toBe(false)
        expect(items[2].current).toBe(true)
        expect(items[0].variant).toBe('tonal')
        expect(items[0].size).toBe('large')
        expect(items[0].shape).toBe('square')

        const currentEl = items[2].shadowRoot?.querySelector('[aria-current="page"]')
        expect(currentEl).not.toBeNull()

        const iconWithoutAttr = items[1].shadowRoot?.querySelector('.icon')
        expect(iconWithoutAttr?.hasAttribute('hidden')).toBe(true)
    })

    it('dispatches breadcrumb-select when clicking an ancestor item, not current or disabled', async () => {
        document.body.innerHTML = `
            <mdc-breadcrumbs>
                <mdc-breadcrumb-item value="home">Home</mdc-breadcrumb-item>
                <mdc-breadcrumb-item disabled value="locked">Locked</mdc-breadcrumb-item>
                <mdc-breadcrumb-item value="current">Current</mdc-breadcrumb-item>
            </mdc-breadcrumbs>
        `
        const breadcrumbs = document.querySelector('mdc-breadcrumbs') as MDCBreadcrumbs
        await breadcrumbs.updateComplete

        const items = Array.from(breadcrumbs.querySelectorAll('mdc-breadcrumb-item')) as MDCBreadcrumbItem[]
        await Promise.all(items.map((item) => item.updateComplete))

        const events: Array<{ index: number; label: string; value: string | null }> = []
        breadcrumbs.addEventListener('breadcrumb-select', (e: Event) => {
            const detail = (e as CustomEvent).detail
            events.push({ index: detail.index, label: detail.label, value: detail.value })
        })

        items[0].click()
        items[1].click()
        items[2].click()

        expect(events).toEqual([{ index: 0, label: 'Home', value: 'home' }])
    })

    it('collapses middle items and expands inline in expand mode', async () => {
        document.body.innerHTML = `
            <mdc-breadcrumbs max-items="3" items-before-collapse="1" items-after-collapse="1" collapse-mode="expand">
                <mdc-breadcrumb-item>A</mdc-breadcrumb-item>
                <mdc-breadcrumb-item>B</mdc-breadcrumb-item>
                <mdc-breadcrumb-item>C</mdc-breadcrumb-item>
                <mdc-breadcrumb-item>D</mdc-breadcrumb-item>
            </mdc-breadcrumbs>
        `
        const breadcrumbs = document.querySelector('mdc-breadcrumbs') as MDCBreadcrumbs
        await breadcrumbs.updateComplete

        const overflowBtn = breadcrumbs.shadowRoot?.querySelector('.overflow-button') as HTMLButtonElement | null
        expect(overflowBtn).not.toBeNull()

        let expandedCount = 0
        breadcrumbs.addEventListener('breadcrumbs-expand', (e: Event) => {
            expandedCount = (e as CustomEvent).detail.expandedCount
        })

        overflowBtn?.click()
        await breadcrumbs.updateComplete

        expect(expandedCount).toBe(2)
        expect(breadcrumbs.expanded).toBe(true)
        expect(breadcrumbs.shadowRoot?.querySelector('.overflow-button')).toBeNull()
        expect(breadcrumbs.shadowRoot?.querySelectorAll('slot[name^="item-"]').length).toBe(4)
    })

    it('renders overflow menu items in menu collapse mode', async () => {
        document.body.innerHTML = `
            <mdc-breadcrumbs max-items="3" items-before-collapse="1" items-after-collapse="1">
                <mdc-breadcrumb-item>Root</mdc-breadcrumb-item>
                <mdc-breadcrumb-item>Hidden 1</mdc-breadcrumb-item>
                <mdc-breadcrumb-item>Hidden 2</mdc-breadcrumb-item>
                <mdc-breadcrumb-item>Leaf</mdc-breadcrumb-item>
            </mdc-breadcrumbs>
        `
        const breadcrumbs = document.querySelector('mdc-breadcrumbs') as MDCBreadcrumbs
        await breadcrumbs.updateComplete

        const menuItems = breadcrumbs.shadowRoot?.querySelectorAll('mdc-menu-item')
        expect(menuItems?.length).toBe(2)

        const overflowBtn = breadcrumbs.shadowRoot?.querySelector('.overflow-button') as HTMLButtonElement | null
        const menu = breadcrumbs.shadowRoot?.querySelector('mdc-menu') as (HTMLElement & {
            open: boolean
            show(): Promise<void>
            updateComplete: Promise<boolean>
        }) | null
        expect(overflowBtn).not.toBeNull()
        expect(overflowBtn?.getAttribute('slot')).toBe('trigger')
        await menu?.updateComplete
        expect(menu?.open).toBe(false)
        await menu?.show()
        expect(menu?.open).toBe(true)
    })

    it('renders programmatic items array with custom slash separator', async () => {
        const breadcrumbs = document.createElement('mdc-breadcrumbs') as MDCBreadcrumbs
        breadcrumbs.separator = 'slash'
        breadcrumbs.items = [
            { label: 'Home', href: '#home' },
            { label: 'Library', href: '#library' },
            { label: 'Data' },
        ]
        document.body.appendChild(breadcrumbs)
        await breadcrumbs.updateComplete

        const dataItems = breadcrumbs.shadowRoot?.querySelectorAll('.data-item')
        expect(dataItems?.length).toBe(3)
        expect(dataItems?.[2].getAttribute('aria-current')).toBe('page')

        const separators = breadcrumbs.shadowRoot?.querySelectorAll('.separator')
        expect(separators?.length).toBe(2)
        expect(separators?.[0].textContent?.trim()).toBe('/')
    })
})

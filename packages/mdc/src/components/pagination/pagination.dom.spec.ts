// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html } from 'lit'
import { describe, expect, it, vi } from 'vitest'
import { fixture, oneEvent } from '../../utils/testing/fixture'
import './index'
import type { MDCPagination } from './pagination'

describe('mdc-pagination (DOM)', () => {
    it('renders standard page buttons and marks current page with aria-current', async () => {
        const el = await fixture<MDCPagination>(html`
            <mdc-pagination page="3" total-pages="10"></mdc-pagination>
        `)

        const selected = el.shadowRoot?.querySelector('button.page-button.selected')
        expect(selected?.textContent?.trim()).toBe('3')
        expect(selected?.getAttribute('aria-current')).toBe('page')
        expect(el.hasPreviousPage).toBe(true)
        expect(el.hasNextPage).toBe(true)
    })

    it('disables previous/first controls on page 1 and next/last on final page', async () => {
        const el = await fixture<MDCPagination>(html`
            <mdc-pagination page="1" total-pages="5" show-edges></mdc-pagination>
        `)

        const controls = Array.from(el.shadowRoot?.querySelectorAll('button.control-button') ?? []) as HTMLButtonElement[]
        expect(controls).toHaveLength(4)
        expect(controls[0].disabled).toBe(true)
        expect(controls[1].disabled).toBe(true)
        expect(controls[2].disabled).toBe(false)
        expect(controls[3].disabled).toBe(false)

        el.last()
        await el.updateComplete
        expect(el.page).toBe(5)
        expect(controls[0].disabled).toBe(false)
        expect(controls[1].disabled).toBe(false)
        expect(controls[2].disabled).toBe(true)
        expect(controls[3].disabled).toBe(true)
    })

    it('supports cancelable page-change event', async () => {
        const el = await fixture<MDCPagination>(html`
            <mdc-pagination page="2" total-pages="5"></mdc-pagination>
        `)

        el.addEventListener('page-change', (e) => {
            e.preventDefault()
        }, { once: true })

        const committed = el.next()
        expect(committed).toBe(false)
        expect(el.page).toBe(2)

        const eventPromise = oneEvent<CustomEvent>(el, 'page-change')
        expect(el.next()).toBe(true)
        const evt = await eventPromise
        expect(evt.detail).toEqual({
            page: 3,
            oldPage: 2,
            pageSize: 10,
            totalPages: 5,
        })
    })

    it('supports item-based paging and custom formatter functions', async () => {
        const el = await fixture<MDCPagination>(html`
            <mdc-pagination total-items="95" page-size="10" page="2" show-range></mdc-pagination>
        `)

        expect(el.effectiveTotalPages).toBe(10)
        expect(el.shadowRoot?.querySelector('.range-text')?.textContent).toBe('11–20 of 95')

        el.rangeFormatter = ({ start, end, total }) => `第 ${start}-${end} 条，共 ${total} 条`
        el.pageTextFormatter = (p) => `P${p}`
        el.pageAriaLabelFormatter = (p, selected) => (selected ? `当前第${p}页` : `第${p}页`)
        await el.updateComplete

        expect(el.shadowRoot?.querySelector('.range-text')?.textContent).toBe('第 11-20 条，共 95 条')
        const selected = el.shadowRoot?.querySelector('button.page-button.selected')
        expect(selected?.textContent?.trim()).toBe('P2')
        expect(selected?.getAttribute('aria-label')).toBe('当前第2页')
    })

    it('renders compact, simple, and dots variants', async () => {
        const el = await fixture<MDCPagination>(html`
            <mdc-pagination variant="compact" total-items="45" page-size="10" page="1"></mdc-pagination>
        `)
        expect(el.shadowRoot?.querySelector('mdc-select.page-size-select')).not.toBeNull()
        expect(el.shadowRoot?.querySelector('.range-text')?.textContent).toBe('1–10 of 45')

        el.variant = 'simple'
        await el.updateComplete
        expect(el.shadowRoot?.querySelector('.simple-status')?.textContent?.trim()).toBe('1 / 5')

        el.variant = 'dots'
        await el.updateComplete
        const dots = el.shadowRoot?.querySelectorAll('button.dot-button')
        expect(dots).toHaveLength(5)
        expect(dots?.[0].classList.contains('scale-active')).toBe(true)
    })

    it('handles quick jumper Enter submission', async () => {
        const el = await fixture<MDCPagination>(html`
            <mdc-pagination page="1" total-pages="12" show-quick-jumper></mdc-pagination>
        `)
        const onChange = vi.fn()
        el.addEventListener('page-change', onChange)

        const input = el.shadowRoot?.querySelector('.jumper-input') as HTMLInputElement
        input.value = '7'
        input.dispatchEvent(new Event('input'))
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        await el.updateComplete

        expect(el.page).toBe(7)
        expect(onChange).toHaveBeenCalledTimes(1)
    })
})

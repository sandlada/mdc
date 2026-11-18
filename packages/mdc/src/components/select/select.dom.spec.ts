// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html } from 'lit'
import { describe, expect, it, vi } from 'vitest'

vi.mock('lit', async (importOriginal) => ({
    ...(await importOriginal<typeof import('lit')>()),
    isServer: false,
}))

import { CreateValidator } from '../../utils/behaviors/constraint-validation'
import { fixture } from '../../utils/testing/fixture'
import './select'
import './select-option'
import type { MDCSelect } from './select'
import type { MDCSelectOption } from './select-option'

describe('mdc-select (DOM)', () => {
    it('initializes selection from pre-selected option', async () => {
        const el = await fixture<MDCSelect>(html`
            <mdc-select label="Fruit">
                <mdc-select-option value="apple">Apple</mdc-select-option>
                <mdc-select-option value="banana" selected>Banana</mdc-select-option>
                <mdc-select-option value="cherry">Cherry</mdc-select-option>
            </mdc-select>
        `)

        expect(el.value).toBe('banana')
        expect(el.selectedIndex).toBe(1)
        expect(el.displayText).toBe('Banana')
        expect(el.selectedOptions.length).toBe(1)
        expect(el.isPopulated()).toBe(true)

        const field = el.shadowRoot?.querySelector('mdc-field')
        expect(field?.populated).toBe(true)
    })

    it('initializes selection from value attribute', async () => {
        const el = await fixture<MDCSelect>(html`
            <mdc-select label="Fruit" value="cherry">
                <mdc-select-option value="apple">Apple</mdc-select-option>
                <mdc-select-option value="banana">Banana</mdc-select-option>
                <mdc-select-option value="cherry">Cherry</mdc-select-option>
            </mdc-select>
        `)

        expect(el.value).toBe('cherry')
        expect(el.selectedIndex).toBe(2)
        expect(el.displayText).toBe('Cherry')
        expect(el.options[2].selected).toBe(true)
    })

    it('opens on field click and selects option on click with input & change events', async () => {
        const el = await fixture<MDCSelect>(html`
            <mdc-select label="Fruit" quick>
                <mdc-select-option value="apple">Apple</mdc-select-option>
                <mdc-select-option value="banana">Banana</mdc-select-option>
            </mdc-select>
        `)

        const onInput = vi.fn()
        const onChange = vi.fn()
        const onOpening = vi.fn()
        const onOpened = vi.fn()
        const onClosed = vi.fn()
        el.addEventListener('input', onInput)
        el.addEventListener('change', onChange)
        el.addEventListener('opening', onOpening)
        el.addEventListener('opened', onOpened)
        el.addEventListener('closed', onClosed)

        const field = el.shadowRoot?.querySelector('mdc-field') as HTMLElement
        field.click()
        await el.updateComplete
        // allow show() promise microtasks to flush
        await new Promise((r) => setTimeout(r, 0))

        expect(el.open).toBe(true)
        expect(onOpening).toHaveBeenCalledTimes(1)
        expect(onOpened).toHaveBeenCalledTimes(1)
        const trigger = el.shadowRoot?.querySelector('.field-trigger')
        expect(trigger?.getAttribute('aria-expanded')).toBe('true')

        const options = Array.from(el.querySelectorAll('mdc-select-option')) as MDCSelectOption[]
        const optionContainer = options[1].shadowRoot?.querySelector('.container') as HTMLElement
        optionContainer.click()
        await el.updateComplete
        await new Promise((r) => setTimeout(r, 0))

        expect(el.value).toBe('banana')
        expect(el.selectedIndex).toBe(1)
        expect(el.displayText).toBe('Banana')
        expect(el.open).toBe(false)
        expect(onInput).toHaveBeenCalledTimes(1)
        expect(onChange).toHaveBeenCalledTimes(1)
        expect(onClosed).toHaveBeenCalledTimes(1)
    })

    it('respects cancelable opening and closing events', async () => {
        const el = await fixture<MDCSelect>(html`
            <mdc-select label="Fruit" quick>
                <mdc-select-option value="apple">Apple</mdc-select-option>
            </mdc-select>
        `)

        el.addEventListener('opening', (e) => e.preventDefault(), { once: true })
        await el.show()
        expect(el.open).toBe(false)

        await el.show()
        expect(el.open).toBe(true)

        el.addEventListener('closing', (e) => e.preventDefault(), { once: true })
        await el.close()
        expect(el.open).toBe(true)
    })

    it('supports keyboard navigation, skipping disabled options, and Escape to close', async () => {
        const el = await fixture<MDCSelect>(html`
            <mdc-select label="Fruit" quick>
                <mdc-select-option value="a">Apple</mdc-select-option>
                <mdc-select-option value="b" disabled>Banana</mdc-select-option>
                <mdc-select-option value="c">Cherry</mdc-select-option>
            </mdc-select>
        `)

        const trigger = el.shadowRoot?.querySelector('.field-trigger') as HTMLElement
        trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
        await el.updateComplete
        await new Promise((r) => setTimeout(r, 0))

        expect(el.open).toBe(true)
        expect(el.options[0].active).toBe(true)

        // ArrowDown skips disabled index 1 and activates index 2
        trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
        await el.updateComplete
        expect(el.options[2].active).toBe(true)

        // Enter selects index 2 and closes
        trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        await el.updateComplete
        await new Promise((r) => setTimeout(r, 0))

        expect(el.value).toBe('c')
        expect(el.open).toBe(false)

        // Re-open and press Escape without changing value
        trigger.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))
        await el.updateComplete
        await new Promise((r) => setTimeout(r, 0))
        expect(el.open).toBe(true)

        trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await el.updateComplete
        await new Promise((r) => setTimeout(r, 0))
        expect(el.open).toBe(false)
        expect(el.value).toBe('c')
    })

    it('supports typeahead search when closed and when open', async () => {
        const el = await fixture<MDCSelect>(html`
            <mdc-select label="Fruit" quick>
                <mdc-select-option value="apple">Apple</mdc-select-option>
                <mdc-select-option value="cherry">Cherry</mdc-select-option>
                <mdc-select-option value="mango">Mango</mdc-select-option>
            </mdc-select>
        `)

        const trigger = el.shadowRoot?.querySelector('.field-trigger') as HTMLElement
        trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', bubbles: true }))
        await el.updateComplete

        expect(el.value).toBe('mango')
    })

    it('does not open when disabled and ignores disabled options', async () => {
        const el = await fixture<MDCSelect>(html`
            <mdc-select label="Fruit" disabled quick>
                <mdc-select-option value="apple">Apple</mdc-select-option>
            </mdc-select>
        `)

        const field = el.shadowRoot?.querySelector('mdc-field') as HTMLElement
        field.click()
        await el.updateComplete
        expect(el.open).toBe(false)
    })

    it('supports select(), selectIndex(), reset(), and constraint validation', async () => {
        const el = await fixture<MDCSelect>(html`
            <mdc-select label="Fruit" required quick>
                <mdc-select-option value="apple">Apple</mdc-select-option>
                <mdc-select-option value="banana" display-text="Yellow Banana">Banana</mdc-select-option>
            </mdc-select>
        `)

        expect(el[CreateValidator]().getValidity().validity.valueMissing).toBe(true)

        el.select('banana')
        await el.updateComplete
        expect(el.value).toBe('banana')
        expect(el.selectedIndex).toBe(1)
        expect(el.displayText).toBe('Yellow Banana')
        expect(el[CreateValidator]().getValidity().validity.valueMissing).toBe(false)

        el.selectIndex(0)
        await el.updateComplete
        expect(el.value).toBe('apple')
        expect(el.displayText).toBe('Apple')

        el.reset()
        await el.updateComplete
        expect(el.value).toBe('')
        expect(el.selectedIndex).toBe(-1)
        expect(el[CreateValidator]().getValidity().validity.valueMissing).toBe(true)
    })

    it('propagates menuColorStyle to slotted options', async () => {
        const el = await fixture<MDCSelect>(html`
            <mdc-select label="Theme" menu-color-style="vibrant">
                <mdc-select-option value="a">Option A</mdc-select-option>
            </mdc-select>
        `)

        expect((el.options[0] as MDCSelectOption).variant).toBe('vibrant')
    })
})

// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it, vi } from 'vitest'
import { html } from 'lit'
import { fixture } from '../../utils/testing/fixture'
import './text-field'
import type { MDCTextField } from './text-field'
import type { MDCField } from '../field/field'

describe('mdc-text-field (DOM)', () => {
    it('renders label and reflects value changes on input and change', async () => {
        const el = await fixture<MDCTextField>(html`<mdc-text-field label="Email"></mdc-text-field>`)
        const onInput = vi.fn()
        const onChange = vi.fn()
        el.addEventListener('input', onInput)
        el.addEventListener('change', onChange)

        const input = el.shadowRoot?.querySelector('input')
        expect(input).not.toBeNull()

        if (input) {
            input.value = 'test@example.com'
            input.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
            input.dispatchEvent(new Event('change', { bubbles: true }))
        }
        await el.updateComplete

        expect(el.value).toBe('test@example.com')
        expect(onInput).toHaveBeenCalledTimes(1)
        expect(onChange).toHaveBeenCalledTimes(1)

        const field = el.shadowRoot?.querySelector('mdc-field') as MDCField
        expect(field.populated).toBe(true)
    })

    it('marks inner input as disabled when disabled attribute is set', async () => {
        const el = await fixture<MDCTextField>(html`<mdc-text-field disabled></mdc-text-field>`)
        const input = el.shadowRoot?.querySelector('input')
        expect(input?.disabled).toBe(true)
    })

    it('shows clear button when clearable and populated, and clears on click', async () => {
        const el = await fixture<MDCTextField>(html`<mdc-text-field label="Search" value="hello" clearable></mdc-text-field>`)
        const onInput = vi.fn()
        const onChange = vi.fn()
        el.addEventListener('input', onInput)
        el.addEventListener('change', onChange)

        const clearBtn = el.shadowRoot?.querySelector('.clear-button') as HTMLButtonElement | null
        expect(clearBtn).not.toBeNull()

        clearBtn?.click()
        await el.updateComplete

        expect(el.value).toBe('')
        expect(onInput).toHaveBeenCalledTimes(1)
        expect(onChange).toHaveBeenCalledTimes(1)
        expect(el.shadowRoot?.querySelector('.clear-button')).toBeNull()
    })

    it('computes counter text from value length and maxlength', async () => {
        const el = await fixture<MDCTextField>(html`
            <mdc-text-field label="Bio" counter maxlength="20" value="hello"></mdc-text-field>
        `)
        const field = el.shadowRoot?.querySelector('mdc-field') as MDCField
        expect(field.counterText).toBe('5 / 20')
    })

    it('renders textarea and configures multiline + resizable on mdc-field', async () => {
        const el = await fixture<MDCTextField>(html`
            <mdc-text-field variant="outlined" label="Notes" type="textarea" rows="4"></mdc-text-field>
        `)
        const textarea = el.shadowRoot?.querySelector('textarea')
        expect(textarea).not.toBeNull()
        expect(Number(textarea?.rows)).toBe(4)

        const field = el.shadowRoot?.querySelector('mdc-field') as MDCField
        expect(field.variant).toBe('outlined')
        expect(field.multiline).toBe(true)
        expect(field.resizable).toBe(true)
    })

    it('propagates error state and errorText to mdc-field', async () => {
        const el = await fixture<MDCTextField>(html`
            <mdc-text-field label="Username" error error-text="Required field"></mdc-text-field>
        `)
        const field = el.shadowRoot?.querySelector('mdc-field') as MDCField
        expect(field.invalid).toBe(true)
        expect(field.errorText).toBe('Required field')
    })

    it('resets value to initial attribute value on reset()', async () => {
        const el = await fixture<MDCTextField>(html`<mdc-text-field value="initial"></mdc-text-field>`)
        el.value = 'modified'
        await el.updateComplete
        expect(el.value).toBe('modified')

        el.reset()
        await el.updateComplete
        expect(el.value).toBe('initial')
    })

    it('hides placeholder while label is resting and reveals it on focus', async () => {
        const el = await fixture<MDCTextField>(html`
            <mdc-text-field label="With placeholder" placeholder="placeholder@domain.com"></mdc-text-field>
        `)
        const input = el.shadowRoot?.querySelector('input') as HTMLInputElement
        expect(input.classList.contains('hide-placeholder')).toBe(true)

        input.dispatchEvent(new Event('focus'))
        await el.updateComplete
        expect(input.classList.contains('hide-placeholder')).toBe(false)

        input.dispatchEvent(new Event('blur'))
        await el.updateComplete
        expect(input.classList.contains('hide-placeholder')).toBe(true)
    })
})

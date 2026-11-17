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

describe('mdc-text-field (DOM)', () => {
    it('renders label and reflects value changes on input', async () => {
        const el = await fixture<MDCTextField>(html`<mdc-text-field label="Email"></mdc-text-field>`)
        const onInput = vi.fn()
        el.addEventListener('input', onInput)

        const input = el.shadowRoot?.querySelector('input')
        expect(input).not.toBeNull()

        if (input) {
            input.value = 'test@example.com'
            input.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
        }
        await el.updateComplete

        expect(el.value).toBe('test@example.com')
        expect(onInput).toHaveBeenCalledTimes(1)
    })

    it('marks inner input as disabled when disabled attribute is set', async () => {
        const el = await fixture<MDCTextField>(html`<mdc-text-field disabled></mdc-text-field>`)
        const input = el.shadowRoot?.querySelector('input')
        expect(input?.disabled).toBe(true)
    })
})

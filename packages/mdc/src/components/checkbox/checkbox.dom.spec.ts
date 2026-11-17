// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it, vi } from 'vitest'
import { html } from 'lit'
import { fixture } from '../../utils/testing/fixture'
import './checkbox'
import type { MDCCheckbox } from './checkbox'

describe('mdc-checkbox (DOM)', () => {
    it('toggles checked state on click and dispatches change event', async () => {
        const el = await fixture<MDCCheckbox>(html`<mdc-checkbox></mdc-checkbox>`)
        const onChange = vi.fn()
        el.addEventListener('change', onChange)

        expect(el.checked).toBe(false)
        const input = el.shadowRoot?.querySelector('input')
        expect(input).not.toBeNull()

        input?.click()
        await el.updateComplete

        expect(el.checked).toBe(true)
        expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('clears indeterminate state when clicked', async () => {
        const el = await fixture<MDCCheckbox>(html`<mdc-checkbox indeterminate></mdc-checkbox>`)
        expect(el.indeterminate).toBe(true)

        const input = el.shadowRoot?.querySelector('input')
        input?.click()
        await el.updateComplete

        expect(el.indeterminate).toBe(false)
        expect(el.checked).toBe(true)
    })

    it('does not toggle when disabled', async () => {
        const el = await fixture<MDCCheckbox>(html`<mdc-checkbox disabled></mdc-checkbox>`)
        const onChange = vi.fn()
        el.addEventListener('change', onChange)

        const input = el.shadowRoot?.querySelector('input')
        expect(input?.disabled).toBe(true)
        input?.click()
        await el.updateComplete

        expect(el.checked).toBe(false)
        expect(onChange).not.toHaveBeenCalled()
    })
})

// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it, vi } from 'vitest'
import { html } from 'lit'
import { fixture } from '../../utils/testing/fixture'
import './radio-button'
import type { RadioButton } from './radio-button'

describe('mdc-radio-button (DOM)', () => {
    it('selects on click and dispatches change event', async () => {
        const el = await fixture<RadioButton>(html`<mdc-radio-button name="opt" value="a"></mdc-radio-button>`)
        const onChange = vi.fn()
        el.addEventListener('change', onChange)

        expect(el.checked).toBe(false)
        el.click()
        await el.updateComplete

        expect(el.checked).toBe(true)
        expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('does not select when disabled', async () => {
        const el = await fixture<RadioButton>(html`<mdc-radio-button disabled></mdc-radio-button>`)
        const onChange = vi.fn()
        el.addEventListener('change', onChange)

        expect(el.disabled).toBe(true)
        el.click()
        await el.updateComplete

        expect(el.checked).toBe(false)
        expect(onChange).not.toHaveBeenCalled()
    })
})

// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it, vi } from 'vitest'
import { html } from 'lit'
import { fixture } from '../../utils/testing/fixture'
import './switch'
import type { MDCSwitch } from './switch'

describe('mdc-switch (DOM)', () => {
    it('toggles selected state on click and dispatches change event', async () => {
        const el = await fixture<MDCSwitch>(html`<mdc-switch></mdc-switch>`)
        const onChange = vi.fn()
        el.addEventListener('change', onChange)

        expect(el.selected).toBe(false)
        const input = el.shadowRoot?.querySelector('input')
        expect(input).not.toBeNull()

        input?.click()
        await el.updateComplete

        expect(el.selected).toBe(true)
        expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('does not toggle when disabled', async () => {
        const el = await fixture<MDCSwitch>(html`<mdc-switch disabled></mdc-switch>`)
        const onChange = vi.fn()
        el.addEventListener('change', onChange)

        const input = el.shadowRoot?.querySelector('input')
        expect(input?.disabled).toBe(true)
        input?.click()
        await el.updateComplete

        expect(el.selected).toBe(false)
        expect(onChange).not.toHaveBeenCalled()
    })
})

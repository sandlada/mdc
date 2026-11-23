// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it, vi } from 'vitest'
import { fixture } from '../../utils/testing/fixture'
import './switch'
import type { MDCSwitch } from './switch'

describe('mdc-switch (DOM)', () => {
    it('renders internal checkbox input with switch role and reflects selected state', async () => {
        const el = await fixture<MDCSwitch>('<mdc-switch></mdc-switch>')
        const input = el.shadowRoot!.querySelector('input')!

        expect(input).not.toBeNull()
        expect(input.getAttribute('role')).toBe('switch')
        expect(el.selected).toBe(false)
        expect(input.checked).toBe(false)

        el.selected = true
        await el.updateComplete
        expect(el.hasAttribute('selected')).toBe(true)
        expect(input.checked).toBe(true)
    })

    it('toggles selected on input change and redispatches change event', async () => {
        const el = await fixture<MDCSwitch>('<mdc-switch></mdc-switch>')
        const input = el.shadowRoot!.querySelector('input')!
        const onChange = vi.fn()
        el.addEventListener('change', onChange)

        input.checked = true
        input.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
        input.dispatchEvent(new Event('change', { bubbles: true }))
        await el.updateComplete

        expect(el.selected).toBe(true)
        expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('does not toggle when disabled', async () => {
        const el = await fixture<MDCSwitch>('<mdc-switch disabled></mdc-switch>')
        const input = el.shadowRoot!.querySelector('input')!

        expect(input.disabled).toBe(true)
        input.click()
        await el.updateComplete

        expect(el.selected).toBe(false)
    })

    it('renders icons according to hide-selected-icon and show-unselected-icon', async () => {
        const el = await fixture<MDCSwitch>('<mdc-switch selected show-unselected-icon></mdc-switch>')
        expect(el.shadowRoot!.querySelector('.icon-selected')).not.toBeNull()

        el.hideSelectedIcon = true
        await el.updateComplete
        expect(el.shadowRoot!.querySelector('.icon-selected')).toBeNull()

        el.selected = false
        await el.updateComplete
        expect(el.shadowRoot!.querySelector('.icon-unselected')).not.toBeNull()
    })
})

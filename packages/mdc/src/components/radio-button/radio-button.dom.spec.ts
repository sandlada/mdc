// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it, vi } from 'vitest'
import { fixture } from '../../utils/testing/fixture'
import './radio-button'
import type { RadioButton } from './radio-button'

describe('mdc-radio-button (DOM)', () => {
    it('reflects default checked, disabled, and shadowRoot', async () => {
        const el = await fixture<RadioButton>('<mdc-radio-button></mdc-radio-button>')

        expect(el.checked).toBe(false)
        expect(el.disabled).toBe(false)
        expect(el.value).toBe('on')
        expect(el.shadowRoot).not.toBeNull()
    })

    it('checks on click and dispatches input and change events', async () => {
        const el = await fixture<RadioButton>('<mdc-radio-button name="choice" value="a"></mdc-radio-button>')
        const onInput = vi.fn()
        const onChange = vi.fn()
        el.addEventListener('input', onInput)
        el.addEventListener('change', onChange)

        el.click()
        await el.updateComplete

        expect(el.checked).toBe(true)
        expect(el.hasAttribute('checked')).toBe(true)
        expect(onInput).toHaveBeenCalledTimes(1)
        expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('unchecks sibling radio buttons with the same name', async () => {
        const wrapper = await fixture<HTMLDivElement>(`
            <div>
                <mdc-radio-button name="grp" value="1" checked></mdc-radio-button>
                <mdc-radio-button name="grp" value="2"></mdc-radio-button>
            </div>
        `)
        const [first, second] = Array.from(wrapper.querySelectorAll('mdc-radio-button')) as RadioButton[]

        expect(first.checked).toBe(true)
        expect(second.checked).toBe(false)

        second.click()
        await second.updateComplete
        await first.updateComplete

        expect(second.checked).toBe(true)
        expect(first.checked).toBe(false)
    })

    it('does not toggle when disabled', async () => {
        const el = await fixture<RadioButton>('<mdc-radio-button disabled></mdc-radio-button>')
        const onChange = vi.fn()
        el.addEventListener('change', onChange)

        el.click()
        await el.updateComplete

        expect(el.checked).toBe(false)
        expect(onChange).not.toHaveBeenCalled()
    })
})

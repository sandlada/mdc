// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it, vi } from 'vitest'
import { html } from 'lit'
import { fixture } from '../../utils/testing/fixture'
import './field'
import type { MDCField } from './field'

describe('mdc-field (DOM)', () => {
    it('renders filled chrome with background, state-layer, and active-indicator by default', async () => {
        const el = await fixture<MDCField>(html`<mdc-field label="Email"><input /></mdc-field>`)
        expect(el.variant).toBe('filled')
        expect(el.shadowRoot?.querySelector('.background')).not.toBeNull()
        expect(el.shadowRoot?.querySelector('.state-layer')).not.toBeNull()
        expect(el.shadowRoot?.querySelector('.active-indicator')).not.toBeNull()
        expect(el.shadowRoot?.querySelector('.outline')).toBeNull()
    })

    it('renders outlined chrome with 3-segment transparent notch outline', async () => {
        const el = await fixture<MDCField>(html`
            <mdc-field variant="outlined" label="Username" required>
                <input />
            </mdc-field>
        `)
        expect(el.shadowRoot?.querySelector('.outline')).not.toBeNull()
        expect(el.shadowRoot?.querySelector('.outline-start')).not.toBeNull()
        expect(el.shadowRoot?.querySelector('.outline-notch')).not.toBeNull()
        expect(el.shadowRoot?.querySelector('.outline-end')).not.toBeNull()
        expect(el.shadowRoot?.querySelector('.active-indicator')).toBeNull()

        const spacer = el.shadowRoot?.querySelector('.outline-label-spacer')
        expect(spacer?.textContent).toContain('Username')
        expect(spacer?.textContent).toContain('*')
    })

    it('toggles floating-label class based on focused, populated, and floatingLabelBehavior', async () => {
        const el = await fixture<MDCField>(html`<mdc-field label="Name"><input /></mdc-field>`)
        const container = el.shadowRoot?.querySelector('.container')
        expect(container?.classList.contains('floating-label')).toBe(false)
        expect(container?.classList.contains('resting-label')).toBe(true)

        el.focused = true
        await el.updateComplete
        expect(container?.classList.contains('floating-label')).toBe(true)

        el.focused = false
        el.populated = true
        await el.updateComplete
        expect(container?.classList.contains('floating-label')).toBe(true)

        el.populated = false
        el.floatingLabelBehavior = 'always'
        await el.updateComplete
        expect(container?.classList.contains('floating-label')).toBe(true)

        el.floatingLabelBehavior = 'never'
        await el.updateComplete
        expect(container?.classList.contains('floating-label')).toBe(false)
        expect(container?.classList.contains('has-label')).toBe(false)
    })

    it('switches supporting text to error text when invalid', async () => {
        const el = await fixture<MDCField>(html`
            <mdc-field supporting-text="Helper" error-text="Invalid input" counter-text="3 / 10">
                <input />
            </mdc-field>
        `)
        expect(el.shadowRoot?.querySelector('.supporting-text')?.textContent?.trim()).toBe('Helper')
        expect(el.shadowRoot?.querySelector('.counter')?.textContent?.trim()).toBe('3 / 10')

        el.invalid = true
        await el.updateComplete
        expect(el.shadowRoot?.querySelector('.supporting-text')?.textContent?.trim()).toBe('Invalid input')
    })

    it('detects leading-icon, trailing-icon, prefix, and suffix slots', async () => {
        const el = await fixture<MDCField>(html`
            <mdc-field prefix-text="$" suffix-text="USD">
                <span slot="leading-icon">L</span>
                <input />
                <span slot="trailing-icon">T</span>
            </mdc-field>
        `)
        await el.updateComplete
        const container = el.shadowRoot?.querySelector('.container')
        expect(container?.classList.contains('has-leading-icon')).toBe(true)
        expect(container?.classList.contains('has-trailing-icon')).toBe(true)
        expect(container?.classList.contains('has-prefix')).toBe(true)
        expect(container?.classList.contains('has-suffix')).toBe(true)
    })

    it('focuses slotted input and dispatches field-label-pointer when label is clicked', async () => {
        const el = await fixture<MDCField>(html`
            <mdc-field label="Email">
                <input id="inner" />
            </mdc-field>
        `)
        const onLabelPointer = vi.fn()
        el.addEventListener('field-label-pointer', onLabelPointer)

        const input = el.querySelector('#inner') as HTMLInputElement
        const focusSpy = vi.spyOn(input, 'focus')

        const label = el.shadowRoot?.querySelector('.label') as HTMLElement
        label.click()

        expect(onLabelPointer).toHaveBeenCalledTimes(1)
        expect(focusSpy).toHaveBeenCalledTimes(1)
    })
})

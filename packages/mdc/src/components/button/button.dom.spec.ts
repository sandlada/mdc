// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it, vi } from 'vitest'
import { html } from 'lit'
import { fixture } from '../../utils/testing/fixture'
import './button'
import type { MDCButton } from './button'

describe('mdc-button (DOM)', () => {
    it('renders slotted label and reflects variant/size/shape attributes', async () => {
        const el = await fixture<MDCButton>(html`
            <mdc-button variant="outlined" size="large" shape="square">Save</mdc-button>
        `)

        expect(el.variant).toBe('outlined')
        expect(el.size).toBe('large')
        expect(el.shape).toBe('square')
        expect(el.textContent?.trim()).toBe('Save')
        expect(el.shadowRoot?.querySelector('button')).not.toBeNull()
    })

    it('blocks click events when disabled', async () => {
        const el = await fixture<MDCButton>(html`<mdc-button disabled>Disabled</mdc-button>`)
        const onClick = vi.fn()
        el.addEventListener('click', onClick)

        const innerButton = el.shadowRoot?.querySelector('button')
        expect(innerButton?.disabled).toBe(true)
        innerButton?.click()
        expect(onClick).not.toHaveBeenCalled()
    })

    it('triggers click handler when enabled', async () => {
        const el = await fixture<MDCButton>(html`<mdc-button>Submit</mdc-button>`)
        const onClick = vi.fn()
        el.addEventListener('click', onClick)

        const innerButton = el.shadowRoot?.querySelector('button')
        innerButton?.click()
        expect(onClick).toHaveBeenCalledTimes(1)
    })
})

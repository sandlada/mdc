// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it, vi } from 'vitest'
import { html } from 'lit'
import { fixture, nextFrame } from '../../utils/testing/fixture'
import './button'
import './toggle-button'
import type { MDCButton } from './button'

describe('mdc-button (DOM)', () => {
    it.each(['mdc-button', 'mdc-toggle-button'] as const)('displays a plain-text label in %s', async (tag) => {
        const el = await fixture<HTMLElementTagNameMap[typeof tag]>(`<${tag}>Save</${tag}>`)

        const label = el.shadowRoot!.querySelector('.label')!
        expect(getComputedStyle(label).display).not.toBe('none')
    })

    it.each([
        ['<span>Save</span>', true],
        ['<span slot="icon">+</span>Save', true],
        ['<span slot="icon">+</span>\n    ', false],
    ])('uses the expected label visibility for %j', async (content, visible) => {
        const el = await fixture<MDCButton>(`<mdc-button>${content}</mdc-button>`)
        await nextFrame()

        const label = el.shadowRoot!.querySelector('.label')!
        expect(getComputedStyle(label).display !== 'none').toBe(visible)
    })

    it('updates label visibility when the assigned text node changes in place', async () => {
        const el = await fixture<MDCButton>('<mdc-button> </mdc-button>')
        await nextFrame()
        const text = el.firstChild as Text
        const label = el.shadowRoot!.querySelector('.label')!
        expect(getComputedStyle(label).display).toBe('none')

        text.data = 'Save'
        await nextFrame()
        expect(getComputedStyle(label).display).not.toBe('none')

        const parent = el.parentElement!
        el.remove()
        text.data = ' '
        parent.append(el)
        await nextFrame()
        expect(getComputedStyle(label).display).toBe('none')

        text.data = 'Save'
        await nextFrame()
        expect(getComputedStyle(label).display).not.toBe('none')

        text.data = ' '
        await nextFrame()
        expect(getComputedStyle(label).display).toBe('none')
    })

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

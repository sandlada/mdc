// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { html } from 'lit'
import { fixture } from '../../utils/testing/fixture'
import './slider'
import type { MDCSlider } from './slider'

describe('mdc-slider (DOM)', () => {
    it('renders with default min/max/value and updates value', async () => {
        const el = await fixture<MDCSlider>(html`<mdc-slider min="0" max="100" value="40"></mdc-slider>`)

        expect(el.min).toBe(0)
        expect(el.max).toBe(100)
        expect(el.value).toBe(40)

        el.value = 75
        await el.updateComplete
        expect(el.value).toBe(75)
    })

    it('reflects disabled state', async () => {
        const el = await fixture<MDCSlider>(html`<mdc-slider disabled></mdc-slider>`)
        expect(el.disabled).toBe(true)
    })

    it('supports range slider min-separation, aria bounds, and focus order', async () => {
        const el = await fixture<MDCSlider>(
            html`<mdc-slider type="range" min="0" max="100" step="5" min-separation="20" value-start="30" value-end="60"></mdc-slider>`,
        )
        const startThumb = el.shadowRoot?.querySelector<HTMLElement>('.thumb[data-thumb="start"]')
        const endThumb = el.shadowRoot?.querySelector<HTMLElement>('.thumb[data-thumb="end"]')
        expect(startThumb?.getAttribute('aria-valuemax')).toBe('40')
        expect(endThumb?.getAttribute('aria-valuemin')).toBe('50')

        el.focus()
        expect(el.shadowRoot?.activeElement).toBe(startThumb)
    })

    it('picks the right thumb when clicking away from coincident range thumbs', async () => {
        const el = await fixture<MDCSlider>(
            html`<mdc-slider type="range" min="0" max="100" value-start="0" value-end="0"></mdc-slider>`,
        )
        const container = el.shadowRoot?.querySelector<HTMLElement>('.container')!
        container.getBoundingClientRect = () =>
            ({ left: 0, right: 204, top: 0, bottom: 48, width: 204, height: 48 }) as DOMRect
        container.setPointerCapture = () => {}
        container.releasePointerCapture = () => {}
        container.hasPointerCapture = () => false

        container.dispatchEvent(
            new PointerEvent('pointerdown', {
                button: 0,
                pointerId: 1,
                clientX: 102,
                clientY: 24,
                bubbles: true,
            }),
        )
        await el.updateComplete
        expect(el.valueStart).toBe(0)
        expect(el.valueEnd).toBe(50)
    })
})

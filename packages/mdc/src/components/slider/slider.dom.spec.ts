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
})

// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { html } from 'lit'
import { fixture } from '../../utils/testing/fixture'
import './chip'
import type { MDCChip } from './chip'

describe('mdc-chip (DOM)', () => {
    it('renders label and reflects disabled state', async () => {
        const el = await fixture<MDCChip>(html`<mdc-chip label="Filter"></mdc-chip>`)
        expect(el.label).toBe('Filter')
        expect(el.disabled).toBe(false)

        el.disabled = true
        await el.updateComplete
        expect(el.disabled).toBe(true)
    })
})

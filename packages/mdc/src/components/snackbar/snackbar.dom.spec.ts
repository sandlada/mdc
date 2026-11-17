// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { html } from 'lit'
import { fixture } from '../../utils/testing/fixture'
import './snackbar'
import type { MDCSnackbar } from './snackbar'

describe('mdc-snackbar (DOM)', () => {
    it('renders closed by default and opens when open is set', async () => {
        const el = await fixture<MDCSnackbar>(html`<mdc-snackbar>Saved</mdc-snackbar>`)
        expect(el.open).toBe(false)

        el.open = true
        await el.updateComplete
        expect(el.open).toBe(true)
    })
})

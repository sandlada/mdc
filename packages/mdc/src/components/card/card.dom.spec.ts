// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { html } from 'lit'
import { fixture } from '../../utils/testing/fixture'
import './card'
import type { MDCCard } from './card'

describe('mdc-card (DOM)', () => {
    it('renders slotted content and reflects variant', async () => {
        const el = await fixture<MDCCard>(html`<mdc-card variant="outlined">Content</mdc-card>`)
        expect(el.variant).toBe('outlined')
        expect(el.textContent?.trim()).toBe('Content')
    })
})

// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { html } from 'lit'
import { fixture } from '../../utils/testing/fixture'
import './fab'
import type { MDCFab } from './fab'

describe('mdc-fab (DOM)', () => {
    it('renders with variant and size attributes', async () => {
        const el = await fixture<MDCFab>(html`<mdc-fab variant="primary" size="large"></mdc-fab>`)
        expect(el.variant).toBe('primary')
        expect(el.size).toBe('large')
        expect(el.shadowRoot?.querySelector('button')).not.toBeNull()
    })
})

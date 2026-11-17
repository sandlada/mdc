// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it, vi } from 'vitest'
import { html } from 'lit'
import { fixture } from '../../utils/testing/fixture'
import './icon-button'
import type { MDCIconButton } from './icon-button'

describe('mdc-icon-button (DOM)', () => {
    it('triggers click when enabled and blocks when disabled', async () => {
        const el = await fixture<MDCIconButton>(html`<mdc-icon-button></mdc-icon-button>`)
        const onClick = vi.fn()
        el.addEventListener('click', onClick)

        const button = el.shadowRoot?.querySelector('button')
        button?.click()
        expect(onClick).toHaveBeenCalledTimes(1)

        el.disabled = true
        await el.updateComplete
        button?.click()
        expect(onClick).toHaveBeenCalledTimes(1)
    })
})

// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { fixture } from '../../utils/testing/fixture'
import './divider'
import type { Divider } from './divider'

describe('mdc-divider (DOM)', () => {
    it('instantiates with default inset properties as false', async () => {
        const el = await fixture<Divider>('<mdc-divider></mdc-divider>')

        expect(el.inset).toBe(false)
        expect(el.insetStart).toBe(false)
        expect(el.insetEnd).toBe(false)
        expect(el.hasAttribute('inset')).toBe(false)
    })

    it('preserves user-provided ARIA attributes and reflects inset properties', async () => {
        const el = await fixture<Divider>(
            '<mdc-divider inset inset-start inset-end aria-orientation="vertical"></mdc-divider>'
        )

        expect(el.getAttribute('aria-orientation')).toBe('vertical')
        expect(el.inset).toBe(true)
        expect(el.insetStart).toBe(true)
        expect(el.insetEnd).toBe(true)
        expect(el.hasAttribute('inset')).toBe(true)
        expect(el.hasAttribute('inset-start')).toBe(true)
        expect(el.hasAttribute('inset-end')).toBe(true)
    })
})

// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { fixture } from '../../utils/testing/fixture'
import './typography'
import type { MDCTypography } from './typography'

describe('mdc-typography (DOM)', () => {
    it('renders slot content and reflects variant and emphasized attributes', async () => {
        const el = await fixture<MDCTypography>(
            '<mdc-typography variant="headline-large" emphasized>Heading</mdc-typography>'
        )

        expect(el.variant).toBe('headline-large')
        expect(el.emphasized).toBe(true)
        expect(el.getAttribute('variant')).toBe('headline-large')
        expect(el.hasAttribute('emphasized')).toBe(true)
        expect(el.shadowRoot!.querySelector('slot')).not.toBeNull()
        expect(el.textContent).toBe('Heading')
    })

    it('uses default body-medium variant', async () => {
        const el = await fixture<MDCTypography>('<mdc-typography>Body text</mdc-typography>')

        expect(el.variant).toBe('body-medium')
        expect(el.emphasized).toBe(false)
        expect(el.getAttribute('variant')).toBe('body-medium')
    })
})

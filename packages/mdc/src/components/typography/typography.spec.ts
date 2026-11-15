/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { MDCTypography } from './typography'
import { TypographyVariant } from './typography.interface'

describe('MDCTypography', () => {
    it('has correct default properties', () => {
        const typography = new MDCTypography()
        expect(typography.emphasized).toBe(false)
        expect(typography.variant).toBe('body-medium')
    })

    it('allows updating every property', () => {
        const typography = new MDCTypography()
        typography.emphasized = true
        typography.variant = TypographyVariant.DisplayLarge
        expect(typography.emphasized).toBe(true)
        expect(typography.variant).toBe('display-large')
    })
})
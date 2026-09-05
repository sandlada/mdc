/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect } from 'vitest'
import { defineVariantTokens } from './define-variant-tokens'
import { defineSchema } from './define-schema'
import { createStyleDefinition } from './create-style-definition'
import { pipe } from './pipe'
import { CSSResult } from 'lit'

const TestSchema = defineSchema(['enabled', 'hovered', 'disabled'] as const)

const FilledDef = createStyleDefinition(TestSchema)({
    'container-color': ['#6750a4', '#7965b2', '#e0e0e0'],
    'label-color': ['#ffffff', '#ffffff', '#9e9e9e']
})

const OutlinedDef = createStyleDefinition(TestSchema)({
    'container-color': ['transparent', '#f3edf7', 'transparent'],
    'label-color': ['#6750a4', '#6750a4', '#9e9e9e']
})

const TonalDef = createStyleDefinition(TestSchema)({
    'container-color': ['#e8def8', '#dfd5ee', '#e0e0e0'],
    'label-color': ['#1d192b', '#1d192b', '#9e9e9e']
})

const ButtonVariants = {
    'filled': FilledDef,
    'outlined': OutlinedDef,
    'tonal': TonalDef
} as const

describe('defineVariantTokens', () => {
    it('returns a CSSResult when invoked with prefix string', () => {
        const result = defineVariantTokens('--mdc-test-button')(ButtonVariants)
        expect(result).toBeInstanceOf(CSSResult)

        const css = result.cssText
        expect(css).toContain(':host([variant="filled"]) {')
        expect(css).toContain(':host([variant="outlined"]) {')
        expect(css).toContain(':host([variant="tonal"]) {')

        expect(css).toContain('--_enabled-container-color: var(--mdc-test-button-enabled-container-color, #6750a4);')
        expect(css).toContain('--_enabled-container-color: var(--mdc-test-button-enabled-container-color, transparent);')
        expect(css).toContain('--_enabled-container-color: var(--mdc-test-button-enabled-container-color, #e8def8);')
    })

    it('supports custom variantSelector function', () => {
        const customSelector = (v: string) => `:where(:host([variant="${v}"]), :host(:has(.${v})))`
        const result = defineVariantTokens({
            prefix: '--mdc-btn',
            variantSelector: customSelector
        })(ButtonVariants)

        const css = result.cssText
        expect(css).toContain(':where(:host([variant="filled"]), :host(:has(.filled))) {')
        expect(css).toContain(':where(:host([variant="outlined"]), :host(:has(.outlined))) {')
        expect(css).toContain(':where(:host([variant="tonal"]), :host(:has(.tonal))) {')
    })

    it('supports includePublicVars: false', () => {
        const result = defineVariantTokens({
            prefix: '--mdc-btn',
            includePublicVars: false
        })(ButtonVariants)

        const css = result.cssText
        expect(css).toContain('--_enabled-container-color: #6750a4;')
        expect(css).not.toContain('var(--mdc-btn-enabled-container-color')
    })

    it('works cleanly in pipe(...) functional pipeline', () => {
        const getStyles = pipe(
            defineVariantTokens('--mdc-pipe-btn')
        )
        const result = getStyles(ButtonVariants)
        expect(result).toBeInstanceOf(CSSResult)
        expect(result.cssText).toContain(':host([variant="filled"])')
    })

    it('handles empty variants dictionary gracefully', () => {
        const result = defineVariantTokens('--mdc-empty')({})
        expect(result).toBeInstanceOf(CSSResult)
        expect(result.cssText).toBe('')
    })

    it('handles null / undefined dictionary gracefully', () => {
        const result = defineVariantTokens('--mdc-null')(null as any)
        expect(result).toBeInstanceOf(CSSResult)
        expect(result.cssText).toBe('')
    })
})

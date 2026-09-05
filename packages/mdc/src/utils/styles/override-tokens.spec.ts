/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect } from 'vitest'
import { css, CSSResult } from 'lit'
import { defineSchema } from './define-schema'
import { createStyleDefinition } from './create-style-definition'
import { overrideTokens } from './override-tokens'

describe('overrideTokens', () => {
    it('generates public CSS variable overrides from a tokens map', () => {
        const result = overrideTokens('--mdc-button')({
            'container-color': '#b3261e',
            'container-shape': '16px'
        })()

        expect(result).toBeInstanceOf(CSSResult)
        expect(result.cssText).toContain('--mdc-button-container-color: #b3261e;')
        expect(result.cssText).toContain('--mdc-button-container-shape: 16px;')
    })

    it('wraps overrides inside a selector block when selector option is provided', () => {
        const result = overrideTokens({
            prefix: '--mdc-button',
            selector: ':host([data-theme="dark"])'
        })({
            'container-color': '#1d1b20',
            'label-color': '#e6e1e5'
        })()

        expect(result.cssText).toBe(
            ':host([data-theme="dark"]) {\n    --mdc-button-container-color: #1d1b20;\n    --mdc-button-label-color: #e6e1e5;\n}'
        )
    })

    it('handles numeric values, CSSResult, and objects with ToCSSVariable', () => {
        const customColor = {
            ToCSSVariable: () => 'var(--mdc-sys-color-primary)'
        }
        const customPadding = css`16px 24px`

        const result = overrideTokens('--mdc-card')({
            'elevation': 2,
            'color': customColor,
            'padding': customPadding
        })()

        expect(result.cssText).toContain('--mdc-card-elevation: 2;')
        expect(result.cssText).toContain('--mdc-card-color: var(--mdc-sys-color-primary);')
        expect(result.cssText).toContain('--mdc-card-padding: 16px 24px;')
    })

    it('supports curried point-free composition consuming style definitions', () => {
        const schema = defineSchema(['enabled', 'selected'] as const)
        const ButtonDefinition = createStyleDefinition(schema)({
            'container-color': ['#6750a4', '#e8def8'],
            'container-shape': '8px'
        })

        const overrideFn = overrideTokens<typeof ButtonDefinition>('--mdc-button')({
            'container-color': '#006a6a',
            'container-shape': '12px'
        })

        const result = overrideFn(ButtonDefinition)

        expect(result).toBeInstanceOf(CSSResult)
        expect(result.cssText).toContain('--mdc-button-container-color: #006a6a;')
        expect(result.cssText).toContain('--mdc-button-container-shape: 12px;')
    })

    it('filters out null and undefined override entries', () => {
        const result = overrideTokens('--mdc-button')({
            'container-color': null,
            'label-color': undefined,
            'container-shape': '20px'
        })()

        expect(result.cssText).toBe('--mdc-button-container-shape: 20px;')
    })

    it('returns empty CSSResult when override tokens are empty', () => {
        const result = overrideTokens('--mdc-button')({})()
        expect(result.cssText).toBe('')
    })
})

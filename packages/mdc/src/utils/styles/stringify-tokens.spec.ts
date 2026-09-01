/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect } from 'vitest'
import { css, CSSResult } from 'lit'
import { defineSchema } from './define-schema'
import { createStyleDefinition } from './create-style-definition'
import { forwardTokens } from './forward-tokens'
import { stringifyTokens } from './stringify-tokens'

describe('stringifyTokens', () => {
    it('stringifies static invariant tokens with public fallback variable', () => {
        const schema = defineSchema(['enabled'] as const)
        const def = createStyleDefinition(schema)({
            'container-shape': '8px',
            'container-height': 40
        })

        const result = stringifyTokens('--mdc-button')(def)

        expect(result).toBeInstanceOf(CSSResult)
        expect(result.cssText).toContain('--_container-shape: var(--mdc-button-container-shape, 8px);')
        expect(result.cssText).toContain('--_container-height: var(--mdc-button-container-height, 40);')
    })

    it('stringifies multi-state tuple tokens symmetrically across all states', () => {
        const schema = defineSchema(['enabled', 'selected'] as const)
        const def = createStyleDefinition(schema)({
            'container-color': ['#6750a4', '#e8def8'],
            'label-color': ['#ffffff', '#1d192b']
        })

        const result = stringifyTokens('--mdc-button')(def)

        expect(result.cssText).toContain(
            '--_enabled-container-color: var(--mdc-button-enabled-container-color, #6750a4);'
        )
        expect(result.cssText).toContain(
            '--_selected-container-color: var(--mdc-button-selected-container-color, #e8def8);'
        )
        expect(result.cssText).toContain(
            '--_enabled-label-color: var(--mdc-button-enabled-label-color, #ffffff);'
        )
        expect(result.cssText).toContain(
            '--_selected-label-color: var(--mdc-button-selected-label-color, #1d192b);'
        )
    })

    it('stringifies state record tokens accurately', () => {
        const schema = defineSchema(['enabled', 'checked'] as const)
        const def = createStyleDefinition(schema)({
            'icon-color': {
                enabled: '#ffffff',
                checked: '#6750a4'
            }
        })

        const result = stringifyTokens('--mdc-checkbox')(def)

        expect(result.cssText).toContain(
            '--_enabled-icon-color: var(--mdc-checkbox-enabled-icon-color, #ffffff);'
        )
        expect(result.cssText).toContain(
            '--_checked-icon-color: var(--mdc-checkbox-checked-icon-color, #6750a4);'
        )
    })

    it('emits forwarded child component bridge variables', () => {
        const childSchema = defineSchema(['enabled', 'selected'] as const)
        const childDef = createStyleDefinition(childSchema)({
            'color': ['#000', '#111'],
            'size': '18px'
        })

        const parentSchema = defineSchema(['enabled', 'selected'] as const)
        const parentDef = createStyleDefinition(parentSchema)({
            'container-color': ['#6750a4', '#e8def8'],
            ...forwardTokens(childDef, {
                targetPrefix: '--mdc-icon',
                name: 'icon',
                tokens: {
                    'color': ['#ffffff', '#1d192b'],
                    'size': '20px'
                }
            })
        })

        const result = stringifyTokens('--mdc-button')(parentDef)

        // Parent definitions
        expect(result.cssText).toContain(
            '--_enabled-icon-color: var(--mdc-button-enabled-icon-color, #ffffff);'
        )
        expect(result.cssText).toContain(
            '--_icon-size: var(--mdc-button-icon-size, 20px);'
        )

        // Forwarded bridge definitions
        expect(result.cssText).toContain('--mdc-icon-color: var(--_enabled-icon-color);')
        expect(result.cssText).toContain('--mdc-icon-size: var(--_icon-size);')
    })

    it('wraps declarations inside a selector block when selector option is configured', () => {
        const schema = defineSchema(['enabled'] as const)
        const def = createStyleDefinition(schema)({
            'shape': '4px'
        })

        const result = stringifyTokens({
            prefix: '--mdc-card',
            selector: ':host'
        })(def)

        expect(result.cssText).toBe(':host {\n    --_shape: var(--mdc-card-shape, 4px);\n}')
    })

    it('suppresses public variables when includePublicVars is false', () => {
        const schema = defineSchema(['enabled', 'selected'] as const)
        const def = createStyleDefinition(schema)({
            'shape': '8px',
            'color': ['#fff', '#000']
        })

        const result = stringifyTokens({
            prefix: '--mdc-btn',
            includePublicVars: false
        })(def)

        expect(result.cssText).toContain('--_shape: 8px;')
        expect(result.cssText).toContain('--_enabled-color: #fff;')
        expect(result.cssText).toContain('--_selected-color: #000;')
        expect(result.cssText).not.toContain('var(--mdc-btn')
    })

    it('formats custom objects with ToCSSVariable and CSSResult values correctly', () => {
        const customColor = {
            ToCSSVariable: () => 'var(--mdc-color-primary)'
        }
        const cssResultVal = css`12px`

        const schema = defineSchema(['enabled'] as const)
        const def = createStyleDefinition(schema)({
            'color': customColor,
            'padding': cssResultVal
        })

        const result = stringifyTokens('--mdc-box')(def)

        expect(result.cssText).toContain('--_color: var(--mdc-box-color, var(--mdc-color-primary));')
        expect(result.cssText).toContain('--_padding: var(--mdc-box-padding, 12px);')
    })

    it('returns empty CSSResult on empty definition', () => {
        const schema = defineSchema(['enabled'] as const)
        const def = createStyleDefinition(schema)({})

        const result = stringifyTokens('--mdc-empty')(def)
        expect(result.cssText).toBe('')
    })

    it('can be directly interpolated within Lit css tagged templates', () => {
        const schema = defineSchema(['enabled'] as const)
        const def = createStyleDefinition(schema)({
            'height': '48px'
        })

        const tokenCss = stringifyTokens('--mdc-button')(def)
        const componentStyles = css`
            :host {
                ${tokenCss}
            }
        `

        expect(componentStyles).toBeInstanceOf(CSSResult)
        expect(componentStyles.cssText).toContain('--_height: var(--mdc-button-height, 48px);')
    })
})

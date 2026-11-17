/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { createStyleDefinition } from './create-style-definition'
import { stringifyTokens } from './stringify-tokens'

describe('stringifyTokens', () => {
    it('emits private vars with public override fallbacks by default', () => {
        const def = createStyleDefinition({
            thickness: '1px',
            color: { ToCSSVariable: () => 'var(--md-sys-color-outline)' },
        })

        const result = stringifyTokens('--mdc-divider')(def)
        expect(result.cssText).toContain('--_thickness: var(--mdc-divider-thickness, 1px);')
        expect(result.cssText).toContain('--_color: var(--mdc-divider-color, var(--md-sys-color-outline));')
    })

    it('normalizes prefix without leading -- or with trailing -', () => {
        const def = createStyleDefinition({ size: '24px' })
        const result = stringifyTokens('mdc-icon-')(def)
        expect(result.cssText).toContain('--_size: var(--mdc-icon-size, 24px);')
    })

    it('omits public vars when includePublicVars is false', () => {
        const def = createStyleDefinition({ size: '24px' })
        const result = stringifyTokens({ prefix: '--mdc-icon', includePublicVars: false })(def)
        expect(result.cssText).toContain('--_size: 24px;')
        expect(result.cssText).not.toContain('--mdc-icon-size')
    })

    it('wraps declarations in selector when provided', () => {
        const def = createStyleDefinition({ size: '24px' })
        const result = stringifyTokens({ prefix: '--mdc-icon', selector: ':host' })(def)
        expect(result.cssText).toMatch(/^:host\s*\{/)
        expect(result.cssText).toContain('--_size: var(--mdc-icon-size, 24px);')
    })

    it('throws on array token values (fail fast)', () => {
        const def = createStyleDefinition({
            invalid: ['1px', '2px'],
        })

        expect(() => stringifyTokens('--mdc-test')(def)).toThrow()
    })

    it('accepts a raw token record without a definition wrapper', () => {
        const result = stringifyTokens('--mdc-icon')({ size: '24px', color: 'red' })

        expect(result.cssText).toBe(
            '--_size: var(--mdc-icon-size, 24px);\n--_color: var(--mdc-icon-color, red);'
        )
    })

    it('reads tokens from a definition wrapper and ignores sibling keys', () => {
        const result = stringifyTokens('--mdc-icon')({
            tokens: { size: '24px' },
            flatTokenKeys: ['size'],
        })

        expect(result.cssText).toBe('--_size: var(--mdc-icon-size, 24px);')
    })

    it('returns empty CSS for null, non-object and empty definitions', () => {
        expect(stringifyTokens('--mdc-icon')(null as never).cssText).toBe('')
        expect(stringifyTokens('--mdc-icon')('nope' as never).cssText).toBe('')
        expect(stringifyTokens('--mdc-icon')({}).cssText).toBe('')
    })

    it('skips reserved definition keys and nullish tokens', () => {
        const result = stringifyTokens('--mdc-icon')({
            __brand: 'ResolvedStyleDefinition',
            schema: {},
            tokens: null,
            flatTokenKeys: [],
            forwardedBridges: [],
            size: '24px',
            color: null,
            height: undefined,
        })

        expect(result.cssText).toBe('--_size: var(--mdc-icon-size, 24px);')
    })

    it('strips leading hyphens from token keys', () => {
        const result = stringifyTokens('--mdc-icon')({ '--size': '24px' })

        expect(result.cssText).toBe('--_size: var(--mdc-icon-size, 24px);')
    })

    it('expands state records with and without public variables', () => {
        const record = { size: { enabled: '24px', hovered: null, pressed: '32px' } }

        expect(stringifyTokens('--mdc-icon')(record).cssText).toBe(
            '--_enabled-size: var(--mdc-icon-enabled-size, 24px);\n' +
                '--_pressed-size: var(--mdc-icon-pressed-size, 32px);'
        )

        expect(
            stringifyTokens({ prefix: '--mdc-icon', includePublicVars: false })(record).cssText,
        ).toBe('--_enabled-size: 24px;\n--_pressed-size: 32px;')
    })

    it('treats CSS results and providers as leaf values', () => {
        const provider = { ToCSSVariable: () => 'var(--md-sys-color-outline)' }
        const css = { cssText: 'var(--outline)' }
        const branded = { _$cssResult$: true, cssText: 'red' }

        const result = stringifyTokens('--mdc-icon')({
            provider,
            css,
            branded,
        })

        expect(result.cssText).toContain('--_provider: var(--mdc-icon-provider, var(--md-sys-color-outline));')
        expect(result.cssText).toContain('--_css: var(--mdc-icon-css, var(--outline));')
        expect(result.cssText).toContain('--_branded: var(--mdc-icon-branded, red);')
    })

    it('unwraps a rawVal leaf inside a state record', () => {
        const result = stringifyTokens('--mdc-icon')({
            size: { enabled: { rawVal: '24px' } },
        })

        expect(result.cssText).toBe('--_enabled-size: var(--mdc-icon-enabled-size, 24px);')
    })

    it('stringifies non-string cssText holders with String()', () => {
        const result = stringifyTokens('--mdc-icon')({ value: { cssText: 42 } })

        expect(result.cssText).toBe('--_value: var(--mdc-icon-value, [object Object]);')
    })

    it('treats a top-level rawVal carrier as a leaf', () => {
        const result = stringifyTokens('--mdc-icon')({ size: { rawVal: '24px' } })

        expect(result.cssText).toBe('--_size: var(--mdc-icon-size, 24px);')
    })

    it('emits bare custom properties for an empty prefix', () => {
        expect(stringifyTokens('')({ size: '24px' }).cssText).toBe(
            '--_size: var(--size, 24px);'
        )
        expect(stringifyTokens('--')({ size: '24px' }).cssText).toBe(
            '--_size: var(--size, 24px);'
        )
        expect(stringifyTokens({ prefix: '' })({ size: '24px' }).cssText).toBe(
            '--_size: var(--size, 24px);'
        )
    })

    it('rejects arrays nested inside state records', () => {
        expect(() =>
            stringifyTokens('--mdc-icon')({ size: { enabled: ['1px', '2px'] } })
        ).toThrow("[stringifyTokens] Token 'size' uses an array")

        expect(() =>
            stringifyTokens('--mdc-icon')({
                size: { enabled: { rawVal: ['1px', '2px'] } },
            })
        ).toThrow("[stringifyTokens] Token 'size' uses an array")
    })

    it('does not wrap declarations for a blank selector', () => {
        const result = stringifyTokens({ prefix: '--mdc-icon', selector: '   ' })({
            size: '24px',
        })

        expect(result.cssText).toBe('--_size: var(--mdc-icon-size, 24px);')
    })
})

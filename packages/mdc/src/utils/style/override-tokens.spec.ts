/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { overrideComponentTokens, overrideTokens, stringTokens } from './override-tokens'

describe('overrideTokens', () => {
    it('emits public override declarations', () => {
        const result = overrideTokens('--mdc-button')({
            'container-color': '#6200ee',
            'label-text-color': { ToCSSVariable: () => 'var(--md-sys-color-on-primary)' },
        })()

        expect(result.cssText).toContain('--mdc-button-container-color: #6200ee;')
        expect(result.cssText).toContain('--mdc-button-label-text-color: var(--md-sys-color-on-primary);')
    })

    it('wraps declarations in selector when provided', () => {
        const result = overrideTokens({ prefix: '--mdc-button', selector: ':host([variant="tonal"])' })({
            'container-color': 'red',
        })()

        expect(result.cssText).toMatch(/^:host\(\[variant="tonal"\]\)\s*\{/)
        expect(result.cssText).toContain('--mdc-button-container-color: red;')
    })

    it('skips null and undefined values', () => {
        const result = overrideTokens('--mdc-button')({
            a: '1px',
            b: null,
            c: undefined,
        })()

        expect(result.cssText).toContain('--mdc-button-a: 1px;')
        expect(result.cssText).not.toContain('--mdc-button-b')
        expect(result.cssText).not.toContain('--mdc-button-c')
    })

    it('returns empty CSS for null, non-object and empty token maps', () => {
        expect(overrideTokens('--mdc-button')(null as never)().cssText).toBe('')
        expect(overrideTokens('--mdc-button')('nope' as never)().cssText).toBe('')
        expect(overrideTokens('--mdc-button')({})().cssText).toBe('')
    })

    it('strips leading hyphens from token keys', () => {
        const result = overrideTokens('--mdc-button')({ '--container-color': 'red' })()

        expect(result.cssText).toBe('--mdc-button-container-color: red;')
    })

    it('skips values that format to an empty string', () => {
        const result = overrideTokens('--mdc-button')({
            empty: '',
            size: '24px',
        })()

        expect(result.cssText).toBe('--mdc-button-size: 24px;')
    })

    it('stringifies numbers, cssText holders and rawVal carriers', () => {
        const result = overrideTokens('--mdc-button')({
            height: 48,
            color: { cssText: 'red' },
            width: { rawVal: '24px' },
        })()

        expect(result.cssText).toBe(
            '--mdc-button-height: 48;\n' +
                '--mdc-button-color: red;\n' +
                '--mdc-button-width: 24px;'
        )
    })

    it('does not wrap declarations for a blank selector', () => {
        const result = overrideTokens({ prefix: '--mdc-button', selector: '   ' })({
            color: 'red',
        })()

        expect(result.cssText).toBe('--mdc-button-color: red;')
    })

    it('exposes compatibility helpers', () => {
        const direct = overrideTokens('--mdc-button')({ color: 'red' })()
        const component = overrideComponentTokens('--mdc-button', { color: 'red' })
        const passthrough = { anything: true }

        expect(component.cssText).toBe(direct.cssText)
        expect(stringTokens(passthrough)).toBe(passthrough)
    })

    it('emits bare custom properties for an empty prefix', () => {
        expect(overrideTokens('')({ color: 'red' })().cssText).toBe('--color: red;')
        expect(overrideTokens('--')({ color: 'red' })().cssText).toBe('--color: red;')
        expect(overrideTokens({ prefix: '' })({ color: 'red' })().cssText).toBe(
            '--color: red;'
        )
    })
})

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { overrideTokens } from './override-tokens'

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
})

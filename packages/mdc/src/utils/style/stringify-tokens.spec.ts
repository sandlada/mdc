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
})

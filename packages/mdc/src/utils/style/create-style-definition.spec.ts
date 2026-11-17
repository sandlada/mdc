/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { css } from 'lit'
import { createStyleDefinition } from './create-style-definition'

describe('createStyleDefinition', () => {
    it('returns a frozen definition with brand and flatTokenKeys', () => {
        const def = createStyleDefinition({
            thickness: '1px',
            color: '#fff',
        })

        expect(def.__brand).toBe('ResolvedStyleDefinition')
        expect(Object.isFrozen(def)).toBe(true)
        expect(Object.isFrozen(def.tokens)).toBe(true)
        expect(def.flatTokenKeys).toEqual(['thickness', 'color'])
        expect(def.tokens.thickness).toBe('1px')
        expect(def.tokens.color).toBe('#fff')
    })

    it('drops top-level null and undefined entries', () => {
        const def = createStyleDefinition({
            a: '1px',
            b: null,
            c: undefined,
        })

        expect(def.flatTokenKeys).toEqual(['a'])
        expect('b' in def.tokens).toBe(false)
        expect('c' in def.tokens).toBe(false)
    })

    it('cleans null/undefined entries inside plain record values and freezes them', () => {
        const def = createStyleDefinition({
            container: {
                color: '#000',
                opacity: null,
                width: undefined,
            },
        })

        expect(def.tokens.container).toEqual({ color: '#000' })
        expect(Object.isFrozen(def.tokens.container)).toBe(true)
    })

    it('freezes array values as-is', () => {
        const def = createStyleDefinition({
            list: ['a', 'b'],
        })

        expect(def.tokens.list).toEqual(['a', 'b'])
        expect(Object.isFrozen(def.tokens.list)).toBe(true)
    })

    it('preserves CSSResult and ToCSSVariableLike objects by identity', () => {
        const litCss = css`1px solid red`
        const tokenLike = { ToCSSVariable: () => 'var(--md-sys-color-primary)' }

        const def = createStyleDefinition({
            border: litCss,
            primary: tokenLike,
        })

        expect(def.tokens.border).toBe(litCss)
        expect(def.tokens.primary).toBe(tokenLike)
    })
})

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit'
import { describe, expect, it } from 'vitest'
import { FORWARDED_TOKEN_META } from './create-style-definition'
import { forwardTokens } from './forward-tokens'

describe('forwardTokens', () => {
    const mockIconDef = {
        flatTokenKeys: ['color', 'size', 'opacity']
    }

    it('generates namespaced token keys with default namespace derived from targetPrefix', () => {
        const result = forwardTokens(mockIconDef, {
            targetPrefix: '--mdc-icon',
            tokens: {
                color: '#ffffff',
                size: '24px'
            }
        })

        expect('icon-color' in result).toBe(true)
        expect('icon-size' in result).toBe(true)
    })

    it('derives clean namespace from various prefix patterns', () => {
        const res1 = forwardTokens({}, {
            targetPrefix: '--mdc-focus-ring',
            tokens: { width: '2px' }
        })
        expect('focus-ring-width' in res1).toBe(true)

        const res2 = forwardTokens({}, {
            targetPrefix: '--custom-widget',
            tokens: { height: '10px' }
        })
        expect('custom-widget-height' in res2).toBe(true)
    })

    it('respects explicit name override for custom parent namespace', () => {
        const result = forwardTokens(mockIconDef, {
            targetPrefix: '--mdc-icon',
            name: 'leading-icon',
            tokens: {
                color: '#ff0000',
                size: '18px'
            }
        })

        expect('leading-icon-color' in result).toBe(true)
        expect('leading-icon-size' in result).toBe(true)
    })

    it('embeds ForwardedTokenMeta on primitive token values', () => {
        const result = forwardTokens(mockIconDef, {
            targetPrefix: '--mdc-icon',
            tokens: {
                size: '20px'
            }
        })

        const wrapped = result['icon-size']
        expect(wrapped).toBeDefined()
        expect((wrapped as any)[FORWARDED_TOKEN_META]).toEqual({
            targetPrefix: '--mdc-icon',
            cleanKey: 'size',
            parentKey: 'icon-size',
            targetDefKeys: ['color', 'size', 'opacity']
        })
        expect(String(wrapped)).toBe('20px')
        expect((wrapped as any).valueOf()).toBe('20px')
    })

    it('embeds ForwardedTokenMeta on array / tuple token values', () => {
        const result = forwardTokens(mockIconDef, {
            targetPrefix: '--mdc-icon',
            tokens: {
                color: ['#ffffff', '#000000']
            }
        })

        const arr = result['icon-color']
        expect(Array.isArray(arr)).toBe(true)
        expect(arr).toEqual(['#ffffff', '#000000'])
        expect((arr as any)[FORWARDED_TOKEN_META]).toEqual({
            targetPrefix: '--mdc-icon',
            cleanKey: 'color',
            parentKey: 'icon-color',
            targetDefKeys: ['color', 'size', 'opacity']
        })
    })

    it('embeds ForwardedTokenMeta on state record token values', () => {
        const result = forwardTokens(mockIconDef, {
            targetPrefix: '--mdc-icon',
            tokens: {
                color: {
                    enabled: '#ffffff',
                    selected: '#000000'
                }
            }
        })

        const record = result['icon-color']
        expect(record).toEqual({
            enabled: '#ffffff',
            selected: '#000000'
        })
        expect((record as any)[FORWARDED_TOKEN_META]).toEqual({
            targetPrefix: '--mdc-icon',
            cleanKey: 'color',
            parentKey: 'icon-color',
            targetDefKeys: ['color', 'size', 'opacity']
        })
    })

    it('preserves prototype methods and instance properties on forwarded class instances with ToCSSVariable', () => {
        class ColorTokenWithPrototype {
            public readonly name: string
            constructor(name: string) {
                this.name = name
            }
            public ToCSSVariable(): string {
                return `var(--mdc-sys-color-${this.name})`
            }
        }

        const colorInstance = new ColorTokenWithPrototype('primary')
        const forwarded = forwardTokens(mockIconDef, {
            targetPrefix: '--mdc-icon',
            tokens: { color: colorInstance }
        })

        const forwardedColor = forwarded['icon-color']
        expect(typeof forwardedColor.ToCSSVariable).toBe('function')
        expect(forwardedColor.ToCSSVariable()).toBe('var(--mdc-sys-color-primary)')
        expect(forwardedColor.name).toBe('primary')
        expect(forwardedColor instanceof ColorTokenWithPrototype).toBe(true)
        expect((forwardedColor as any)[FORWARDED_TOKEN_META]).toEqual({
            targetPrefix: '--mdc-icon',
            cleanKey: 'color',
            parentKey: 'icon-color',
            targetDefKeys: ['color', 'size', 'opacity']
        })
    })

    it('preserves Lit CSSResult instances when forwarded', () => {
        const cssVal = css`24px`
        const forwarded = forwardTokens(mockIconDef, {
            targetPrefix: '--mdc-icon',
            tokens: { size: cssVal }
        })

        const forwardedSize = forwarded['icon-size']
        expect(forwardedSize.cssText).toBe('24px')
        expect((forwardedSize as any)[FORWARDED_TOKEN_META]).toEqual({
            targetPrefix: '--mdc-icon',
            cleanKey: 'size',
            parentKey: 'icon-size',
            targetDefKeys: ['color', 'size', 'opacity']
        })
    })

    it('cleans leading dashes on token keys if provided as CSS variable format', () => {
        const result = forwardTokens(mockIconDef, {
            targetPrefix: '--mdc-icon',
            tokens: {
                '--size': '18px'
            }
        })

        expect('icon-size' in result).toBe(true)
        expect((result['icon-size'] as any)[FORWARDED_TOKEN_META].cleanKey).toBe('size')
    })

    it('preserves metadata across standard JavaScript object spreading', () => {
        const forwarded = forwardTokens(mockIconDef, {
            targetPrefix: '--mdc-icon',
            tokens: {
                size: '18px',
                color: ['#fff', '#000']
            }
        })

        const parentSpread = {
            'container-color': '#6750a4',
            ...forwarded
        }

        expect((parentSpread as any)['icon-size'][FORWARDED_TOKEN_META]).toBeDefined()
        expect((parentSpread as any)['icon-color'][FORWARDED_TOKEN_META]).toBeDefined()
    })

    it('filters out null and undefined values in options.tokens', () => {
        const result = forwardTokens(mockIconDef, {
            targetPrefix: '--mdc-icon',
            tokens: {
                color: null,
                size: undefined,
                opacity: 1
            }
        })

        expect('icon-color' in result).toBe(false)
        expect('icon-size' in result).toBe(false)
        expect('icon-opacity' in result).toBe(true)
    })

    it('handles empty tokens object and invalid options gracefully', () => {
        expect(forwardTokens(mockIconDef, { targetPrefix: '--mdc-icon', tokens: {} })).toEqual({})
        expect(forwardTokens(mockIconDef, null as any)).toEqual({})
        expect(forwardTokens(mockIconDef, undefined as any)).toEqual({})
    })
})

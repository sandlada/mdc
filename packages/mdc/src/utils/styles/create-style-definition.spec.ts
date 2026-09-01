/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit'
import { describe, expect, it } from 'vitest'
import { createStyleDefinition } from './create-style-definition'
import { defineSchema } from './define-schema'
import { forwardTokens } from './forward-tokens'

describe('createStyleDefinition', () => {
    const TwoStateSchema = defineSchema(['enabled', 'selected'] as const)
    const FiveStateSchema = defineSchema(['enabled', 'hovered', 'pressed', 'focused', 'disabled'] as const)

    it('creates a resolved style definition with brand identity and schema reference', () => {
        const def = createStyleDefinition(TwoStateSchema)({
            'container-shape': '8px',
            'container-height': 40
        })

        expect(def.__brand).toBe('ResolvedStyleDefinition')
        expect(def.schema).toBe(TwoStateSchema)
        expect(def.tokens['container-shape']).toBe('8px')
        expect(def.tokens['container-height']).toBe(40)
        expect(def.flatTokenKeys).toEqual(['container-shape', 'container-height'])
        expect(Object.isFrozen(def)).toBe(true)
        expect(Object.isFrozen(def.tokens)).toBe(true)
        expect(Object.isFrozen(def.flatTokenKeys)).toBe(true)
    })

    it('throws when schema is not a valid StateSchema descriptor', () => {
        expect(() => createStyleDefinition(null as any)).toThrow(
            '[createStyleDefinition] A valid StateSchema created via defineSchema is required.'
        )
        expect(() => createStyleDefinition({ states: ['enabled'] } as any)).toThrow(
            '[createStyleDefinition] A valid StateSchema created via defineSchema is required.'
        )
    })

    it('handles static primitive token values, CSSResults, and custom objects', () => {
        const cssVal = css`12px`
        const mockColor = {
            ToCSSVariable: () => 'var(--mdc-sys-color-primary)'
        }

        const def = createStyleDefinition(TwoStateSchema)({
            'container-shape': '8px',
            'container-padding': cssVal,
            'container-color': mockColor
        })

        expect(def.tokens['container-shape']).toBe('8px')
        expect(def.tokens['container-padding']).toBe(cssVal)
        expect(def.tokens['container-color']).toBe(mockColor)
        expect(def.flatTokenKeys).toEqual(['container-shape', 'container-padding', 'container-color'])
    })

    it('normalizes multi-state tuple values matching schema dimension', () => {
        const def = createStyleDefinition(TwoStateSchema)({
            'container-color': ['#6750a4', '#e8def8'],
            'label-color': ['#ffffff', '#1d192b']
        })

        expect(def.tokens['container-color']).toEqual(['#6750a4', '#e8def8'])
        expect(def.tokens['label-color']).toEqual(['#ffffff', '#1d192b'])
        expect(Object.isFrozen(def.tokens['container-color'])).toBe(true)
    })

    it('normalizes 5-state interaction tuples for 5-state schemas', () => {
        const def = createStyleDefinition(FiveStateSchema)({
            'container-color': ['#6750a4', '#7965af', '#533d90', '#6750a4', '#1d1b201f']
        })

        expect(def.tokens['container-color']).toEqual([
            '#6750a4',
            '#7965af',
            '#533d90',
            '#6750a4',
            '#1d1b201f'
        ])
    })

    it('normalizes state records mapping state keys to values', () => {
        const def = createStyleDefinition(TwoStateSchema)({
            'icon-color': {
                enabled: '#ffffff',
                selected: '#1d192b'
            }
        })

        expect(def.tokens['icon-color']).toEqual({
            enabled: '#ffffff',
            selected: '#1d192b'
        })
        expect(Object.isFrozen(def.tokens['icon-color'])).toBe(true)
    })

    it('filters out null and undefined token entries from tokens and flatTokenKeys', () => {
        const def = createStyleDefinition(TwoStateSchema)({
            'container-shape': '8px',
            'outline-color': null,
            'border-width': undefined,
            'label-color': ['#ffffff', '#1d192b']
        } as any)

        expect(def.tokens['container-shape']).toBe('8px')
        expect(def.tokens['label-color']).toEqual(['#ffffff', '#1d192b'])
        expect('outline-color' in def.tokens).toBe(false)
        expect('border-width' in def.tokens).toBe(false)
        expect(def.flatTokenKeys).toEqual(['container-shape', 'label-color'])
    })

    it('filters out null and undefined values within state records', () => {
        const def = createStyleDefinition(TwoStateSchema)({
            'icon-color': {
                enabled: '#ffffff',
                selected: null as any,
                extra: undefined
            }
        })

        expect(def.tokens['icon-color']).toEqual({
            enabled: '#ffffff'
        })
    })

    it('extracts and normalizes forwarded bridge metadata from forwardTokens output', () => {
        const IconSchema = defineSchema(['enabled', 'selected'] as const)
        const IconDefinition = createStyleDefinition(IconSchema)({
            'color': ['#ffffff', '#000000'],
            'size': '18px'
        })

        const ButtonDefinition = createStyleDefinition(TwoStateSchema)({
            'container-color': ['#6750a4', '#e8def8'],
            ...forwardTokens(IconDefinition, {
                targetPrefix: '--mdc-icon',
                name: 'icon',
                tokens: {
                    'color': ['#ffffff', '#1d192b'],
                    'size': '18px'
                }
            })
        })

        // Primitive values must be unwrapped to raw primitives in tokens
        expect(ButtonDefinition.tokens['icon-size']).toBe('18px')
        expect(typeof ButtonDefinition.tokens['icon-size']).toBe('string')
        expect(ButtonDefinition.tokens['icon-color']).toEqual(['#ffffff', '#1d192b'])

        // Bridge metadata must be extracted into forwardedBridges
        expect(ButtonDefinition.forwardedBridges).toBeDefined()
        expect(ButtonDefinition.forwardedBridges?.['icon-size']).toEqual({
            targetPrefix: '--mdc-icon',
            cleanKey: 'size',
            parentKey: 'icon-size',
            targetDefKeys: ['color', 'size']
        })
        expect(ButtonDefinition.forwardedBridges?.['icon-color']).toEqual({
            targetPrefix: '--mdc-icon',
            cleanKey: 'color',
            parentKey: 'icon-color',
            targetDefKeys: ['color', 'size']
        })
    })

    it('handles multiple forwarded child components without metadata collision', () => {
        const IconDefinition = createStyleDefinition(TwoStateSchema)({ 'color': '#000' })
        const RippleDefinition = createStyleDefinition(TwoStateSchema)({ 'hover-color': '#111' })

        const ButtonDefinition = createStyleDefinition(TwoStateSchema)({
            'container-color': '#fff',
            ...forwardTokens(IconDefinition, {
                targetPrefix: '--mdc-icon',
                tokens: { 'color': '#aaa' }
            }),
            ...forwardTokens(RippleDefinition, {
                targetPrefix: '--mdc-ripple',
                name: 'ripple',
                tokens: { 'hover-color': '#bbb' }
            })
        })

        expect(ButtonDefinition.tokens['icon-color']).toBe('#aaa')
        expect(ButtonDefinition.tokens['ripple-hover-color']).toBe('#bbb')
        expect(ButtonDefinition.forwardedBridges?.['icon-color']?.targetPrefix).toBe('--mdc-icon')
        expect(ButtonDefinition.forwardedBridges?.['ripple-hover-color']?.targetPrefix).toBe('--mdc-ripple')
    })

    it('preserves prototype methods and reference identity of class instances forwarded via forwardTokens', () => {
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
        const IconSchema = defineSchema(['enabled', 'selected'] as const)
        const IconDefinition = createStyleDefinition(IconSchema)({
            'color': colorInstance
        })

        const ButtonDefinition = createStyleDefinition(TwoStateSchema)({
            'container-color': '#ffffff',
            ...forwardTokens(IconDefinition, {
                targetPrefix: '--mdc-icon',
                name: 'icon',
                tokens: {
                    'color': colorInstance
                }
            })
        })

        expect(ButtonDefinition.tokens['icon-color']).toBe(colorInstance)
        expect(typeof (ButtonDefinition.tokens['icon-color'] as any).ToCSSVariable).toBe('function')
        expect((ButtonDefinition.tokens['icon-color'] as any).ToCSSVariable()).toBe('var(--mdc-sys-color-primary)')
        expect(ButtonDefinition.forwardedBridges?.['icon-color']).toEqual({
            targetPrefix: '--mdc-icon',
            cleanKey: 'color',
            parentKey: 'icon-color',
            targetDefKeys: ['color']
        })
    })

    it('preserves exact Lit CSSResult instance identity when forwarded via forwardTokens', () => {
        const cssVal = css`24px`
        const IconSchema = defineSchema(['enabled', 'selected'] as const)
        const IconDefinition = createStyleDefinition(IconSchema)({
            'size': cssVal
        })

        const ButtonDefinition = createStyleDefinition(TwoStateSchema)({
            'container-color': '#ffffff',
            ...forwardTokens(IconDefinition, {
                targetPrefix: '--mdc-icon',
                name: 'icon',
                tokens: {
                    'size': cssVal
                }
            })
        })

        expect(ButtonDefinition.tokens['icon-size']).toBe(cssVal)
        expect(ButtonDefinition.forwardedBridges?.['icon-size']).toEqual({
            targetPrefix: '--mdc-icon',
            cleanKey: 'size',
            parentKey: 'icon-size',
            targetDefKeys: ['size']
        })
    })

    it('preserves prototype methods on class instances within forwarded state tuples and state records', () => {
        class ColorTokenWithPrototype {
            public readonly name: string
            constructor(name: string) {
                this.name = name
            }
            public ToCSSVariable(): string {
                return `var(--mdc-sys-color-${this.name})`
            }
        }

        const color1 = new ColorTokenWithPrototype('primary')
        const color2 = new ColorTokenWithPrototype('secondary')

        const ButtonDefinition = createStyleDefinition(TwoStateSchema)({
            ...forwardTokens({}, {
                targetPrefix: '--mdc-icon',
                name: 'icon',
                tokens: {
                    'tuple-color': [color1, color2],
                    'record-color': { enabled: color1, selected: color2 }
                }
            })
        })

        expect((ButtonDefinition.tokens['icon-tuple-color'] as any)[0]).toBe(color1)
        expect((ButtonDefinition.tokens['icon-tuple-color'] as any)[0].ToCSSVariable()).toBe('var(--mdc-sys-color-primary)')
        expect((ButtonDefinition.tokens['icon-record-color'] as any).enabled).toBe(color1)
        expect((ButtonDefinition.tokens['icon-record-color'] as any).enabled.ToCSSVariable()).toBe('var(--mdc-sys-color-primary)')
    })

    it('handles empty tokens object cleanly', () => {
        const def = createStyleDefinition(TwoStateSchema)({})

        expect(def.__brand).toBe('ResolvedStyleDefinition')
        expect(def.tokens).toEqual({})
        expect(def.flatTokenKeys).toEqual([])
        expect(def.forwardedBridges).toBeUndefined()
    })

    it('handles null/undefined tokens record safely', () => {
        const def = createStyleDefinition(TwoStateSchema)(null as any)

        expect(def.__brand).toBe('ResolvedStyleDefinition')
        expect(def.tokens).toEqual({})
        expect(def.flatTokenKeys).toEqual([])
    })
})

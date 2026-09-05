/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { css } from 'lit'
import { Shape } from '@sandlada/mdk'
import { expandShape } from './expand-shape'
import { defineSchema } from './define-schema'
import { createStyleDefinition } from './create-style-definition'
import { pipe } from './pipe'

describe('expandShape', () => {
    describe('Functional & Currying Behavior', () => {
        it('returns a curried transformer function upon receiving prefix', () => {
            const expand = expandShape('container')
            expect(typeof expand).toBe('function')
        })

        it('is pure, immutable, and reusable across multiple calls', () => {
            const expand = expandShape('container')
            const res1 = expand('8px')
            const res2 = expand('16px')

            expect(res1['container-shape-start-start']).toBe('8px')
            expect(res2['container-shape-start-start']).toBe('16px')
            expect(res1).not.toBe(res2)
        })

        it('composes cleanly with pipe', () => {
            const transform = (val: string) => pipe(
                val,
                expandShape('container')
            )
            const res = transform('12px')
            expect(res).toEqual({
                'container-shape-start-start': '12px',
                'container-shape-start-end'  : '12px',
                'container-shape-end-start'  : '12px',
                'container-shape-end-end'    : '12px'
            })
        })
    })

    describe('Single Scalar Values', () => {
        it('expands string dimension values across 4 logical corners', () => {
            const res = expandShape('container')('8px')
            expect(res).toEqual({
                'container-shape-start-start': '8px',
                'container-shape-start-end'  : '8px',
                'container-shape-end-start'  : '8px',
                'container-shape-end-end'    : '8px'
            })
        })

        it('expands number values across 4 logical corners', () => {
            const res = expandShape('container')(0)
            expect(res).toEqual({
                'container-shape-start-start': 0,
                'container-shape-start-end'  : 0,
                'container-shape-end-start'  : 0,
                'container-shape-end-end'    : 0
            })
        })

        it('expands MDK Shape enum instances preserving ToCSSVariable', () => {
            const res = expandShape('container')(Shape.Full)
            expect(res['container-shape-start-start']).toBe(Shape.Full)
            expect(res['container-shape-start-end']).toBe(Shape.Full)
            expect(res['container-shape-end-start']).toBe(Shape.Full)
            expect(res['container-shape-end-end']).toBe(Shape.Full)
            expect(typeof res['container-shape-start-start'].ToCSSVariable).toBe('function')
        })

        it('expands Lit CSSResult objects', () => {
            const customResult = css`var(--custom-radius)`
            const res = expandShape('container')(customResult)
            expect(res['container-shape-start-start']).toBe(customResult)
            expect(res['container-shape-end-end']).toBe(customResult)
        })
    })

    describe('Prefix Normalization', () => {
        it('appends -shape when prefix lacks shape suffix', () => {
            const res = expandShape('container')('4px')
            expect(Object.keys(res)).toEqual([
                'container-shape-start-start',
                'container-shape-start-end',
                'container-shape-end-start',
                'container-shape-end-end'
            ])
        })

        it('normalizes prefix ending in -shape without creating duplicate -shape-shape-', () => {
            const res = expandShape('container-shape')('4px')
            expect(Object.keys(res)).toEqual([
                'container-shape-start-start',
                'container-shape-start-end',
                'container-shape-end-start',
                'container-shape-end-end'
            ])
        })

        it('handles prefix equal to shape', () => {
            const res = expandShape('shape')('4px')
            expect(Object.keys(res)).toEqual([
                'shape-start-start',
                'shape-start-end',
                'shape-end-start',
                'shape-end-end'
            ])
        })

        it('strips leading -- and trailing hyphens from prefix', () => {
            const res1 = expandShape('--container')('4px')
            expect(res1['container-shape-start-start']).toBe('4px')

            const res2 = expandShape('--container-shape-')('4px')
            expect(res2['container-shape-start-start']).toBe('4px')
        })

        it('handles multi-segment prefixes', () => {
            const res = expandShape('extra-small-container')(Shape.Small)
            expect(Object.keys(res)).toEqual([
                'extra-small-container-shape-start-start',
                'extra-small-container-shape-start-end',
                'extra-small-container-shape-end-start',
                'extra-small-container-shape-end-end'
            ])
        })
    })

    describe('Corner Objects (Asymmetric Corners)', () => {
        it('expands full camelCase corner object', () => {
            const res = expandShape('card')({
                startStart: '4px',
                startEnd  : '8px',
                endStart  : '12px',
                endEnd    : '16px'
            })
            expect(res).toEqual({
                'card-shape-start-start': '4px',
                'card-shape-start-end'  : '8px',
                'card-shape-end-start'  : '12px',
                'card-shape-end-end'    : '16px'
            })
        })

        it('expands full kebab-case corner object', () => {
            const res = expandShape('card')({
                'start-start': '4px',
                'start-end'  : '8px',
                'end-start'  : '12px',
                'end-end'    : '16px'
            })
            expect(res).toEqual({
                'card-shape-start-start': '4px',
                'card-shape-start-end'  : '8px',
                'card-shape-end-start'  : '12px',
                'card-shape-end-end'    : '16px'
            })
        })

        it('expands partial corner object, omitting unspecified corners', () => {
            const res = expandShape('tab')({
                startStart: '12px',
                startEnd  : '12px'
            })
            expect(res).toEqual({
                'tab-shape-start-start': '12px',
                'tab-shape-start-end'  : '12px'
            })
            expect(res['tab-shape-end-start']).toBeUndefined()
            expect(res['tab-shape-end-end']).toBeUndefined()
        })

        it('supports Shape enums inside corner objects', () => {
            const res = expandShape('container')({
                startStart: Shape.Small,
                endEnd    : Shape.Large
            })
            expect(res['container-shape-start-start']).toBe(Shape.Small)
            expect(res['container-shape-end-end']).toBe(Shape.Large)
        })

        it('supports multi-state tuples inside corner objects', () => {
            const res = expandShape('container')({
                startStart: ['4px', '8px'],
                endEnd    : ['0px', '4px']
            })
            expect(res['container-shape-start-start']).toEqual(['4px', '8px'])
            expect(res['container-shape-end-end']).toEqual(['0px', '4px'])
        })
    })

    describe('Multi-State Tuples (State Array Transposition)', () => {
        it('transposes state array across all 4 logical corners', () => {
            const res = expandShape('container')(['8px', '16px'])
            expect(res).toEqual({
                'container-shape-start-start': ['8px', '16px'],
                'container-shape-start-end'  : ['8px', '16px'],
                'container-shape-end-start'  : ['8px', '16px'],
                'container-shape-end-end'    : ['8px', '16px']
            })
        })

        it('transposes Shape enum tuples across all 4 corners', () => {
            const res = expandShape('container')([Shape.Small, Shape.Medium, Shape.Large])
            expect(res['container-shape-start-start']).toEqual([Shape.Small, Shape.Medium, Shape.Large])
            expect(res['container-shape-end-end']).toEqual([Shape.Small, Shape.Medium, Shape.Large])
        })
    })

    describe('Multi-State Records (State Record Transposition)', () => {
        it('transposes state record across all 4 logical corners', () => {
            const res = expandShape('container')({
                enabled: '8px',
                hovered: '12px',
                pressed: '4px'
            })
            expect(res).toEqual({
                'container-shape-start-start': { enabled: '8px', hovered: '12px', pressed: '4px' },
                'container-shape-start-end'  : { enabled: '8px', hovered: '12px', pressed: '4px' },
                'container-shape-end-start'  : { enabled: '8px', hovered: '12px', pressed: '4px' },
                'container-shape-end-end'    : { enabled: '8px', hovered: '12px', pressed: '4px' }
            })
        })

        it('filters null and undefined values in state record', () => {
            const res = expandShape('container')({
                enabled : '8px',
                disabled: undefined,
                hovered : '12px'
            })
            expect(res['container-shape-start-start']).toEqual({
                enabled: '8px',
                hovered: '12px'
            })
        })
    })

    describe('Error Handling & Boundary Assertions', () => {
        it('throws error for invalid prefix types or empty prefix', () => {
            expect(() => expandShape('' as any)).toThrow('[expandShape] Prefix must be a non-empty string.')
            expect(() => expandShape('   ' as any)).toThrow('[expandShape] Prefix must be a non-empty string.')
            expect(() => expandShape(null as any)).toThrow('[expandShape] Prefix must be a non-empty string.')
            expect(() => expandShape(undefined as any)).toThrow('[expandShape] Prefix must be a non-empty string.')
            expect(() => expandShape(123 as any)).toThrow('[expandShape] Prefix must be a non-empty string.')
            expect(() => expandShape('--' as any)).toThrow('[expandShape] Prefix must be a non-empty string.')
            expect(() => expandShape('-' as any)).toThrow('[expandShape] Prefix must be a non-empty string.')
        })

        it('throws error for invalid shape values', () => {
            const expand = expandShape('container')
            expect(() => expand(null as any)).toThrow('[expandShape] Invalid shape value provided.')
            expect(() => expand(undefined as any)).toThrow('[expandShape] Invalid shape value provided.')
            expect(() => expand('' as any)).toThrow('[expandShape] Invalid shape value provided.')
            expect(() => expand('   ' as any)).toThrow('[expandShape] Invalid shape value provided.')
            expect(() => expand(Number.NaN as any)).toThrow('[expandShape] Invalid shape value provided.')
            expect(() => expand([] as any)).toThrow('[expandShape] Invalid shape value provided.')
            expect(() => expand({} as any)).toThrow('[expandShape] Invalid shape value provided.')
            expect(() => expand({ startStart: undefined, endEnd: null } as any)).toThrow('[expandShape] Invalid shape value provided.')
            expect(() => expand(true as any)).toThrow('[expandShape] Invalid shape value provided.')
            expect(() => expand((() => {}) as any)).toThrow('[expandShape] Invalid shape value provided.')
            expect(() => expand(Symbol('invalid') as any)).toThrow('[expandShape] Invalid shape value provided.')
        })
    })

    describe('Integration with createStyleDefinition', () => {
        it('spreads directly into createStyleDefinition with single scalar', () => {
            const schema = defineSchema(['enabled', 'selected'] as const)
            const definition = createStyleDefinition(schema)({
                ...expandShape('container')(Shape.Full)
            })

            const tokens = definition.tokens as Record<string, any>
            expect(tokens['container-shape-start-start']).toBe(Shape.Full)
            expect(tokens['container-shape-start-end']).toBe(Shape.Full)
            expect(tokens['container-shape-end-start']).toBe(Shape.Full)
            expect(tokens['container-shape-end-end']).toBe(Shape.Full)
            expect(definition.flatTokenKeys).toContain('container-shape-start-start')
        })

        it('spreads directly into createStyleDefinition with state tuples', () => {
            const schema = defineSchema(['enabled', 'selected'] as const)
            const definition = createStyleDefinition(schema)({
                ...expandShape('container')(['8px', '16px'])
            })

            const tokens = definition.tokens as Record<string, any>
            expect(tokens['container-shape-start-start']).toEqual(['8px', '16px'])
            expect(tokens['container-shape-end-end']).toEqual(['8px', '16px'])
        })
    })
})

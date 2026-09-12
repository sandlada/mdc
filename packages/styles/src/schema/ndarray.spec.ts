/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Black-box specification suite for n-dimensional positional token values.
 *
 * Shape contract (positional, schema dimension order, singletons omitted):
 * - rank 0: primitives only.
 * - rank 1 (`An`, `A1*Bn`, `An*B1`): 1D arrays over the sole non-singleton
 *   dimension; `null` marks absent values.
 * - rank 2+ (`An*Bn`, higher-D): nested arrays mirroring the non-singleton
 *   dimension sizes; `cell[i][j][...]` addresses that combination.
 */

import { describe, expect, it } from 'vitest'
import { createStyleDefinition } from './create-style-definition'
import { defineSchema } from './define-schema'
import { stringifyTokens } from '../tokens/stringify-tokens'
import { extractStateTokenMetadata } from '../compiler/sheet/extract-state-token-metadata'
import { createStyleSheet } from '../compiler/sheet/create-style-sheet'
import { emptyTables, withState } from './triggers'
import { expandTypescale } from '../tokens/expand-typescale'

describe('ndarray positional values', () => {
    describe('rank 1 with singleton dimensions (A1*Bn)', () => {
        const DegenerateSchema = defineSchema([
            ['enabled'],
            ['small', 'medium', 'large']
        ] as const)

        it('maps a 1D tuple over the sole non-singleton dimension, skipping null', () => {
            const def = createStyleDefinition(DegenerateSchema)({
                'text-color': ['red', null, 'black']
            })

            expect(def.tokens['text-color']).toEqual(['red', null, 'black'])
            expect((def as any)['small-text-color']).toBe('red')
            expect('medium-text-color' in def).toBe(false)
            expect((def as any)['large-text-color']).toBe('black')
            expect('enabled-text-color' in def).toBe(false)
        })

        it('stringifies only non-null entries without singleton segments', () => {
            const def = createStyleDefinition(DegenerateSchema)({
                'text-color': ['red', null, 'black']
            })
            const sheet = stringifyTokens('--mdc-t')(def)

            expect(sheet.cssText).toContain('--_small-text-color: var(--mdc-t-small-text-color, red);')
            expect(sheet.cssText).toContain('--_large-text-color: var(--mdc-t-large-text-color, black);')
            expect(sheet.cssText).not.toContain('medium-text-color')
            expect(sheet.cssText).not.toContain('enabled-text-color')
        })

        it('metadata reports null entries as undefined states', () => {
            const def = createStyleDefinition(DegenerateSchema)({
                'text-color': ['red', null, 'black']
            })
            const meta = extractStateTokenMetadata(def)

            expect(meta.isStateToken('text-color')).toBe(true)
            expect(meta.hasStateToken('text-color', 'small')).toBe(true)
            expect(meta.hasStateToken('text-color', 'medium')).toBe(false)
            expect(meta.hasStateToken('text-color', 'large')).toBe(true)
        })
    })

    describe('rank 2 joint values (An*Bn)', () => {
        const TwoDimSchema = defineSchema([
            ['display', 'headline'],
            ['small', 'large']
        ] as const)

        it('expands a full 2D array to dimension-ordered combo properties', () => {
            const def = createStyleDefinition(TwoDimSchema)({
                'label-size': [
                    ['12px', '16px'],
                    ['14px', '18px']
                ]
            })

            expect((def as any)['display-small-label-size']).toBe('12px')
            expect((def as any)['display-large-label-size']).toBe('16px')
            expect((def as any)['headline-small-label-size']).toBe('14px')
            expect((def as any)['headline-large-label-size']).toBe('18px')
            expect('small-label-size' in def).toBe(false)
        })

        it('stringifies combo variables in dimension order', () => {
            const def = createStyleDefinition(TwoDimSchema)({
                'label-size': [
                    ['12px', '16px'],
                    ['14px', '18px']
                ]
            })
            const sheet = stringifyTokens('--mdc-t')(def)

            expect(sheet.cssText).toContain('--_display-small-label-size: var(--mdc-t-display-small-label-size, 12px);')
            expect(sheet.cssText).toContain('--_headline-large-label-size: var(--mdc-t-headline-large-label-size, 18px);')
        })

        it('keeps flat separable records working alongside joint arrays', () => {
            const def = createStyleDefinition(TwoDimSchema)({
                'opacity': { 'display': '1', 'headline': '0.9' },
                'label-size': [
                    ['12px', '16px'],
                    ['14px', '18px']
                ]
            })
            const meta = extractStateTokenMetadata(def)

            expect(meta.isComboToken('label-size')).toBe(true)
            expect(meta.isComboToken('opacity')).toBe(false)
            expect(meta.resolveComboVarName('label-size', ['headline', 'large'])).toBe('headline-large-label-size')
            expect(meta.resolveComboVarName('label-size', ['large', 'headline'])).toBe('headline-large-label-size')
        })

        it('resolves @state rewrites to combo variables per combination', () => {
            const def = createStyleDefinition(TwoDimSchema)({
                'label-size': [
                    ['12px', '16px'],
                    ['14px', '18px']
                ]
            })
            const tables = withState({
                'display': '.display',
                'headline': '.headline',
                'small': '.small',
                'large': '.large'
            })(emptyTables)
            const sheet = createStyleSheet({ tables })(def)`
                @state(label) label {
                    font-size: var(--_label-size);
                }
            `

            expect(sheet.cssText).toContain('label.display.small { font-size: var(--_display-small-label-size); }')
            expect(sheet.cssText).toContain('label.headline.large { font-size: var(--_headline-large-label-size); }')
            expect(sheet.cssText).not.toContain('var(--_label-size);')
        })

        it('treats null cells as absent and leaves the base variable untouched', () => {
            const def = createStyleDefinition(TwoDimSchema)({
                'label-size': [
                    ['12px', null],
                    ['14px', '18px']
                ]
            })
            const sheet = stringifyTokens('--mdc-t')(def)

            expect(sheet.cssText).not.toContain('display-large-label-size')
            const meta = extractStateTokenMetadata(def)
            expect(meta.resolveComboVarName('label-size', ['display', 'large'])).toBeUndefined()
            expect(meta.resolveComboVarName('label-size', ['display', 'small'])).toBe('display-small-label-size')
        })

        it('rejects flat 1D tuples once rank exceeds 1', () => {
            expect(() => createStyleDefinition(TwoDimSchema)({
                'label-size': ['12px', '16px', '14px', '18px']
            } as any)).toThrow('[createStyleDefinition]')
        })

        it('rejects ragged and mis-sized levels with the expected shape', () => {
            expect(() => createStyleDefinition(TwoDimSchema)({
                'label-size': [['12px'], ['14px', '18px', '20px']]
            } as any)).toThrow('[2][2]')
            expect(() => createStyleDefinition(TwoDimSchema)({
                'label-size': [['12px', '16px']]
            } as any)).toThrow('[2][2]')
        })

        it('rejects nested plain objects inside joint arrays', () => {
            expect(() => createStyleDefinition(TwoDimSchema)({
                'label-size': [[{ small: '12px' }, '16px'], ['14px', '18px']]
            } as any)).toThrow('only allowed at top level')
        })
    })

    describe('rank 3 joint values (typography topology)', () => {
        const TypographyLikeSchema = defineSchema([
            ['display', 'headline'],
            ['small', 'large'],
            ['regular', 'emphasized']
        ] as const)

        it('addresses cells as [role][size][emphasis] with dimension-ordered names', () => {
            const def = createStyleDefinition(TypographyLikeSchema)({
                'size': [
                    [['57px', '57px'], ['45px', '45px']],
                    [['32px', '32px'], ['28px', '28px']]
                ]
            })

            expect((def as any)['display-small-regular-size']).toBe('57px')
            expect((def as any)['display-small-emphasized-size']).toBe('57px')
            expect((def as any)['headline-large-emphasized-size']).toBe('28px')
            expect(Object.isFrozen(def.tokens['size'])).toBe(true)
            expect(Object.isFrozen((def.tokens['size'] as any)[0])).toBe(true)
        })

        it('marks every effective dimension active for joint tokens', () => {
            const def = createStyleDefinition(TypographyLikeSchema)({
                'size': [
                    [['57px', '57px'], ['45px', '45px']],
                    [['32px', '32px'], ['28px', '28px']]
                ]
            })
            const meta = extractStateTokenMetadata(def)

            expect(meta.getDefinedStates('size').has('display')).toBe(true)
            expect(meta.getDefinedStates('size').has('large')).toBe(true)
            expect(meta.getDefinedStates('size').has('emphasized')).toBe(true)
            expect(meta.resolveComboVarName('size', ['emphasized', 'large', 'headline'])).toBe('headline-large-emphasized-size')
        })
    })

    describe('rank 0 schemas', () => {
        it('rejects arrays when the schema holds a single combination', () => {
            const SingleComboSchema = defineSchema([['a'], ['b'], ['c']] as const)
            expect(() => createStyleDefinition(SingleComboSchema)({
                'color': ['red']
            } as any)).toThrow('single combination')
        })
    })

    describe('expandTypescale over joint arrays', () => {
        it('preserves nesting per property', () => {
            const result = expandTypescale('label')([
                [{ size: '12px', weight: 400 }, { size: '12px', weight: 700 }],
                [{ size: '14px', weight: 400 }, { size: '14px', weight: 700 }]
            ] as any)

            expect((result as any)['label-size']).toEqual([['12px', '12px'], ['14px', '14px']])
            expect((result as any)['label-weight']).toEqual([[400, 700], [400, 700]])
        })
    })
})

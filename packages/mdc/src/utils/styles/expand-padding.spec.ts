/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect } from 'vitest'
import { expandPadding } from './expand-padding'
import { defineSchema } from './define-schema'
import { createStyleDefinition } from './create-style-definition'

describe('expandPadding', () => {
    describe('Prefix Normalization', () => {
        it('normalizes standard prefix without trailing -padding', () => {
            const result = expandPadding('container')('16px')
            expect(result).toEqual({
                'container-padding-block-start': '16px',
                'container-padding-block-end': '16px',
                'container-padding-inline-start': '16px',
                'container-padding-inline-end': '16px'
            })
        })

        it('avoids duplicating -padding when prefix already ends with -padding', () => {
            const result = expandPadding('container-padding')('16px')
            expect(result).toEqual({
                'container-padding-block-start': '16px',
                'container-padding-block-end': '16px',
                'container-padding-inline-start': '16px',
                'container-padding-inline-end': '16px'
            })
        })

        it('handles standalone "padding" prefix', () => {
            const result = expandPadding('padding')('8px')
            expect(result).toEqual({
                'padding-block-start': '8px',
                'padding-block-end': '8px',
                'padding-inline-start': '8px',
                'padding-inline-end': '8px'
            })
        })

        it('trims whitespace and trailing hyphens from prefix', () => {
            const result = expandPadding('  extra-small-container-  ')('12px')
            expect(result).toEqual({
                'extra-small-container-padding-block-start': '12px',
                'extra-small-container-padding-block-end': '12px',
                'extra-small-container-padding-inline-start': '12px',
                'extra-small-container-padding-inline-end': '12px'
            })
        })
    })

    describe('Single Scalar Inputs', () => {
        it('expands string scalar to all 4 edges', () => {
            const result = expandPadding('container')('24px')
            expect(result['container-padding-block-start']).toBe('24px')
            expect(result['container-padding-block-end']).toBe('24px')
            expect(result['container-padding-inline-start']).toBe('24px')
            expect(result['container-padding-inline-end']).toBe('24px')
        })

        it('expands number scalar to all 4 edges', () => {
            const result = expandPadding('container')(16)
            expect(result).toEqual({
                'container-padding-block-start': 16,
                'container-padding-block-end': 16,
                'container-padding-inline-start': 16,
                'container-padding-inline-end': 16
            })
        })

        it('expands object with ToCSSVariable() method', () => {
            const mdkToken = { ToCSSVariable: () => 'var(--mdc-space-4)' }
            const result = expandPadding('container')(mdkToken)
            expect(result['container-padding-block-start']).toBe(mdkToken)
            expect(result['container-padding-inline-start']).toBe(mdkToken)
        })
    })

    describe('2-Axis Tuple Inputs [block, inline]', () => {
        it('expands [block, inline] to corresponding logical axis edges', () => {
            const result = expandPadding('container')(['8px', '16px'])
            expect(result).toEqual({
                'container-padding-block-start': '8px',
                'container-padding-block-end': '8px',
                'container-padding-inline-start': '16px',
                'container-padding-inline-end': '16px'
            })
        })

        it('expands numeric 2-axis tuple [0, 12]', () => {
            const result = expandPadding('container')([0, 12])
            expect(result).toEqual({
                'container-padding-block-start': 0,
                'container-padding-block-end': 0,
                'container-padding-inline-start': 12,
                'container-padding-inline-end': 12
            })
        })
    })

    describe('4-Edge Tuple Inputs [block-start, block-end, inline-start, inline-end]', () => {
        it('expands 4 distinct values to corresponding logical edges', () => {
            const result = expandPadding('container')(['4px', '8px', '12px', '16px'])
            expect(result).toEqual({
                'container-padding-block-start': '4px',
                'container-padding-block-end': '8px',
                'container-padding-inline-start': '12px',
                'container-padding-inline-end': '16px'
            })
        })
    })

    describe('Padding Object Inputs', () => {
        it('expands object with block and inline properties', () => {
            const result = expandPadding('container')({ block: '6px', inline: '18px' })
            expect(result).toEqual({
                'container-padding-block-start': '6px',
                'container-padding-block-end': '6px',
                'container-padding-inline-start': '18px',
                'container-padding-inline-end': '18px'
            })
        })

        it('expands object with explicit camelCase edge properties', () => {
            const result = expandPadding('container')({
                blockStart: '2px',
                blockEnd: '4px',
                inlineStart: '6px',
                inlineEnd: '8px'
            })
            expect(result).toEqual({
                'container-padding-block-start': '2px',
                'container-padding-block-end': '4px',
                'container-padding-inline-start': '6px',
                'container-padding-inline-end': '8px'
            })
        })

        it('expands object with explicit kebab-case edge properties', () => {
            const result = expandPadding('container')({
                'block-start': '10px',
                'block-end': '20px',
                'inline-start': '30px',
                'inline-end': '40px'
            })
            expect(result).toEqual({
                'container-padding-block-start': '10px',
                'container-padding-block-end': '20px',
                'container-padding-inline-start': '30px',
                'container-padding-inline-end': '40px'
            })
        })

        it('allows specific edge overrides on top of axis shorthands', () => {
            const result = expandPadding('container')({
                block: '8px',
                inline: '16px',
                inlineEnd: '24px'
            })
            expect(result).toEqual({
                'container-padding-block-start': '8px',
                'container-padding-block-end': '8px',
                'container-padding-inline-start': '16px',
                'container-padding-inline-end': '24px'
            })
        })

        it('supports "all" shorthand with individual overrides', () => {
            const result = expandPadding('container')({
                all: '16px',
                blockStart: '0px'
            })
            expect(result).toEqual({
                'container-padding-block-start': '0px',
                'container-padding-block-end': '16px',
                'container-padding-inline-start': '16px',
                'container-padding-inline-end': '16px'
            })
        })

        it('handles partial padding objects by omitting undefined edges', () => {
            const result = expandPadding('container')({ inline: '16px' })
            expect(result).toEqual({
                'container-padding-inline-start': '16px',
                'container-padding-inline-end': '16px'
            })
            expect(result['container-padding-block-start']).toBeUndefined()
        })
    })

    describe('Multi-State Inputs', () => {
        it('deconstructs multi-state array of 2-axis tuples across states', () => {
            const result = expandPadding('container')([
                ['0px', '12px'],
                ['0px', '16px'],
                ['0px', '24px']
            ])
            expect(result).toEqual({
                'container-padding-block-start': ['0px', '0px', '0px'],
                'container-padding-block-end': ['0px', '0px', '0px'],
                'container-padding-inline-start': ['12px', '16px', '24px'],
                'container-padding-inline-end': ['12px', '16px', '24px']
            })
        })

        it('deconstructs multi-state array of padding objects across states', () => {
            const result = expandPadding('container')([
                { block: '4px', inline: '8px' },
                { block: '8px', inline: '16px' }
            ])
            expect(result).toEqual({
                'container-padding-block-start': ['4px', '8px'],
                'container-padding-block-end': ['4px', '8px'],
                'container-padding-inline-start': ['8px', '16px'],
                'container-padding-inline-end': ['8px', '16px']
            })
        })

        it('deconstructs multi-state record of 2-axis tuples', () => {
            const result = expandPadding('container')({
                small: ['0px', '12px'],
                large: ['0px', '24px']
            })
            expect(result).toEqual({
                'container-padding-block-start': { small: '0px', large: '0px' },
                'container-padding-block-end': { small: '0px', large: '0px' },
                'container-padding-inline-start': { small: '12px', large: '24px' },
                'container-padding-inline-end': { small: '12px', large: '24px' }
            })
        })

        it('deconstructs multi-state record of scalar values', () => {
            const result = expandPadding('container')({
                enabled: '16px',
                disabled: '8px'
            })
            expect(result).toEqual({
                'container-padding-block-start': { enabled: '16px', disabled: '8px' },
                'container-padding-block-end': { enabled: '16px', disabled: '8px' },
                'container-padding-inline-start': { enabled: '16px', disabled: '8px' },
                'container-padding-inline-end': { enabled: '16px', disabled: '8px' }
            })
        })
    })

    describe('Error Assertions & Validation', () => {
        it('throws descriptive error on invalid or empty prefix', () => {
            expect(() => expandPadding('')('16px')).toThrow(
                '[expandPadding] Prefix must be a non-empty string.'
            )
            expect(() => expandPadding('   ')('16px')).toThrow(
                '[expandPadding] Prefix must be a non-empty string.'
            )
            expect(() => expandPadding(null as any)('16px')).toThrow(
                '[expandPadding] Prefix must be a non-empty string.'
            )
            expect(() => expandPadding(123 as any)('16px')).toThrow(
                '[expandPadding] Prefix must be a non-empty string.'
            )
        })

        it('throws descriptive error on null or undefined padding value', () => {
            expect(() => expandPadding('container')(null as any)).toThrow(
                '[expandPadding] Padding value cannot be null or undefined.'
            )
            expect(() => expandPadding('container')(undefined as any)).toThrow(
                '[expandPadding] Padding value cannot be null or undefined.'
            )
        })

        it('throws descriptive error on array input with length other than 2 or 4', () => {
            expect(() => expandPadding('container')(['16px'] as any)).toThrow(
                '[expandPadding] Array input must have length 2 (axis [block, inline]) or 4 (edges [block-start, block-end, inline-start, inline-end]), got length 1.'
            )
            expect(() => expandPadding('container')(['8px', '16px', '24px'] as any)).toThrow(
                '[expandPadding] Array input must have length 2 (axis [block, inline]) or 4 (edges [block-start, block-end, inline-start, inline-end]), got length 3.'
            )
            expect(() => expandPadding('container')(['1px', '2px', '3px', '4px', '5px'] as any)).toThrow(
                '[expandPadding] Array input must have length 2 (axis [block, inline]) or 4 (edges [block-start, block-end, inline-start, inline-end]), got length 5.'
            )
        })

        it('throws descriptive error on empty object input', () => {
            expect(() => expandPadding('container')({})).toThrow(
                '[expandPadding] Padding object cannot be empty.'
            )
        })
    })

    describe('Functional Purity & Immutability', () => {
        it('returns frozen object results', () => {
            const result = expandPadding('container')('16px')
            expect(Object.isFrozen(result)).toBe(true)
        })

        it('freezes inner multi-state arrays and records', () => {
            const resultTuple = expandPadding('container')([['0px', '12px'], ['0px', '16px']])
            expect(Object.isFrozen(resultTuple['container-padding-inline-start'])).toBe(true)

            const resultRecord = expandPadding('container')({ small: '8px', large: '16px' })
            expect(Object.isFrozen(resultRecord['container-padding-inline-start'])).toBe(true)
        })

        it('supports curried partial application and reusability', () => {
            const expandContainer = expandPadding('container')
            const result1 = expandContainer('16px')
            const result2 = expandContainer(['8px', '24px'])

            expect(result1['container-padding-inline-start']).toBe('16px')
            expect(result2['container-padding-inline-start']).toBe('24px')
        })
    })

    describe('Integration with createStyleDefinition', () => {
        it('spreads directly into createStyleDefinition token records', () => {
            const Schema = defineSchema(['small', 'large'] as const)
            const ButtonDef = createStyleDefinition(Schema)({
                'container-color': '#6750a4',
                ...expandPadding('container')([
                    ['0px', '12px'],
                    ['0px', '16px']
                ])
            })

            const tokens = ButtonDef.tokens as Record<string, any>
            expect(tokens['container-padding-inline-start']).toEqual(['12px', '16px'])
            expect(tokens['container-padding-block-start']).toEqual(['0px', '0px'])
            expect(ButtonDef.flatTokenKeys).toContain('container-padding-inline-start')
            expect(ButtonDef.flatTokenKeys).toContain('container-padding-block-start')
        })
    })
})

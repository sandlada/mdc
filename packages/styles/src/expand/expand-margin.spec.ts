/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect } from 'vitest'
import { css } from 'lit'
import { expandMargin } from './expand-margin'
import { defineSchema } from '../define-schema'
import { createStyleDefinition } from '../create-style-definition'

describe('expandMargin', () => {
    describe('Prefix Normalization', () => {
        it('normalizes standard prefix without trailing -margin', () => {
            const result = expandMargin('container')('16px')
            expect(result).toEqual({
                'container-margin-block-start': '16px',
                'container-margin-block-end': '16px',
                'container-margin-inline-start': '16px',
                'container-margin-inline-end': '16px'
            })
        })

        it('avoids duplicating -margin when prefix already ends with -margin', () => {
            const result = expandMargin('container-margin')('16px')
            expect(result).toEqual({
                'container-margin-block-start': '16px',
                'container-margin-block-end': '16px',
                'container-margin-inline-start': '16px',
                'container-margin-inline-end': '16px'
            })
        })

        it('handles standalone "margin" prefix', () => {
            const result = expandMargin('margin')('8px')
            expect(result).toEqual({
                'margin-block-start': '8px',
                'margin-block-end': '8px',
                'margin-inline-start': '8px',
                'margin-inline-end': '8px'
            })
        })

        it('trims whitespace and trailing hyphens from prefix', () => {
            const result = expandMargin('  extra-small-container-  ')('12px')
            expect(result).toEqual({
                'extra-small-container-margin-block-start': '12px',
                'extra-small-container-margin-block-end': '12px',
                'extra-small-container-margin-inline-start': '12px',
                'extra-small-container-margin-inline-end': '12px'
            })
        })
    })

    describe('Single Scalar Inputs', () => {
        it('expands string scalar to all 4 edges', () => {
            const result = expandMargin('container')('24px')
            expect(result['container-margin-block-start']).toBe('24px')
            expect(result['container-margin-block-end']).toBe('24px')
            expect(result['container-margin-inline-start']).toBe('24px')
            expect(result['container-margin-inline-end']).toBe('24px')
        })

        it('expands numeric scalar to all 4 edges', () => {
            const result = expandMargin('container')(16)
            expect(result).toEqual({
                'container-margin-block-start': 16,
                'container-margin-block-end': 16,
                'container-margin-inline-start': 16,
                'container-margin-inline-end': 16
            })
        })

        it('preserves numeric 0 without converting to default or empty', () => {
            const result = expandMargin('container')(0)
            expect(result).toEqual({
                'container-margin-block-start': 0,
                'container-margin-block-end': 0,
                'container-margin-inline-start': 0,
                'container-margin-inline-end': 0
            })
        })

        it('supports CSSResult and CSSVariableProvider primitives', () => {
            const cssVal = css`12px`
            const resultCss = expandMargin('container')(cssVal)
            expect(resultCss['container-margin-block-start']).toBe(cssVal)

            const provider = { ToCSSVariable: () => 'var(--custom-margin)' }
            const resultProvider = expandMargin('container')(provider)
            expect(resultProvider['container-margin-inline-start']).toBe(provider)
        })
    })

    describe('2-Axis Tuple Inputs', () => {
        it('expands [block, inline] to 4 edges', () => {
            const result = expandMargin('container')(['8px', '16px'] as const)
            expect(result).toEqual({
                'container-margin-block-start': '8px',
                'container-margin-block-end': '8px',
                'container-margin-inline-start': '16px',
                'container-margin-inline-end': '16px'
            })
        })

        it('preserves numeric 0 in 2-axis tuple', () => {
            const result = expandMargin('container')([0, 0] as const)
            expect(result).toEqual({
                'container-margin-block-start': 0,
                'container-margin-block-end': 0,
                'container-margin-inline-start': 0,
                'container-margin-inline-end': 0
            })
        })
    })

    describe('4-Edge Tuple Inputs', () => {
        it('expands [block-start, block-end, inline-start, inline-end]', () => {
            const result = expandMargin('container')(['4px', '8px', '12px', '16px'] as const)
            expect(result).toEqual({
                'container-margin-block-start': '4px',
                'container-margin-block-end': '8px',
                'container-margin-inline-start': '12px',
                'container-margin-inline-end': '16px'
            })
        })

        it('preserves numeric 0 in 4-edge tuple', () => {
            const result = expandMargin('container')([0, 0, 0, 0] as const)
            expect(result).toEqual({
                'container-margin-block-start': 0,
                'container-margin-block-end': 0,
                'container-margin-inline-start': 0,
                'container-margin-inline-end': 0
            })
        })
    })

    describe('Margin Object Inputs', () => {
        it('handles all shorthand', () => {
            const result = expandMargin('container')({ all: '10px' })
            expect(result).toEqual({
                'container-margin-block-start': '10px',
                'container-margin-block-end': '10px',
                'container-margin-inline-start': '10px',
                'container-margin-inline-end': '10px'
            })
        })

        it('handles block/inline shorthands', () => {
            const result = expandMargin('container')({ block: '6px', inline: '14px' })
            expect(result).toEqual({
                'container-margin-block-start': '6px',
                'container-margin-block-end': '6px',
                'container-margin-inline-start': '14px',
                'container-margin-inline-end': '14px'
            })
        })

        it('preserves numeric 0 in margin object shorthands', () => {
            const result = expandMargin('container')({ block: 0, inline: 0 })
            expect(result).toEqual({
                'container-margin-block-start': 0,
                'container-margin-block-end': 0,
                'container-margin-inline-start': 0,
                'container-margin-inline-end': 0
            })
        })

        it('handles explicit camelCase edge properties', () => {
            const result = expandMargin('container')({
                blockStart: '2px',
                blockEnd: '4px',
                inlineStart: '6px',
                inlineEnd: '8px'
            })
            expect(result).toEqual({
                'container-margin-block-start': '2px',
                'container-margin-block-end': '4px',
                'container-margin-inline-start': '6px',
                'container-margin-inline-end': '8px'
            })
        })

        it('handles explicit kebab-case edge properties', () => {
            const result = expandMargin('container')({
                'block-start': '10px',
                'block-end': '20px',
                'inline-start': '30px',
                'inline-end': '40px'
            })
            expect(result).toEqual({
                'container-margin-block-start': '10px',
                'container-margin-block-end': '20px',
                'container-margin-inline-start': '30px',
                'container-margin-inline-end': '40px'
            })
        })

        it('allows overriding specific edges over axis shorthands', () => {
            const result = expandMargin('container')({
                block: '8px',
                inline: '16px',
                inlineStart: '24px'
            })
            expect(result).toEqual({
                'container-margin-block-start': '8px',
                'container-margin-block-end': '8px',
                'container-margin-inline-start': '24px',
                'container-margin-inline-end': '16px'
            })
        })
    })

    describe('Multi-State Inputs', () => {
        it('handles multi-state tuple of scalars', () => {
            const result = expandMargin('container')([
                ['4px', '8px'],
                ['8px', '16px']
            ] as const)
            expect(result).toEqual({
                'container-margin-block-start': ['4px', '8px'],
                'container-margin-block-end': ['4px', '8px'],
                'container-margin-inline-start': ['8px', '16px'],
                'container-margin-inline-end': ['8px', '16px']
            })
        })

        it('handles multi-state array of margin objects', () => {
            const result = expandMargin('container')([
                { block: '4px', inline: '8px' },
                { block: '8px', inline: '16px' }
            ])
            expect(result).toEqual({
                'container-margin-block-start': ['4px', '8px'],
                'container-margin-block-end': ['4px', '8px'],
                'container-margin-inline-start': ['8px', '16px'],
                'container-margin-inline-end': ['8px', '16px']
            })
        })

        it('handles multi-state record with numeric 0', () => {
            const result = expandMargin('container')({
                enabled: 0,
                disabled: '16px'
            })
            expect(result).toEqual({
                'container-margin-block-start': { enabled: 0, disabled: '16px' },
                'container-margin-block-end': { enabled: 0, disabled: '16px' },
                'container-margin-inline-start': { enabled: 0, disabled: '16px' },
                'container-margin-inline-end': { enabled: 0, disabled: '16px' }
            })
        })

        it('handles multi-state record', () => {
            const result = expandMargin('container')({
                default: '8px',
                hover: ['12px', '16px']
            })
            expect(result).toEqual({
                'container-margin-block-start': { default: '8px', hover: '12px' },
                'container-margin-block-end': { default: '8px', hover: '12px' },
                'container-margin-inline-start': { default: '8px', hover: '16px' },
                'container-margin-inline-end': { default: '8px', hover: '16px' }
            })
        })
    })

    describe('Error Handling & Immutability', () => {
        it('throws on empty prefix', () => {
            expect(() => expandMargin('')('10px')).toThrow('[expandMargin] Prefix must be a non-empty string.')
            expect(() => expandMargin('   ')('10px')).toThrow('[expandMargin] Prefix must be a non-empty string.')
        })

        it('throws on null or undefined margin input', () => {
            expect(() => expandMargin('container')(null as any)).toThrow('[expandMargin] Margin value cannot be null or undefined.')
            expect(() => expandMargin('container')(undefined as any)).toThrow('[expandMargin] Margin value cannot be null or undefined.')
        })

        it('throws on empty margin object', () => {
            expect(() => expandMargin('container')({})).toThrow('[expandMargin] Margin object cannot be empty.')
        })

        it('throws on invalid array length', () => {
            expect(() => expandMargin('container')(['1px'] as any)).toThrow('[expandMargin] Array input must have length 2')
            expect(() => expandMargin('container')(['1px', '2px', '3px'] as any)).toThrow('[expandMargin] Array input must have length 2')
        })

        it('returns frozen object', () => {
            const result = expandMargin('container')('16px')
            expect(Object.isFrozen(result)).toBe(true)
        })

        it('freezes multi-state array result values', () => {
            const result = expandMargin('container')([
                ['4px', '8px'],
                ['8px', '16px']
            ] as const)
            expect(Object.isFrozen(result)).toBe(true)
            expect(Object.isFrozen(result['container-margin-block-start'])).toBe(true)
        })
    })

    describe('Integration with Style Definition', () => {
        it('integrates seamlessly with defineSchema and createStyleDefinition', () => {
            const schema = defineSchema(['small', 'large'] as const)

            const definition = createStyleDefinition(schema)({
                ...expandMargin('container')([
                    ['8px', '16px'],
                    ['12px', '24px']
                ])
            })

            const tokens = definition.tokens as Record<string, any>
            expect(tokens['container-margin-block-start']).toEqual(['8px', '12px'])
            expect(tokens['container-margin-block-end']).toEqual(['8px', '12px'])
            expect(tokens['container-margin-inline-start']).toEqual(['16px', '24px'])
            expect(tokens['container-margin-inline-end']).toEqual(['16px', '24px'])
            expect(definition.flatTokenKeys).toContain('container-margin-block-start')
            expect(definition.flatTokenKeys).toContain('container-margin-inline-end')
        })
    })
})

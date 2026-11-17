/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { expandShape, type ExpandedShapeResult } from './expand-shape'

type Expect<T extends true> = T
type Equal<X, Y> =
    (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false

type KeysOf<T> = Extract<keyof T, string>

// Compile-time assertions: the inferred keys must never carry a leading hyphen.
type _EmptyPrefixKeys = Expect<
    Equal<
        KeysOf<ExpandedShapeResult<'', string>>,
        'shape-start-start' | 'shape-start-end' | 'shape-end-start' | 'shape-end-end'
    >
>
type _NamedPrefixKeys = Expect<
    Equal<
        KeysOf<ExpandedShapeResult<'container', string>>,
        | 'container-shape-start-start'
        | 'container-shape-start-end'
        | 'container-shape-end-start'
        | 'container-shape-end-end'
    >
>

describe('expandShape', () => {
    describe('prefix', () => {
        it('drops the prefix segment for an empty prefix', () => {
            const tokens = expandShape('')('8px')

            expect(Object.keys(tokens)).toEqual([
                'shape-start-start',
                'shape-start-end',
                'shape-end-start',
                'shape-end-end'
            ])
        })

        it('keeps the prefix segment for a named prefix', () => {
            const tokens = expandShape('container')('8px')

            expect(Object.keys(tokens)).toEqual([
                'container-shape-start-start',
                'container-shape-start-end',
                'container-shape-end-start',
                'container-shape-end-end'
            ])
        })

        it('does not duplicate the shape suffix', () => {
            const tokens = expandShape('container-shape')('8px')

            expect(Object.keys(tokens)).toEqual([
                'container-shape-start-start',
                'container-shape-start-end',
                'container-shape-end-start',
                'container-shape-end-end'
            ])
        })

        it('strips leading and trailing hyphens from the prefix', () => {
            const tokens = expandShape('--container--')('8px')

            expect(Object.keys(tokens)).toEqual([
                'container-shape-start-start',
                'container-shape-start-end',
                'container-shape-end-start',
                'container-shape-end-end'
            ])
        })

        it('rejects a non-string prefix', () => {
            expect(() => expandShape(123 as unknown as string)).toThrow(
                '[expandShape] Prefix must be a string.'
            )
        })
    })

    describe('value', () => {
        it('expands a scalar to all 4 corners', () => {
            expect(expandShape('container')('8px')).toEqual({
                'container-shape-start-start': '8px',
                'container-shape-start-end': '8px',
                'container-shape-end-start': '8px',
                'container-shape-end-end': '8px'
            })
        })

        it('expands a corner object with per-corner overrides', () => {
            expect(
                expandShape('container')({
                    startStart: '4px',
                    'end-end': '16px'
                })
            ).toEqual({
                'container-shape-start-start': '4px',
                'container-shape-end-end': '16px'
            })
        })

        it('expands a multi-state tuple', () => {
            const tokens = expandShape('container')(['8px', '12px'])

            expect(tokens['container-shape-start-start']).toEqual(['8px', '12px'])
        })

        it('rejects an empty value', () => {
            expect(() => expandShape('container')('')).toThrow(
                '[expandShape] Invalid shape value provided.'
            )
            expect(() => expandShape('container')([])).toThrow(
                '[expandShape] Invalid shape value provided.'
            )
            expect(() => expandShape('container')({})).toThrow(
                '[expandShape] Invalid shape value provided.'
            )
        })
    })

    describe('scalars', () => {
        it('expands numeric scalars including zero and negatives', () => {
            for (const value of [0, -4, 12]) {
                expect(expandShape('container')(value)).toEqual({
                    'container-shape-start-start': value,
                    'container-shape-start-end': value,
                    'container-shape-end-start': value,
                    'container-shape-end-end': value
                })
            }
        })

        it('rejects NaN', () => {
            expect(() => expandShape('container')(Number.NaN)).toThrow(
                '[expandShape] Invalid shape value provided.'
            )
        })

        it('rejects blank strings but keeps non-blank strings verbatim', () => {
            expect(() => expandShape('container')('   ')).toThrow(
                '[expandShape] Invalid shape value provided.'
            )
            expect(expandShape('container')(' 8px ')['container-shape-start-start']).toBe(' 8px ')
        })

        it('keeps providers and CSS results by identity', () => {
            const provider = { ToCSSVariable: () => 'var(--md-sys-shape-full)' }
            const result = { cssText: '50%' }

            for (const input of [provider, result]) {
                const tokens = expandShape('container')(input) as Record<string, unknown>
                for (const value of Object.values(tokens)) {
                    expect(value).toBe(input)
                }
            }
        })
    })

    describe('state tuples', () => {
        it('copies and freezes the tuple for every corner', () => {
            const input = ['8px', '12px']
            const tokens = expandShape('container')(input)

            for (const value of Object.values(tokens)) {
                expect(value).toEqual(input)
                expect(value).not.toBe(input)
                expect(Object.isFrozen(value)).toBe(true)
            }

            input.push('16px')
            expect(tokens['container-shape-start-start']).toEqual(['8px', '12px'])
        })

        it('shares one tuple instance across the four corners', () => {
            const tokens = expandShape('container')(['8px', '12px']) as Record<string, unknown>

            expect(tokens['container-shape-start-start']).toBe(tokens['container-shape-end-end'])
        })
    })

    describe('corner objects', () => {
        it('accepts kebab-case corner keys', () => {
            expect(
                expandShape('container')({
                    'start-end': '4px',
                    'end-start': '8px'
                })
            ).toEqual({
                'container-shape-start-end': '4px',
                'container-shape-end-start': '8px'
            })
        })

        it('prefers kebab-case over camelCase for the same corner', () => {
            expect(
                expandShape('container')({
                    'start-start': '4px',
                    startStart: '8px'
                })
            ).toEqual({
                'container-shape-start-start': '4px'
            })
        })

        it('skips null, undefined and blank corners', () => {
            expect(
                expandShape('container')({
                    startStart: null,
                    startEnd: undefined,
                    endStart: '   ',
                    endEnd: '8px'
                } as never)
            ).toEqual({
                'container-shape-end-end': '8px'
            })
        })

        it('rejects a corner object with no usable corner', () => {
            expect(() =>
                expandShape('container')({ startStart: null, startEnd: '   ' } as never)
            ).toThrow('[expandShape] Invalid shape value provided.')
        })

        it('copies and freezes array and plain-object corner values', () => {
            const arrayValue = ['8px', '12px']
            const objectValue = { enabled: '8px' }
            const tokens = expandShape('container')({
                startStart: arrayValue,
                startEnd: objectValue
            })

            const start = tokens['container-shape-start-start'] as readonly string[]
            const end = tokens['container-shape-start-end'] as Record<string, string>

            expect(start).toEqual(arrayValue)
            expect(start).not.toBe(arrayValue)
            expect(Object.isFrozen(start)).toBe(true)
            expect(end).toEqual(objectValue)
            expect(end).not.toBe(objectValue)
            expect(Object.isFrozen(end)).toBe(true)
        })

        it('keeps provider and CSS result corner values by identity', () => {
            const provider = { ToCSSVariable: () => 'var(--md-sys-shape-full)' }
            const result = { cssText: '50%' }
            const tokens = expandShape('container')({
                startStart: provider,
                startEnd: result
            })

            expect(tokens['container-shape-start-start']).toBe(provider)
            expect(tokens['container-shape-start-end']).toBe(result)
        })
    })

    describe('state records', () => {
        it('cleans nullish and blank states and shares one frozen record', () => {
            const tokens = expandShape('container')({
                enabled: '8px',
                hovered: null,
                pressed: undefined,
                focused: '   ',
                dragged: '12px'
            })

            const expected = { enabled: '8px', dragged: '12px' }
            for (const value of Object.values(tokens)) {
                expect(value).toEqual(expected)
                expect(value).toBe(tokens['container-shape-start-start'])
                expect(Object.isFrozen(value)).toBe(true)
            }
        })

        it('copies and freezes array and plain-object state values', () => {
            const arrayValue = ['8px', '12px']
            const objectValue = { nested: '8px' }
            const tokens = expandShape('container')({
                enabled: arrayValue,
                hovered: objectValue
            } as never)

            const record = tokens['container-shape-start-start'] as Record<string, unknown>
            const enabled = record['enabled'] as readonly string[]
            const hovered = record['hovered'] as Record<string, string>

            expect(enabled).toEqual(arrayValue)
            expect(enabled).not.toBe(arrayValue)
            expect(Object.isFrozen(enabled)).toBe(true)
            expect(hovered).toEqual(objectValue)
            expect(hovered).not.toBe(objectValue)
            expect(Object.isFrozen(hovered)).toBe(true)

            arrayValue.push('16px')
            objectValue.nested = '16px'
            expect(enabled).toEqual(['8px', '12px'])
            expect(hovered).toEqual({ nested: '8px' })
        })

        it('rejects a state record with only nullish or blank states', () => {
            expect(() =>
                expandShape('container')({ enabled: null, hovered: '  ', pressed: undefined })
            ).toThrow('[expandShape] Invalid shape value provided.')
        })
    })

    describe('prefix normalization', () => {
        it('treats whitespace-only and bare shape prefixes as the shape base', () => {
            const expected = [
                'shape-start-start',
                'shape-start-end',
                'shape-end-start',
                'shape-end-end'
            ]

            expect(Object.keys(expandShape('   ')('8px'))).toEqual(expected)
            expect(Object.keys(expandShape('shape')('8px'))).toEqual(expected)
            expect(Object.keys(expandShape('--')('8px'))).toEqual(expected)
        })

        it.each([null, undefined, {}, 1])('rejects a non-string prefix %j', (prefix) => {
            expect(() => expandShape(prefix as unknown as string)).toThrow(
                '[expandShape] Prefix must be a string.'
            )
        })
    })

    describe('invalid inputs', () => {
        it.each([null, undefined, true, false, () => '8px'])(
            'rejects unsupported value %j',
            (value) => {
                expect(() => expandShape('container')(value as unknown as string)).toThrow(
                    '[expandShape] Invalid shape value provided.'
                )
            }
        )

        it('rejects class instances', () => {
            class Shape {
                public startStart = '8px'
            }

            expect(() => expandShape('container')(new Shape() as never)).toThrow(
                '[expandShape] Invalid shape value provided.'
            )
        })

        it('returns a frozen result', () => {
            expect(Object.isFrozen(expandShape('container')('8px'))).toBe(true)
        })
    })
})

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Space } from '@sandlada/mdk'
import { describe, expect, it } from 'vitest'
import { expandPadding, type ExpandedPaddingResult } from './expand-padding'

type Expect<T extends true> = T
type Equal<X, Y> =
    (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false

type KeysOf<T> = Extract<keyof T, string>

// Compile-time assertions: the inferred keys must never carry a leading hyphen.
type _EmptyPrefixKeys = Expect<
    Equal<
        KeysOf<ExpandedPaddingResult<'', string>>,
        'padding-block-start' | 'padding-block-end' | 'padding-inline-start' | 'padding-inline-end'
    >
>
type _NamedPrefixKeys = Expect<
    Equal<
        KeysOf<ExpandedPaddingResult<'container', string>>,
        | 'container-padding-block-start'
        | 'container-padding-block-end'
        | 'container-padding-inline-start'
        | 'container-padding-inline-end'
    >
>

describe('expandPadding', () => {
    describe('prefix', () => {
        it('drops the prefix segment for an empty prefix', () => {
            const tokens = expandPadding('')('16px')

            expect(Object.keys(tokens)).toEqual([
                'padding-block-start',
                'padding-block-end',
                'padding-inline-start',
                'padding-inline-end'
            ])
        })

        it('keeps the prefix segment for a named prefix', () => {
            const tokens = expandPadding('container')('16px')

            expect(Object.keys(tokens)).toEqual([
                'container-padding-block-start',
                'container-padding-block-end',
                'container-padding-inline-start',
                'container-padding-inline-end'
            ])
        })

        it('does not duplicate the padding suffix', () => {
            const tokens = expandPadding('container-padding')('16px')

            expect(Object.keys(tokens)).toEqual([
                'container-padding-block-start',
                'container-padding-block-end',
                'container-padding-inline-start',
                'container-padding-inline-end'
            ])
        })

        it('strips leading and trailing hyphens from the prefix', () => {
            const tokens = expandPadding('--container--')('16px')

            expect(Object.keys(tokens)).toEqual([
                'container-padding-block-start',
                'container-padding-block-end',
                'container-padding-inline-start',
                'container-padding-inline-end'
            ])
        })

        it('rejects a non-string prefix', () => {
            expect(() => expandPadding(123 as unknown as string)).toThrow(
                '[expandPadding] Prefix must be a string.'
            )
        })
    })

    describe('value', () => {
        it('expands a scalar to all 4 edges', () => {
            expect(expandPadding('container')('16px')).toEqual({
                'container-padding-block-start': '16px',
                'container-padding-block-end': '16px',
                'container-padding-inline-start': '16px',
                'container-padding-inline-end': '16px'
            })
        })

        it('expands a 2-axis tuple', () => {
            expect(expandPadding('container')(['8px', '16px'])).toEqual({
                'container-padding-block-start': '8px',
                'container-padding-block-end': '8px',
                'container-padding-inline-start': '16px',
                'container-padding-inline-end': '16px'
            })
        })

        it('reads a flat array of design tokens as the block / inline axis', () => {
            expect(expandPadding('')([Space.Space200, Space.Space0])).toEqual({
                'padding-block-start': Space.Space200,
                'padding-block-end': Space.Space200,
                'padding-inline-start': Space.Space0,
                'padding-inline-end': Space.Space0
            })
        })

        it('expands a 4-edge tuple', () => {
            expect(expandPadding('container')(['4px', '8px', '12px', '16px'])).toEqual({
                'container-padding-block-start': '4px',
                'container-padding-block-end': '8px',
                'container-padding-inline-start': '12px',
                'container-padding-inline-end': '16px'
            })
        })

        it('expands a padding object with per-edge overrides', () => {
            expect(
                expandPadding('container')({ block: '8px', inlineStart: '12px' })
            ).toEqual({
                'container-padding-block-start': '8px',
                'container-padding-block-end': '8px',
                'container-padding-inline-start': '12px'
            })
        })

        it('omits edges without a resolved value', () => {
            expect(expandPadding('container')({ inlineStart: '12px' })).toEqual({
                'container-padding-inline-start': '12px'
            })
        })

        it('expands a multi-state tuple', () => {
            const tokens = expandPadding('container')([['8px', '12px'], ['8px', '16px']])

            expect(tokens['container-padding-block-start']).toEqual(['8px', '8px'])
            expect(tokens['container-padding-inline-end']).toEqual(['12px', '16px'])
        })

        it('rejects a null value', () => {
            expect(() => expandPadding('container')(null as unknown as string)).toThrow(
                '[expandPadding] Padding value cannot be null or undefined.'
            )
        })

        it('rejects a tuple with an invalid length', () => {
            expect(() => expandPadding('container')(['8px', '12px', '16px'])).toThrow(
                '[expandPadding] Array input must have length 2 (axis [block, inline]) or 4 (edges [block-start, block-end, inline-start, inline-end]), got length 3.'
            )
        })
    })

    describe('prefix normalization', () => {
        it('treats a whitespace-only prefix as the bare padding base', () => {
            expect(Object.keys(expandPadding('   ')('8px'))).toEqual([
                'padding-block-start',
                'padding-block-end',
                'padding-inline-start',
                'padding-inline-end'
            ])
        })

        it('accepts the bare padding prefix without duplicating it', () => {
            expect(Object.keys(expandPadding('padding')('8px'))).toEqual([
                'padding-block-start',
                'padding-block-end',
                'padding-inline-start',
                'padding-inline-end'
            ])
        })

        it('normalizes a prefix made only of hyphens', () => {
            expect(Object.keys(expandPadding('--')('8px'))).toEqual([
                'padding-block-start',
                'padding-block-end',
                'padding-inline-start',
                'padding-inline-end'
            ])
        })

        it.each([null, undefined, {}, 1])('rejects a non-string prefix %j', (prefix) => {
            expect(() => expandPadding(prefix as unknown as string)).toThrow(
                '[expandPadding] Prefix must be a string.'
            )
        })
    })

    describe('single value normalization', () => {
        it('rejects an undefined value', () => {
            expect(() => expandPadding('container')(undefined as unknown as string)).toThrow(
                '[expandPadding] Padding value cannot be null or undefined.'
            )
        })

        it('expands the all shorthand to every edge', () => {
            expect(expandPadding('container')({ all: '4px' })).toEqual({
                'container-padding-block-start': '4px',
                'container-padding-block-end': '4px',
                'container-padding-inline-start': '4px',
                'container-padding-inline-end': '4px'
            })
        })

        it('resolves edge > kebab edge > axis > all precedence', () => {
            expect(
                expandPadding('container')({
                    all: '1px',
                    block: '2px',
                    'block-start': '4px',
                    blockStart: '8px'
                })
            ).toEqual({
                'container-padding-block-start': '4px',
                'container-padding-block-end': '2px',
                'container-padding-inline-start': '1px',
                'container-padding-inline-end': '1px'
            })
        })

        it('falls back from an undefined kebab key to the camel key', () => {
            expect(
                expandPadding('container')({
                    'block-start': undefined,
                    blockStart: '8px'
                })
            ).toEqual({
                'container-padding-block-start': '8px'
            })
        })

        it('passes numbers, ToCSSVariable providers and CSS text through by identity', () => {
            const provider = { ToCSSVariable: () => 'var(--md-sys-spacing-2)' }
            const css = { cssText: 'var(--space)' }

            const numericValue = expandPadding('')(4) as Record<string, unknown>
            expect(Object.values(numericValue)).toEqual([4, 4, 4, 4])

            const providerTokens = expandPadding('')(provider) as Record<string, unknown>
            for (const value of Object.values(providerTokens)) {
                expect(value).toBe(provider)
            }

            const cssTokens = expandPadding('')(css) as Record<string, unknown>
            for (const value of Object.values(cssTokens)) {
                expect(value).toBe(css)
            }
        })

        it('omits undefined entries of a 4-edge tuple', () => {
            expect(
                expandPadding('container')(['1px', undefined, '3px', undefined] as never)
            ).toEqual({
                'container-padding-block-start': '1px',
                'container-padding-inline-start': '3px'
            })
        })

        it('rejects an empty object', () => {
            expect(() => expandPadding('container')({})).toThrow(
                '[expandPadding] Padding object cannot be empty.'
            )
        })

        it.each([true, false, Symbol('padding'), () => '4px'])(
            'rejects unsupported value %j',
            (value) => {
                expect(() => expandPadding('container')(value as unknown as string)).toThrow(
                    '[expandPadding] Invalid padding value.'
                )
            }
        )

        it('rejects an empty array', () => {
            expect(() => expandPadding('container')([] as never)).toThrow(
                '[expandPadding] Array input must have length 2 (axis [block, inline]) or 4 (edges [block-start, block-end, inline-start, inline-end]), got length 0.'
            )
        })

        it('rejects a null entry inside a multi-state tuple', () => {
            expect(() =>
                expandPadding('container')([['4px', '8px'], null] as never)
            ).toThrow('[expandPadding] Padding value cannot be null or undefined.')
        })

        it('returns a frozen result', () => {
            const tokens = expandPadding('container')('8px')

            expect(Object.isFrozen(tokens)).toBe(true)
        })
    })

    describe('multi-state records', () => {
        it('expands a state record and skips nullish states', () => {
            const tokens = expandPadding('container')({
                enabled: ['4px', '8px'],
                hovered: null,
                pressed: '2px'
            })

            expect(tokens['container-padding-block-start']).toEqual({
                enabled: '4px',
                pressed: '2px'
            })
            expect(tokens['container-padding-block-end']).toEqual({
                enabled: '4px',
                pressed: '2px'
            })
            expect(tokens['container-padding-inline-start']).toEqual({
                enabled: '8px',
                pressed: '2px'
            })
            expect(tokens['container-padding-inline-end']).toEqual({
                enabled: '8px',
                pressed: '2px'
            })
            for (const value of Object.values(tokens)) {
                expect(Object.isFrozen(value)).toBe(true)
            }
        })

        it('omits edges that no state defines', () => {
            const tokens = expandPadding('container')({
                enabled: { blockStart: '1px' },
                hovered: { inlineEnd: '2px' }
            }) as Record<string, unknown>

            expect(tokens['container-padding-block-start']).toEqual({ enabled: '1px' })
            expect(tokens['container-padding-inline-end']).toEqual({ hovered: '2px' })
            expect(tokens['container-padding-block-end']).toBeUndefined()
            expect(tokens['container-padding-inline-start']).toBeUndefined()
        })

        it('rejects a state record whose states are all nullish', () => {
            expect(() =>
                expandPadding('container')({ hovered: null, pressed: undefined })
            ).toThrow('[expandPadding] Padding object cannot be empty.')
        })

        it('rejects a state record without any resolvable edge', () => {
            expect(() =>
                expandPadding('container')({ enabled: { blockStart: undefined } })
            ).toThrow('[expandPadding] Padding object cannot be empty.')
        })

        it('rejects an empty record', () => {
            expect(() => expandPadding('container')({})).toThrow(
                '[expandPadding] Padding object cannot be empty.'
            )
        })
    })

    describe('multi-state tuples', () => {
        it('expands an array of padding objects and preserves state slots', () => {
            const tokens = expandPadding('container')([
                { blockStart: '1px' },
                { inlineEnd: '2px' }
            ]) as Record<string, unknown>

            expect(tokens['container-padding-block-start']).toEqual(['1px', undefined])
            expect(tokens['container-padding-inline-end']).toEqual([undefined, '2px'])
            expect(Object.isFrozen(tokens['container-padding-block-start'])).toBe(true)
        })

        it('expands mixed scalar and tuple states', () => {
            const tokens = expandPadding('container')([
                ['4px', '8px'],
                '2px'
            ]) as Record<string, unknown>

            expect(tokens['container-padding-block-start']).toEqual(['4px', '2px'])
            expect(tokens['container-padding-inline-end']).toEqual(['8px', '2px'])
        })
    })
})

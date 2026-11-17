/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Space } from '@sandlada/mdk'
import { describe, expect, it } from 'vitest'
import { expandMargin, type ExpandedMarginResult } from './expand-margin'

type Expect<T extends true> = T
type Equal<X, Y> =
    (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false

type KeysOf<T> = Extract<keyof T, string>

// Compile-time assertions: the inferred keys must never carry a leading hyphen.
type _EmptyPrefixKeys = Expect<
    Equal<
        KeysOf<ExpandedMarginResult<'', string>>,
        'margin-block-start' | 'margin-block-end' | 'margin-inline-start' | 'margin-inline-end'
    >
>
type _NamedPrefixKeys = Expect<
    Equal<
        KeysOf<ExpandedMarginResult<'container', string>>,
        | 'container-margin-block-start'
        | 'container-margin-block-end'
        | 'container-margin-inline-start'
        | 'container-margin-inline-end'
    >
>

describe('expandMargin', () => {
    describe('prefix', () => {
        it('drops the prefix segment for an empty prefix', () => {
            const tokens = expandMargin('')('16px')

            expect(Object.keys(tokens)).toEqual([
                'margin-block-start',
                'margin-block-end',
                'margin-inline-start',
                'margin-inline-end'
            ])
        })

        it('keeps the prefix segment for a named prefix', () => {
            const tokens = expandMargin('container')('16px')

            expect(Object.keys(tokens)).toEqual([
                'container-margin-block-start',
                'container-margin-block-end',
                'container-margin-inline-start',
                'container-margin-inline-end'
            ])
        })

        it('does not duplicate the margin suffix', () => {
            const tokens = expandMargin('container-margin')('16px')

            expect(Object.keys(tokens)).toEqual([
                'container-margin-block-start',
                'container-margin-block-end',
                'container-margin-inline-start',
                'container-margin-inline-end'
            ])
        })

        it('strips leading and trailing hyphens from the prefix', () => {
            const tokens = expandMargin('--container--')('16px')

            expect(Object.keys(tokens)).toEqual([
                'container-margin-block-start',
                'container-margin-block-end',
                'container-margin-inline-start',
                'container-margin-inline-end'
            ])
        })

        it('rejects a non-string prefix', () => {
            expect(() => expandMargin(123 as unknown as string)).toThrow(
                '[expandMargin] Prefix must be a string.'
            )
        })
    })

    describe('value', () => {
        it('expands a scalar to all 4 edges', () => {
            expect(expandMargin('container')('16px')).toEqual({
                'container-margin-block-start': '16px',
                'container-margin-block-end': '16px',
                'container-margin-inline-start': '16px',
                'container-margin-inline-end': '16px'
            })
        })

        it('expands a 2-axis tuple', () => {
            expect(expandMargin('container')(['8px', '16px'])).toEqual({
                'container-margin-block-start': '8px',
                'container-margin-block-end': '8px',
                'container-margin-inline-start': '16px',
                'container-margin-inline-end': '16px'
            })
        })

        it('reads a flat array of design tokens as the block / inline axis', () => {
            expect(expandMargin('')([Space.Space200, Space.Space0])).toEqual({
                'margin-block-start': Space.Space200,
                'margin-block-end': Space.Space200,
                'margin-inline-start': Space.Space0,
                'margin-inline-end': Space.Space0
            })
        })

        it('expands a 4-edge tuple', () => {
            expect(expandMargin('container')(['4px', '8px', '12px', '16px'])).toEqual({
                'container-margin-block-start': '4px',
                'container-margin-block-end': '8px',
                'container-margin-inline-start': '12px',
                'container-margin-inline-end': '16px'
            })
        })

        it('expands a margin object with per-edge overrides', () => {
            expect(
                expandMargin('container')({ block: '8px', inlineStart: '12px' })
            ).toEqual({
                'container-margin-block-start': '8px',
                'container-margin-block-end': '8px',
                'container-margin-inline-start': '12px'
            })
        })

        it('omits edges without a resolved value', () => {
            expect(expandMargin('container')({ inlineStart: '12px' })).toEqual({
                'container-margin-inline-start': '12px'
            })
        })

        it('expands a multi-state tuple', () => {
            const tokens = expandMargin('container')([['8px', '12px'], ['8px', '16px']])

            expect(tokens['container-margin-block-start']).toEqual(['8px', '8px'])
            expect(tokens['container-margin-inline-end']).toEqual(['12px', '16px'])
        })

        it('rejects a null value', () => {
            expect(() => expandMargin('container')(null as unknown as string)).toThrow(
                '[expandMargin] Margin value cannot be null or undefined.'
            )
        })

        it('rejects a tuple with an invalid length', () => {
            expect(() => expandMargin('container')(['8px', '12px', '16px'])).toThrow(
                '[expandMargin] Array input must have length 2 (axis [block, inline]) or 4 (edges [block-start, block-end, inline-start, inline-end]), got length 3.'
            )
        })
    })

    describe('prefix normalization', () => {
        it('treats a whitespace-only prefix as the bare margin base', () => {
            expect(Object.keys(expandMargin('   ')('8px'))).toEqual([
                'margin-block-start',
                'margin-block-end',
                'margin-inline-start',
                'margin-inline-end'
            ])
        })

        it('accepts the bare margin prefix without duplicating it', () => {
            expect(Object.keys(expandMargin('margin')('8px'))).toEqual([
                'margin-block-start',
                'margin-block-end',
                'margin-inline-start',
                'margin-inline-end'
            ])
        })

        it('normalizes a prefix made only of hyphens', () => {
            expect(Object.keys(expandMargin('--')('8px'))).toEqual([
                'margin-block-start',
                'margin-block-end',
                'margin-inline-start',
                'margin-inline-end'
            ])
        })

        it.each([null, undefined, {}, 1])('rejects a non-string prefix %j', (prefix) => {
            expect(() => expandMargin(prefix as unknown as string)).toThrow(
                '[expandMargin] Prefix must be a string.'
            )
        })
    })

    describe('single value normalization', () => {
        it('rejects an undefined value', () => {
            expect(() => expandMargin('container')(undefined as unknown as string)).toThrow(
                '[expandMargin] Margin value cannot be null or undefined.'
            )
        })

        it('expands the all shorthand to every edge', () => {
            expect(expandMargin('container')({ all: '4px' })).toEqual({
                'container-margin-block-start': '4px',
                'container-margin-block-end': '4px',
                'container-margin-inline-start': '4px',
                'container-margin-inline-end': '4px'
            })
        })

        it('resolves edge > kebab edge > axis > all precedence', () => {
            expect(
                expandMargin('container')({
                    all: '1px',
                    block: '2px',
                    'block-start': '4px',
                    blockStart: '8px'
                })
            ).toEqual({
                'container-margin-block-start': '4px',
                'container-margin-block-end': '2px',
                'container-margin-inline-start': '1px',
                'container-margin-inline-end': '1px'
            })
        })

        it('falls back from an undefined kebab key to the camel key', () => {
            expect(
                expandMargin('container')({
                    'block-start': undefined,
                    blockStart: '8px'
                })
            ).toEqual({
                'container-margin-block-start': '8px'
            })
        })

        it('passes numbers, ToCSSVariable providers and CSS text through by identity', () => {
            const provider = { ToCSSVariable: () => 'var(--md-sys-spacing-2)' }
            const css = { cssText: 'var(--space)' }

            expect(expandMargin('')('4')).toEqual({
                'margin-block-start': '4',
                'margin-block-end': '4',
                'margin-inline-start': '4',
                'margin-inline-end': '4'
            })

            const numeric = expandMargin('')('4') as Record<string, unknown>
            expect(Object.values(numeric)).toEqual(['4', '4', '4', '4'])

            const numericValue = expandMargin('')(4) as Record<string, unknown>
            expect(Object.values(numericValue)).toEqual([4, 4, 4, 4])

            const providerTokens = expandMargin('')(provider) as Record<string, unknown>
            for (const value of Object.values(providerTokens)) {
                expect(value).toBe(provider)
            }

            const cssTokens = expandMargin('')(css) as Record<string, unknown>
            for (const value of Object.values(cssTokens)) {
                expect(value).toBe(css)
            }
        })

        it('omits undefined entries of a 4-edge tuple', () => {
            expect(
                expandMargin('container')(['1px', undefined, '3px', undefined] as never)
            ).toEqual({
                'container-margin-block-start': '1px',
                'container-margin-inline-start': '3px'
            })
        })

        it('rejects an empty object', () => {
            expect(() => expandMargin('container')({})).toThrow(
                '[expandMargin] Margin object cannot be empty.'
            )
        })

        it.each([true, false, Symbol('margin'), () => '4px'])(
            'rejects unsupported value %j',
            (value) => {
                expect(() => expandMargin('container')(value as unknown as string)).toThrow(
                    '[expandMargin] Invalid margin value.'
                )
            }
        )

        it('rejects an empty array', () => {
            expect(() => expandMargin('container')([] as never)).toThrow(
                '[expandMargin] Array input must have length 2 (axis [block, inline]) or 4 (edges [block-start, block-end, inline-start, inline-end]), got length 0.'
            )
        })

        it('rejects a null entry inside a multi-state tuple', () => {
            expect(() =>
                expandMargin('container')([['4px', '8px'], null] as never)
            ).toThrow('[expandMargin] Margin value cannot be null or undefined.')
        })

        it('returns a frozen result', () => {
            const tokens = expandMargin('container')('8px')

            expect(Object.isFrozen(tokens)).toBe(true)
        })
    })

    describe('multi-state records', () => {
        it('expands a state record and skips nullish states', () => {
            const tokens = expandMargin('container')({
                enabled: ['4px', '8px'],
                hovered: null,
                pressed: '2px'
            })

            expect(tokens['container-margin-block-start']).toEqual({
                enabled: '4px',
                pressed: '2px'
            })
            expect(tokens['container-margin-block-end']).toEqual({
                enabled: '4px',
                pressed: '2px'
            })
            expect(tokens['container-margin-inline-start']).toEqual({
                enabled: '8px',
                pressed: '2px'
            })
            expect(tokens['container-margin-inline-end']).toEqual({
                enabled: '8px',
                pressed: '2px'
            })
            for (const value of Object.values(tokens)) {
                expect(Object.isFrozen(value)).toBe(true)
            }
        })

        it('omits edges that no state defines', () => {
            const tokens = expandMargin('container')({
                enabled: { blockStart: '1px' },
                hovered: { inlineEnd: '2px' }
            }) as Record<string, unknown>

            expect(tokens['container-margin-block-start']).toEqual({ enabled: '1px' })
            expect(tokens['container-margin-inline-end']).toEqual({ hovered: '2px' })
            expect(tokens['container-margin-block-end']).toBeUndefined()
            expect(tokens['container-margin-inline-start']).toBeUndefined()
        })

        it('rejects a state record whose states are all nullish', () => {
            expect(() =>
                expandMargin('container')({ hovered: null, pressed: undefined })
            ).toThrow('[expandMargin] Margin object cannot be empty.')
        })

        it('rejects a state record without any resolvable edge', () => {
            expect(() =>
                expandMargin('container')({ enabled: { blockStart: undefined } })
            ).toThrow('[expandMargin] Margin object cannot be empty.')
        })

        it('rejects an empty record', () => {
            expect(() => expandMargin('container')({})).toThrow(
                '[expandMargin] Margin object cannot be empty.'
            )
        })
    })

    describe('multi-state tuples', () => {
        it('expands an array of margin objects and preserves state slots', () => {
            const tokens = expandMargin('container')([
                { blockStart: '1px' },
                { inlineEnd: '2px' }
            ]) as Record<string, unknown>

            expect(tokens['container-margin-block-start']).toEqual(['1px', undefined])
            expect(tokens['container-margin-inline-end']).toEqual([undefined, '2px'])
            expect(Object.isFrozen(tokens['container-margin-block-start'])).toBe(true)
        })

        it('expands mixed scalar and tuple states', () => {
            const tokens = expandMargin('container')([
                ['4px', '8px'],
                '2px'
            ]) as Record<string, unknown>

            expect(tokens['container-margin-block-start']).toEqual(['4px', '2px'])
            expect(tokens['container-margin-inline-end']).toEqual(['8px', '2px'])
        })
    })
})

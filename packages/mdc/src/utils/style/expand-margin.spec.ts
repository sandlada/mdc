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
})

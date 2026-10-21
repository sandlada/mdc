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
})

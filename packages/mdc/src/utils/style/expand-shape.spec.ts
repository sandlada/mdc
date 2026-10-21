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
})

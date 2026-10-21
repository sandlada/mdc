/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Typescale } from '@sandlada/mdk'
import { describe, expect, it } from 'vitest'
import { expandTypescale, type ExpandedTypescaleResult } from './expand-typescale'

type Expect<T extends true> = T
type Equal<X, Y> =
    (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false

type KeysOf<T> = Extract<keyof T, string>

// Compile-time assertions: the inferred keys must never carry a leading hyphen.
type _EmptyPrefixKeys = Expect<
    Equal<
        KeysOf<ExpandedTypescaleResult<'', typeof Typescale.LabelLarge>>,
        'font' | 'leading' | 'size' | 'tracking' | 'weight'
    >
>
type _NamedPrefixKeys = Expect<
    Equal<
        KeysOf<ExpandedTypescaleResult<'label', typeof Typescale.LabelLarge>>,
        'label-font' | 'label-leading' | 'label-size' | 'label-tracking' | 'label-weight'
    >
>

describe('expandTypescale', () => {
    describe('prefix', () => {
        it('drops the separator for an empty prefix', () => {
            const tokens = expandTypescale('')(Typescale.LabelLarge)

            expect(Object.keys(tokens)).toEqual(['font', 'leading', 'size', 'tracking', 'weight'])
        })

        it('keeps the separator for a named prefix', () => {
            const tokens = expandTypescale('label')(Typescale.LabelLarge)

            expect(Object.keys(tokens)).toEqual([
                'label-font',
                'label-leading',
                'label-size',
                'label-tracking',
                'label-weight'
            ])
        })

        it('strips a redundant property suffix from the prefix', () => {
            const tokens = expandTypescale('label-font')(Typescale.LabelLarge)

            expect(Object.keys(tokens)).toEqual([
                'label-font',
                'label-leading',
                'label-size',
                'label-tracking',
                'label-weight'
            ])
        })

        it('strips leading and trailing hyphens from the prefix', () => {
            const tokens = expandTypescale('--label-')(Typescale.LabelLarge)

            expect(Object.keys(tokens)).toEqual([
                'label-font',
                'label-leading',
                'label-size',
                'label-tracking',
                'label-weight'
            ])
        })

        it('rejects a non-string prefix', () => {
            expect(() => expandTypescale(123 as unknown as string)(Typescale.LabelLarge)).toThrow(
                '[expandTypescale] Prefix must be a string.'
            )
        })
    })

    describe('single value', () => {
        it('projects the 5 typographic properties', () => {
            const tokens = expandTypescale('')(Typescale.LabelLarge)

            expect(tokens.font).toEqual({ Key: '--md-ref-typeface-font-plain', Value: 'Roboto' })
            expect(tokens.leading).toEqual({
                Key: '--md-sys-typescale-label-large-font-line-height',
                Value: 20,
                Unit: 'px'
            })
            expect(tokens.size).toEqual({
                Key: '--md-sys-typescale-label-large-font-size',
                Value: 14,
                Unit: 'px'
            })
            expect(tokens.tracking).toEqual({
                Key: '--md-sys-typescale-label-large-font-tracking',
                Value: 0,
                Unit: 'px'
            })
            expect(tokens.weight).toEqual({ Key: '--md-ref-typeface-weight-medium', Value: 500 })
        })

        it('accepts a plain typography object', () => {
            const tokens = expandTypescale('label')({
                font: 'Roboto',
                leading: '20px',
                size: '14px',
                tracking: '0px',
                weight: 500
            })

            expect(tokens).toEqual({
                'label-font': 'Roboto',
                'label-leading': '20px',
                'label-size': '14px',
                'label-tracking': '0px',
                'label-weight': 500
            })
        })
    })

    describe('tuple value', () => {
        it('projects one entry per tuple item', () => {
            const tokens = expandTypescale('')([Typescale.LabelSmall, Typescale.LabelLarge])

            expect(tokens['font']).toHaveLength(2)
            expect(tokens['size']).toEqual([
                { Key: '--md-sys-typescale-label-small-font-size', Value: 11, Unit: 'px' },
                { Key: '--md-sys-typescale-label-large-font-size', Value: 14, Unit: 'px' }
            ])
            expect(tokens['weight']).toEqual([
                { Key: '--md-ref-typeface-weight-bold', Value: 700 },
                { Key: '--md-ref-typeface-weight-medium', Value: 500 }
            ])
        })

        it('rejects an empty tuple', () => {
            expect(() => expandTypescale('')([])).toThrow(Error)
        })
    })

    describe('record value', () => {
        it('projects one entry per state', () => {
            const tokens = expandTypescale('')({
                enabled: Typescale.LabelLarge,
                selected: Typescale.TitleMedium
            })

            expect(Object.keys(tokens['font'])).toEqual(['enabled', 'selected'])
            expect(tokens['size']).toEqual({
                enabled: {
                    Key: '--md-sys-typescale-label-large-font-size',
                    Value: 14,
                    Unit: 'px'
                },
                selected: {
                    Key: '--md-sys-typescale-title-medium-font-size',
                    Value: 16,
                    Unit: 'px'
                }
            })
        })

        it('rejects an empty object', () => {
            expect(() => expandTypescale('')({})).toThrow(Error)
        })
    })

    describe('invalid value', () => {
        it('rejects null and undefined', () => {
            expect(() =>
                expandTypescale('')(null as unknown as typeof Typescale.LabelLarge)
            ).toThrow('[expandTypescale] Typescale value cannot be null or undefined.')
            expect(() =>
                expandTypescale('')(undefined as unknown as typeof Typescale.LabelLarge)
            ).toThrow('[expandTypescale] Typescale value cannot be null or undefined.')
        })

        it('rejects a non-object value', () => {
            expect(() =>
                expandTypescale('')(42 as unknown as typeof Typescale.LabelLarge)
            ).toThrow('[expandTypescale] Invalid typescale value: expected a Typescale instance, typography object, tuple, or state record.')
        })
    })

    describe('inferred keys', () => {
        it('infers unprefixed keys for an empty prefix', () => {
            const tokens = expandTypescale('')(Typescale.LabelLarge)

            expect(Object.keys(tokens)).toEqual(['font', 'leading', 'size', 'tracking', 'weight'])
        })
    })
})

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { Typescale } from '@sandlada/mdk'
import { describe, expect, it } from 'vitest'
import { createStyleDefinition } from './create-style-definition'
import { defineSchema } from './define-schema'
import { expandTypescale } from './expand-typescale'

describe('expandTypescale', () => {
    describe('Single MDK Typescale Instances', () => {
        it('expands MDK Typescale.LabelLarge into 5 typographic tokens', () => {
            const result = expandTypescale('label')(Typescale.LabelLarge)

            expect(result).toEqual({
                'label-font': Typescale.LabelLarge.Font,
                'label-leading': Typescale.LabelLarge.LineHeight,
                'label-size': Typescale.LabelLarge.FontSize,
                'label-tracking': Typescale.LabelLarge.Tracking,
                'label-weight': Typescale.LabelLarge.FontWeight
            })
        })

        it('expands MDK Typescale.HeadlineSmall with custom prefix', () => {
            const result = expandTypescale('headline')(Typescale.HeadlineSmall)

            expect(result).toEqual({
                'headline-font': Typescale.HeadlineSmall.Font,
                'headline-leading': Typescale.HeadlineSmall.LineHeight,
                'headline-size': Typescale.HeadlineSmall.FontSize,
                'headline-tracking': Typescale.HeadlineSmall.Tracking,
                'headline-weight': Typescale.HeadlineSmall.FontWeight
            })
        })

        it('expands Emphasized variants accurately', () => {
            const result = expandTypescale('emphasized-title')(Typescale.EmphasizedTitleLarge)

            expect(result).toEqual({
                'emphasized-title-font': Typescale.EmphasizedTitleLarge.Font,
                'emphasized-title-leading': Typescale.EmphasizedTitleLarge.LineHeight,
                'emphasized-title-size': Typescale.EmphasizedTitleLarge.FontSize,
                'emphasized-title-tracking': Typescale.EmphasizedTitleLarge.Tracking,
                'emphasized-title-weight': Typescale.EmphasizedTitleLarge.FontWeight
            })
        })
    })

    describe('Plain & Custom Typography Objects', () => {
        it('expands camelCase plain typography object', () => {
            const custom = {
                font: 'Roboto',
                lineHeight: '20px',
                fontSize: '14px',
                tracking: '0.1px',
                fontWeight: 500
            }

            const result = expandTypescale('label')(custom)

            expect(result).toEqual({
                'label-font': 'Roboto',
                'label-leading': '20px',
                'label-size': '14px',
                'label-tracking': '0.1px',
                'label-weight': 500
            })
        })

        it('expands alternative CSS / typographic aliases (typeface, size, leading, letterSpacing, weight)', () => {
            const custom = {
                typeface: 'Inter',
                size: '1rem',
                leading: '1.5',
                letterSpacing: '0.05em',
                weight: 'bold'
            }

            const result = expandTypescale('body')(custom)

            expect(result).toEqual({
                'body-font': 'Inter',
                'body-leading': '1.5',
                'body-size': '1rem',
                'body-tracking': '0.05em',
                'body-weight': 'bold'
            })
        })

        it('preserves falsy but defined values such as 0, empty string, false', () => {
            const custom = {
                font: 'sans-serif',
                size: 0,
                leading: 0,
                tracking: 0,
                weight: 400
            }

            const result = expandTypescale('compact')(custom)

            expect(result).toEqual({
                'compact-font': 'sans-serif',
                'compact-leading': 0,
                'compact-size': 0,
                'compact-tracking': 0,
                'compact-weight': 400
            })
        })

        it('returns undefined for omitted typography properties in partial objects', () => {
            const custom = {
                size: '16px',
                weight: 700
            }

            const result = expandTypescale('partial')(custom)

            expect(result).toEqual({
                'partial-font': undefined,
                'partial-leading': undefined,
                'partial-size': '16px',
                'partial-tracking': undefined,
                'partial-weight': 700
            })
        })
    })

    describe('Multi-State Tuples', () => {
        it('expands 2-state tuple of MDK Typescale instances', () => {
            const tuple = [Typescale.LabelSmall, Typescale.LabelMedium] as const
            const result = expandTypescale('label')(tuple)

            expect(result).toEqual({
                'label-font': [Typescale.LabelSmall.Font, Typescale.LabelMedium.Font],
                'label-leading': [Typescale.LabelSmall.LineHeight, Typescale.LabelMedium.LineHeight],
                'label-size': [Typescale.LabelSmall.FontSize, Typescale.LabelMedium.FontSize],
                'label-tracking': [Typescale.LabelSmall.Tracking, Typescale.LabelMedium.Tracking],
                'label-weight': [Typescale.LabelSmall.FontWeight, Typescale.LabelMedium.FontWeight]
            })
        })

        it('expands 3-state tuple of custom typography objects', () => {
            const tuple = [
                { size: '12px', leading: '16px', weight: 400 },
                { size: '14px', leading: '20px', weight: 500 },
                { size: '16px', leading: '24px', weight: 600 }
            ]

            const result = expandTypescale('text')(tuple)

            expect(result).toEqual({
                'text-font': [undefined, undefined, undefined],
                'text-leading': ['16px', '20px', '24px'],
                'text-size': ['12px', '14px', '16px'],
                'text-tracking': [undefined, undefined, undefined],
                'text-weight': [400, 500, 600]
            })
        })
    })

    describe('Multi-State Records', () => {
        it('expands multi-state record with MDK Typescale instances', () => {
            const record = {
                enabled: Typescale.LabelSmall,
                selected: Typescale.LabelMedium
            }

            const result = expandTypescale('label')(record)

            expect(result).toEqual({
                'label-font': {
                    enabled: Typescale.LabelSmall.Font,
                    selected: Typescale.LabelMedium.Font
                },
                'label-leading': {
                    enabled: Typescale.LabelSmall.LineHeight,
                    selected: Typescale.LabelMedium.LineHeight
                },
                'label-size': {
                    enabled: Typescale.LabelSmall.FontSize,
                    selected: Typescale.LabelMedium.FontSize
                },
                'label-tracking': {
                    enabled: Typescale.LabelSmall.Tracking,
                    selected: Typescale.LabelMedium.Tracking
                },
                'label-weight': {
                    enabled: Typescale.LabelSmall.FontWeight,
                    selected: Typescale.LabelMedium.FontWeight
                }
            })
        })

        it('expands multi-state record containing nested tuples', () => {
            const record = {
                enabled: [Typescale.LabelSmall, Typescale.LabelMedium],
                disabled: [Typescale.LabelSmall, Typescale.LabelSmall]
            }

            const result = expandTypescale('badge')(record)

            expect(result).toEqual({
                'badge-font': {
                    enabled: [Typescale.LabelSmall.Font, Typescale.LabelMedium.Font],
                    disabled: [Typescale.LabelSmall.Font, Typescale.LabelSmall.Font]
                },
                'badge-leading': {
                    enabled: [Typescale.LabelSmall.LineHeight, Typescale.LabelMedium.LineHeight],
                    disabled: [Typescale.LabelSmall.LineHeight, Typescale.LabelSmall.LineHeight]
                },
                'badge-size': {
                    enabled: [Typescale.LabelSmall.FontSize, Typescale.LabelMedium.FontSize],
                    disabled: [Typescale.LabelSmall.FontSize, Typescale.LabelSmall.FontSize]
                },
                'badge-tracking': {
                    enabled: [Typescale.LabelSmall.Tracking, Typescale.LabelMedium.Tracking],
                    disabled: [Typescale.LabelSmall.Tracking, Typescale.LabelSmall.Tracking]
                },
                'badge-weight': {
                    enabled: [Typescale.LabelSmall.FontWeight, Typescale.LabelMedium.FontWeight],
                    disabled: [Typescale.LabelSmall.FontWeight, Typescale.LabelSmall.FontWeight]
                }
            })
        })
    })

    describe('Prefix Handling & Normalization', () => {
        it('normalizes prefix with trailing hyphens', () => {
            const result = expandTypescale('label--')(Typescale.LabelLarge)
            expect(result).toHaveProperty('label-font')
            expect(result).not.toHaveProperty('label---font')
        })

        it('normalizes prefix with whitespace', () => {
            const result = expandTypescale('  headline  ')(Typescale.HeadlineSmall)
            expect(result).toHaveProperty('headline-font')
        })

        it('normalizes prefix ending with -typescale or -typography', () => {
            const result1 = expandTypescale('label-typescale')(Typescale.LabelLarge)
            expect(result1).toHaveProperty('label-font')
            expect(result1).not.toHaveProperty('label-typescale-font')

            const result2 = expandTypescale('headline-typography')(Typescale.HeadlineSmall)
            expect(result2).toHaveProperty('headline-font')
        })

        it('preserves multi-segment prefixes like extra-small-label', () => {
            const result = expandTypescale('extra-small-label')(Typescale.LabelSmall)
            expect(result).toHaveProperty('extra-small-label-font')
            expect(result).toHaveProperty('extra-small-label-leading')
            expect(result).toHaveProperty('extra-small-label-size')
            expect(result).toHaveProperty('extra-small-label-tracking')
            expect(result).toHaveProperty('extra-small-label-weight')
        })
    })

    describe('Currying & Immutability', () => {
        it('allows reusable curried transformer across multiple calls', () => {
            const expandLabel = expandTypescale('label')

            const small = expandLabel(Typescale.LabelSmall)
            const large = expandLabel(Typescale.LabelLarge)

            expect(small['label-size']).toBe(Typescale.LabelSmall.FontSize)
            expect(large['label-size']).toBe(Typescale.LabelLarge.FontSize)
            expect(small).not.toBe(large)
        })

        it('does not mutate input objects', () => {
            const input = {
                font: 'Roboto',
                size: '14px',
                leading: '20px'
            }
            const inputCopy = { ...input }

            expandTypescale('label')(input)
            expect(input).toEqual(inputCopy)
        })
    })

    describe('Error Handling & Boundary Conditions', () => {
        it('throws on empty or non-string prefix', () => {
            expect(() => expandTypescale('')(Typescale.LabelLarge)).toThrow(
                '[expandTypescale] Prefix must be a non-empty string.'
            )
            expect(() => expandTypescale('   ')(Typescale.LabelLarge)).toThrow(
                '[expandTypescale] Prefix must be a non-empty string.'
            )
            expect(() => expandTypescale(null as any)(Typescale.LabelLarge)).toThrow(
                '[expandTypescale] Prefix must be a non-empty string.'
            )
            expect(() => expandTypescale(undefined as any)(Typescale.LabelLarge)).toThrow(
                '[expandTypescale] Prefix must be a non-empty string.'
            )
            expect(() => expandTypescale(123 as any)(Typescale.LabelLarge)).toThrow(
                '[expandTypescale] Prefix must be a non-empty string.'
            )
        })

        it('throws on null or undefined typescaleValue', () => {
            expect(() => expandTypescale('label')(null as any)).toThrow(
                '[expandTypescale] Typescale value cannot be null or undefined.'
            )
            expect(() => expandTypescale('label')(undefined as any)).toThrow(
                '[expandTypescale] Typescale value cannot be null or undefined.'
            )
        })

        it('throws on non-object primitive typescaleValue', () => {
            expect(() => expandTypescale('label')(123 as any)).toThrow(
                '[expandTypescale] Invalid typescale value: expected a Typescale instance, typography object, tuple, or state record.'
            )
            expect(() => expandTypescale('label')('roboto' as any)).toThrow(
                '[expandTypescale] Invalid typescale value: expected a Typescale instance, typography object, tuple, or state record.'
            )
            expect(() => expandTypescale('label')(true as any)).toThrow(
                '[expandTypescale] Invalid typescale value: expected a Typescale instance, typography object, tuple, or state record.'
            )
        })

        it('throws on empty tuple', () => {
            expect(() => expandTypescale('label')([])).toThrow(
                '[expandTypescale] Tuple of typescale values cannot be empty.'
            )
        })

        it('throws on empty object', () => {
            expect(() => expandTypescale('label')({})).toThrow(
                '[expandTypescale] Typescale value object cannot be empty.'
            )
        })
    })

    describe('Integration with createStyleDefinition', () => {
        it('integrates seamlessly with createStyleDefinition', () => {
            const Schema = defineSchema(['enabled', 'selected'] as const)

            const ButtonDef = createStyleDefinition(Schema)({
                'container-color': '#6750a4',
                ...expandTypescale('label')(Typescale.LabelLarge),
                ...expandTypescale('headline')({
                    enabled: Typescale.TitleMedium,
                    selected: Typescale.TitleLarge
                })
            })

            const tokens = ButtonDef.tokens as Record<string, any>
            expect(tokens['label-font']).toBe(Typescale.LabelLarge.Font)
            expect(tokens['label-size']).toBe(Typescale.LabelLarge.FontSize)
            expect(tokens['headline-size']).toEqual({
                enabled: Typescale.TitleMedium.FontSize,
                selected: Typescale.TitleLarge.FontSize
            })
            expect(ButtonDef.flatTokenKeys).toContain('label-font')
            expect(ButtonDef.flatTokenKeys).toContain('label-leading')
            expect(ButtonDef.flatTokenKeys).toContain('label-size')
            expect(ButtonDef.flatTokenKeys).toContain('label-tracking')
            expect(ButtonDef.flatTokenKeys).toContain('label-weight')
            expect(ButtonDef.flatTokenKeys).toContain('headline-font')
        })
    })
})

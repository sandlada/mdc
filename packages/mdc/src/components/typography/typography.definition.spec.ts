/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { Typescale } from '@sandlada/mdk'
import { stringifyTokens } from '@sandlada/styles/adapters/lit'
import { describe, expect, it } from 'vitest'
import { TypographyDefinition, TypographySchema } from './typography.definition'

describe('TypographyDefinition (joint n-dimensional tokens)', () => {
    it('declares the 5x3x2 role/size/emphasis topology', () => {
        expect(TypographySchema.dimensions).toEqual([
            ['display', 'headline', 'title', 'label', 'body'],
            ['small', 'medium', 'large'],
            ['regular', 'emphasized']
        ])
        expect(TypographySchema.count).toBe(30)
        expect(TypographyDefinition.schema).toBe(TypographySchema)
    })

    it('exposes five joint tokens shaped [role][size][emphasis]', () => {
        expect(TypographyDefinition.flatTokenKeys).toEqual([
            'font',
            'size',
            'weight',
            'leading',
            'tracking'
        ])
        const tokens = TypographyDefinition.tokens as Record<string, any>
        for (const key of TypographyDefinition.flatTokenKeys) {
            const value = tokens[key]
            expect(Array.isArray(value)).toBe(true)
            expect(value).toHaveLength(5)
            for (const role of value) {
                expect(role).toHaveLength(3)
                for (const size of role) {
                    expect(size).toHaveLength(2)
                }
            }
            expect(Object.isFrozen(value)).toBe(true)
        }
    })

    it('addresses cells as [role][size][emphasis] with MDK identity', () => {
        const tokens = TypographyDefinition.tokens as Record<string, any>
        expect(tokens['size'][0][2][0]).toBe(Typescale.DisplayLarge.FontSize)
        expect(tokens['size'][0][2][1]).toBe(Typescale.EmphasizedDisplayLarge.FontSize)
        expect(tokens['font'][3][0][0]).toBe(Typescale.LabelSmall.Font)
        expect(tokens['weight'][4][2][1]).toBe(Typescale.EmphasizedBodyLarge.FontWeight)
        expect(tokens['leading'][1][1][0]).toBe(Typescale.HeadlineMedium.LineHeight)
        expect(tokens['tracking'][2][0][1]).toBe(Typescale.EmphasizedTitleSmall.Tracking)
    })

    it('expands dimension-ordered combo properties for every combination', () => {
        const def = TypographyDefinition as any
        expect(def['display-large-regular-size']).toBe(Typescale.DisplayLarge.FontSize)
        expect(def['display-large-emphasized-size']).toBe(Typescale.EmphasizedDisplayLarge.FontSize)
        expect(def['body-small-emphasized-weight']).toBe(Typescale.EmphasizedBodySmall.FontWeight)
        expect(Object.keys(def)).toContain('label-medium-regular-font')
    })

    it('stringifies 150 combo variables with public override fallbacks', () => {
        const sheet = stringifyTokens('--mdc-typography')(TypographyDefinition)
        const cssText = sheet.cssText

        expect(cssText).toContain('--_display-large-regular-size: var(--mdc-typography-display-large-regular-size, var(--md-sys-typescale-display-large-font-size, 57px));')
        expect(cssText).toContain('--_body-small-emphasized-weight: var(--mdc-typography-body-small-emphasized-weight, var(--md-ref-typeface-weight-medium, 500));')

        const declarations = cssText.split('\n').filter(line => line.startsWith('--_'))
        expect(declarations).toHaveLength(150)
    })
})

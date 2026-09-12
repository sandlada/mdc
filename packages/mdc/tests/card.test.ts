/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import {
    CardDefinitionVariants,
    ElevatedCardDefinition,
    FilledCardDefinition,
    OutlinedCardDefinition,
} from '../src/component-definitions/card.definition'
import { CardShape, CardVariant } from '../src/components/card/card.interface'

describe('CardDefinition', () => {
    it('should define container shapes and paddings', () => {
        expect(FilledCardDefinition['container-shape-start-start']).toBeDefined()
        expect(FilledCardDefinition['container-shape-start-end']).toBeDefined()
        expect(FilledCardDefinition['container-shape-end-start']).toBeDefined()
        expect(FilledCardDefinition['container-shape-end-end']).toBeDefined()

        expect(FilledCardDefinition['round-container-shape-start-start']).toBeDefined()
        expect(FilledCardDefinition['square-container-shape-start-start']).toBeDefined()

        expect(FilledCardDefinition['container-padding-inline-start']).toBe('16px')
        expect(FilledCardDefinition['container-padding-inline-end']).toBe('16px')
        expect(FilledCardDefinition['container-padding-block-start']).toBe('16px')
        expect(FilledCardDefinition['container-padding-block-end']).toBe('16px')
    })

    it('should define elevated, filled, and outlined variant colors and elevations', () => {
        expect(ElevatedCardDefinition['enabled-container-color']).toBeDefined()
        expect(ElevatedCardDefinition['enabled-container-elevation']).toBeDefined()
        expect(ElevatedCardDefinition['hovered-container-elevation']).toBeDefined()

        expect(FilledCardDefinition['enabled-container-color']).toBeDefined()
        expect(FilledCardDefinition['enabled-container-elevation']).toBeDefined()

        expect(OutlinedCardDefinition['enabled-container-color']).toBeDefined()
        expect(OutlinedCardDefinition['enabled-outline-color']).toBeDefined()
        expect(OutlinedCardDefinition['outline-width']).toBe('1px')

        expect(CardDefinitionVariants.filled).toBe(FilledCardDefinition)
        expect(CardDefinitionVariants.elevated).toBe(ElevatedCardDefinition)
        expect(CardDefinitionVariants.outlined).toBe(OutlinedCardDefinition)
    })

    it('should carry ResolvedStyleDefinition metadata and CardSchema reference', () => {
        expect(FilledCardDefinition.__brand).toBe('ResolvedStyleDefinition')
        expect(FilledCardDefinition.schema.dimensions.length).toBe(2)
        expect(FilledCardDefinition.schema.dimensions[0]).toEqual([
            'enabled',
            'hovered',
            'focused',
            'pressed',
            'dragged',
            'disabled',
        ])
        expect(FilledCardDefinition.schema.dimensions[1]).toEqual([
            'round',
            'square',
        ])
        expect(FilledCardDefinition.schema.states).toEqual([
            'enabled',
            'hovered',
            'focused',
            'pressed',
            'dragged',
            'disabled',
            'round',
            'square',
        ])
        expect(FilledCardDefinition.schema.isValidCombination(['enabled', 'round'])).toBe(true)
        expect(FilledCardDefinition.schema.isValidCombination(['round', 'square'])).toBe(false)
        expect(FilledCardDefinition.tokens['container-color']).toEqual({
            enabled: expect.anything(),
            disabled: expect.anything(),
        })
        expect(ElevatedCardDefinition.tokens['container-elevation']).toEqual({
            enabled: expect.anything(),
            hovered: expect.anything(),
            focused: expect.anything(),
            pressed: expect.anything(),
            dragged: expect.anything(),
            disabled: expect.anything(),
        })
    })

    it('should export valid variant and shape constants', () => {
        expect(CardVariant.Elevated).toBe('elevated')
        expect(CardVariant.Filled).toBe('filled')
        expect(CardVariant.Outlined).toBe('outlined')

        expect(CardShape.Round).toBe('round')
        expect(CardShape.Square).toBe('square')
    })
})


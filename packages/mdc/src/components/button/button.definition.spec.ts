/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { Shape, State, Typescale } from '@sandlada/mdk'
import { describe, expect, it } from 'vitest'
import { Color } from '../../utils/color'
import {
    ButtonDefinition,
    ButtonSchema,
    ToggleButtonDefinition,
    ToggleButtonSchema
} from './button.definition'

describe('ButtonSchema', () => {
    it('declares the interaction/variant topology', () => {
        expect(ButtonSchema.dimensions).toEqual([
            ['enabled', 'hovered', 'focused', 'pressed', 'disabled'],
            ['filled', 'filled-tonal', 'elevated', 'outlined', 'text']
        ])
        expect(ButtonSchema.count).toBe(25)
        expect(ButtonDefinition.schema).toBe(ButtonSchema)
    })

    it('validates combinations across dimensions', () => {
        expect(ButtonSchema.isValidCombination(['hovered', 'filled'])).toBe(true)
        expect(ButtonSchema.isValidCombination(['filled', 'text'])).toBe(false)
        expect(ButtonSchema.isValidCombination(['unknown-state'])).toBe(false)
    })
})

describe('ToggleButtonSchema', () => {
    it('extends the button topology with the toggle dimension', () => {
        expect(ToggleButtonSchema.dimensions).toEqual([
            ['enabled', 'hovered', 'focused', 'pressed', 'disabled'],
            ['filled', 'filled-tonal', 'elevated', 'outlined', 'text'],
            ['unselected', 'selected']
        ])
        expect(ToggleButtonSchema.count).toBe(50)
        expect(ToggleButtonDefinition.schema).toBe(ToggleButtonSchema)
    })
})

describe('ButtonDefinition (joint n-dimensional tokens)', () => {
    it('shapes joint tokens as [interaction][variant]', () => {
        const tokens = ButtonDefinition.tokens as Record<string, any>
        const value = tokens['container-color']
        expect(Array.isArray(value)).toBe(true)
        expect(value).toHaveLength(5)
        expect(value[0]).toHaveLength(5)
        expect(Object.isFrozen(value)).toBe(true)
    })

    it('addresses cells in schema dimension order', () => {
        const def = ButtonDefinition as any
        expect(def['enabled-filled-container-color']).toBe(Color.Primary)
        expect(def['hovered-elevated-container-elevation']).toBe('1')
        expect(def['disabled-outlined-outline-color']).toBe(Color.OutlineVariant)
        expect(def['pressed-text-label-color']).toBe(Color.Primary)
        expect(def['focused-filled-tonal-state-layer-color']).toBe(Color.OnSecondaryContainer)
    })

    it('preserves sparse absences', () => {
        const def = ButtonDefinition as any
        expect('hovered-filled-container-elevation' in def).toBe(false)
        expect('enabled-outlined-container-shadow-color' in def).toBe(false)
        expect('enabled-filled-state-layer-color' in def).toBe(false)
        expect('enabled-text-outline-color' in def).toBe(false)
    })

    it('keeps shared size tokens as stateless scalars', () => {
        const def = ButtonDefinition as any
        expect(def['extra-small-container-height']).toBe('32px')
        expect(def['small-container-padding-inline-start']).toBe('16px')
        expect(def['large-container-shape-square-start-start']).toBe(Shape.ExtraLarge)
        expect(def['extra-small-container-shape-round-start-start']).toBe(Shape.Full)
        expect(def['medium-label-leading']).toBe(Typescale.TitleMedium.LineHeight)
        expect(def['extra-small-icon-size']).toBe('20px')
    })

    it('keeps pressed-morph shapes as style-layer scalars', () => {
        const def = ButtonDefinition as any
        expect(def['extra-small-container-shape-pressed-morph-start-start']).toBe(Shape.Small)
        expect(def['large-container-shape-pressed-morph-end-end']).toBe(Shape.Large)
    })

    it('exposes interaction-only opacities as state records', () => {
        const def = ButtonDefinition as any
        expect(def['hovered-state-layer-opacity']).toBe(State.HoveredStateLayerOpacity)
        expect(def['disabled-container-opacity']).toBe('0.1')
        expect(def['disabled-label-opacity']).toBe('0.38')
    })
})

describe('ToggleButtonDefinition (joint n-dimensional tokens)', () => {
    it('shapes joint tokens as [interaction][variant][toggle]', () => {
        const tokens = ToggleButtonDefinition.tokens as Record<string, any>
        const value = tokens['container-color']
        expect(Array.isArray(value)).toBe(true)
        expect(value).toHaveLength(5)
        expect(value[0]).toHaveLength(5)
        expect(value[0][0]).toHaveLength(2)
        expect(Object.isFrozen(value)).toBe(true)
    })

    it('addresses toggle cells in schema dimension order', () => {
        const def = ToggleButtonDefinition as any
        expect(def['enabled-outlined-selected-container-color']).toBe(Color.InverseSurface)
        expect(def['enabled-outlined-unselected-container-color']).toBe(`transparent`)
        expect(def['hovered-filled-selected-label-color']).toBe(Color.OnPrimary)
        expect(def['hovered-filled-unselected-label-color']).toBe(Color.OnSurfaceVariant)
        expect(def['pressed-text-selected-icon-color']).toBe(Color.Primary)
        expect(def['disabled-elevated-unselected-container-color']).toBe(Color.OnSurface)
        expect(def['enabled-filled-unselected-container-color']).toBe(Color.SurfaceContainer)
    })

    it('keeps text toggle combinations fully populated', () => {
        const def = ToggleButtonDefinition as any
        expect(def['enabled-text-selected-container-color']).toBe(`transparent`)
        expect(def['hovered-text-unselected-label-color']).toBe(Color.Primary)
    })

    it('carries selected shapes as toggle-only scalars', () => {
        const def = ToggleButtonDefinition as any
        expect(def['extra-small-container-shape-round-selected-start-start']).toBe(Shape.Medium)
        expect(def['large-container-shape-round-selected-end-end']).toBe(Shape.ExtraLarge)
        expect(def['medium-container-shape-square-selected-start-start']).toBe(Shape.Full)
        expect('extra-small-container-shape-round-selected-start-start' in ButtonDefinition).toBe(false)
    })
})

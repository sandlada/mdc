/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { State } from '@sandlada/mdk'
import { describe, expect, it } from 'vitest'
import { Color } from '../../utils/color'
import {
    ButtonDefinition,
    ButtonSchema
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

    it('exposes interaction-only opacities as state records', () => {
        const def = ButtonDefinition as any
        expect(def['hovered-state-layer-opacity']).toBe(State.HoveredStateLayerOpacity)
        expect(def['disabled-container-opacity']).toBe('0.1')
        expect(def['disabled-label-opacity']).toBe('0.38')
    })
})

describe('ButtonDefinition (no size keys)', () => {
    it('keeps size-prefixed keys out of the interaction definition', () => {
        expect('extra-small-container-height' in ButtonDefinition).toBe(false)
        expect('small-container-padding-inline-start' in ButtonDefinition).toBe(false)
        expect('extra-small-container-shape-round-start-start' in ButtonDefinition).toBe(false)
        expect('extra-small-container-shape-pressed-morph-start-start' in ButtonDefinition).toBe(false)
        expect('extra-small-container-shape-round-selected-start-start' in ButtonDefinition).toBe(false)
    })
})

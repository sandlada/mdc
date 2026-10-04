/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { Color } from '../../utils/color'
import {
    ToggleButtonDefinition,
    ToggleButtonSchema
} from './toggle-button.definition'

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

    it('carries no size-prefixed scalars (owned by the size submodule)', () => {
        expect('extra-small-container-height' in ToggleButtonDefinition).toBe(false)
        expect('extra-small-container-shape-round-selected-start-start' in ToggleButtonDefinition).toBe(false)
        expect('extra-small-container-shape-pressed-morph-start-start' in ToggleButtonDefinition).toBe(false)
    })
})

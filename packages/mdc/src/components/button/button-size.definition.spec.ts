/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { Shape, Typescale } from '@sandlada/mdk'
import { describe, expect, it } from 'vitest'
import {
    ButtonSizeDefinition,
    ButtonSizeSchema
} from './button-size.definition'

describe('ButtonSizeSchema', () => {
    it('declares the 1D size topology', () => {
        expect(ButtonSizeSchema.dimensions).toEqual([
            ['extra-small', 'small', 'medium', 'large', 'extra-large']
        ])
        expect(ButtonSizeSchema.count).toBe(5)
        expect(ButtonSizeDefinition.schema).toBe(ButtonSizeSchema)
    })

    it('shapes size tokens as 1D tuples in schema order', () => {
        const tokens = ButtonSizeDefinition.tokens as Record<string, any>
        expect(tokens['container-height']).toEqual([`32px`, `40px`, `56px`, `96px`, `136px`])
        expect(tokens['outline-width']).toEqual([`1px`, `1px`, `1px`, `2px`, `3px`])
        expect(tokens['icon-size']).toEqual([`20px`, `20px`, `24px`, `32px`, `40px`])
        expect(tokens['icon-label-space']).toEqual([`8px`, `8px`, `8px`, `12px`, `16px`])
        expect(Object.isFrozen(tokens['container-height'])).toBe(true)
    })
})

describe('ButtonSizeDefinition (independent size submodule)', () => {
    it('keeps size tokens addressable by size-first canonical names', () => {
        const def = ButtonSizeDefinition as any
        expect(def['extra-small-container-height']).toBe('32px')
        expect(def['small-container-padding-inline-start']).toBe('16px')
        expect(def['large-container-shape-square-start-start']).toBe(Shape.ExtraLarge)
        expect(def['extra-small-container-shape-round-start-start']).toBe(Shape.Full)
        expect(def['medium-label-leading']).toBe(Typescale.TitleMedium.LineHeight)
        expect(def['extra-small-icon-size']).toBe('20px')
    })

    it('keeps pressed-morph shapes as size-state scalars', () => {
        const def = ButtonSizeDefinition as any
        expect(def['extra-small-container-shape-pressed-morph-start-start']).toBe(Shape.Small)
        expect(def['large-container-shape-pressed-morph-end-end']).toBe(Shape.Large)
    })

    it('keeps selected shapes as size-state scalars', () => {
        const def = ButtonSizeDefinition as any
        expect(def['extra-small-container-shape-round-selected-start-start']).toBe(Shape.Medium)
        expect(def['large-container-shape-round-selected-end-end']).toBe(Shape.ExtraLarge)
        expect(def['medium-container-shape-square-selected-start-start']).toBe(Shape.Full)
    })

    it('owns no interaction or variant dimensions', () => {
        const def = ButtonSizeDefinition as any
        expect('enabled-filled-container-color' in def).toBe(false)
        expect('hovered-filled-container-color' in def).toBe(false)
    })
})

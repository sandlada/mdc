/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect } from 'vitest'
import { Color } from './color'
import { createStyleDefinition } from '../create-style-definition'
import { defineSchema } from '../define-schema'

describe('Color', () => {
    it('provides MDK system color tokens', () => {
        expect(Color).toBeDefined()
        expect(typeof Color).toBe('object')
        expect(Color.Primary).toBeDefined()
        expect(Color.Surface).toBeDefined()
        expect(Color.Outline).toBeDefined()
        expect(Color.Error).toBeDefined()
    })

    it('generates valid CSS variable fallback strings via ToCSSVariable()', () => {
        const surfaceVar = Color.Surface.ToCSSVariable()
        expect(surfaceVar).toContain('var(--md-sys-color-surface')

        const primaryVar = Color.Primary.ToCSSVariable()
        expect(primaryVar).toContain('var(--md-sys-color-primary')
    })

    it('integrates seamlessly with createStyleDefinition', () => {
        const schema = defineSchema(['enabled', 'hovered'] as const)
        const def = createStyleDefinition(schema)({
            'container-color': [Color.Surface, Color.Primary],
            'outline-color': Color.Outline
        })

        expect(def.tokens['container-color']).toEqual([Color.Surface, Color.Primary])
        expect(def.tokens['outline-color']).toBe(Color.Outline)
        expect(def.flatTokenKeys).toContain('container-color')
        expect(def.flatTokenKeys).toContain('outline-color')
    })
})

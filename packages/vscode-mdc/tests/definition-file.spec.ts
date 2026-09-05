/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { analyzeDefinitionFile, analyzeDefinitionSource } from '../src/core/definition-analyzer'
import realFabSource from '../../mdc/src/component-definitions/fab.definition.ts?raw'
import realFocusRingSource from '../../mdc/src/component-definitions/focus-ring.definition.ts?raw'

const fabLikeSource = `
import { Shape, State, Typescale } from '@sandlada/mdk'
import { Color, createStyleDefinition, defineSchema } from '../utils/styles'

export const FabSchema = defineSchema([
    'enabled',
    'hovered',
    'focused',
    'pressed'
])

const fabSharedTokens = {
    'small-container-height': '56px',
    'small-icon-size': '24px'
}

const fabVariantTokens = (containerColor, onContainerColor) => ({
    'container-color': containerColor,
    'icon-color': onContainerColor
})

export const PrimaryFabDefinition = createStyleDefinition(FabSchema)(
    fabVariantTokens(Color.Primary, Color.OnPrimary)
)

export const PrimaryExtendedFabDefinition = createStyleDefinition(FabSchema)({
    ...fabVariantTokens(Color.Primary, Color.OnPrimary),
    ...fabSharedTokens,
    'label-color': Color.OnPrimary
})

export const FabVariants = {
    'primary': PrimaryExtendedFabDefinition,
    'secondary': SecondaryExtendedFabDefinition
}
`

describe('Multi-Definition File Analysis', () => {
    it('parses every definition in file order', () => {
        const file = analyzeDefinitionFile(fabLikeSource, 'fab.definition.ts')
        expect([...file.definitions.keys()]).toEqual([
            'PrimaryFabDefinition',
            'PrimaryExtendedFabDefinition'
        ])
    })

    it('extracts variant dictionaries', () => {
        const file = analyzeDefinitionFile(fabLikeSource, 'fab.definition.ts')
        expect(file.variants.get('FabVariants')).toEqual([
            'PrimaryExtendedFabDefinition',
            'SecondaryExtendedFabDefinition'
        ])
    })

    it('inlines shared const spreads and resolves factory call-spreads', () => {
        const file = analyzeDefinitionFile(fabLikeSource, 'fab.definition.ts')
        const extended = file.definitions.get('PrimaryExtendedFabDefinition')!
        expect(extended.ownTokens.has('small-container-height')).toBe(true)
        expect(extended.ownTokens.has('small-icon-size')).toBe(true)
        expect(extended.ownTokens.has('label-color')).toBe(true)
        expect(extended.ownTokens.has('container-color')).toBe(true)
        expect(extended.unresolvedSpreads).toBeUndefined()
    })

    it('binds the 4-state schema', () => {
        const file = analyzeDefinitionFile(fabLikeSource, 'fab.definition.ts')
        const primary = file.definitions.get('PrimaryExtendedFabDefinition')!
        expect(primary.schema?.states).toEqual(['enabled', 'hovered', 'focused', 'pressed'])
    })

    it('legacy single-definition entry still returns the first definition', () => {
        const single = analyzeDefinitionSource(fabLikeSource, 'fab.definition.ts')!
        expect(single.name).toBe('PrimaryFabDefinition')
    })
})

describe('Real Definition Files (fab, focus-ring)', () => {
    it('parses the real fab.definition.ts: 12 definitions + FabVariants + spreads', () => {
        const file = analyzeDefinitionFile(realFabSource, 'fab.definition.ts')
        expect(file.definitions.size).toBe(12)
        expect(file.variants.get('FabVariants')).toEqual([
            'PrimaryExtendedFabDefinition',
            'SecondaryExtendedFabDefinition',
            'TertiaryExtendedFabDefinition',
            'TonalPrimaryExtendedFabDefinition',
            'TonalSecondaryExtendedFabDefinition',
            'TonalTertiaryExtendedFabDefinition'
        ])
        const extended = file.definitions.get('PrimaryExtendedFabDefinition')!
        expect(extended.ownTokens.has('container-height')).toBe(true)
        expect(extended.ownTokens.has('container-color')).toBe(true)
        expect(extended.ownTokens.has('container-shadow-color')).toBe(true)
        expect(extended.ownTokens.has('label-color')).toBe(true)
        expect(extended.unresolvedSpreads).toBeUndefined()
        expect(extended.schema?.states).toEqual(['small', 'medium', 'large'])
        const base = file.definitions.get('PrimaryFabDefinition')!
        expect(base.ownTokens.has('container-color')).toBe(true)
        expect(base.unresolvedSpreads).toBeUndefined()
    })

    it('parses the real focus-ring.definition.ts: 1 single-state scalar definition', () => {
        const file = analyzeDefinitionFile(realFocusRingSource, 'focus-ring.definition.ts')
        expect(file.definitions.size).toBe(1)
        const def = file.definitions.get('FocusRingDefinition')!
        expect(def.schema?.states).toEqual(['enabled'])
        expect(def.ownTokens.size).toBe(11)
        expect(def.ownTokens.get('duration')?.isTuple).toBe(false)
    })
})

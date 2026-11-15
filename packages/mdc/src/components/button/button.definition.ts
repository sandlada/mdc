/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { State } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, type PrimitiveTokenValue } from '../../utils/style'

export const ButtonInteractions = ['enabled', 'hovered', 'focused', 'pressed', 'disabled'] as const
export const ButtonVariants = ['filled', 'filled-tonal', 'elevated', 'outlined', 'text'] as const

export type ButtonInteractions = (typeof ButtonInteractions)[number]
export type ButtonVariants = (typeof ButtonVariants)[number]

type Cell = PrimitiveTokenValue | null
type InteractionVariantTable = Record<ButtonInteractions, Record<ButtonVariants, Cell>>

const flattenJoint2 = (key: string, pick: (interaction: ButtonInteractions, variant: ButtonVariants) => Cell): Record<string, Exclude<Cell, null>> => {
    const flat: Record<string, Exclude<Cell, null>> = {}
    for (const interaction of ButtonInteractions) {
        for (const variant of ButtonVariants) {
            const value = pick(interaction, variant)
            if (value !== null) {
                flat[`${interaction}-${variant}-${key}`] = value
            }
        }
    }
    return flat
}

const ContainerColorTable: InteractionVariantTable = {
    enabled: { filled: Color.Primary, 'filled-tonal': Color.SecondaryContainer, elevated: Color.SurfaceContainerLow, outlined: `transparent`, text: `transparent` },
    hovered: { filled: Color.Primary, 'filled-tonal': Color.SecondaryContainer, elevated: Color.SurfaceContainerLow, outlined: `transparent`, text: `transparent` },
    focused: { filled: Color.Primary, 'filled-tonal': Color.SecondaryContainer, elevated: Color.SurfaceContainerLow, outlined: `transparent`, text: `transparent` },
    pressed: { filled: Color.Primary, 'filled-tonal': Color.SecondaryContainer, elevated: Color.SurfaceContainerLow, outlined: `transparent`, text: `transparent` },
    disabled: { filled: Color.OnSurface, 'filled-tonal': Color.OnSurface, elevated: Color.OnSurface, outlined: Color.OnSurface, text: Color.OnSurface }
}

const ContainerShadowColorTable: InteractionVariantTable = {
    enabled: { filled: Color.Shadow, 'filled-tonal': Color.Shadow, elevated: Color.Shadow, outlined: null, text: null },
    hovered: { filled: Color.Shadow, 'filled-tonal': Color.Shadow, elevated: Color.Shadow, outlined: null, text: null },
    focused: { filled: Color.Shadow, 'filled-tonal': Color.Shadow, elevated: Color.Shadow, outlined: null, text: null },
    pressed: { filled: Color.Shadow, 'filled-tonal': Color.Shadow, elevated: Color.Shadow, outlined: null, text: null },
    disabled: { filled: Color.Shadow, 'filled-tonal': Color.Shadow, elevated: Color.Shadow, outlined: null, text: null }
}

const ContainerElevationTable: InteractionVariantTable = {
    enabled: { filled: `0`, 'filled-tonal': `0`, elevated: `1`, outlined: null, text: null },
    hovered: { filled: null, 'filled-tonal': `0`, elevated: `1`, outlined: null, text: null },
    focused: { filled: `0`, 'filled-tonal': `0`, elevated: `1`, outlined: null, text: null },
    pressed: { filled: `0`, 'filled-tonal': `0`, elevated: `1`, outlined: null, text: null },
    disabled: { filled: `0`, 'filled-tonal': `0`, elevated: `0`, outlined: null, text: null }
}

const LabelColorTable: InteractionVariantTable = {
    enabled: { filled: Color.OnPrimary, 'filled-tonal': Color.OnSecondaryContainer, elevated: Color.Primary, outlined: Color.OnSurfaceVariant, text: Color.Primary },
    hovered: { filled: Color.OnPrimary, 'filled-tonal': Color.OnSecondaryContainer, elevated: Color.Primary, outlined: Color.OnSurfaceVariant, text: Color.Primary },
    focused: { filled: Color.OnPrimary, 'filled-tonal': Color.OnSecondaryContainer, elevated: Color.Primary, outlined: Color.OnSurfaceVariant, text: Color.Primary },
    pressed: { filled: Color.OnPrimary, 'filled-tonal': Color.OnSecondaryContainer, elevated: Color.Primary, outlined: Color.OnSurfaceVariant, text: Color.Primary },
    disabled: { filled: Color.OnSurface, 'filled-tonal': Color.OnSurface, elevated: Color.OnSurface, outlined: Color.OnSurface, text: Color.OnSurface }
}

const IconColorTable: InteractionVariantTable = {
    enabled: { filled: Color.OnPrimary, 'filled-tonal': Color.OnSecondaryContainer, elevated: Color.Primary, outlined: Color.OnSurfaceVariant, text: Color.Primary },
    hovered: { filled: Color.OnPrimary, 'filled-tonal': Color.OnSecondaryContainer, elevated: Color.Primary, outlined: Color.OnSurfaceVariant, text: Color.Primary },
    focused: { filled: Color.OnPrimary, 'filled-tonal': Color.OnSecondaryContainer, elevated: Color.Primary, outlined: Color.OnSurfaceVariant, text: Color.Primary },
    pressed: { filled: Color.OnPrimary, 'filled-tonal': Color.OnSecondaryContainer, elevated: Color.Primary, outlined: Color.OnSurfaceVariant, text: Color.Primary },
    disabled: { filled: Color.OnSurface, 'filled-tonal': Color.OnSurface, elevated: Color.OnSurface, outlined: Color.OnSurface, text: Color.OnSurface }
}

const StateLayerColorTable: InteractionVariantTable = {
    enabled: { filled: null, 'filled-tonal': null, elevated: null, outlined: null, text: null },
    hovered: { filled: Color.OnPrimary, 'filled-tonal': Color.OnSecondaryContainer, elevated: Color.Primary, outlined: Color.OnSurfaceVariant, text: Color.Primary },
    focused: { filled: Color.OnPrimary, 'filled-tonal': Color.OnSecondaryContainer, elevated: Color.Primary, outlined: Color.OnSurfaceVariant, text: Color.Primary },
    pressed: { filled: Color.OnPrimary, 'filled-tonal': Color.OnSecondaryContainer, elevated: Color.Primary, outlined: Color.OnSurfaceVariant, text: Color.Primary },
    disabled: { filled: null, 'filled-tonal': null, elevated: null, outlined: null, text: null }
}

const OutlineColorTable: InteractionVariantTable = {
    enabled: { filled: null, 'filled-tonal': null, elevated: null, outlined: Color.OutlineVariant, text: null },
    hovered: { filled: null, 'filled-tonal': null, elevated: null, outlined: Color.OutlineVariant, text: null },
    focused: { filled: null, 'filled-tonal': null, elevated: null, outlined: Color.OutlineVariant, text: null },
    pressed: { filled: null, 'filled-tonal': null, elevated: null, outlined: Color.OutlineVariant, text: null },
    disabled: { filled: null, 'filled-tonal': null, elevated: null, outlined: Color.OutlineVariant, text: null }
}

export const ButtonDefinition = createStyleDefinition({
    ...flattenJoint2('container-color', (interaction, variant) => ContainerColorTable[interaction][variant]),
    ...flattenJoint2('container-shadow-color', (interaction, variant) => ContainerShadowColorTable[interaction][variant]),
    ...flattenJoint2('container-elevation', (interaction, variant) => ContainerElevationTable[interaction][variant]),
    ...flattenJoint2('label-color', (interaction, variant) => LabelColorTable[interaction][variant]),
    ...flattenJoint2('icon-color', (interaction, variant) => IconColorTable[interaction][variant]),
    ...flattenJoint2('state-layer-color', (interaction, variant) => StateLayerColorTable[interaction][variant]),
    ...flattenJoint2('outline-color', (interaction, variant) => OutlineColorTable[interaction][variant]),

    'state-layer-opacity': {
        hovered: State.HoveredStateLayerOpacity,
        focused: State.FocusedStateLayerOpacity,
        pressed: State.PressedStateLayerOpacity
    },
    'container-opacity': { disabled: `0.1` },
    'label-opacity': { disabled: `0.38` },
    'icon-opacity': { disabled: `0.38` }
})

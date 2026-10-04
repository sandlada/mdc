/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { State } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, defineSchema, type NDJointArray, type PrimitiveTokenValue } from '@sandlada/styles/schema'

export const ButtonInteractions = ['enabled', 'hovered', 'focused', 'pressed', 'disabled'] as const
export const ButtonVariants = ['filled', 'filled-tonal', 'elevated', 'outlined', 'text'] as const

export type ButtonInteraction = (typeof ButtonInteractions)[number]
export type ButtonVariant = (typeof ButtonVariants)[number]

export const ButtonSchema = defineSchema([
    ButtonInteractions,
    ButtonVariants
])

type Cell = PrimitiveTokenValue | null
type InteractionVariantTable = Record<ButtonInteraction, Record<ButtonVariant, Cell>>

const joint2 = (pick: (interaction: ButtonInteraction, variant: ButtonVariant) => Cell): NDJointArray =>
    ButtonInteractions.map(interaction =>
        ButtonVariants.map(variant => pick(interaction, variant))
    )

const containerColorTable: InteractionVariantTable = {
    enabled: { filled: Color.Primary, 'filled-tonal': Color.SecondaryContainer, elevated: Color.SurfaceContainerLow, outlined: `transparent`, text: `transparent` },
    hovered: { filled: Color.Primary, 'filled-tonal': Color.SecondaryContainer, elevated: Color.SurfaceContainerLow, outlined: `transparent`, text: `transparent` },
    focused: { filled: Color.Primary, 'filled-tonal': Color.SecondaryContainer, elevated: Color.SurfaceContainerLow, outlined: `transparent`, text: `transparent` },
    pressed: { filled: Color.Primary, 'filled-tonal': Color.SecondaryContainer, elevated: Color.SurfaceContainerLow, outlined: `transparent`, text: `transparent` },
    disabled: { filled: Color.OnSurface, 'filled-tonal': Color.OnSurface, elevated: Color.OnSurface, outlined: Color.OnSurface, text: Color.OnSurface }
}

const containerShadowColorTable: InteractionVariantTable = {
    enabled: { filled: Color.Shadow, 'filled-tonal': Color.Shadow, elevated: Color.Shadow, outlined: null, text: null },
    hovered: { filled: Color.Shadow, 'filled-tonal': Color.Shadow, elevated: Color.Shadow, outlined: null, text: null },
    focused: { filled: Color.Shadow, 'filled-tonal': Color.Shadow, elevated: Color.Shadow, outlined: null, text: null },
    pressed: { filled: Color.Shadow, 'filled-tonal': Color.Shadow, elevated: Color.Shadow, outlined: null, text: null },
    disabled: { filled: Color.Shadow, 'filled-tonal': Color.Shadow, elevated: Color.Shadow, outlined: null, text: null }
}

const containerElevationTable: InteractionVariantTable = {
    enabled: { filled: `0`, 'filled-tonal': `0`, elevated: `1`, outlined: null, text: null },
    hovered: { filled: null, 'filled-tonal': `0`, elevated: `1`, outlined: null, text: null },
    focused: { filled: `0`, 'filled-tonal': `0`, elevated: `1`, outlined: null, text: null },
    pressed: { filled: `0`, 'filled-tonal': `0`, elevated: `1`, outlined: null, text: null },
    disabled: { filled: `0`, 'filled-tonal': `0`, elevated: `0`, outlined: null, text: null }
}

const labelColorTable: InteractionVariantTable = {
    enabled: { filled: Color.OnPrimary, 'filled-tonal': Color.OnSecondaryContainer, elevated: Color.Primary, outlined: Color.OnSurfaceVariant, text: Color.Primary },
    hovered: { filled: Color.OnPrimary, 'filled-tonal': Color.OnSecondaryContainer, elevated: Color.Primary, outlined: Color.OnSurfaceVariant, text: Color.Primary },
    focused: { filled: Color.OnPrimary, 'filled-tonal': Color.OnSecondaryContainer, elevated: Color.Primary, outlined: Color.OnSurfaceVariant, text: Color.Primary },
    pressed: { filled: Color.OnPrimary, 'filled-tonal': Color.OnSecondaryContainer, elevated: Color.Primary, outlined: Color.OnSurfaceVariant, text: Color.Primary },
    disabled: { filled: Color.OnSurface, 'filled-tonal': Color.OnSurface, elevated: Color.OnSurface, outlined: Color.OnSurface, text: Color.OnSurface }
}

const iconColorTable: InteractionVariantTable = {
    enabled: { filled: Color.OnPrimary, 'filled-tonal': Color.OnSecondaryContainer, elevated: Color.Primary, outlined: Color.OnSurfaceVariant, text: Color.Primary },
    hovered: { filled: Color.OnPrimary, 'filled-tonal': Color.OnSecondaryContainer, elevated: Color.Primary, outlined: Color.OnSurfaceVariant, text: Color.Primary },
    focused: { filled: Color.OnPrimary, 'filled-tonal': Color.OnSecondaryContainer, elevated: Color.Primary, outlined: Color.OnSurfaceVariant, text: Color.Primary },
    pressed: { filled: Color.OnPrimary, 'filled-tonal': Color.OnSecondaryContainer, elevated: Color.Primary, outlined: Color.OnSurfaceVariant, text: Color.Primary },
    disabled: { filled: Color.OnSurface, 'filled-tonal': Color.OnSurface, elevated: Color.OnSurface, outlined: Color.OnSurface, text: Color.OnSurface }
}

const stateLayerColorTable: InteractionVariantTable = {
    enabled: { filled: null, 'filled-tonal': null, elevated: null, outlined: null, text: null },
    hovered: { filled: Color.OnPrimary, 'filled-tonal': Color.OnSecondaryContainer, elevated: Color.Primary, outlined: Color.OnSurfaceVariant, text: Color.Primary },
    focused: { filled: Color.OnPrimary, 'filled-tonal': Color.OnSecondaryContainer, elevated: Color.Primary, outlined: Color.OnSurfaceVariant, text: Color.Primary },
    pressed: { filled: Color.OnPrimary, 'filled-tonal': Color.OnSecondaryContainer, elevated: Color.Primary, outlined: Color.OnSurfaceVariant, text: Color.Primary },
    disabled: { filled: null, 'filled-tonal': null, elevated: null, outlined: null, text: null }
}

const outlineColorTable: InteractionVariantTable = {
    enabled: { filled: null, 'filled-tonal': null, elevated: null, outlined: Color.OutlineVariant, text: null },
    hovered: { filled: null, 'filled-tonal': null, elevated: null, outlined: Color.OutlineVariant, text: null },
    focused: { filled: null, 'filled-tonal': null, elevated: null, outlined: Color.OutlineVariant, text: null },
    pressed: { filled: null, 'filled-tonal': null, elevated: null, outlined: Color.OutlineVariant, text: null },
    disabled: { filled: null, 'filled-tonal': null, elevated: null, outlined: Color.OutlineVariant, text: null }
}

export const ButtonDefinition = createStyleDefinition(ButtonSchema)({
    'container-color': joint2((interaction, variant) => containerColorTable[interaction][variant]),
    'container-shadow-color': joint2((interaction, variant) => containerShadowColorTable[interaction][variant]),
    'container-elevation': joint2((interaction, variant) => containerElevationTable[interaction][variant]),
    'label-color': joint2((interaction, variant) => labelColorTable[interaction][variant]),
    'icon-color': joint2((interaction, variant) => iconColorTable[interaction][variant]),
    'state-layer-color': joint2((interaction, variant) => stateLayerColorTable[interaction][variant]),
    'outline-color': joint2((interaction, variant) => outlineColorTable[interaction][variant]),

    'state-layer-opacity': {
        hovered: State.HoveredStateLayerOpacity,
        focused: State.FocusedStateLayerOpacity,
        pressed: State.PressedStateLayerOpacity
    },
    'container-opacity': { disabled: `0.1` },
    'label-opacity': { disabled: `0.38` },
    'icon-opacity': { disabled: `0.38` }
})

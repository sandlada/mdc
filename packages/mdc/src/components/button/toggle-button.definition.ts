/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { State } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, defineSchema, type NDJointArray, type PrimitiveTokenValue } from '@sandlada/styles/schema'
import { ButtonInteractions, ButtonVariants, type ButtonInteraction, type ButtonVariant } from './button.definition'

export const ToggleStates = ['unselected', 'selected'] as const

export type ToggleState = (typeof ToggleStates)[number]

export const ToggleButtonSchema = defineSchema([
    ButtonInteractions,
    ButtonVariants,
    ToggleStates
])

type Cell = PrimitiveTokenValue | null
type ToggleTable = Record<ButtonInteraction, Record<ButtonVariant, readonly [Cell, Cell]>>

const joint3 = (pick: (interaction: ButtonInteraction, variant: ButtonVariant, toggle: ToggleState) => Cell): NDJointArray =>
    ButtonInteractions.map(interaction =>
        ButtonVariants.map(variant =>
            ToggleStates.map(toggle => pick(interaction, variant, toggle))
        )
    )

const joint3FromPairs = (table: ToggleTable): NDJointArray =>
    joint3((interaction, variant, toggle) => table[interaction][variant][toggle === 'selected' ? 1 : 0])

const toggleContainerColorTable: ToggleTable = {
    enabled: { filled: [Color.SurfaceContainer, Color.Primary], 'filled-tonal': [Color.SecondaryContainer, Color.Secondary], elevated: [Color.SurfaceContainerLow, Color.Primary], outlined: [`transparent`, Color.InverseSurface], text: [`transparent`, `transparent`] },
    hovered: { filled: [Color.SurfaceContainer, Color.Primary], 'filled-tonal': [Color.SecondaryContainer, Color.Secondary], elevated: [Color.SurfaceContainerLow, Color.Primary], outlined: [`transparent`, Color.InverseSurface], text: [`transparent`, `transparent`] },
    focused: { filled: [Color.SurfaceContainer, Color.Primary], 'filled-tonal': [Color.SecondaryContainer, Color.Secondary], elevated: [Color.SurfaceContainerLow, Color.Primary], outlined: [`transparent`, Color.InverseSurface], text: [`transparent`, `transparent`] },
    pressed: { filled: [Color.SurfaceContainer, Color.Primary], 'filled-tonal': [Color.SecondaryContainer, Color.Secondary], elevated: [Color.SurfaceContainerLow, Color.Primary], outlined: [`transparent`, Color.InverseSurface], text: [`transparent`, `transparent`] },
    disabled: { filled: [Color.OnSurface, Color.OnSurface], 'filled-tonal': [Color.OnSurface, Color.OnSurface], elevated: [Color.OnSurface, Color.OnSurface], outlined: [Color.OnSurface, Color.OnSurface], text: [Color.OnSurface, Color.OnSurface] }
}

const toggleLabelColorTable: ToggleTable = {
    enabled: { filled: [Color.OnSurfaceVariant, Color.OnPrimary], 'filled-tonal': [Color.OnSecondaryContainer, Color.OnSecondary], elevated: [Color.Primary, Color.OnPrimary], outlined: [Color.OnSurfaceVariant, Color.InverseOnSurface], text: [Color.Primary, Color.Primary] },
    hovered: { filled: [Color.OnSurfaceVariant, Color.OnPrimary], 'filled-tonal': [Color.OnSecondaryContainer, Color.OnSecondary], elevated: [Color.Primary, Color.OnPrimary], outlined: [Color.OnSurfaceVariant, Color.InverseOnSurface], text: [Color.Primary, Color.Primary] },
    focused: { filled: [Color.OnSurfaceVariant, Color.OnPrimary], 'filled-tonal': [Color.OnSecondaryContainer, Color.OnSecondary], elevated: [Color.Primary, Color.OnPrimary], outlined: [Color.OnSurfaceVariant, Color.InverseOnSurface], text: [Color.Primary, Color.Primary] },
    pressed: { filled: [Color.OnSurfaceVariant, Color.OnPrimary], 'filled-tonal': [Color.OnSecondaryContainer, Color.OnSecondary], elevated: [Color.Primary, Color.OnPrimary], outlined: [Color.OnSurfaceVariant, Color.InverseOnSurface], text: [Color.Primary, Color.Primary] },
    disabled: { filled: [Color.OnSurface, Color.OnSurface], 'filled-tonal': [Color.OnSurface, Color.OnSurface], elevated: [Color.OnSurface, Color.OnSurface], outlined: [Color.OnSurface, Color.OnSurface], text: [Color.OnSurface, Color.OnSurface] }
}

const toggleIconColorTable: ToggleTable = {
    enabled: { filled: [Color.OnSurfaceVariant, Color.OnPrimary], 'filled-tonal': [Color.OnSecondaryContainer, Color.OnSecondary], elevated: [Color.Primary, Color.OnPrimary], outlined: [Color.OnSurfaceVariant, Color.InverseOnSurface], text: [Color.Primary, Color.Primary] },
    hovered: { filled: [Color.OnSurfaceVariant, Color.OnPrimary], 'filled-tonal': [Color.OnSecondaryContainer, Color.OnSecondary], elevated: [Color.Primary, Color.OnPrimary], outlined: [Color.OnSurfaceVariant, Color.InverseOnSurface], text: [Color.Primary, Color.Primary] },
    focused: { filled: [Color.OnSurfaceVariant, Color.OnPrimary], 'filled-tonal': [Color.OnSecondaryContainer, Color.OnSecondary], elevated: [Color.Primary, Color.OnPrimary], outlined: [Color.OnSurfaceVariant, Color.InverseOnSurface], text: [Color.Primary, Color.Primary] },
    pressed: { filled: [Color.OnSurfaceVariant, Color.OnPrimary], 'filled-tonal': [Color.OnSecondaryContainer, Color.OnSecondary], elevated: [Color.Primary, Color.OnPrimary], outlined: [Color.OnSurfaceVariant, Color.InverseOnSurface], text: [Color.Primary, Color.Primary] },
    disabled: { filled: [Color.OnSurface, Color.OnSurface], 'filled-tonal': [Color.OnSurface, Color.OnSurface], elevated: [Color.OnSurface, Color.OnSurface], outlined: [Color.OnSurface, Color.OnSurface], text: [Color.OnSurface, Color.OnSurface] }
}

const toggleStateLayerColorTable: ToggleTable = {
    enabled: { filled: [null, null], 'filled-tonal': [null, null], elevated: [null, null], outlined: [null, null], text: [null, null] },
    hovered: { filled: [Color.OnSurfaceVariant, Color.OnPrimary], 'filled-tonal': [Color.OnSecondaryContainer, Color.OnSecondary], elevated: [Color.Primary, Color.OnPrimary], outlined: [Color.OnSurfaceVariant, Color.InverseOnSurface], text: [Color.Primary, Color.Primary] },
    focused: { filled: [Color.OnSurfaceVariant, Color.OnPrimary], 'filled-tonal': [Color.OnSecondaryContainer, Color.OnSecondary], elevated: [Color.Primary, Color.OnPrimary], outlined: [Color.OnSurfaceVariant, Color.InverseOnSurface], text: [Color.Primary, Color.Primary] },
    pressed: { filled: [Color.OnSurfaceVariant, Color.OnPrimary], 'filled-tonal': [Color.OnSecondaryContainer, Color.OnSecondary], elevated: [Color.Primary, Color.OnPrimary], outlined: [Color.OnSurfaceVariant, Color.InverseOnSurface], text: [Color.Primary, Color.Primary] },
    disabled: { filled: [null, null], 'filled-tonal': [null, null], elevated: [null, null], outlined: [null, null], text: [null, null] }
}

const toggleOutlineColorTable: ToggleTable = {
    enabled: { filled: [null, null], 'filled-tonal': [null, null], elevated: [null, null], outlined: [Color.OutlineVariant, `transparent`], text: [null, null] },
    hovered: { filled: [null, null], 'filled-tonal': [null, null], elevated: [null, null], outlined: [Color.OutlineVariant, `transparent`], text: [null, null] },
    focused: { filled: [null, null], 'filled-tonal': [null, null], elevated: [null, null], outlined: [Color.OutlineVariant, `transparent`], text: [null, null] },
    pressed: { filled: [null, null], 'filled-tonal': [null, null], elevated: [null, null], outlined: [Color.OutlineVariant, `transparent`], text: [null, null] },
    disabled: { filled: [null, null], 'filled-tonal': [null, null], elevated: [null, null], outlined: [Color.OutlineVariant, `transparent`], text: [null, null] }
}

const containerShadowColorTable: Record<ButtonInteraction, Record<ButtonVariant, Cell>> = {
    enabled: { filled: Color.Shadow, 'filled-tonal': Color.Shadow, elevated: Color.Shadow, outlined: null, text: null },
    hovered: { filled: Color.Shadow, 'filled-tonal': Color.Shadow, elevated: Color.Shadow, outlined: null, text: null },
    focused: { filled: Color.Shadow, 'filled-tonal': Color.Shadow, elevated: Color.Shadow, outlined: null, text: null },
    pressed: { filled: Color.Shadow, 'filled-tonal': Color.Shadow, elevated: Color.Shadow, outlined: null, text: null },
    disabled: { filled: Color.Shadow, 'filled-tonal': Color.Shadow, elevated: Color.Shadow, outlined: null, text: null }
}

const containerElevationTable: Record<ButtonInteraction, Record<ButtonVariant, Cell>> = {
    enabled: { filled: `0`, 'filled-tonal': `0`, elevated: `1`, outlined: null, text: null },
    hovered: { filled: null, 'filled-tonal': `0`, elevated: `1`, outlined: null, text: null },
    focused: { filled: `0`, 'filled-tonal': `0`, elevated: `1`, outlined: null, text: null },
    pressed: { filled: `0`, 'filled-tonal': `0`, elevated: `1`, outlined: null, text: null },
    disabled: { filled: `0`, 'filled-tonal': `0`, elevated: `0`, outlined: null, text: null }
}

export const ToggleButtonDefinition = createStyleDefinition(ToggleButtonSchema)({
    'container-color': joint3FromPairs(toggleContainerColorTable),
    'label-color': joint3FromPairs(toggleLabelColorTable),
    'icon-color': joint3FromPairs(toggleIconColorTable),
    'state-layer-color': joint3FromPairs(toggleStateLayerColorTable),
    'outline-color': joint3FromPairs(toggleOutlineColorTable),
    'container-shadow-color': joint3((interaction, variant) => containerShadowColorTable[interaction][variant]),
    'container-elevation': joint3((interaction, variant) => containerElevationTable[interaction][variant]),

    'state-layer-opacity': {
        hovered: State.HoveredStateLayerOpacity,
        focused: State.FocusedStateLayerOpacity,
        pressed: State.PressedStateLayerOpacity
    },
    'container-opacity': { disabled: `0.1` },
    'label-opacity': { disabled: `0.38` },
    'icon-opacity': { disabled: `0.38` }
})

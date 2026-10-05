/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { State } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, type PrimitiveTokenValue } from '../../utils/style'
import { ButtonInteractions, ButtonVariants, type ButtonInteraction, type ButtonVariant } from './button.definition'

export const ToggleStates = ['unselected', 'selected'] as const

export type ToggleState = (typeof ToggleStates)[number]

type Cell = PrimitiveTokenValue | null
type ToggleTable = Record<ButtonInteraction, Record<ButtonVariant, readonly [Cell, Cell]>>

const flattenJoint3 = (key: string, pick: (interaction: ButtonInteraction, variant: ButtonVariant, toggle: ToggleState) => Cell): Record<string, Exclude<Cell, null>> => {
    const flat: Record<string, Exclude<Cell, null>> = {}
    for (const interaction of ButtonInteractions) {
        for (const variant of ButtonVariants) {
            for (const toggle of ToggleStates) {
                const value = pick(interaction, variant, toggle)
                if (value !== null) {
                    flat[`${interaction}-${variant}-${toggle}-${key}`] = value
                }
            }
        }
    }
    return flat
}

const flattenJoint3FromPairs = (key: string, table: ToggleTable): Record<string, Exclude<Cell, null>> =>
    flattenJoint3(key, (interaction, variant, toggle) => table[interaction][variant][toggle === 'selected' ? 1 : 0])

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

export const ToggleButtonDefinition = createStyleDefinition({
    ...flattenJoint3FromPairs('container-color', toggleContainerColorTable),
    ...flattenJoint3FromPairs('label-color', toggleLabelColorTable),
    ...flattenJoint3FromPairs('icon-color', toggleIconColorTable),
    ...flattenJoint3FromPairs('state-layer-color', toggleStateLayerColorTable),
    ...flattenJoint3FromPairs('outline-color', toggleOutlineColorTable),
    ...flattenJoint3('container-shadow-color', (interaction, variant) => containerShadowColorTable[interaction][variant]),
    ...flattenJoint3('container-elevation', (interaction, variant) => containerElevationTable[interaction][variant]),

    'state-layer-opacity': {
        hovered: State.HoveredStateLayerOpacity,
        focused: State.FocusedStateLayerOpacity,
        pressed: State.PressedStateLayerOpacity
    },
    'container-opacity': { disabled: `0.1` },
    'label-opacity': { disabled: `0.38` },
    'icon-opacity': { disabled: `0.38` }
})

/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, defineSchema, type NDJointArray, type PrimitiveTokenValue } from '@sandlada/styles/schema'
import { expandPadding, expandTypescale } from '@sandlada/styles/tokens'

export const ButtonInteractions = ['enabled', 'hovered', 'focused', 'pressed', 'disabled'] as const
export const ButtonVariants = ['filled', 'filled-tonal', 'elevated', 'outlined', 'text'] as const
export const ToggleStates = ['unselected', 'selected'] as const

export type ButtonInteraction = (typeof ButtonInteractions)[number]
export type ButtonVariant = (typeof ButtonVariants)[number]
export type ToggleState = (typeof ToggleStates)[number]

export const ButtonSchema = defineSchema([
    ButtonInteractions,
    ButtonVariants
])

export const ToggleButtonSchema = defineSchema([
    ButtonInteractions,
    ButtonVariants,
    ToggleStates
])

type Cell = PrimitiveTokenValue | null
type InteractionVariantTable = Record<ButtonInteraction, Record<ButtonVariant, Cell>>
type ToggleTable = Record<ButtonInteraction, Record<ButtonVariant, readonly [Cell, Cell]>>

const joint2 = (pick: (interaction: ButtonInteraction, variant: ButtonVariant) => Cell): NDJointArray =>
    ButtonInteractions.map(interaction =>
        ButtonVariants.map(variant => pick(interaction, variant))
    )

const joint3 = (pick: (interaction: ButtonInteraction, variant: ButtonVariant, toggle: ToggleState) => Cell): NDJointArray =>
    ButtonInteractions.map(interaction =>
        ButtonVariants.map(variant =>
            ToggleStates.map(toggle => pick(interaction, variant, toggle))
        )
    )

const joint3FromPairs = (table: ToggleTable): NDJointArray =>
    joint3((interaction, variant, toggle) => table[interaction][variant][toggle === 'selected' ? 1 : 0])

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

const SIZES = ['extra-small', 'small', 'medium', 'large', 'extra-large'] as const
const SHAPES = ['round', 'square'] as const
const SHAPE_CORNERS = ['start-start', 'start-end', 'end-start', 'end-end'] as const

type SizeName = (typeof SIZES)[number]
type ShapeName = (typeof SHAPES)[number]

const expandShapeTable = (
    keyPrefix: (size: SizeName, shape: ShapeName) => string,
    table: Record<SizeName, Record<ShapeName, PrimitiveTokenValue>>
): Record<string, PrimitiveTokenValue> => {
    const out: Record<string, PrimitiveTokenValue> = {}
    for (const size of SIZES) {
        for (const shape of SHAPES) {
            for (const corner of SHAPE_CORNERS) {
                out[`${keyPrefix(size, shape)}-${corner}`] = table[size][shape]
            }
        }
    }
    return out
}

const expandSingleShapeTable = (
    keyPrefix: (size: SizeName) => string,
    table: Record<SizeName, PrimitiveTokenValue>
): Record<string, PrimitiveTokenValue> => {
    const out: Record<string, PrimitiveTokenValue> = {}
    for (const size of SIZES) {
        for (const corner of SHAPE_CORNERS) {
            out[`${keyPrefix(size)}-${corner}`] = table[size]
        }
    }
    return out
}

const shapeTable: Record<SizeName, Record<ShapeName, PrimitiveTokenValue>> = {
    'extra-small': { round: Shape.Full, square: Shape.Medium },
    small: { round: Shape.Full, square: Shape.Medium },
    medium: { round: Shape.Full, square: Shape.Large },
    large: { round: Shape.Full, square: Shape.ExtraLarge },
    'extra-large': { round: Shape.Full, square: Shape.ExtraLarge }
}

const selectedShapeTable: Record<SizeName, Record<ShapeName, PrimitiveTokenValue>> = {
    'extra-small': { round: Shape.Medium, square: Shape.Full },
    small: { round: Shape.Medium, square: Shape.Full },
    medium: { round: Shape.Large, square: Shape.Full },
    large: { round: Shape.ExtraLarge, square: Shape.Full },
    'extra-large': { round: Shape.ExtraLarge, square: Shape.Full }
}

const morphShapeTable: Record<SizeName, PrimitiveTokenValue> = {
    'extra-small': Shape.Small,
    small: Shape.Small,
    medium: Shape.Medium,
    large: Shape.Large,
    'extra-large': Shape.Large
}

const buttonSharedTokens = {
    ...expandTypescale('extra-small-label')(Typescale.LabelLarge),
    ...expandTypescale('small-label')(Typescale.LabelLarge),
    ...expandTypescale('medium-label')(Typescale.TitleMedium),
    ...expandTypescale('large-label')(Typescale.HeadlineSmall),
    ...expandTypescale('extra-large-label')(Typescale.HeadlineLarge),

    ...expandPadding('extra-small-container')({ block: `0px`, inlineStart: `12px`, inlineEnd: `12px` }),
    ...expandPadding('small-container')({ block: `0px`, inlineStart: `16px`, inlineEnd: `16px` }),
    ...expandPadding('medium-container')({ block: `0px`, inlineStart: `24px`, inlineEnd: `24px` }),
    ...expandPadding('large-container')({ block: `0px`, inlineStart: `48px`, inlineEnd: `48px` }),
    ...expandPadding('extra-large-container')({ block: `0px`, inlineStart: `64px`, inlineEnd: `64px` }),

    ...expandShapeTable((size, shape) => `${size}-container-shape-${shape}`, shapeTable),
    ...expandSingleShapeTable((size) => `${size}-container-shape-pressed-morph`, morphShapeTable),

    'extra-small-container-height': `32px`,
    'small-container-height': `40px`,
    'medium-container-height': `56px`,
    'large-container-height': `96px`,
    'extra-large-container-height': `136px`,

    'extra-small-outline-width': `1px`,
    'small-outline-width': `1px`,
    'medium-outline-width': `1px`,
    'large-outline-width': `2px`,
    'extra-large-outline-width': `3px`,

    'extra-small-icon-size': `20px`,
    'small-icon-size': `20px`,
    'medium-icon-size': `24px`,
    'large-icon-size': `32px`,
    'extra-large-icon-size': `40px`,

    'extra-small-icon-label-space': `8px`,
    'small-icon-label-space': `8px`,
    'medium-icon-label-space': `8px`,
    'large-icon-label-space': `12px`,
    'extra-large-icon-label-space': `16px`
} as const

export const ButtonDefinition = createStyleDefinition(ButtonSchema)({
    ...buttonSharedTokens,

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

export const ToggleButtonDefinition = createStyleDefinition(ToggleButtonSchema)({
    ...buttonSharedTokens,

    ...expandShapeTable((size, shape) => `${size}-container-shape-${shape}-selected`, selectedShapeTable),

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

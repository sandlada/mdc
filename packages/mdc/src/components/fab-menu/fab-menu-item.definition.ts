/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import {
    createStyleDefinition,
    expandPadding,
    expandShape,
    expandTypescale,
    type PrimitiveTokenValue,
} from '../../utils/style'

const FabMenuItemSharedTokens = {
    ...expandShape('container-shape')(Shape.Full),
    ...expandPadding('container')({
        block: '0px',
        inlineStart: '24px',
        inlineEnd: '24px',
    }),
    ...expandTypescale('label')(Typescale.TitleMedium),

    'container-height': '56px',
    'icon-size': '24px',
    'icon-label-space': '8px',

    'enabled-container-shadow-color': Color.Shadow,
    'enabled-container-elevation': '3',
    'hovered-container-elevation': '4',
    'focused-container-elevation': '3',
    'pressed-container-elevation': '3',
    'disabled-container-elevation': '0',

    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,

    'disabled-container-color': Color.OnSurface,
    'disabled-container-opacity': '0.12',
    'disabled-label-color': Color.OnSurface,
    'disabled-label-opacity': '0.38',
    'disabled-icon-color': Color.OnSurface,
    'disabled-icon-opacity': '0.38',
} as const

const fabMenuItemVariantTokens = (
    containerColor: PrimitiveTokenValue,
    contentColor: PrimitiveTokenValue,
) => ({
    ...FabMenuItemSharedTokens,

    'enabled-container-color': containerColor,
    'enabled-label-color': contentColor,
    'hovered-label-color': contentColor,
    'focused-label-color': contentColor,
    'pressed-label-color': contentColor,
    'enabled-icon-color': contentColor,
    'hovered-icon-color': contentColor,
    'focused-icon-color': contentColor,
    'pressed-icon-color': contentColor,
    'hovered-state-layer-color': contentColor,
    'focused-state-layer-color': contentColor,
    'pressed-state-layer-color': contentColor,
})

export const PrimaryFabMenuItemDefinition = createStyleDefinition(
    fabMenuItemVariantTokens(Color.PrimaryContainer, Color.OnPrimaryContainer)
)

export const SecondaryFabMenuItemDefinition = createStyleDefinition(
    fabMenuItemVariantTokens(Color.SecondaryContainer, Color.OnSecondaryContainer)
)

export const TertiaryFabMenuItemDefinition = createStyleDefinition(
    fabMenuItemVariantTokens(Color.TertiaryContainer, Color.OnTertiaryContainer)
)

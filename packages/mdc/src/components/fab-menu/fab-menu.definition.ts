/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape, State } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandShape, type PrimitiveTokenValue } from '../../utils/style'

const FabMenuSharedTokens = {
    ...expandShape('container-shape')({
        small: Shape.Large,
        medium: Shape.LargeIncreased,
        large: Shape.ExtraLarge,
    }),
    ...expandShape('close-button-container-shape')(Shape.Full),

    'small-container-height': '56px',
    'small-container-width': '56px',
    'small-icon-size': '24px',

    'medium-container-height': '80px',
    'medium-container-width': '80px',
    'medium-icon-size': '28px',

    'large-container-height': '96px',
    'large-container-width': '96px',
    'large-icon-size': '36px',

    'close-button-container-height': '56px',
    'close-button-container-width': '56px',
    'close-button-icon-size': '24px',

    'close-button-between-space': '8px',
    'item-between-space': '4px',

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
    'disabled-icon-color': Color.OnSurface,
    'disabled-icon-opacity': '0.38',
} as const

const fabMenuVariantTokens = (
    closedContainerColor: PrimitiveTokenValue,
    closedContentColor: PrimitiveTokenValue,
    closeButtonContainerColor: PrimitiveTokenValue,
    closeButtonContentColor: PrimitiveTokenValue,
) => ({
    ...FabMenuSharedTokens,

    'enabled-container-color': closedContainerColor,
    'enabled-icon-color': closedContentColor,
    'hovered-icon-color': closedContentColor,
    'focused-icon-color': closedContentColor,
    'pressed-icon-color': closedContentColor,
    'hovered-state-layer-color': closedContentColor,
    'focused-state-layer-color': closedContentColor,
    'pressed-state-layer-color': closedContentColor,

    'close-button-enabled-container-color': closeButtonContainerColor,
    'close-button-enabled-icon-color': closeButtonContentColor,
    'close-button-hovered-icon-color': closeButtonContentColor,
    'close-button-focused-icon-color': closeButtonContentColor,
    'close-button-pressed-icon-color': closeButtonContentColor,
    'close-button-hovered-state-layer-color': closeButtonContentColor,
    'close-button-focused-state-layer-color': closeButtonContentColor,
    'close-button-pressed-state-layer-color': closeButtonContentColor,
})

export const PrimaryFabMenuDefinition = createStyleDefinition(
    fabMenuVariantTokens(
        Color.PrimaryContainer,
        Color.OnPrimaryContainer,
        Color.Primary,
        Color.OnPrimary,
    )
)

export const SecondaryFabMenuDefinition = createStyleDefinition(
    fabMenuVariantTokens(
        Color.SecondaryContainer,
        Color.OnSecondaryContainer,
        Color.Secondary,
        Color.OnSecondary,
    )
)

export const TertiaryFabMenuDefinition = createStyleDefinition(
    fabMenuVariantTokens(
        Color.TertiaryContainer,
        Color.OnTertiaryContainer,
        Color.Tertiary,
        Color.OnTertiary,
    )
)

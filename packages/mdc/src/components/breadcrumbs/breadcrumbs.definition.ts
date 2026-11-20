/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version
 * 1.0.0
 */
import { Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import {
    createStyleDefinition,
    expandPadding,
    expandShape,
    expandTypescale,
} from '../../utils/style'

export const BreadcrumbsDefinition = createStyleDefinition({
    // Geometry per size
    'item-height': {
        'small' : `28px`,
        'medium': `32px`,
        'large' : `40px`,
    },
    'item-gap': {
        'small' : `4px`,
        'medium': `6px`,
        'large' : `8px`,
    },
    'separator-gap': {
        'small' : `2px`,
        'medium': `4px`,
        'large' : `6px`,
    },
    'icon-size': {
        'small' : `16px`,
        'medium': `18px`,
        'large' : `20px`,
    },
    'separator-size': {
        'small' : `16px`,
        'medium': `18px`,
        'large' : `20px`,
    },
    ...expandPadding('item-padding')({
        'small' : { block: `0px`, inline: `8px` },
        'medium': { block: `0px`, inline: `10px` },
        'large' : { block: `0px`, inline: `12px` },
    }),

    // Shapes
    ...expandShape('round-item-shape')(Shape.Full),
    ...expandShape('square-item-shape')({
        'small' : Shape.ExtraSmall,
        'medium': Shape.Small,
        'large' : Shape.Medium,
    }),

    // Standard variant colors
    'enabled-item-container-color'  : `transparent`,
    'enabled-item-label-color'      : Color.OnSurfaceVariant,
    'enabled-item-icon-color'       : Color.OnSurfaceVariant,
    'hovered-item-label-color'      : Color.OnSurface,
    'enabled-current-label-color'   : Color.OnSurface,
    'enabled-current-icon-color'    : Color.OnSurface,

    // Tonal variant colors
    'enabled-tonal-container-color'         : Color.SurfaceContainerHigh,
    'enabled-tonal-current-container-color' : Color.SecondaryContainer,
    'enabled-tonal-current-label-color'     : Color.OnSecondaryContainer,

    // Outlined variant colors
    'enabled-outlined-outline-color' : Color.OutlineVariant,
    'outlined-outline-width'         : `1px`,

    // Separator & overflow trigger
    'enabled-separator-color'       : Color.OnSurfaceVariant,
    'enabled-overflow-icon-color'   : Color.OnSurfaceVariant,

    // Typography
    ...expandTypescale('item-label')({
        'small' : Typescale.LabelMedium,
        'medium': Typescale.LabelLarge,
        'large' : Typescale.TitleSmall,
    }),

    // State layers & disabled
    'hovered-state-layer-opacity' : State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity' : State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity' : State.PressedStateLayerOpacity,
    'state-layer-color'           : Color.OnSurface,
    'disabled-content-opacity'    : `0.38`,
})

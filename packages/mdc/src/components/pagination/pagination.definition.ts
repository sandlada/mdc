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
import { createStyleDefinition, expandShape, expandTypescale } from '../../utils/style'

export const PaginationDefinition = createStyleDefinition({
    // Item geometry per size
    'item-size': {
        'small' : `32px`,
        'medium': `40px`,
        'large' : `48px`,
    },
    'item-gap': {
        'small' : `4px`,
        'medium': `4px`,
        'large' : `6px`,
    },
    'section-gap': `12px`,
    'icon-size': {
        'small' : `18px`,
        'medium': `20px`,
        'large' : `24px`,
    },

    // Shapes
    ...expandShape('round-item-shape')(Shape.Full),
    ...expandShape('square-item-shape')({
        'small' : Shape.Small,
        'medium': Shape.Medium,
        'large' : Shape.Large,
    }),

    // Colors (normal & selected)
    'enabled-item-container-color'          : `transparent`,
    'enabled-item-label-color'              : Color.OnSurface,
    'enabled-selected-item-container-color' : Color.Primary,
    'enabled-selected-item-label-color'     : Color.OnPrimary,
    'enabled-control-icon-color'            : Color.OnSurfaceVariant,
    'enabled-ellipsis-color'                : Color.OnSurfaceVariant,
    'enabled-supporting-text-color'         : Color.OnSurfaceVariant,
    'enabled-jumper-outline-color'          : Color.OutlineVariant,
    'focused-jumper-outline-color'          : Color.Primary,

    // Dots variant (Android HorizontalPager / Expressive indicator)
    'dot-size'               : `8px`,
    'dot-medium-size'        : `6px`,
    'dot-small-size'         : `4px`,
    'active-dot-width'       : `24px`,
    'dot-gap'                : `8px`,
    'dot-color'              : Color.SurfaceContainerHighest,
    'active-dot-color'       : Color.Primary,

    // Typography
    ...expandTypescale('item-label')({
        'small' : Typescale.LabelMedium,
        'medium': Typescale.LabelLarge,
        'large' : Typescale.TitleSmall,
    }),
    ...expandTypescale('supporting-label')(Typescale.BodyMedium),

    // State layers & disabled
    'hovered-state-layer-opacity' : State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity' : State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity' : State.PressedStateLayerOpacity,
    'disabled-content-opacity'    : `0.38`,
})

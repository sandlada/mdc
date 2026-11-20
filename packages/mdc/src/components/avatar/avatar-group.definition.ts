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

export const AvatarGroupDefinition = createStyleDefinition({
    // Avatar sizing & overlap offsets per size
    'avatar-size': {
        'extra-small': `24px`,
        'small'      : `32px`,
        'medium'     : `40px`,
        'large'      : `56px`,
        'extra-large': `96px`,
    },
    'overlap-distance': {
        'extra-small': `6px`,
        'small'      : `8px`,
        'medium'     : `10px`,
        'large'      : `14px`,
        'extra-large': `24px`,
    },
    'expanded-gap': `4px`,

    // Cutout ring thickness & square-shape fallback ring color
    'ring-width': `2px`,
    'ring-color': Color.Surface,

    // Overflow (+N) indicator styling
    'overflow-container-color'     : Color.SurfaceContainerHighest,
    'overflow-label-color'         : Color.OnSurfaceVariant,
    'hovered-state-layer-opacity'  : State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity'  : State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity'  : State.PressedStateLayerOpacity,

    ...expandShape('round-overflow-shape')(Shape.Full),
    ...expandShape('square-overflow-shape')({
        'extra-small': Shape.ExtraSmall,
        'small'      : Shape.Small,
        'medium'     : Shape.Medium,
        'large'      : Shape.Large,
        'extra-large': Shape.ExtraLarge,
    }),

    ...expandTypescale('overflow-label')({
        'extra-small': Typescale.LabelSmall,
        'small'      : Typescale.LabelMedium,
        'medium'     : Typescale.LabelLarge,
        'large'      : Typescale.TitleMedium,
        'extra-large': Typescale.TitleLarge,
    }),
})

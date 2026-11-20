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

export const AvatarAutoColorPaletteCount = 6

export const AvatarDefinition = createStyleDefinition({
    // Variant colors
    'enabled-tonal-container-color'   : Color.SecondaryContainer,
    'enabled-tonal-label-color'       : Color.OnSecondaryContainer,
    'enabled-tonal-outline-color'     : `transparent`,

    'enabled-filled-container-color'  : Color.Primary,
    'enabled-filled-label-color'      : Color.OnPrimary,
    'enabled-filled-outline-color'    : `transparent`,

    'enabled-outlined-container-color': Color.Surface,
    'enabled-outlined-label-color'    : Color.OnSurface,
    'enabled-outlined-outline-color'  : Color.OutlineVariant,

    'enabled-surface-container-color' : Color.SurfaceContainerHigh,
    'enabled-surface-label-color'     : Color.OnSurfaceVariant,
    'enabled-surface-outline-color'   : `transparent`,

    'outline-width': `1px`,

    // Deterministic auto-color tonal palette (0..5)
    'auto-color-0-container': Color.PrimaryContainer,
    'auto-color-0-label'    : Color.OnPrimaryContainer,
    'auto-color-1-container': Color.SecondaryContainer,
    'auto-color-1-label'    : Color.OnSecondaryContainer,
    'auto-color-2-container': Color.TertiaryContainer,
    'auto-color-2-label'    : Color.OnTertiaryContainer,
    'auto-color-3-container': Color.Primary,
    'auto-color-3-label'    : Color.OnPrimary,
    'auto-color-4-container': Color.Secondary,
    'auto-color-4-label'    : Color.OnSecondary,
    'auto-color-5-container': Color.Tertiary,
    'auto-color-5-label'    : Color.OnTertiary,

    // Size scale
    'container-size': {
        'extra-small': `24px`,
        'small'      : `32px`,
        'medium'     : `40px`,
        'large'      : `56px`,
        'extra-large': `96px`,
    },
    'icon-size': {
        'extra-small': `14px`,
        'small'      : `18px`,
        'medium'     : `24px`,
        'large'      : `28px`,
        'extra-large': `48px`,
    },

    // Shapes
    ...expandShape('round-container-shape')(Shape.Full),
    ...expandShape('square-container-shape')({
        'extra-small': Shape.ExtraSmall,
        'small'      : Shape.Small,
        'medium'     : Shape.Medium,
        'large'      : Shape.Large,
        'extra-large': Shape.ExtraLarge,
    }),

    // Typography per size
    ...expandTypescale('label')({
        'extra-small': Typescale.LabelSmall,
        'small'      : Typescale.LabelLarge,
        'medium'     : Typescale.TitleMedium,
        'large'      : Typescale.HeadlineSmall,
        'extra-large': Typescale.DisplaySmall,
    }),

    // State layers & disabled
    'hovered-state-layer-opacity' : State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity' : State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity' : State.PressedStateLayerOpacity,
    'disabled-container-opacity'  : `0.12`,
    'disabled-content-opacity'    : `0.38`,
})

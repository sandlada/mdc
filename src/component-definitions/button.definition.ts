/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Color, ElevationLevel, Shape, State, Typescale } from '@sandlada/mdk'
import { createLogicShapeTokens } from '../utils/tokens'

const shared = (prefix: string) => ({
    ...createLogicShapeTokens(prefix, {
        'extra-small-container-shape-round': Shape.Full,
        'small-container-shape-round'      : Shape.Full,
        'medium-container-shape-round'     : Shape.Full,
        'large-container-shape-round'      : Shape.Full,
        'extra-large-container-shape-round': Shape.Full,

        'extra-small-container-shape-square': Shape.Medium,
        'small-container-shape-square'      : Shape.Medium,
        'medium-container-shape-square'     : Shape.Large,
        'large-container-shape-square'      : Shape.ExtraLarge,
        'extra-large-container-shape-square': Shape.ExtraLarge,

        'extra-small-container-shape-pressed-morph': Shape.Small,
        'small-container-shape-pressed-morph'      : Shape.Small,
        'medium-container-shape-pressed-morph'     : Shape.Medium,
        'large-container-shape-pressed-morph'      : Shape.Large,
        'extra-large-container-shape-pressed-morph': Shape.Large,

        'extra-small-container-shape-round-toggle-selected': Shape.Medium,
        'small-container-shape-round-toggle-selected'      : Shape.Medium,
        'medium-container-shape-round-toggle-selected'     : Shape.Large,
        'large-container-shape-round-toggle-selected'      : Shape.ExtraLarge,
        'extra-large-container-shape-round-toggle-selected': Shape.ExtraLarge,

        'extra-small-container-shape-square-toggle-selected': Shape.Full,
        'small-container-shape-square-toggle-selected'      : Shape.Full,
        'medium-container-shape-square-toggle-selected'     : Shape.Full,
        'large-container-shape-square-toggle-selected'      : Shape.Full,
        'extra-large-container-shape-square-toggle-selected': Shape.Full,
    }, 'all', false),
    'extra-small-container-height'        : `32px`,
    'extra-small-outline-width'           : `1px`,
    'extra-small-label-font'              : Typescale.LabelLargeFont,
    'extra-small-label-line-height'       : Typescale.LabelLargeLineHeight,
    'extra-small-label-size'              : Typescale.LabelLargeSize,
    'extra-small-label-tracking'          : Typescale.LabelLargeTracking,
    'extra-small-label-weight'            : Typescale.LabelLargeWeight,
    'extra-small-icon-size'               : `20px`,
    'extra-small-leading-space'           : `12px`,
    'extra-small-between-icon-label-space': `8px`,
    'extra-small-trailing-space'          : `12px`,

    'small-container-height'        : `40px`,
    'small-outline-width'           : `1px`,
    'small-label-font'              : Typescale.LabelLargeFont,
    'small-label-line-height'       : Typescale.LabelLargeLineHeight,
    'small-label-size'              : Typescale.LabelLargeSize,
    'small-label-tracking'          : Typescale.LabelLargeTracking,
    'small-label-weight'            : Typescale.LabelLargeWeight,
    'small-icon-size'               : `20px`,
    'small-leading-space'           : `16px`,
    'small-between-icon-label-space': `8px`,
    'small-trailing-space'          : `16px`,

    'medium-container-height'        : `56px`,
    'medium-outline-width'           : `1px`,
    'medium-label-font'              : Typescale.TitleMediumFont,
    'medium-label-line-height'       : Typescale.TitleMediumLineHeight,
    'medium-label-size'              : Typescale.TitleMediumSize,
    'medium-label-tracking'          : Typescale.TitleMediumTracking,
    'medium-label-weight'            : Typescale.TitleMediumWeight,
    'medium-icon-size'               : `24px`,
    'medium-leading-space'           : `24px`,
    'medium-between-icon-label-space': `8px`,
    'medium-trailing-space'          : `24px`,

    'large-container-height'        : `96px`,
    'large-outline-width'           : `2px`,
    'large-label-font'              : Typescale.HeadlineSmallFont,
    'large-label-line-height'       : Typescale.HeadlineSmallLineHeight,
    'large-label-size'              : Typescale.HeadlineSmallSize,
    'large-label-tracking'          : Typescale.HeadlineSmallTracking,
    'large-label-weight'            : Typescale.HeadlineSmallWeight,
    'large-icon-size'               : `32px`,
    'large-leading-space'           : `48px`,
    'large-between-icon-label-space': `12px`,
    'large-trailing-space'          : `48px`,

    'extra-large-container-height'        : `136px`,
    'extra-large-outline-width'           : `3px`,
    'extra-large-label-font'              : Typescale.HeadlineLargeFont,
    'extra-large-label-line-height'       : Typescale.HeadlineLargeLineHeight,
    'extra-large-label-size'              : Typescale.HeadlineLargeSize,
    'extra-large-label-tracking'          : Typescale.HeadlineLargeTracking,
    'extra-large-label-weight'            : Typescale.HeadlineLargeWeight,
    'extra-large-icon-size'               : `40px`,
    'extra-large-leading-space'           : `64px`,
    'extra-large-between-icon-label-space': `16px`,
    'extra-large-trailing-space'          : `64px`,
}) as const

export const ElevatedButtonDefinition = {
    ...shared('--mdc-elevated-button'),

    // Enabled
    'container-color'                  : Color.SurfaceContainerLow,
    'container-color-toggle-unselected': Color.SurfaceContainerLow,
    'container-color-toggle-selected'  : Color.Primary,
    'container-shadow-color'           : Color.Shadow,
    'container-elevation'              : ElevationLevel.Level1,
    'label-color'                      : Color.Primary,
    'label-color-toggle-unselected'    : Color.Primary,
    'label-color-toggle-selected'      : Color.OnPrimary,
    'icon-color'                       : Color.Primary,
    'icon-color-toggle-unselected'     : Color.Primary,
    'icon-color-toggle-selected'       : Color.OnPrimary,

    // Disabled
    'disabled-container-color'    : Color.OnSurface,
    'disabled-container-opacity'  : `0.1`,
    'disabled-container-elevation': ElevationLevel.Level0,
    'disabled-label-color'        : Color.OnSurface,
    'disabled-label-opacity'      : `0.38`,
    'disabled-icon-color'         : Color.OnSurface,
    'disabled-icon-opacity'       : `0.38`,

    // Hovered
    'hovered-state-layer-color'                  : Color.Primary,
    'hovered-state-layer-color-toggle-unselected': Color.Primary,
    'hovered-state-layer-color-toggle-selected'  : Color.OnPrimary,
    'hovered-state-layer-opacity'                : State.HoveredStateLayerOpacity,
    'hovered-label-color'                        : Color.Primary,
    'hovered-label-color-toggle-unselected'      : Color.Primary,
    'hovered-label-color-toggle-selected'        : Color.OnPrimary,
    'hovered-icon-color'                         : Color.Primary,
    'hovered-icon-color-toggle-unselected'       : Color.Primary,
    'hovered-icon-color-toggle-selected'         : Color.OnPrimary,

    // Focused
    'focused-state-layer-color'                  : Color.Primary,
    'focused-state-layer-color-toggle-unselected': Color.Primary,
    'focused-state-layer-color-toggle-selected'  : Color.OnPrimary,
    'focused-state-layer-opacity'                : State.FocusedStateLayerOpacity,
    'focused-container-elevation'                : ElevationLevel.Level1,
    'focused-label-color'                        : Color.Primary,
    'focused-label-color-toggle-unselected'      : Color.Primary,
    'focused-label-color-toggle-selected'        : Color.OnPrimary,
    'focused-icon-color'                         : Color.Primary,
    'focused-icon-color-toggle-unselected'       : Color.Primary,
    'focused-icon-color-toggle-selected'         : Color.OnPrimary,

    // Pressed
    'pressed-state-layer-color'                  : Color.Primary,
    'pressed-state-layer-color-toggle-unselected': Color.Primary,
    'pressed-state-layer-color-toggle-selected'  : Color.OnPrimary,
    'pressed-state-layer-opacity'                : State.PressedStateLayerOpacity,
    'pressed-container-elevation'                : ElevationLevel.Level1,
    'pressed-label-color'                        : Color.Primary,
    'pressed-label-color-toggle-unselected'      : Color.Primary,
    'pressed-label-color-toggle-selected'        : Color.OnPrimary,
    'pressed-icon-color'                         : Color.Primary,
    'pressed-icon-color-toggle-unselected'       : Color.Primary,
    'pressed-icon-color-toggle-selected'         : Color.OnPrimary,
} as const

export const FilledButtonDefinition = {
    ...shared('--mdc-filled-button'),

    // Enabled
    'container-color'                  : Color.Primary,
    'container-color-toggle-unselected': Color.SurfaceContainer,
    'container-color-toggle-selected'  : Color.Primary,
    'container-shadow-color'           : Color.Shadow,
    'container-elevation'              : ElevationLevel.Level0,
    'label-color'                      : Color.OnPrimary,
    'label-color-toggle-unselected'    : Color.OnSurfaceVariant,
    'label-color-toggle-selected'      : Color.OnPrimary,
    'icon-color'                       : Color.OnPrimary,
    'icon-color-toggle-unselected'     : Color.OnSurfaceVariant,
    'icon-color-toggle-selected'       : Color.OnPrimary,

    // Disabled
    'disabled-container-color'    : Color.OnSurface,
    'disabled-container-opacity'  : `0.1`,
    'disabled-container-elevation': ElevationLevel.Level0,
    'disabled-label-color'        : Color.OnSurface,
    'disabled-label-opacity'      : `0.38`,
    'disabled-icon-color'         : Color.OnSurface,
    'disabled-icon-opacity'       : `0.38`,

    // Hovered
    'hovered-state-layer-color'                  : Color.OnPrimary,
    'hovered-state-layer-color-toggle-unselected': Color.OnSurfaceVariant,
    'hovered-state-layer-color-toggle-selected'  : Color.OnPrimary,
    'hovered-state-layer-opacity'                : State.HoveredStateLayerOpacity,
    'hovered-label-color'                        : Color.OnPrimary,
    'hovered-label-color-toggle-unselected'      : Color.OnSurfaceVariant,
    'hovered-label-color-toggle-selected'        : Color.OnPrimary,
    'hovered-icon-color'                         : Color.OnPrimary,
    'hovered-icon-color-toggle-unselected'       : Color.OnSurfaceVariant,
    'hovered-icon-color-toggle-selected'         : Color.OnPrimary,

    // Focused
    'focused-state-layer-color'                  : Color.OnPrimary,
    'focused-state-layer-color-toggle-unselected': Color.OnSurfaceVariant,
    'focused-state-layer-color-toggle-selected'  : Color.OnPrimary,
    'focused-state-layer-opacity'                : State.FocusedStateLayerOpacity,
    'focused-container-elevation'                : ElevationLevel.Level0,
    'focused-label-color'                        : Color.OnPrimary,
    'focused-label-color-toggle-unselected'      : Color.OnSurfaceVariant,
    'focused-label-color-toggle-selected'        : Color.OnPrimary,
    'focused-icon-color'                         : Color.OnPrimary,
    'focused-icon-color-toggle-unselected'       : Color.OnSurfaceVariant,
    'focused-icon-color-toggle-selected'         : Color.OnPrimary,

    // Pressed
    'pressed-state-layer-color'                  : Color.OnPrimary,
    'pressed-state-layer-color-toggle-unselected': Color.OnSurfaceVariant,
    'pressed-state-layer-color-toggle-selected'  : Color.OnPrimary,
    'pressed-state-layer-opacity'                : State.PressedStateLayerOpacity,
    'pressed-container-elevation'                : ElevationLevel.Level0,
    'pressed-label-color'                        : Color.OnPrimary,
    'pressed-label-color-toggle-unselected'      : Color.OnSurfaceVariant,
    'pressed-label-color-toggle-selected'        : Color.OnPrimary,
    'pressed-icon-color'                         : Color.OnPrimary,
    'pressed-icon-color-toggle-unselected'       : Color.OnSurfaceVariant,
    'pressed-icon-color-toggle-selected'         : Color.OnPrimary,
} as const

export const FilledTonalButtonDefinition = {
    ...shared('--mdc-filled-tonal-button'),

    // Enabled
    'container-color'                  : Color.SecondaryContainer,
    'container-color-toggle-unselected': Color.SecondaryContainer,
    'container-color-toggle-selected'  : Color.Secondary,
    'container-shadow-color'           : Color.Shadow,
    'container-elevation'              : ElevationLevel.Level0,
    'label-color'                      : Color.OnSecondaryContainer,
    'label-color-toggle-unselected'    : Color.OnSecondaryContainer,
    'label-color-toggle-selected'      : Color.OnSecondary,
    'icon-color'                       : Color.OnSecondaryContainer,
    'icon-color-toggle-unselected'     : Color.OnSecondaryContainer,
    'icon-color-toggle-selected'       : Color.OnSecondary,

    // Disabled
    'disabled-container-color'    : Color.OnSurface,
    'disabled-container-opacity'  : `0.1`,
    'disabled-container-elevation': ElevationLevel.Level0,
    'disabled-label-color'        : Color.OnSurface,
    'disabled-label-opacity'      : `0.38`,
    'disabled-icon-color'         : Color.OnSurface,
    'disabled-icon-opacity'       : `0.38`,

    // Hovered
    'hovered-state-layer-color'                  : Color.OnSecondaryContainer,
    'hovered-state-layer-color-toggle-unselected': Color.OnSecondaryContainer,
    'hovered-state-layer-color-toggle-selected'  : Color.OnSecondary,
    'hovered-state-layer-opacity'                : State.HoveredStateLayerOpacity,
    'hovered-label-color'                        : Color.OnSecondaryContainer,
    'hovered-label-color-toggle-unselected'      : Color.OnSecondaryContainer,
    'hovered-label-color-toggle-selected'        : Color.OnSecondary,
    'hovered-icon-color'                         : Color.OnSecondaryContainer,
    'hovered-icon-color-toggle-unselected'       : Color.OnSecondaryContainer,
    'hovered-icon-color-toggle-selected'         : Color.OnSecondary,

    // Focused
    'focused-state-layer-color'                  : Color.OnSecondaryContainer,
    'focused-state-layer-color-toggle-unselected': Color.OnSecondaryContainer,
    'focused-state-layer-color-toggle-selected'  : Color.OnSecondary,
    'focused-state-layer-opacity'                : State.FocusedStateLayerOpacity,
    'focused-container-elevation'                : ElevationLevel.Level0,
    'focused-label-color'                        : Color.OnSecondaryContainer,
    'focused-label-color-toggle-unselected'      : Color.OnSecondaryContainer,
    'focused-label-color-toggle-selected'        : Color.OnSecondary,
    'focused-icon-color'                         : Color.OnSecondaryContainer,
    'focused-icon-color-toggle-unselected'       : Color.OnSecondaryContainer,
    'focused-icon-color-toggle-selected'         : Color.OnSecondary,

    // Pressed
    'pressed-state-layer-color'                  : Color.OnSecondaryContainer,
    'pressed-state-layer-color-toggle-unselected': Color.OnSecondaryContainer,
    'pressed-state-layer-color-toggle-selected'  : Color.OnSecondary,
    'pressed-state-layer-opacity'                : State.PressedStateLayerOpacity,
    'pressed-container-elevation'                : ElevationLevel.Level0,
    'pressed-label-color'                        : Color.OnSecondaryContainer,
    'pressed-label-color-toggle-unselected'      : Color.OnSecondaryContainer,
    'pressed-label-color-toggle-selected'        : Color.OnSecondary,
    'pressed-icon-color'                         : Color.OnSecondaryContainer,
    'pressed-icon-color-toggle-unselected'       : Color.OnSecondaryContainer,
    'pressed-icon-color-toggle-selected'         : Color.OnSecondary,
} as const

export const OutlinedButtonDefinition = {
    ...shared('--mdc-outlined-button'),

    // Enabled
    'outline-color'                    : Color.OutlineVariant,
    'outline-color-toggle-unselected'  : Color.OutlineVariant,
    'outline-color-toggle-selected'    : `transparent`,
    'container-color'                  : `transparent`,
    'container-color-toggle-unselected': `transparent`,
    'container-color-toggle-selected'  : Color.InverseSurface,
    'label-color'                      : Color.OnSurfaceVariant,
    'label-color-toggle-unselected'    : Color.OnSurfaceVariant,
    'label-color-toggle-selected'      : Color.InverseOnSurface,
    'icon-color'                       : Color.OnSurfaceVariant,
    'icon-color-toggle-unselected'     : Color.OnSurfaceVariant,
    'icon-color-toggle-selected'       : Color.InverseOnSurface,

    // Disabled
    'disabled-outline-color'                  : Color.OutlineVariant,
    'disabled-outline-color-toggle-unselected': Color.OutlineVariant,
    'disabled-outline-color-toggle-selected'  : `transparent`,
    'disabled-container-color'                : Color.OnSurface,
    'disabled-container-opacity'              : `0.1`,
    'disabled-label-color'                    : Color.OnSurface,
    'disabled-label-opacity'                  : `0.38`,
    'disabled-icon-color'                     : Color.OnSurface,
    'disabled-icon-opacity'                   : `0.38`,

    // Hovered
    'hovered-state-layer-color'                  : Color.OnSurfaceVariant,
    'hovered-state-layer-color-toggle-unselected': Color.OnSurfaceVariant,
    'hovered-state-layer-color-toggle-selected'  : Color.InverseOnSurface,
    'hovered-state-layer-opacity'                : State.HoveredStateLayerOpacity,
    'hovered-outline-color'                      : Color.OutlineVariant,
    'hovered-outline-color-toggle-unselected'    : Color.OutlineVariant,
    'hovered-outline-color-toggle-selected'      : `transparent`,
    'hovered-label-color'                        : Color.OnSurfaceVariant,
    'hovered-label-color-toggle-unselected'      : Color.OnSurfaceVariant,
    'hovered-label-color-toggle-selected'        : Color.InverseOnSurface,
    'hovered-icon-color'                         : Color.OnSurfaceVariant,
    'hovered-icon-color-toggle-unselected'       : Color.OnSurfaceVariant,
    'hovered-icon-color-toggle-selected'         : Color.InverseOnSurface,

    // Focused
    'focused-state-layer-color'                  : Color.OnSurfaceVariant,
    'focused-state-layer-color-toggle-unselected': Color.OnSurfaceVariant,
    'focused-state-layer-color-toggle-selected'  : Color.InverseOnSurface,
    'focused-state-layer-opacity'                : State.FocusedStateLayerOpacity,
    'focused-outline-color'                      : Color.OutlineVariant,
    'focused-outline-color-toggle-unselected'    : Color.OutlineVariant,
    'focused-outline-color-toggle-selected'      : `transparent`,
    'focused-label-color'                        : Color.OnSurfaceVariant,
    'focused-label-color-toggle-unselected'      : Color.OnSurfaceVariant,
    'focused-label-color-toggle-selected'        : Color.InverseOnSurface,
    'focused-icon-color'                         : Color.OnSurfaceVariant,
    'focused-icon-color-toggle-unselected'       : Color.OnSurfaceVariant,
    'focused-icon-color-toggle-selected'         : Color.InverseOnSurface,

    // Pressed
    'pressed-state-layer-color'                  : Color.OnSurfaceVariant,
    'pressed-state-layer-color-toggle-unselected': Color.OnSurfaceVariant,
    'pressed-state-layer-color-toggle-selected'  : Color.InverseOnSurface,
    'pressed-state-layer-opacity'                : State.PressedStateLayerOpacity,
    'pressed-outline-color'                      : Color.OutlineVariant,
    'pressed-outline-color-toggle-unselected'    : Color.OutlineVariant,
    'pressed-outline-color-toggle-selected'      : `transparent`,
    'pressed-label-color'                        : Color.OnSurfaceVariant,
    'pressed-label-color-toggle-unselected'      : Color.OnSurfaceVariant,
    'pressed-label-color-toggle-selected'        : Color.InverseOnSurface,
    'pressed-icon-color'                         : Color.OnSurfaceVariant,
    'pressed-icon-color-toggle-unselected'       : Color.OnSurfaceVariant,
    'pressed-icon-color-toggle-selected'         : Color.InverseOnSurface,
} as const

export const TextButtonDefinition = {
    ...shared('--mdc-text-button'),

    // Enabled
    'container-color': `transparent`,
    'label-color'    : Color.Primary,
    'icon-color'     : Color.Primary,

    // Disabled
    'disabled-container-color'  : Color.OnSurface,
    'disabled-container-opacity': `0.1`,
    'disabled-label-color'      : Color.OnSurface,
    'disabled-label-opacity'    : `0.38`,
    'disabled-icon-color'       : Color.OnSurface,
    'disabled-icon-opacity'     : `0.38`,

    // Hovered
    'hovered-state-layer-color'  : Color.Primary,
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'hovered-label-color'        : Color.Primary,
    'hovered-icon-color'         : Color.Primary,

    // Focused
    'focused-state-layer-color'  : Color.Primary,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'focused-label-color'        : Color.Primary,
    'focused-icon-color'         : Color.Primary,

    // Pressed
    'pressed-state-layer-color'  : Color.Primary,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,
    'pressed-label-color'        : Color.Primary,
    'pressed-icon-color'         : Color.Primary,
} as const

/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ElevationLevel, Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandShape, expandTypescale } from '../../utils/style'

/**
 * Style definition for `mdc-basic-dialog`.
 *
 * Aligned with Material Design 3 & Android (`AlertDialog` / `DialogTokens`):
 * - Container: ExtraLarge (28dp), SurfaceContainerHigh, Elevation Level 3
 * - Width: min 280dp, max 560dp
 * - Padding: 24dp outer, 16dp between icon/headline/supporting-text, 24dp before actions
 * - Actions: 8dp horizontal gap, 12dp vertical wrap gap
 * - Scrim: Scrim color at 32% opacity
 */
export const BasicDialogDefinition = createStyleDefinition({
    // Container
    ...expandShape('container-shape')(Shape.ExtraLarge),
    'enabled-container-color'            : Color.SurfaceContainerHigh,
    'enabled-container-elevation'        : ElevationLevel.Level3,
    'container-shadow-color'             : Color.Shadow,
    'container-min-width'                : `280px`,
    'container-max-width'                : `560px`,

    // Scrim & Divider
    'scrim-color'                        : Color.Scrim,
    'scrim-opacity'                      : `0.32`,
    'divider-color'                      : Color.OutlineVariant,

    // Icon
    'icon-size'                          : `24px`,
    'enabled-icon-color'                 : Color.Secondary,

    // Headline
    ...expandTypescale('headline-label')(Typescale.HeadlineSmall),
    'enabled-headline-label-color'       : Color.OnSurface,

    // Supporting text
    ...expandTypescale('supporting-text-label')(Typescale.BodyMedium),
    'enabled-supporting-text-label-color': Color.OnSurfaceVariant,

    // Actions
    ...expandTypescale('action-label')(Typescale.LabelLarge),
    'enabled-action-label-color'         : Color.Primary,
    'actions-gap'                        : `8px`,
    'actions-row-gap'                    : `12px`,

    // Hovered
    'hovered-action-label-color'         : Color.Primary,
    'hovered-action-state-layer-color'   : Color.Primary,
    'hovered-action-state-layer-opacity' : State.HoveredStateLayerOpacity,
    // Focused
    'focused-action-label-color'         : Color.Primary,
    'focused-action-state-layer-color'   : Color.Primary,
    'focused-action-state-layer-opacity' : State.FocusedStateLayerOpacity,
    // Pressed
    'pressed-action-label-color'         : Color.Primary,
    'pressed-action-state-layer-color'   : Color.Primary,
    'pressed-action-state-layer-opacity' : State.PressedStateLayerOpacity,
})

/**
 * Style definition for `mdc-fullscreen-dialog`.
 *
 * Aligned with Material Design 3 & Android Full-Screen Dialog specs:
 * - Container: Shape.None (0dp), SurfaceContainerHigh, Elevation Level 0
 * - Header: 56dp height, Surface (Level 0) resting -> SurfaceContainer (Level 2) on scroll
 * - Headline: TitleLarge, OnSurface
 * - Header Icon: 24dp, OnSurface
 * - Header Action: LabelLarge, Primary
 */
export const FullscreenDialogDefinition = createStyleDefinition({
    // Container
    ...expandShape('container-shape')(Shape.None),
    'enabled-container-color'                    : Color.SurfaceContainerHigh,
    'enabled-on-scroll-container-color'          : Color.SurfaceContainer,
    'enabled-container-elevation'                : ElevationLevel.Level0,
    'container-shadow-color'                     : Color.Shadow,

    // Divider
    'divider-color'                              : Color.OutlineVariant,

    // Header
    'header-container-height'                    : `56px`,
    'enabled-header-container-color'             : Color.Surface,
    'enabled-header-container-elevation'         : ElevationLevel.Level0,
    'enabled-header-on-scroll-container-elevation': ElevationLevel.Level2,
    'header-icon-size'                           : `24px`,
    'enabled-header-icon-color'                  : Color.OnSurface,

    // Headline
    ...expandTypescale('headline-label')(Typescale.TitleLarge),
    'enabled-headline-label-color'               : Color.OnSurface,

    // Supporting text
    ...expandTypescale('supporting-text-label')(Typescale.BodyMedium),
    'enabled-supporting-text-label-color'        : Color.OnSurfaceVariant,

    // Action
    ...expandTypescale('action-label')(Typescale.LabelLarge),
    'enabled-action-label-color'                 : Color.Primary,

    // Hovered
    'hovered-header-action-label-color'          : Color.Primary,
    'hovered-header-action-state-layer-color'    : Color.Primary,
    'hovered-header-action-state-layer-opacity'  : State.HoveredStateLayerOpacity,
    // Focused
    'focused-header-action-label-color'          : Color.Primary,
    'focused-header-action-state-layer-color'    : Color.Primary,
    'focused-header-action-state-layer-opacity'  : State.FocusedStateLayerOpacity,
    // Pressed
    'pressed-header-action-label-color'          : Color.Primary,
    'pressed-header-action-state-layer-color'    : Color.Primary,
    'pressed-header-action-state-layer-opacity'  : State.PressedStateLayerOpacity,
})

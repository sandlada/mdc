/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @implements
 * - small-app-bar
 * - center-aligned-app-bar
 * - medium-flexible-app-bar
 * - large-flexible-app-bar
 * - search-app-bar
 *
 * @link
 * https://m3.material.io/components/app-bars/specs
 */
import { Duration, Easing, ElevationLevel, Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import {
    createStyleDefinition,
    expandPadding,
    expandShape,
    expandTypescale,
} from '../../utils/style'

export const AppBarDefinition = createStyleDefinition({
    // Container colors & elevation
    'enabled-container-color'                 : Color.Surface,
    'enabled-container-color-scrolled'        : Color.SurfaceContainer,
    'enabled-container-elevation'             : ElevationLevel.Level0,
    'enabled-container-elevation-scrolled'    : ElevationLevel.Level2,
    'enabled-container-shadow-color'          : Color.Shadow,

    // Container shape
    ...expandShape('enabled-container-shape')(Shape.None),

    // Container padding (4px edge padding to 48px touch targets)
    ...expandPadding('enabled-container-padding')({
        inlineStart: `4px`,
        inlineEnd  : `4px`,
        blockStart : `0px`,
        blockEnd   : `0px`,
    }),

    // Variant heights (Figma M3 Expressive specs)
    'enabled-small-container-height'          : `64px`,
    'enabled-medium-container-min-height'     : `112px`,
    'enabled-large-container-min-height'      : `120px`,
    'enabled-search-container-height'         : `64px`,

    // Touch targets & icon sizes
    'enabled-icon-button-size'                : `48px`,
    'enabled-icon-size'                       : `24px`,

    // Gaps and spacing
    'enabled-title-gap-space'                 : `4px`,
    'enabled-title-without-leading-space'     : `16px`,
    'enabled-actions-gap-space'               : `0px`,

    // Flexible content layout & padding
    'enabled-flexible-top-row-height'         : `56px`,
    'enabled-flexible-top-row-padding-top'    : `4px`,
    'enabled-flexible-content-padding-top'    : `4px`,
    ...expandPadding('enabled-flexible-content-padding')({
        inlineStart: `16px`,
        inlineEnd  : `16px`,
        blockStart : `0px`,
        blockEnd   : `12px`,
    }),

    // Foreground colors
    'enabled-headline-color'                  : Color.OnSurface,
    'enabled-subtitle-color'                  : Color.OnSurfaceVariant,
    'enabled-leading-icon-color'              : Color.OnSurface,
    'enabled-trailing-icon-color'             : Color.OnSurfaceVariant,

    // Search app bar tokens (48px pill inside 64px bar, 8px outer horizontal gap)
    'enabled-search-box-container-color'          : Color.SurfaceContainer,
    'enabled-search-box-container-color-scrolled' : Color.SurfaceContainerHighest,
    'enabled-search-box-text-color'               : Color.OnSurface,
    'enabled-search-box-placeholder-color'        : Color.OnSurfaceVariant,
    'enabled-search-box-icon-color'               : Color.OnSurfaceVariant,
    'enabled-search-box-height'                   : `48px`,
    'enabled-search-box-gap-space'                : `8px`,
    'enabled-search-box-inner-gap-space'          : `8px`,
    ...expandPadding('enabled-search-box-padding')({
        inlineStart: `16px`,
        inlineEnd  : `16px`,
        blockStart : `0px`,
        blockEnd   : `0px`,
    }),
    ...expandShape('enabled-search-box-shape')(Shape.Full),

    // Search box state layer & focus ring
    'hovered-search-box-state-layer-color'    : Color.OnSurface,
    'hovered-search-box-state-layer-opacity'  : State.HoveredStateLayerOpacity,
    'pressed-search-box-state-layer-color'    : Color.OnSurface,
    'pressed-search-box-state-layer-opacity'  : State.PressedStateLayerOpacity,
    'focused-search-box-indicator-color'      : Color.Secondary,
    'focused-search-box-indicator-thickness'  : `3px`,
    'focused-search-box-indicator-offset'     : `2px`,

    // Motion
    'enabled-transition-duration'             : Duration.Short4,
    'enabled-transition-easing'               : Easing.Standard,
    'enabled-collapse-duration'               : Duration.Medium2,
    'enabled-collapse-easing'                 : Easing.Emphasized,

    // Typography
    ...expandTypescale('enabled-small-headline')(Typescale.TitleLarge),
    ...expandTypescale('enabled-medium-headline')(Typescale.HeadlineMedium),
    ...expandTypescale('enabled-large-headline')(Typescale.DisplaySmall),
    ...expandTypescale('enabled-subtitle')(Typescale.BodyMedium),
    ...expandTypescale('enabled-search-text')(Typescale.BodyLarge),
})

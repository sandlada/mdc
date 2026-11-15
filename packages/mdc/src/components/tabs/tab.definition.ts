/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Style definitions for `mdc-tab` per Material Design 3 Figma specs,
 * Jetpack Compose Material 3 (`PrimaryNavigationTabTokens`,
 * `SecondaryNavigationTabTokens`), Material Components for Android, and
 * MD3 Expressive (MD3E) additions.
 *
 * Three variants are provided:
 * - `primary`   : Standard MD3 primary tab — 48dp (or 64dp with icon + label),
 *                 stacked icon above label, 3dp content-fitted active indicator
 *                 with 3dp top-corner radius, `Primary` active color.
 * - `secondary` : MD3 secondary tab — 48dp always, inline icon + label,
 *                 2dp full-width square active indicator, `OnSurface` active
 *                 label/icon color and `Primary` indicator color.
 * - `floating`  : MD3E floating tab — 56dp pill cell, inline icon + label,
 *                 filled `SecondaryContainer` pill active indicator.
 *
 * @link
 * https://m3.material.io/components/tabs/specs
 */
import { ElevationLevel, Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandShape, expandTypescale } from '../../utils/style'

const Shared = {
    ...expandTypescale('label')(Typescale.TitleSmall),

    'enabled-container-color'             : `transparent`,
    'enabled-container-elevation'         : ElevationLevel.Level0,
    'container-block-leading-space'       : `0px`,
    'container-block-trailing-space'      : `0px`,
    'container-inline-leading-space'      : `16px`,
    'container-inline-trailing-space'     : `16px`,

    'active-indicator-inline-leading-space' : `0px`,
    'active-indicator-inline-trailing-space': `0px`,
    'active-indicator-block-leading-space'  : `0px`,
    'active-indicator-block-trailing-space' : `0px`,
    'active-indicator-min-width'            : `0px`,

    'enabled-label-color-unselected'      : Color.OnSurfaceVariant,
    'enabled-label-color-selected'        : Color.Primary,
    'hovered-label-color-unselected'      : Color.OnSurface,
    'focused-label-color-unselected'      : Color.OnSurface,
    'pressed-label-color-unselected'      : Color.OnSurface,
    'hovered-label-color-selected'        : Color.Primary,
    'focused-label-color-selected'        : Color.Primary,
    'pressed-label-color-selected'        : Color.Primary,
    'disabled-label-color'                : Color.OnSurface,
    'disabled-label-opacity'              : `0.38`,

    'icon-size'                           : `24px`,
    'enabled-icon-color-unselected'       : Color.OnSurfaceVariant,
    'enabled-icon-color-selected'         : Color.Primary,
    'hovered-icon-color-unselected'       : Color.OnSurface,
    'focused-icon-color-unselected'       : Color.OnSurface,
    'pressed-icon-color-unselected'       : Color.OnSurface,
    'hovered-icon-color-selected'         : Color.Primary,
    'focused-icon-color-selected'         : Color.Primary,
    'pressed-icon-color-selected'         : Color.Primary,
    'disabled-icon-color'                 : Color.OnSurface,
    'disabled-icon-opacity'               : `0.38`,

    'disabled-active-indicator-color'     : Color.OnSurface,
    'disabled-active-indicator-opacity'   : `0.38`,

    'enabled-state-layer-color-unselected'  : Color.OnSurface,
    'hovered-state-layer-color-unselected'  : Color.OnSurface,
    'focused-state-layer-color-unselected'  : Color.OnSurface,
    'pressed-state-layer-color-unselected'  : Color.OnSurface,
    'enabled-state-layer-opacity-unselected': `0`,
    'hovered-state-layer-opacity-unselected': State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity-unselected': State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity-unselected': State.PressedStateLayerOpacity,

    'enabled-state-layer-color-selected'    : Color.Primary,
    'hovered-state-layer-color-selected'    : Color.Primary,
    'focused-state-layer-color-selected'    : Color.Primary,
    'pressed-state-layer-color-selected'    : Color.Primary,
    'enabled-state-layer-opacity-selected'  : `0`,
    'hovered-state-layer-opacity-selected'  : State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity-selected'  : State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity-selected'  : State.PressedStateLayerOpacity,

    'spacing-between-icon-and-label'      : `8px`,
}

export const PrimaryTabDefinition = createStyleDefinition({
    ...Shared,
    ...expandShape('container-shape')(Shape.None),
    ...expandShape('active-indicator-shape')({
        startStart: `3px`,
        startEnd  : `3px`,
        endStart  : `0px`,
        endEnd    : `0px`,
    }),

    'container-height'                         : `48px`,
    'with-icon-and-label-text-container-height': `64px`,

    'enabled-active-indicator-color'           : Color.Primary,
    'active-indicator-height'                  : `3px`,
    'active-indicator-min-width'               : `24px`,

    'spacing-between-icon-and-label'           : `2px`,
})

export const SecondaryTabDefinition = createStyleDefinition({
    ...Shared,
    ...expandShape('container-shape')(Shape.None),
    ...expandShape('active-indicator-shape')(Shape.None),

    'container-height'                         : `48px`,
    'with-icon-and-label-text-container-height': `48px`,

    'enabled-active-indicator-color'           : Color.Primary,
    'active-indicator-height'                  : `2px`,

    'enabled-label-color-selected'             : Color.OnSurface,
    'hovered-label-color-selected'             : Color.OnSurface,
    'focused-label-color-selected'             : Color.OnSurface,
    'pressed-label-color-selected'             : Color.OnSurface,

    'enabled-icon-color-selected'              : Color.OnSurface,
    'hovered-icon-color-selected'              : Color.OnSurface,
    'focused-icon-color-selected'              : Color.OnSurface,
    'pressed-icon-color-selected'              : Color.OnSurface,

    'enabled-state-layer-color-selected'       : Color.OnSurface,
    'hovered-state-layer-color-selected'       : Color.OnSurface,
    'focused-state-layer-color-selected'       : Color.OnSurface,
    'pressed-state-layer-color-selected'       : Color.OnSurface,
})

export const FloatingTabDefinition = createStyleDefinition({
    ...Shared,
    ...expandShape('container-shape')(Shape.Full),
    ...expandShape('active-indicator-shape')(Shape.Full),

    'container-height'                         : `56px`,
    'with-icon-and-label-text-container-height': `56px`,
    'container-inline-leading-space'           : `16px`,
    'container-inline-trailing-space'          : `16px`,

    'enabled-active-indicator-color'           : Color.SecondaryContainer,
    'active-indicator-height'                  : `56px`,

    'enabled-label-color-selected'             : Color.OnSecondaryContainer,
    'hovered-label-color-selected'             : Color.OnSecondaryContainer,
    'focused-label-color-selected'             : Color.OnSecondaryContainer,
    'pressed-label-color-selected'             : Color.OnSecondaryContainer,

    'enabled-icon-color-selected'              : Color.OnSecondaryContainer,
    'hovered-icon-color-selected'              : Color.OnSecondaryContainer,
    'focused-icon-color-selected'              : Color.OnSecondaryContainer,
    'pressed-icon-color-selected'              : Color.OnSecondaryContainer,

    'enabled-state-layer-color-selected'       : Color.OnSecondaryContainer,
    'hovered-state-layer-color-selected'       : Color.OnSecondaryContainer,
    'focused-state-layer-color-selected'       : Color.OnSecondaryContainer,
    'pressed-state-layer-color-selected'       : Color.OnSecondaryContainer,
})

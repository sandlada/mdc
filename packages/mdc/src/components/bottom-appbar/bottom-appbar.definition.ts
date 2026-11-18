/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @link
 * https://m3.material.io/components/bottom-app-bar/specs
 * https://developer.android.com/reference/kotlin/androidx/compose/material3/BottomAppBarDefaults
 */
import { Duration, Easing, ElevationLevel, Shape } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandPadding, expandShape } from '../../utils/style'

export const BottomAppBarDefinition = createStyleDefinition({
    // Container colors & elevation (MD3 BottomAppBarDefaults)
    'enabled-container-color'       : Color.SurfaceContainer,
    'enabled-container-elevation'   : ElevationLevel.Level2,
    'enabled-container-shadow-color': Color.Shadow,
    'enabled-icon-color'            : Color.OnSurfaceVariant,

    // Container shape & dimensions
    ...expandShape('enabled-container-shape')(Shape.None),
    'enabled-container-height'      : `80px`,
    ...expandPadding('enabled-container-padding')({
        inlineStart: `4px`,
        inlineEnd  : `16px`,
        blockStart : `12px`,
        blockEnd   : `12px`,
    }),

    // Action layout
    'enabled-actions-gap-space'     : `0px`,
    'enabled-fab-gap-space'         : `16px`,

    // Transition
    'enabled-transition-duration'   : Duration.Medium2,
    'enabled-transition-easing'     : Easing.Emphasized.ToCSSValue(),
})

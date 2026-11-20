/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version
 * 1.0.0
 */
import { Shape } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandShape } from '../../utils/style'

export const PullToRefreshDefinition = createStyleDefinition({
    // Indicator container geometry
    'circular-container-size'   : `40px`,
    'expressive-container-size' : `48px`,
    ...expandShape('indicator-container-shape')(Shape.Full),

    // Colors
    'enabled-circular-container-color' : Color.SurfaceContainerHigh,
    'enabled-circular-indicator-color' : Color.Primary,
    'enabled-circular-indicator-color-secondary' : Color.Secondary,
    'enabled-circular-indicator-color-tertiary'  : Color.Tertiary,
    'enabled-circular-indicator-color-surface'   : Color.OnSurface,

    // Elevation shadow for classic circular container
    'indicator-elevation-shadow' : `0 2px 6px 2px rgba(0, 0, 0, 0.15), 0 1px 2px 0 rgba(0, 0, 0, 0.3)`,

    // Motion
    'settle-duration' : `300ms`,
    'settle-easing'   : `cubic-bezier(0.05, 0.7, 0.1, 1)`,
    'exit-duration'   : `200ms`,
    'exit-easing'     : `cubic-bezier(0.3, 0, 0.8, 0.15)`,
})

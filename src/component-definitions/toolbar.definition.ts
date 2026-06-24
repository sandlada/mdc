/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @implements
 * - docked-toolbar
 * - docked-toolbar-xr
 * - floating-toolbar
 * - floating-toolbar-xr
 *
 * @link
 * https://www.figma.com/design/6gdRfjUMDiN6L902aNOZsu/Material-3-Design-Kit--Community-?node-id=58295-22726&p=f&t=shaX81pnBHVWBnoB-0
 * https://m3.material.io/components/toolbars/specs
 */
import { Shape } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

export const MDCDockedToolbarStyleDefinition = createStyleDefinition({
    'container-height'                       : '64px',
    'container-padding-inline-leading-space' : '16px',
    'container-padding-inline-trailing-space': '16px',
    'container-padding-block-leading-space'  : '12px',
    'container-padding-block-trailing-space' : '12px',
    'max-space-between-actions'              : '32px',
    'min-space-between-actions'              : '4px',
})

export const MDCStandardDockedToolbarStyleDefinition = createStyleDefinition({
    // Enabled
    'enabled-standard-container-color'                : Color.SurfaceContainer,
    'enabled-standard-button-container-color'         : Color.SurfaceContainer,
    'enabled-standard-selected-button-container-color': Color.SecondaryContainer,
    'enabled-standard-icon-color'                     : Color.OnSurfaceVariant,
    'enabled-standard-selected-icon-color'            : Color.OnSecondaryContainer,
    'enabled-standard-label-color'                    : Color.OnSurfaceVariant,
    'enabled-standard-selected-label-color'           : Color.OnSecondaryContainer,
    'enabled-standard-container-shape'                : Shape.Full.ToCSSVariable(),
    // Disabled
    'disabled-standard-icon-color'   : Color.OnSurface,
    'disabled-standard-icon-opacity' : '0.38',
    'disabled-standard-label-color'  : Color.OnSurface,
    'disabled-standard-label-opacity': '0.38',
    // Hovered
    'hovered-standard-state-layer-color'         : Color.OnSurfaceVariant,
    'hovered-standard-selected-state-layer-color': Color.OnSecondaryContainer,
    'hovered-standard-state-layer-opacity'       : '0.08',
    'hovered-standard-icon-color'                : Color.OnSurfaceVariant,
    'hovered-standard-selected-icon-color'       : Color.OnSecondaryContainer,
    'hovered-standard-label-color'               : Color.OnSurfaceVariant,
    'hovered-standard-selected-label-color'      : Color.OnSecondaryContainer,
    // Focused
    'focused-standard-state-layer-color'         : Color.OnSurfaceVariant,
    'focused-standard-selected-state-layer-color': Color.OnSecondaryContainer,
    'focused-standard-state-layer-opacity'       : '0.1',
    'focused-standard-icon-color'                : Color.OnSurfaceVariant,
    'focused-standard-selected-icon-color'       : Color.OnSecondaryContainer,
    'focused-standard-label-color'               : Color.OnSurfaceVariant,
    'focused-standard-selected-label color'      : Color.OnSecondaryContainer,
    // Pressed
    'pressed-standard-state-layer-color'         : Color.OnSurfaceVariant,
    'pressed-standard-selected-state-layer-color': Color.OnSecondaryContainer,
    'pressed-standard-state-layer-opacity'       : '0.1',
    'pressed-standard-icon-color'                : Color.OnSurfaceVariant,
    'pressed-standard-selected-icon-color'       : Color.OnSecondaryContainer,
    'pressed-standard-label-color'               : Color.OnSurfaceVariant,
    'pressed-standard-selected-label-color'      : Color.OnSecondaryContainer,
})


export const MDCVibrantDockedToolbarStyleDefinition = createStyleDefinition({
    // Enabled
    'enabled-vibrant-container-color'                : Color.PrimaryContainer,
    'enabled-vibrant-button-container-color'         : Color.PrimaryContainer,
    'enabled-vibrant-selected-button-container-color': Color.SurfaceContainer,
    'enabled-vibrant-icon-color'                     : Color.OnPrimaryContainer,
    'enabled-vibrant-selected-icon-color'            : Color.OnSurface,
    'enabled-vibrant-label-color'                    : Color.OnPrimaryContainer,
    'enabled-vibrant-selected-label-color'           : Color.OnSurface,
    'enabled-vibrant-container-shape'                : Shape.Full.ToCSSVariable(),
    // Disabled
    'disabled-vibrant-icon-color'   : Color.OnSurface,
    'disabled-vibrant-icon-opacity' : '0.38',
    'disabled-vibrant-label-color'  : Color.OnSurface,
    'disabled-vibrant-label-opacity': '0.38',
    // Hovered
    'hovered-vibrant-state-layer-color'         : Color.OnPrimaryContainer,
    'hovered-vibrant-selected-state-layer-color': Color.OnSurface,
    'hovered-vibrant-state-layer-opacity'       : '0.08',
    'hovered-vibrant-icon-color'                : Color.OnPrimaryContainer,
    'hovered-vibrant-selected-icon-color'       : Color.OnSurface,
    'hovered-vibrant-label-color'               : Color.OnPrimaryContainer,
    'hovered-vibrant-selected-label-color'      : Color.OnSurface,
    // Focused
    'focused-vibrant-state-layer-color'         : Color.OnPrimaryContainer,
    'focused-vibrant-selected-state-layer-color': Color.OnSurface,
    'focused-vibrant-state-layer-opacity'       : '0.1',
    'focused-vibrant-icon-color'                : Color.OnPrimaryContainer,
    'focused-vibrant-selected-icon-color'       : Color.OnSurface,
    'focused-vibrant-label-color'               : Color.OnPrimaryContainer,
    'focused-vibrant-selected-label color'      : Color.OnSurface,
    // Pressed
    'pressed-vibrant-state-layer-color'         : Color.OnPrimaryContainer,
    'pressed-vibrant-selected-state-layer-color': Color.OnSurface,
    'pressed-vibrant-state-layer-opacity'       : '0.1',
    'pressed-vibrant-icon-color'                : Color.OnPrimaryContainer,
    'pressed-vibrant-selected-icon-color'       : Color.OnSurface,
    'pressed-vibrant-label-color'               : Color.OnPrimaryContainer,
    'pressed-vibrant-selected-label-color'      : Color.OnSurface,
})

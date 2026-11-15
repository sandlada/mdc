/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @link
 * https://m3.material.io/components/toolbars/specs
 */
import { Shape, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandPadding, expandShape, expandTypescale } from '../../utils/style'

/**
 * Shared layout & structural tokens for `mdc-docked-toolbar`.
 *
 * Per Material 3 Expressive specs:
 * - Height: 64dp
 * - Shape: 0dp (Square corners; docked toolbars do not use rounded corners)
 * - Horizontal padding: 16dp leading/trailing
 * - Touch target minimum: 48dp
 */
export const DockedToolbarDefinition = createStyleDefinition({
    'container-height'              : '64px',
    'container-padding-inline-start': '16px',
    'container-padding-inline-end'  : '16px',
    'container-padding-block-start' : '8px',
    'container-padding-block-end'   : '8px',
    'min-space-between-actions'     : '4px',
    'max-space-between-actions'     : '32px',
    ...expandShape('enabled-container-shape')(Shape.None),
    'enabled-container-elevation'   : '0',

    // Standard
    'enabled-standard-container-color'                : Color.SurfaceContainer,
    'enabled-standard-button-container-color'         : 'transparent',
    'enabled-standard-selected-button-container-color': Color.SecondaryContainer,
    'enabled-standard-icon-color'                     : Color.OnSurfaceVariant,
    'enabled-standard-selected-icon-color'            : Color.OnSecondaryContainer,
    'enabled-standard-label-color'                    : Color.OnSurfaceVariant,
    'enabled-standard-selected-label-color'           : Color.OnSecondaryContainer,
    'hovered-standard-state-layer-color'              : Color.OnSurfaceVariant,
    'hovered-standard-selected-state-layer-color'     : Color.OnSecondaryContainer,
    'focused-standard-state-layer-color'              : Color.OnSurfaceVariant,
    'focused-standard-selected-state-layer-color'     : Color.OnSecondaryContainer,
    'pressed-standard-state-layer-color'              : Color.OnSurfaceVariant,
    'pressed-standard-selected-state-layer-color'     : Color.OnSecondaryContainer,

    // Vibrant
    'enabled-vibrant-container-color'                : Color.PrimaryContainer,
    'enabled-vibrant-button-container-color'         : 'transparent',
    'enabled-vibrant-selected-button-container-color': Color.SurfaceContainer,
    'enabled-vibrant-icon-color'                     : Color.OnPrimaryContainer,
    'enabled-vibrant-selected-icon-color'            : Color.OnSurface,
    'enabled-vibrant-label-color'                    : Color.OnPrimaryContainer,
    'enabled-vibrant-selected-label-color'           : Color.OnSurface,
    'hovered-vibrant-state-layer-color'              : Color.OnPrimaryContainer,
    'hovered-vibrant-selected-state-layer-color'     : Color.OnSurface,
    'focused-vibrant-state-layer-color'              : Color.OnPrimaryContainer,
    'focused-vibrant-selected-state-layer-color'     : Color.OnSurface,
    'pressed-vibrant-state-layer-color'              : Color.OnPrimaryContainer,
    'pressed-vibrant-selected-state-layer-color'     : Color.OnSurface,

    // Disabled
    'disabled-icon-color'          : Color.OnSurface,
    'disabled-icon-opacity'        : '0.38',
    'disabled-label-color'         : Color.OnSurface,
    'disabled-label-opacity'       : '0.38',
    'hovered-state-layer-opacity'  : '0.08',
    'focused-state-layer-opacity'  : '0.10',
    'pressed-state-layer-opacity'  : '0.10',
})

/**
 * Style definition for `mdc-floating-toolbar`.
 *
 * Per Material 3 Expressive specs:
 * - Horizontal height: 64dp; Vertical width: 64dp
 * - Padding: 8dp on all sides
 * - Space between actions: 4dp
 * - Gap between toolbar pill and paired FAB: 8dp
 * - Container shape: Full (pill)
 * - Elevation: Level 3
 */
export const FloatingToolbarDefinition = createStyleDefinition({
    'container-height'              : '64px',
    'container-width'               : '64px',
    ...expandPadding('container')({ block: '8px', inline: '8px' }),
    'space-between-actions'         : '4px',
    'fab-gap'                       : '8px',
    'screen-offset'                 : '16px',
    ...expandShape('enabled-container-shape')(Shape.Full),
    'enabled-container-elevation'   : '3',
    'enabled-container-shadow-color': Color.Shadow,

    // Standard
    'enabled-standard-container-color'                : Color.SurfaceContainer,
    'enabled-standard-button-container-color'         : 'transparent',
    'enabled-standard-selected-button-container-color': Color.SecondaryContainer,
    'enabled-standard-icon-color'                     : Color.OnSurfaceVariant,
    'enabled-standard-selected-icon-color'            : Color.OnSecondaryContainer,
    'enabled-standard-label-color'                    : Color.OnSurfaceVariant,
    'enabled-standard-selected-label-color'           : Color.OnSecondaryContainer,
    'hovered-standard-state-layer-color'              : Color.OnSurfaceVariant,
    'hovered-standard-selected-state-layer-color'     : Color.OnSecondaryContainer,
    'focused-standard-state-layer-color'              : Color.OnSurfaceVariant,
    'focused-standard-selected-state-layer-color'     : Color.OnSecondaryContainer,
    'pressed-standard-state-layer-color'              : Color.OnSurfaceVariant,
    'pressed-standard-selected-state-layer-color'     : Color.OnSecondaryContainer,

    // Vibrant
    'enabled-vibrant-container-color'                : Color.PrimaryContainer,
    'enabled-vibrant-button-container-color'         : 'transparent',
    'enabled-vibrant-selected-button-container-color': Color.SurfaceContainer,
    'enabled-vibrant-icon-color'                     : Color.OnPrimaryContainer,
    'enabled-vibrant-selected-icon-color'            : Color.OnSurface,
    'enabled-vibrant-label-color'                    : Color.OnPrimaryContainer,
    'enabled-vibrant-selected-label-color'           : Color.OnSurface,
    'hovered-vibrant-state-layer-color'              : Color.OnPrimaryContainer,
    'hovered-vibrant-selected-state-layer-color'     : Color.OnSurface,
    'focused-vibrant-state-layer-color'              : Color.OnPrimaryContainer,
    'focused-vibrant-selected-state-layer-color'     : Color.OnSurface,
    'pressed-vibrant-state-layer-color'              : Color.OnPrimaryContainer,
    'pressed-vibrant-selected-state-layer-color'     : Color.OnSurface,
})

/**
 * Style definition for `mdc-docked-toolbar-action`.
 */
export const DockedToolbarActionDefinition = createStyleDefinition({
    'container-min-width' : '48px',
    'container-height'    : '40px',
    ...expandPadding('container')({ block: '0px', inline: '12px' }),
    ...expandShape('enabled-container-shape')(Shape.Full),
    'icon-size'           : '24px',
    'icon-label-gap'      : '8px',
    ...expandTypescale('label')(Typescale.LabelLarge),

    // Standard
    'enabled-standard-container-color'         : 'transparent',
    'enabled-standard-selected-container-color': Color.SecondaryContainer,
    'enabled-standard-icon-color'              : Color.OnSurfaceVariant,
    'enabled-standard-selected-icon-color'     : Color.OnSecondaryContainer,
    'enabled-standard-label-color'             : Color.OnSurfaceVariant,
    'enabled-standard-selected-label-color'    : Color.OnSecondaryContainer,

    // Vibrant
    'enabled-vibrant-container-color'          : 'transparent',
    'enabled-vibrant-selected-container-color' : Color.SurfaceContainer,
    'enabled-vibrant-icon-color'               : Color.OnPrimaryContainer,
    'enabled-vibrant-selected-icon-color'      : Color.OnSurface,
    'enabled-vibrant-label-color'              : Color.OnPrimaryContainer,
    'enabled-vibrant-selected-label-color'     : Color.OnSurface,

    // Disabled
    'disabled-icon-color'   : Color.OnSurface,
    'disabled-icon-opacity' : '0.38',
    'disabled-label-color'  : Color.OnSurface,
    'disabled-label-opacity': '0.38',

    // State layer
    'hovered-state-layer-opacity': '0.08',
    'focused-state-layer-opacity': '0.10',
    'pressed-state-layer-opacity': '0.10',
})

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/menus/specs
 */
import { State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandPadding, expandShape, expandTypescale } from '../../utils/style'

/**
 * Style definition for `mdc-legacy-menu-item` — MD3 Baseline standard item.
 *
 * Based on the Material 3 baseline menu specification (m3.material.io
 * "Menu (baseline)" token set):
 *
 * - Item: 48dp single-line, 12dp horizontal padding, label-large
 *   (Roboto 14 / 20, tracking 0.1, weight 500)
 * - Icons: 24dp leading / trailing, on-surface-variant
 * - Selected state: secondary-container (#E8DEF8) background,
 *   on-secondary-container (#4A4458) label and icons
 * - State layer: on-surface at 8% / 10% / 10% (hover / focus / press)
 * - Disabled: on-surface at 38% label opacity
 */
export const LegacyMenuItemDefinition = createStyleDefinition({
    'enabled-container-height': `48px`,

    ...expandShape('enabled-container-shape')('4px'),

    ...expandPadding('enabled-container-padding')({ block: `0px`, inline: `12px` }),

    'enabled-container-color'             : `transparent`,
    'hovered-container-color'             : `transparent`,
    'focused-container-color'             : `transparent`,
    'pressed-container-color'             : `transparent`,
    'disabled-container-color'            : `transparent`,

    'enabled-container-color-selected'    : Color.SecondaryContainer,
    'hovered-container-color-selected'    : Color.SecondaryContainer,
    'focused-container-color-selected'    : Color.SecondaryContainer,
    'pressed-container-color-selected'    : Color.SecondaryContainer,

    // Label — label-large (font / leading / size / tracking / weight + opacity)
    ...expandTypescale('enabled-label')(Typescale.LabelLarge),
    'enabled-label-opacity'           : `1`,
    'enabled-label-color'             : Color.OnSurface,
    'enabled-label-color-selected'    : Color.OnSecondaryContainer,
    'disabled-label-color'            : Color.OnSurface,
    'disabled-label-opacity'          : State.DisabledStateLayerOpacity,

    // Shortcut hint
    'enabled-shortcut-label-color'    : Color.OnSurfaceVariant,

    // Leading / trailing icons — 24dp (baseline menu spec)
    'enabled-leading-icon-size'                 : `24px`,
    'enabled-trailing-icon-size'                : `24px`,
    'enabled-leading-icon-color'              : Color.OnSurfaceVariant,
    'enabled-leading-icon-color-selected'     : Color.OnSecondaryContainer,
    'enabled-trailing-icon-color'             : Color.OnSurfaceVariant,
    'enabled-trailing-icon-color-selected'    : Color.OnSecondaryContainer,

    // Icon-to-label spacing
    'enabled-leading-icon-label-space'        : `12px`,
    'enabled-label-trailing-icon-space'       : `12px`,

    // State layers (wired into `mdc-ripple`)
    'hovered-state-layer-color'   : Color.OnSurface,
    'hovered-state-layer-opacity' : State.HoveredStateLayerOpacity,
    'focused-state-layer-color'   : Color.OnSurface,
    'focused-state-layer-opacity' : State.FocusedStateLayerOpacity,
    'pressed-state-layer-color'   : Color.OnSurface,
    'pressed-state-layer-opacity' : State.PressedStateLayerOpacity,
})

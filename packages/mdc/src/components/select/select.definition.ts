/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ElevationLevel, State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandPadding, expandShape, expandTypescale } from '../../utils/style'

/**
 * Style definitions for `mdc-select`.
 *
 * Combines MD3 Exposed Dropdown Menu / Select field styling (via `mdc-field`)
 * with the M3 / M3E floating menu surface tokens:
 * - Display text: body-large (`16px` / `24px`)
 * - Dropdown arrow icon: `24px`, on-surface-variant (error when invalid)
 * - Menu surface: `surface-container-low` (standard) or `tertiary-container`
 *   (vibrant), Elevation Level 3, `16px` corners (M3E) or `4px` fallback,
 *   `2px` block padding, max-height `min(320px, calc(100vh - 48px))`.
 *
 * @link
 * https://m3.material.io/components/menus/specs
 */
const SharedSelectTokens = {
    ...expandTypescale('enabled-display-text')(Typescale.BodyLarge),
    'enabled-display-text-color': Color.OnSurface,
    'disabled-display-text-color': Color.OnSurface,
    'disabled-display-text-opacity': `0.38`,
    'enabled-placeholder-color': Color.OnSurfaceVariant,

    'dropdown-icon-size': `24px`,
    'enabled-dropdown-icon-color': Color.OnSurfaceVariant,
    'focused-dropdown-icon-color': Color.Primary,
    'invalid-dropdown-icon-color': Color.Error,
    'disabled-dropdown-icon-color': Color.OnSurface,
    'disabled-dropdown-icon-opacity': `0.38`,

    ...expandShape('menu-container-shape')('16px'),
    ...expandPadding('menu-container-padding')({ block: '4px', inline: '0px' }),
    'menu-container-elevation': ElevationLevel.Level3,
    'menu-container-max-height': `320px`,
    'menu-container-min-width': `112px`,

    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,
} as const

export const StandardSelectDefinition = createStyleDefinition({
    ...SharedSelectTokens,
    'menu-container-color': Color.SurfaceContainerLow,
})

export const VibrantSelectDefinition = createStyleDefinition({
    ...SharedSelectTokens,
    'menu-container-color': Color.TertiaryContainer,
})

export const SelectDefinitions = {
    Standard: StandardSelectDefinition,
    Vibrant: VibrantSelectDefinition,
} as const

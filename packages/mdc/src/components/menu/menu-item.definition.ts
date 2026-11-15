/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandPadding, expandShape, expandTypescale } from '../../utils/style'

/**
 * Style tokens for `mdc-menu-item` — Material Design 3 Expressive.
 *
 * - Item: 44dp highlight container inset 4dp inline / 2dp block inside a
 *   48dp full-width row (Figma "Container" 4x2 inset, 44dp high, 4dp corners;
 *   effective 16dp leading/trailing space, matching the M3E
 *   `menu-item.leading-space` / `trailing-space` tokens).
 * - Label label-large; leading / trailing icons 20dp with 12dp icon gap.
 * - Selected (choice per packet C3, applied to the whole expressive trio in
 *   both color-styles): tertiary-container fill with
 *   on-tertiary-container label and icons. In `vibrant` the fill matches the
 *   container, so selection reads via the check icon and state layer.
 * - State layers on-surface 8% / 10% / 10% (standard) or
 *   on-tertiary-container (vibrant); disabled on-surface at 38%;
 *   48dp minimum touch target.
 * - Supporting / shortcut text reuse label metrics; only their colors are
 *   tokenized here.
 *
 * @link
 * https://m3.material.io/components/menus/specs
 */
const MenuItemSharedTokens = {
    ...expandShape('enabled-container-shape')('4px'),

    ...expandPadding('enabled-container-padding')({ block: '0px', inlineStart: '12px', inlineEnd: '12px' }),

    'enabled-container-height': `44px`,
    'enabled-container-inset-inline': `4px`,
    'enabled-container-inset-block' : `2px`,

    ...expandTypescale('enabled-label')(Typescale.LabelLarge),
    // M3E `menu-item.supporting-text` → body-small (Roboto 12 / 16, 0.4, 400).
    ...expandTypescale('enabled-supporting-text')(Typescale.BodySmall),

    'enabled-leading-icon-size' : `20px`,
    'enabled-trailing-icon-size': `20px`,
    'enabled-icon-label-space'  : `12px`,

    // Selected colors are color-style specific (see the standard / vibrant
    // definitions): standard → tertiary-container / on-tertiary-container,
    // vibrant → tertiary / on-tertiary (M3E menus colour roles 7 & 8 & 11).

    'enabled-container-color' : `transparent`,
    'hovered-container-color' : `transparent`,
    'focused-container-color' : `transparent`,
    'pressed-container-color' : `transparent`,
    'disabled-container-color': `transparent`,

    'disabled-label-opacity': `0.38`,
    'min-touch-target-size' : `48px`,

    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,
}

export const StandardMenuItemDefinition = createStyleDefinition({
    ...MenuItemSharedTokens,

    'enabled-label-color'           : Color.OnSurface,
    'enabled-supporting-text-color' : Color.OnSurfaceVariant,
    'enabled-shortcut-color'        : Color.OnSurfaceVariant,
    'enabled-leading-icon-color'    : Color.OnSurfaceVariant,
    'enabled-trailing-icon-color'   : Color.OnSurfaceVariant,
    'disabled-label-color'          : Color.OnSurface,

    // Selected (standard): tertiary-container fill (colour roles 7 & 11),
    // on-tertiary-container label / icons (colour role 8).
    'enabled-container-color-selected'     : Color.TertiaryContainer,
    'hovered-container-color-selected'     : Color.TertiaryContainer,
    'focused-container-color-selected'     : Color.TertiaryContainer,
    'pressed-container-color-selected'     : Color.TertiaryContainer,
    'enabled-label-color-selected'         : Color.OnTertiaryContainer,
    'hovered-label-color-selected'         : Color.OnTertiaryContainer,
    'focused-label-color-selected'         : Color.OnTertiaryContainer,
    'pressed-label-color-selected'         : Color.OnTertiaryContainer,
    'enabled-leading-icon-color-selected'  : Color.OnTertiaryContainer,
    'enabled-trailing-icon-color-selected' : Color.OnTertiaryContainer,

    'hovered-state-layer-color': Color.OnSurface,
    'focused-state-layer-color': Color.OnSurface,
    'pressed-state-layer-color': Color.OnSurface,
})

export const VibrantMenuItemDefinition = createStyleDefinition({
    ...MenuItemSharedTokens,

    'enabled-label-color'           : Color.OnTertiaryContainer,
    'enabled-supporting-text-color' : Color.OnTertiaryContainer,
    'enabled-shortcut-color'        : Color.OnTertiaryContainer,
    'enabled-leading-icon-color'    : Color.OnTertiaryContainer,
    'enabled-trailing-icon-color'   : Color.OnTertiaryContainer,
    'disabled-label-color'          : Color.OnTertiaryContainer,

    // Selected (vibrant): tertiary fill (colour roles 7 & 11),
    // on-tertiary label / icons (colour role 8).
    'enabled-container-color-selected'     : Color.Tertiary,
    'hovered-container-color-selected'     : Color.Tertiary,
    'focused-container-color-selected'     : Color.Tertiary,
    'pressed-container-color-selected'     : Color.Tertiary,
    'enabled-label-color-selected'         : Color.OnTertiary,
    'hovered-label-color-selected'         : Color.OnTertiary,
    'focused-label-color-selected'         : Color.OnTertiary,
    'pressed-label-color-selected'         : Color.OnTertiary,
    'enabled-leading-icon-color-selected'  : Color.OnTertiary,
    'enabled-trailing-icon-color-selected' : Color.OnTertiary,

    'hovered-state-layer-color': Color.OnTertiaryContainer,
    'focused-state-layer-color': Color.OnTertiaryContainer,
    'pressed-state-layer-color': Color.OnTertiaryContainer,
})

export const MenuItemDefinitions = {
    Standard: StandardMenuItemDefinition,
    Vibrant: VibrantMenuItemDefinition,
} as const

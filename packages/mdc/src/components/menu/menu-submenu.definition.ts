/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ElevationLevel, State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandPadding, expandShape, expandTypescale } from '../../utils/style'

/**
 * Style tokens for the `mdc-menu-submenu` nested surface —
 * Material Design 3 Expressive.
 *
 * The nested surface mirrors the `mdc-menu` container (M3E vertical 16dp
 * corners, Level3 elevation, same container color per color-style, 2dp
 * block padding, `calc(100vh - 48px)` max-height with scroll). The trigger
 * row label reuses the menu-item label metrics (label-large) but its
 * tokens are still emitted here (no silent sharing). Grouped submenus
 * mirror the menu group label (32dp header, label-small).
 * Placement (`right-start` default, RTL mirrored, flip / shift) and the
 * hover-intent open / close delays (120 / 220 defaults, spec-TODO) are
 * props, not tokens.
 *
 * @link
 * https://m3.material.io/components/menus/specs
 */
const MenuSubmenuSharedTokens = {
    ...expandShape('enabled-container-shape')('16px'),
    ...expandShape('enabled-trigger-shape')('4px'),
    ...expandShape('hovered-trigger-shape')('8px'),
    ...expandShape('pressed-trigger-shape')('12px'),
    ...expandShape('enabled-open-trigger-shape')('12px'),

    ...expandPadding('enabled-container-padding')({ block: '2px', inline: '0px' }),

    'enabled-trigger-container-color': `transparent`,
    'enabled-trigger-height'         : `44px`,
    'enabled-trigger-inset-inline'   : `4px`,
    'enabled-trigger-inset-block'    : `2px`,
    'enabled-leading-icon-size'      : `20px`,
    'enabled-icon-label-space'       : `12px`,

    ...expandTypescale('enabled-trigger-label')(Typescale.LabelLarge),

    'enabled-group-label-container-height': `32px`,
    ...expandTypescale('enabled-group-label')(Typescale.LabelSmall),

    'enabled-divider-color'    : Color.OutlineVariant,
    'enabled-divider-thickness': `1px`,

    'enabled-container-elevation': ElevationLevel.Level3,
    'enabled-container-min-width': `112px`,
    'enabled-container-max-width': `280px`,
    'enabled-container-max-height': `calc(100vh - 48px)`,

    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,
}

export const StandardMenuSubmenuDefinition = createStyleDefinition({
    ...MenuSubmenuSharedTokens,

    'enabled-container-color'      : Color.SurfaceContainerLow,
    'enabled-trigger-label-color'  : Color.OnSurface,
    'enabled-leading-icon-color'   : Color.OnSurfaceVariant,
    'enabled-group-label-color'    : Color.OnSurfaceVariant,

    'open-trigger-container-color' : Color.TertiaryContainer,
    'open-trigger-label-color'     : Color.OnTertiaryContainer,
    'open-leading-icon-color'      : Color.OnTertiaryContainer,

    'hovered-state-layer-color'    : Color.OnSurface,
    'focused-state-layer-color'    : Color.OnSurface,
    'pressed-state-layer-color'    : Color.OnSurface,
    'open-state-layer-color'       : Color.OnTertiaryContainer,
})

export const VibrantMenuSubmenuDefinition = createStyleDefinition({
    ...MenuSubmenuSharedTokens,

    'enabled-container-color'      : Color.TertiaryContainer,
    'enabled-trigger-label-color'  : Color.OnTertiaryContainer,
    'enabled-leading-icon-color'   : Color.OnTertiaryContainer,
    'enabled-group-label-color'    : Color.OnTertiaryContainer,

    'open-trigger-container-color' : Color.Tertiary,
    'open-trigger-label-color'     : Color.OnTertiary,
    'open-leading-icon-color'      : Color.OnTertiary,

    'hovered-state-layer-color'    : Color.OnTertiaryContainer,
    'focused-state-layer-color'    : Color.OnTertiaryContainer,
    'pressed-state-layer-color'    : Color.OnTertiaryContainer,
    'open-state-layer-color'       : Color.OnTertiary,
})

export const MenuSubmenuDefinitions = {
    Standard: StandardMenuSubmenuDefinition,
    Vibrant: VibrantMenuSubmenuDefinition,
} as const

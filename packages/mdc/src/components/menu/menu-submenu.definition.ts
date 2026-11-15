/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ElevationLevel, Typescale } from '@sandlada/mdk'
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

    ...expandPadding('enabled-container-padding')({ block: '2px', inline: '0px' }),

    ...expandTypescale('enabled-trigger-label')(Typescale.LabelLarge),

    'enabled-group-label-container-height': `32px`,
    ...expandTypescale('enabled-group-label')(Typescale.LabelSmall),

    'enabled-container-elevation': ElevationLevel.Level3,
    'enabled-container-min-width': `112px`,
    'enabled-container-max-width': `280px`,
    'enabled-container-max-height': `calc(100vh - 48px)`,
}

export const StandardMenuSubmenuDefinition = createStyleDefinition({
    ...MenuSubmenuSharedTokens,

    'enabled-container-color'    : Color.SurfaceContainerLow,
    'enabled-trigger-label-color': Color.OnSurface,
    'enabled-group-label-color'  : Color.OnSurfaceVariant,
})

export const VibrantMenuSubmenuDefinition = createStyleDefinition({
    ...MenuSubmenuSharedTokens,

    'enabled-container-color'    : Color.TertiaryContainer,
    'enabled-trigger-label-color': Color.OnTertiaryContainer,
    'enabled-group-label-color'  : Color.OnTertiaryContainer,
})

export const MenuSubmenuDefinitions = {
    Standard: StandardMenuSubmenuDefinition,
    Vibrant: VibrantMenuSubmenuDefinition,
} as const

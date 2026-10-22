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
import { ElevationLevel, Shape, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandPadding, expandShape, expandTypescale } from '../../utils/style'

/**
 * Style definition for `mdc-legacy-menu-submenu` — MD3 Baseline standard submenu.
 *
 * The nested surface mirrors the standard menu container (4dp corners,
 * SurfaceContainer, Level2, 8dp block padding) and opens at `right-start`
 * (mirrored in RTL) with no overlap. Hover-intent delays are numeric props
 * on the element (`openDelay` 120 / `closeDelay` 220), not style tokens.
 */
export const LegacyMenuSubmenuDefinition = createStyleDefinition({
    ...expandShape('enabled-container-shape')(Shape.ExtraSmall),

    'enabled-container-color'    : Color.SurfaceContainer,
    'enabled-container-elevation': ElevationLevel.Level2,

    ...expandPadding('enabled-container-padding')({ block: `8px`, inline: `0px` }),

    'enabled-container-min-width' : `112px`,
    'enabled-container-max-width' : `280px`,
    'enabled-container-max-height': `calc(100vh - 48px)`,

    // Trigger row label — label-large
    ...expandTypescale('enabled-trigger-label')(Typescale.LabelLarge),
    'enabled-trigger-label-opacity': `1`,
    'enabled-trigger-label-color'  : Color.OnSurface,

    // Trigger expand icon — 24dp (baseline menu leading/trailing icon size)
    'enabled-trigger-icon-size' : `24px`,
    'enabled-trigger-icon-color': Color.OnSurfaceVariant,
})

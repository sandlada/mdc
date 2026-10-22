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
import type { LegacyMenuColorStyle, LegacyMenuLayout } from './legacy-menu.interface'

/**
 * Validates the legacy menu color style.
 *
 * Legacy MD3 Baseline menus support only `standard`. Any other value
 * (notably `vibrant`, which belongs to the expressive menu) throws —
 * never falls back silently.
 *
 * @throws {Error} When `value` is not `standard`.
 */
export function assertLegacyMenuVariant(value: string): asserts value is LegacyMenuColorStyle {
    if (value !== 'standard') {
        throw new Error(`[legacy-menu] Unsupported color-style "${value}". Legacy MD3 Baseline menus support only "standard".`)
    }
}

/**
 * Validates the legacy menu layout.
 *
 * Legacy MD3 Baseline menus support only `standard`. Any other value
 * (notably `grouped`, which belongs to the expressive menu) throws —
 * never falls back silently.
 *
 * @throws {Error} When `value` is not `standard`.
 */
export function assertLegacyMenuLayout(value: string): asserts value is LegacyMenuLayout {
    if (value !== 'standard') {
        throw new Error(`[legacy-menu] Unsupported layout "${value}". Legacy MD3 Baseline menus support only "standard".`)
    }
}

/**
 * Style definition for `mdc-legacy-menu` — MD3 Baseline standard menu.
 *
 * Based on the Material 3 menu specification (baseline):
 *
 * - Container: 4dp corners, SurfaceContainer, Level2
 * - Block padding: 8dp; width min 112dp / max 280dp; max-height viewport-48
 * - Divider: 1px outline-variant
 */
export const LegacyMenuDefinition = createStyleDefinition({
    ...expandShape('enabled-container-shape')(Shape.ExtraSmall),

    'enabled-container-color'    : Color.SurfaceContainer,
    'enabled-container-elevation': ElevationLevel.Level2,

    ...expandPadding('enabled-container-padding')({ block: `8px`, inline: `0px` }),

    'enabled-container-min-width' : `112px`,
    'enabled-container-max-width' : `280px`,
    'enabled-container-max-height': `calc(100vh - 48px)`,

    'enabled-divider-color'    : Color.OutlineVariant,
    'enabled-divider-thickness': `1px`,

    'enabled-group-label-container-height': `32px`,
    ...expandTypescale('enabled-group-label')(Typescale.LabelSmall),
    'enabled-group-label-color'  : Color.OnSurfaceVariant,
})

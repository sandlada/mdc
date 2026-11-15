/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ElevationLevel, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandPadding, expandShape, expandTypescale } from '../../utils/style'

/**
 * Style tokens for `mdc-menu-group` — Material Design 3 Expressive.
 *
 * Grouped menus with gaps render each group as a rounded surface with
 * Level3 elevation, 16dp outer corners (first/last) and 4dp inner corners
 * facing the gap.
 *
 * @link
 * https://m3.material.io/components/menus/specs
 */
const MenuGroupSharedTokens = {
    ...expandShape('enabled-container-shape')('4px'),
    ...expandShape('enabled-outer-container-shape')('16px'),
    ...expandPadding('enabled-container-padding')({ block: '2px', inline: '0px' }),

    'enabled-container-elevation': ElevationLevel.Level3,

    'enabled-group-label-container-height': `32px`,
    ...expandTypescale('enabled-group-label')(Typescale.LabelSmall),
}

export const StandardMenuGroupDefinition = createStyleDefinition({
    ...MenuGroupSharedTokens,

    'enabled-container-color': Color.SurfaceContainerLow,
    'enabled-group-label-color': Color.OnSurfaceVariant,
})

export const VibrantMenuGroupDefinition = createStyleDefinition({
    ...MenuGroupSharedTokens,

    'enabled-container-color': Color.TertiaryContainer,
    'enabled-group-label-color': Color.OnTertiaryContainer,
})

export const MenuGroupDefinitions = {
    Standard: StandardMenuGroupDefinition,
    Vibrant: VibrantMenuGroupDefinition,
} as const

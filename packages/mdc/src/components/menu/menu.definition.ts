/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ElevationLevel, State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandPadding, expandShape, expandTypescale } from '../../utils/style'

/**
 * Style tokens for the `mdc-menu` surface — Material Design 3 Expressive.
 *
 * - Container: M3E vertical 16dp corners; grouped first/last 12dp, inset
 *   items 4dp. Grouped on web is a single surface with divider / label
 *   slots — there are no gap surfaces (inset gaps are Android-only).
 * - Container color: standard surface-container-low (present in MDK, no
 *   fallback needed); vibrant tertiary-container used sparingly.
 * - Elevation Level3 (matches the M3 Design Kit "Menu" component, which
 *   applies M3/Elevation Light/3 to the vertical menu surface).
 * - Width min 112dp / max 280dp auto-fit; max-height viewport minus 48dp
 *   with scroll; 2dp block padding (Figma "List content" padding and the
 *   M3E `menu group padding` token), items full-bleed.
 * - Group label 32dp header in label-small.
 * - Divider outline-variant 1px.
 * - State layers on-surface 8% / 10% / 10%; disabled on-surface at 38%.
 *
 * @link
 * https://m3.material.io/components/menus/specs
 */
const MenuContainerTokens = {
    ...expandShape('enabled-container-shape')('16px'),
    ...expandShape('enabled-grouped-first-container-shape')('12px'),
    ...expandShape('enabled-grouped-last-container-shape')('12px'),
    ...expandShape('enabled-inset-item-shape')('4px'),

    ...expandPadding('enabled-container-padding')({ block: '2px', inline: '0px' }),

    'enabled-container-elevation'  : ElevationLevel.Level3,
    'enabled-container-min-width'  : `112px`,
    'enabled-container-max-width'  : `280px`,
    'enabled-container-max-height' : `calc(100vh - 48px)`,

    'enabled-divider-color'    : Color.OutlineVariant,
    'enabled-divider-thickness': `1px`,

    'enabled-group-label-container-height': `32px`,
    ...expandTypescale('enabled-group-label')(Typescale.LabelSmall),

    'disabled-label-opacity': `0.38`,

    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,
}

export const StandardMenuDefinition = createStyleDefinition({
    ...MenuContainerTokens,

    'enabled-container-color'    : Color.SurfaceContainerLow,
    'enabled-group-label-color'  : Color.OnSurfaceVariant,
    'disabled-label-color'       : Color.OnSurface,

    'hovered-state-layer-color': Color.OnSurface,
    'focused-state-layer-color': Color.OnSurface,
    'pressed-state-layer-color': Color.OnSurface,
})

export const VibrantMenuDefinition = createStyleDefinition({
    ...MenuContainerTokens,

    'enabled-container-color'    : Color.TertiaryContainer,
    'enabled-group-label-color'  : Color.OnTertiaryContainer,
    'disabled-label-color'       : Color.OnTertiaryContainer,

    'hovered-state-layer-color': Color.OnTertiaryContainer,
    'focused-state-layer-color': Color.OnTertiaryContainer,
    'pressed-state-layer-color': Color.OnTertiaryContainer,
})

export const MenuDefinitions = {
    Standard: StandardMenuDefinition,
    Vibrant: VibrantMenuDefinition,
} as const

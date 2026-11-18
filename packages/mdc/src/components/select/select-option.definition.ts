/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandPadding, expandShape, expandTypescale } from '../../utils/style'

/**
 * Style tokens for `mdc-select-option` — Material Design 3 / M3E & Android
 * `ExposedDropdownMenu` option item.
 *
 * - Row height: 48dp minimum touch target, 44dp inner highlight container
 *   inset 4dp inline / 2dp block (effective 16dp horizontal padding).
 * - Typography: `body-large` (16px / 24px) for option label, `body-small` for
 *   supporting text.
 * - Selected state: `secondary-container` (or `tertiary-container` in vibrant)
 *   highlight with `on-secondary-container` / `on-tertiary-container` label.
 * - State layers: 8% hover, 10% focus, 10% press; 38% disabled opacity.
 */
const SharedSelectOptionTokens = {
    ...expandShape('enabled-container-shape')('4px'),
    ...expandShape('hovered-container-shape')('8px'),
    ...expandShape('pressed-container-shape')('12px'),
    ...expandShape('enabled-selected-container-shape')('12px'),

    ...expandPadding('enabled-container-padding')({ block: '0px', inlineStart: '12px', inlineEnd: '12px' }),

    'enabled-container-height': `44px`,
    'enabled-container-inset-inline': `4px`,
    'enabled-container-inset-block': `2px`,
    'min-touch-target-size': `48px`,

    ...expandTypescale('enabled-label')(Typescale.BodyLarge),
    ...expandTypescale('enabled-supporting-text')(Typescale.BodySmall),

    'enabled-leading-icon-size': `20px`,
    'enabled-trailing-icon-size': `20px`,
    'enabled-icon-label-space': `12px`,

    'enabled-container-color': `transparent`,
    'hovered-container-color': `transparent`,
    'focused-container-color': `transparent`,
    'pressed-container-color': `transparent`,
    'disabled-container-color': `transparent`,

    'disabled-label-opacity': `0.38`,

    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,
} as const

export const StandardSelectOptionDefinition = createStyleDefinition({
    ...SharedSelectOptionTokens,

    'enabled-label-color': Color.OnSurface,
    'enabled-supporting-text-color': Color.OnSurfaceVariant,
    'enabled-leading-icon-color': Color.OnSurfaceVariant,
    'enabled-trailing-icon-color': Color.OnSurfaceVariant,
    'disabled-label-color': Color.OnSurface,

    'enabled-container-color-selected': Color.SecondaryContainer,
    'hovered-container-color-selected': Color.SecondaryContainer,
    'focused-container-color-selected': Color.SecondaryContainer,
    'pressed-container-color-selected': Color.SecondaryContainer,
    'enabled-label-color-selected': Color.OnSecondaryContainer,
    'hovered-label-color-selected': Color.OnSecondaryContainer,
    'focused-label-color-selected': Color.OnSecondaryContainer,
    'pressed-label-color-selected': Color.OnSecondaryContainer,
    'enabled-leading-icon-color-selected': Color.OnSecondaryContainer,
    'enabled-trailing-icon-color-selected': Color.OnSecondaryContainer,

    'hovered-state-layer-color': Color.OnSurface,
    'focused-state-layer-color': Color.OnSurface,
    'pressed-state-layer-color': Color.OnSurface,
    'hovered-state-layer-color-selected': Color.OnSecondaryContainer,
    'focused-state-layer-color-selected': Color.OnSecondaryContainer,
    'pressed-state-layer-color-selected': Color.OnSecondaryContainer,
})

export const VibrantSelectOptionDefinition = createStyleDefinition({
    ...SharedSelectOptionTokens,

    'enabled-label-color': Color.OnTertiaryContainer,
    'enabled-supporting-text-color': Color.OnTertiaryContainer,
    'enabled-leading-icon-color': Color.OnTertiaryContainer,
    'enabled-trailing-icon-color': Color.OnTertiaryContainer,
    'disabled-label-color': Color.OnTertiaryContainer,

    'enabled-container-color-selected': Color.Tertiary,
    'hovered-container-color-selected': Color.Tertiary,
    'focused-container-color-selected': Color.Tertiary,
    'pressed-container-color-selected': Color.Tertiary,
    'enabled-label-color-selected': Color.OnTertiary,
    'hovered-label-color-selected': Color.OnTertiary,
    'focused-label-color-selected': Color.OnTertiary,
    'pressed-label-color-selected': Color.OnTertiary,
    'enabled-leading-icon-color-selected': Color.OnTertiary,
    'enabled-trailing-icon-color-selected': Color.OnTertiary,

    'hovered-state-layer-color': Color.OnTertiaryContainer,
    'focused-state-layer-color': Color.OnTertiaryContainer,
    'pressed-state-layer-color': Color.OnTertiaryContainer,
    'hovered-state-layer-color-selected': Color.OnTertiary,
    'focused-state-layer-color-selected': Color.OnTertiary,
    'pressed-state-layer-color-selected': Color.OnTertiary,
})

export const SelectOptionDefinitions = {
    Standard: StandardSelectOptionDefinition,
    Vibrant: VibrantSelectOptionDefinition,
} as const

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape, Typescale } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

/**
 * Style definition for `mdc-chip`.
 *
 * Based on Material Components for Android `Widget.Material3.Chip.*` styles:
 *
 * - Container: 32dp height, 8dp corner, 1dp outline
 * - Label: label-large (14sp)
 * - Icon: 18dp
 * - Avatar (input): 24dp, full shape
 * - Trailing icon (input): 18dp
 * - Touch target: 48dp min
 *
 * Padding per variant (from Android styles.xml):
 * - Assist: start=8, end=8, textStart=8, textEnd=8
 * - Filter: start=8, end=10, textStart=8, textEnd=6
 * - Input: start=4, end=4, textStart=8, textEnd=8
 * - Suggestion: start=8, end=10, textStart=8, textEnd=6
 */

// Shared tokens — Base.Widget.Material3.Chip
const shared = {
    'enabled-label-font'          : Typescale.LabelLarge.Font,
    'enabled-label-size'          : Typescale.LabelLarge.FontSize,
    'enabled-label-weight'        : Typescale.LabelLarge.FontWeight,
    'enabled-label-tracking'      : Typescale.LabelLarge.Tracking,
    'enabled-label-line-height'   : Typescale.LabelLarge.LineHeight,

    'container-height'            : `32px`,
    'container-shape-start-start' : Shape.Small,
    'container-shape-start-end'   : Shape.Small,
    'container-shape-end-start'   : Shape.Small,
    'container-shape-end-end'     : Shape.Small,
    'outline-width'               : `1px`,

    'icon-size'                   : `18px`,
    'avatar-size'                 : `24px`,
    'avatar-shape-start-start'    : Shape.Full,
    'avatar-shape-start-end'      : Shape.Full,
    'avatar-shape-end-start'      : Shape.Full,
    'avatar-shape-end-end'        : Shape.Full,
    'trailing-icon-size'          : `18px`,

    'min-touch-target-size'       : `48px`,

    'hovered-state-layer-opacity'  : `0.08`,
    'focused-state-layer-opacity'  : `0.1`,
    'pressed-state-layer-opacity'  : `0.1`,

    'disabled-label-opacity'      : `0.38`,
    'disabled-icon-opacity'       : `0.38`,
    'disabled-outline-opacity'    : `0.12`,

    // Elevated surface (MD3 elevated assist chip, toggled via `elevated`)
    'enabled-container-color-elevated'   : Color.SurfaceContainerLow,
    'hovered-container-color-elevated'   : Color.SurfaceContainerLow,
    'focused-container-color-elevated'   : Color.SurfaceContainerLow,
    'pressed-container-color-elevated'   : Color.SurfaceContainerLow,
    'disabled-container-color-elevated'  : Color.SurfaceContainerLow,
    'enabled-outline-color-elevated'     : `transparent`,
    'enabled-container-elevation'        : `1`,
    'hovered-container-elevation'        : `1`,
    'focused-container-elevation'        : `1`,
    'pressed-container-elevation'        : `1`,
    'disabled-container-elevation'       : `0`,
    'enabled-container-shadow-color'     : Color.Shadow,
} as const

// Assist Chip — Widget.Material3.Chip.Assist
export const AssistChipDefinition = createStyleDefinition({
    ...shared,
    'container-padding-inline-start': `8px`,
    'container-padding-inline-end'  : `8px`,
    'container-padding-block-start' : `0px`,
    'container-padding-block-end'   : `0px`,
    'text-padding-inline-start'     : `8px`,
    'text-padding-inline-end'       : `8px`,
    'text-padding-block-start'      : `0px`,
    'text-padding-block-end'        : `0px`,

    'enabled-container-color'     : `transparent`,
    'enabled-label-color'         : Color.OnSurface,
    'enabled-outline-color'       : Color.Outline,
    'enabled-icon-color'          : Color.Primary,
    'hovered-state-layer-color'   : Color.OnSurface,
    'focused-state-layer-color'   : Color.OnSurface,
    'pressed-state-layer-color'   : Color.OnSurface,

    'hovered-container-color'     : `transparent`,
    'hovered-label-color'         : Color.OnSurface,
    'hovered-icon-color'          : Color.Primary,
    'hovered-outline-color'       : Color.Outline,

    'focused-container-color'     : `transparent`,
    'focused-label-color'         : Color.OnSurface,
    'focused-icon-color'          : Color.Primary,
    'focused-outline-color'       : Color.Outline,

    'pressed-container-color'     : `transparent`,
    'pressed-label-color'         : Color.OnSurface,
    'pressed-icon-color'          : Color.Primary,
    'pressed-outline-color'       : Color.Outline,

    'disabled-container-color'    : `transparent`,
    'disabled-label-color'        : Color.OnSurface,
    'disabled-icon-color'         : Color.OnSurface,
    'disabled-outline-color'      : Color.OnSurface,
})

// Filter Chip — Widget.Material3.Chip.Filter
export const FilterChipDefinition = createStyleDefinition({
    ...shared,
    'container-padding-inline-start': `8px`,
    'container-padding-inline-end'  : `10px`,
    'container-padding-block-start' : `0px`,
    'container-padding-block-end'   : `0px`,
    'text-padding-inline-start'     : `8px`,
    'text-padding-inline-end'       : `6px`,
    'text-padding-block-start'      : `0px`,
    'text-padding-block-end'        : `0px`,

    'enabled-container-color'     : `transparent`,
    'enabled-label-color'         : Color.OnSurface,
    'enabled-outline-color'       : Color.Outline,
    'enabled-icon-color'          : Color.OnSurface,
    'enabled-checkmark-color'     : Color.OnSecondaryContainer,
    'hovered-state-layer-color'   : Color.OnSurface,
    'focused-state-layer-color'   : Color.OnSurface,
    'pressed-state-layer-color'   : Color.OnSurface,

    'hovered-container-color'     : `transparent`,
    'hovered-label-color'         : Color.OnSurface,
    'hovered-icon-color'          : Color.OnSurface,
    'hovered-outline-color'       : Color.Outline,

    'focused-container-color'     : `transparent`,
    'focused-label-color'         : Color.OnSurface,
    'focused-icon-color'          : Color.OnSurface,
    'focused-outline-color'       : Color.Outline,

    'pressed-container-color'     : `transparent`,
    'pressed-label-color'         : Color.OnSurface,
    'pressed-icon-color'          : Color.OnSurface,
    'pressed-outline-color'       : Color.Outline,

    'enabled-container-color-selected'    : Color.SecondaryContainer,
    'enabled-label-color-selected'   : Color.OnSecondaryContainer,
    'enabled-icon-color-selected'     : Color.OnSecondaryContainer,
    'enabled-outline-color-selected'  : `transparent`,

    'hovered-container-color-selected'    : Color.SecondaryContainer,
    'hovered-label-color-selected'   : Color.OnSecondaryContainer,
    'hovered-icon-color-selected'         : Color.OnSecondaryContainer,
    'hovered-outline-color-selected'      : `transparent`,

    'focused-container-color-selected'    : Color.SecondaryContainer,
    'focused-label-color-selected'   : Color.OnSecondaryContainer,
    'focused-icon-color-selected'         : Color.OnSecondaryContainer,
    'focused-outline-color-selected'      : `transparent`,

    'pressed-container-color-selected'    : Color.SecondaryContainer,
    'pressed-label-color-selected'   : Color.OnSecondaryContainer,
    'pressed-icon-color-selected'         : Color.OnSecondaryContainer,
    'pressed-outline-color-selected'      : `transparent`,

    'disabled-container-color'    : `transparent`,
    'disabled-label-color'        : Color.OnSurface,
    'disabled-icon-color'         : Color.OnSurface,
    'disabled-outline-color'      : Color.OnSurface,

    'disabled-container-color-selected'    : `transparent`,
    'disabled-label-color-selected'   : Color.OnSurface,
    'disabled-icon-color-selected'         : Color.OnSurface,
    'disabled-outline-color-selected'      : Color.OnSurface,
})

// Input Chip — Widget.Material3.Chip.Input
export const InputChipDefinition = createStyleDefinition({
    ...shared,
    'container-padding-inline-start': `4px`,
    'container-padding-inline-end'  : `4px`,
    'container-padding-block-start' : `0px`,
    'container-padding-block-end'   : `0px`,
    'text-padding-inline-start'     : `8px`,
    'text-padding-inline-end'       : `8px`,
    'text-padding-block-start'      : `0px`,
    'text-padding-block-end'        : `0px`,

    'enabled-container-color'     : `transparent`,
    'enabled-label-color'         : Color.OnSurface,
    'enabled-outline-color'       : Color.Outline,
    'enabled-icon-color'          : Color.OnSurfaceVariant,
    'enabled-avatar-color'        : Color.OnSurfaceVariant,
    'enabled-trailing-icon-color' : Color.OnSurfaceVariant,
    'hovered-state-layer-color'   : Color.OnSurface,
    'focused-state-layer-color'   : Color.OnSurface,
    'pressed-state-layer-color'   : Color.OnSurface,

    'hovered-container-color'     : `transparent`,
    'hovered-label-color'         : Color.OnSurface,
    'hovered-icon-color'          : Color.OnSurfaceVariant,
    'hovered-avatar-color'        : Color.OnSurfaceVariant,
    'hovered-trailing-icon-color' : Color.OnSurfaceVariant,
    'hovered-outline-color'       : Color.Outline,

    'focused-container-color'     : `transparent`,
    'focused-label-color'         : Color.OnSurface,
    'focused-icon-color'          : Color.OnSurfaceVariant,
    'focused-avatar-color'        : Color.OnSurfaceVariant,
    'focused-trailing-icon-color' : Color.OnSurfaceVariant,
    'focused-outline-color'       : Color.Outline,

    'pressed-container-color'     : `transparent`,
    'pressed-label-color'         : Color.OnSurface,
    'pressed-icon-color'          : Color.OnSurfaceVariant,
    'pressed-avatar-color'        : Color.OnSurfaceVariant,
    'pressed-trailing-icon-color' : Color.OnSurfaceVariant,
    'pressed-outline-color'       : Color.Outline,

    'disabled-container-color'    : `transparent`,
    'disabled-label-color'        : Color.OnSurface,
    'disabled-icon-color'         : Color.OnSurface,
    'disabled-avatar-color'       : Color.OnSurface,
    'disabled-trailing-icon-color': Color.OnSurface,
    'disabled-outline-color'      : Color.OnSurface,
})

// Suggestion Chip — Widget.Material3.Chip.Suggestion
export const SuggestionChipDefinition = createStyleDefinition({
    ...shared,
    'container-padding-inline-start': `8px`,
    'container-padding-inline-end'  : `10px`,
    'container-padding-block-start' : `0px`,
    'container-padding-block-end'   : `0px`,
    'text-padding-inline-start'     : `8px`,
    'text-padding-inline-end'       : `6px`,
    'text-padding-block-start'      : `0px`,
    'text-padding-block-end'        : `0px`,

    'enabled-container-color'     : `transparent`,
    'enabled-label-color'         : Color.OnSurface,
    'enabled-outline-color'       : Color.Outline,
    'hovered-state-layer-color'   : Color.OnSurface,
    'focused-state-layer-color'   : Color.OnSurface,
    'pressed-state-layer-color'   : Color.OnSurface,

    'hovered-container-color'     : `transparent`,
    'hovered-label-color'         : Color.OnSurface,
    'hovered-outline-color'       : Color.Outline,

    'focused-container-color'     : `transparent`,
    'focused-label-color'         : Color.OnSurface,
    'focused-outline-color'       : Color.Outline,

    'pressed-container-color'     : `transparent`,
    'pressed-label-color'         : Color.OnSurface,
    'pressed-outline-color'       : Color.Outline,

    'disabled-container-color'    : `transparent`,
    'disabled-label-color'        : Color.OnSurface,
    'disabled-outline-color'      : Color.OnSurface,
})

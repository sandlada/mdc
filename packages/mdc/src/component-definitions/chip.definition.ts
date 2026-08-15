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
    'label-text-font'             : Typescale.LabelLarge.Font,
    'label-text-size'             : Typescale.LabelLarge.FontSize,
    'label-text-weight'           : Typescale.LabelLarge.FontWeight,
    'label-text-tracking'         : Typescale.LabelLarge.Tracking,
    'label-text-line-height'      : Typescale.LabelLarge.LineHeight,

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

    'hover-state-layer-opacity'   : `0.08`,
    'focus-state-layer-opacity'   : `0.1`,
    'pressed-state-layer-opacity' : `0.1`,

    'disabled-label-text-opacity' : `0.38`,
    'disabled-icon-opacity'       : `0.38`,
    'disabled-outline-opacity'    : `0.12`,
} as const

// Assist Chip — Widget.Material3.Chip.Assist
export const AssistChipDefinition = createStyleDefinition({
    ...shared,
    'container-padding-start'     : `8px`,
    'container-padding-end'       : `8px`,
    'text-padding-start'          : `8px`,
    'text-padding-end'            : `8px`,

    'container-color'             : `transparent`,
    'label-text-color'            : Color.OnSurface,
    'outline-color'               : Color.Outline,
    'icon-color'                  : Color.Primary,
    'hover-state-layer-color'     : Color.OnSurface,
    'focus-state-layer-color'     : Color.OnSurface,
    'pressed-state-layer-color'   : Color.OnSurface,

    'hovered-container-color'     : `transparent`,
    'hovered-label-text-color'    : Color.OnSurface,
    'hovered-icon-color'          : Color.Primary,
    'hovered-outline-color'       : Color.Outline,

    'focused-container-color'     : `transparent`,
    'focused-label-text-color'    : Color.OnSurface,
    'focused-icon-color'          : Color.Primary,
    'focused-outline-color'       : Color.Outline,

    'pressed-container-color'     : `transparent`,
    'pressed-label-text-color'    : Color.OnSurface,
    'pressed-icon-color'          : Color.Primary,
    'pressed-outline-color'       : Color.Outline,

    'disabled-container-color'    : `transparent`,
    'disabled-label-text-color'   : Color.OnSurface,
    'disabled-icon-color'         : Color.OnSurface,
    'disabled-outline-color'      : Color.OnSurface,
})

// Filter Chip — Widget.Material3.Chip.Filter
export const FilterChipDefinition = createStyleDefinition({
    ...shared,
    'container-padding-start'     : `8px`,
    'container-padding-end'       : `10px`,
    'text-padding-start'          : `8px`,
    'text-padding-end'            : `6px`,

    'container-color'             : `transparent`,
    'label-text-color'            : Color.OnSurface,
    'outline-color'               : Color.Outline,
    'icon-color'                  : Color.OnSurface,
    'checkmark-color'             : Color.OnSecondaryContainer,
    'hover-state-layer-color'     : Color.OnSurface,
    'focus-state-layer-color'     : Color.OnSurface,
    'pressed-state-layer-color'   : Color.OnSurface,

    'hovered-container-color'     : `transparent`,
    'hovered-label-text-color'    : Color.OnSurface,
    'hovered-icon-color'          : Color.OnSurface,
    'hovered-outline-color'       : Color.Outline,

    'focused-container-color'     : `transparent`,
    'focused-label-text-color'    : Color.OnSurface,
    'focused-icon-color'          : Color.OnSurface,
    'focused-outline-color'       : Color.Outline,

    'pressed-container-color'     : `transparent`,
    'pressed-label-text-color'    : Color.OnSurface,
    'pressed-icon-color'          : Color.OnSurface,
    'pressed-outline-color'       : Color.Outline,

    'selected-container-color'    : Color.SecondaryContainer,
    'selected-label-text-color'   : Color.OnSecondaryContainer,
    'selected-icon-color'         : Color.OnSecondaryContainer,
    'selected-outline-color'      : `transparent`,

    'selected-hovered-container-color'    : Color.SecondaryContainer,
    'selected-hovered-label-text-color'   : Color.OnSecondaryContainer,
    'selected-hovered-icon-color'         : Color.OnSecondaryContainer,
    'selected-hovered-outline-color'      : `transparent`,

    'selected-focused-container-color'    : Color.SecondaryContainer,
    'selected-focused-label-text-color'   : Color.OnSecondaryContainer,
    'selected-focused-icon-color'         : Color.OnSecondaryContainer,
    'selected-focused-outline-color'      : `transparent`,

    'selected-pressed-container-color'    : Color.SecondaryContainer,
    'selected-pressed-label-text-color'   : Color.OnSecondaryContainer,
    'selected-pressed-icon-color'         : Color.OnSecondaryContainer,
    'selected-pressed-outline-color'      : `transparent`,

    'disabled-container-color'    : `transparent`,
    'disabled-label-text-color'   : Color.OnSurface,
    'disabled-icon-color'         : Color.OnSurface,
    'disabled-outline-color'      : Color.OnSurface,

    'disabled-selected-container-color'    : `transparent`,
    'disabled-selected-label-text-color'   : Color.OnSurface,
    'disabled-selected-icon-color'         : Color.OnSurface,
    'disabled-selected-outline-color'      : Color.OnSurface,
})

// Input Chip — Widget.Material3.Chip.Input
export const InputChipDefinition = createStyleDefinition({
    ...shared,
    'container-padding-start'     : `4px`,
    'container-padding-end'       : `4px`,
    'text-padding-start'          : `8px`,
    'text-padding-end'            : `8px`,

    'container-color'             : `transparent`,
    'label-text-color'            : Color.OnSurface,
    'outline-color'               : Color.Outline,
    'icon-color'                  : Color.OnSurfaceVariant,
    'avatar-color'                : Color.OnSurfaceVariant,
    'trailing-icon-color'         : Color.OnSurfaceVariant,
    'hover-state-layer-color'     : Color.OnSurface,
    'focus-state-layer-color'     : Color.OnSurface,
    'pressed-state-layer-color'   : Color.OnSurface,

    'hovered-container-color'     : `transparent`,
    'hovered-label-text-color'    : Color.OnSurface,
    'hovered-icon-color'          : Color.OnSurfaceVariant,
    'hovered-avatar-color'        : Color.OnSurfaceVariant,
    'hovered-trailing-icon-color' : Color.OnSurfaceVariant,
    'hovered-outline-color'       : Color.Outline,

    'focused-container-color'     : `transparent`,
    'focused-label-text-color'    : Color.OnSurface,
    'focused-icon-color'          : Color.OnSurfaceVariant,
    'focused-avatar-color'        : Color.OnSurfaceVariant,
    'focused-trailing-icon-color' : Color.OnSurfaceVariant,
    'focused-outline-color'       : Color.Outline,

    'pressed-container-color'     : `transparent`,
    'pressed-label-text-color'    : Color.OnSurface,
    'pressed-icon-color'          : Color.OnSurfaceVariant,
    'pressed-avatar-color'        : Color.OnSurfaceVariant,
    'pressed-trailing-icon-color' : Color.OnSurfaceVariant,
    'pressed-outline-color'       : Color.Outline,

    'disabled-container-color'    : `transparent`,
    'disabled-label-text-color'   : Color.OnSurface,
    'disabled-icon-color'         : Color.OnSurface,
    'disabled-avatar-color'       : Color.OnSurface,
    'disabled-trailing-icon-color': Color.OnSurface,
    'disabled-outline-color'      : Color.OnSurface,
})

// Suggestion Chip — Widget.Material3.Chip.Suggestion
export const SuggestionChipDefinition = createStyleDefinition({
    ...shared,
    'container-padding-start'     : `8px`,
    'container-padding-end'       : `10px`,
    'text-padding-start'          : `8px`,
    'text-padding-end'            : `6px`,

    'container-color'             : `transparent`,
    'label-text-color'            : Color.OnSurface,
    'outline-color'               : Color.Outline,
    'hover-state-layer-color'     : Color.OnSurface,
    'focus-state-layer-color'     : Color.OnSurface,
    'pressed-state-layer-color'   : Color.OnSurface,

    'hovered-container-color'     : `transparent`,
    'hovered-label-text-color'    : Color.OnSurface,
    'hovered-outline-color'       : Color.Outline,

    'focused-container-color'     : `transparent`,
    'focused-label-text-color'    : Color.OnSurface,
    'focused-outline-color'       : Color.Outline,

    'pressed-container-color'     : `transparent`,
    'pressed-label-text-color'    : Color.OnSurface,
    'pressed-outline-color'       : Color.Outline,

    'disabled-container-color'    : `transparent`,
    'disabled-label-text-color'   : Color.OnSurface,
    'disabled-outline-color'      : Color.OnSurface,
})

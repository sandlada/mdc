/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandShape, expandTypescale } from '../../utils/style'

/**
 * Style definitions for `mdc-chip` across all 4 Material Design 3 variants.
 *
 * Metrics aligned with Material Design 3 Figma specs, Jetpack Compose Material 3
 * (`AssistChipTokens`, `FilterChipTokens`, `InputChipTokens`, `SuggestionChipTokens`),
 * Flutter Material 3 (`_ActionChipDefaultsM3`, `_FilterChipDefaultsM3`, `_InputChipDefaultsM3`),
 * and Material Components for Android (`Widget.Material3.Chip.*`):
 *
 * - Container: 32dp height, 8dp (`Shape.Small`) corners, 1dp outline (`OutlineVariant`)
 * - Typography: Label Large (14sp / 20sp, 500 weight, 0.1sp tracking)
 * - Icons: 18dp leading icon / checkmark / trailing icon
 * - Avatar: 24dp circular (`Shape.Full`)
 * - Horizontal spacing: 16dp text-only edges (12dp on input), 8dp when leading/trailing
 *   icon present, 4dp when avatar present; 8dp gap between adjacent elements
 * - Minimum touch target: 48dp height
 *
 * @link
 * https://m3.material.io/components/chips/specs
 */

const Shared = {
    ...expandTypescale('enabled-label')(Typescale.LabelLarge),
    ...expandShape('container-shape')(Shape.Small),
    ...expandShape('avatar-shape')(Shape.Full),

    'container-height'                  : `32px`,
    'outline-width'                     : `1px`,

    'icon-size'                         : `18px`,
    'avatar-size'                       : `24px`,
    'trailing-icon-size'                : `18px`,
    'trailing-action-size'              : `24px`,
    'min-touch-target-size'             : `48px`,

    'leading-space'                     : `16px`,
    'trailing-space'                    : `16px`,
    'with-leading-icon-leading-space'   : `8px`,
    'with-avatar-leading-space'         : `4px`,
    'with-trailing-icon-trailing-space' : `8px`,
    'icon-label-space'                  : `8px`,

    'hovered-state-layer-opacity'       : State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity'       : State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity'       : State.PressedStateLayerOpacity,
    'dragged-state-layer-opacity'       : State.DraggedStateLayerOpacity,

    'disabled-container-opacity'        : `0.12`,
    'disabled-outline-opacity'          : `0.12`,
    'disabled-label-opacity'            : `0.38`,
    'disabled-icon-opacity'             : `0.38`,

    // Elevated surface tokens (level indices 0..5 for `mdc-elevation`)
    'enabled-container-color-elevated'  : Color.SurfaceContainerLow,
    'hovered-container-color-elevated'  : Color.SurfaceContainerLow,
    'focused-container-color-elevated'  : Color.SurfaceContainerLow,
    'pressed-container-color-elevated'  : Color.SurfaceContainerLow,
    'dragged-container-color-elevated'  : Color.SurfaceContainerLow,
    'disabled-container-color-elevated' : Color.OnSurface,
    'enabled-outline-color-elevated'    : `transparent`,

    'enabled-container-elevation'       : `1`,
    'hovered-container-elevation'       : `2`,
    'focused-container-elevation'       : `1`,
    'pressed-container-elevation'       : `1`,
    'dragged-container-elevation'       : `4`,
    'disabled-container-elevation'      : `0`,
    'enabled-container-shadow-color'    : Color.Shadow,

    // Fallback selected / avatar / checkmark defaults (specialized per variant below)
    'enabled-avatar-container-color'          : Color.OnSurfaceVariant,
    'enabled-avatar-label-color'              : Color.Surface,
    'enabled-avatar-container-color-selected' : Color.OnSecondaryContainer,
    'enabled-avatar-checkmark-color'          : Color.Surface,

    'enabled-container-color-selected'        : Color.SecondaryContainer,
    'hovered-container-color-selected'        : Color.SecondaryContainer,
    'focused-container-color-selected'        : Color.SecondaryContainer,
    'pressed-container-color-selected'        : Color.SecondaryContainer,
    'dragged-container-color-selected'        : Color.SecondaryContainer,
    'disabled-container-color-selected'       : Color.OnSurface,

    'enabled-label-color-selected'            : Color.OnSecondaryContainer,
    'hovered-label-color-selected'            : Color.OnSecondaryContainer,
    'focused-label-color-selected'            : Color.OnSecondaryContainer,
    'pressed-label-color-selected'            : Color.OnSecondaryContainer,
    'disabled-label-color-selected'           : Color.OnSurface,

    'enabled-icon-color-selected'             : Color.OnSecondaryContainer,
    'hovered-icon-color-selected'             : Color.OnSecondaryContainer,
    'focused-icon-color-selected'             : Color.OnSecondaryContainer,
    'pressed-icon-color-selected'             : Color.OnSecondaryContainer,
    'disabled-icon-color-selected'            : Color.OnSurface,

    'enabled-checkmark-color'                 : Color.OnSecondaryContainer,
    'enabled-checkmark-color-selected'        : Color.OnSecondaryContainer,
    'disabled-checkmark-color'                : Color.OnSurface,

    'enabled-trailing-icon-color'             : Color.OnSurfaceVariant,
    'hovered-trailing-icon-color'             : Color.OnSurfaceVariant,
    'focused-trailing-icon-color'             : Color.OnSurfaceVariant,
    'pressed-trailing-icon-color'             : Color.OnSurfaceVariant,
    'disabled-trailing-icon-color'            : Color.OnSurface,

    'enabled-trailing-icon-color-selected'    : Color.OnSecondaryContainer,
    'hovered-trailing-icon-color-selected'    : Color.OnSecondaryContainer,
    'focused-trailing-icon-color-selected'    : Color.OnSecondaryContainer,
    'pressed-trailing-icon-color-selected'    : Color.OnSecondaryContainer,
    'disabled-trailing-icon-color-selected'   : Color.OnSurface,

    'enabled-outline-color-selected'          : `transparent`,
    'hovered-outline-color-selected'          : `transparent`,
    'focused-outline-color-selected'          : `transparent`,
    'pressed-outline-color-selected'          : `transparent`,
    'disabled-outline-color-selected'         : `transparent`,

    'hovered-state-layer-color-selected'      : Color.OnSecondaryContainer,
    'focused-state-layer-color-selected'      : Color.OnSecondaryContainer,
    'pressed-state-layer-color-selected'      : Color.OnSecondaryContainer,
} as const

/** Assist Chip — MD3 AssistChipTokens / Widget.Material3.Chip.Assist */
export const AssistChipDefinition = createStyleDefinition({
    ...Shared,

    'enabled-container-color'   : `transparent`,
    'hovered-container-color'   : `transparent`,
    'focused-container-color'   : `transparent`,
    'pressed-container-color'   : `transparent`,
    'dragged-container-color'   : `transparent`,
    'disabled-container-color'  : `transparent`,

    'enabled-label-color'       : Color.OnSurface,
    'hovered-label-color'       : Color.OnSurface,
    'focused-label-color'       : Color.OnSurface,
    'pressed-label-color'       : Color.OnSurface,
    'disabled-label-color'      : Color.OnSurface,

    'enabled-icon-color'        : Color.Primary,
    'hovered-icon-color'        : Color.Primary,
    'focused-icon-color'        : Color.Primary,
    'pressed-icon-color'        : Color.Primary,
    'disabled-icon-color'       : Color.OnSurface,

    'enabled-outline-color'     : Color.OutlineVariant,
    'hovered-outline-color'     : Color.OutlineVariant,
    'focused-outline-color'     : Color.OnSurface,
    'pressed-outline-color'     : Color.OutlineVariant,
    'disabled-outline-color'    : Color.OnSurface,

    'hovered-state-layer-color' : Color.OnSurface,
    'focused-state-layer-color' : Color.OnSurface,
    'pressed-state-layer-color' : Color.OnSurface,
})

/** Filter Chip — MD3 FilterChipTokens / Widget.Material3.Chip.Filter */
export const FilterChipDefinition = createStyleDefinition({
    ...Shared,

    'enabled-container-color'   : `transparent`,
    'hovered-container-color'   : `transparent`,
    'focused-container-color'   : `transparent`,
    'pressed-container-color'   : `transparent`,
    'dragged-container-color'   : `transparent`,
    'disabled-container-color'  : `transparent`,

    'enabled-label-color'       : Color.OnSurfaceVariant,
    'hovered-label-color'       : Color.OnSurfaceVariant,
    'focused-label-color'       : Color.OnSurfaceVariant,
    'pressed-label-color'       : Color.OnSurfaceVariant,
    'disabled-label-color'      : Color.OnSurface,

    'enabled-icon-color'        : Color.Primary,
    'hovered-icon-color'        : Color.Primary,
    'focused-icon-color'        : Color.Primary,
    'pressed-icon-color'        : Color.Primary,
    'disabled-icon-color'       : Color.OnSurface,

    'enabled-outline-color'     : Color.OutlineVariant,
    'hovered-outline-color'     : Color.OutlineVariant,
    'focused-outline-color'     : Color.OnSurfaceVariant,
    'pressed-outline-color'     : Color.OutlineVariant,
    'disabled-outline-color'    : Color.OnSurface,

    'hovered-state-layer-color' : Color.OnSurfaceVariant,
    'focused-state-layer-color' : Color.OnSurfaceVariant,
    'pressed-state-layer-color' : Color.OnSurfaceVariant,
})

/** Input Chip — MD3 InputChipTokens / Widget.Material3.Chip.Input */
export const InputChipDefinition = createStyleDefinition({
    ...Shared,

    'leading-space'             : `12px`,
    'trailing-space'            : `12px`,

    'enabled-container-color'   : `transparent`,
    'hovered-container-color'   : `transparent`,
    'focused-container-color'   : `transparent`,
    'pressed-container-color'   : `transparent`,
    'dragged-container-color'   : `transparent`,
    'disabled-container-color'  : `transparent`,

    'enabled-label-color'       : Color.OnSurfaceVariant,
    'hovered-label-color'       : Color.OnSurfaceVariant,
    'focused-label-color'       : Color.OnSurfaceVariant,
    'pressed-label-color'       : Color.OnSurfaceVariant,
    'disabled-label-color'      : Color.OnSurface,

    'enabled-icon-color'        : Color.OnSurfaceVariant,
    'hovered-icon-color'        : Color.OnSurfaceVariant,
    'focused-icon-color'        : Color.OnSurfaceVariant,
    'pressed-icon-color'        : Color.OnSurfaceVariant,
    'disabled-icon-color'       : Color.OnSurface,

    'enabled-outline-color'     : Color.OutlineVariant,
    'hovered-outline-color'     : Color.OutlineVariant,
    'focused-outline-color'     : Color.OnSurfaceVariant,
    'pressed-outline-color'     : Color.OutlineVariant,
    'disabled-outline-color'    : Color.OnSurface,

    'hovered-state-layer-color' : Color.OnSurfaceVariant,
    'focused-state-layer-color' : Color.OnSurfaceVariant,
    'pressed-state-layer-color' : Color.OnSurfaceVariant,
})

/** Suggestion Chip — MD3 SuggestionChipTokens / Widget.Material3.Chip.Suggestion */
export const SuggestionChipDefinition = createStyleDefinition({
    ...Shared,

    'enabled-container-color'   : `transparent`,
    'hovered-container-color'   : `transparent`,
    'focused-container-color'   : `transparent`,
    'pressed-container-color'   : `transparent`,
    'dragged-container-color'   : `transparent`,
    'disabled-container-color'  : `transparent`,

    'enabled-label-color'       : Color.OnSurfaceVariant,
    'hovered-label-color'       : Color.OnSurfaceVariant,
    'focused-label-color'       : Color.OnSurfaceVariant,
    'pressed-label-color'       : Color.OnSurfaceVariant,
    'disabled-label-color'      : Color.OnSurface,

    'enabled-icon-color'        : Color.Primary,
    'hovered-icon-color'        : Color.Primary,
    'focused-icon-color'        : Color.Primary,
    'pressed-icon-color'        : Color.Primary,
    'disabled-icon-color'       : Color.OnSurface,

    'enabled-outline-color'     : Color.OutlineVariant,
    'hovered-outline-color'     : Color.OutlineVariant,
    'focused-outline-color'     : Color.OnSurfaceVariant,
    'pressed-outline-color'     : Color.OutlineVariant,
    'disabled-outline-color'    : Color.OnSurface,

    'hovered-state-layer-color' : Color.OnSurfaceVariant,
    'focused-state-layer-color' : Color.OnSurfaceVariant,
    'pressed-state-layer-color' : Color.OnSurfaceVariant,
})

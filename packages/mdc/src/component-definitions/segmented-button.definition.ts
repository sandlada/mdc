/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

/**
 * Style definition for `mdc-segmented-button` — a single selectable segment.
 *
 * Follows the Material 3 *outlined segmented button* token set
 * (`md.comp.outlined-segmented-button`). Segments never paint an outline of
 * their own; the surrounding `mdc-segmented-button-set` owns the container
 * outline and corner radii (via `OutlinedSegmentedButtonSetDefinition`).
 *
 * @version
 * Material Design 3
 */
export const OutlinedSegmentedButtonDefinition = createStyleDefinition({
    // Label — `label-large`
    'label-text-font'       : Typescale.LabelLarge.Font,
    'label-text-line-height': Typescale.LabelLarge.LineHeight,
    'label-text-size'       : Typescale.LabelLarge.FontSize,
    'label-text-tracking'   : Typescale.LabelLarge.Tracking,
    'label-text-weight'     : Typescale.LabelLarge.FontWeight,

    // Spacing & icon
    'icon-size'       : `18px`,
    'spacing-leading' : `12px`,
    'spacing-trailing': `12px`,

    // Outline — each segment draws its own 1px border; adjacent segments'
    // borders overlap to form a single divider (see the style file).
    'outline-color': Color.Outline,
    'outline-width': `1px`,

    // Selected
    'selected-container-color'           : Color.SecondaryContainer,
    'selected-label-text-color'          : Color.OnSecondaryContainer,
    'selected-icon-color'                : Color.OnSecondaryContainer,
    /**
     * Icon color of an icon-only segment that shows a checkmark next to its
     * icon (selected, `without-label`). Distinct from `selected-icon-color`
     * for the same reason as the `selected-with-icon-icon-color` spec token.
     */
    'selected-with-icon-icon-color'      : Color.OnSecondaryContainer,
    'selected-hover-state-layer-color'   : Color.OnSecondaryContainer,
    'selected-focus-state-layer-color'   : Color.OnSecondaryContainer,
    'selected-pressed-state-layer-color' : Color.OnSecondaryContainer,
    'selected-hover-label-text-color'    : Color.OnSecondaryContainer,
    'selected-focus-label-text-color'    : Color.OnSecondaryContainer,
    'selected-pressed-label-text-color'  : Color.OnSecondaryContainer,
    'selected-hover-icon-color'          : Color.OnSecondaryContainer,
    'selected-focus-icon-color'          : Color.OnSecondaryContainer,
    'selected-pressed-icon-color'        : Color.OnSecondaryContainer,

    // Unselected
    'unselected-container-color'           : `transparent`,
    'unselected-label-text-color'          : Color.OnSurface,
    'unselected-icon-color'                : Color.OnSurface,
    'unselected-hover-state-layer-color'   : Color.OnSurface,
    'unselected-focus-state-layer-color'   : Color.OnSurface,
    'unselected-pressed-state-layer-color' : Color.OnSurface,
    'unselected-hover-label-text-color'    : Color.OnSurface,
    'unselected-focus-label-text-color'    : Color.OnSurface,
    'unselected-pressed-label-text-color'  : Color.OnSurface,
    'unselected-hover-icon-color'          : Color.OnSurface,
    'unselected-focus-icon-color'          : Color.OnSurface,
    'unselected-pressed-icon-color'        : Color.OnSurface,

    // State layers
    'hover-state-layer-opacity'  : State.HoveredStateLayerOpacity,
    'focus-state-layer-opacity'  : State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,

    // Disabled
    'disabled-label-text-color'  : Color.OnSurface,
    'disabled-label-text-opacity': `0.38`,
    'disabled-icon-color'        : Color.OnSurface,
    'disabled-icon-opacity'      : `0.38`,
    'disabled-outline-color'     : Color.OnSurface,
    'disabled-outline-opacity'   : `0.12`,
})

/**
 * Style definition for `mdc-segmented-button-set` — the container.
 *
 * The set paints the 1px outline around the whole group and applies the
 * container corner radii to its first / last segment, so the outline appears
 * to wrap the group while adjacent segments share a single 1px divider.
 *
 * @version
 * Material Design 3
 */
export const OutlinedSegmentedButtonSetDefinition = createStyleDefinition({
    'container-height'  : `40px`,
    'shape-start-start' : Shape.Full,
    'shape-start-end'   : Shape.Full,
    'shape-end-start'   : Shape.Full,
    'shape-end-end'     : Shape.Full,
})

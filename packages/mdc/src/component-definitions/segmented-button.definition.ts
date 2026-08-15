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
    'label-font'              : Typescale.LabelLarge.Font,
    'label-line-height'       : Typescale.LabelLarge.LineHeight,
    'label-size'              : Typescale.LabelLarge.FontSize,
    'label-tracking'          : Typescale.LabelLarge.Tracking,
    'label-weight'            : Typescale.LabelLarge.FontWeight,

    // Spacing & icon
    'icon-size'               : `18px`,
    'spacing-leading'         : `12px`,
    'spacing-trailing'        : `12px`,

    // Outline — each segment draws its own 1px border; adjacent segments'
    // borders overlap to form a single divider (see the style file).
    'enabled-outline-color'   : Color.Outline,
    'outline-width'           : `1px`,

    // Selected
    'enabled-container-color-selected'              : Color.SecondaryContainer,
    'enabled-label-color-selected'                  : Color.OnSecondaryContainer,
    'enabled-icon-color-selected'                   : Color.OnSecondaryContainer,
    /**
     * Icon color of an icon-only segment that shows a checkmark next to its
     * icon (selected, `without-label`). Distinct from `enabled-icon-color-selected`
     * for the same reason as the `selected-with-icon-icon-color` spec token.
     */
    'enabled-with-icon-icon-color-selected'         : Color.OnSecondaryContainer,
    'hovered-state-layer-color-selected'            : Color.OnSecondaryContainer,
    'focused-state-layer-color-selected'            : Color.OnSecondaryContainer,
    'pressed-state-layer-color-selected'            : Color.OnSecondaryContainer,
    'hovered-label-color-selected'                  : Color.OnSecondaryContainer,
    'focused-label-color-selected'                  : Color.OnSecondaryContainer,
    'pressed-label-color-selected'                  : Color.OnSecondaryContainer,
    'hovered-icon-color-selected'                   : Color.OnSecondaryContainer,
    'focused-icon-color-selected'                   : Color.OnSecondaryContainer,
    'pressed-icon-color-selected'                   : Color.OnSecondaryContainer,

    // Unselected
    'enabled-container-color-unselected'            : `transparent`,
    'enabled-label-color-unselected'                : Color.OnSurface,
    'enabled-icon-color-unselected'                 : Color.OnSurface,
    'hovered-state-layer-color-unselected'          : Color.OnSurface,
    'focused-state-layer-color-unselected'          : Color.OnSurface,
    'pressed-state-layer-color-unselected'          : Color.OnSurface,
    'hovered-label-color-unselected'                : Color.OnSurface,
    'focused-label-color-unselected'                : Color.OnSurface,
    'pressed-label-color-unselected'                : Color.OnSurface,
    'hovered-icon-color-unselected'                 : Color.OnSurface,
    'focused-icon-color-unselected'                 : Color.OnSurface,
    'pressed-icon-color-unselected'                 : Color.OnSurface,

    // State layers
    'hovered-state-layer-opacity'                   : State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity'                   : State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity'                   : State.PressedStateLayerOpacity,

    // Disabled
    'disabled-label-color'                          : Color.OnSurface,
    'disabled-label-opacity'                        : `0.38`,
    'disabled-icon-color'                           : Color.OnSurface,
    'disabled-icon-opacity'                         : `0.38`,
    'disabled-outline-color'                        : Color.OnSurface,
    'disabled-outline-opacity'                      : `0.12`,
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

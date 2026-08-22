/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape } from '@sandlada/mdk'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

/**
 * Style definition for `mdc-button-group` — standard variant.
 *
 * In standard button groups, buttons are grouped with padding between buttons
 * that scales at smaller sizes to guarantee a minimum accessible touch target of 48dp:
 * - XS: 18dp (18px)
 * - S: 12dp (12px)
 * - M: 8dp (8px)
 * - L: 8dp (8px)
 * - XL: 8dp (8px)
 *
 * @version
 * Material Design 3 Expressive
 *
 * @link
 * https://m3.material.io/components/button-groups/specs
 */
export const StandardButtonGroupDefinition = createStyleDefinition({
    'enabled-space-between': `8px`,

    'enabled-extra-small-space-between': `18px`,
    'enabled-small-space-between'      : `12px`,
    'enabled-medium-space-between'     : `8px`,
    'enabled-large-space-between'      : `8px`,
    'enabled-extra-large-space-between': `8px`,
})

/**
 * Style definition for `mdc-button-group` — connected variant.
 *
 * In connected button groups, 2dp (2px) inner padding is used at every size.
 * Outer shapes are fully round (or square corner radius), and inner shapes
 * use specific corner radii:
 * - XS: 4dp (4px)
 * - S: 8dp (8px)
 * - M: 8dp (8px)
 * - L: 16dp (16px)
 * - XL: 20dp (20px)
 *
 * Extra small and small buttons have a minimum width of 48dp (48px).
 *
 * @version
 * Material Design 3 Expressive
 *
 * @link
 * https://m3.material.io/components/button-groups/specs
 */
export const ConnectedButtonGroupDefinition = createStyleDefinition({
    'enabled-space-between': `2px`,

    'enabled-extra-small-space-between': `2px`,
    'enabled-small-space-between'      : `2px`,
    'enabled-medium-space-between'     : `2px`,
    'enabled-large-space-between'      : `2px`,
    'enabled-extra-large-space-between': `2px`,

    // Minimum widths for accessible touch target
    'enabled-extra-small-min-width': `48px`,
    'enabled-small-min-width'      : `48px`,

    // Inner corner shapes — squared with size-scaled rounding (the "inner" of the connected group)
    'enabled-extra-small-inner-shape': `4px`,
    'enabled-small-inner-shape'      : `8px`,
    'enabled-medium-inner-shape'     : `8px`,
    'enabled-large-inner-shape'      : `16px`,
    'enabled-extra-large-inner-shape': `20px`,

    // Outer corner shape — round: fully pill on all sizes
    'enabled-extra-small-outer-shape-round': Shape.Full,
    'enabled-small-outer-shape-round'      : Shape.Full,
    'enabled-medium-outer-shape-round'     : Shape.Full,
    'enabled-large-outer-shape-round'      : Shape.Full,
    'enabled-extra-large-outer-shape-round': Shape.Full,

    // Outer corner shape — square: size-scaled corner radius
    'enabled-extra-small-outer-shape-square': `4px`,
    'enabled-small-outer-shape-square'      : `8px`,
    'enabled-medium-outer-shape-square'     : `8px`,
    'enabled-large-outer-shape-square'      : `16px`,
    'enabled-extra-large-outer-shape-square': `20px`,
})

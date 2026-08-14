/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape, Space } from '@sandlada/mdk'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

/**
 * Style definition for `mdc-carousel` — the horizontal carousel container and
 * its `mdc-carousel-item` cells.
 *
 * For a horizontal carousel the three item sizes differ only in width and
 * corner roundness, so the item shapes are the only per-size tokens. Widths
 * are derived at runtime from `preferred-item-width` (see `base-carousel.ts`)
 * and exposed as inheritable `--_item-width-*` custom properties.
 *
 * Roundness follows the MD3 shape scale: `large` uses the extra-large corner
 * (`28px`, matching the Material carousel's `shapeAppearanceExtraLarge`),
 * `medium` the large-increased corner (`20px`) and `small` the medium corner
 * (`12px`) — each still overridable through `--mdc-carousel-*-item-shape`.
 *
 * @version
 * Material Design 3
 */
export const CarouselDefinition = createStyleDefinition({
    // Item roundness — differs per size (per the horizontal-carousel contract
    // that sizes vary only in width and roundness).
    'item-shape-large' : Shape.ExtraLarge,
    'item-shape-medium': Shape.LargeIncreased,
    'item-shape-small' : Shape.Medium,

    // Spacing & container padding
    'item-spacing'     : Space.Space100,
    'leading-padding'  : Space.Space200,
    'trailing-padding' : Space.Space200,
    'top-padding'      : Space.Space100,
    'bottom-padding'   : Space.Space100,
})

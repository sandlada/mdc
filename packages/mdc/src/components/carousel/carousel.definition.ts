/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version
 * 1.0.0
 */
import { Shape, Space } from '@sandlada/mdk'
import { createStyleDefinition, defineSchema } from '@sandlada/styles/schema'
import { expandShape, expandPadding } from '@sandlada/styles/tokens'

/**
 * Carousel item-size schema:
 * - small / medium / large — the three `mdc-carousel-item` sizes.
 */
export const CarouselSchema = defineSchema([
    ['small', 'medium', 'large']
] as const)

/**
 * Style definition for `mdc-carousel` — the horizontal carousel container and
 * its `mdc-carousel-item` cells.
 *
 * For a horizontal carousel the three item sizes differ only in width and
 * corner roundness, so `item-width` / `item-shape` are the only per-size
 * tokens. Widths are derived at runtime from `preferred-item-width`
 * (see `internal/base-carousel.ts`) and published as
 * `--_computed-*-item-width` custom properties, which the definition chains
 * into the public `--mdc-carousel-*-item-width` override variables.
 *
 * Roundness follows the MD3 shape scale: `large` uses the extra-large corner
 * (`28px`, matching the Material carousel's `shapeAppearanceExtraLarge`),
 * `medium` the large-increased corner (`20px`) and `small` the medium corner
 * (`12px`) — each corner still overridable through
 * `--mdc-carousel-*-item-shape-*`.
 *
 * @version
 * Material Design 3
 */
export const CarouselDefinition = createStyleDefinition(CarouselSchema)({
    // Item width — the concrete value is computed at runtime (large targets
    // `preferred-item-width`, small ≈ ⅓ of it clamped to 40–56px, medium the
    // average); the definition only wires the public override chain.
    'item-width': {
        small: 'var(--_computed-small-item-width)',
        medium: 'var(--_computed-medium-item-width)',
        large: 'var(--_computed-large-item-width)',
    },

    // Item roundness — differs per size (per the horizontal-carousel contract
    // that sizes vary only in width and roundness).
    ...expandShape('item-shape')({
        small: Shape.Medium,
        medium: Shape.LargeIncreased,
        large: Shape.ExtraLarge,
    }),

    // Item geometry
    'item-spacing'                  : Space.Space100,
    'item-height'                   : 'auto',

    // Container padding
    ...expandPadding('container-padding')([Space.Space100, Space.Space200]),
})

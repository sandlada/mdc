/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version
 * 1.0.0
 */
import { Shape, Space, Typescale } from '@sandlada/mdk'
import { createStyleDefinition, expandPadding, expandShape, expandTypescale } from '../../utils/style'

/**
 * Style definition for `mdc-carousel` — the horizontal carousel container and
 * its `mdc-carousel-item` cells.
 *
 * Mirrors Material Design 3 / Jetpack Compose Carousel tokens:
 * - `large` items use `Shape.ExtraLarge` (28px), `medium` use
 *   `Shape.LargeIncreased` (20px), and `small` use `Shape.Medium` (12px).
 * - Item spacing defaults to `Space.Space100` (8px); container inline padding
 *   defaults to `Space.Space200` (16px) and block padding to `Space.Space100` (8px).
 *
 * @version
 * Material Design 3
 */
export const CarouselDefinition = createStyleDefinition({
    // Item width — computed at runtime by the keyline engine and chained
    // into the public `--mdc-carousel-*-item-width` override variables.
    'item-width': {
        small: 'var(--_computed-small-item-width)',
        medium: 'var(--_computed-medium-item-width)',
        large: 'var(--_computed-large-item-width)',
    },

    // Item roundness — per-size MD3 shape tokens.
    ...expandShape('item-shape')({
        small: Shape.Medium,
        medium: Shape.LargeIncreased,
        large: Shape.ExtraLarge,
    }),

    // Item geometry
    'item-spacing': Space.Space100,
    'item-height': 'auto',

    // Container padding
    ...expandPadding('container-padding')([Space.Space100, Space.Space200]),

    // Caption overlay (for `slot="caption"`)
    'caption-color': '#ffffff',
    'caption-scrim-color': 'rgba(0, 0, 0, 0.65)',
    ...expandPadding('caption-padding')([Space.Space200, Space.Space200]),
    ...expandTypescale('caption-text')(Typescale.TitleMedium),
})

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Public `mdc-carousel` element — a horizontal, scroll-snap carousel that
 * lays out its `mdc-carousel-item` children in large / medium / small widths.
 *
 * Mirrors the Jetpack Compose Material 3 carousel: in the default
 * `multi-browse` variant the row mixes all three sizes and snaps to a leading
 * keyline; `uncontained` uses a single fixed item width and scrolls freely.
 */
import { customElement } from 'lit/decorators.js'
import { BaseCarousel } from './internal/base-carousel'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-carousel': Carousel
    }
}

/**
 * @element mdc-carousel
 *
 * A horizontal carousel container that owns layout and focal tracking for its
 * `mdc-carousel-item` children. Item widths derive from `preferred-item-width`
 * (the large size; small ≈ ⅓ of large clamped to 40–56px, medium the average)
 * and are published as inheritable `--_item-width-*` / `--_item-shape-*`
 * custom properties, so the three sizes differ only in width and roundness.
 *
 * @slot — One or more `mdc-carousel-item` elements.
 *
 * @fires carousel-active-change {CustomEvent<{item: CarouselItem, index: number}>}
 *     Dispatched when the focal (leading) item changes, on scroll or via
 *     `scrollToItem()`. --bubbles --composed
 *
 * @cssproperty --mdc-carousel-large-item-width
 * @cssproperty --mdc-carousel-medium-item-width
 * @cssproperty --mdc-carousel-small-item-width
 * @cssproperty --mdc-carousel-large-item-shape
 * @cssproperty --mdc-carousel-medium-item-shape
 * @cssproperty --mdc-carousel-small-item-shape
 * @cssproperty --mdc-carousel-item-spacing
 * @cssproperty --mdc-carousel-leading-padding
 * @cssproperty --mdc-carousel-trailing-padding
 * @cssproperty --mdc-carousel-top-padding
 * @cssproperty --mdc-carousel-bottom-padding
 * @cssproperty --mdc-carousel-item-height
 */
@customElement('mdc-carousel')
export class Carousel extends BaseCarousel {
    static override styles = BaseCarousel.styles
}

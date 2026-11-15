/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Public `mdc-carousel` element — Material Design 3 horizontal, keyline-morphing
 * scroll-snap carousel.
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
 * A Material Design 3 horizontal carousel container that dynamically morphs
 * `mdc-carousel-item` widths and corner roundness across keylines as the user
 * scrolls. Supports `multi-browse`, `hero`, `centered-hero`, `uncontained`,
 * and `full-screen` variants.
 *
 * @slot — One or more `mdc-carousel-item` elements.
 *
 * @fires carousel-active-change {CustomEvent<{item: CarouselItem, index: number}>}
 *     Dispatched when the focal item changes, on scroll or via `scrollToItem()`.
 */
@customElement('mdc-carousel')
export class Carousel extends BaseCarousel {
    static override styles = BaseCarousel.styles
}

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/** Visual variants of `mdc-carousel`. */
export type CarouselVariant = 'multi-browse' | 'uncontained'
/** The three item sizes supported by `mdc-carousel-item`. */
export type CarouselItemSize = 'small' | 'medium' | 'large'

/**
 * `mdc-carousel-item` — a single cell of an `mdc-carousel`.
 *
 * The item declares its visual size (`small` / `medium` / `large`); for a
 * horizontal carousel the sizes differ only in width and corner roundness,
 * while every item shares the same height (stretched to the tallest cell).
 * The owning carousel derives the concrete widths from its
 * `preferred-item-width` and assigns `index` / `active`, so an item is only
 * meaningful as a direct child of an `mdc-carousel`.
 *
 * Mirrors the item-size model of the Jetpack Compose Material 3 carousel,
 * where the large item targets a preferred width, the small item clamps to
 * roughly a third of it (40–56px), and the medium item is their average.
 */
export interface ICarouselItem extends LitElement {
    /** Visual size: `'large'` | `'medium'` (default) | `'small'`. */
    size: CarouselItemSize
    /** Set by the carousel when this item is the focal (leading) item. */
    active: boolean
    /** Position of this item within its owning carousel, set by the carousel. */
    index: number
}

/**
 * `mdc-carousel` — a horizontal, scroll-snap carousel container.
 *
 * Lays out its `mdc-carousel-item` children in a single scrollable row. In
 * the `multi-browse` variant (default) the row mixes large / medium / small
 * items that snap to the leading keyline and clip at the container edge; in
 * the `uncontained` variant all items share one fixed width and the row
 * scrolls freely, with a partially visible trailing item peeking at the edge.
 *
 * Item widths are derived from `preferred-item-width` using the Jetpack
 * Compose Material 3 formulas and are exposed as inheritable CSS custom
 * properties (`--_item-width-*` / `--_item-shape-*`), so every `size` value
 * differs only in width and roundness while sharing one height.
 *
 * @slot — One or more `mdc-carousel-item` elements.
 *
 * @fires carousel-active-change — Dispatched when the focal (leading) item
 *     changes, on scroll or via `scrollToItem()`.
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
export interface ICarousel extends LitElement {
    /** Visual variant: `'multi-browse'` (default) | `'uncontained'`. */
    variant: CarouselVariant
    /** Target width of the `large` items in px; small / medium derive from it. */
    preferredItemWidth: number
    /** Index of the current focal (leading) item. */
    readonly activeIndex: number
    /** Scrolls the item at `index` to the leading keyline. */
    scrollToItem(index: number): void
}

/**
 * `detail` payload of the `carousel-active-change` event.
 */
export interface ICarouselActiveChangeDetail {
    item: ICarouselItem
    index: number
}

/** Name of the event the carousel dispatches when the focal item changes. */
export const CAROUSEL_ACTIVE_CHANGE_EVENT = 'carousel-active-change'

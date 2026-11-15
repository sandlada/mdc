/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/** Visual layout variants of `mdc-carousel`, mirroring Material Design 3 / Jetpack Compose. */
export const CarouselVariant = {
    MultiBrowse: 'multi-browse',
    Hero: 'hero',
    CenteredHero: 'centered-hero',
    Uncontained: 'uncontained',
    FullScreen: 'full-screen',
} as const
export type CarouselVariant = (typeof CarouselVariant)[keyof typeof CarouselVariant]

/** The three semantic item sizes reported by `mdc-carousel-item`. */
export const CarouselItemSize = {
    Small: 'small',
    Medium: 'medium',
    Large: 'large',
} as const
export type CarouselItemSize = (typeof CarouselItemSize)[keyof typeof CarouselItemSize]

/** Name of the event the carousel dispatches when the focal item changes. */
export const CarouselActiveChangeEvent = 'carousel-active-change'

/**
 * `detail` payload of the `carousel-active-change` event.
 */
export interface ICarouselActiveChangeDetail {
    item: IMDCCarouselItem
    index: number
}

/** Input attributes for `mdc-carousel-item`. */
export interface IMDCCarouselItemAttributes {
    /** Visual size dynamically updated by the owning carousel: `'large'` | `'medium'` | `'small'`. */
    size: CarouselItemSize
    /** Set by the carousel when this item is the focal item. */
    active: boolean
    /** Position of this item within its owning carousel, set by the carousel. */
    index: number
}

/**
 * `mdc-carousel-item` — a single cell of an `mdc-carousel`.
 */
export interface IMDCCarouselItem extends LitElement, IMDCCarouselItemAttributes {}

/** Input attributes for `mdc-carousel`. */
export interface IMDCCarouselAttributes {
    /** Visual variant: `'multi-browse'` (default) | `'hero'` | `'centered-hero'` | `'uncontained'` | `'full-screen'`. */
    variant: CarouselVariant
    /** Target width of the `large` items in px; small / medium derive from it. */
    preferredItemWidth: number
    /** Minimum width of `small` items in px (Compose M3 `minSmallItemWidth`, default 40). */
    minSmallItemWidth: number
    /** Maximum width of `small` items in px (Compose M3 `maxSmallItemWidth`, default 56). */
    maxSmallItemWidth: number
}

/** Custom events emitted by `mdc-carousel`. */
export interface IMDCCarouselEvents {
    'carousel-active-change': CustomEvent<ICarouselActiveChangeDetail>
}

/**
 * `mdc-carousel` — a Material Design 3 horizontal, keyline-morphing scroll-snap carousel.
 *
 * @slot — One or more `mdc-carousel-item` elements.
 *
 * @fires carousel-active-change — Dispatched when the focal item changes, on scroll or via `scrollToItem()`.
 */
export interface IMDCCarousel extends LitElement, IMDCCarouselAttributes {
    /** Index of the current focal item, or `-1` when empty. */
    readonly activeIndex: number
    /** Scrolls the item at `index` to its focal keyline. */
    scrollToItem(index: number): void
}

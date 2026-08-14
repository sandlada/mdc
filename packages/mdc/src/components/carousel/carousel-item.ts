/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Public `mdc-carousel-item` element — a sized cell of an `mdc-carousel`.
 *
 * The item declares its visual size; the owning carousel assigns its index and
 * focal `active` state and derives the concrete width / roundness from its
 * `preferred-item-width`, so an item is only meaningful as a direct child.
 */
import { html, LitElement, type TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { CarouselItemSize, ICarouselItem } from './carousel.interface'
import { CarouselItemStyles } from './carousel-item.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-carousel-item': CarouselItem
    }
}

/**
 * @element mdc-carousel-item
 *
 * A single cell of an `mdc-carousel`. Declare one of the three sizes; the
 * owning carousel sizes the cell (width + roundness) and tracks it as the
 * focal item (`active`) as the carousel scrolls.
 *
 * @slot — The cell content (image, card, label, …).
 *
 * @cssproperty --mdc-carousel-large-item-width
 * @cssproperty --mdc-carousel-medium-item-width
 * @cssproperty --mdc-carousel-small-item-width
 * @cssproperty --mdc-carousel-large-item-shape
 * @cssproperty --mdc-carousel-medium-item-shape
 * @cssproperty --mdc-carousel-small-item-shape
 * @cssproperty --mdc-carousel-item-height
 */
@customElement('mdc-carousel-item')
export class CarouselItem extends LitElement implements ICarouselItem {

    static override styles = CarouselItemStyles

    /** Visual size: `'large'` | `'medium'` (default) | `'small'`. */
    @property({ type: String, reflect: true })
    public size: CarouselItemSize = 'medium'

    /** Set by the owning carousel when this item is the focal (leading) item. */
    @property({ type: Boolean, reflect: true })
    public active = false

    /** Position of this item within its owning carousel, set by the carousel. */
    @property({ type: Number, reflect: true })
    public index = 0

    protected override render(): TemplateResult {
        return html`<slot></slot>`
    }
}

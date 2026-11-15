/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Public `mdc-carousel-item` element — a morphing cell of an `mdc-carousel`.
 */
import { html, LitElement, nothing, type TemplateResult } from 'lit'
import { customElement, property, queryAssignedNodes, state } from 'lit/decorators.js'
import { CarouselItemSize, type IMDCCarouselItem } from './carousel.interface'
import { CarouselItemStyles } from './carousel-item.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-carousel-item': CarouselItem
    }
}

/**
 * @element mdc-carousel-item
 *
 * A single cell of an `mdc-carousel`. Its width, corner roundness, and
 * `--mdc-carousel-item-ratio` are driven dynamically by the owning carousel's
 * keyline engine as the user scrolls.
 *
 * @slot — The cell content (image, card, custom content).
 * @slot caption — Optional bottom overlay caption with automatic scrim and
 *     opacity fade when the item shrinks.
 */
@customElement('mdc-carousel-item')
export class CarouselItem extends LitElement implements IMDCCarouselItem {

    static override styles = CarouselItemStyles

    /** Visual size dynamically updated by the owning carousel: `'large'` | `'medium'` | `'small'`. */
    @property({ type: String, reflect: true })
    public size: CarouselItemSize = CarouselItemSize.Medium

    /** Set by the owning carousel when this item is the focal item. */
    @property({ type: Boolean, reflect: true })
    public active = false

    /** Position of this item within its owning carousel, set by the carousel. */
    @property({ type: Number, reflect: true })
    public index = 0

    @state()
    private hasCaption = false

    @queryAssignedNodes({ slot: 'caption', flatten: true })
    private readonly captionNodes!: Node[]

    protected override render(): TemplateResult {
        return html`
            <div class="content" part="content">
                <slot></slot>
                <div class="caption" part="caption" ?hidden=${!this.hasCaption}>
                    <slot name="caption" @slotchange=${this.handleCaptionSlotChange}></slot>
                </div>
            </div>
        `
    }

    private readonly handleCaptionSlotChange = (): void => {
        this.hasCaption = this.captionNodes.some(
            (node) => node.nodeType === Node.ELEMENT_NODE || (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()),
        )
    }
}

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-carousel` — the horizontal scroll-snap
 * container that owns layout and focal tracking for its `mdc-carousel-item`
 * children.
 *
 * Item widths follow the Jetpack Compose Material 3 carousel formulas:
 * the large item targets `preferred-item-width`, the small item clamps to
 * roughly a third of it (40–56px, `CarouselDefaults.Min/MaxSmallItemSize`)
 * and the medium item is their average. Sizes are recomputed on container
 * resize and published as `--_carousel-computed-*` custom properties that the
 * items consume via `--_item-width-*`.
 *
 * The focal item is the cell resting at the leading keyline (inline-start
 * padding position); it is tracked across scroll and surfaced through the
 * `carousel-active-change` event and the reflected `active` attribute.
 */
import { html, isServer, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { property, queryAssignedElements } from 'lit/decorators.js'
import {
    CAROUSEL_ACTIVE_CHANGE_EVENT,
    type CarouselVariant,
    type ICarousel,
    type ICarouselActiveChangeDetail,
} from '../carousel.interface'
import type { CarouselItem } from '../carousel-item'
import { CarouselStyles } from '../carousel.style'

/** Only `mdc-carousel-item` children take part in the carousel layout. */
const ITEM_SELECTOR = 'mdc-carousel-item'

/** Small-item width clamp, from Compose M3 `CarouselDefaults`. */
const MIN_SMALL_ITEM_SIZE = 40
const MAX_SMALL_ITEM_SIZE = 56

export abstract class BaseCarousel extends LitElement implements ICarousel {

    static override styles = CarouselStyles

    /**
     * Visual variant. `multi-browse` (default) mixes large / medium / small
     * items that snap to the leading keyline; `uncontained` keeps a single
     * fixed item width and scrolls freely.
     */
    @property({ type: String, reflect: true })
    public variant: CarouselVariant = 'multi-browse'

    /** Target width of the `large` items in px; small / medium derive from it. */
    @property({ type: Number, reflect: true, attribute: 'preferred-item-width' })
    public preferredItemWidth = 186

    @queryAssignedElements({ selector: ITEM_SELECTOR, flatten: true })
    private readonly assignedItems!: CarouselItem[]

    private items: CarouselItem[] = []
    private resizeObserver: ResizeObserver | null = null
    private scrollRafId: number | null = null
    private activeIndexValue = -1

    /** Index of the current focal (leading) item, or `-1` when empty. */
    public get activeIndex(): number {
        return this.activeIndexValue
    }

    public constructor() {
        super()
        if (isServer) return
        if (!this.getAttribute('role')) this.setAttribute('role', 'group')
        if (!this.getAttribute('aria-label')) this.setAttribute('aria-label', 'Carousel')
        if (!this.getAttribute('tabindex')) this.setAttribute('tabindex', '0')
        this.addEventListener('scroll', this.handleScroll, { passive: true })
        this.addEventListener('keydown', this.handleKeydown)
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        if (isServer) return
        this.resizeObserver = new ResizeObserver(() => this.computeSizes())
        this.resizeObserver.observe(this)
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        this.resizeObserver?.disconnect()
        this.resizeObserver = null
    }

    /**
     * Scrolls the item at `index` so its start edge rests on the leading
     * keyline. Resolves when the smooth scroll has been requested.
     */
    public scrollToItem(index: number): void {
        const item = this.items[index]
        if (!item) return
        // `scrollIntoView` honors the container's scroll-padding, so the item
        // rests exactly on the leading keyline (and mirrors correctly in RTL).
        item.scrollIntoView({ block: 'nearest', inline: 'start', behavior: 'smooth' })
    }

    protected override render(): TemplateResult {
        return html`
            <slot @slotchange=${this.handleSlotChange}></slot>
        `
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (changedProperties.has('preferredItemWidth')) {
            this.computeSizes()
        }
    }

    // ── private ───────────────────────────────────────────────────────────────

    /**
     * Derives the large / medium / small item widths from
     * `preferred-item-width` and the current container width, then publishes
     * them as `--_carousel-computed-*` for the slotted items.
     */
    private computeSizes(): void {
        const containerWidth = this.clientWidth
        if (containerWidth === 0) return
        const large = Math.min(this.preferredItemWidth, containerWidth)
        const small = Math.min(
            MAX_SMALL_ITEM_SIZE,
            Math.max(MIN_SMALL_ITEM_SIZE, Math.round(large / 3)),
        )
        const medium = Math.round((large + small) / 2)
        this.style.setProperty('--_carousel-computed-large', `${large}px`)
        this.style.setProperty('--_carousel-computed-medium', `${medium}px`)
        this.style.setProperty('--_carousel-computed-small', `${small}px`)
        this.updateActiveItem()
    }

    private readonly handleSlotChange = (): void => {
        this.items = this.assignedItems
        if (!this.items.length) {
            this.activeIndexValue = -1
            return
        }
        for (const [index, item] of this.items.entries()) {
            item.index = index
        }
        this.computeSizes()
    }

    private readonly handleScroll = (): void => {
        // Coalesce per animation frame — the native snap may fire a burst of
        // scroll events as it settles.
        if (this.scrollRafId !== null) return
        this.scrollRafId = requestAnimationFrame(() => {
            this.scrollRafId = null
            this.updateActiveItem()
        })
    }

    /**
     * Finds the cell whose start edge is nearest the leading keyline and, if
     * it differs from the current focal item, commits it as active and
     * dispatches `carousel-active-change`.
     */
    private updateActiveItem(): void {
        const { items } = this
        if (!items.length) {
            return
        }
        const isRtl = this.matches(':dir(rtl)') || getComputedStyle(this).direction === 'rtl'
        const keylineX = isRtl
            ? this.getBoundingClientRect().right - this.leadingPadding
            : this.getBoundingClientRect().left + this.leadingPadding

        let nearestIndex = 0
        let nearestDistance = Infinity
        for (const [index, item] of items.entries()) {
            const rect = item.getBoundingClientRect()
            const distance = isRtl
                ? Math.abs(rect.right - keylineX)
                : Math.abs(rect.left - keylineX)
            if (distance < nearestDistance) {
                nearestDistance = distance
                nearestIndex = index
            }
        }

        if (nearestIndex === this.activeIndexValue) {
            return
        }
        this.activeIndexValue = nearestIndex
        const activeItem = items[nearestIndex]
        for (const [index, item] of items.entries()) {
            item.active = index === nearestIndex
        }
        this.dispatchEvent(new CustomEvent<ICarouselActiveChangeDetail>(
            CAROUSEL_ACTIVE_CHANGE_EVENT,
            { detail: { item: activeItem, index: nearestIndex }, bubbles: true, composed: true },
        ))
    }

    private readonly handleKeydown = (event: KeyboardEvent): void => {
        if (event.defaultPrevented) {
            return
        }
        const { key } = event
        if (key === 'ArrowLeft' || key === 'ArrowRight') {
            event.preventDefault()
            const dir = key === 'ArrowLeft' ? -1 : 1
            const next = this.activeIndexValue + dir
            if (next >= 0 && next < this.items.length) {
                this.scrollToItem(next)
            }
        } else if (key === 'Home' || key === 'End') {
            event.preventDefault()
            this.scrollToItem(key === 'Home' ? 0 : this.items.length - 1)
        }
    }

    /** Resolved inline-start padding, used as the leading keyline offset. */
    private get leadingPadding(): number {
        return parseFloat(getComputedStyle(this).getPropertyValue('--_leading-padding')) || 16
    }
}

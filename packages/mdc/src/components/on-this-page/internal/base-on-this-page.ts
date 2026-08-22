/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-on-this-page` — an in-page table of contents / anchor navigation.
 *
 * Automatically tracks page scroll position, highlights the active section in view,
 * and renders a smoothly animated outline pill indicator that matches the active item's exact bounds.
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, queryAssignedElements, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { mixinElementInternals } from '../../../utils/behaviors/element-internals'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import type { IOnThisPage, OnThisPageChangeEventDetail, OnThisPageIndicatorFit } from '../on-this-page.interface'
import { BaseOnThisPageItem } from './base-on-this-page-item'

const ITEM_SELECTOR = 'mdc-on-this-page-item, [mdc-on-this-page-item]'

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export abstract class BaseOnThisPage extends composeMixin(
    mixinDelegatesAria,
    mixinElementInternals
)(LitElement) implements IOnThisPage {

    /** Subtitle/caption above the page title, e.g. "On this page". */
    @property({ type: String })
    public caption: string = 'On this page'

    /** Main headline/title, e.g. "Navigation rail". */
    @property({ type: String })
    public headline: string = ''

    /** Active item href anchor. */
    @property({ type: String, reflect: true, attribute: 'active-href' })
    public activeHref: string = ''

    /** Active item index. */
    @property({ type: Number, reflect: true, attribute: 'active-index' })
    public activeIndex: number = 0

    /** Target scroll container selector or element (defaults to window). */
    @property({ attribute: 'scroll-target' })
    public scrollTarget: string | HTMLElement | Window = 'window'

    /** Offset in pixels from top of viewport/container for reading line and scroll snapping. */
    @property({ type: Number, attribute: 'scroll-offset' })
    public scrollOffset: number = 96

    /** Whether to update the URL hash on item click. */
    @property({ type: Boolean, attribute: 'update-hash' })
    public updateHash: boolean = true

    /** Container selector for auto-discovering headings on the page. */
    @property({ type: String, attribute: 'content-selector' })
    public contentSelector: string = ''

    /** Whether to auto-discover headings if no items are slotted. */
    @property({ type: Boolean, attribute: 'auto-discover' })
    public autoDiscover: boolean = false

    /** Whether the active indicator border wraps the text content or stretches to full container width. */
    @property({ type: String, reflect: true, attribute: 'indicator-fit' })
    public indicatorFit: OnThisPageIndicatorFit = 'content'

    @query('.items')
    protected readonly itemsContainerElement!: HTMLElement | null

    @query('.indicator')
    protected readonly indicatorElement!: HTMLElement | null

    @queryAssignedElements({ selector: ITEM_SELECTOR, flatten: true })
    private readonly assignedItems!: BaseOnThisPageItem[]

    @state()
    private discoveredItems: Array<{ id: string; label: string; level: number }> = []

    private items: BaseOnThisPageItem[] = []
    private resizeObserver: ResizeObserver | null = null
    private isManualScrolling: boolean = false
    private manualScrollTimeout: number | null = null
    private rafId: number | null = null

    public constructor() {
        super()
        if (isServer) return
        this.addEventListener('keydown', this.handleKeyDown)
        this.addEventListener('mdc-on-this-page-item-click', this.handleItemClick as EventListener)
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        if (isServer) return

        this.setupScrollListener()
        this.setupResizeObserver()

        if (this.autoDiscover || this.contentSelector) {
            this.discoverHeadings()
        }

        // Defer initial layout & indicator alignment
        requestAnimationFrame(() => {
            this.syncItems()
            this.handleScroll()
            void this.updateIndicatorPosition(false)
        })
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        this.cleanupScrollListener()
        if (this.resizeObserver) {
            this.resizeObserver.disconnect()
            this.resizeObserver = null
        }
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId)
            this.rafId = null
        }
        if (this.manualScrollTimeout !== null) {
            window.clearTimeout(this.manualScrollTimeout)
            this.manualScrollTimeout = null
        }
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)

        if (changedProperties.has('scrollTarget')) {
            this.cleanupScrollListener()
            this.setupScrollListener()
        }

        if (changedProperties.has('contentSelector') || changedProperties.has('autoDiscover')) {
            if (this.autoDiscover || this.contentSelector) {
                this.discoverHeadings()
            }
        }

        if (changedProperties.has('activeIndex') || changedProperties.has('indicatorFit')) {
            this.applyActiveState(this.activeIndex, false)
            void this.updateIndicatorPosition(true)
        }
    }

    protected getRenderClasses() {
        return {
            'container': true,
            [`fit-${this.indicatorFit}`]: true,
        }
    }

    protected override render(): TemplateResult {
        return html`
            <nav
                class="${classMap(this.getRenderClasses())}"
                role="navigation"
                aria-label=${this.caption || 'On this page'}
            >
                <header class="header">
                    <slot name="caption">
                        ${this.caption ? html`<span class="caption" part="caption">${this.caption}</span>` : nothing}
                    </slot>
                    <slot name="headline">
                        ${this.headline ? html`<h2 class="headline" part="headline">${this.headline}</h2>` : nothing}
                    </slot>
                </header>
                <div class="items" role="list">
                    <div class="indicator" aria-hidden="true" part="indicator"></div>
                    <slot @slotchange=${this.handleSlotChange}>
                        ${this.discoveredItems.map(
                            (item, index) => html`
                                <mdc-on-this-page-item
                                    href="#${item.id}"
                                    .label=${item.label}
                                    .level=${item.level}
                                    .index=${index}
                                    .active=${index === this.activeIndex}
                                >
                                    ${item.label}
                                </mdc-on-this-page-item>
                            `
                        )}
                    </slot>
                </div>
            </nav>
        `
    }

    /** Returns current active item. */
    public get activeItem(): BaseOnThisPageItem | null {
        return this.items[this.activeIndex] ?? null
    }

    /** Sets the active section by item index. */
    public setActiveIndex(index: number, userInitiated = false): void {
        if (index < 0 || index >= this.items.length) return
        this.activateItem(this.items[index], userInitiated)
    }

    /** Sets the active section by href / anchor id. */
    public setActiveHref(href: string, userInitiated = false): void {
        const cleanHref = href.startsWith('#') ? href.slice(1) : href
        const targetItem = this.items.find(
            (item) => item.targetId === cleanHref || item.href === href || item.href === `#${cleanHref}`
        )
        if (targetItem) {
            this.activateItem(targetItem, userInitiated)
        }
    }

    /** Recalculates and updates the indicator position & dimensions to match the active element 1:1. */
    public async updateIndicatorPosition(animate = true): Promise<void> {
        if (!this.indicatorElement || !this.itemsContainerElement) return

        const activeItem = this.activeItem
        if (!activeItem || this.items.length === 0) {
            this.indicatorElement.style.opacity = '0'
            return
        }

        // Wait for active item DOM update to stabilize dimensions
        await activeItem.updateComplete

        const containerRect = this.itemsContainerElement.getBoundingClientRect()
        const itemRect = activeItem.getItemBounds()

        if (!itemRect || itemRect.width === 0 || itemRect.height === 0) {
            this.indicatorElement.style.opacity = '0'
            return
        }

        const left = itemRect.left - containerRect.left
        const top = itemRect.top - containerRect.top
        const width = itemRect.width
        const height = itemRect.height

        if (!animate) {
            this.indicatorElement.style.transition = 'none'
        } else {
            this.indicatorElement.style.removeProperty('transition')
        }

        this.indicatorElement.style.transform = `translate3d(${left.toFixed(2)}px, ${top.toFixed(2)}px, 0)`
        this.indicatorElement.style.width = `${width.toFixed(2)}px`
        this.indicatorElement.style.height = `${height.toFixed(2)}px`
        this.indicatorElement.style.opacity = '1'

        if (!animate) {
            requestAnimationFrame(() => {
                this.indicatorElement?.style.removeProperty('transition')
            })
        }
    }

    private readonly handleSlotChange = (): void => {
        this.syncItems()
        void this.updateIndicatorPosition(false)
    }

    private syncItems(): void {
        const slotted = this.assignedItems
        if (slotted.length > 0) {
            this.items = slotted
        } else {
            // Query internal rendered elements if auto-discovered
            const internal = Array.from(
                this.renderRoot.querySelectorAll<BaseOnThisPageItem>(ITEM_SELECTOR)
            )
            this.items = internal
        }

        for (const [index, item] of this.items.entries()) {
            item.index = index
            item.active = index === this.activeIndex
            if (this.resizeObserver) {
                this.resizeObserver.observe(item)
            }
        }

        if (this.activeHref && this.items.length > 0) {
            const matchIndex = this.items.findIndex(
                (i) => i.href === this.activeHref || i.targetId === this.activeHref.replace(/^#/, '')
            )
            if (matchIndex !== -1) {
                this.activeIndex = matchIndex
                this.applyActiveState(matchIndex, false)
            }
        }
    }

    private applyActiveState(newIndex: number, userInitiated: boolean): void {
        for (const [index, item] of this.items.entries()) {
            item.active = index === newIndex
        }
        const activeItem = this.items[newIndex] ?? null
        if (activeItem) {
            this.activeHref = activeItem.href
        }

        this.dispatchEvent(
            new CustomEvent<OnThisPageChangeEventDetail>('change', {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: {
                    item: activeItem,
                    index: newIndex,
                    href: activeItem?.href ?? '',
                    target: activeItem?.targetId ?? '',
                    userInitiated,
                },
            })
        )
    }

    private activateItem(item: BaseOnThisPageItem, userInitiated: boolean): void {
        const index = item.index
        if (index === this.activeIndex && item.active) return

        this.activeIndex = index
        this.activeHref = item.href
        this.applyActiveState(index, userInitiated)
        void this.updateIndicatorPosition(true)
    }

    private readonly handleItemClick = (event: CustomEvent<{ item: BaseOnThisPageItem }>): void => {
        const item = event.detail.item
        if (!item || item.disabled) return

        event.preventDefault()
        this.scrollToTarget(item)
        this.activateItem(item, true)

        if (this.updateHash && item.href) {
            const hash = item.href.startsWith('#') ? item.href : `#${item.href}`
            if (window.location.hash !== hash) {
                history.pushState(null, '', hash)
            }
        }
    }

    private scrollToTarget(item: BaseOnThisPageItem): void {
        const targetId = item.targetId
        if (!targetId) return

        const targetElement = document.getElementById(targetId) || document.querySelector(`[name="${CSS.escape(targetId)}"]`)
        if (!targetElement) return

        const scrollContainer = this.getScrollContainer()
        this.isManualScrolling = true

        if (this.manualScrollTimeout !== null) {
            window.clearTimeout(this.manualScrollTimeout)
        }
        this.manualScrollTimeout = window.setTimeout(() => {
            this.isManualScrolling = false
            this.handleScroll()
        }, 750)

        if (scrollContainer === window) {
            const rect = targetElement.getBoundingClientRect()
            const scrollTop = window.scrollY || window.pageYOffset
            const targetY = scrollTop + rect.top - this.scrollOffset
            window.scrollTo({
                top: Math.max(0, targetY),
                behavior: 'smooth',
            })
        } else if (scrollContainer instanceof HTMLElement) {
            const containerRect = scrollContainer.getBoundingClientRect()
            const elemRect = targetElement.getBoundingClientRect()
            const targetY = scrollContainer.scrollTop + (elemRect.top - containerRect.top) - this.scrollOffset
            scrollContainer.scrollTo({
                top: Math.max(0, targetY),
                behavior: 'smooth',
            })
        }
    }

    private getScrollContainer(): Window | HTMLElement {
        if (typeof this.scrollTarget === 'string') {
            if (this.scrollTarget === 'window') return window
            const el = document.querySelector<HTMLElement>(this.scrollTarget)
            return el || window
        }
        return this.scrollTarget || window
    }

    private setupScrollListener(): void {
        const container = this.getScrollContainer()
        container.addEventListener('scroll', this.onScrollThrottled, { passive: true })
    }

    private cleanupScrollListener(): void {
        const container = this.getScrollContainer()
        container.removeEventListener('scroll', this.onScrollThrottled)
    }

    private setupResizeObserver(): void {
        if (typeof ResizeObserver === 'undefined') return
        this.resizeObserver = new ResizeObserver(() => {
            void this.updateIndicatorPosition(false)
        })
        if (this.itemsContainerElement) {
            this.resizeObserver.observe(this.itemsContainerElement)
        }
        for (const item of this.items) {
            this.resizeObserver.observe(item)
        }
        this.resizeObserver.observe(this)
    }

    private readonly onScrollThrottled = (): void => {
        if (this.rafId !== null) return
        this.rafId = requestAnimationFrame(() => {
            this.rafId = null
            this.handleScroll()
        })
    }

    private handleScroll(): void {
        if (this.isManualScrolling || this.items.length === 0) return

        const scrollContainer = this.getScrollContainer()
        const isWin = scrollContainer === window
        const scrollY = isWin ? (window.scrollY || window.pageYOffset) : (scrollContainer as HTMLElement).scrollTop
        const clientHeight = isWin ? window.innerHeight : (scrollContainer as HTMLElement).clientHeight
        const scrollHeight = isWin
            ? document.documentElement.scrollHeight
            : (scrollContainer as HTMLElement).scrollHeight

        // Near bottom of document: activate the last item
        if (scrollY + clientHeight >= scrollHeight - 30) {
            const lastIndex = this.items.length - 1
            if (this.activeIndex !== lastIndex) {
                this.activeIndex = lastIndex
                this.applyActiveState(lastIndex, false)
                void this.updateIndicatorPosition(true)
            }
            return
        }

        // Near top of document: activate the first item
        if (scrollY <= 10) {
            if (this.activeIndex !== 0) {
                this.activeIndex = 0
                this.applyActiveState(0, false)
                void this.updateIndicatorPosition(true)
            }
            return
        }

        // Find targets corresponding to items
        let bestIndex = 0
        let closestPassedDistance = Infinity

        for (const [index, item] of this.items.entries()) {
            const targetId = item.targetId
            if (!targetId) continue

            const targetElement = document.getElementById(targetId) || document.querySelector(`[name="${CSS.escape(targetId)}"]`)
            if (!targetElement) continue

            const targetRect = targetElement.getBoundingClientRect()
            let elementTop = 0

            if (isWin) {
                elementTop = targetRect.top + window.scrollY
            } else {
                const containerRect = (scrollContainer as HTMLElement).getBoundingClientRect()
                elementTop = (scrollContainer as HTMLElement).scrollTop + (targetRect.top - containerRect.top)
            }

            const distance = (scrollY + this.scrollOffset) - elementTop
            // If the element has passed the reading threshold line
            if (distance >= -10) {
                if (distance < closestPassedDistance) {
                    closestPassedDistance = distance
                    bestIndex = index
                }
            }
        }

        if (bestIndex !== this.activeIndex) {
            this.activeIndex = bestIndex
            this.applyActiveState(bestIndex, false)
            void this.updateIndicatorPosition(true)
        }
    }

    private discoverHeadings(): void {
        const root = this.contentSelector ? document.querySelector(this.contentSelector) : document.querySelector('main, article, [role="main"]')
        if (!root) return

        const headings = Array.from(root.querySelectorAll<HTMLHeadingElement>('h2, h3, h4'))
        const discovered: Array<{ id: string; label: string; level: number }> = []

        for (const heading of headings) {
            let id = heading.id
            if (!id) {
                id = slugify(heading.textContent || '')
                heading.id = id
            }
            const level = heading.tagName === 'H2' ? 1 : heading.tagName === 'H3' ? 2 : 3
            discovered.push({
                id,
                label: heading.textContent?.trim() || '',
                level,
            })
        }

        this.discoveredItems = discovered
    }

    private readonly handleKeyDown = (event: KeyboardEvent): void => {
        if (this.items.length === 0) return

        const { key } = event
        let nextIndex = NaN

        if (key === 'ArrowDown') {
            nextIndex = (this.activeIndex + 1) % this.items.length
        } else if (key === 'ArrowUp') {
            nextIndex = (this.activeIndex - 1 + this.items.length) % this.items.length
        } else if (key === 'Home') {
            nextIndex = 0
        } else if (key === 'End') {
            nextIndex = this.items.length - 1
        }

        if (!isNaN(nextIndex)) {
            event.preventDefault()
            const targetItem = this.items[nextIndex]
            if (targetItem) {
                targetItem.focus()
                this.scrollToTarget(targetItem)
                this.activateItem(targetItem, true)
            }
        }
    }
}

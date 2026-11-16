/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-carousel` — Material Design 3 horizontal,
 * keyline-morphing scroll-snap carousel.
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, queryAssignedElements, state } from 'lit/decorators.js'
import {
    CarouselActiveChangeEvent,
    CarouselItemSize,
    CarouselVariant,
    type ICarouselActiveChangeDetail,
    type IMDCCarousel,
} from '../carousel.interface'
import type { CarouselItem } from '../carousel-item'
import { CarouselStyles } from '../carousel.style'
import {
    buildKeylineStrategy,
    computeItemLayouts,
    type KeylineStrategy,
} from './keyline'

const ItemSelector = 'mdc-carousel-item'

export abstract class BaseCarousel extends LitElement implements IMDCCarousel {

    static override styles = CarouselStyles

    /**
     * Visual variant: `'multi-browse'` (default) | `'hero'` | `'centered-hero'` | `'uncontained'` | `'full-screen'`.
     */
    @property({ type: String, reflect: true })
    public variant: CarouselVariant = CarouselVariant.MultiBrowse

    /** Target width of the `large` items in px; small / medium derive from it. */
    @property({ type: Number, reflect: true, attribute: 'preferred-item-width' })
    public preferredItemWidth = 186

    /** Minimum width of `small` items in px. */
    @property({ type: Number, reflect: true, attribute: 'min-small-item-width' })
    public minSmallItemWidth = 40

    /** Maximum width of `small` items in px. */
    @property({ type: Number, reflect: true, attribute: 'max-small-item-width' })
    public maxSmallItemWidth = 56

    @queryAssignedElements({ selector: ItemSelector, flatten: true })
    private readonly assignedItems!: CarouselItem[]

    @query('.track')
    private readonly trackEl?: HTMLElement

    @state()
    private snapStopCount = 0

    @state()
    private snapStepWidth = 0

    @state()
    private containerWidth = 0

    private items: CarouselItem[] = []
    private strategy: KeylineStrategy | null = null
    private resizeObserver: ResizeObserver | null = null
    private itemResizeObserver: ResizeObserver | null = null
    private scrollRafId: number | null = null
    private animRafId: number | null = null
    private dragFollowRafId: number | null = null
    private activeIndexValue = -1

    private pointerDown = false
    private pointerStartX = 0
    private pointerStartScrollOffset = 0
    private pointerDragging = false
    private suppressNextClick = false
    private pointerLastX = 0
    private pointerLastTime = 0
    private pointerVelocityX = 0
    private dragTargetOffset = 0
    private dragCurrentOffset = 0
    private dragStartFocalIndex = 0
    private suppressScrollListener = false

    /** Index of the current focal item, or `-1` when empty. */
    public get activeIndex(): number {
        return this.activeIndexValue
    }

    public constructor() {
        super()
        if (isServer) return
        if (!this.getAttribute('role')) this.setAttribute('role', 'region')
        if (!this.getAttribute('aria-roledescription')) this.setAttribute('aria-roledescription', 'carousel')
        if (!this.getAttribute('aria-label')) this.setAttribute('aria-label', 'Carousel')
        if (!this.getAttribute('tabindex')) this.setAttribute('tabindex', '0')
        this.addEventListener('scroll', this.handleScroll, { passive: true })
        this.addEventListener('keydown', this.handleKeydown)
        this.addEventListener('pointerdown', this.handlePointerDown)
        this.addEventListener('dragstart', this.handleDragStart)
        this.addEventListener('click', this.handleClickCapture, { capture: true })
        this.addEventListener('click', this.handleClick)
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        if (isServer) return
        this.resizeObserver = new ResizeObserver(() => this.recomputeStrategy())
        this.resizeObserver.observe(this)
        this.itemResizeObserver = new ResizeObserver(() => this.syncTrackHeight())
        for (const item of this.items) {
            this.itemResizeObserver.observe(item)
        }
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        this.resizeObserver?.disconnect()
        this.resizeObserver = null
        this.itemResizeObserver?.disconnect()
        this.itemResizeObserver = null
        if (this.scrollRafId !== null) {
            cancelAnimationFrame(this.scrollRafId)
            this.scrollRafId = null
        }
        this.cancelDragFollow()
        this.cancelScrollAnimation()
        this.cleanupDragListeners()
    }

    /**
     * Scrolls the item at `index` to its focal keyline. Honors
     * `prefers-reduced-motion` by scrolling instantly.
     */
    public scrollToItem(index: number): void {
        const item = this.items[index]
        if (!item) return
        const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

        if (this.variant === CarouselVariant.Uncontained || !this.strategy || this.strategy.step <= 0) {
            this.cancelScrollAnimation()
            item.scrollIntoView({
                block: 'nearest',
                inline: 'start',
                behavior: reducedMotion ? 'auto' : 'smooth',
            })
            return
        }

        const targetOffset = index * this.strategy.step
        if (reducedMotion) {
            this.cancelScrollAnimation()
            this.setScrollOffset(targetOffset)
            this.applyScrollLayout(targetOffset)
            return
        }
        this.animateScrollOffsetTo(targetOffset, 380)
    }

    protected override render(): TemplateResult {
        const isKeylined = this.variant !== CarouselVariant.Uncontained && this.snapStopCount > 0
        return html`
            ${isKeylined ? this.renderSnapTrack() : nothing}
            <div class="viewport" part="viewport">
                <div class="track" part="track">
                    <slot @slotchange=${this.handleSlotChange}></slot>
                </div>
            </div>
        `
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (
            changedProperties.has('variant') ||
            changedProperties.has('preferredItemWidth') ||
            changedProperties.has('minSmallItemWidth') ||
            changedProperties.has('maxSmallItemWidth')
        ) {
            this.recomputeStrategy()
        }
    }

    private renderSnapTrack(): TemplateResult {
        const stops: TemplateResult[] = []
        for (let i = 0; i < this.snapStopCount - 1; i++) {
            stops.push(html`<div class="snap-stop" style="width:${this.snapStepWidth}px"></div>`)
        }
        if (this.snapStopCount >= 1) {
            stops.push(html`<div class="snap-stop" style="width:${this.containerWidth}px"></div>`)
        }
        return html`<div class="snap-track" aria-hidden="true">${stops}</div>`
    }

    private get isRtl(): boolean {
        return this.matches(':dir(rtl)') || getComputedStyle(this).direction === 'rtl'
    }

    private get paddingInlineStart(): number {
        return parseFloat(getComputedStyle(this).getPropertyValue('--_container-padding-inline-start')) || 0
    }

    private get paddingInlineEnd(): number {
        return parseFloat(getComputedStyle(this).getPropertyValue('--_container-padding-inline-end')) || 0
    }

    private get itemSpacing(): number {
        return parseFloat(getComputedStyle(this).getPropertyValue('--_item-spacing')) || 0
    }

    private getScrollOffset(): number {
        return this.isRtl ? Math.abs(this.scrollLeft) : Math.max(0, this.scrollLeft)
    }

    private setScrollOffset(offset: number): void {
        this.suppressScrollListener = true
        this.scrollLeft = this.isRtl ? -offset : offset
        this.suppressScrollListener = false
    }

    private syncTrackHeight(): void {
        if (!this.trackEl || !this.items.length) return
        if (this.variant === CarouselVariant.Uncontained) {
            this.trackEl.style.height = ''
            for (const item of this.items) {
                item.style.minHeight = ''
            }
            return
        }
        let maxHeight = 0
        for (const item of this.items) {
            const h = item.offsetHeight
            if (h > maxHeight) maxHeight = h
        }
        if (maxHeight > 0) {
            this.trackEl.style.height = `${maxHeight}px`
            for (const item of this.items) {
                item.style.minHeight = `${maxHeight}px`
            }
        }
    }

    private recomputeStrategy(): void {
        const clientWidth = this.clientWidth
        if (clientWidth === 0 || !this.items.length) {
            this.strategy = null
            this.snapStopCount = 0
            return
        }

        const padStart = this.paddingInlineStart
        const padEnd = this.paddingInlineEnd
        const availableSpace = Math.max(0, clientWidth - padStart - padEnd)
        if (availableSpace <= 0) return

        const strategy = buildKeylineStrategy({
            variant: this.variant,
            availableSpace,
            itemCount: this.items.length,
            preferredItemWidth: this.preferredItemWidth,
            itemSpacing: this.itemSpacing,
            minSmallItemWidth: this.minSmallItemWidth,
            maxSmallItemWidth: this.maxSmallItemWidth,
            clipPaddingStart: padStart,
            clipPaddingEnd: padEnd,
        })

        this.strategy = strategy
        this.containerWidth = clientWidth
        this.snapStopCount = strategy.itemCount
        this.snapStepWidth = strategy.step

        this.style.setProperty('--_computed-large-item-width', `${strategy.focalSize}px`)
        this.style.setProperty('--_computed-medium-item-width', `${strategy.mediumSize}px`)
        this.style.setProperty('--_computed-small-item-width', `${strategy.smallSize}px`)
        this.style.setProperty('--_carousel-focal-width', `${strategy.focalSize}px`)

        this.syncTrackHeight()
        this.applyScrollLayout(this.getScrollOffset())
    }

    private applyScrollLayout(explicitOffset?: number): void {
        const { items, strategy } = this
        if (!items.length || !strategy) return

        const scrollOffset = explicitOffset ?? this.getScrollOffset()

        if (this.variant === CarouselVariant.Uncontained) {
            for (const item of items) {
                item.style.visibility = ''
                item.style.pointerEvents = ''
                item.style.transform = ''
                item.style.width = `${strategy.focalSize}px`
                item.size = CarouselItemSize.Large
                item.style.setProperty('--_carousel-item-ratio', '1')
                item.style.setProperty('--mdc-carousel-item-ratio', '1')
            }
            this.updateUncontainedActiveItem()
            return
        }

        const layouts = computeItemLayouts(strategy, scrollOffset)
        const isRtl = this.isRtl

        for (const layout of layouts) {
            const item = items[layout.index]
            if (!item) continue
            if (layout.visible) {
                const tx = isRtl ? -layout.left : layout.left
                item.style.visibility = ''
                item.style.pointerEvents = ''
                item.style.width = `${layout.width}px`
                item.style.transform = `translate3d(${tx}px, 0, 0)`
                item.size = layout.size
                const ratioStr = layout.ratio.toFixed(4)
                item.style.setProperty('--_carousel-item-ratio', ratioStr)
                item.style.setProperty('--mdc-carousel-item-ratio', ratioStr)
            } else {
                item.style.visibility = 'hidden'
                item.style.pointerEvents = 'none'
                item.style.width = '0px'
                item.style.transform = ''
                item.size = CarouselItemSize.Small
                item.style.setProperty('--_carousel-item-ratio', '0')
                item.style.setProperty('--mdc-carousel-item-ratio', '0')
            }
        }

        const step = strategy.step
        const nearestIndex = step > 0
            ? Math.min(items.length - 1, Math.max(0, Math.round(scrollOffset / step)))
            : 0
        this.commitActiveIndex(nearestIndex)
    }

    private updateUncontainedActiveItem(): void {
        const { items } = this
        if (!items.length) return
        const isRtl = this.isRtl
        const hostRect = this.getBoundingClientRect()
        const keylineX = isRtl
            ? hostRect.right - this.paddingInlineStart
            : hostRect.left + this.paddingInlineStart

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
        this.commitActiveIndex(nearestIndex)
    }

    private commitActiveIndex(nearestIndex: number): void {
        if (nearestIndex === this.activeIndexValue) return
        this.activeIndexValue = nearestIndex
        const activeItem = this.items[nearestIndex]
        if (!activeItem) return
        for (const [index, item] of this.items.entries()) {
            item.active = index === nearestIndex
        }
        this.dispatchEvent(new CustomEvent<ICarouselActiveChangeDetail>(
            CarouselActiveChangeEvent,
            { detail: { item: activeItem, index: nearestIndex }, bubbles: true, composed: true },
        ))
    }

    private readonly handleSlotChange = (): void => {
        this.items = this.assignedItems
        this.itemResizeObserver?.disconnect()
        if (!this.items.length) {
            this.activeIndexValue = -1
            this.snapStopCount = 0
            this.strategy = null
            return
        }
        for (const [index, item] of this.items.entries()) {
            item.index = index
            this.itemResizeObserver?.observe(item)
        }
        this.recomputeStrategy()
    }

    private readonly handleScroll = (): void => {
        if (this.suppressScrollListener || this.pointerDragging || this.animRafId !== null) return
        if (this.scrollRafId !== null) return
        this.scrollRafId = requestAnimationFrame(() => {
            this.scrollRafId = null
            this.applyScrollLayout(this.getScrollOffset())
        })
    }

    private readonly handleDragStart = (event: DragEvent): void => {
        event.preventDefault()
    }

    private readonly handleKeydown = (event: KeyboardEvent): void => {
        if (event.defaultPrevented || !this.items.length) return
        const { key } = event
        const rtlFactor = this.isRtl ? -1 : 1
        if (key === 'ArrowLeft' || key === 'ArrowRight') {
            event.preventDefault()
            const dir = (key === 'ArrowLeft' ? -1 : 1) * rtlFactor
            const next = Math.min(this.items.length - 1, Math.max(0, this.activeIndexValue + dir))
            this.scrollToItem(next)
        } else if (key === 'Home' || key === 'End') {
            event.preventDefault()
            this.scrollToItem(key === 'Home' ? 0 : this.items.length - 1)
        }
    }

    private readonly handlePointerDown = (event: PointerEvent): void => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return
        this.cancelScrollAnimation()
        this.cancelDragFollow()
        this.pointerDown = true
        this.pointerDragging = false
        this.pointerStartX = event.clientX
        this.pointerLastX = event.clientX
        this.pointerLastTime = performance.now()
        this.pointerVelocityX = 0
        const current = this.getScrollOffset()
        this.pointerStartScrollOffset = current
        this.dragTargetOffset = current
        this.dragCurrentOffset = current
        this.dragStartFocalIndex = this.strategy && this.strategy.step > 0
            ? Math.min(this.items.length - 1, Math.max(0, Math.round(current / this.strategy.step)))
            : 0
        window.addEventListener('pointermove', this.handlePointerMove)
        window.addEventListener('pointerup', this.handlePointerUp)
        window.addEventListener('pointercancel', this.handlePointerUp)
    }

    private readonly handlePointerMove = (event: PointerEvent): void => {
        if (!this.pointerDown) return
        const now = performance.now()
        const dt = Math.max(1, now - this.pointerLastTime)
        const instantVx = (event.clientX - this.pointerLastX) / dt
        this.pointerVelocityX = this.pointerVelocityX * 0.55 + instantVx * 0.45
        this.pointerLastX = event.clientX
        this.pointerLastTime = now

        const dx = event.clientX - this.pointerStartX
        if (!this.pointerDragging && Math.abs(dx) > 4) {
            this.pointerDragging = true
            this.setAttribute('data-dragging', '')
            this.startDragFollowLoop()
        }
        if (this.pointerDragging) {
            const signedDelta = this.isRtl ? dx : -dx
            const maxOffset = this.strategy ? this.strategy.maxScroll : Math.max(0, this.scrollWidth - this.clientWidth)
            this.dragTargetOffset = Math.min(maxOffset, Math.max(0, this.pointerStartScrollOffset + signedDelta))
        }
    }

    private startDragFollowLoop(): void {
        if (this.dragFollowRafId !== null) return
        const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
        const followTick = (): void => {
            if (!this.pointerDragging) {
                this.dragFollowRafId = null
                return
            }
            const diff = this.dragTargetOffset - this.dragCurrentOffset
            if (reducedMotion || Math.abs(diff) < 0.25) {
                this.dragCurrentOffset = this.dragTargetOffset
            } else {
                this.dragCurrentOffset += diff * 0.45
            }
            this.setScrollOffset(this.dragCurrentOffset)
            this.applyScrollLayout(this.dragCurrentOffset)
            this.dragFollowRafId = requestAnimationFrame(followTick)
        }
        this.dragFollowRafId = requestAnimationFrame(followTick)
    }

    private cancelDragFollow(): void {
        if (this.dragFollowRafId !== null) {
            cancelAnimationFrame(this.dragFollowRafId)
            this.dragFollowRafId = null
        }
    }

    private readonly handlePointerUp = (): void => {
        if (!this.pointerDown) return
        this.pointerDown = false
        if (this.pointerDragging) {
            this.pointerDragging = false
            this.cancelDragFollow()
            this.suppressNextClick = true
            const stale = performance.now() - this.pointerLastTime > 90
            const vx = stale ? 0 : this.pointerVelocityX
            const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

            if (this.variant !== CarouselVariant.Uncontained && this.strategy && this.strategy.step > 0) {
                const { step } = this.strategy
                const currentOffset = this.dragCurrentOffset
                const displacement = currentOffset - this.pointerStartScrollOffset
                const effectiveVx = this.isRtl ? vx : -vx

                let targetIndex = Math.round(currentOffset / step)
                // Compose single-advance flick + 18% drag threshold so wide Hero / Multi-browse
                // items advance effortlessly without needing to drag across the entire screen.
                if (effectiveVx > 0.22 || displacement > step * 0.18) {
                    targetIndex = Math.max(targetIndex, this.dragStartFocalIndex + 1)
                } else if (effectiveVx < -0.22 || displacement < -step * 0.18) {
                    targetIndex = Math.min(targetIndex, this.dragStartFocalIndex - 1)
                }
                targetIndex = Math.min(this.items.length - 1, Math.max(0, targetIndex))
                const targetOffset = targetIndex * step

                if (reducedMotion) {
                    this.setScrollOffset(targetOffset)
                    this.removeAttribute('data-dragging')
                    this.applyScrollLayout(targetOffset)
                } else {
                    this.animateScrollOffsetTo(targetOffset, 380, currentOffset)
                }
            } else if (!reducedMotion && Math.abs(vx) > 0.08) {
                this.animateMomentumScroll(this.isRtl ? vx : -vx, this.dragCurrentOffset)
            } else {
                this.removeAttribute('data-dragging')
            }
        }
        this.cleanupDragListeners()
    }

    private animateScrollOffsetTo(targetOffset: number, durationMs: number, fromOffset?: number): void {
        this.cancelScrollAnimation()
        this.setAttribute('data-dragging', '')
        const startOffset = fromOffset ?? this.getScrollOffset()
        const delta = targetOffset - startOffset
        if (Math.abs(delta) < 0.5) {
            this.setScrollOffset(targetOffset)
            this.applyScrollLayout(targetOffset)
            this.removeAttribute('data-dragging')
            return
        }
        const startTime = performance.now()
        const tick = (now: number): void => {
            const t = Math.min(1, (now - startTime) / durationMs)
            // Material Design 3 emphasized decelerate curve approximation (quartic ease-out)
            const eased = 1 - Math.pow(1 - t, 4)
            const current = startOffset + delta * eased
            this.setScrollOffset(current)
            this.applyScrollLayout(current)
            if (t < 1) {
                this.animRafId = requestAnimationFrame(tick)
            } else {
                this.animRafId = null
                this.setScrollOffset(targetOffset)
                this.applyScrollLayout(targetOffset)
                this.removeAttribute('data-dragging')
            }
        }
        this.animRafId = requestAnimationFrame(tick)
    }

    private animateMomentumScroll(initialVelocityPerMs: number, fromOffset: number): void {
        this.cancelScrollAnimation()
        this.setAttribute('data-dragging', '')
        let velocity = initialVelocityPerMs
        let currentOffset = fromOffset
        let lastTime = performance.now()
        const maxOffset = this.strategy ? this.strategy.maxScroll : Math.max(0, this.scrollWidth - this.clientWidth)

        const tick = (now: number): void => {
            const dt = Math.min(32, Math.max(1, now - lastTime))
            lastTime = now
            const nextOffset = Math.min(maxOffset, Math.max(0, currentOffset + velocity * dt))
            const hitEdge = Math.abs(nextOffset - currentOffset) < 0.05
            currentOffset = nextOffset
            velocity *= Math.pow(0.94, dt / 16)
            this.setScrollOffset(currentOffset)
            this.applyScrollLayout(currentOffset)
            if (Math.abs(velocity) > 0.03 && !hitEdge) {
                this.animRafId = requestAnimationFrame(tick)
            } else {
                this.animRafId = null
                this.removeAttribute('data-dragging')
            }
        }
        this.animRafId = requestAnimationFrame(tick)
    }

    private cancelScrollAnimation(): void {
        if (this.animRafId !== null) {
            cancelAnimationFrame(this.animRafId)
            this.animRafId = null
            this.removeAttribute('data-dragging')
        }
    }

    private readonly handleClickCapture = (event: MouseEvent): void => {
        if (this.suppressNextClick) {
            this.suppressNextClick = false
            event.preventDefault()
            event.stopPropagation()
        }
    }

    private readonly handleClick = (event: MouseEvent): void => {
        if (event.defaultPrevented) return
        const item = (event.target as Element | null)?.closest?.(ItemSelector) as CarouselItem | null
        if (!item) return
        const index = this.items.indexOf(item)
        if (index === -1 || index === this.activeIndexValue) return
        this.scrollToItem(index)
    }

    private cleanupDragListeners(): void {
        window.removeEventListener('pointermove', this.handlePointerMove)
        window.removeEventListener('pointerup', this.handlePointerUp)
        window.removeEventListener('pointercancel', this.handlePointerUp)
    }
}

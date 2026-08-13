/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * ReactiveController that manages an element's show/close animation based on
 * edge-slide (in-flow collapse or floating peek) behavior, with optional
 * scroll-driven auto-show/hide.
 *
 * **Positioning model**:
 * - `floating = false`: The host stays in the document flow; on hide its
 *   height/width animates to `0` (fully removed from layout). No blank gap
 *   is left behind.
 * - `floating = true`: The host floats on the page (`position: fixed` must
 *   be set by the host component). On hide it animates to `peekSize` — a
 *   small sliver remains visible. Mouse hover expands the bar.
 *
 * **Direction mapping** (derived from `placement`):
 * - Vertical placements (`top` / `bottom`):
 *     scroll down → hide, scroll up → show, at top → show.
 * - Horizontal placements (`left` / `right`):
 *     scroll right → hide, scroll left → show, at left → show.
 *
 * **Animation**:
 * The host dimension height/width keyframes are interleaved with the inner
 * container translateX/translateY keyframes. The controller splits them and
 * animates each element independently via the Web Animations API.
 *
 * **Lifecycle** mirrors the FAB/dialog pattern: a `generation` counter
 * invalidates stale async operations, an `isConnectedPromise` defers DOM
 * work until connected, and `open` / `close` events are cancelable (followed
 * by non-cancelable `opened` / `closed`).
 *
 * @example
 * ```ts
 * const slide = new EdgeSlideController(this, {
 *   placement: 'bottom',
 *   floating: true,
 *   autoHide: true,
 *   peekSize: 24,
 * })
 * ```
 */
import { isServer, type ReactiveController, type ReactiveControllerHost } from 'lit'
import { Duration, Easing } from '@sandlada/mdk'

// ── Types ────────────────────────────────────────────────────────────────────

/**
 * The viewport / document edge the host is docked to. The slide-out direction
 * is derived from this value:
 * - `top`    → slides up (out the top)
 * - `bottom` → slides down (out the bottom)
 * - `left`   → slides left (out the left)
 * - `right`  → slides right (out the right)
 */
export type Placement = 'top' | 'bottom' | 'left' | 'right'
export const Placement = {
    Top   : 'top',
    Bottom: 'bottom',
    Left  : 'left',
    Right : 'right',
} as const satisfies Record<string, Placement>

/**
 * Host contract required by {@link EdgeSlideController}.
 *
 * The host must provide a `containerElement` — the inner element whose
 * `transform` is animated during show/close.
 */
export interface IEdgeSlideHost extends ReactiveControllerHost, HTMLElement {
    /** The inner element that is translated during show/close animation. */
    containerElement: HTMLElement | null
}

/**
 * Configuration options for {@link EdgeSlideController}.
 * All fields are optional — unspecified fields retain their defaults.
 */
export interface EdgeSlideOptions {
    /**
     * When `true` the host is expected to use `position: fixed` and floats
     * above the page content. When hiding it shrinks to `peekSize` (peek
     * mode). Mouse hover expands the bar.
     *
     * When `false` (default) the host stays in the document flow. When hiding
     * it collapses to `0` (full mode).
     */
    floating?: boolean

    /**
     * The edge the host is docked to. Drives the slide-out / slide-in
     * direction.
     * @default 'bottom'
     */
    placement?: Placement

    /**
     * When `true` the controller listens to scroll events on the target
     * element (resolved via `scrollElementId`, falling back to `window`) and
     * automatically hides or shows the host based on scroll direction.
     * @default false
     */
    autoHide?: boolean

    /**
     * The `id` of the scrollable element to observe. When empty or missing,
     * the controller falls back to `window`.
     * @default ''
     */
    scrollElementId?: string

    /**
     * Visible sliver size in pixels when hidden in `floating` (peek) mode.
     * @default 24
     */
    peekSize?: number

    /**
     * When `true` the show/close transitions are skipped — the host jumps
     * directly to the target state.
     * @default false
     */
    quick?: boolean
}

// ── Constants ─────────────────────────────────────────────────────────────────

/** Open transition: spatial slide-in. */
const OPEN_DURATION = Duration.ExpressiveFastSpatial.value
const OPEN_EASING = Easing.Emphasized.ToCSSVariable()
/** Close transition: fast effects slide-out. */
const CLOSE_DURATION = Duration.ExpressiveFastEffects.value
const CLOSE_EASING = Easing.EmphasizedAccelerate.ToCSSVariable()

/** Minimum scroll |delta| (px) before a direction change is recognized. */
const SCROLL_THRESHOLD = 4

/** Minimum peek size (px) when no explicit value is provided. */
const DEFAULT_PEEK_SIZE = 24

// ── Controller ───────────────────────────────────────────────────────────────

export class EdgeSlideController implements ReactiveController {
    private readonly host: IEdgeSlideHost

    // ── Options ────────────────────────────────────────────────────────────
    private _floating = false
    private _placement: Placement = 'bottom'
    private _autoHide = false
    private _scrollElementId = ''
    private _peekSize = DEFAULT_PEEK_SIZE
    private _quick = false

    // ── Open state ─────────────────────────────────────────────────────────
    private _isOpen = false
    private _isOpening = false

    // ── Lifecycle guards ───────────────────────────────────────────────────
    /** Generation counter — incremented before each `show()` / `close()` to
     *  invalidate stale async operations. */
    private generation = 0
    /** Resolved once in `hostConnected()`, re-created in `hostDisconnected()`. */
    private isConnectedPromiseResolve!: () => void
    private isConnectedPromise: Promise<void>

    // ── Animation ──────────────────────────────────────────────────────────
    private animationAbort: AbortController | null = null

    // ── Hover (peek / floating mode) ───────────────────────────────────────
    private hoverTimer: ReturnType<typeof setTimeout> | null = null
    private readonly handleMouseEnterBound: () => void
    private readonly handleMouseLeaveBound: () => void

    // ── Scroll detection ───────────────────────────────────────────────────
    private scrollTarget: Element | Window | null = null
    private lastScrollTop = 0
    private lastScrollLeft = 0
    /** Tracks the last scroll-driven action so we don't repeat it every frame. */
    private lastScrollAction: 'show' | 'close' | null = null
    private scrollRafId: number | null = null
    private readonly handleScrollBound: () => void

    constructor(host: IEdgeSlideHost, options?: EdgeSlideOptions) {
        this.host = host
        host.addController(this)

        // Bind event handlers once
        this.handleMouseEnterBound = () => this.handleMouseEnter()
        this.handleMouseLeaveBound = () => this.handleMouseLeave()
        this.handleScrollBound = () => this.scheduleScrollCheck()

        // Apply initial options
        if (options) {
            if (options.floating !== undefined) this._floating = options.floating
            if (options.placement !== undefined) this._placement = options.placement
            if (options.autoHide !== undefined) this._autoHide = options.autoHide
            if (options.scrollElementId !== undefined) this._scrollElementId = options.scrollElementId
            if (options.peekSize !== undefined) this._peekSize = options.peekSize
            if (options.quick !== undefined) this._quick = options.quick
        }

        this.isConnectedPromise = this.createConnectedPromise()
    }

    // ── Public read/write options ─────────────────────────────────────────────

    get floating(): boolean { return this._floating }

    set floating(value: boolean) {
        if (value === this._floating) return
        this._floating = value
        if (!isServer && !value && this._isOpen === false) {
            // When switching from floating to non-floating while hidden, ensure
            // the host is fully hidden (in-flow mode requires 0 size).
            this.applyHiddenState()
        }
        this.host.requestUpdate()
    }

    get placement(): Placement { return this._placement }

    set placement(value: Placement) {
        if (value === this._placement) return
        this._placement = value
        if (!isServer) {
            if (!this._isOpen) {
                this.applyHiddenState()
            }
            this.rebindScroll()
        }
        this.host.requestUpdate()
    }

    get autoHide(): boolean { return this._autoHide }

    set autoHide(value: boolean) {
        if (value === this._autoHide) return
        this._autoHide = value
        this.rebindScroll()
        this.host.requestUpdate()
    }

    get scrollElementId(): string { return this._scrollElementId }

    set scrollElementId(value: string) {
        if (value === this._scrollElementId) return
        this._scrollElementId = value
        this.rebindScroll()
        this.host.requestUpdate()
    }

    get peekSize(): number { return this._peekSize }

    set peekSize(value: number) {
        if (value === this._peekSize) return
        this._peekSize = value
        if (!isServer && !this._isOpen) {
            this.applyHiddenState()
        }
        this.host.requestUpdate()
    }

    get quick(): boolean { return this._quick }

    set quick(value: boolean) {
        if (value === this._quick) return
        this._quick = value
        this.host.requestUpdate()
    }

    // ── Read-only state ───────────────────────────────────────────────────────

    /** Whether the host is currently shown. */
    get isOpen(): boolean { return this._isOpen }

    /** Whether the host is currently animating open. */
    get isOpening(): boolean { return this._isOpening }

    // ── ReactiveController lifecycle ──────────────────────────────────────────

    hostConnected(): void {
        if (isServer) return

        this.isConnectedPromiseResolve()

        this.host.addEventListener('mouseenter', this.handleMouseEnterBound)
        this.host.addEventListener('mouseleave', this.handleMouseLeaveBound)

        this.rebindScroll()
    }

    hostDisconnected(): void {
        this.detachScroll()
        this.cancelScrollRaf()

        this.host.removeEventListener('mouseenter', this.handleMouseEnterBound)
        this.host.removeEventListener('mouseleave', this.handleMouseLeaveBound)

        this.clearHoverTimer()

        // Invalidate any in-flight show/close operations.
        ++this.generation
        this.animationAbort?.abort()
        this.animationAbort = null

        this.isConnectedPromise = this.createConnectedPromise()
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Re-resolve the scroll target and re-attach the listener. Call this when
     * `scrollElementId`, `autoHide`, or `placement` changes externally.
     */
    rebindScroll(): void {
        if (isServer) return
        this.detachScroll()
        if (!this._autoHide) return

        this.scrollTarget = this.resolveScrollTarget()
        if (!this.scrollTarget) return

        this.recordScrollBaseline()
        // Reset action memory so the first scroll after rebind can act.
        this.lastScrollAction = null
        this.scrollTarget.addEventListener('scroll', this.handleScrollBound, { passive: true })
    }

    /**
     * Imperatively show the host (animate in).
     * Fires cancelable `open` → animates → fires `opened`.
     */
    async show(): Promise<void> {
        const gen = ++this.generation
        this.cleanupAnimations()
        await this.isConnectedPromise
        await this.host.updateComplete
        if (gen !== this.generation) return

        const preventOpen = !this.host.dispatchEvent(
            new Event('open', { cancelable: true }),
        )
        if (preventOpen) {
            this._isOpen = false
            return
        }

        this._isOpening = true
        this._isOpen = true
        this.host.setAttribute('open', '')

        if (this._quick) {
            this.applyShownState()
            this._isOpening = false
            this.host.dispatchEvent(new Event('opened'))
            return
        }

        await this.animateBar(this.getOpenKeyframes(), {
            duration: OPEN_DURATION,
            easing: OPEN_EASING,
            fill: 'forwards',
        })
        if (gen !== this.generation) return

        this.applyShownState()
        this._isOpening = false
        this.host.dispatchEvent(new Event('opened'))
    }

    /**
     * Imperatively hide the host (animate out).
     * Fires cancelable `close` → animates → fires `closed`.
     */
    async close(): Promise<void> {
        const gen = ++this.generation
        this.cleanupAnimations()
        if (!this.host.isConnected) {
            this._isOpen = false
            this.host.removeAttribute('open')
            return
        }
        await this.host.updateComplete
        if (gen !== this.generation) return

        const preventClose = !this.host.dispatchEvent(
            new Event('close', { cancelable: true }),
        )
        if (preventClose) {
            this._isOpen = true
            return
        }

        this._isOpening = false
        this._isOpen = false

        if (this._quick) {
            this.applyHiddenState()
            this.host.removeAttribute('open')
            this.host.dispatchEvent(new Event('closed'))
            return
        }

        await this.animateBar(this.getCloseKeyframes(), {
            duration: CLOSE_DURATION,
            easing: CLOSE_EASING,
            fill: 'forwards',
        })
        if (gen !== this.generation) return

        this.applyHiddenState()
        this.host.removeAttribute('open')
        this.host.dispatchEvent(new Event('closed'))
    }

    // ── Private: Connection promise ───────────────────────────────────────────

    private createConnectedPromise(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.isConnectedPromiseResolve = resolve
        })
    }

    // ── Private: Animation helpers ────────────────────────────────────────────

    /**
     * Cancel all WAAPI animations on the host and container, and abort any
     * in-flight show/close. Call this before measuring the natural size or
     * starting a new animation cycle so stale `fill:forwards` doesn't
     * interfere with layout measurement or leave a ghost state behind.
     */
    private cleanupAnimations(): void {
        this.host.getAnimations({ subtree: false }).forEach((a) => a.cancel())
        this.host.containerElement?.getAnimations({ subtree: false }).forEach((a) => a.cancel())
        this.animationAbort?.abort()
        this.animationAbort = null
    }

    /**
     * Animate the host dimension + inner container translate. Splits the
     * interleaved keyframes array: even-indexed entries → host dimension
     * keyframes, odd-indexed entries → inner container translate keyframes.
     */
    private async animateBar(
        keyframes: Keyframe[],
        options: number | KeyframeAnimationOptions,
    ): Promise<void> {
        this.animationAbort?.abort()
        this.animationAbort = new AbortController()

        const inner = this.host.containerElement
        if (!inner) return

        const animations: Animation[] = []
        const hostFrames: Keyframe[] = []
        const innerFrames: Keyframe[] = []
        for (let i = 0; i < keyframes.length; i++) {
            (i % 2 === 0 ? hostFrames : innerFrames).push(keyframes[i])
        }

        if (hostFrames.length > 0) {
            const a = this.host.animate(hostFrames, options as KeyframeAnimationOptions)
            this.animationAbort.signal.addEventListener('abort', () => { a.cancel() })
            animations.push(a)
        }
        if (innerFrames.length > 0) {
            const a = inner.animate(innerFrames, options as KeyframeAnimationOptions)
            this.animationAbort.signal.addEventListener('abort', () => { a.cancel() })
            animations.push(a)
        }

        await Promise.all(
            animations.map((a) => a.finished.catch(() => { /* aborted */ })),
        )
    }

    /** Build open keyframes: host grows to natural size, inner slides in. */
    private getOpenKeyframes(): Keyframe[] {
        const axis = this.collapseAxis()
        const natural = this.naturalSize()
        const hiddenSize = this.hiddenSize()
        const translate = this.translateAxis()
        const offset = this.openOffset(natural)

        return [
            // host: from hidden size → natural
            { [axis]: `${hiddenSize}px` },
            // inner: from open-offset → 0
            { [translate]: `${offset}px` },
            // host: natural
            { [axis]: `${natural}px` },
            // inner: 0
            { [translate]: `0px` },
        ]
    }

    /** Build close keyframes: host shrinks to hidden size, inner slides out. */
    private getCloseKeyframes(): Keyframe[] {
        const axis = this.collapseAxis()
        const natural = this.naturalSize()
        const hiddenSize = this.hiddenSize()
        const translate = this.translateAxis()
        const offset = this.closeOffset(natural)

        return [
            // host: from natural → hidden size
            { [axis]: `${natural}px` },
            // inner: from 0 → offset
            { [translate]: `0px` },
            // host: hidden size
            { [axis]: `${hiddenSize}px` },
            // inner: offset
            { [translate]: `${offset}px` },
        ]
    }

    // ── Private: Geometry helpers ─────────────────────────────────────────────

    /** Which host dimension collapses: vertical placements → height, horizontal → width. */
    private collapseAxis(): 'height' | 'width' {
        return this._placement === 'top' || this._placement === 'bottom' ? 'height' : 'width'
    }

    /** Which inner translate axis: vertical placements → translateY, horizontal → translateX. */
    private translateAxis(): 'translateY' | 'translateX' {
        return this._placement === 'top' || this._placement === 'bottom' ? 'translateY' : 'translateX'
    }

    /**
     * Natural (shown) host size in px along the collapse axis. Cancels any
     * stale fill:forwards and temporarily clears the inline hidden-size style
     * so the true natural layout size can be read via getBoundingClientRect.
     */
    private naturalSize(): number {
        const axis = this.collapseAxis()
        // Cancel stale fill:forwards that would keep the host at the hidden
        // size and throw off the measurement.
        this.host.getAnimations({ subtree: false }).forEach((a) => a.cancel())
        // Temporarily clear inline style from a previous applyHiddenState()
        // so we measure the true natural layout size.
        const inlineValue = this.host.style.getPropertyValue(axis)
        if (inlineValue) {
            this.host.style.removeProperty(axis)
        }
        const size =
            axis === 'height'
                ? this.host.getBoundingClientRect().height
                : this.host.getBoundingClientRect().width
        // Restore inline style so the host stays hidden until the new
        // animation overrides it.
        if (inlineValue) {
            this.host.style.setProperty(axis, inlineValue)
        }
        return size || 64
    }

    /**
     * Target host size when hidden:
     * - `floating = true` (peek mode): `peekSize`
     * - `floating = false` (full mode): `0`
     */
    private hiddenSize(): number {
        if (this._floating) {
            return Math.max(0, this._peekSize)
        }
        return 0
    }

    /**
     * Container translate offset (px) when entering the hidden / peek state
     * (the CLOSE direction). The bar moves from shown (translate=0) toward
     * this offset so the un-docked edge disappears first:
     *
     * Full mode (!floating):
     *   bottom → +natural (down)   → 1→2→3  (top vanishes first)
     *   top    → 0                 → 3→2→1  (host natural clip)
     *   left   → +natural (right)  → c→b→a  (right vanishes first)
     *   right  → -natural (left)   → a→b→c  (left vanishes first)
     *
     * Peek mode (floating, container slides **away** from the anchor so the
     * edge-opposite content stays visible in the clipped host):
     *   bottom → 0                 → shows top part via host clip
     *   top    → -(natural-peek)   → shows bottom part
     *   left   → -(natural-peek)   → shows right part
     *   right  → 0                 → shows left part via host clip
     */
    private closeOffset(natural: number): number {
        if (!this._floating) {
            // Full mode
            switch (this._placement) {
                case 'bottom': return +natural
                case 'top':    return 0
                case 'left':   return +natural
                case 'right':  return -natural
            }
        }
        // Peek mode
        const peekMag = Math.max(0, natural - Math.max(0, this._peekSize))
        switch (this._placement) {
            case 'bottom': return 0
            case 'top':    return -peekMag
            case 'left':   return -peekMag
            case 'right':  return 0
        }
    }

    /**
     * Container translate offset (px) when starting the SHOW animation.
     * The bar animates FROM this offset TO 0 while the host grows.
     *
     * Full mode (!floating) — the container starts on the opposite side of
     * the close direction so it slides **through** the host clip:
     *   bottom → -natural (up)    → slides down into view
     *   top    → 0                → no translation, host just grows
     *   left   → -natural (left)  → slides right into view
     *   right  → +natural (right) → slides left into view
     *
     * Peek mode (floating) — same as `closeOffset` since the container is
     * already at the peek position and animates to 0 during show.
     */
    private openOffset(natural: number): number {
        if (!this._floating) {
            // Full mode
            switch (this._placement) {
                case 'bottom': return -natural
                case 'top':    return 0
                case 'left':   return -natural
                case 'right':  return +natural
            }
        }
        return this.closeOffset(natural)
    }

    // ── Private: Final state application ──────────────────────────────────────

    /** Clear inline animation styles once shown (let CSS take over). */
    private applyShownState(): void {
        this.host.style.removeProperty('height')
        this.host.style.removeProperty('width')
        if (this.host.containerElement) {
            this.host.containerElement.style.removeProperty('transform')
        }
    }

    /** Apply the resting hidden state inline (host sized, inner translated). */
    private applyHiddenState(): void {
        const axis = this.collapseAxis()
        const hidden = this.hiddenSize()
        this.host.style.setProperty(axis, `${hidden}px`)
        if (this.host.containerElement) {
            const translate = this.translateAxis()
            const offset = this.closeOffset(this.naturalSize())
            this.host.containerElement.style.setProperty(
                'transform',
                `${translate}(${offset}px)`,
            )
        }
    }

    // ── Private: Hover-to-expand (floating / peek mode on desktop) ────────────

    /** Hover shows the full bar (floating / peek mode); mouse leave restores peek. */
    private handleMouseEnter(): void {
        this.clearHoverTimer()
        if (this._floating && !this._isOpen) {
            void this.show()
        }
    }

    private handleMouseLeave(): void {
        if (this._floating && this._isOpen && !this._isOpening) {
            this.hoverTimer = setTimeout(() => {
                void this.close()
            }, 2000)
        }
    }

    private clearHoverTimer(): void {
        if (this.hoverTimer !== null) {
            clearTimeout(this.hoverTimer)
            this.hoverTimer = null
        }
    }

    // ── Private: Scroll detection ─────────────────────────────────────────────

    private resolveScrollTarget(): Element | Window | null {
        const id = this._scrollElementId?.trim() ?? ''
        if (id.length > 0) {
            return document.getElementById(id) ?? null
        }
        return window
    }

    private recordScrollBaseline(): void {
        const t = this.scrollTarget
        if (!t) return
        const isVerticalEdge = this._placement === 'top' || this._placement === 'bottom'
        if (t === window) {
            if (isVerticalEdge) {
                this.lastScrollTop =
                    window.scrollY ?? document.documentElement.scrollTop ?? 0
            } else {
                this.lastScrollLeft =
                    window.scrollX ?? document.documentElement.scrollLeft ?? 0
            }
        } else {
            const el = t as Element
            if (isVerticalEdge) {
                this.lastScrollTop = el.scrollTop
            } else {
                this.lastScrollLeft = el.scrollLeft
            }
        }
    }

    private detachScroll(): void {
        if (this.scrollTarget) {
            this.scrollTarget.removeEventListener('scroll', this.handleScrollBound)
            this.scrollTarget = null
        }
    }

    private cancelScrollRaf(): void {
        if (this.scrollRafId !== null) {
            cancelAnimationFrame(this.scrollRafId)
            this.scrollRafId = null
        }
    }

    private scheduleScrollCheck(): void {
        if (this.scrollRafId !== null) return
        this.scrollRafId = requestAnimationFrame(() => {
            this.scrollRafId = null
            this.checkScroll()
        })
    }

    private checkScroll(): void {
        const t = this.scrollTarget
        if (!t) return

        const isVerticalEdge =
            this._placement === 'top' || this._placement === 'bottom'

        let current: number
        let max: number
        let clientSize: number
        if (t === window) {
            if (isVerticalEdge) {
                current = window.scrollY ?? document.documentElement.scrollTop ?? 0
                max = document.documentElement.scrollHeight - window.innerHeight
                clientSize = window.innerHeight
            } else {
                current = window.scrollX ?? document.documentElement.scrollLeft ?? 0
                max = document.documentElement.scrollWidth - window.innerWidth
                clientSize = window.innerWidth
            }
        } else {
            const el = t as Element
            if (isVerticalEdge) {
                current = el.scrollTop
                max = el.scrollHeight - el.clientHeight
                clientSize = el.clientHeight
            } else {
                current = el.scrollLeft
                max = el.scrollWidth - el.clientWidth
                clientSize = el.clientWidth
            }
        }

        const baseline = isVerticalEdge ? this.lastScrollTop : this.lastScrollLeft
        const delta = current - baseline

        // At the leading edge → always show.
        if (current <= 0) {
            this.dispatchScrollAction('show')
            this.updateScrollBaseline(isVerticalEdge, current)
            return
        }

        // Not scrollable (content fits) → keep shown.
        if (max <= 0) {
            this.dispatchScrollAction('show')
            this.updateScrollBaseline(isVerticalEdge, current)
            return
        }

        // Ignore sub-threshold jitter.
        if (Math.abs(delta) < SCROLL_THRESHOLD) {
            return
        }

        // Vertical: down(+)→hide, up(-)→show.
        // Horizontal: right(+)→hide, left(-)→show.
        const scrollingAway = delta > 0
        this.dispatchScrollAction(scrollingAway ? 'close' : 'show')
        this.updateScrollBaseline(isVerticalEdge, current)

        // Suppress unused-var warning (kept for future at-bottom logic).
        void clientSize
    }

    private dispatchScrollAction(action: 'show' | 'close'): void {
        if (this.lastScrollAction === action) return
        this.lastScrollAction = action
        if (action === 'show') {
            void this.show()
        } else {
            void this.close()
        }
    }

    private updateScrollBaseline(isVerticalEdge: boolean, current: number): void {
        if (isVerticalEdge) {
            this.lastScrollTop = current
        } else {
            this.lastScrollLeft = current
        }
    }
}

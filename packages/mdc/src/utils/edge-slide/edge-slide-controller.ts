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
 * The Web Animations API animates the host dimension and inner container
 * translation as separate effects.
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
import {
    EdgeSlideMotion,
    getEdgeSlideDimension,
    getEdgeSlideGeometry,
    resolveEdgeScrollTarget,
    watchEdgeScroll,
} from './internal'

// ── Types ────────────────────────────────────────────────────────────────────

/**
 * The viewport / document edge the host is docked to. The slide-out direction
 * is derived from this value:
 * - `top`    → slides up (out the top)
 * - `bottom` → slides down (out the bottom)
 * - `left`   → slides left (out the left)
 * - `right`  → slides right (out the right)
 */
export const Placement = {
    Top   : 'top',
    Bottom: 'bottom',
    Left  : 'left',
    Right : 'right',
} as const
export type Placement = (typeof Placement)[keyof typeof Placement]

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
     * The `id` of the scrollable element in the host's root. When empty,
     * the controller observes the host document's window.
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
const OpenDuration = Duration.ExpressiveFastSpatial.Value
const OpenEasing = Easing.Emphasized.ToCSSValue()
/** Close transition: fast effects slide-out. */
const CloseDuration = Duration.ExpressiveFastEffects.Value
const CloseEasing = Easing.EmphasizedAccelerate.ToCSSValue()

/** Minimum peek size (px) when no explicit value is provided. */
const DefaultPeekSize = 24

// ── Controller ───────────────────────────────────────────────────────────────

export class EdgeSlideController implements ReactiveController {
    private readonly host: IEdgeSlideHost

    // ── Options ────────────────────────────────────────────────────────────
    private _floating = false
    private _placement: Placement = 'bottom'
    private _autoHide = false
    private _scrollElementId = ''
    private _peekSize = DefaultPeekSize
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
    private readonly motion = new EdgeSlideMotion()

    // ── Hover (peek / floating mode) ───────────────────────────────────────
    private hoverTimer: ReturnType<typeof setTimeout> | null = null
    private readonly handleMouseEnterBound: () => void
    private readonly handleMouseLeaveBound: () => void

    private stopScroll: (() => void) | null = null

    public constructor(host: IEdgeSlideHost, options?: EdgeSlideOptions) {
        this.host = host
        // Bind event handlers once
        this.handleMouseEnterBound = () => this.handleMouseEnter()
        this.handleMouseLeaveBound = () => this.handleMouseLeave()

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
        host.addController(this)
    }

    // ── Public read/write options ─────────────────────────────────────────────

    public get floating(): boolean { return this._floating }

    public set floating(value: boolean) {
        if (value === this._floating) return
        this._floating = value
        if (!isServer && !value && this._isOpen === false) {
            // When switching from floating to non-floating while hidden, ensure
            // the host is fully hidden (in-flow mode requires 0 size).
            this.applyHiddenState()
        }
        this.host.requestUpdate()
    }

    public get placement(): Placement { return this._placement }

    public set placement(value: Placement) {
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

    public get autoHide(): boolean { return this._autoHide }

    public set autoHide(value: boolean) {
        if (value === this._autoHide) return
        this._autoHide = value
        this.rebindScroll()
        this.host.requestUpdate()
    }

    public get scrollElementId(): string { return this._scrollElementId }

    public set scrollElementId(value: string) {
        if (value === this._scrollElementId) return
        this._scrollElementId = value
        this.rebindScroll()
        this.host.requestUpdate()
    }

    public get peekSize(): number { return this._peekSize }

    public set peekSize(value: number) {
        if (value === this._peekSize) return
        this._peekSize = value
        if (!isServer && !this._isOpen) {
            this.applyHiddenState()
        }
        this.host.requestUpdate()
    }

    public get quick(): boolean { return this._quick }

    public set quick(value: boolean) {
        if (value === this._quick) return
        this._quick = value
        this.host.requestUpdate()
    }

    // ── Read-only state ───────────────────────────────────────────────────────

    /** Whether the host is currently shown. */
    public get isOpen(): boolean { return this._isOpen }

    /** Whether the host is currently animating open. */
    public get isOpening(): boolean { return this._isOpening }

    // ── ReactiveController lifecycle ──────────────────────────────────────────

    public hostConnected(): void {
        if (isServer) return

        this.isConnectedPromiseResolve()

        this.host.addEventListener('mouseenter', this.handleMouseEnterBound)
        this.host.addEventListener('mouseleave', this.handleMouseLeaveBound)

        this.rebindScroll()
    }

    public hostDisconnected(): void {
        this.stopScroll?.()
        this.stopScroll = null

        this.host.removeEventListener('mouseenter', this.handleMouseEnterBound)
        this.host.removeEventListener('mouseleave', this.handleMouseLeaveBound)

        this.clearHoverTimer()

        // Invalidate any in-flight show/close operations.
        ++this.generation
        this.motion.stop()
        this._isOpening = false
        this.isConnectedPromiseResolve()
        this.isConnectedPromise = this.createConnectedPromise()
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Re-resolve the scroll target and re-attach the listener. Call this when
     * `scrollElementId`, `autoHide`, or `placement` changes externally.
     */
    public rebindScroll(): void {
        this.stopScroll?.()
        this.stopScroll = null
        if (isServer || !this.host.isConnected || !this._autoHide) return

        const target = resolveEdgeScrollTarget(this._scrollElementId)(this.host)
        if (target) {
            this.stopScroll = watchEdgeScroll((action) => {
                if (action === 'show') void this.show()
                else void this.close()
            })(getEdgeSlideDimension(this._placement))(target)
        }
    }

    /**
     * Imperatively show the host (animate in).
     * Fires cancelable `open` → animates → fires `opened`.
     */
    public async show(): Promise<void> {
        if (isServer) return
        const gen = ++this.generation
        this.motion.stop()
        await this.isConnectedPromise
        await this.host.updateComplete
        if (gen !== this.generation) return

        const preventOpen = !this.host.dispatchEvent(
            new Event('open', { cancelable: true }),
        )
        if (preventOpen) {
            return
        }

        this._isOpening = true
        this._isOpen = true
        this.host.setAttribute('open', '')

        if (!this.skipMotion()) {
            await this.animateBar(true, { duration: OpenDuration, easing: OpenEasing, fill: 'forwards' })
            if (gen !== this.generation) return
        }

        this.applyShownState()
        this.motion.stop()
        this._isOpening = false
        this.host.dispatchEvent(new Event('opened'))
    }

    /**
     * Imperatively hide the host (animate out).
     * Fires cancelable `close` → animates → fires `closed`.
     */
    public async close(): Promise<void> {
        const gen = ++this.generation
        this.motion.stop()
        if (!this.host.isConnected) {
            this._isOpening = false
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
            return
        }

        this._isOpening = false
        this._isOpen = false

        if (!this.skipMotion()) {
            await this.animateBar(false, { duration: CloseDuration, easing: CloseEasing, fill: 'forwards' })
            if (gen !== this.generation) return
        }

        this.motion.stop()
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

    private skipMotion(): boolean {
        return this._quick || this.host.ownerDocument.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches === true
    }

    private async animateBar(open: boolean, options: KeyframeAnimationOptions): Promise<void> {
        const size = this.measureNaturalSize()
        const geometry = getEdgeSlideGeometry(this._placement, this._floating)(this._peekSize)(size)
        const shown = { [geometry.dimension]: `${size}px` }
        const hidden = { [geometry.dimension]: `${geometry.hiddenSize}px` }
        const settled = { transform: `${geometry.translation}(0px)` }
        const offset = open ? geometry.openOffset : geometry.closeOffset
        const edge = { transform: `${geometry.translation}(${offset}px)` }
        await this.motion.play(
            this.host,
            this.host.containerElement,
            open ? [hidden, shown] : [shown, hidden],
            open ? [edge, settled] : [settled, edge],
            options,
        )
    }

    private measureNaturalSize(): number {
        const dimension = getEdgeSlideDimension(this._placement)
        const inlineValue = this.host.style.getPropertyValue(dimension)
        const priority = this.host.style.getPropertyPriority(dimension)
        if (inlineValue) this.host.style.removeProperty(dimension)
        const size = this.host.getBoundingClientRect()[dimension]
        if (inlineValue) this.host.style.setProperty(dimension, inlineValue, priority)
        return size || 64
    }

    /** Clear inline animation styles once shown (let CSS take over). */
    private applyShownState(): void {
        this.host.style.removeProperty('height')
        this.host.style.removeProperty('width')
        if (this.host.containerElement) {
            this.host.containerElement.style.removeProperty('transform')
        }
    }

    /** Apply the resting hidden state inline. */
    private applyHiddenState(): void {
        const dimension = getEdgeSlideDimension(this._placement)
        const naturalSize = this.host.containerElement ? this.measureNaturalSize() : 0
        const geometry = getEdgeSlideGeometry(this._placement, this._floating)(this._peekSize)(naturalSize)
        this.host.style.setProperty(dimension, `${geometry.hiddenSize}px`)
        this.host.containerElement?.style.setProperty('transform', `${geometry.translation}(${geometry.closeOffset}px)`)
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
        this.clearHoverTimer()
        if (this._floating && this._isOpen && !this._isOpening) {
            this.hoverTimer = setTimeout(() => {
                this.hoverTimer = null
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
}

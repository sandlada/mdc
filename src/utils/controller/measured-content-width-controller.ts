/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { isServer, type ReactiveController, type ReactiveControllerHost } from 'lit'

/**
 * Configuration options for {@link MeasuredContentWidthController}.
 */
export interface MeasuredContentTransitionOptions {
    /**
     * Returns the target element whose natural size is observed and animated.
     * May return `null` before the element has been rendered.
     */
    target: () => HTMLElement | null

    /**
     * The CSS dimension to animate.
     * @default 'width'
     */
    dimension?: 'width' | 'height'

    /**
     * Animation duration in milliseconds.
     * @default 300
     */
    duration?: number

    /**
     * CSS easing function for the animation.
     * @default 'cubic-bezier(0.2, 0, 0.2, 1)'
     */
    easing?: string

    /**
     * Whether to include an opacity fade during the transition.
     * When `true`, opacity goes from 0 → 1 over the animation duration.
     * @default true
     */
    opacity?: boolean
}

/**
 * A `ReactiveController` that animates a single CSS dimension (width or
 * height) and optionally opacity of a target element whenever its natural
 * measured size changes.
 *
 * ### Trigger sources
 * - **Light DOM mutations** (e.g. slotted text content changes, slot child
 *   additions / removals): detected via a `MutationObserver` on the host.
 *   Measurement is deferred to the next animation frame so that any concurrent
 *   Lit re-renders (e.g. `slotchange` → `hasIcon`) complete before we read
 *   the natural size.
 * - **Lit re-renders** (e.g. `size`, `hasIcon`, `hasLabel` class changes):
 *   detected via `hostUpdated()`. Skipped when a mutation rAF is already
 *   pending to avoid animating twice for the same visual change.
 *
 * ### Animation
 * Uses the Web Animations API (`element.animate()`) instead of inline CSS
 * transitions, which allows mid-flight interruption without jank: when a new
 * change arrives while an animation is running, the controller reads the
 * current compositor position via `getBoundingClientRect()`, cancels the
 * old animation (so the natural size becomes reliable again), then starts a
 * new animation from that visual position to the new natural size.
 *
 * @example
 * ```ts
 * private readonly sizeController = new MeasuredContentWidthController(this, {
 *     target: () => this.labelElement,
 *     dimension: 'width',
 *     duration: 250,
 *     opacity: true,
 * })
 * ```
 */
export class MeasuredContentWidthController implements ReactiveController {

    private readonly host: ReactiveControllerHost & Element
    private readonly options: Required<MeasuredContentTransitionOptions>

    /** Last known settled natural size of the target element. */
    private naturalSize: number | null = null
    /** Currently running WAAPI animation, if any. */
    private currentAnimation: Animation | null = null
    private mutationObserver: MutationObserver | null = null
    /** Non-null when a measurement rAF is already queued (coalescing guard). */
    private rafId: ReturnType<typeof requestAnimationFrame> | null = null

    public constructor(
        host: ReactiveControllerHost & Element,
        options: MeasuredContentTransitionOptions,
    ) {
        this.host = host
        this.options = {
            dimension: 'width',
            duration : 300,
            easing   : 'cubic-bezier(0.2, 0, 0.2, 1)',
            opacity  : true,
            ...options,
        }
        host.addController(this)
    }

    // ── ReactiveController lifecycle ──────────────────────────────────────────

    public hostConnected(): void {
        if (isServer) return
        this.naturalSize = null
        this.cancelPendingRaf()
        this.cancelAnimation()
        this.mutationObserver = new MutationObserver(this.onMutation)
        // Observe the host's light DOM subtree for slotted text / child changes.
        // Shadow DOM mutations are not included (encapsulated by design), so
        // there is no feedback loop from our own WAAPI animation.
        this.mutationObserver.observe(this.host, {
            childList    : true,
            subtree      : true,
            characterData: true,
            attributes   : false,
        })
    }

    public hostDisconnected(): void {
        this.mutationObserver?.disconnect()
        this.mutationObserver = null
        this.cancelPendingRaf()
        this.cancelAnimation()
        this.naturalSize = null
    }

    /**
     * Handles Lit re-render triggered size changes (e.g. `size` property,
     * shadow DOM structural changes like `has-icon` / `has-label` classes).
     * Defers to any already-queued mutation rAF to avoid double-animating.
     */
    public hostUpdated(): void {
        if (isServer) return
        const el = this.options.target()
        if (!el) return

        if (this.naturalSize === null) {
            // First render — record initial natural size; no animation.
            this.naturalSize = this.readNaturalSize(el)
            return
        }

        // A mutation rAF is already queued and will measure after all pending
        // renders complete, so skip here to avoid double-animating.
        if (this.rafId !== null) return

        this.measure(el)
    }

    // ── private ───────────────────────────────────────────────────────────────

    /**
     * MutationObserver callback for light DOM changes (slotted text / children).
     * Defers to the next animation frame so that Lit re-renders triggered by
     * the same mutation (e.g. slotchange → `hasIcon = true`) complete before
     * we read the natural size.
     */
    private readonly onMutation = (): void => {
        if (this.rafId !== null) return // already coalesced
        this.rafId = requestAnimationFrame(() => {
            this.rafId = null
            const el = this.options.target()
            if (!el || this.naturalSize === null) return
            this.measure(el)
        })
    }

    /**
     * Captures the visual from-size, cancels any in-progress animation so
     * that the natural size is reliable, then starts a new animation if the
     * natural size has changed.
     */
    private measure(el: HTMLElement): void {
        let fromSize: number
        if (this.currentAnimation) {
            // Read the live compositor position before cancelling.
            const rect = el.getBoundingClientRect()
            fromSize = this.options.dimension === 'width' ? rect.width : rect.height
            // Cancel so the element reflows to its natural size, making
            // the scroll dimension reliable in the next line.
            this.cancelAnimation()
        } else {
            fromSize = this.naturalSize!
        }

        const toSize = this.readNaturalSize(el) // reliable: no animation constraining size
        this.naturalSize = toSize

        if (Math.abs(fromSize - toSize) < 1) return
        this.animate(el, fromSize, toSize)
    }

    private animate(el: HTMLElement, fromSize: number, toSize: number): void {
        const { dimension, duration, easing, opacity } = this.options
        const fromFrame: Keyframe = { [dimension]: `${fromSize}px`, offset: 0 }
        const holdFrame: Keyframe = { [dimension]: `${fromSize}px`, offset: 0.15 }
        const toFrame:   Keyframe = { [dimension]: `${toSize}px`,   offset: 1 }

        if (opacity) {
            fromFrame['opacity'] = '0'
            holdFrame['opacity'] = '0'
            toFrame['opacity']   = '1'
        }

        const animation = el.animate(
            [fromFrame, holdFrame, toFrame],
            { duration, easing, fill: 'none' },
        )
        this.currentAnimation = animation
        animation.finished
            .then(() => {
                if (this.currentAnimation === animation) {
                    this.currentAnimation = null
                }
            })
            .catch(() => {
                // Animation was cancelled — currentAnimation is already null.
            })
    }

    private readNaturalSize(el: HTMLElement): number {
        return this.options.dimension === 'width' ? el.scrollWidth : el.scrollHeight
    }

    private cancelAnimation(): void {
        if (this.currentAnimation) {
            this.currentAnimation.cancel()
            this.currentAnimation = null
        }
    }

    private cancelPendingRaf(): void {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId)
            this.rafId = null
        }
    }

}

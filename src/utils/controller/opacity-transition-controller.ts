/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { isServer, type ReactiveController, type ReactiveControllerHost } from 'lit'

/**
 * Configuration options for {@link OpacityTransitionController}.
 */
export interface OpacityTransitionOptions {
    /**
     * Returns the target element whose opacity is animated.
     * May return `null` before the element has been rendered.
     */
    target: () => HTMLElement | null

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
}

/**
 * A `ReactiveController` that fades a target element's opacity from 0 → 1
 * whenever its content changes.
 *
 * ### Trigger sources
 * - **Light DOM mutations** (e.g. slotted text content changes, slot child
 *   additions / removals): detected via a `MutationObserver` on the host.
 *   Animation is deferred to the next animation frame so that any concurrent
 *   Lit re-renders complete before we start the fade.
 * - **Lit re-renders** (e.g. shadow DOM structural changes): detected via
 *   `hostUpdated()`. Skipped when a mutation rAF is already pending to avoid
 *   animating twice for the same visual change.
 *
 * ### Animation
 * Uses the Web Animations API (`element.animate()`). The animation holds
 * `opacity: 0` for the first 15 % of the duration, then fades to `opacity: 1`
 * over the remaining time. When a new change arrives while an animation is
 * running, the old animation is cancelled and a new one starts immediately.
 *
 * @example
 * ```ts
 * private readonly opacityController = new OpacityTransitionController(this, {
 *     target: () => this.labelElement,
 *     duration: 250,
 * })
 * ```
 */
export class OpacityTransitionController implements ReactiveController {

    private readonly host: ReactiveControllerHost & Element
    private readonly options: Required<OpacityTransitionOptions>

    /** Currently running WAAPI animation, if any. */
    private currentAnimation: Animation | null = null
    private mutationObserver: MutationObserver | null = null
    /** Non-null when a measurement rAF is already queued (coalescing guard). */
    private rafId: ReturnType<typeof requestAnimationFrame> | null = null
    /** Set to `true` after the first `hostUpdated` so we skip animating on initial render. */
    private hasRendered: boolean = false

    public constructor(
        host: ReactiveControllerHost & Element,
        options: OpacityTransitionOptions,
    ) {
        this.host = host
        this.options = {
            duration: 300,
            easing   : 'cubic-bezier(0.2, 0, 0.2, 1)',
            ...options,
        }
        host.addController(this)
    }

    // ── ReactiveController lifecycle ──────────────────────────────────────────

    public hostConnected(): void {
        if (isServer) return
        this.hasRendered = false
        this.cancelPendingRaf()
        this.cancelAnimation()
        this.mutationObserver = new MutationObserver(this.onMutation)
        // Observe the host's light DOM subtree for slotted text / child changes.
        // Shadow DOM mutations are not included (encapsulated by design).
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
        this.hasRendered = false
    }

    /**
     * Handles Lit re-render triggered changes. Defers to any already-queued
     * mutation rAF to avoid double-animating.
     */
    public hostUpdated(): void {
        if (isServer) return
        const el = this.options.target()
        if (!el) return

        if (!this.hasRendered) {
            // First render — record that we've seen it; no animation.
            this.hasRendered = true
            return
        }

        // A mutation rAF is already queued and will animate after all pending
        // renders complete, so skip here to avoid double-animating.
        if (this.rafId !== null) return

        this.animate(el)
    }

    // ── private ───────────────────────────────────────────────────────────────

    /**
     * MutationObserver callback for light DOM changes (slotted text / children).
     * Defers to the next animation frame so that Lit re-renders triggered by
     * the same mutation complete before we start the fade.
     */
    private readonly onMutation = (): void => {
        if (this.rafId !== null) return // already coalesced
        this.rafId = requestAnimationFrame(() => {
            this.rafId = null
            const el = this.options.target()
            if (!el || !this.hasRendered) return
            this.animate(el)
        })
    }

    private animate(el: HTMLElement): void {
        const { duration, easing } = this.options

        // Cancel any in-flight animation so the new fade starts from a clean state.
        this.cancelAnimation()

        const animation = el.animate(
            [
                { opacity: '0', offset: 0 },
                { opacity: '0', offset: 0.15 },
                { opacity: '1', offset: 1 },
            ],
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
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { isServer, type ReactiveController, type ReactiveControllerHost } from 'lit'
import { ContentMotion, isContentMotionReduced, subscribeToContentChanges, type IContentChanges } from './internal'

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
    private readonly options: Required<OpacityTransitionOptions>
    private readonly motion = new ContentMotion()
    private content: IContentChanges | null = null
    private hasRendered = false

    private readonly host: ReactiveControllerHost & Element

    public constructor(
        host: ReactiveControllerHost & Element,
        options: OpacityTransitionOptions,
    ) {
        this.host = host
        this.options = {
            duration: 300,
            easing: 'cubic-bezier(0.2, 0, 0.2, 1)',
            ...options,
        }
        host.addController(this)
    }

    public hostConnected(): void {
        if (isServer || this.content) return
        this.content = subscribeToContentChanges(() => {
            if (this.hasRendered) this.animate()
        })(this.host)
    }

    public hostDisconnected(): void {
        this.content?.unsubscribe()
        this.content = null
        this.motion.cancel()
        this.hasRendered = false
    }

    public hostUpdated(): void {
        if (!this.content) return
        if (!this.hasRendered) {
            this.hasRendered = this.options.target() !== null
            return
        }
        if (!this.content.pending) this.animate()
    }

    private animate(): void {
        const target = this.options.target()
        if (!target || isContentMotionReduced(target)) {
            this.motion.cancel()
            return
        }
        const { duration, easing } = this.options
        this.motion.play(target, [
            { opacity: '0', offset: 0 },
            { opacity: '0', offset: 0.15 },
            { opacity: '1', offset: 1 },
        ], { duration, easing, fill: 'none' })
    }
}

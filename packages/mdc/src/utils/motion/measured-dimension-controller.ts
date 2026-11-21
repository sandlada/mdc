/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { isServer, type ReactiveController, type ReactiveControllerHost } from 'lit'
import { ContentMotion, isContentMotionReduced, subscribeToContentChanges, type IContentChanges } from './internal'

/**
 * Configuration options for {@link MeasuredDimensionController}.
 */
export interface MeasuredDimensionOptions {
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
}

/**
 * A `ReactiveController` that animates a single CSS dimension (width or
 * height) of a target element whenever its natural measured size changes.
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
 * private readonly sizeController = new MeasuredDimensionController(this, {
 *     target: () => this.labelElement,
 *     dimension: 'width',
 *     duration: 250,
 * })
 * ```
 */
export class MeasuredDimensionController implements ReactiveController {
    private readonly options: Required<MeasuredDimensionOptions>
    private readonly motion = new ContentMotion()
    private content: IContentChanges | null = null
    private element: HTMLElement | null = null
    private naturalSize = 0

    private readonly host: ReactiveControllerHost & Element

    public constructor(
        host: ReactiveControllerHost & Element,
        options: MeasuredDimensionOptions,
    ) {
        this.host = host
        this.options = {
            dimension: 'width',
            duration: 300,
            easing: 'cubic-bezier(0.2, 0, 0.2, 1)',
            ...options,
        }
        host.addController(this)
    }

    public hostConnected(): void {
        if (isServer || this.content) return
        this.content = subscribeToContentChanges(() => {
            if (this.element) this.syncTarget(false)
        })(this.host)
    }

    public hostDisconnected(): void {
        this.content?.unsubscribe()
        this.content = null
        this.motion.cancel()
        this.element = null
    }

    public hostUpdated(): void {
        if (this.content) this.syncTarget(this.content.pending)
    }

    private syncTarget(defer: boolean): void {
        const target = this.options.target()
        if (target !== this.element) {
            this.motion.cancel()
            this.element = target
            if (target) this.naturalSize = this.readNaturalSize(target)
            return
        }
        if (target && !defer) this.measure(target)
    }

    private measure(target: HTMLElement): void {
        if (isContentMotionReduced(target)) {
            this.motion.cancel()
            this.naturalSize = this.readNaturalSize(target)
            return
        }

        const { dimension, duration, easing } = this.options
        let fromSize = this.naturalSize
        if (this.motion.active) {
            fromSize = target.getBoundingClientRect()[dimension]
            this.motion.cancel()
        }

        const toSize = this.readNaturalSize(target)
        this.naturalSize = toSize
        if (Math.abs(fromSize - toSize) < 1) return

        this.motion.play(target, [
            { [dimension]: `${fromSize}px`, offset: 0 },
            { [dimension]: `${fromSize}px`, offset: 0.15 },
            { [dimension]: `${toSize}px`, offset: 1 },
        ], { duration, easing, fill: 'none' })
    }

    private readNaturalSize(target: HTMLElement): number {
        return this.options.dimension === 'width' ? target.scrollWidth : target.scrollHeight
    }
}

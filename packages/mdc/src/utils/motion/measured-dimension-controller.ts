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
    private restoreTextOverflow: (() => void) | null = null

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
        const fonts = this.host.ownerDocument.fonts
        if (fonts && fonts.status !== 'loaded') {
            void fonts.ready.then(() => {
                if (this.content && this.element && !this.motion.active) {
                    this.naturalSize = this.readNaturalSize(this.element)
                }
            })
        }
    }

    public hostDisconnected(): void {
        this.content?.unsubscribe()
        this.content = null
        this.clearMotion()
        this.element = null
    }

    public hostUpdated(): void {
        if (this.content) this.syncTarget(this.content.pending)
    }

    private syncTarget(defer: boolean): void {
        const target = this.options.target()
        if (target !== this.element) {
            this.clearMotion()
            this.element = target
            if (target) this.naturalSize = this.readNaturalSize(target)
            return
        }
        if (target && !defer) this.measure(target)
    }

    private measure(target: HTMLElement): void {
        if (isContentMotionReduced(target)) {
            this.clearMotion()
            this.naturalSize = this.readNaturalSize(target)
            return
        }

        const { dimension, duration, easing } = this.options
        let fromSize = this.naturalSize
        if (this.motion.active) {
            fromSize = target.getBoundingClientRect()[dimension]
            this.clearMotion()
        }

        const toSize = this.readNaturalSize(target)
        this.naturalSize = toSize
        if (Math.abs(fromSize - toSize) < 1) return

        const keyframes: Keyframe[] = [
            { [dimension]: `${fromSize}px`, offset: 0 },
            { [dimension]: `${fromSize}px`, offset: 0.15 },
            { [dimension]: `${toSize}px`, offset: 1 },
        ]
        const animationOptions: KeyframeAnimationOptions = { duration, easing, fill: 'none' }

        if (dimension === 'width') {
            const prevTextOverflow = target.style.textOverflow
            target.style.textOverflow = 'clip'
            const restore = () => {
                if (this.restoreTextOverflow === restore) {
                    target.style.textOverflow = prevTextOverflow
                    this.restoreTextOverflow = null
                }
            }
            this.restoreTextOverflow = restore
            const animation = this.motion.play(target, keyframes, animationOptions)
            void animation.finished.then(restore, restore)
            return
        }

        this.motion.play(target, keyframes, animationOptions)
    }

    private clearMotion(): void {
        this.motion.cancel()
        this.restoreTextOverflow?.()
        this.restoreTextOverflow = null
    }

    private readNaturalSize(target: HTMLElement): number {
        return target.getBoundingClientRect()[this.options.dimension]
    }
}

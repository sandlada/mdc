/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { isServer, type ReactiveController, type ReactiveControllerHost } from 'lit'
import {
    ContentMotion,
    evaluateWatch,
    hasWatchedValueChanged,
    isContentMotionReduced,
    readTargetContent,
    subscribeToContentChanges,
    type IContentChanges,
    type WatchInput,
} from './internal'

/**
 * Configuration options for {@link OpacityTransitionController}.
 */
export interface OpacityTransitionOptions<THost extends object = object> {
    /**
     * Returns the target element whose opacity is animated.
     * May return `null` before the element has been rendered.
     */
    target: () => HTMLElement | null

    /**
     * Optional watch source(s) evaluated across updates. Accepts a getter
     * function (returning a value or tuple), a host property name, or a mixed
     * array of both. When provided, the transition only triggers when one of
     * the watched values changes (compared via `Object.is`, recursively for
     * arrays).
     *
     * When omitted, {@link observeContent} defaults to `true` so the
     * transition triggers only when `target`'s rendered content changes.
     */
    watch?: WatchInput<THost>

    /**
     * Whether to trigger the transition when `target`'s rendered content
     * (text, `<svg>`, or flattened `<slot>` nodes) actually changes.
     *
     * @default true when `watch` is omitted; `false` when `watch` is provided
     */
    observeContent?: boolean

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
 * when its watched state or rendered content changes.
 *
 * ### Trigger sources
 * - **Watched fields (`watch`)**: single property key (`'hasLabel'`), getter
 *   (`() => [this.hasLabel, this.extended]`), or mixed array
 *   (`['hasLabel', () => this.extended]`).
 * - **Target content (`observeContent`)**: reads `target`'s rendered text /
 *   slotted nodes / `<svg>` across Light DOM mutations (deferred to the next
 *   animation frame) and Lit re-renders (`hostUpdated()`), animating only
 *   when the content snapshot actually changes.
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
 *     watch: ['hasLabel', () => this.extended],
 *     observeContent: true,
 *     duration: 250,
 * })
 * ```
 */
export class OpacityTransitionController<
    THost extends ReactiveControllerHost & Element = ReactiveControllerHost & Element,
> implements ReactiveController {
    private readonly options: OpacityTransitionOptions<THost> & {
        duration: number
        easing: string
        observeContent: boolean
    }
    private readonly motion = new ContentMotion()
    private content: IContentChanges | null = null
    private hasRendered = false
    private lastWatched: unknown = undefined
    private lastContent: string | null = null

    private readonly host: THost

    public constructor(
        host: THost,
        options: OpacityTransitionOptions<THost>,
    ) {
        this.host = host
        this.options = {
            duration: 300,
            easing: 'cubic-bezier(0.2, 0, 0.2, 1)',
            observeContent: options.watch === undefined,
            ...options,
        }
        host.addController(this)
    }

    public hostConnected(): void {
        if (isServer || this.content) return
        this.content = subscribeToContentChanges(() => {
            if (this.hasRendered) this.checkAndAnimate()
        })(this.host)
    }

    public hostDisconnected(): void {
        this.content?.unsubscribe()
        this.content = null
        this.motion.cancel()
        this.hasRendered = false
        this.lastWatched = undefined
        this.lastContent = null
    }

    public hostUpdated(): void {
        if (!this.content) return
        if (!this.hasRendered) {
            this.hasRendered = true
            this.captureSnapshot(this.options.target())
            return
        }
        if (!this.content.pending) this.checkAndAnimate()
    }

    private captureSnapshot(target: HTMLElement | null): void {
        if (this.options.watch !== undefined) {
            this.lastWatched = evaluateWatch(this.host, this.options.watch)
        }
        if (this.options.observeContent) {
            this.lastContent = target ? readTargetContent(target) : null
        }
    }

    private checkAndAnimate(): void {
        const target = this.options.target()
        let changed = false

        if (this.options.watch !== undefined) {
            const nextWatched = evaluateWatch(this.host, this.options.watch)
            if (hasWatchedValueChanged(this.lastWatched, nextWatched)) {
                this.lastWatched = nextWatched
                changed = true
            }
        }

        if (this.options.observeContent) {
            const nextContent = target ? readTargetContent(target) : null
            if (this.lastContent !== nextContent) {
                this.lastContent = nextContent
                changed = true
            }
        }

        if (changed) this.animate(target)
    }

    private animate(target: HTMLElement | null): void {
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

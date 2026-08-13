/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { type ReactiveController, type ReactiveControllerHost } from 'lit'
import { MeasuredDimensionController } from './measured-dimension-controller'
import { OpacityTransitionController } from './opacity-transition-controller'

/**
 * Configuration options for {@link MeasuredContentWidthController}.
 *
 * @deprecated Use {@link MeasuredDimensionOptions} and {@link OpacityTransitionOptions}
 *             directly instead.
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
 * @deprecated This controller combines two concerns that should be kept separate.
 *             Use {@link MeasuredDimensionController} for dimension animation
 *             and {@link OpacityTransitionController} for opacity fading.
 *             Instantiate both controllers independently in your component.
 *
 * @example
 * ```ts
 * private readonly sizeController = new MeasuredDimensionController(this, {
 *     target: () => this.labelElement,
 *     dimension: 'width',
 *     duration: 250,
 * })
 * private readonly opacityController = new OpacityTransitionController(this, {
 *     target: () => this.labelElement,
 *     duration: 250,
 * })
 * ```
 */
export class MeasuredContentWidthController implements ReactiveController {

    public constructor(
        host: ReactiveControllerHost & Element,
        options: MeasuredContentTransitionOptions,
    ) {
        const { target, dimension, duration, easing, opacity } = {
            dimension: 'width' as const,
            duration : 300,
            easing   : 'cubic-bezier(0.2, 0, 0.2, 1)',
            opacity  : true,
            ...options,
        }

        new MeasuredDimensionController(host, {
            target,
            dimension,
            duration,
            easing,
        })

        if (opacity) {
            new OpacityTransitionController(host, {
                target,
                duration,
                easing,
            })
        }
    }

    // ── ReactiveController lifecycle (delegated) ──────────────────────────────

    public hostConnected(): void {
        // Sub-controllers are already registered with the host via
        // ReactiveControllerHost.addController(), so Lit will call their
        // hostConnected automatically. Nothing to do here.
    }

    public hostDisconnected(): void {
        // Sub-controllers handle their own cleanup via Lit's lifecycle.
        // Nothing to do here.
    }

    public hostUpdated(): void {
        // Sub-controllers receive hostUpdated via Lit's lifecycle.
        // Nothing to do here.
    }

}

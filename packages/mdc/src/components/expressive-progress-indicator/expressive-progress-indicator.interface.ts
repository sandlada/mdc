/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/** Variant selecting linear or circular layout. */
export type ExpressiveProgressIndicatorVariant = 'linear' | 'circular'

/**
 * Circular size presets (maps to diameter + stroke-width tokens).
 * Ignored when `variant` is `'linear'`.
 */
export type ExpressiveProgressIndicatorCircularSize = 'extra-small' | 'small' | 'medium' | 'large'

/**
 * `mdc-expressive-progress-indicator` — Material Design 3 Expressive progress
 * indicator.
 *
 * Follows the MD3E spec as implemented by Flutter (year2024) and Jetpack
 * Compose:
 * - **Linear**: pill-shaped active indicator and `secondaryContainer` track
 *   separated by a gap, with a round stop indicator at the trailing edge of
 *   the track (determinate only).
 * - **Circular**: determinate draws a primary arc plus a `secondaryContainer`
 *   track arc with round stroke caps separated by the same gap; indeterminate
 *   uses an SVG arc spinner (1440deg rotation, 6000ms).
 *
 * Motion uses Compose's `SpringSpec(NoBouncy, VeryLow)` settle for determinate
 * transitions and the standard cubic-bezier easing for indeterminate loops.
 *
 * @slot — none. The indicator is purely decorative.
 *
 * @cssproperty --mdc-expressive-progress-indicator-enabled-active-indicator-color
 * @cssproperty --mdc-expressive-progress-indicator-enabled-track-color
 * @cssproperty --mdc-expressive-progress-indicator-enabled-stop-indicator-color
 * @cssproperty --mdc-expressive-progress-indicator-linear-track-gap
 * @cssproperty --mdc-expressive-progress-indicator-circular-track-gap
 * @cssproperty --mdc-expressive-progress-indicator-linear-track-thickness
 * @cssproperty --mdc-expressive-progress-indicator-linear-active-indicator-thickness
 * @cssproperty --mdc-expressive-progress-indicator-linear-stop-indicator-size
 * @cssproperty --mdc-expressive-progress-indicator-circular-{size}-size
 * @cssproperty --mdc-expressive-progress-indicator-circular-{size}-stroke-width
 */
export interface IExpressiveProgressIndicator extends LitElement {
    /**
     * Layout variant: `'linear'` (default) or `'circular'`. Reflects to the
     * `variant` attribute.
     */
    variant: ExpressiveProgressIndicatorVariant
    /**
     * Determinate progress value, `0` – `max`. Mirrored by `aria-valuenow`.
     * Ignored while `indeterminate` is set.
     */
    value: number
    /**
     * Maximum progress value (default `1`). The active fraction is
     * `value / max`.
     */
    max: number
    /**
     * When set, the indicator runs a looping indeterminate animation instead
     * of tracking `value`. Reflects to the `indeterminate` attribute.
     */
    indeterminate: boolean
    /**
     * Circular size preset: `'extra-small'` (32dp), `'small'` (48dp),
     * `'medium'` (64dp, default) or `'large'` (88dp). Only effective when
     * `variant` is `'circular'`. Reflects to the `circular-size` attribute.
     */
    circularSize: ExpressiveProgressIndicatorCircularSize
}

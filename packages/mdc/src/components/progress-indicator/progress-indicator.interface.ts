/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/** Variant selecting linear or circular layout. */
export type ProgressIndicatorVariant = 'linear' | 'circular'

/**
 * Circular size presets (maps to diameter + stroke-width tokens).
 * Ignored when `variant` is `'linear'`.
 */
export type ProgressIndicatorCircularSize = 'extra-small' | 'small' | 'medium' | 'large'

/**
 * `mdc-progress-indicator` — Material Design 3 progress indicator.
 *
 * Communicates the completion status of a task with a known or unknown
 * duration. The `variant` attribute selects between a linear bar and a
 * circular spinner.
 *
 * **Determinate** (default): `value` (0 – `max`) drives the filled portion
 * of the track (linear) or the arc sweep (circular).
 *
 * **Indeterminate** (`indeterminate` attribute): a looping animation
 * expresses an unspecified wait time. `aria-valuenow` is suppressed.
 *
 * @slot — none. The indicator is purely decorative.
 *
 * @cssproperty --mdc-progress-indicator-enabled-active-indicator-color
 * @cssproperty --mdc-progress-indicator-enabled-track-color
 * @cssproperty --mdc-progress-indicator-linear-track-thickness
 * @cssproperty --mdc-progress-indicator-linear-active-indicator-thickness
 * @cssproperty --mdc-progress-indicator-circular-{size}-size
 * @cssproperty --mdc-progress-indicator-circular-{size}-stroke-width
 */
export interface IProgressIndicator extends LitElement {
    /**
     * Layout variant: `'linear'` (default) or `'circular'`. Reflects to the
     * `variant` attribute.
     */
    variant: ProgressIndicatorVariant
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
    circularSize: ProgressIndicatorCircularSize
}

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/** Layout variants for `mdc-wavy-progress-indicator`. */
export const WavyProgressIndicatorVariants = {
    Linear: 'linear',
    Circular: 'circular',
} as const

/** Variant selecting linear or circular wavy layout. */
export type WavyProgressIndicatorVariants = (typeof WavyProgressIndicatorVariants)[keyof typeof WavyProgressIndicatorVariants]

/** Circular size presets for `mdc-wavy-progress-indicator`. */
export const WavyProgressIndicatorCircularSizes = {
    ExtraSmall: 'extra-small',
    Small: 'small',
    Medium: 'medium',
    Large: 'large',
} as const

/**
 * Circular size presets (maps to diameter + stroke-width tokens).
 * Ignored when `variant` is `'linear'`.
 */
export type WavyProgressIndicatorCircularSizes = (typeof WavyProgressIndicatorCircularSizes)[keyof typeof WavyProgressIndicatorCircularSizes]

/** Stroke cap styles matching Jetpack Compose `StrokeCap`. */
export const WavyProgressIndicatorStrokeCaps = {
    Round: 'round',
    Butt: 'butt',
    Square: 'square',
} as const

/** Stroke cap style for active indicator and track paths. */
export type WavyProgressIndicatorStrokeCaps = (typeof WavyProgressIndicatorStrokeCaps)[keyof typeof WavyProgressIndicatorStrokeCaps]

/**
 * Normalized amplitude `[0, 1]` or a Jetpack Compose-style callback
 * `(progress: number) => number` computing amplitude from current progress.
 */
export type WavyAmplitudeProvider = number | ((progress: number) => number) | null

/** Input attributes for `mdc-wavy-progress-indicator`. */
export interface IMDCWavyProgressIndicatorAttributes {
    /**
     * Layout variant: `'linear'` (default) or `'circular'`. Reflects to the
     * `variant` attribute.
     */
    variant: WavyProgressIndicatorVariants
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
     * When set, the indicator runs a looping indeterminate wavy animation
     * instead of tracking `value`. Reflects to the `indeterminate` attribute.
     */
    indeterminate: boolean
    /**
     * Circular size preset: `'extra-small'` (32px), `'small'` (48px),
     * `'medium'` (64px, default) or `'large'` (88px). Only effective when
     * `variant` is `'circular'`. Reflects to the `circular-size` attribute.
     */
    circularSize: WavyProgressIndicatorCircularSizes
    /**
     * Optional wavelength override in CSS pixels. When `null` (default), uses
     * the component's CSS token (`--mdc-wavy-progress-indicator-*-wavelength`).
     */
    wavelength: number | null
    /**
     * Optional wave scroll speed in CSS pixels per second. Supports positive
     * (forward), negative (reverse), and `0` (static wave). When `null`
     * (default), matches the active wavelength (1 full cycle per second),
     * matching Jetpack Compose's `WavyProgressIndicatorDefaults`.
     */
    waveSpeed: number | null
    /**
     * Optional max wave amplitude override in CSS pixels. When `null` (default),
     * uses `--mdc-wavy-progress-indicator-linear-wave-amplitude` or
     * `--mdc-wavy-progress-indicator-circular-wave-amplitude`.
     */
    waveAmplitude: number | null
    /**
     * Optional normalized amplitude `[0, 1]` or callback `(progress) => number`.
     * When `null` (default), follows Jetpack Compose's
     * `WavyProgressIndicatorDefaults.indicatorAmplitude(progress)` curve
     * (`0` for `progress <= 0.1` or `progress >= 0.95`, `1` in between; always
     * `1` while `indeterminate`).
     */
    amplitude: WavyAmplitudeProvider
    /**
     * Optional active indicator stroke thickness in CSS pixels. When `null`
     * (default), uses the component's CSS token.
     */
    strokeWidth: number | null
    /**
     * Optional track stroke thickness in CSS pixels. When `null` (default),
     * uses the component's CSS token.
     */
    trackStrokeWidth: number | null
    /**
     * Stroke cap for the active indicator (`'round'`, `'butt'`, `'square'`).
     * Defaults to `'round'`.
     */
    strokeCap: WavyProgressIndicatorStrokeCaps
    /**
     * Stroke cap for the background track (`'round'`, `'butt'`, `'square'`).
     * Defaults to `'round'`.
     */
    trackStrokeCap: WavyProgressIndicatorStrokeCaps
    /**
     * Optional visual gap in CSS pixels between active indicator and track.
     * Set to `0` to eliminate the gap. When `null` (default), uses the CSS
     * token.
     */
    gapSize: number | null
    /**
     * Optional stop indicator diameter in CSS pixels (linear determinate only).
     * Set to `0` to hide the stop indicator. When `null` (default), uses the
     * CSS token.
     */
    stopSize: number | null
    /**
     * Whether determinate progress and amplitude transitions are animated
     * (default `true`). Set to `false` to snap immediately when driving
     * progress externally frame-by-frame.
     */
    animated: boolean
}

/** Custom events emitted by `mdc-wavy-progress-indicator`. */
export interface IMDCWavyProgressIndicatorEvents {}

/**
 * `mdc-wavy-progress-indicator` — Material Design 3 Expressive wavy progress
 * indicator, faithfully matching Jetpack Compose's `LinearWavyProgressIndicator`
 * and `CircularWavyProgressIndicator`.
 *
 * @slot — none. The indicator is purely decorative.
 *
 * @cssproperty --mdc-wavy-progress-indicator-enabled-active-indicator-color
 * @cssproperty --mdc-wavy-progress-indicator-enabled-track-color
 * @cssproperty --mdc-wavy-progress-indicator-enabled-stop-indicator-color
 * @cssproperty --mdc-wavy-progress-indicator-linear-track-gap
 * @cssproperty --mdc-wavy-progress-indicator-circular-track-gap
 * @cssproperty --mdc-wavy-progress-indicator-linear-container-height
 * @cssproperty --mdc-wavy-progress-indicator-linear-track-thickness
 * @cssproperty --mdc-wavy-progress-indicator-linear-active-indicator-thickness
 * @cssproperty --mdc-wavy-progress-indicator-linear-stop-indicator-size
 * @cssproperty --mdc-wavy-progress-indicator-linear-wave-amplitude
 * @cssproperty --mdc-wavy-progress-indicator-linear-determinate-wavelength
 * @cssproperty --mdc-wavy-progress-indicator-linear-indeterminate-wavelength
 * @cssproperty --mdc-wavy-progress-indicator-circular-{size}-size
 * @cssproperty --mdc-wavy-progress-indicator-circular-{size}-stroke-width
 * @cssproperty --mdc-wavy-progress-indicator-circular-{size}-track-stroke-width
 * @cssproperty --mdc-wavy-progress-indicator-circular-wave-amplitude
 * @cssproperty --mdc-wavy-progress-indicator-circular-determinate-wavelength
 * @cssproperty --mdc-wavy-progress-indicator-circular-indeterminate-wavelength
 */
export interface IMDCWavyProgressIndicator extends LitElement, IMDCWavyProgressIndicatorAttributes {}

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/** MD3 color-role variants of `mdc-loading-indicator`. */
export type LoadingIndicatorVariant = 'primary' | 'secondary' | 'tertiary' | 'error' | 'surface'

/**
 * `mdc-loading-indicator` — the MD3 Expressive morphing-shape loading
 * indicator.
 *
 * Unlike a progress indicator, which communicates *how much* work remains, a
 * loading indicator expresses an *unspecified* wait time through motion: a
 * soft geometric shape continuously morphs into the next shape of a sequence
 * while the whole sequence tumbles around the container center. Short waits
 * (under ~5 seconds) are the intended use case.
 *
 * The indeterminate form (default) loops the MD3E shape sequence forever —
 * SoftBurst → Cookie9Sided → Pentagon → Pill → Sunny → Cookie4Sided → Oval —
 * with a spring-driven morph between consecutive shapes (stiffness 200,
 * damping ratio 0.6), a 650ms hold on each shape, an extra 90° spin per
 * completed morph and a continuous 360° rotation every 4666ms, mirroring the
 * Jetpack Compose `LoadingIndicator` / Android Views implementation.
 *
 * When `indeterminate` is not set, the element becomes a determinate
 * indicator: `progress` (0–1) drives a linear circle → SoftBurst morph while
 * the shape rotates counter-clockwise by `-progress * 180°`. A determinate
 * indicator dispatches `loading-indicator-complete` once `progress` reaches 1.
 *
 * `variant` selects an MD3 color-role scheme — `primary` (default),
 * `secondary`, `tertiary`, `error` or `surface` — and `contained` toggles
 * between two appearance modes: uncontained (default; just the floating shape
 * colored `{variant}`) and contained (a fully-rounded 48dp container sits
 * behind the shape, background `{variant}-container`, shape
 * `on-{variant}-container`). Colors are applied through the CSS tokens only.
 *
 * @slot — none. The indicator is purely decorative.
 *
 * @fires loading-indicator-complete {CustomEvent<{value: number}>} — Dispatched
 *     when a determinate indicator's `progress` reaches 1 (or on first render
 *     when initialized at 1). Fires again if progress later drops below 1 and
 *     climbs back to 1.
 *
 * @cssproperty --mdc-loading-indicator-container-size
 * @cssproperty --mdc-loading-indicator-indicator-size
 * @cssproperty --mdc-loading-indicator-container-shape
 * @cssproperty --mdc-loading-indicator-uncontained-container-color
 * @cssproperty --mdc-loading-indicator-uncontained-indicator-color
 * @cssproperty --mdc-loading-indicator-contained-container-color
 * @cssproperty --mdc-loading-indicator-contained-indicator-color
 *
 * Each color token also has a `-{variant}` counterpart (e.g.
 * `--mdc-loading-indicator-contained-container-color-secondary`), selected via
 * the `variant-{v}` class on the render root (no inline style).
 */
export interface ILoadingIndicator extends LitElement {
    /**
     * When set, the indicator runs the looping indeterminate morph instead of
     * tracking `progress`. Reflects to the `indeterminate` attribute.
     */
    indeterminate: boolean
    /**
     * Determinate progress, `0`–`1`. Mirrored by `aria-valuenow`. Ignored
     * while `indeterminate` is set.
     */
    progress: number
    /**
     * MD3 color-role scheme: `'primary'` (default), `'secondary'`,
     * `'tertiary'`, `'error'` or `'surface'`. Each variant re-keys the
     * uncontained / contained color tokens (see
     * `component-definitions/loading-indicator.definition.ts`). Reflects to
     * the `variant` attribute.
     */
    variant: LoadingIndicatorVariant
    /**
     * When set, draws a fully-rounded container behind the morphing shape —
     * background `--mdc-loading-indicator-contained-container-color` (with the
     * `contained-indicator-color` for the shape). Unset (uncontained) by
     * default: just the floating shape. Reflects to the `contained` attribute.
     */
    contained: boolean
    /**
     * Animation-rate multiplier for the indeterminate form: `1` (default) is
     * the spec speed, `2` runs twice as fast, `0.5` half speed, `0` pauses
     * the loop. Does not affect determinate tracking — `progress` is not
     * time-driven. Reflects to the `speed` attribute.
     */
    speed: number
}

/** `detail` payload of the `loading-indicator-complete` event. */
export interface ILoadingIndicatorCompleteDetail {
    value: number
}

/** Name of the event dispatched when a determinate indicator reaches 1. */
export const LOADING_INDICATOR_COMPLETE_EVENT = 'loading-indicator-complete'

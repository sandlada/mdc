/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { LitElement } from 'lit'

/** Size presets for the expressive slider (maps to track height + handle size tokens). */
export type ExpressiveSliderSize = 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'

/**
 * `mdc-expressive-slider` — Material Design 3 Expressive slider.
 *
 * Follows the MD3E spec as implemented by Jetpack Compose Material3:
 * - Track is split around the thumb with `thumbTrackGapSize` separation.
 * - Active track ends at (thumbPosition - gap), inactive track starts at (thumbPosition + gap).
 * - Track uses configurable corner size (pill shape).
 * - Thumb is a thin pill (handleWidth) that expands on hover/press.
 * - Round stop indicators at track edges.
 * - 5 size presets: extra-small, small, medium, large, extra-large.
 * - Springy handle movement with `cubic-bezier(0.34, 1.56, 0.64, 1)`.
 * - Value indicator label on hover/press.
 * - Track icons at start/end of active and inactive segments.
 *
 * @slot icon-start — Optional icon at the start of the track.
 * @slot icon-end — Optional icon at the end of the track.
 *
 * @cssproperty --mdc-expressive-slider-enabled-active-track-color
 * @cssproperty --mdc-expressive-slider-enabled-inactive-track-color
 * @cssproperty --mdc-expressive-slider-enabled-handle-color
 * @cssproperty --mdc-expressive-slider-handle-width
 * @cssproperty --mdc-expressive-slider-stop-indicator-size
 */
export interface IExpressiveSlider extends LitElement {
    /**
     * The slider minimum value.
     */
    min: number

    /**
     * The slider maximum value.
     */
    max: number

    /**
     * The slider value displayed when range is false.
     */
    value?: number

    /**
     * The slider start value displayed when range is true.
     */
    valueStart?: number

    /**
     * The slider end value displayed when range is true.
     */
    valueEnd?: number

    /**
     * An optional label for the slider's value displayed when range is false.
     */
    valueLabel: string

    /**
     * An optional label for the slider's start value displayed when range is true.
     */
    valueLabelStart: string

    /**
     * An optional label for the slider's end value displayed when range is true.
     */
    valueLabelEnd: string

    /**
     * The step between values.
     */
    step: number

    /**
     * Whether or not to show tick marks.
     */
    ticks: boolean

    /**
     * Whether or not to show a value label when activated.
     */
    labeled: boolean

    /**
     * Whether or not to show a value range.
     */
    range: boolean

    /**
     * Whether the component is disabled.
     */
    disabled: boolean

    /**
     * The HTML name to use in form submission.
     */
    name: string

    /**
     * Size preset: `'extra-small'`, `'small'`, `'medium'` (default),
     * `'large'`, or `'extra-large'`. Reflects to the `size` attribute.
     */
    size: ExpressiveSliderSize

    /**
     * Aria label for the slider's start handle (range mode).
     */
    ariaLabelStart: string

    /**
     * Aria label for the slider's end handle.
     */
    ariaLabelEnd: string

    /**
     * Aria value text for the slider's start value (range mode).
     */
    ariaValueTextStart: string

    /**
     * Aria value text for the slider's end value.
     */
    ariaValueTextEnd: string
}

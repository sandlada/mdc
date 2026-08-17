/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { LitElement } from 'lit'
import type { FormAssociated } from '../../utils/form/form-associated'

/**
 * Slider orientation. `'horizontal'` lays the track left-to-right;
 * `'vertical'` lays it top-to-bottom.
 */
export type ExpressiveSliderDirection = 'horizontal' | 'vertical'
export const ExpressiveSliderDirection = {
    Horizontal: 'horizontal',
    Vertical: 'vertical',
} as const satisfies Record<string, ExpressiveSliderDirection>

/**
 * Five-step size scale locked to the Figma prototype (node-id `58008:10353`):
 *
 * | Size          | Track height | Handle height | Rounded end |
 * | ------------- | ------------ | ------------- | ----------- |
 * | `extra-small` | 16px         | 44px          | 16px        |
 * | `small`       | 24px         | 44px          | 8px         |
 * | `medium`      | 40px         | 52px          | 12px        |
 * | `large`       | 56px         | 68px          | 16px        |
 * | `extra-large` | 96px         | 108px         | 28px        |
 */
export type ExpressiveSliderSize = 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'
export const ExpressiveSliderSize = {
    ExtraSmall: 'extra-small',
    Small: 'small',
    Medium: 'medium',
    Large: 'large',
    ExtraLarge: 'extra-large',
} as const satisfies Record<string, ExpressiveSliderSize>

/**
 * Behavioral type of the slider.
 *
 * - `standard` — single handle; active track fills `min → value`.
 * - `centered` — handle sits at the geometric center; positive values fill the
 *   right (or bottom) half with the active color, negative values fill the
 *   left (or top) half. Maps to one `<input type="range">` whose effective
 *   `min` is `-max`, `max` is `+max`.
 * - `range` — two handles symmetric about the center with a track-dot marker.
 */
export type ExpressiveSliderType = 'standard' | 'centered' | 'range'
export const ExpressiveSliderType = {
    Standard: 'standard',
    Centered: 'centered',
    Range: 'range',
} as const satisfies Record<string, ExpressiveSliderType>

/**
 * `mdc-expressive-slider` — Material Design 3 Expressive slider.
 *
 * Layout pulled from the Figma prototype (node-id `58008:10353`):
 * - Standard: `[active-track] [handle] [inactive-track]`, no gap between
 *   segments and the handle. Active fills from min up to the handle position.
 * - Centered: two inactive halves split at 50%, with an active overlay
 *   growing from the center toward the value side.
 * - Range: two inactive halves with two handles symmetric about the center
 *   and a center dot at the 50% mark.
 *
 * Five size presets and two orientations. The host element behaves as a
 * single (or pair of) `<input type="range">` for form submission and a11y.
 *
 * @slot icon-start — Optional icon at the start of the track.
 * @slot icon-end — Optional icon at the end of the track.
 */
export interface IExpressiveSlider extends LitElement, FormAssociated {
    min: number
    max: number

    /** Single-handle value (used when `type='standard'` or `).). */
    value?: number

    /** Range-start value (used when `type='range'`). */
    valueStart?: number
    /** Range-end value (used when `type='range'`). */
    valueEnd?: number

    valueLabel: string
    valueLabelStart: string
    valueLabelEnd: string

    ariaLabelStart: string
    ariaLabelEnd: string
    ariaValueTextStart: string
    ariaValueTextEnd: string

    step: number
    ticks: boolean
    labeled: boolean

    /**
     * Backward-compat alias. Setting `range=true` switches `type` to `'range'`;
     * reading returns whether `type === 'range'`.
     *
     * @deprecated Use the `type` attribute instead.
     */
    range: boolean

    /** Slider orientation. Reflects to the `direction` attribute. */
    direction: ExpressiveSliderDirection

    /** Size preset. Reflects to the `size` attribute. */
    size: ExpressiveSliderSize

    /** Behavioral type. Reflects to the `type` attribute. */
    type: ExpressiveSliderType

    name: string
}
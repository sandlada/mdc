/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { LitElement } from 'lit'
import type { IMixinFocusRingOption } from '../focus-ring/focus-ring-options.mixin'
import type { FormAssociated } from '../../utils/form/form-associated'

/**
 * Slider orientation.
 * - `'horizontal'` lays the track along the horizontal axis (min -> max left-to-right by default).
 * - `'vertical'` lays the track along the vertical axis (min -> max bottom-to-top by default).
 */
export const SliderDirection = {
    Horizontal: 'horizontal',
    Vertical: 'vertical',
} as const
export type SliderDirection = (typeof SliderDirection)[keyof typeof SliderDirection]

/**
 * Five-step Material Design 3 Expressive size scale:
 *
 * | Size          | Track height | Handle height | Outer corner | Inset icon |
 * | ------------- | ------------ | ------------- | ------------ | ---------- |
 * | `extra-small` | 16px         | 44px          | 8px (Full)   | —          |
 * | `small`       | 24px         | 44px          | 8px          | —          |
 * | `medium`      | 40px         | 52px          | 12px         | 24px       |
 * | `large`       | 56px         | 68px          | 16px         | 24px       |
 * | `extra-large` | 96px         | 108px         | 28px         | 32px       |
 */
export const SliderSize = {
    ExtraSmall: 'extra-small',
    Small: 'small',
    Medium: 'medium',
    Large: 'large',
    ExtraLarge: 'extra-large',
} as const
export type SliderSize = (typeof SliderSize)[keyof typeof SliderSize]

/**
 * Behavioral type of the slider:
 *
 * - `'standard'` — single handle; active track fills from `min` to `value`.
 * - `'centered'` — single handle; active track grows from the midpoint `(min + max) / 2` toward `value`.
 * - `'range'` — dual handles (`valueStart` and `valueEnd`); active track fills between the two handles.
 */
export const SliderType = {
    Standard: 'standard',
    Centered: 'centered',
    Range: 'range',
} as const
export type SliderType = (typeof SliderType)[keyof typeof SliderType]

export interface IMDCSliderAttributes {
    min: number
    max: number
    step: number

    value: number
    valueStart: number
    valueEnd: number

    type: SliderType
    size: SliderSize
    direction: SliderDirection
    reversed: boolean

    ticks: boolean
    labeled: boolean
    icon: string

    valueLabel: string
    valueLabelStart: string
    valueLabelEnd: string
    valueFormatter?: (value: number) => string

    ariaLabelStart: string
    ariaLabelEnd: string
    ariaValueTextStart: string
    ariaValueTextEnd: string

    nameStart: string
    nameEnd: string
}

export interface IMDCSliderEvents {
    'input': Event
    'change': Event
}

export interface IMDCSlider extends LitElement, FormAssociated, IMixinFocusRingOption, IMDCSliderAttributes { }

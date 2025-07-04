/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType, SlotsType, VNode } from 'vue'

export const SliderSize = {
    ExtraSmall: 'extra-small',
    Small: 'small',
    Medium: 'medium',
    Large: 'large',
    ExtraLarge: 'extra-large',
} as const

export type TSliderSize = typeof SliderSize[keyof typeof SliderSize]

export const props = {
    size: {
        type: String as PropType<TSliderSize>,
        default: SliderSize.Small,
    },
    disabled: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    min: {
        type: Number as PropType<number>,
        default: 0,
    },
    max: {
        type: Number as PropType<number>,
        default: 100,
    },
    step: {
        type: Number as PropType<number>,
        default: 1,
    },
    ticks: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    labeled: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    range: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    value: {
        type: Number as PropType<number | null>,
        default: null,
    },
    valueStart: {
        type: Number as PropType<number | null>,
        default: null,
    },
    valueEnd: {
        type: Number as PropType<number | null>,
        default: null,
    },
    valueLabel: {
        type: String as PropType<string>,
        default: '',
    },
    valueLabelStart: {
        type: String as PropType<string>,
        default: '',
    },
    valueLabelEnd: {
        type: String as PropType<string>,
        default: '',
    },
    ariaLabelStart: {
        type: String as PropType<string>,
        default: '',
    },
    ariaLabelEnd: {
        type: String as PropType<string>,
        default: '',
    },
    ariaValueStart: {
        type: String as PropType<string>,
        default: '',
    },
    ariaValueEnd: {
        type: String as PropType<string>,
        default: '',
    },
    ariaValuetextStart: {
        type: String as PropType<string>,
        default: '',
    },
    ariaValuetextEnd: {
        type: String as PropType<string>,
        default: '',
    },
} as const

export type ISliderProps = ExtractPublicPropTypes<typeof props>

export type TSliderSlots = SlotsType<{
    icon?: VNode
}>

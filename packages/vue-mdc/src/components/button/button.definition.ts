/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType, VNode } from 'vue'
import { type TFormSubmitterType, FormSubmitterType } from '../../internals'
import type { TButtonTarget } from '../../utils/button-target-type'

export const ButtonAppearance = {
    Filled: 'filled',
    Outlined: 'outlined',
    Elevated: 'elevated',
    FilledTonal: 'filled-tonal',
    Text: 'text',
} as const

export type TButtonAppearance = typeof ButtonAppearance[keyof typeof ButtonAppearance]

export const ButtonSize = {
    ExtraSmall: 'extra-small',
    Small: 'small',
    Medium: 'medium',
    Large: 'large',
    ExtraLarge: 'extra-large',
} as const

export const ButtonShape = {
    Round: 'round',
    Suare: 'square',
} as const

export type TButtonShape = typeof ButtonShape[keyof typeof ButtonShape]

export type TButtonSize = typeof ButtonSize[keyof typeof ButtonSize]

export const props = {
    appearance: {
        type: String as PropType<TButtonAppearance>,
        default: ButtonAppearance.Filled,
    },
    size: {
        type: String as PropType<TButtonSize>,
        default: ButtonSize.Small,
    },
    togglable: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    defaultSelected: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    shape: {
        type: String as PropType<TButtonShape>,
        default: ButtonShape.Round,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String as PropType<TFormSubmitterType>,
        default: FormSubmitterType.Button,
    },
    href: {
        type: String as PropType<string>,
        default: null,
    },
    target: {
        type: String as PropType<TButtonTarget>,
        default: null,
    },
    form: {
        type: String as PropType<string>,
        default: null,
    },
    name: {
        type: String as PropType<string>,
        default: null,
    },
    value: {
        type: String as PropType<string>,
        default: null,
    },
}

export type TButtonProps = ExtractPublicPropTypes<typeof props>

export type TButtonSlots = {
    default?: VNode
    'leading-icon'?: VNode
    'trailing-icon'?: VNode
}

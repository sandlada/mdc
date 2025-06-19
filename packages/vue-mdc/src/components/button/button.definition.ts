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

export const props = {
    appearance: {
        type: String as PropType<TButtonAppearance>,
        default: ButtonAppearance.Filled,
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

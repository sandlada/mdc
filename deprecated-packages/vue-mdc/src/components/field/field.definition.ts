/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType, VNode } from 'vue'

export const FieldAppearance = {
    Filled: 'filled',
    Outlined: 'outlined',
} as const

export type TFieldAppearance = typeof FieldAppearance[keyof typeof FieldAppearance]

export const props = {
    disabled: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    error: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    defaultFocused: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    label: {
        type: String as PropType<string>,
        default: '',
    },
    noAsterisk: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    defaultPopulated: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    required: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    resizable: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    supportingText: {
        type: String as PropType<string>,
        default: '',
    },
    errorText: {
        type: String as PropType<string>,
        default: '',
    },
    count: {
        type: Number as PropType<number>,
        default: -1,
    },
    max: {
        type: Number as PropType<number>,
        default: -1,
    },
    hasStart: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    hasEnd: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    appearance: {
        type: String as PropType<TFieldAppearance>,
        default: FieldAppearance.Filled,
    }
} as const

export type TFieldProps = ExtractPublicPropTypes<typeof props>

export type TFieldSlot = {
    container?: VNode
    start?: VNode
    end?: VNode
    default?: VNode
}

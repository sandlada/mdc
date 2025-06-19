/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType, VNode } from 'vue'

export const props = {
    disabled: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    defaultSelected: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    modelValue: {
        type: Boolean as PropType<boolean>,
        default: null,
    },
    withIcon: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    withIconSelectedOnly: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    value: {
        type: String as PropType<string>,
        default: 'on',
    },
} as const

export type TSwitchProps = ExtractPublicPropTypes<typeof props>

export type TSwitchSlots = {
    'on-icon'?: VNode
    'off-icon'?: VNode
}

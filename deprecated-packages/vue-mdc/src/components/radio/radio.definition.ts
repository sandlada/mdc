/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType } from 'vue'

export const props = {
    disabled: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    defaultChecked: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    modelValue: {
        type: Boolean as PropType<boolean>,
        default: null,
    },
} as const

export type TRadioProps = ExtractPublicPropTypes<typeof props>
export type TRadioSlots = {}

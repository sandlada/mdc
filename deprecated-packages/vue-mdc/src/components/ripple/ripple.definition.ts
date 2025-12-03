/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType } from 'vue'

export const props = {
    id: {
        default: null,
        type: String as PropType<string>
    },
    for: {
        default: null,
        type: String as PropType<string>
    },
    disabled: {
        default: false,
        type: Boolean as PropType<boolean>
    }
} as const

export type TRippleProps = ExtractPublicPropTypes<typeof props>
export type TRippleSlots = {}

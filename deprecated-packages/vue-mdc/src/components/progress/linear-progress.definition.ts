/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType } from 'vue'

export const props = {
    buffer: {
        type: Number as PropType<number>,
        default: 1,
    },
    max: {
        type: Number as PropType<number>,
        default: 1,
    },
    indeterminate: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    value: {
        type: Number as PropType<number>,
        default: 0,
        validator(value: number, { max }: { max: number }) {
            return (value >= 0) && (value <= max)
        },
    },
} as const

export type TLinearProgressProps = ExtractPublicPropTypes<typeof props>

export type TLinearProgressSlots = {}

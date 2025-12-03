/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes } from 'vue'

export const props = {
    max: {
        type: Number,
        default: 1,
    },
    indeterminate: {
        type: Boolean,
        default: false,
    },
    value: {
        type: Number,
        default: 0.25,
    },
} as const

export type TCircularProgressProps = ExtractPublicPropTypes<typeof props>
export type TCircularProgressSlots = {}

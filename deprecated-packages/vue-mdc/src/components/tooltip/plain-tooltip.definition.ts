/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType, VNode } from 'vue'
import { type TTooltipPosition, ETooltipPosition } from './tooltip-controller'

export const props = {
    supportingText: {
        type: String as PropType<string>,
        default: null
    },
    position: {
        type: String as PropType<TTooltipPosition>,
        default: ETooltipPosition.Below,
    },
    visibility: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    disabled: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    showDelay: {
        type: Number as PropType<number>,
        default: 500,
    },
    hideDelay: {
        type: Number as PropType<number>,
        default: 200,
    },
    anchor: {
        type: String as PropType<string>,
        default: null,
    },
    disableElevation: {
        type: Boolean as PropType<boolean>,
        default: false,
    },

} as const

export type TPlainTooltipProps = ExtractPublicPropTypes<typeof props>
export type TPlainTooltipSlots = {
    default?: Array<VNode>
}

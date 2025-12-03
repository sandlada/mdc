/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType, VNode } from 'vue'
import { type TTooltipPosition, ETooltipPosition } from './tooltip-controller'

export const props = {
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

export type TRichTooltipProps = ExtractPublicPropTypes<typeof props>

export type TRichTooltipSlots = {
    /**
     * Hyperlink <a></a> elements or other links should be used.
     * According to design specifications,
     * do not use Button and IconButton components in action slot.
     */
    action?: Array<VNode>
    subhead?: Array<VNode>
    ['supporting-text']?: Array<VNode>
}

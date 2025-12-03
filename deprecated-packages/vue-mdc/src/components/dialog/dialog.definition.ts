/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType, VNode } from 'vue'

export const props = {
    defaultOpen: {
        default: false,
        type: Boolean as PropType<boolean>,
    },
    modelValue: {
        default: null,
        type: Boolean as PropType<boolean>,
    }
}

export type TDialogProps = ExtractPublicPropTypes<typeof props>
export type TDialogSlots = {
    icon?: VNode
    headline?: VNode
    actions?: Array<VNode>
    default?: VNode
}

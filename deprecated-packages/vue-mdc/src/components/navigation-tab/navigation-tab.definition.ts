/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType, VNode } from 'vue'

export const props = {
    label: {
        type: String as PropType<string>,
        default: 'Unnamed Tab',
    },
    hideInactiveLabel: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
} as const

export type TNavigationTabProps = ExtractPublicPropTypes<typeof props>

export type TNavigationTabSlots = {
    default?: VNode
    'active-icon'?: VNode
    'inactive-icon'?: VNode
}

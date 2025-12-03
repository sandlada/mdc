/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType, VNode } from 'vue'
import type { INavigationItem } from '../../internals'

export const NavigationBarRippleStyle = {
    Default: 'default',
    Unbounded: 'unbounded',
    Bounded: 'bounded',
} as const

export type TNavigationBarRippleStyle = typeof NavigationBarRippleStyle[keyof typeof NavigationBarRippleStyle]

export const props = {
    defaultActiveOrder: {
        type: Number as PropType<number>,
        default: -2,
    },
    rippleStyle: {
        type: String as PropType<TNavigationBarRippleStyle>,
        default: NavigationBarRippleStyle.Default,
    },
    tabs: {
        type: Array as PropType<Array<INavigationItem>>,
        default: [],
    },
    hideInactiveLabel: {
        type: Boolean as PropType<boolean>,
        default: false,
    }
} as const

export type TNavigationBarProps = ExtractPublicPropTypes<typeof props>

export type TNavigationBarSlots = {
    default?: VNode
}

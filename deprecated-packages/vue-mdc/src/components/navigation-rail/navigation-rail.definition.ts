/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType } from 'vue'
import type { INavigationItem } from '../../internals'

export const NavigationRailPosition = {
    Left: 'top',
    Center: 'center',
    Right: 'bottom',
} as const

export type TNavigationRailPosition = typeof NavigationRailPosition[keyof typeof NavigationRailPosition]

export const props = {
    defaultActiveOrder: {
        type: Number as PropType<number>,
        default: -2,
    },
    position: {
        type: String as PropType<TNavigationRailPosition>,
        default: NavigationRailPosition.Center,
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

export type TNavigationRailProps = ExtractPublicPropTypes<typeof props>

export type TNavigationRailSlots = {
    default?: void
    start?: void
    end?: void
}

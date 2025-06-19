/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType, VNode } from 'vue'

export const FabVariant = {
    Primary: 'primary',
    Secondary: 'secondary',
    Tertiary: 'tertiary',
    Surface: 'surface',
} as const

export type TFabVariant = typeof FabVariant[keyof typeof FabVariant]

export const FabSize = {
    Small: 'small',
    Medium: 'medium',
    Large: 'large',
} as const

export type TFabSize = typeof FabSize[keyof typeof FabSize]

export const props = {
    size: {
        default: FabSize.Medium,
        type: String as PropType<TFabSize>,
    },
    label: {
        default: null,
        type: String as PropType<string>,
    },
    variant: {
        default: FabVariant.Secondary,
        type: String as PropType<TFabVariant>,
    },
    lowered: {
        default: false,
        type: Boolean as PropType<boolean>,
    },
} as const

export type TFabProps = ExtractPublicPropTypes<typeof props>

export type TFabSlots = {
    default?: VNode
}

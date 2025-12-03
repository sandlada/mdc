/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType, VNode } from 'vue'

export const FabAppearance = {
    Primary: 'primary',
    Secondary: 'secondary',
    Tertiary: 'tertiary',
    TonalPrimary: 'tonal-primary',
    TonalSecondary: 'tonal-secondary',
    TonalTertiary: 'tonal-tertiary',
    Surface: 'surface',
} as const

export type TFabAppearance = typeof FabAppearance[keyof typeof FabAppearance]

export const FabSize = {
    Baseline: 'baseline',
    Medium: 'medium',
    Large: 'large',
} as const

export type TFabSize = typeof FabSize[keyof typeof FabSize]

export const props = {
    size: {
        default: FabSize.Baseline,
        type: String as PropType<TFabSize>,
    },
    label: {
        default: null,
        type: String as PropType<string>,
    },
    appearance: {
        default: FabAppearance.Secondary,
        type: String as PropType<TFabAppearance>,
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

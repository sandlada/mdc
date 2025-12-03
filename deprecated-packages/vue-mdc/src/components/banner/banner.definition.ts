/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { type ExtractPublicPropTypes, type PropType, type VNode } from 'vue'

export const BannerAppearance = {
    PrimaryContainer: 'primary-container',
    SecondaryContainer: 'secondary-container',
    TertiaryContainer: 'tertiary-container',
    ErrorContainer: 'error-container',
    SurfaceContainerLow: 'surface-container-low',
} as const

export type TBannerAppearance = typeof BannerAppearance[keyof typeof BannerAppearance]

export const BannerLine = {
    Single: 'single-line',
    Two: 'two-lines',
    Three: 'three-lines'
}

export type TBannerLine = typeof BannerLine[keyof typeof BannerLine]

export const props = {
    appearance: {
        type: String as PropType<TBannerAppearance>,
        default: BannerAppearance.SurfaceContainerLow,
    },
    line: {
        type: String as PropType<TBannerLine>,
        default: BannerLine.Single,
    },
}


export type TBannerProps = ExtractPublicPropTypes<typeof props>

export type TBannerSlots = {
    default?: VNode
    icon?: VNode
    actions?: VNode
}

/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType } from 'vue'

export const IconVariant = {
    Outlined: 'outlined',
    Rounded: 'rounded',
    Sharp: 'sharp',
} as const

export type TIconVariant = typeof IconVariant[keyof typeof IconVariant]

export const props = {
    /**
     * 图标变体
     *
     * _此选项仅在项目安装了依赖项`material-symbols`时有效_
     *
     * + variant
     *   - sharp
     *   - rounded
     *   - outlined
     *
     * sharp更锐利, rounded更平滑, outlined较为一般化
     *
     * 可以导入枚举对象EIconSize来传入大小
     * ```html
     * <Icon :variant="EIconVariant.Sharp">send</Icon>
     * ```
     *
     * @default rounded
     */
    variant: {
        type: String as PropType<TIconVariant>,
        default: IconVariant.Rounded,
    },
} as const

export type TIconProps = ExtractPublicPropTypes<typeof props>

export type TIconSlots = {
    default?: void
}

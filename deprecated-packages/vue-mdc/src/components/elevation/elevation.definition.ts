/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType } from 'vue'

export const ElevationLevel = {
    Level0: 0,
    Level1: 1,
    Level2: 2,
    Level3: 3,
    Level4: 4,
    Level5: 5,
} as const

export type TElevationLevel = typeof ElevationLevel[keyof typeof ElevationLevel]

export const props = {
    /**
     * 阴影级数, 取值在0到5之间, 包括0和5
     *
     * 请确保**父元素的position为relative**, 并且父元素必须拥有大小
     *
     * + level
     *   - 0
     *   - 1
     *   - 2
     *   - 3
     *   - 4
     *   - 5
     *
     * 可以导入枚举对象ElevationLevel来传入大小
     * @example
     * ```html
     * <div class="relative w-[32px] h-[32px]">
     *   <glare.elevation :level="ElevationLevel.Level3"></glare.elevation>
     * </div>
     * ```
     *
     * @default 0
     */
    level: {
        type: Number as PropType<TElevationLevel>,
        default: ElevationLevel.Level0,
        validator(value: number) {
            return value >= ElevationLevel.Level0 && value <= ElevationLevel.Level5
        },
    },
}

export type TElevationProps = ExtractPublicPropTypes<typeof props>
export type TElevationSlots = {}

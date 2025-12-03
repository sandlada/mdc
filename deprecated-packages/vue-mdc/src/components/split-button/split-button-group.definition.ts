/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, VNode } from 'vue'

export const props = {} as const

export type TSplitButtonGroupProps = ExtractPublicPropTypes<typeof props>
export type TSplitButtonGroupSlots = {
    default?: Array<VNode>
}

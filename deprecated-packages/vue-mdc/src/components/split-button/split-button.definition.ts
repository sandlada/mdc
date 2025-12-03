/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType, VNode } from 'vue'
import type { TFormSubmitterType } from '../../internals'
import { type TSplitButtonAppearance, SplitButtonAppearance } from './interface'

export const props = {
    appearance: {
        type: String as PropType<TSplitButtonAppearance>,
        default: SplitButtonAppearance.Filled,
    },
    disabled: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    type: {
        type: String as PropType<TFormSubmitterType>,
        default: 'submit',
    },
    href: {
        type: String as PropType<string>,
        default: null,
    },
} as const

export type TSplitButtonProps = ExtractPublicPropTypes<typeof props>
export type TSplitButtonSlots = {
    default?: VNode
    'leading-icon'?: VNode
    'trailing-icon'?: VNode
}

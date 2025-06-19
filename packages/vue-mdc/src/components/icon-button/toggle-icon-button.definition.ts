/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType, VNode } from 'vue'
import { type TIconButtonAppearance, IconButtonAppearance } from './shared.definition'

export const props = {
    appearance: {
        type: String as PropType<TIconButtonAppearance>,
        default: IconButtonAppearance.Standard,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    defaultSelected: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    modelValue: {
        type: Boolean as PropType<boolean>,
        default: null,
    },
    name: {
        type: String as PropType<string>,
        default: null,
    },
    value: {
        type: String as PropType<string>,
        default: null,
    },
}

export type TToggleIconButtonProps = ExtractPublicPropTypes<typeof props>

export type TToggleIconButtonSlots = {
    default?: VNode
}

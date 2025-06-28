/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType, VNode } from 'vue'
import { type TIconButtonAppearance, type TIconButtonShape, type TIconButtonSize, type TIconButtonWidth, IconButtonAppearance, IconButtonShape, IconButtonSize, IconButtonWidth } from './shared.definition'

export const props = {
    appearance: {
        type: String as PropType<TIconButtonAppearance>,
        default: IconButtonAppearance.Standard,
    },
    size: {
        type: String as PropType<TIconButtonSize>,
        default: IconButtonSize.Small,
    },
    width: {
        type: String as PropType<TIconButtonWidth>,
        default: IconButtonWidth.Default,
    },
    shape: {
        type: String as PropType<TIconButtonShape>,
        default: IconButtonShape.Round,
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

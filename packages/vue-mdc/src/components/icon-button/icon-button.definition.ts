/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType, VNode } from 'vue'
import { FormSubmitterType, type TFormSubmitterType } from '../../internals/controller/form-submitter'
import type { TButtonTarget } from '../../utils/button-target-type'
import { IconButtonAppearance, IconButtonShape, IconButtonSize, IconButtonWidth, type TIconButtonAppearance, type TIconButtonShape, type TIconButtonSize, type TIconButtonWidth } from './shared.definition'

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
    type: {
        type: String as PropType<TFormSubmitterType>,
        default: FormSubmitterType.Button,
    },
    href: {
        type: String as PropType<string>,
        default: null,
    },
    target: {
        type: String as PropType<TButtonTarget>,
        default: null,
    },
    form: {
        type: String as PropType<string>,
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
} as const

export type TIconButtonProps = ExtractPublicPropTypes<typeof props>

export type TIconButtonSlots = {
    default?: VNode
}

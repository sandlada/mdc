/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType, VNode } from 'vue'
import { FormSubmitterType, type TFormSubmitterType } from '../../internals/controller/form-submitter'
import type { TButtonTarget } from '../../utils/button-target-type'
import { IconButtonAppearance, type TIconButtonAppearance } from './shared.definition'

export const props = {
    appearance: {
        type: String as PropType<TIconButtonAppearance>,
        default: IconButtonAppearance.Standard,
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

/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType, VNode } from 'vue'
import { FormSubmitterType, type TFormSubmitterType } from '../../internals/controller/form-submitter'
import type { TButtonTarget } from '../../utils/button-target-type'

export const IconButtonAppearance = {
    Filled: 'filled',
    Outlined: 'outlined',
    FilledTonal: 'filled-tonal',
    Standard: 'standard',
} as const

export type TIconButtonAppearance = typeof IconButtonAppearance[keyof typeof IconButtonAppearance]

export const IconButtonSize = {
    ExtraSmall: 'extra-small',
    Small: 'small',
    Medium: 'medium',
    Large: 'large',
    ExtraLarge: 'extra-large',
} as const

export type TIconButtonSize = typeof IconButtonSize[keyof typeof IconButtonSize]

export const IconButtonWidth = {
    Narrow: 'narrow',
    Default: 'default',
    Wide: 'wide',
} as const

export type TIconButtonWidth = typeof IconButtonWidth[keyof typeof IconButtonWidth]

export const IconButtonShape = {
    Round: 'round',
    Suare: 'square',
} as const

export type TIconButtonShape = typeof IconButtonShape[keyof typeof IconButtonShape]


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
    togglable: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    disabled: {
        type: Boolean as PropType<boolean>,
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
    defaultSelected: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    modelValue: {
        type: Boolean as PropType<boolean>,
        default: null,
    },
} as const

export type TIconButtonProps = ExtractPublicPropTypes<typeof props>

export type TIconButtonSlots = {
    default?: VNode
}

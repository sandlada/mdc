/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { ExtractPublicPropTypes, PropType } from 'vue'

export const props = {
    /**
     * Default is false. When inward is true, the focus-ring focuses within the element.
     *
     * @default false
     */
    inward: {
        default: false,
        type: Boolean as PropType<boolean>,
    },
    shapeInherit: {
        default: true,
        type: Boolean as PropType<boolean>,
    },
    /**
     * The target element that activates the focus-ring component.
     * If this parameter is not specified, the parent element is the target element by default.
     * Please make sure that the **position attribute value of the target element's CSS is relative**.
     *
     * @default null
     */
    for: {
        default: null,
        type: String as PropType<string | null>,
    },
}

export type TFocusRingProps = ExtractPublicPropTypes<typeof props>

export type TFocusRingSlot = {}

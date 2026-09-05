/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version
 * 1.0.0
 */
import { Duration, Shape } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition, defineSchema } from '../utils/styles'

export const FocusRingSchema = defineSchema([
    'enabled'
] as const)

export const FocusRingDefinition = createStyleDefinition(FocusRingSchema)({
    'active-width'          : `8px`,
    'color'                 : Color.Secondary,
    'color-reduced-contrast': Color.Outline,
    'duration'              : Duration.Long4,
    'inward-offset'         : `0px`,
    'outward-offset'        : `2px`,
    'width'                 : `3px`,

    'shape-start-start': Shape.Full,
    'shape-start-end'  : Shape.Full,
    'shape-end-start'  : Shape.Full,
    'shape-end-end'    : Shape.Full,
})

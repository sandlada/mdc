/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version
 * 1.0.0
 */
import { Duration, Shape } from '@sandlada/mdk'
import { createStyleDefinition, defineSchema } from '@sandlada/styles/schema'
import { expandShape } from '@sandlada/styles/tokens'
import { Color } from '../../utils/color'

export const FocusRingSchema = defineSchema([
    ['enabled'],
] as const)

export const FocusRingDefinition = createStyleDefinition(FocusRingSchema)({
    'active-width': `8px`,
    'color': Color.Secondary,
    'color-reduced-contrast': Color.Outline,
    'duration': Duration.Long4,
    'inward-offset': `0px`,
    'outward-offset': `2px`,
    'width': `3px`,

    ...expandShape('shape')(Shape.Full),
})

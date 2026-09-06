/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version
 * 1.0.0
 */
import { Color, createStyleDefinition, defineSchema } from '../utils/styles'

export const ElevationSchema = defineSchema(['enabled'] as const)

export const ElevationDefinition = createStyleDefinition(ElevationSchema)({
    'level': '0',
    'shadow-color': Color.Shadow,
})

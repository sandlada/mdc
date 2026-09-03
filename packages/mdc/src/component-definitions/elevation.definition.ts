/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version
 * 1.0.0
 */
import { defineSchema } from '../utils'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'
import { Color } from '../utils/tokens/theme'

export const ElevationSchema = defineSchema(['enabled'] as const)

export const ElevationDefinition = createStyleDefinition({
    'level': '0',
    'shadow-color': Color.Shadow,
})

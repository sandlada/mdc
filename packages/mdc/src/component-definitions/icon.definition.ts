/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { createStyleDefinition, defineSchema } from '../utils/styles'

export const IconSchema = defineSchema(['enabled'] as const)

export const IconDefinition = createStyleDefinition(IconSchema)({
    'font': 'Material Symbols Outlined',
    'size': '24px',
})

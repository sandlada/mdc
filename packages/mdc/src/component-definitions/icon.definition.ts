/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { createStyleDefinition, defineSchema } from '../utils/styles'

const IconSchema = defineSchema([] as const)

export const IconDefinition = createStyleDefinition(IconSchema)({
    'font': 'Material Symbols Outlined',
    'size': '24px',
})

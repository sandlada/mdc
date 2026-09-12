/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version
 * 1.0.0
 */
import { Color } from '../../utils/color'
import { createStyleDefinition, defineSchema } from '@sandlada/styles/schema'

export const DividerSchema = defineSchema(['enabled'] as const)

export const DividerDefinition = createStyleDefinition(DividerSchema)({
    'thickness': '1px',
    'color': Color.OutlineVariant,
})

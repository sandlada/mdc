/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { createStyleDefinition, defineSchema } from '@sandlada/styles/schema'

export const ChipSetSchema = defineSchema(['enabled'] as const)

/**
 * Style definition for `mdc-chip-set`.
 *
 * MD3 chip sets space their chips with an 8dp gap (regular density).
 */
export const ChipSetDefinition = createStyleDefinition({
    'container-gap-space': '8px',
})

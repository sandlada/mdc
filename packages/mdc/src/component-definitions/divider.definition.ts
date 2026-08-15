/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

export const DividerDefinition = createStyleDefinition({
    'enabled-thickness': `1px`,
    'enabled-color'    : Color.OutlineVariant,
})

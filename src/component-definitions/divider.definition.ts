/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

export const DividerDefinition = createStyleDefinition({
    'thickness': `1px`,
    'color'    : Color.OutlineVariant,
})

/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

export const ElevationDefinition = createStyleDefinition({
    'level'       : '0',
    'shadow-color': Color.Shadow,
})

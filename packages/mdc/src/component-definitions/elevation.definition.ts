/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

export const ElevationDefinition = createStyleDefinition({
    'enabled-level'       : '0',
    'enabled-shadow-color': Color.Shadow,
})

/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ElevationLevel } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

export const ElevationDefinition = createStyleDefinition({
    'level'       : ElevationLevel.Level0,
    'shadow-color': Color.Shadow,
})

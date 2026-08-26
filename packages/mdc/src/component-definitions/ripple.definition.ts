/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version
 * 1.0.0
 */
import { State } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

export const RippleDefinition = createStyleDefinition({
    'color'  : [`transparent`, Color.OnSurface, Color.OnSurface, Color.OnSurface, null],
    'opacity': [`0`, State.HoveredStateLayerOpacity, State.FocusedStateLayerOpacity, State.PressedStateLayerOpacity, null],
})

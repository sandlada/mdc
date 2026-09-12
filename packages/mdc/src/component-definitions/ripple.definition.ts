/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version
 * 1.0.0
 */
import { State } from '@sandlada/mdk'
import { Color, createStyleDefinition, defineSchema } from '../utils/styles'

export const RippleSchema = defineSchema(['enabled', 'hovered', 'focused', 'pressed', 'disabled'] as const)

export const RippleDefinition = createStyleDefinition(RippleSchema)({
    'color': [`transparent`, Color.OnSurface, Color.OnSurface, Color.OnSurface, null],
    'opacity': [`0`, State.HoveredStateLayerOpacity, State.FocusedStateLayerOpacity, State.PressedStateLayerOpacity, null],
})

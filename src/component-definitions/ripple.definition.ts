/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Color, State } from '@sandlada/mdk'

export const RippleDefinition = {
    'hovered-color'  : Color.OnSurface,
    'hovered-opacity': State.HoveredStateLayerOpacity,
    'pressed-color'  : Color.OnSurface,
    'pressed-opacity': State.PressedStateLayerOpacity,
} as const

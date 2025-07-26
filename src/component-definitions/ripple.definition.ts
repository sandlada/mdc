/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Color, State } from '@sandlada/mdk'

export const RippleDefinition = {
    'hovered-color'  : Color.OnSurface,
    'hovered-opacity': State.HoveredStateLayerOpacity,
    'focused-color'  : Color.OnSurface,
    'focused-opacity': State.FocusedStateLayerOpacity,
    'pressed-color'  : Color.OnSurface,
    'pressed-opacity': State.PressedStateLayerOpacity,

    /**
     * @todo
     */
    // 'dragged-color'  : Color.OnSurface,
    // 'dragged-opacity': State.DraggedStateLayerOpacity,
} as const

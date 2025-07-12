/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Color, State } from '@sandlada/mdk'

export const RadioButtonDefinition = {
    'selected-icon-color'  : Color.Primary,
    'unselected-icon-color': Color.OnSurfaceVariant,
    'icon-size'            : `20px`,
    'state-layer-size'     : `40px`,
    // Disabled
    'disabled-selected-icon-color'    : Color.OnSurface,
    'disabled-selected-icon-opacity'  : `0.38`,
    'disabled-unselected-icon-color'  : Color.OnSurface,
    'disabled-unselected-icon-opacity': `0.38`,
    // Hovered
    'hovered-selected-icon-color'           : Color.Primary,
    'hovered-unselected-icon-color'         : Color.OnSurface,
    'hovered-selected-state-layer-color'    : Color.Primary,
    'hovered-selected-state-layer-opacity'  : State.HoveredStateLayerOpacity,
    'hovered-unselected-state-layer-color'  : Color.OnSurface,
    'hovered-unselected-state-layer-opacity': State.HoveredStateLayerOpacity,
    // Focused
    'focused-selected-icon-color'           : Color.Primary,
    'focused-unselected-icon-color'         : Color.OnSurface,
    'focused-selected-state-layer-color'    : Color.Primary,
    'focused-selected-state-layer-opacity'  : State.FocusedStateLayerOpacity,
    'focused-unselected-state-layer-color'  : Color.OnSurface,
    'focused-unselected-state-layer-opacity': State.FocusedStateLayerOpacity,
    // Pressed
    'pressed-selected-icon-color'           : Color.Primary,
    'pressed-unselected-icon-color'         : Color.OnSurface,
    'pressed-selected-state-layer-color'    : Color.OnSurface,
    'pressed-selected-state-layer-opacity'  : State.PressedStateLayerOpacity,
    'pressed-unselected-state-layer-color'  : Color.Primary,
    'pressed-unselected-state-layer-opacity': State.PressedStateLayerOpacity,
} as const

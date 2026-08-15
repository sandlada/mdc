/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { State } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

export const RadioButtonDefinition = createStyleDefinition({
    'enabled-icon-color-selected'    : Color.Primary,
    'enabled-icon-color-unselected'  : Color.OnSurfaceVariant,
    'icon-size'                      : `20px`,
    'state-layer-size'               : `40px`,
    // Disabled
    'disabled-icon-color-selected'    : Color.OnSurface,
    'disabled-icon-opacity-selected'  : `0.38`,
    'disabled-icon-color-unselected'  : Color.OnSurface,
    'disabled-icon-opacity-unselected': `0.38`,
    // Hovered
    'hovered-icon-color-selected'           : Color.Primary,
    'hovered-icon-color-unselected'         : Color.OnSurface,
    'hovered-state-layer-color-selected'    : Color.Primary,
    'hovered-state-layer-opacity-selected'  : State.HoveredStateLayerOpacity,
    'hovered-state-layer-color-unselected'  : Color.OnSurface,
    'hovered-state-layer-opacity-unselected': State.HoveredStateLayerOpacity,
    // Focused
    'focused-icon-color-selected'           : Color.Primary,
    'focused-icon-color-unselected'         : Color.OnSurface,
    'focused-state-layer-color-selected'    : Color.Primary,
    'focused-state-layer-opacity-selected'  : State.FocusedStateLayerOpacity,
    'focused-state-layer-color-unselected'  : Color.OnSurface,
    'focused-state-layer-opacity-unselected': State.FocusedStateLayerOpacity,
    // Pressed
    'pressed-icon-color-selected'           : Color.Primary,
    'pressed-icon-color-unselected'         : Color.OnSurface,
    'pressed-state-layer-color-selected'    : Color.OnSurface,
    'pressed-state-layer-opacity-selected'  : State.PressedStateLayerOpacity,
    'pressed-state-layer-color-unselected'  : Color.Primary,
    'pressed-state-layer-opacity-unselected': State.PressedStateLayerOpacity,
})

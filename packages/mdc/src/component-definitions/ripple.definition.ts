/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { State } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

export const RippleDefinition = createStyleDefinition({
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
})

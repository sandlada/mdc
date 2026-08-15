/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { State } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

export const RippleDefinition = createStyleDefinition({
    'enabled-hovered-color'  : Color.OnSurface,
    'enabled-hovered-opacity': State.HoveredStateLayerOpacity,
    'enabled-focused-color'  : Color.OnSurface,
    'enabled-focused-opacity': State.FocusedStateLayerOpacity,
    'enabled-pressed-color'  : Color.OnSurface,
    'enabled-pressed-opacity': State.PressedStateLayerOpacity,

    /**
     * @todo
     */
    // 'enabled-dragged-color'  : Color.OnSurface,
    // 'enabled-dragged-opacity': State.DraggedStateLayerOpacity,
})

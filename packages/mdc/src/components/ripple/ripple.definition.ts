/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version
 * 1.0.0
 */
import { State } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition } from '../../utils/style'

export const RippleDefinition = createStyleDefinition({
    'color': { enabled: `transparent`, hovered: Color.OnSurface, focused: Color.OnSurface, pressed: Color.OnSurface },
    'opacity': { enabled: `0`, hovered: State.HoveredStateLayerOpacity, focused: State.FocusedStateLayerOpacity, pressed: State.PressedStateLayerOpacity },
})

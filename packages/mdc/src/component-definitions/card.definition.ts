/**
* @license
* Copyright 2025 Kai-Orion & Sandlada
* SPDX-License-Identifier: MIT
*/

import { Shape, State } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

const shared = {
    'container-padding-inline-start': `16px`,
    'container-padding-inline-end': `16px`,
    'container-padding-block-start': `16px`,
    'container-padding-block-end': `16px`,
    'container-margin-inline-start': `0px`,
    'container-margin-inline-end': `8px`,
    'container-margin-block-start': `0px`,
    'container-margin-block-end': `8px`,
} as const

export const ElevatedCardDefinition = createStyleDefinition({
    ...shared,
    'container-shape-start-start': Shape.Medium,
    'container-shape-start-end'  : Shape.Medium,
    'container-shape-end-start'  : Shape.Medium,
    'container-shape-end-end'    : Shape.Medium,

    'enabled-container-color'       : Color.SurfaceContainerLow,
    'enabled-container-elevation'   : '1',
    'enabled-container-shadow-color': Color.Shadow,
    'enabled-icon-color'            : Color.Primary,
    'icon-size'                      : `24px`,

    // Disabled
    'disabled-container-color'    : Color.Surface,
    'disabled-container-elevation': '1',
    'disabled-container-opacity'  : `0.38`,

    // Hovered
    'hovered-container-elevation': '2',
    'hovered-state-layer-color'  : Color.OnSurface,
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,

    // Focused
    'focused-container-elevation': '1',
    'focused-state-layer-color'  : Color.OnSurface,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'focused-indicator-color'    : Color.Secondary,
    'focused-indicator-offset'   : State.FocusIndicator.OuterOffset,
    'focused-indicator-thickness': State.FocusIndicator.Thickness,

    // Pressed
    'pressed-container-elevation': '1',
    'pressed-state-layer-color'  : Color.OnSurface,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,

    // Dragged
    'dragged-container-elevation': '4',
    'dragged-state-layer-color'  : Color.OnSurface,
    'dragged-state-layer-opacity': State.DraggedStateLayerOpacity,
})

export const FilledCardDefinition = createStyleDefinition({
    ...shared,
    'container-shape-start-start': Shape.Medium,
    'container-shape-start-end': Shape.Medium,
    'container-shape-end-start': Shape.Medium,
    'container-shape-end-end': Shape.Medium,
    'enabled-container-color'       : Color.SurfaceContainerHighest,
    'enabled-container-elevation'   : '0',
    'enabled-container-shadow-color': Color.Shadow,
    'enabled-icon-color'            : Color.Primary,
    'icon-size'                      : `24px`,

    // Disabled
    'disabled-container-color'    : Color.SurfaceVariant,
    'disabled-container-elevation': '0',
    'disabled-container-opacity'  : `0.38`,

    // Hovered
    'hovered-container-elevation': '1',
    'hovered-state-layer-color'  : Color.OnSurface,
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,

    // Focused
    'focused-container-elevation': '0',
    'focused-state-layer-color'  : Color.OnSurface,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'focused-indicator-color'    : Color.Secondary,
    'focused-indicator-offset'   : State.FocusIndicator.OuterOffset,
    'focused-indicator-thickness': State.FocusIndicator.Thickness,

    // Pressed
    'pressed-container-elevation': '0',
    'pressed-state-layer-color'  : Color.OnSurface,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,

    // Dragged
    'dragged-container-elevation': '3',
    'dragged-state-layer-color'  : Color.OnSurface,
    'dragged-state-layer-opacity': State.DraggedStateLayerOpacity,
})

export const OutlinedCardDefinition = createStyleDefinition({
    ...shared,
    'container-shape-start-start': Shape.Medium,
    'container-shape-start-end': Shape.Medium,
    'container-shape-end-start': Shape.Medium,
    'container-shape-end-end': Shape.Medium,
    'enabled-container-color'       : Color.Surface,
    'enabled-container-elevation'   : '0',
    'enabled-container-shadow-color': Color.Shadow,
    'enabled-outline-color'         : Color.OutlineVariant,
    'outline-width'                  : `1px`,
    'enabled-icon-color'            : Color.Primary,
    'icon-size'                      : `24px`,

    // Disabled
    'disabled-container-elevation': '0',
    'disabled-outline-color'      : Color.Outline,
    'disabled-outline-opacity'    : `0.12`,

    // Hovered
    'hovered-container-elevation': '1',
    'hovered-state-layer-color'  : Color.OnSurface,
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'hovered-outline-color'      : Color.OutlineVariant,

    // Focused
    'focused-container-elevation': '0',
    'focused-state-layer-color'  : Color.OnSurface,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'focused-outline-color'      : Color.OnSurface,
    'focused-indicator-color'    : Color.Secondary,
    'focused-indicator-offset'   : State.FocusIndicator.OuterOffset,
    'focused-indicator-thickness': State.FocusIndicator.Thickness,

    // Pressed
    'pressed-container-elevation': '0',
    'pressed-state-layer-color'  : Color.OnSurface,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,
    'pressed-outline-color'      : Color.OutlineVariant,

    // Dragged
    'dragged-container-elevation': '3',
    'dragged-state-layer-color'  : Color.OnSurface,
    'dragged-state-layer-opacity': State.DraggedStateLayerOpacity,
    'dragged-outline-color'      : Color.OutlineVariant,
})

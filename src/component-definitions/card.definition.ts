/**
* @license
* Copyright 2025 Kai-Orion & Sandlada
* SPDX-License-Identifier: MIT
*/

import { Color, ElevationLevel, Shape, State } from '@sandlada/mdk'
import { createLogicShapeTokens } from '../utils/tokens'

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

export const ElevatedCardDefinition = {
    ...shared,
    ...createLogicShapeTokens('--md-card', {
        'container-shape': Shape.Medium,
    }, 'all', false),
    'container-color'       : Color.SurfaceContainerLow,
    'container-elevation'   : ElevationLevel.Level1,
    'container-shadow-color': Color.Shadow,
    'icon-color'            : Color.Primary,
    'icon-size'             : `24px`,

    // Disabled
    'disabled-container-color'    : Color.Surface,
    'disabled-container-elevation': ElevationLevel.Level1,
    'disabled-container-opacity'  : `0.38`,

    // Hovered
    'hovered-container-elevation': ElevationLevel.Level2,
    'hovered-state-layer-color'  : Color.OnSurface,
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,

    // Focused
    'focused-container-elevation': ElevationLevel.Level1,
    'focused-state-layer-color'  : Color.OnSurface,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'focused-indicator-color'    : Color.Secondary,
    'focused-indicator-offset'   : State.FocusIndicator.OuterOffset,
    'focused-indicator-thickness': State.FocusIndicator.Thickness,

    // Pressed
    'pressed-container-elevation': ElevationLevel.Level1,
    'pressed-state-layer-color'  : Color.OnSurface,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,

    // Dragged
    'dragged-container-elevation': ElevationLevel.Level4,
    'dragged-state-layer-color'  : Color.OnSurface,
    'dragged-state-layer-opacity': State.DraggedStateLayerOpacity,
} as const

export const FilledCardDefinition = {
    ...shared,
    ...createLogicShapeTokens('--md-card', {
        'container-shape': Shape.Medium,
    }, 'all', false),
    'container-color'       : Color.SurfaceContainerHighest,
    'container-elevation'   : ElevationLevel.Level0,
    'container-shadow-color': Color.Shadow,
    'icon-color'            : Color.Primary,
    'icon-size'             : `24px`,

    // Disabled
    'disabled-container-color'    : Color.SurfaceVariant,
    'disabled-container-elevation': ElevationLevel.Level0,
    'disabled-container-opacity'  : `0.38`,

    // Hovered
    'hovered-container-elevation': ElevationLevel.Level1,
    'hovered-state-layer-color'  : Color.OnSurface,
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,

    // Focused
    'focused-container-elevation': ElevationLevel.Level0,
    'focused-state-layer-color'  : Color.OnSurface,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'focused-indicator-color'    : Color.Secondary,
    'focused-indicator-offset'   : State.FocusIndicator.OuterOffset,
    'focused-indicator-thickness': State.FocusIndicator.Thickness,

    // Pressed
    'pressed-container-elevation': ElevationLevel.Level0,
    'pressed-state-layer-color'  : Color.OnSurface,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,

    // Dragged
    'dragged-container-elevation': ElevationLevel.Level3,
    'dragged-state-layer-color'  : Color.OnSurface,
    'dragged-state-layer-opacity': State.DraggedStateLayerOpacity,
} as const

export const OutlinedCardDefinition = {
    ...shared,
    ...createLogicShapeTokens('--mdc-card', {
        'container-shape': Shape.Medium,
    }, 'all', false),
    'container-color'       : Color.Surface,
    'container-elevation'   : ElevationLevel.Level0,
    'container-shadow-color': Color.Shadow,
    'outline-color'         : Color.OutlineVariant,
    'outline-width'         : `1px`,
    'icon-color'            : Color.Primary,
    'icon-size'             : `24px`,

    // Disabled
    'disabled-container-elevation': ElevationLevel.Level0,
    'disabled-outline-color'      : Color.Outline,
    'disabled-outline-opacity'    : `0.12`,

    // Hovered
    'hovered-container-elevation': ElevationLevel.Level1,
    'hovered-state-layer-color'  : Color.OnSurface,
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'hovered-outline-color'      : Color.OutlineVariant,

    // Focused
    'focused-container-elevation': ElevationLevel.Level0,
    'focused-state-layer-color'  : Color.OnSurface,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'focused-outline-color'      : Color.OnSurface,
    'focused-indicator-color'    : Color.Secondary,
    'focused-indicator-offset'   : State.FocusIndicator.OuterOffset,
    'focused-indicator-thickness': State.FocusIndicator.Thickness,

    // Pressed
    'pressed-container-elevation': ElevationLevel.Level0,
    'pressed-state-layer-color'  : Color.OnSurface,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,
    'pressed-outline-color'      : Color.OutlineVariant,

    // Dragged
    'dragged-container-elevation': ElevationLevel.Level3,
    'dragged-state-layer-color'  : Color.OnSurface,
    'dragged-state-layer-opacity': State.DraggedStateLayerOpacity,
    'dragged-outline-color'      : Color.OutlineVariant,
} as const

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { ElevationLevel, Shape, State } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

const shared = {
    'container-shape-start-start': Shape.Medium,
    'container-shape-start-end'  : Shape.Medium,
    'container-shape-end-start'  : Shape.Medium,
    'container-shape-end-end'    : Shape.Medium,

    'container-shape-square-start-start': Shape.None,
    'container-shape-square-start-end'  : Shape.None,
    'container-shape-square-end-start'  : Shape.None,
    'container-shape-square-end-end'    : Shape.None,

    'container-padding-inline-start': `16px`,
    'container-padding-inline-end'  : `16px`,
    'container-padding-block-start' : `16px`,
    'container-padding-block-end'   : `16px`,
    'container-margin-inline-start' : `0px`,
    'container-margin-inline-end'   : `0px`,
    'container-margin-block-start'  : `0px`,
    'container-margin-block-end'    : `0px`,

    'enabled-icon-color': Color.Primary,
    'icon-size'         : `24px`,
} as const

export const ElevatedCardDefinition = createStyleDefinition({
    ...shared,

    'enabled-container-color'       : Color.SurfaceContainerLow,
    'enabled-container-elevation'   : ElevationLevel.Level1,
    'enabled-container-shadow-color': Color.Shadow,

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
})

export const FilledCardDefinition = createStyleDefinition({
    ...shared,

    'enabled-container-color'       : Color.SurfaceContainerHighest,
    'enabled-container-elevation'   : ElevationLevel.Level0,
    'enabled-container-shadow-color': Color.Shadow,

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
})

export const OutlinedCardDefinition = createStyleDefinition({
    ...shared,

    'enabled-container-color'       : Color.Surface,
    'enabled-container-elevation'   : ElevationLevel.Level0,
    'enabled-container-shadow-color': Color.Shadow,
    'enabled-outline-color'         : Color.OutlineVariant,
    'outline-width'                 : `1px`,

    // Disabled
    'disabled-container-color'    : Color.Surface,
    'disabled-container-elevation': ElevationLevel.Level0,
    'disabled-container-opacity'  : `0.38`,
    'disabled-outline-color'      : Color.Outline,
    'disabled-outline-opacity'    : `0.12`,

    // Hovered
    'hovered-container-elevation': ElevationLevel.Level1,
    'hovered-outline-color'      : Color.OutlineVariant,
    'hovered-state-layer-color'  : Color.OnSurface,
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,

    // Focused
    'focused-container-elevation': ElevationLevel.Level0,
    'focused-outline-color'      : Color.OnSurface,
    'focused-state-layer-color'  : Color.OnSurface,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'focused-indicator-color'    : Color.Secondary,
    'focused-indicator-offset'   : State.FocusIndicator.OuterOffset,
    'focused-indicator-thickness': State.FocusIndicator.Thickness,

    // Pressed
    'pressed-container-elevation': ElevationLevel.Level0,
    'pressed-outline-color'      : Color.OutlineVariant,
    'pressed-state-layer-color'  : Color.OnSurface,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,

    // Dragged
    'dragged-container-elevation': ElevationLevel.Level3,
    'dragged-outline-color'      : Color.OutlineVariant,
    'dragged-state-layer-color'  : Color.OnSurface,
    'dragged-state-layer-opacity': State.DraggedStateLayerOpacity,
})

export const CardDefinition = FilledCardDefinition

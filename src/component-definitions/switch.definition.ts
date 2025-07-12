/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Color, Shape, State } from '@sandlada/mdk'
import { createLogicShapeTokens } from '../utils/tokens'

export const SwitchDefinition = {
    ...createLogicShapeTokens('--mdc-switch', {
        'track-shape'      : Shape.Full,
        'handle-shape'     : Shape.Full,
        'state-layer-shape': Shape.Full
    }, 'all', false),
    'icon-color-selected'     : Color.OnPrimaryContainer,
    'icon-size-selected'      : `16px`,
    'icon-color-unselected'   : Color.SurfaceContainerHighest,
    'icon-size-unselected'    : `16px`,
    'track-height'            : `32px`,
    'track-width'             : `52px`,
    'track-outline-color'     : Color.Outline,
    'track-outline-width'     : `2px`,
    'track-color-selected'    : Color.Primary,
    'track-color-unselected'  : Color.SurfaceContainerHighest,
    'handle-height-selected'  : `24px`,
    'handle-height-unselected': `16px`,
    'with-icon-handle-height' : `24px`,
    'handle-width-selected'   : `24px`,
    'handle-width-unselected' : `16px`,
    'with-icon-handle-width'  : `24px`,
    'handle-color-selected'   : Color.OnPrimary,
    'handle-color-unselected' : Color.Outline,
    'state-layer-size'        : `40px`,

    // Disabled
    'disabled-icon-color-selected'           : Color.OnSurface,
    'disabled-icon-opacity-selected'         : `0.38`,
    'disabled-icon-color-unselected'         : Color.SurfaceContainerHighest,
    'disabled-icon-opacity-unselected'       : `0.38`,
    'disabled-track-opacity'                 : `0.12`,
    'disabled-track-color-selected'          : Color.OnSurface,
    'disabled-track-color-unselected'        : Color.SurfaceContainerHighest,
    'disabled-track-outline-color-unselected': Color.OnSurface,
    'disabled-handle-opacity-unselected'     : `0.38`,
    'disabled-handle-opacity-selected'       : `1`,
    'disabled-handle-color-selected'         : Color.Surface,
    'disabled-handle-color-unselected'       : Color.OnSurface,

    // Hovered
    'hovered-icon-color-selected'           : Color.OnPrimaryContainer,
    'hovered-icon-color-unselected'         : Color.SurfaceContainerHighest,
    'hovered-track-color-selected'          : Color.Primary,
    'hovered-state-layer-color-selected'    : Color.Primary,
    'hovered-state-layer-opacity-selected'  : State.HoveredStateLayerOpacity,
    'hovered-track-color-unselected'        : Color.SurfaceContainerHighest,
    'hovered-track-outline-color-unselected': Color.Outline,
    'hovered-state-layer-color-unselected'  : Color.OnSurface,
    'hovered-state-layer-opacity-unselected': State.HoveredStateLayerOpacity,
    'hovered-handle-color-selected'         : Color.PrimaryContainer,
    'hovered-handle-color-unselected'       : Color.OnSurfaceVariant,

    // Focused
    'focused-indicator-color'               : Color.Secondary,
    'focused-indicator-thickness'           : State.FocusIndicator.Thickness,
    'focused-indicator-offset'              : State.FocusIndicator.OuterOffset,
    'focused-icon-color-selected'           : Color.OnPrimaryContainer,
    'focused-icon-color-unselected'         : Color.SurfaceContainerHighest,
    'focused-track-color-selected'          : Color.Primary,
    'focused-state-layer-color-selected'    : Color.Primary,
    'focused-state-layer-opacity-selected'  : State.FocusedStateLayerOpacity,
    'focused-track-color-unselected'        : Color.SurfaceContainerHighest,
    'focused-track-outline-color-unselected': Color.Outline,
    'focused-state-layer-color-unselected'  : Color.OnSurface,
    'focused-state-layer-opacity-unselected': State.FocusedStateLayerOpacity,
    'focused-handle-color-selected'         : Color.PrimaryContainer,
    'focused-handle-color-unselected'       : Color.OnSurfaceVariant,

    // Pressed
    'pressed-icon-color-selected'           : Color.OnPrimaryContainer,
    'pressed-icon-color-unselected'         : Color.SurfaceContainerHighest,
    'pressed-track-color-selected'          : Color.Primary,
    'pressed-state-layer-color-selected'    : Color.Primary,
    'pressed-state-layer-opacity-selected'  : State.PressedStateLayerOpacity,
    'pressed-track-color-unselected'        : Color.SurfaceContainerHighest,
    'pressed-track-outline-color-unselected': Color.Outline,
    'pressed-state-layer-color-unselected'  : Color.OnSurface,
    'pressed-state-layer-opacity-unselected': State.PressedStateLayerOpacity,
    'pressed-handle-color-selected'         : Color.PrimaryContainer,
    'pressed-handle-color-unselected'       : Color.OnSurfaceVariant,
    'pressed-handle-height'                 : `28px`,
    'pressed-handle-width'                  : `28px`,
} as const

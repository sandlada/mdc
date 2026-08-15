/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape, State } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

export const CheckboxDefinition = createStyleDefinition({
    'container-shape-start-start'  : `2px`,
    'container-shape-start-end'    : `2px`,
    'container-shape-end-start'    : `2px`,
    'container-shape-end-end'      : `2px`,
    'state-layer-shape-start-start': Shape.Full,
    'state-layer-shape-start-end'  : Shape.Full,
    'state-layer-shape-end-start'  : Shape.Full,
    'state-layer-shape-end-end'    : Shape.Full,
    'focus-ring-shape-start-start' : Shape.Full,
    'focus-ring-shape-start-end'   : Shape.Full,
    'focus-ring-shape-end-start'   : Shape.Full,
    'focus-ring-shape-end-end'     : Shape.Full,

    // Enabled
    'enabled-container-size'                : '18px',
    'enabled-outline-color-unselected'      : Color.OnSurfaceVariant,
    'enabled-outline-width-unselected'      : '2px',
    'enabled-container-color-selected'      : Color.Primary,
    'enabled-outline-width-selected'        : '0px',
    'enabled-error-outline-color-unselected': Color.Error,
    'enabled-error-container-color-selected': Color.Error,
    'enabled-icon-size'                     : '18px',
    'enabled-icon-color-selected'           : Color.OnPrimary,
    'enabled-error-icon-color-selected'     : Color.OnError,
    'state-layer-size'                      : '40px',

    // Disabled
    'disabled-outline-color-unselected'    : Color.OnSurface,
    'disabled-outline-width-unselected'    : '2px',
    'disabled-container-opacity-unselected': '0.38',
    'disabled-container-color-selected'    : Color.OnSurface,
    'disabled-container-opacity-selected'  : '0.38',
    'disabled-outline-width-selected'      : '0',
    'disabled-icon-color-selected'         : Color.Surface,

    // Hovered
    'hovered-outline-color-unselected'      : Color.OnSurface,
    'hovered-outline-width-unselected'      : `2px`,
    'hovered-container-color-selected'      : Color.Primary,
    'hovered-outline-width-selected'        : `0px`,
    'hovered-error-outline-color-unselected': Color.Error,
    'hovered-error-container-color-selected': Color.Error,
    'hovered-state-layer-color-selected'    : Color.Primary,
    'hovered-state-layer-opacity-selected'  : State.HoveredStateLayerOpacity,
    'hovered-state-layer-color-unselected'  : Color.OnSurface,
    'hovered-state-layer-opacity-unselected': State.HoveredStateLayerOpacity,
    'hovered-error-state-layer-color'       : Color.Error,
    'hovered-error-state-layer-opacity'     : State.HoveredStateLayerOpacity,
    'hovered-icon-color-selected'           : Color.OnPrimary,
    'hovered-error-icon-color-selected'     : Color.OnError,

    // Focused
    'focused-indicator-color'               : Color.Secondary,
    'focused-indicator-thickness'           : State.FocusIndicator.Thickness,
    'focused-indicator-offset'              : State.FocusIndicator.OuterOffset,
    'focused-outline-color-unselected'      : Color.OnSurface,
    'focused-outline-width-unselected'      : `2px`,
    'focused-container-color-selected'      : Color.Primary,
    'focused-outline-width-selected'        : `0px`,
    'focused-error-outline-color-unselected': Color.Error,
    'focused-error-outline-color-selected'  : Color.Error,
    'focused-error-state-layer-opacity'     : State.FocusedStateLayerOpacity,
    'focused-state-layer-color-selected'    : Color.Primary,
    'focused-state-layer-opacity-selected'  : State.FocusedStateLayerOpacity,
    'focused-state-layer-color-unselected'  : Color.OnSurface,
    'focused-state-layer-opacity-unselected': State.FocusedStateLayerOpacity,
    'focused-error-state-layer-color'       : Color.Error,
    'focused-icon-color-selected'           : Color.OnPrimary,
    'focused-error-icon-color-selected'     : Color.OnError,

    // Pressed
    'pressed-outline-color-unselected'        : Color.OnSurface,
    'pressed-outline-width-unselected'        : `2px`,
    'pressed-container-color-selected'        : Color.Primary,
    'pressed-outline-width-selected'          : `0px`,
    'pressed-error-outline-color-unselected'  : Color.Error,
    'pressed-error-container-color-unselected': Color.Error,
    'pressed-state-layer-color-unselected'    : Color.Primary,
    'pressed-state-layer-opacity-unselected'  : State.PressedStateLayerOpacity,
    'pressed-state-layer-color-selected'      : Color.OnSurface,
    'pressed-state-layer-opacity-selected'    : State.PressedStateLayerOpacity,
    'pressed-error-state-layer-color'         : Color.Error,
    'pressed-error-state-layer-opacity'       : State.PressedStateLayerOpacity,
    'pressed-icon-color-selected'             : Color.OnPrimary,
    'pressed-error-icon-color-selected'       : Color.OnError,
})

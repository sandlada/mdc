/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape, State } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

export const CheckboxDefinition = createStyleDefinition({
    'container-shape-start-start': `2px`,
    'container-shape-start-end': `2px`,
    'container-shape-end-start': `2px`,
    'container-shape-end-end': `2px`,
    'state-layer-shape-start-start': Shape.Full,
    'state-layer-shape-start-end': Shape.Full,
    'state-layer-shape-end-start': Shape.Full,
    'state-layer-shape-end-end': Shape.Full,

    // Enabled
    'container-size'                : '18px',
    'unselected-outline-color'      : Color.OnSurfaceVariant,
    'unselected-outline-width'      : '2px',
    'selected-container-color'      : Color.Primary,
    'selected-outline-width'        : '0px',
    'unselected-error-outline-color': Color.Error,
    'selected-error-container-color': Color.Error,
    'icon-size'                     : '18px',
    'selected-icon-color'           : Color.OnPrimary,
    'selected-error-icon-color'     : Color.OnError,
    'state-layer-size'              : '40px',

    // Disabled
    'disabled-unselected-outline-color'    : Color.OnSurface,
    'disabled-unselected-outline-width'    : '2px',
    'disabled-unselected-container-opacity': '0.38',
    'disabled-selected-container-color'    : Color.OnSurface,
    'disabled-selected-container-opacity'  : '0.38',
    'disabled-selected-outline-width'      : '0',
    'disabled-selected-icon-color'         : Color.Surface,

    // Hovered
    'hovered-unselected-outline-color'      : Color.OnSurface,
    'hovered-unselected-outline-width'      : `2px`,
    'hovered-selected-container-color'      : Color.Primary,
    'hovered-selected-outline-width'        : `0px`,
    'hovered-unselected-error-outline-color': Color.Error,
    'hovered-selected-error-container-color': Color.Error,
    'hovered-selected-state-layer-color'    : Color.Primary,
    'hovered-selected-state-layer-opacity'  : State.HoveredStateLayerOpacity,
    'hovered-unselected-state-layer-color'  : Color.OnSurface,
    'hovered-unselected-state-layer-opacity': State.HoveredStateLayerOpacity,
    'hovered-error-state-layer-color'       : Color.Error,
    'hovered-error-state-layer-opacity'     : State.HoveredStateLayerOpacity,
    'hovered-selected-icon-color'           : Color.OnPrimary,
    'hovered-selected-error-icon-color'     : Color.OnError,

    // Focused
    'focused-indicator-color'               : Color.Secondary,
    'focused-indicator-thickness'           : State.FocusIndicator.Thickness,
    'focused-indicator-offset'              : State.FocusIndicator.OuterOffset,
    'focused-unselected-outline-color'      : Color.OnSurface,
    'focused-unselected-outline-width'      : `2px`,
    'focused-selected-container-color'      : Color.Primary,
    'focused-selected-outline-width'        : `0px`,
    'focused-unselected-error-outline-color': Color.Error,
    'focused-selected-error-outline-color'  : Color.Error,
    'focused-error-state-layer-opacity'     : State.FocusedStateLayerOpacity,
    'focused-selected-state-layer-color'    : Color.Primary,
    'focused-selected-state-layer-opacity'  : State.FocusedStateLayerOpacity,
    'focused-unselected-state-layer-color'  : Color.OnSurface,
    'focused-unselected-state-layer-opacity': State.FocusedStateLayerOpacity,
    'focused-error-state-layer-color'       : Color.Error,
    'focused-selected-icon-color'           : Color.OnPrimary,
    'focused-selected-error-icon-color'     : Color.OnError,

    // Pressed
    'pressed-unselected-outline-color'        : Color.OnSurface,
    'pressed-unselected-outline-width'        : `2px`,
    'pressed-selected-container-color'        : Color.Primary,
    'pressed-selected-outline-width'          : `0px`,
    'pressed-unselected-error-outline-color'  : Color.Error,
    'pressed-unselected-error-container-color': Color.Error,
    'pressed-unselected-state-layer-color'    : Color.Primary,
    'pressed-unselected-state-layer-opacity'  : State.PressedStateLayerOpacity,
    'pressed-selected-state-layer-color'      : Color.OnSurface,
    'pressed-selected-state-layer-opacity'    : State.PressedStateLayerOpacity,
    'pressed-error-state-layer-color'         : Color.Error,
    'pressed-error-state-layer-opacity'       : State.PressedStateLayerOpacity,
    'pressed-selected-icon-color'             : Color.OnPrimary,
    'pressed-selected-error-icon-color'       : Color.OnError,
})

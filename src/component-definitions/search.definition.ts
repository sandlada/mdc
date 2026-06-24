/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ElevationLevel, Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

export const SearchBarDefinition = createStyleDefinition({
    'container-inline-leading-space'       : `16px`,
    'container-inline-trailing-space'      : `16px`,
    'container-block-leading-space'        : `0px`,
    'container-block-trailing-space'       : `0px`,
    'container-width-minimum'              : `360px`,
    'container-width-maximum'              : `720px`,
    'leading-icon-and-label-between-space' : `16px`,
    'trailing-icon-and-label-between-space': `16px`,
    'trailing-icons-between-space'         : `16px`,

    'avatar-size'                : `30px`,
    'container-color'            : Color.SurfaceContainerHigh,
    'container-elevation'        : ElevationLevel.Level0,
    'container-height'           : `56px`,
    'leading-icon-color'         : Color.OnSurface,
    'trailing-icon-color'        : Color.OnSurfaceVariant,
    'supporting-text-color'      : Color.OnSurfaceVariant,
    'supporting-text-font'       : Typescale.BodyLarge.Font,
    'supporting-text-line-height': Typescale.BodyLarge.LineHeight,
    'supporting-text-size'       : Typescale.BodyLarge.FontSize,
    'supporting-text-weight'     : Typescale.BodyLarge.FontWeight,
    'supporting-text-tracking'   : Typescale.BodyLarge.Tracking,
    'input-text-color'           : Color.OnSurface,
    'input-text-font'            : Typescale.BodyLarge.Font,
    'input-text-line-height'     : Typescale.BodyLarge.LineHeight,
    'input-text-size'            : Typescale.BodyLarge.FontSize,
    'input-text-weight'          : Typescale.BodyLarge.FontWeight,
    'input-text-tracking'        : Typescale.BodyLarge.Tracking,
    // Hovered
    'hovered-state-layer-color'    : Color.OnSurface,
    'hovered-state-layer-opacity'  : State.HoveredStateLayerOpacity,
    'hovered-supporting-text-color': Color.OnSurfaceVariant,
    // Pressed
    'Pressed-state-layer-color'    : Color.OnSurface,
    'Pressed-state-layer-opacity'  : State.PressedStateLayerOpacity,
    'Pressed-supporting-text-color': Color.OnSurfaceVariant,
    // Focused
    'focused-indicator-color'    : Color.Secondary,
    'focused-indicator-thickness': State.FocusIndicator.Thickness,
    'focused-indicator-offset'   : State.FocusIndicator.OuterOffset,

    'avatar-shape'               : Shape.Full,
    'container-shape'            : Shape.Full,
})

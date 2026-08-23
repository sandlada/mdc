/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape, Space, State, Typescale } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

export const SearchBarDefinition = createStyleDefinition({
    'enabled-container-height'                       : `56px`,
    'enabled-container-color'                        : Color.SurfaceContainerHigh,
    'enabled-container-shape-start-start'            : Shape.Full,
    'enabled-container-shape-start-end'              : Shape.Full,
    'enabled-container-shape-end-start'              : Shape.Full,
    'enabled-container-shape-end-end'                : Shape.Full,
    'enabled-container-inline-leading-padding-space' : Space.Space100,
    'enabled-container-inline-trailing-padding-space': Space.Space100,
    'enabled-container-block-leading-padding-space'  : Space.Space100,
    'enabled-container-block-trailing-padding-space' : Space.Space100,
    'enabled-container-inline-leading-margin-space'  : Space.Space0,
    'enabled-container-inline-trailing-margin-space' : Space.Space0,
    'enabled-container-block-leading-margin-space'   : Space.Space0,
    'enabled-container-block-trailing-margin-space'  : Space.Space0,
    'enabled-container-items-gap'                    : `4px`,

    'enabled-leading-icon-color'                            : Color.OnSurfaceVariant,
    'enabled-leading-icon-size'                             : `24px`,
    'enabled-trailing-icon-color'                           : Color.OnSurfaceVariant,
    'enabled-trailing-icon-size'                            : `24px`,
    'enabled-avatar-size'                                   : `30px`,
    'enabled-avatar-label-color'                            : Color.OnPrimary,
    'enabled-avatar-color'                                  : Color.Primary,
    'enabled-avatar-shape-start-start'                      : Shape.Full,
    'enabled-avatar-shape-start-end'                        : Shape.Full,
    'enabled-avatar-shape-end-start'                        : Shape.Full,
    'enabled-avatar-shape-end-end'                          : Shape.Full,
    'enabled-avatar-container-width'                        : `48px`,
    'enabled-avatar-container-height'                       : `48px`,
    'enabled-avatar-container-shape-start-start'            : Shape.Full,
    'enabled-avatar-container-shape-start-end'              : Shape.Full,
    'enabled-avatar-container-shape-end-start'              : Shape.Full,
    'enabled-avatar-container-shape-end-end'                : Shape.Full,
    'enabled-avatar-container-inline-leading-padding-space' : Space.Space100,
    'enabled-avatar-container-inline-trailing-padding-space': Space.Space100,
    'enabled-avatar-container-block-leading-padding-space'  : Space.Space0,
    'enabled-avatar-container-block-trailing-padding-space' : Space.Space0,
    'enabled-avatar-container-inline-leading-margin-space'  : Space.Space0,
    'enabled-avatar-container-inline-trailing-margin-space' : Space.Space0,
    'enabled-avatar-container-block-leading-margin-space'   : Space.Space0,
    'enabled-avatar-container-block-trailing-margin-space'  : Space.Space0,

    'enabled-content-inline-leading-padding-space' : Space.Space250,
    'enabled-content-inline-trailing-padding-space': Space.Space250,
    'enabled-content-block-leading-padding-space'  : Space.Space250,
    'enabled-content-block-trailing-padding-space' : Space.Space250,
    'enabled-content-inline-leading-margin-space'  : Space.Space0,
    'enabled-content-inline-trailing-margin-space' : Space.Space0,
    'enabled-content-block-leading-margin-space'   : Space.Space0,
    'enabled-content-block-trailing-margin-space'  : Space.Space0,
    'enabled-supporting-text-color'                : Color.OnSurfaceVariant,
    'enabled-supporting-text-font'                 : Typescale.BodyLarge.Font,
    'enabled-supporting-text-line-height'          : Typescale.BodyLarge.LineHeight,
    'enabled-supporting-text-size'                 : Typescale.BodyLarge.FontSize,
    'enabled-supporting-text-weight'               : Typescale.BodyLarge.FontWeight,
    'enabled-supporting-text-tracking'             : Typescale.BodyLarge.Tracking,
    'enabled-input-text-color'                     : Color.OnSurface,
    'enabled-input-text-font'                      : Typescale.BodyLarge.Font,
    'enabled-input-text-line-height'               : Typescale.BodyLarge.LineHeight,
    'enabled-input-text-size'                      : Typescale.BodyLarge.FontSize,
    'enabled-input-text-weight'                    : Typescale.BodyLarge.FontWeight,
    'enabled-input-text-tracking'                  : Typescale.BodyLarge.Tracking,

    // Hovered
    'hovered-container-color'    : Color.SurfaceContainerHigh,
    'hovered-state-layer-color'  : Color.OnSurfaceVariant,
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    // Pressed
    'pressed-container-color'    : Color.SurfaceContainerHigh,
    'pressed-state-layer-color'  : Color.OnSurfaceVariant,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,

    // Focused
    'focused-indicator-color'    : Color.Secondary,
    'focused-indicator-thickness': State.FocusIndicator.Thickness,
    'focused-indicator-offset'   : State.FocusIndicator.OuterOffset,

})

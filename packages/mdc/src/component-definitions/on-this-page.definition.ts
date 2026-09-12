/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Style definitions for `mdc-on-this-page` and `mdc-on-this-page-item` per MD3/MD3E.
 */
import { Duration, Easing, Shape, Space, State, Typescale,  } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

export const OnThisPageDefinition = createStyleDefinition({
    'enabled-container-width'                               : '220px',
    'enabled-container-color'                               : 'transparent',
    'enabled-container-padding-inline-start'                : Space.Space0,
    'enabled-container-padding-inline-end'                  : Space.Space0,
    'enabled-container-padding-block-start'                 : Space.Space0,
    'enabled-container-padding-block-end'                   : Space.Space0,
    'enabled-container-item-gap'                            : Space.Space50,

    'enabled-caption-font'                                  : Typescale.LabelMedium.Font,
    'enabled-caption-size'                                  : Typescale.LabelMedium.FontSize,
    'enabled-caption-weight'                                : Typescale.LabelMedium.FontWeight,
    'enabled-caption-line-height'                           : Typescale.LabelMedium.LineHeight,
    'enabled-caption-tracking'                              : Typescale.LabelMedium.Tracking,
    'enabled-caption-color'                                 : Color.OnSurfaceVariant,

    'enabled-headline-font'                                 : Typescale.HeadlineSmall.Font,
    'enabled-headline-size'                                 : Typescale.HeadlineSmall.FontSize,
    'enabled-headline-weight'                               : Typescale.HeadlineSmall.FontWeight,
    'enabled-headline-line-height'                          : Typescale.HeadlineSmall.LineHeight,
    'enabled-headline-tracking'                             : Typescale.HeadlineSmall.Tracking,
    'enabled-headline-color'                                : Color.OnSurface,

    'enabled-header-block-trailing-space'                   : Space.Space200,

    'enabled-active-indicator-outline-color'                : Color.OnSurface,
    'enabled-active-indicator-outline-width'                : `1px`,
    'enabled-active-indicator-container-color'              : 'transparent',
    'enabled-active-indicator-shape-start-start'            : Shape.Full,
    'enabled-active-indicator-shape-start-end'              : Shape.Full,
    'enabled-active-indicator-shape-end-start'              : Shape.Full,
    'enabled-active-indicator-shape-end-end'                : Shape.Full,
    'active-indicator-transition-duration'                  : Duration.ExpressiveSlowSpatial,
    'active-indicator-transition-easing'                    : Easing.ExpressiveSlowSpatial,
})

export const OnThisPageItemDefinition = createStyleDefinition({
    'enabled-container-height'                              : '38px',
    'enabled-container-color'                               : 'transparent',
    'enabled-container-shape-start-start'                   : Shape.Full,
    'enabled-container-shape-start-end'                     : Shape.Full,
    'enabled-container-shape-end-start'                     : Shape.Full,
    'enabled-container-shape-end-end'                       : Shape.Full,
    'enabled-container-padding-inline-start'                : Space.Space200,
    'enabled-container-padding-inline-end'                  : Space.Space200,
    'enabled-container-padding-block-start'                 : Space.Space50,
    'enabled-container-padding-block-end'                   : Space.Space50,

    'enabled-label-font'                                    : Typescale.BodyMedium.Font,
    'enabled-label-size'                                    : Typescale.BodyMedium.FontSize,
    'enabled-label-line-height'                             : Typescale.BodyMedium.LineHeight,
    'enabled-label-weight'                                  : Typescale.BodyMedium.FontWeight,
    'enabled-label-tracking'                                : Typescale.BodyMedium.Tracking,
    'enabled-label-opacity'                                 : '1',
    'enabled-label-color-unselected'                        : Color.OnSurfaceVariant,
    'enabled-label-color-selected'                          : Color.OnSurface,
    'enabled-label-weight-selected'                         : Typescale.EmphasizedBodyMedium.FontWeight,

    'hovered-label-color'                                   : Color.OnSurface,
    'focused-label-color'                                   : Color.OnSurface,
    'pressed-label-color'                                   : Color.OnSurface,
    'disabled-label-color'                                  : Color.OnSurface,
    'disabled-label-opacity'                                : '0.38',

    'hovered-state-layer-color'                             : Color.OnSurface,
    'hovered-state-layer-opacity'                           : State.HoveredStateLayerOpacity,
    'pressed-state-layer-color'                             : Color.OnSurface,
    'pressed-state-layer-opacity'                           : State.PressedStateLayerOpacity,
})

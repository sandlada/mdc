/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 * 
 * @fileoverview
 * The values in this file are taken from M3 Figma. 
 * Some values are slightly adjusted and do not conform 
 * to the MD3 design specifications.
 * 
 * |---------------
 * |     container-block-leading-space
 * |
 * |  container-inline-leading-space   /`````````\
 * |  container-inline-leading-space  |    <----- indicator-inline/block-leading/trailing-space
 * |  container-inline-leading-space   \_________/
 * |
 * |_______________
 * 
 * @link
 * https://www.figma.com/design/4GM7ohCF2Qtjzs7Fra6jlp/Material-3-Design-Kit--Community-?node-id=55141-14251&p=f&t=Lo93bap9LHFqZ0Q1-0
 */

import { Color, Shape, State, Typescale } from '@sandlada/mdk'
import { createLogicShapeTokens } from '../utils'

const icon = {
    'icon-size': `24px`,
    'inactive-icon-color'        : Color.OnSurfaceVariant,
    'active-icon-color'          : Color.OnSecondaryContainer,
    'hovered-inactive-icon-color': Color.OnSurfaceVariant,
    'hovered-active-icon-color'  : Color.OnSecondaryContainer,
    'focused-inactive-icon-color': Color.OnSurfaceVariant,
    'focused-active-icon-color'  : Color.OnSecondaryContainer,
    'pressed-inactive-icon-color': Color.OnSurfaceVariant,
    'pressed-active-icon-color'  : Color.OnSecondaryContainer,
} as const

const stateLayer = {
    'hovered-item-active-state-layer-color'    : Color.OnSecondaryContainer,
    'hovered-item-active-state-layer-opacity'  : State.HoveredStateLayerOpacity,
    'hovered-item-inactive-state-layer-color'  : Color.OnSurfaceVariant,
    'hovered-item-inactive-state-layer-opacity': State.HoveredStateLayerOpacity,
    'focused-item-active-state-layer-color'    : Color.OnSecondaryContainer,
    'focused-item-active-state-layer-opacity'  : State.FocusedStateLayerOpacity,
    'focused-item-inactive-state-layer-color'  : Color.OnSurfaceVariant,
    'focused-item-inactive-state-layer-opacity': State.FocusedStateLayerOpacity,
    'pressed-item-active-state-layer-color'    : Color.OnSecondaryContainer,
    'pressed-item-active-state-layer-opacity'  : State.PressedStateLayerOpacity,
    'pressed-item-inactive-state-layer-color'  : Color.OnSurfaceVariant,
    'pressed-item-inactive-state-layer-opacity': State.PressedStateLayerOpacity,
} as const

const label = {
    'inactive-label-color'        : Color.OnSurfaceVariant,
    'hovered-inactive-label-color': Color.OnSurfaceVariant,
    'focused-inactive-label-color': Color.OnSurfaceVariant,
    'pressed-inactive-label-color': Color.OnSurfaceVariant,
    'active-label-color'          : Color.Secondary,
    'hovered-active-label-color'  : Color.Secondary,
    'focused-active-label-color'  : Color.Secondary,
    'pressed-active-label-color'  : Color.Secondary,
} as const

const container = {
    'inactive-indicator-color': `transparent`,
    'active-indicator-color'  : Color.SecondaryContainer,
    'horizonal-indicator-inline-leading-space': `16px`,
    'horizonal-indicator-inline-trailing-space': `16px`,
} as const

export const NavigationBarTabDefinition = {
    ...icon,
    ...stateLayer,
    ...label,
    ...container,

    'vertical-indicator-width'                : `56px`,
    'vertical-indicator-height'               : `32px`,
    'vertical-container-width'                : `104px`,
    'vertical-container-height'               : `64px`,
    'vertical-container-block-leading-space'  : `6px`,
    'vertical-container-block-trailing-space' : `6px`,
    'vertical-container-inline-leading-space' : `0px`,
    'vertical-container-inline-trailing-space': `0px`,
    
    'horizonal-indicator-width'                : `92px`,
    'horizonal-indicator-height'               : `40px`,
    'horizonal-container-width'                : `92px`,
    'horizonal-container-height'               : `64px`,
    'horizonal-container-block-leading-space'  : `12px`,
    'horizonal-container-block-trailing-space' : `12px`,
    'horizonal-container-inline-leading-space' : `0px`,
    'horizonal-container-inline-trailing-space': `0px`,

    'vertical-icon-label-between-space' : `4px`,
    'horizonal-icon-label-between-space': `4px`,

    'inactive-vertical-label-size'        : Typescale.LabelMediumSize,
    'inactive-vertical-label-line-height' : Typescale.LabelMediumLineHeight,
    'inactive-vertical-label-font'        : Typescale.LabelMediumFont,
    'inactive-vertical-label-tracking'    : Typescale.LabelMediumTracking,
    'inactive-vertical-label-font-weight' : Typescale.LabelMediumWeight,
    'inactive-horizonal-label-size'       : Typescale.LabelMediumSize,
    'inactive-horizonal-label-line-height': Typescale.LabelMediumLineHeight,
    'inactive-horizonal-label-font'       : Typescale.LabelMediumFont,
    'inactive-horizonal-label-tracking'   : Typescale.LabelMediumTracking,
    'inactive-horizonal-label-font-weight': Typescale.LabelMediumWeight,

    'active-vertical-label-size'        : Typescale.LabelMediumSize,
    'active-vertical-label-line-height' : Typescale.LabelMediumLineHeight,
    'active-vertical-label-font'        : Typescale.LabelMediumFont,
    'active-vertical-label-tracking'    : Typescale.LabelMediumTracking,
    'active-vertical-label-font-weight' : Typescale.LabelMediumWeight,
    'active-horizonal-label-size'       : Typescale.LabelMediumSize,
    'active-horizonal-label-line-height': Typescale.LabelMediumLineHeight,
    'active-horizonal-label-font'       : Typescale.LabelMediumFont,
    'active-horizonal-label-tracking'   : Typescale.LabelMediumTracking,
    'active-horizonal-label-font-weight': Typescale.LabelMediumWeight,
    
    ...createLogicShapeTokens('--mdc-navigation-bar-tab', {
        'vertical-indicator-shape': Shape.Full,
        'horizonal-indicator-shape': Shape.Full,
        'vertical-container-shape': Shape.Small,
        'horizonal-container-shape': Shape.Small,
    }, 'all', false)
} as const

export const NavigationRailTabDefinition = {
    ...icon,
    ...stateLayer,
    ...label,
    ...container,

    'vertical-indicator-width'                : `56px`,
    'vertical-indicator-height'               : `32px`,
    'vertical-container-width'                : `96px`,
    'vertical-container-height'               : `64px`,
    'vertical-container-block-leading-space'  : `6px`,
    'vertical-container-block-trailing-space' : `6px`,
    'vertical-container-inline-leading-space' : `0px`,
    'vertical-container-inline-trailing-space': `0px`,
    
    'horizonal-indicator-width'                : `99px`,
    'horizonal-indicator-height'               : `56px`,
    'horizonal-container-width'                : `99px`,
    'horizonal-container-height'               : `56px`,
    'horizonal-container-block-leading-space'  : `0px`,
    'horizonal-container-block-trailing-space' : `0px`,
    'horizonal-container-inline-leading-space' : `0px`,
    'horizonal-container-inline-trailing-space': `0px`,
    
    'vertical-round-indicator-size'                 : `56px`,
    'vertical-round-container-size'                 : `56px`,
    'vertical-round-block-leading-space'            : `4px`,
    'vertical-round-block-trailing-space'           : `4px`,
    'vertical-round-container-inline-leading-space' : `0px`,
    'vertical-round-container-inline-trailing-space': `0px`,

    'vertical-icon-label-between-space' : `4px`,
    'horizonal-icon-label-between-space': `12px`,

    'inactive-vertical-label-size'        : Typescale.LabelMediumSize,
    'inactive-vertical-label-line-height' : Typescale.LabelMediumLineHeight,
    'inactive-vertical-label-font'        : Typescale.LabelMediumFont,
    'inactive-vertical-label-tracking'    : Typescale.LabelMediumTracking,
    'inactive-vertical-label-font-weight' : Typescale.LabelMediumWeight,
    'inactive-horizonal-label-size'       : Typescale.LabelLargeSize,
    'inactive-horizonal-label-line-height': Typescale.LabelLargeLineHeight,
    'inactive-horizonal-label-font'       : Typescale.LabelLargeFont,
    'inactive-horizonal-label-tracking'   : Typescale.LabelLargeTracking,
    'inactive-horizonal-label-font-weight': Typescale.LabelLargeWeight,

    'active-vertical-label-size'        : Typescale.LabelMediumSize,
    'active-vertical-label-line-height' : Typescale.LabelMediumLineHeight,
    'active-vertical-label-font'        : Typescale.LabelMediumFont,
    'active-vertical-label-tracking'    : Typescale.LabelMediumTracking,
    'active-vertical-label-font-weight' : Typescale.LabelMediumWeight,
    'active-horizonal-label-size'       : Typescale.LabelLargeSize,
    'active-horizonal-label-line-height': Typescale.LabelLargeLineHeight,
    'active-horizonal-label-font'       : Typescale.LabelLargeFont,
    'active-horizonal-label-tracking'   : Typescale.LabelLargeTracking,
    'active-horizonal-label-font-weight': Typescale.LabelLargeWeight,

    ...createLogicShapeTokens('--mdc-navigation-rail-tab', {
        'vertical-indicator-shape': Shape.Full,
        'horizonal-indicator-shape': Shape.Full,
        'vertical-container-shape': Shape.Small,
        'horizonal-container-shape': Shape.Small,
    }, 'all', false)
} as const

export const NavigationBarXRTabDefinition = {
    ...icon,
    ...stateLayer,
    ...label,
    ...container,

    'vertical-indicator-width'                : `64px`,
    'vertical-indicator-height'               : `32px`,
    'vertical-container-width'                : `112px`,
    'vertical-container-height'               : `80px`,
    'vertical-container-block-leading-space'  : `12px`,
    'vertical-container-block-trailing-space' : `16px`,
    'vertical-container-inline-leading-space' : `0px`,
    'vertical-container-inline-trailing-space': `0px`,
    'vertical-icon-label-between-space'       : `4px`,

    'inactive-vertical-label-size'       : Typescale.LabelMediumSize,
    'inactive-vertical-label-line-height': Typescale.LabelMediumLineHeight,
    'inactive-vertical-label-font'       : Typescale.LabelMediumFont,
    'inactive-vertical-label-tracking'   : Typescale.LabelMediumTracking,
    'inactive-vertical-label-font-weight': Typescale.LabelMediumWeight,

    'active-vertical-label-size'       : Typescale.EmphasizedLabelMediumSize,
    'active-vertical-label-line-height': Typescale.EmphasizedLabelMediumLineHeight,
    'active-vertical-label-font'       : Typescale.EmphasizedLabelMediumFont,
    'active-vertical-label-tracking'   : Typescale.EmphasizedLabelMediumTracking,
    'active-vertical-label-font-weight': Typescale.EmphasizedLabelMediumWeight,

    ...createLogicShapeTokens('--mdc-navigation-bar-xr-tab', {
        'vertical-indicator-shape': Shape.Full,
        'vertical-container-shape': Shape.Small,
    }, 'all', false)
} as const

export const NavigationRailXRTabDefinition = {
    ...icon,
    ...stateLayer,
    ...label,
    ...container,

    'vertical-indicator-width'                : `56px`,
    'vertical-indicator-height'               : `32px`,
    'vertical-container-width'                : `56px`,
    'vertical-container-height'               : `56px`,
    'vertical-container-block-leading-space'  : `0px`,
    'vertical-container-block-trailing-space' : `4px`,
    'vertical-container-inline-leading-space' : `2px`,
    'vertical-container-inline-trailing-space': `2px`,
    'vertical-icon-label-between-space'       : `4px`,
 
    'vertical-round-indicator-size'                 : `56px`,
    'vertical-round-container-size'                 : `56px`,
    'vertical-round-container-block-leading-space'  : `0px`,
    'vertical-round-container-block-trailing-space' : `0px`,
    'vertical-round-container-inline-leading-space' : `0px`,
    'vertical-round-container-inline-trailing-space': `0px`,

    'inactive-vertical-label-size'       : Typescale.LabelMediumSize,
    'inactive-vertical-label-line-height': Typescale.LabelMediumLineHeight,
    'inactive-vertical-label-font'       : Typescale.LabelMediumFont,
    'inactive-vertical-label-tracking'   : Typescale.LabelMediumTracking,
    'inactive-vertical-label-font-weight': Typescale.LabelMediumWeight,

    'active-vertical-label-size'       : Typescale.EmphasizedLabelMediumSize,
    'active-vertical-label-line-height': Typescale.EmphasizedLabelMediumLineHeight,
    'active-vertical-label-font'       : Typescale.EmphasizedLabelMediumFont,
    'active-vertical-label-tracking'   : Typescale.EmphasizedLabelMediumTracking,
    'active-vertical-label-font-weight': Typescale.EmphasizedLabelMediumWeight,

    ...createLogicShapeTokens('--mdc-navigation-rail-xr-tab', {
        'vertical-indicator-shape': Shape.Full,
        'vertical-container-shape': Shape.Small,
    }, 'all', false)
} as const

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
 * |--------------- borderless
 * |  container-padding-block-start
 * |
 * |  container-padding-inline-start   /`````````\
 * |  container-padding-inline-start  |    <----- indicator-inline/block-start/end
 * |  container-padding-inline-start   \_________/
 * |
 * |                                    Tab  Label
 * |
 * |  container-padding-block-end
 * |_______________
 *
 * @example
 * ```html
 * <tab>
 *     <indicator />
 *     <icon-container>
 *         <state-layer>
 *             <icon />
 *        </state-layer>
 *     </icon-container>
 *     <label />
 * </tab>
 * ```
 *
 * @link
 * https://www.figma.com/community/file/1035203688168086460
 * https://www.figma.com/design/4GM7ohCF2Qtjzs7Fra6jlp/Material-3-Design-Kit--Community-?node-id=55141-14251&p=f&t=Lo93bap9LHFqZ0Q1-0
 */

import { Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition } from '../../utils/style'

const DefaultScheme = {
    'icon-size'            : { enabled: `24px`, hovered: `24px`, focused: `24px`, pressed: `24px`, disabled: `24px` },
    'unselected-icon-color': { enabled: Color.OnSurfaceVariant, hovered: Color.OnSurface, focused: Color.OnSurface, pressed: Color.OnSurfaceVariant, disabled: Color.Outline },
    'selected-icon-color'  : { enabled: Color.OnSecondaryContainer, hovered: Color.OnSurface, focused: Color.OnSurface, pressed: Color.OnSecondaryContainer, disabled: Color.Outline },

    'icon-container-height'              : { enabled: `32px`, hovered: `32px`, focused: `32px`, pressed: `32px`, disabled: `32px` },
    'icon-container-width'               : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'icon-container-padding-block-start' : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'icon-container-padding-block-end'   : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'icon-container-padding-inline-start': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'icon-container-padding-inline-end'  : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'icon-container-shape-start-start'   : { enabled: Shape.Full, hovered: Shape.Full, focused: Shape.Full, pressed: Shape.Full, disabled: Shape.Full },
    'icon-container-shape-start-end'     : { enabled: Shape.Full, hovered: Shape.Full, focused: Shape.Full, pressed: Shape.Full, disabled: Shape.Full },
    'icon-container-shape-end-start'     : { enabled: Shape.Full, hovered: Shape.Full, focused: Shape.Full, pressed: Shape.Full, disabled: Shape.Full },
    'icon-container-shape-end-end'       : { enabled: Shape.Full, hovered: Shape.Full, focused: Shape.Full, pressed: Shape.Full, disabled: Shape.Full },

    'unselected-indicator-color' : { enabled: `transparent`, hovered: `transparent`, focused: `transparent`, pressed: `transparent`, disabled: `transparent` },
    'selected-indicator-color'   : { enabled: Color.SecondaryContainer, hovered: Color.SecondaryContainer, focused: Color.SecondaryContainer, pressed: Color.SecondaryContainer, disabled: Color.OutlineVariant },
    'indicator-height'           : { enabled: `32px`, hovered: `32px`, focused: `32px`, pressed: `32px`, disabled: `32px` },
    'indicator-width'            : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'indicator-shape-start-start': { enabled: Shape.Full, hovered: Shape.Full, focused: Shape.Full, pressed: Shape.Full, disabled: Shape.Full },
    'indicator-shape-start-end'  : { enabled: Shape.Full, hovered: Shape.Full, focused: Shape.Full, pressed: Shape.Full, disabled: Shape.Full },
    'indicator-shape-end-start'  : { enabled: Shape.Full, hovered: Shape.Full, focused: Shape.Full, pressed: Shape.Full, disabled: Shape.Full },
    'indicator-shape-end-end'    : { enabled: Shape.Full, hovered: Shape.Full, focused: Shape.Full, pressed: Shape.Full, disabled: Shape.Full },

    'unselected-label-color'      : { enabled: Color.OnSurfaceVariant, hovered: Color.OnSurface, focused: Color.OnSurface, pressed: Color.OnSurfaceVariant, disabled: Color.Outline },
    'selected-label-color'        : { enabled: Color.Secondary, hovered: Color.OnSurface, focused: Color.OnSurface, pressed: Color.Secondary, disabled: Color.Outline },
    'unselected-label-size'       : { enabled: Typescale.LabelMedium.FontSize, hovered: Typescale.LabelMedium.FontSize, focused: Typescale.LabelMedium.FontSize, pressed: Typescale.LabelMedium.FontSize, disabled: Typescale.LabelMedium.FontSize },
    'selected-label-size'         : { enabled: Typescale.LabelMedium.FontSize, hovered: Typescale.LabelMedium.FontSize, focused: Typescale.LabelMedium.FontSize, pressed: Typescale.LabelMedium.FontSize, disabled: Typescale.LabelMedium.FontSize },
    'unselected-label-line-height': { enabled: Typescale.LabelMedium.LineHeight, hovered: Typescale.LabelMedium.LineHeight, focused: Typescale.LabelMedium.LineHeight, pressed: Typescale.LabelMedium.LineHeight, disabled: Typescale.LabelMedium.LineHeight },
    'selected-label-line-height'  : { enabled: Typescale.LabelMedium.LineHeight, hovered: Typescale.LabelMedium.LineHeight, focused: Typescale.LabelMedium.LineHeight, pressed: Typescale.LabelMedium.LineHeight, disabled: Typescale.LabelMedium.LineHeight },
    'unselected-label-font'       : { enabled: Typescale.LabelMedium.Font, hovered: Typescale.LabelMedium.Font, focused: Typescale.LabelMedium.Font, pressed: Typescale.LabelMedium.Font, disabled: Typescale.LabelMedium.Font },
    'selected-label-font'         : { enabled: Typescale.LabelMedium.Font, hovered: Typescale.LabelMedium.Font, focused: Typescale.LabelMedium.Font, pressed: Typescale.LabelMedium.Font, disabled: Typescale.LabelMedium.Font },
    'unselected-label-tracking'   : { enabled: Typescale.LabelMedium.Tracking, hovered: Typescale.LabelMedium.Tracking, focused: Typescale.LabelMedium.Tracking, pressed: Typescale.LabelMedium.Tracking, disabled: Typescale.LabelMedium.Tracking },
    'selected-label-tracking'     : { enabled: Typescale.LabelMedium.Tracking, hovered: Typescale.LabelMedium.Tracking, focused: Typescale.LabelMedium.Tracking, pressed: Typescale.LabelMedium.Tracking, disabled: Typescale.LabelMedium.Tracking },
    'unselected-label-weight'     : { enabled: Typescale.LabelMedium.FontWeight, hovered: Typescale.LabelMedium.FontWeight, focused: Typescale.LabelMedium.FontWeight, pressed: Typescale.LabelMedium.FontWeight, disabled: Typescale.LabelMedium.FontWeight },
    'selected-label-weight'       : { enabled: Typescale.LabelMedium.FontWeight, hovered: Typescale.LabelMedium.FontWeight, focused: Typescale.LabelMedium.FontWeight, pressed: Typescale.LabelMedium.FontWeight, disabled: Typescale.LabelMedium.FontWeight },

    'badge-color'                     : { enabled: Color.Error, hovered: Color.Error, focused: Color.Error, pressed: Color.Error, disabled: Color.SurfaceVariant },
    'small-badge-height'              : { enabled: `6px`, hovered: `6px`, focused: `6px`, pressed: `6px`, disabled: `6px` },
    'small-badge-width'               : { enabled: `6px`, hovered: `6px`, focused: `6px`, pressed: `6px`, disabled: `6px` },
    'small-badge-padding-inline-start': { enabled: `2px`, hovered: `2px`, focused: `2px`, pressed: `2px`, disabled: `2px` },
    'small-badge-padding-inline-end'  : { enabled: `2px`, hovered: `2px`, focused: `2px`, pressed: `2px`, disabled: `2px` },
    'small-badge-padding-block-start' : { enabled: `2px`, hovered: `2px`, focused: `2px`, pressed: `2px`, disabled: `2px` },
    'small-badge-padding-block-end'   : { enabled: `2px`, hovered: `2px`, focused: `2px`, pressed: `2px`, disabled: `2px` },
    'large-badge-label-color'         : { enabled: Color.OnError, hovered: Color.OnError, focused: Color.OnError, pressed: Color.OnError, disabled: Color.OnSurfaceVariant },
    'large-badge-height'              : { enabled: `16px`, hovered: `16px`, focused: `16px`, pressed: `16px`, disabled: `16px` },
    'large-badge-width'               : { enabled: `16px`, hovered: `16px`, focused: `16px`, pressed: `16px`, disabled: `16px` },
    'large-badge-padding-inline-start': { enabled: `4px`, hovered: `4px`, focused: `4px`, pressed: `4px`, disabled: `4px` },
    'large-badge-padding-inline-end'  : { enabled: `4px`, hovered: `4px`, focused: `4px`, pressed: `4px`, disabled: `4px` },
    'large-badge-padding-block-start' : { enabled: `2px`, hovered: `2px`, focused: `2px`, pressed: `2px`, disabled: `2px` },
    'large-badge-padding-block-end'   : { enabled: `2px`, hovered: `2px`, focused: `2px`, pressed: `2px`, disabled: `2px` },
    'large-badge-label-size'          : { enabled: Typescale.LabelSmall.FontSize, hovered: Typescale.LabelSmall.FontSize, focused: Typescale.LabelSmall.FontSize, pressed: Typescale.LabelSmall.FontSize, disabled: Typescale.LabelSmall.FontSize },
    'large-badge-label-line-height'   : { enabled: Typescale.LabelSmall.LineHeight, hovered: Typescale.LabelSmall.LineHeight, focused: Typescale.LabelSmall.LineHeight, pressed: Typescale.LabelSmall.LineHeight, disabled: Typescale.LabelSmall.LineHeight },
    'large-badge-label-font'          : { enabled: Typescale.LabelSmall.Font, hovered: Typescale.LabelSmall.Font, focused: Typescale.LabelSmall.Font, pressed: Typescale.LabelSmall.Font, disabled: Typescale.LabelSmall.Font },
    'large-badge-label-tracking'      : { enabled: Typescale.LabelSmall.Tracking, hovered: Typescale.LabelSmall.Tracking, focused: Typescale.LabelSmall.Tracking, pressed: Typescale.LabelSmall.Tracking, disabled: Typescale.LabelSmall.Tracking },
    'large-badge-label-weight'        : { enabled: Typescale.LabelSmall.FontWeight, hovered: Typescale.LabelSmall.FontWeight, focused: Typescale.LabelSmall.FontWeight, pressed: Typescale.LabelSmall.FontWeight, disabled: Typescale.LabelSmall.FontWeight },

    'unselected-state-layer-color': { enabled: Color.OnSurface, hovered: Color.OnSurface, focused: Color.OnSurface, pressed: Color.OnSurface },
    'selected-state-layer-color'  : { enabled: Color.OnSecondaryContainer, hovered: Color.OnSecondaryContainer, focused: Color.OnSecondaryContainer, pressed: Color.OnSecondaryContainer },

    'unselected-state-layer-opacity': { enabled: `0`, hovered: State.HoveredStateLayerOpacity, focused: State.FocusedStateLayerOpacity, pressed: State.PressedStateLayerOpacity, disabled: State.DisabledStateLayerOpacity },
    'selected-state-layer-opacity'  : { enabled: `0`, hovered: State.HoveredStateLayerOpacity, focused: State.FocusedStateLayerOpacity, pressed: State.PressedStateLayerOpacity, disabled: State.DisabledStateLayerOpacity },

    'container-height'              : { enabled: `64px`, hovered: `64px`, focused: `64px`, pressed: `64px`, disabled: `64px` },
    'container-width'               : { enabled: `104px`, hovered: `104px`, focused: `104px`, pressed: `104px`, disabled: `104px` },
    'container-padding-inline-start': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-end'  : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-block-start' : { enabled: `6px`, hovered: `6px`, focused: `6px`, pressed: `6px`, disabled: `6px` },
    'container-padding-block-end'   : { enabled: `6px`, hovered: `6px`, focused: `6px`, pressed: `6px`, disabled: `6px` },
    'spacing-between-icon-and-label': { enabled: `4px`, hovered: `4px`, focused: `4px`, pressed: `4px`, disabled: `4px` },
} as const

export const NavigationBarVerticalTabDefinition = createStyleDefinition(DefaultScheme)

export const NavigationBarHorizontalTabDefinition = createStyleDefinition({
    ...DefaultScheme,
    'container-height': { enabled: `64px`, hovered: `64px`, focused: `64px`, pressed: `64px`, disabled: `64px` },
    'container-width' : { enabled: `92px`, hovered: `92px`, focused: `92px`, pressed: `92px`, disabled: `92px` },
    'container-padding-block-start' : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-block-end'   : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-start': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-end'  : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },

    'icon-container-height'              : { enabled: `40px`, hovered: `40px`, focused: `40px`, pressed: `40px`, disabled: `40px` },
    'icon-container-width'               : { enabled: `92px`, hovered: `92px`, focused: `92px`, pressed: `92px`, disabled: `92px` },
    'icon-container-padding-block-start' : { enabled: `8px`, hovered: `8px`, focused: `8px`, pressed: `8px`, disabled: `8px` },
    'icon-container-padding-block-end'   : { enabled: `8px`, hovered: `8px`, focused: `8px`, pressed: `8px`, disabled: `8px` },
    'icon-container-padding-inline-start': { enabled: `16px`, hovered: `16px`, focused: `16px`, pressed: `16px`, disabled: `16px` },
    'icon-container-padding-inline-end'  : { enabled: `16px`, hovered: `16px`, focused: `16px`, pressed: `16px`, disabled: `16px` },

    'indicator-height'              : { enabled: `40px`, hovered: `40px`, focused: `40px`, pressed: `40px`, disabled: `40px` },
    'indicator-width'               : { enabled: `92px`, hovered: `92px`, focused: `92px`, pressed: `92px`, disabled: `92px` },
    'spacing-between-icon-and-label': { enabled: `4px`, hovered: `4px`, focused: `4px`, pressed: `4px`, disabled: `4px` },
})

export const NavigationBarXRVerticalTabDefinition = createStyleDefinition({
    ...DefaultScheme,
    'container-height': { enabled: `80px`, hovered: `80px`, focused: `80px`, pressed: `80px`, disabled: `80px` },
    'container-width' : { enabled: `64px`, hovered: `64px`, focused: `64px`, pressed: `64px`, disabled: `64px` },
    'container-padding-block-start' : { enabled: `12px`, hovered: `12px`, focused: `12px`, pressed: `12px`, disabled: `12px` },
    'container-padding-block-end'   : { enabled: `16px`, hovered: `16px`, focused: `16px`, pressed: `16px`, disabled: `16px` },
    'container-padding-inline-start': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-end'  : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'icon-container-height': { enabled: `32px`, hovered: `32px`, focused: `32px`, pressed: `32px`, disabled: `32px` },
    'icon-container-width' : { enabled: `64px`, hovered: `64px`, focused: `64px`, pressed: `64px`, disabled: `64px` },
    'indicator-height'     : { enabled: `32px`, hovered: `32px`, focused: `32px`, pressed: `32px`, disabled: `32px` },
    'indicator-width'      : { enabled: `64px`, hovered: `64px`, focused: `64px`, pressed: `64px`, disabled: `64px` },
    'spacing-between-icon-and-label': { enabled: `4px`, hovered: `4px`, focused: `4px`, pressed: `4px`, disabled: `4px` },
})

export const NavigationRailVerticalTabDefinition = createStyleDefinition({
    ...DefaultScheme,
    'container-height': { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'container-width' : { enabled: `80px`, hovered: `80px`, focused: `80px`, pressed: `80px`, disabled: `80px` },
    'container-padding-block-start' : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-block-end'   : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-start': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-end'  : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },

    'icon-container-height': { enabled: `32px`, hovered: `32px`, focused: `32px`, pressed: `32px`, disabled: `32px` },
    'icon-container-width' : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'icon-container-padding-inline-start': { enabled: `12px`, hovered: `12px`, focused: `12px`, pressed: `12px`, disabled: `12px` },
    'icon-container-padding-inline-end'  : { enabled: `12px`, hovered: `12px`, focused: `12px`, pressed: `12px`, disabled: `12px` },

    'indicator-height': { enabled: `32px`, hovered: `32px`, focused: `32px`, pressed: `32px`, disabled: `32px` },
    'indicator-width' : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'spacing-between-icon-and-label': { enabled: `4px`, hovered: `4px`, focused: `4px`, pressed: `4px`, disabled: `4px` },
})

export const NavigationRailHorizontalTabDefinition = createStyleDefinition({
    ...DefaultScheme,
    'container-height': { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'container-width' : { enabled: `100%`, hovered: `100%`, focused: `100%`, pressed: `100%`, disabled: `100%` },
    'container-padding-block-start' : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-block-end'   : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-start': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-end'  : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },

    'icon-container-height': { enabled: `24px`, hovered: `24px`, focused: `24px`, pressed: `24px`, disabled: `24px` },
    'icon-container-width' : { enabled: `24px`, hovered: `24px`, focused: `24px`, pressed: `24px`, disabled: `24px` },
    'icon-container-padding-inline-start': { enabled: `16px`, hovered: `16px`, focused: `16px`, pressed: `16px`, disabled: `16px` },
    'icon-container-padding-inline-end'  : { enabled: `16px`, hovered: `16px`, focused: `16px`, pressed: `16px`, disabled: `16px` },

    'indicator-height': { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'indicator-width' : { enabled: `100%`, hovered: `100%`, focused: `100%`, pressed: `100%`, disabled: `100%` },
    'spacing-between-icon-and-label': { enabled: `12px`, hovered: `12px`, focused: `12px`, pressed: `12px`, disabled: `12px` },

    'unselected-label-size'       : { enabled: Typescale.LabelLarge.FontSize, hovered: Typescale.LabelLarge.FontSize, focused: Typescale.LabelLarge.FontSize, pressed: Typescale.LabelLarge.FontSize, disabled: Typescale.LabelLarge.FontSize },
    'selected-label-size'         : { enabled: Typescale.LabelLarge.FontSize, hovered: Typescale.LabelLarge.FontSize, focused: Typescale.LabelLarge.FontSize, pressed: Typescale.LabelLarge.FontSize, disabled: Typescale.LabelLarge.FontSize },
    'unselected-label-line-height': { enabled: Typescale.LabelLarge.LineHeight, hovered: Typescale.LabelLarge.LineHeight, focused: Typescale.LabelLarge.LineHeight, pressed: Typescale.LabelLarge.LineHeight, disabled: Typescale.LabelLarge.LineHeight },
    'selected-label-line-height'  : { enabled: Typescale.LabelLarge.LineHeight, hovered: Typescale.LabelLarge.LineHeight, focused: Typescale.LabelLarge.LineHeight, pressed: Typescale.LabelLarge.LineHeight, disabled: Typescale.LabelLarge.LineHeight },
    'unselected-label-font'       : { enabled: Typescale.LabelLarge.Font, hovered: Typescale.LabelLarge.Font, focused: Typescale.LabelLarge.Font, pressed: Typescale.LabelLarge.Font, disabled: Typescale.LabelLarge.Font },
    'selected-label-font'         : { enabled: Typescale.LabelLarge.Font, hovered: Typescale.LabelLarge.Font, focused: Typescale.LabelLarge.Font, pressed: Typescale.LabelLarge.Font, disabled: Typescale.LabelLarge.Font },
    'unselected-label-tracking'   : { enabled: Typescale.LabelLarge.Tracking, hovered: Typescale.LabelLarge.Tracking, focused: Typescale.LabelLarge.Tracking, pressed: Typescale.LabelLarge.Tracking, disabled: Typescale.LabelLarge.Tracking },
    'selected-label-tracking'     : { enabled: Typescale.LabelLarge.Tracking, hovered: Typescale.LabelLarge.Tracking, focused: Typescale.LabelLarge.Tracking, pressed: Typescale.LabelLarge.Tracking, disabled: Typescale.LabelLarge.Tracking },
    'unselected-label-weight'     : { enabled: Typescale.LabelLarge.FontWeight, hovered: Typescale.LabelLarge.FontWeight, focused: Typescale.LabelLarge.FontWeight, pressed: Typescale.LabelLarge.FontWeight, disabled: Typescale.LabelLarge.FontWeight },
    'selected-label-weight'       : { enabled: Typescale.LabelLarge.FontWeight, hovered: Typescale.LabelLarge.FontWeight, focused: Typescale.LabelLarge.FontWeight, pressed: Typescale.LabelLarge.FontWeight, disabled: Typescale.LabelLarge.FontWeight },
})

export const NavigationRailRoundTabDefinition = createStyleDefinition({
    ...DefaultScheme,
    'container-height': { enabled: `64px`, hovered: `64px`, focused: `64px`, pressed: `64px`, disabled: `64px` },
    'container-width' : { enabled: `80px`, hovered: `80px`, focused: `80px`, pressed: `80px`, disabled: `80px` },
    'container-padding-block-start' : { enabled: `4px`, hovered: `4px`, focused: `4px`, pressed: `4px`, disabled: `4px` },
    'container-padding-block-end'   : { enabled: `4px`, hovered: `4px`, focused: `4px`, pressed: `4px`, disabled: `4px` },
    'container-padding-inline-start': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-end'  : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },

    'icon-container-height': { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'icon-container-width' : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'indicator-height'     : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'indicator-width'      : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'spacing-between-icon-and-label': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
})

export const NavigationRailXRVerticalTabDefinition = createStyleDefinition({
    ...DefaultScheme,
    'container-height': { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'container-width' : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'container-padding-block-start' : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-block-end'   : { enabled: `4px`, hovered: `4px`, focused: `4px`, pressed: `4px`, disabled: `4px` },
    'container-padding-inline-start': { enabled: `2px`, hovered: `2px`, focused: `2px`, pressed: `2px`, disabled: `2px` },
    'container-padding-inline-end'  : { enabled: `2px`, hovered: `2px`, focused: `2px`, pressed: `2px`, disabled: `2px` },
    'icon-container-height': { enabled: `32px`, hovered: `32px`, focused: `32px`, pressed: `32px`, disabled: `32px` },
    'icon-container-width' : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'indicator-height'     : { enabled: `32px`, hovered: `32px`, focused: `32px`, pressed: `32px`, disabled: `32px` },
    'indicator-width'      : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'spacing-between-icon-and-label': { enabled: `4px`, hovered: `4px`, focused: `4px`, pressed: `4px`, disabled: `4px` },
})

export const NavigationRailXRRoundTabDefinition = createStyleDefinition({
    ...DefaultScheme,
    'container-height': { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'container-width' : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'container-padding-block-start' : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-block-end'   : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-start': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-end'  : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'icon-container-height': { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'icon-container-width' : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'indicator-height'     : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'indicator-width'      : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'spacing-between-icon-and-label': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
})

export const NavigationDrawerTabDefinition = createStyleDefinition({
    ...DefaultScheme,
    'container-height': { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'container-width' : { enabled: `336px`, hovered: `336px`, focused: `336px`, pressed: `336px`, disabled: `336px` },
    'container-padding-block-start' : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-block-end'   : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-start': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-end'  : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },

    'icon-size'                          : { enabled: `24px`, hovered: `24px`, focused: `24px`, pressed: `24px`, disabled: `24px` },
    'icon-container-height'              : { enabled: `24px`, hovered: `24px`, focused: `24px`, pressed: `24px`, disabled: `24px` },
    'icon-container-width'               : { enabled: `24px`, hovered: `24px`, focused: `24px`, pressed: `24px`, disabled: `24px` },
    'icon-container-padding-inline-start': { enabled: `16px`, hovered: `16px`, focused: `16px`, pressed: `16px`, disabled: `16px` },
    'icon-container-padding-inline-end'  : { enabled: `16px`, hovered: `16px`, focused: `16px`, pressed: `16px`, disabled: `16px` },

    'indicator-height': { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'indicator-width' : { enabled: `336px`, hovered: `336px`, focused: `336px`, pressed: `336px`, disabled: `336px` },
    'spacing-between-icon-and-label': { enabled: `12px`, hovered: `12px`, focused: `12px`, pressed: `12px`, disabled: `12px` },

    'unselected-icon-color': { enabled: Color.OnSurfaceVariant, hovered: Color.OnSurfaceVariant, focused: Color.OnSurfaceVariant, pressed: Color.OnSurfaceVariant, disabled: Color.Outline },
    'selected-icon-color'  : { enabled: Color.OnSecondaryContainer, hovered: Color.OnSecondaryContainer, focused: Color.OnSecondaryContainer, pressed: Color.OnSecondaryContainer, disabled: Color.Outline },
    'unselected-label-color': { enabled: Color.OnSurfaceVariant, hovered: Color.OnSurfaceVariant, focused: Color.OnSurfaceVariant, pressed: Color.OnSurfaceVariant, disabled: Color.Outline },
    'selected-label-color'  : { enabled: Color.OnSecondaryContainer, hovered: Color.OnSecondaryContainer, focused: Color.OnSecondaryContainer, pressed: Color.OnSecondaryContainer, disabled: Color.Outline },
    'selected-indicator-color': { enabled: Color.SecondaryContainer, hovered: Color.SecondaryContainer, focused: Color.SecondaryContainer, pressed: Color.SecondaryContainer, disabled: Color.OutlineVariant },
    'unselected-indicator-color': { enabled: `transparent`, hovered: `transparent`, focused: `transparent`, pressed: `transparent`, disabled: `transparent` },

    'unselected-label-size'       : { enabled: Typescale.LabelLarge.FontSize, hovered: Typescale.LabelLarge.FontSize, focused: Typescale.LabelLarge.FontSize, pressed: Typescale.LabelLarge.FontSize, disabled: Typescale.LabelLarge.FontSize },
    'selected-label-size'         : { enabled: Typescale.LabelLarge.FontSize, hovered: Typescale.LabelLarge.FontSize, focused: Typescale.LabelLarge.FontSize, pressed: Typescale.LabelLarge.FontSize, disabled: Typescale.LabelLarge.FontSize },
    'unselected-label-line-height': { enabled: Typescale.LabelLarge.LineHeight, hovered: Typescale.LabelLarge.LineHeight, focused: Typescale.LabelLarge.LineHeight, pressed: Typescale.LabelLarge.LineHeight, disabled: Typescale.LabelLarge.LineHeight },
    'selected-label-line-height'  : { enabled: Typescale.LabelLarge.LineHeight, hovered: Typescale.LabelLarge.LineHeight, focused: Typescale.LabelLarge.LineHeight, pressed: Typescale.LabelLarge.LineHeight, disabled: Typescale.LabelLarge.LineHeight },
    'unselected-label-font'       : { enabled: Typescale.LabelLarge.Font, hovered: Typescale.LabelLarge.Font, focused: Typescale.LabelLarge.Font, pressed: Typescale.LabelLarge.Font, disabled: Typescale.LabelLarge.Font },
    'selected-label-font'         : { enabled: Typescale.LabelLarge.Font, hovered: Typescale.LabelLarge.Font, focused: Typescale.LabelLarge.Font, pressed: Typescale.LabelLarge.Font, disabled: Typescale.LabelLarge.Font },
    'unselected-label-tracking'   : { enabled: Typescale.LabelLarge.Tracking, hovered: Typescale.LabelLarge.Tracking, focused: Typescale.LabelLarge.Tracking, pressed: Typescale.LabelLarge.Tracking, disabled: Typescale.LabelLarge.Tracking },
    'selected-label-tracking'     : { enabled: Typescale.LabelLarge.Tracking, hovered: Typescale.LabelLarge.Tracking, focused: Typescale.LabelLarge.Tracking, pressed: Typescale.LabelLarge.Tracking, disabled: Typescale.LabelLarge.Tracking },
    'unselected-label-weight'     : { enabled: Typescale.LabelLarge.FontWeight, hovered: Typescale.LabelLarge.FontWeight, focused: Typescale.LabelLarge.FontWeight, pressed: Typescale.LabelLarge.FontWeight, disabled: Typescale.LabelLarge.FontWeight },
    'selected-label-weight'       : { enabled: Typescale.LabelLarge.FontWeight, hovered: Typescale.LabelLarge.FontWeight, focused: Typescale.LabelLarge.FontWeight, pressed: Typescale.LabelLarge.FontWeight, disabled: Typescale.LabelLarge.FontWeight },

    'large-badge-label-font'       : { enabled: Typescale.LabelLarge.Font, hovered: Typescale.LabelLarge.Font, focused: Typescale.LabelLarge.Font, pressed: Typescale.LabelLarge.Font, disabled: Typescale.LabelLarge.Font },
    'large-badge-label-size'       : { enabled: Typescale.LabelLarge.FontSize, hovered: Typescale.LabelLarge.FontSize, focused: Typescale.LabelLarge.FontSize, pressed: Typescale.LabelLarge.FontSize, disabled: Typescale.LabelLarge.FontSize },
    'large-badge-label-line-height': { enabled: Typescale.LabelLarge.LineHeight, hovered: Typescale.LabelLarge.LineHeight, focused: Typescale.LabelLarge.LineHeight, pressed: Typescale.LabelLarge.LineHeight, disabled: Typescale.LabelLarge.LineHeight },
    'large-badge-label-tracking'   : { enabled: Typescale.LabelLarge.Tracking, hovered: Typescale.LabelLarge.Tracking, focused: Typescale.LabelLarge.Tracking, pressed: Typescale.LabelLarge.Tracking, disabled: Typescale.LabelLarge.Tracking },
    'large-badge-label-weight'     : { enabled: Typescale.LabelLarge.FontWeight, hovered: Typescale.LabelLarge.FontWeight, focused: Typescale.LabelLarge.FontWeight, pressed: Typescale.LabelLarge.FontWeight, disabled: Typescale.LabelLarge.FontWeight },
})

export const NavigationTabVariants = {
    'bar-vertical': NavigationBarVerticalTabDefinition,
    'bar-horizontal': NavigationBarHorizontalTabDefinition,
    'bar-xr-vertical': NavigationBarXRVerticalTabDefinition,
    'rail-vertical': NavigationRailVerticalTabDefinition,
    'rail-horizontal': NavigationRailHorizontalTabDefinition,
    'rail-round': NavigationRailRoundTabDefinition,
    'rail-xr-vertical': NavigationRailXRVerticalTabDefinition,
    'rail-xr-round': NavigationRailXRRoundTabDefinition,
    'drawer': NavigationDrawerTabDefinition,
    'drawer-horizontal': NavigationDrawerTabDefinition,
} as const

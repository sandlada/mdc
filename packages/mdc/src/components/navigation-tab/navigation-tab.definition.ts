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
import { defineSchema, createStyleDefinition } from '@sandlada/styles/schema'

export const NavigationTabSchema = defineSchema([
    'enabled',
    'hovered',
    'focused',
    'pressed',
    'disabled',
] as const)

const DefaultScheme = {
    'icon-size'            : [`24px`, `24px`, `24px`, `24px`, `24px`],
    'unselected-icon-color': [Color.OnSurfaceVariant, Color.OnSurface, Color.OnSurface, Color.OnSurfaceVariant, Color.Outline],
    'selected-icon-color'  : [Color.OnSecondaryContainer, Color.OnSurface, Color.OnSurface, Color.OnSecondaryContainer, Color.Outline],

    'icon-container-height'              : [`32px`, `32px`, `32px`, `32px`, `32px`],
    'icon-container-width'               : [`56px`, `56px`, `56px`, `56px`, `56px`],
    'icon-container-padding-block-start' : [`0px`, `0px`, `0px`, `0px`, `0px`],
    'icon-container-padding-block-end'   : [`0px`, `0px`, `0px`, `0px`, `0px`],
    'icon-container-padding-inline-start': [`0px`, `0px`, `0px`, `0px`, `0px`],
    'icon-container-padding-inline-end'  : [`0px`, `0px`, `0px`, `0px`, `0px`],
    'icon-container-shape-start-start'   : [Shape.Full, Shape.Full, Shape.Full, Shape.Full, Shape.Full],
    'icon-container-shape-start-end'     : [Shape.Full, Shape.Full, Shape.Full, Shape.Full, Shape.Full],
    'icon-container-shape-end-start'     : [Shape.Full, Shape.Full, Shape.Full, Shape.Full, Shape.Full],
    'icon-container-shape-end-end'       : [Shape.Full, Shape.Full, Shape.Full, Shape.Full, Shape.Full],

    'unselected-indicator-color' : [`transparent`, `transparent`, `transparent`, `transparent`, `transparent`],
    'selected-indicator-color'   : [Color.SecondaryContainer, Color.SecondaryContainer, Color.SecondaryContainer, Color.SecondaryContainer, Color.OutlineVariant],
    'indicator-height'           : [`32px`, `32px`, `32px`, `32px`, `32px`],
    'indicator-width'            : [`56px`, `56px`, `56px`, `56px`, `56px`],
    'indicator-shape-start-start': [Shape.Full, Shape.Full, Shape.Full, Shape.Full, Shape.Full],
    'indicator-shape-start-end'  : [Shape.Full, Shape.Full, Shape.Full, Shape.Full, Shape.Full],
    'indicator-shape-end-start'  : [Shape.Full, Shape.Full, Shape.Full, Shape.Full, Shape.Full],
    'indicator-shape-end-end'    : [Shape.Full, Shape.Full, Shape.Full, Shape.Full, Shape.Full],

    'unselected-label-color'      : [Color.OnSurfaceVariant, Color.OnSurface, Color.OnSurface, Color.OnSurfaceVariant, Color.Outline],
    'selected-label-color'        : [Color.Secondary, Color.OnSurface, Color.OnSurface, Color.Secondary, Color.Outline],
    'unselected-label-size'       : [Typescale.LabelMedium.FontSize, Typescale.LabelMedium.FontSize, Typescale.LabelMedium.FontSize, Typescale.LabelMedium.FontSize, Typescale.LabelMedium.FontSize],
    'selected-label-size'         : [Typescale.LabelMedium.FontSize, Typescale.LabelMedium.FontSize, Typescale.LabelMedium.FontSize, Typescale.LabelMedium.FontSize, Typescale.LabelMedium.FontSize],
    'unselected-label-line-height': [Typescale.LabelMedium.LineHeight, Typescale.LabelMedium.LineHeight, Typescale.LabelMedium.LineHeight, Typescale.LabelMedium.LineHeight, Typescale.LabelMedium.LineHeight],
    'selected-label-line-height'  : [Typescale.LabelMedium.LineHeight, Typescale.LabelMedium.LineHeight, Typescale.LabelMedium.LineHeight, Typescale.LabelMedium.LineHeight, Typescale.LabelMedium.LineHeight],
    'unselected-label-font'       : [Typescale.LabelMedium.Font, Typescale.LabelMedium.Font, Typescale.LabelMedium.Font, Typescale.LabelMedium.Font, Typescale.LabelMedium.Font],
    'selected-label-font'         : [Typescale.LabelMedium.Font, Typescale.LabelMedium.Font, Typescale.LabelMedium.Font, Typescale.LabelMedium.Font, Typescale.LabelMedium.Font],
    'unselected-label-tracking'   : [Typescale.LabelMedium.Tracking, Typescale.LabelMedium.Tracking, Typescale.LabelMedium.Tracking, Typescale.LabelMedium.Tracking, Typescale.LabelMedium.Tracking],
    'selected-label-tracking'     : [Typescale.LabelMedium.Tracking, Typescale.LabelMedium.Tracking, Typescale.LabelMedium.Tracking, Typescale.LabelMedium.Tracking, Typescale.LabelMedium.Tracking],
    'unselected-label-weight'     : [Typescale.LabelMedium.FontWeight, Typescale.LabelMedium.FontWeight, Typescale.LabelMedium.FontWeight, Typescale.LabelMedium.FontWeight, Typescale.LabelMedium.FontWeight],
    'selected-label-weight'       : [Typescale.LabelMedium.FontWeight, Typescale.LabelMedium.FontWeight, Typescale.LabelMedium.FontWeight, Typescale.LabelMedium.FontWeight, Typescale.LabelMedium.FontWeight],

    'badge-color'                     : [Color.Error, Color.Error, Color.Error, Color.Error, Color.SurfaceVariant],
    'small-badge-height'              : [`6px`, `6px`, `6px`, `6px`, `6px`],
    'small-badge-width'               : [`6px`, `6px`, `6px`, `6px`, `6px`],
    'small-badge-padding-inline-start': [`2px`, `2px`, `2px`, `2px`, `2px`],
    'small-badge-padding-inline-end'  : [`2px`, `2px`, `2px`, `2px`, `2px`],
    'small-badge-padding-block-start' : [`2px`, `2px`, `2px`, `2px`, `2px`],
    'small-badge-padding-block-end'   : [`2px`, `2px`, `2px`, `2px`, `2px`],
    'large-badge-label-color'         : [Color.OnError, Color.OnError, Color.OnError, Color.OnError, Color.OnSurfaceVariant],
    'large-badge-height'              : [`16px`, `16px`, `16px`, `16px`, `16px`],
    'large-badge-width'               : [`16px`, `16px`, `16px`, `16px`, `16px`],
    'large-badge-padding-inline-start': [`4px`, `4px`, `4px`, `4px`, `4px`],
    'large-badge-padding-inline-end'  : [`4px`, `4px`, `4px`, `4px`, `4px`],
    'large-badge-padding-block-start' : [`2px`, `2px`, `2px`, `2px`, `2px`],
    'large-badge-padding-block-end'   : [`2px`, `2px`, `2px`, `2px`, `2px`],
    'large-badge-label-size'          : [Typescale.LabelSmall.FontSize, Typescale.LabelSmall.FontSize, Typescale.LabelSmall.FontSize, Typescale.LabelSmall.FontSize, Typescale.LabelSmall.FontSize],
    'large-badge-label-line-height'   : [Typescale.LabelSmall.LineHeight, Typescale.LabelSmall.LineHeight, Typescale.LabelSmall.LineHeight, Typescale.LabelSmall.LineHeight, Typescale.LabelSmall.LineHeight],
    'large-badge-label-font'          : [Typescale.LabelSmall.Font, Typescale.LabelSmall.Font, Typescale.LabelSmall.Font, Typescale.LabelSmall.Font, Typescale.LabelSmall.Font],
    'large-badge-label-tracking'      : [Typescale.LabelSmall.Tracking, Typescale.LabelSmall.Tracking, Typescale.LabelSmall.Tracking, Typescale.LabelSmall.Tracking, Typescale.LabelSmall.Tracking],
    'large-badge-label-weight'        : [Typescale.LabelSmall.FontWeight, Typescale.LabelSmall.FontWeight, Typescale.LabelSmall.FontWeight, Typescale.LabelSmall.FontWeight, Typescale.LabelSmall.FontWeight],

    'unselected-state-layer-color': [Color.OnSurface, Color.OnSurface, Color.OnSurface, Color.OnSurface, null],
    'selected-state-layer-color'  : [Color.OnSecondaryContainer, Color.OnSecondaryContainer, Color.OnSecondaryContainer, Color.OnSecondaryContainer, null],

    'unselected-state-layer-opacity': [`0`, State.HoveredStateLayerOpacity, State.FocusedStateLayerOpacity, State.PressedStateLayerOpacity, State.DisabledStateLayerOpacity],
    'selected-state-layer-opacity'  : [`0`, State.HoveredStateLayerOpacity, State.FocusedStateLayerOpacity, State.PressedStateLayerOpacity, State.DisabledStateLayerOpacity],

    'container-height'              : [`64px`, `64px`, `64px`, `64px`, `64px`],
    'container-width'               : [`104px`, `104px`, `104px`, `104px`, `104px`],
    'container-padding-inline-start': [`0px`, `0px`, `0px`, `0px`, `0px`],
    'container-padding-inline-end'  : [`0px`, `0px`, `0px`, `0px`, `0px`],
    'container-padding-block-start' : [`6px`, `6px`, `6px`, `6px`, `6px`],
    'container-padding-block-end'   : [`6px`, `6px`, `6px`, `6px`, `6px`],
    'spacing-between-icon-and-label': [`4px`, `4px`, `4px`, `4px`, `4px`],
} as const

export const NavigationBarVerticalTabDefinition = createStyleDefinition(NavigationTabSchema)(DefaultScheme)

export const NavigationBarHorizontalTabDefinition = createStyleDefinition(NavigationTabSchema)({
    ...DefaultScheme,
    'container-height': [`64px`, `64px`, `64px`, `64px`, `64px`],
    'container-width' : [`92px`, `92px`, `92px`, `92px`, `92px`],
    'container-padding-block-start' : [`0px`, `0px`, `0px`, `0px`, `0px`],
    'container-padding-block-end'   : [`0px`, `0px`, `0px`, `0px`, `0px`],
    'container-padding-inline-start': [`0px`, `0px`, `0px`, `0px`, `0px`],
    'container-padding-inline-end'  : [`0px`, `0px`, `0px`, `0px`, `0px`],

    'icon-container-height'              : [`40px`, `40px`, `40px`, `40px`, `40px`],
    'icon-container-width'               : [`92px`, `92px`, `92px`, `92px`, `92px`],
    'icon-container-padding-block-start' : [`8px`, `8px`, `8px`, `8px`, `8px`],
    'icon-container-padding-block-end'   : [`8px`, `8px`, `8px`, `8px`, `8px`],
    'icon-container-padding-inline-start': [`16px`, `16px`, `16px`, `16px`, `16px`],
    'icon-container-padding-inline-end'  : [`16px`, `16px`, `16px`, `16px`, `16px`],

    'indicator-height'              : [`40px`, `40px`, `40px`, `40px`, `40px`],
    'indicator-width'               : [`92px`, `92px`, `92px`, `92px`, `92px`],
    'spacing-between-icon-and-label': [`4px`, `4px`, `4px`, `4px`, `4px`],
})

export const NavigationBarXRVerticalTabDefinition = createStyleDefinition(NavigationTabSchema)({
    ...DefaultScheme,
    'container-height': [`80px`, `80px`, `80px`, `80px`, `80px`],
    'container-width' : [`64px`, `64px`, `64px`, `64px`, `64px`],
    'container-padding-block-start' : [`12px`, `12px`, `12px`, `12px`, `12px`],
    'container-padding-block-end'   : [`16px`, `16px`, `16px`, `16px`, `16px`],
    'container-padding-inline-start': [`0px`, `0px`, `0px`, `0px`, `0px`],
    'container-padding-inline-end'  : [`0px`, `0px`, `0px`, `0px`, `0px`],
    'icon-container-height': [`32px`, `32px`, `32px`, `32px`, `32px`],
    'icon-container-width' : [`64px`, `64px`, `64px`, `64px`, `64px`],
    'indicator-height'     : [`32px`, `32px`, `32px`, `32px`, `32px`],
    'indicator-width'      : [`64px`, `64px`, `64px`, `64px`, `64px`],
    'spacing-between-icon-and-label': [`4px`, `4px`, `4px`, `4px`, `4px`],
})

export const NavigationRailVerticalTabDefinition = createStyleDefinition(NavigationTabSchema)({
    ...DefaultScheme,
    'container-height': [`56px`, `56px`, `56px`, `56px`, `56px`],
    'container-width' : [`80px`, `80px`, `80px`, `80px`, `80px`],
    'container-padding-block-start' : [`0px`, `0px`, `0px`, `0px`, `0px`],
    'container-padding-block-end'   : [`0px`, `0px`, `0px`, `0px`, `0px`],
    'container-padding-inline-start': [`0px`, `0px`, `0px`, `0px`, `0px`],
    'container-padding-inline-end'  : [`0px`, `0px`, `0px`, `0px`, `0px`],

    'icon-container-height': [`32px`, `32px`, `32px`, `32px`, `32px`],
    'icon-container-width' : [`56px`, `56px`, `56px`, `56px`, `56px`],
    'icon-container-padding-inline-start': [`12px`, `12px`, `12px`, `12px`, `12px`],
    'icon-container-padding-inline-end'  : [`12px`, `12px`, `12px`, `12px`, `12px`],

    'indicator-height': [`32px`, `32px`, `32px`, `32px`, `32px`],
    'indicator-width' : [`56px`, `56px`, `56px`, `56px`, `56px`],
    'spacing-between-icon-and-label': [`4px`, `4px`, `4px`, `4px`, `4px`],
})

export const NavigationRailHorizontalTabDefinition = createStyleDefinition(NavigationTabSchema)({
    ...DefaultScheme,
    'container-height': [`56px`, `56px`, `56px`, `56px`, `56px`],
    'container-width' : [`100%`, `100%`, `100%`, `100%`, `100%`],
    'container-padding-block-start' : [`0px`, `0px`, `0px`, `0px`, `0px`],
    'container-padding-block-end'   : [`0px`, `0px`, `0px`, `0px`, `0px`],
    'container-padding-inline-start': [`0px`, `0px`, `0px`, `0px`, `0px`],
    'container-padding-inline-end'  : [`0px`, `0px`, `0px`, `0px`, `0px`],

    'icon-container-height': [`24px`, `24px`, `24px`, `24px`, `24px`],
    'icon-container-width' : [`24px`, `24px`, `24px`, `24px`, `24px`],
    'icon-container-padding-inline-start': [`16px`, `16px`, `16px`, `16px`, `16px`],
    'icon-container-padding-inline-end'  : [`16px`, `16px`, `16px`, `16px`, `16px`],

    'indicator-height': [`56px`, `56px`, `56px`, `56px`, `56px`],
    'indicator-width' : [`100%`, `100%`, `100%`, `100%`, `100%`],
    'spacing-between-icon-and-label': [`12px`, `12px`, `12px`, `12px`, `12px`],

    'unselected-label-size'       : [Typescale.LabelLarge.FontSize, Typescale.LabelLarge.FontSize, Typescale.LabelLarge.FontSize, Typescale.LabelLarge.FontSize, Typescale.LabelLarge.FontSize],
    'selected-label-size'         : [Typescale.LabelLarge.FontSize, Typescale.LabelLarge.FontSize, Typescale.LabelLarge.FontSize, Typescale.LabelLarge.FontSize, Typescale.LabelLarge.FontSize],
    'unselected-label-line-height': [Typescale.LabelLarge.LineHeight, Typescale.LabelLarge.LineHeight, Typescale.LabelLarge.LineHeight, Typescale.LabelLarge.LineHeight, Typescale.LabelLarge.LineHeight],
    'selected-label-line-height'  : [Typescale.LabelLarge.LineHeight, Typescale.LabelLarge.LineHeight, Typescale.LabelLarge.LineHeight, Typescale.LabelLarge.LineHeight, Typescale.LabelLarge.LineHeight],
    'unselected-label-font'       : [Typescale.LabelLarge.Font, Typescale.LabelLarge.Font, Typescale.LabelLarge.Font, Typescale.LabelLarge.Font, Typescale.LabelLarge.Font],
    'selected-label-font'         : [Typescale.LabelLarge.Font, Typescale.LabelLarge.Font, Typescale.LabelLarge.Font, Typescale.LabelLarge.Font, Typescale.LabelLarge.Font],
    'unselected-label-tracking'   : [Typescale.LabelLarge.Tracking, Typescale.LabelLarge.Tracking, Typescale.LabelLarge.Tracking, Typescale.LabelLarge.Tracking, Typescale.LabelLarge.Tracking],
    'selected-label-tracking'     : [Typescale.LabelLarge.Tracking, Typescale.LabelLarge.Tracking, Typescale.LabelLarge.Tracking, Typescale.LabelLarge.Tracking, Typescale.LabelLarge.Tracking],
    'unselected-label-weight'     : [Typescale.LabelLarge.FontWeight, Typescale.LabelLarge.FontWeight, Typescale.LabelLarge.FontWeight, Typescale.LabelLarge.FontWeight, Typescale.LabelLarge.FontWeight],
    'selected-label-weight'       : [Typescale.LabelLarge.FontWeight, Typescale.LabelLarge.FontWeight, Typescale.LabelLarge.FontWeight, Typescale.LabelLarge.FontWeight, Typescale.LabelLarge.FontWeight],
})

export const NavigationRailRoundTabDefinition = createStyleDefinition(NavigationTabSchema)({
    ...DefaultScheme,
    'container-height': [`64px`, `64px`, `64px`, `64px`, `64px`],
    'container-width' : [`80px`, `80px`, `80px`, `80px`, `80px`],
    'container-padding-block-start' : [`4px`, `4px`, `4px`, `4px`, `4px`],
    'container-padding-block-end'   : [`4px`, `4px`, `4px`, `4px`, `4px`],
    'container-padding-inline-start': [`0px`, `0px`, `0px`, `0px`, `0px`],
    'container-padding-inline-end'  : [`0px`, `0px`, `0px`, `0px`, `0px`],

    'icon-container-height': [`56px`, `56px`, `56px`, `56px`, `56px`],
    'icon-container-width' : [`56px`, `56px`, `56px`, `56px`, `56px`],
    'indicator-height'     : [`56px`, `56px`, `56px`, `56px`, `56px`],
    'indicator-width'      : [`56px`, `56px`, `56px`, `56px`, `56px`],
    'spacing-between-icon-and-label': [`0px`, `0px`, `0px`, `0px`, `0px`],
})

export const NavigationRailXRVerticalTabDefinition = createStyleDefinition(NavigationTabSchema)({
    ...DefaultScheme,
    'container-height': [`56px`, `56px`, `56px`, `56px`, `56px`],
    'container-width' : [`56px`, `56px`, `56px`, `56px`, `56px`],
    'container-padding-block-start' : [`0px`, `0px`, `0px`, `0px`, `0px`],
    'container-padding-block-end'   : [`4px`, `4px`, `4px`, `4px`, `4px`],
    'container-padding-inline-start': [`2px`, `2px`, `2px`, `2px`, `2px`],
    'container-padding-inline-end'  : [`2px`, `2px`, `2px`, `2px`, `2px`],
    'icon-container-height': [`32px`, `32px`, `32px`, `32px`, `32px`],
    'icon-container-width' : [`56px`, `56px`, `56px`, `56px`, `56px`],
    'indicator-height'     : [`32px`, `32px`, `32px`, `32px`, `32px`],
    'indicator-width'      : [`56px`, `56px`, `56px`, `56px`, `56px`],
    'spacing-between-icon-and-label': [`4px`, `4px`, `4px`, `4px`, `4px`],
})

export const NavigationRailXRRoundTabDefinition = createStyleDefinition(NavigationTabSchema)({
    ...DefaultScheme,
    'container-height': [`56px`, `56px`, `56px`, `56px`, `56px`],
    'container-width' : [`56px`, `56px`, `56px`, `56px`, `56px`],
    'container-padding-block-start' : [`0px`, `0px`, `0px`, `0px`, `0px`],
    'container-padding-block-end'   : [`0px`, `0px`, `0px`, `0px`, `0px`],
    'container-padding-inline-start': [`0px`, `0px`, `0px`, `0px`, `0px`],
    'container-padding-inline-end'  : [`0px`, `0px`, `0px`, `0px`, `0px`],
    'icon-container-height': [`56px`, `56px`, `56px`, `56px`, `56px`],
    'icon-container-width' : [`56px`, `56px`, `56px`, `56px`, `56px`],
    'indicator-height'     : [`56px`, `56px`, `56px`, `56px`, `56px`],
    'indicator-width'      : [`56px`, `56px`, `56px`, `56px`, `56px`],
    'spacing-between-icon-and-label': [`0px`, `0px`, `0px`, `0px`, `0px`],
})

export const NavigationDrawerTabDefinition = createStyleDefinition(NavigationTabSchema)({
    ...DefaultScheme,
    'container-height': [`56px`, `56px`, `56px`, `56px`, `56px`],
    'container-width' : [`336px`, `336px`, `336px`, `336px`, `336px`],
    'container-padding-block-start' : [`0px`, `0px`, `0px`, `0px`, `0px`],
    'container-padding-block-end'   : [`0px`, `0px`, `0px`, `0px`, `0px`],
    'container-padding-inline-start': [`0px`, `0px`, `0px`, `0px`, `0px`],
    'container-padding-inline-end'  : [`0px`, `0px`, `0px`, `0px`, `0px`],

    'icon-size'                          : [`24px`, `24px`, `24px`, `24px`, `24px`],
    'icon-container-height'              : [`24px`, `24px`, `24px`, `24px`, `24px`],
    'icon-container-width'               : [`24px`, `24px`, `24px`, `24px`, `24px`],
    'icon-container-padding-inline-start': [`16px`, `16px`, `16px`, `16px`, `16px`],
    'icon-container-padding-inline-end'  : [`16px`, `16px`, `16px`, `16px`, `16px`],

    'indicator-height': [`56px`, `56px`, `56px`, `56px`, `56px`],
    'indicator-width' : [`336px`, `336px`, `336px`, `336px`, `336px`],
    'spacing-between-icon-and-label': [`12px`, `12px`, `12px`, `12px`, `12px`],

    'unselected-icon-color': [Color.OnSurfaceVariant, Color.OnSurfaceVariant, Color.OnSurfaceVariant, Color.OnSurfaceVariant, Color.Outline],
    'selected-icon-color'  : [Color.OnSecondaryContainer, Color.OnSecondaryContainer, Color.OnSecondaryContainer, Color.OnSecondaryContainer, Color.Outline],
    'unselected-label-color': [Color.OnSurfaceVariant, Color.OnSurfaceVariant, Color.OnSurfaceVariant, Color.OnSurfaceVariant, Color.Outline],
    'selected-label-color'  : [Color.OnSecondaryContainer, Color.OnSecondaryContainer, Color.OnSecondaryContainer, Color.OnSecondaryContainer, Color.Outline],
    'selected-indicator-color': [Color.SecondaryContainer, Color.SecondaryContainer, Color.SecondaryContainer, Color.SecondaryContainer, Color.OutlineVariant],
    'unselected-indicator-color': [`transparent`, `transparent`, `transparent`, `transparent`, `transparent`],

    'unselected-label-size'       : [Typescale.LabelLarge.FontSize, Typescale.LabelLarge.FontSize, Typescale.LabelLarge.FontSize, Typescale.LabelLarge.FontSize, Typescale.LabelLarge.FontSize],
    'selected-label-size'         : [Typescale.LabelLarge.FontSize, Typescale.LabelLarge.FontSize, Typescale.LabelLarge.FontSize, Typescale.LabelLarge.FontSize, Typescale.LabelLarge.FontSize],
    'unselected-label-line-height': [Typescale.LabelLarge.LineHeight, Typescale.LabelLarge.LineHeight, Typescale.LabelLarge.LineHeight, Typescale.LabelLarge.LineHeight, Typescale.LabelLarge.LineHeight],
    'selected-label-line-height'  : [Typescale.LabelLarge.LineHeight, Typescale.LabelLarge.LineHeight, Typescale.LabelLarge.LineHeight, Typescale.LabelLarge.LineHeight, Typescale.LabelLarge.LineHeight],
    'unselected-label-font'       : [Typescale.LabelLarge.Font, Typescale.LabelLarge.Font, Typescale.LabelLarge.Font, Typescale.LabelLarge.Font, Typescale.LabelLarge.Font],
    'selected-label-font'         : [Typescale.LabelLarge.Font, Typescale.LabelLarge.Font, Typescale.LabelLarge.Font, Typescale.LabelLarge.Font, Typescale.LabelLarge.Font],
    'unselected-label-tracking'   : [Typescale.LabelLarge.Tracking, Typescale.LabelLarge.Tracking, Typescale.LabelLarge.Tracking, Typescale.LabelLarge.Tracking, Typescale.LabelLarge.Tracking],
    'selected-label-tracking'     : [Typescale.LabelLarge.Tracking, Typescale.LabelLarge.Tracking, Typescale.LabelLarge.Tracking, Typescale.LabelLarge.Tracking, Typescale.LabelLarge.Tracking],
    'unselected-label-weight'     : [Typescale.LabelLarge.FontWeight, Typescale.LabelLarge.FontWeight, Typescale.LabelLarge.FontWeight, Typescale.LabelLarge.FontWeight, Typescale.LabelLarge.FontWeight],
    'selected-label-weight'       : [Typescale.LabelLarge.FontWeight, Typescale.LabelLarge.FontWeight, Typescale.LabelLarge.FontWeight, Typescale.LabelLarge.FontWeight, Typescale.LabelLarge.FontWeight],

    'large-badge-label-font'       : [Typescale.LabelLarge.Font, Typescale.LabelLarge.Font, Typescale.LabelLarge.Font, Typescale.LabelLarge.Font, Typescale.LabelLarge.Font],
    'large-badge-label-size'       : [Typescale.LabelLarge.FontSize, Typescale.LabelLarge.FontSize, Typescale.LabelLarge.FontSize, Typescale.LabelLarge.FontSize, Typescale.LabelLarge.FontSize],
    'large-badge-label-line-height': [Typescale.LabelLarge.LineHeight, Typescale.LabelLarge.LineHeight, Typescale.LabelLarge.LineHeight, Typescale.LabelLarge.LineHeight, Typescale.LabelLarge.LineHeight],
    'large-badge-label-tracking'   : [Typescale.LabelLarge.Tracking, Typescale.LabelLarge.Tracking, Typescale.LabelLarge.Tracking, Typescale.LabelLarge.Tracking, Typescale.LabelLarge.Tracking],
    'large-badge-label-weight'     : [Typescale.LabelLarge.FontWeight, Typescale.LabelLarge.FontWeight, Typescale.LabelLarge.FontWeight, Typescale.LabelLarge.FontWeight, Typescale.LabelLarge.FontWeight],
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

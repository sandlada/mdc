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
 * |     container-block-leading-space
 * |                                               icon-container
 * |  container-inline-leading-space   /`````````\ also state-layer
 * |  container-inline-leading-space  |    <----- indicator-inline/block-leading/trailing-space
 * |  container-inline-leading-space   \_________/
 * |
 * |                                    Tab  Label
 * |
 * |     container-block-leading-space
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
 * </tab>
 * ```
 *
 * @link
 * https://www.figma.com/community/file/1035203688168086460
 * https://www.figma.com/design/4GM7ohCF2Qtjzs7Fra6jlp/Material-3-Design-Kit--Community-?node-id=55141-14251&p=f&t=Lo93bap9LHFqZ0Q1-0
 */

import { Color, Shape, State, Typescale } from '@sandlada/mdk'
import { transformRadiusToLogicRadius, type LogicBorderRadius, type PrefixKeys } from '../utils'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

interface IScheme extends LogicBorderRadius<{
    'icon-container-shape': string
    'indicator-shape'     : string
}> {
    'icon-size'                             : string
    'unselected-icon-color'                 : string
    'selected-icon-color'                   : string
    'icon-container-height'                 : string
    'icon-container-width'                  : string
    'icon-container-block-leading-space'    : string
    'icon-container-block-trailing-space'   : string
    'icon-container-inline-leading-space'   : string
    'icon-container-inline-trailing-space'  : string
    'unselected-indicator-color'            : string
    'selected-indicator-color'              : string
    'indicator-height'                      : string
    'indicator-width'                       : string
    'unselected-label-color'                : string
    'selected-label-color'                  : string
    'label-size'                            : string
    'label-line-height'                     : string
    'label-font'                            : string
    'label-tracking'                        : string
    'label-font-weight'                     : string
    'badge-color'                           : string
    'badge-height'                          : string
    'badge-width'                           : string
    'badge-label-color'                     : string
    'badge-label-size'                      : string
    'badge-label-line-height'               : string
    'badge-label-font'                      : string
    'badge-label-tracking'                  : string
    'badge-label-font-weight'               : string
    'unselected-enabled-state-layer-color'  : string
    'unselected-hovered-state-layer-color'  : string
    'unselected-focused-state-layer-color'  : string
    'unselected-pressed-state-layer-color'  : string
    'selected-enabled-state-layer-color'    : string
    'selected-hovered-state-layer-color'    : string
    'selected-focused-state-layer-color'    : string
    'selected-pressed-state-layer-color'    : string
    'unselected-enabled-state-layer-opacity': string
    'unselected-hovered-state-layer-opacity': string
    'unselected-focused-state-layer-opacity': string
    'unselected-pressed-state-layer-opacity': string
    'selected-enabled-state-layer-opacity'  : string
    'selected-hovered-state-layer-opacity'  : string
    'selected-focused-state-layer-opacity'  : string
    'selected-pressed-state-layer-opacity'  : string
    'container-height'                      : string
    'container-width'                       : string
    'container-block-leading-space'         : string
    'container-block-trailing-space'        : string
    'container-inline-leading-space'        : string
    'container-inline-trailing-space'       : string
    'spacing-between-icon-and-label'        : string
}

const DefaultScheme = {
    'icon-size': `24px`,
    'unselected-icon-color': Color.OnSecondaryContainer.toCSSValue(),
    'selected-icon-color': Color.OnSecondaryContainer.toCSSValue(),

    'icon-container-height': `32px`,
    'icon-container-width': `56px`,
    'icon-container-block-leading-space': `0px`,
    'icon-container-block-trailing-space': `0px`,
    'icon-container-inline-leading-space': `0px`,
    'icon-container-inline-trailing-space': `0px`,

    'unselected-indicator-color': `transparent`,
    'selected-indicator-color': Color.SecondaryContainer.toCSSValue(),
    'indicator-height': `32px`,
    'indicator-width': `56px`,

    'unselected-label-color': Color.OnSurfaceVariant.toCSSValue(),
    'selected-label-color': Color.Secondary.toCSSValue(),
    'label-size': Typescale.LabelMedium.FontSize.toCSSValue(),
    'label-line-height': Typescale.LabelMedium.LineHeight.toCSSValue(),
    'label-font': Typescale.LabelMedium.Font.toCSSValue(),
    'label-tracking': Typescale.LabelMedium.Tracking.toCSSValue(),
    'label-font-weight': Typescale.LabelMedium.FontWeight.toCSSValue(),

    'badge-color': `unset`,
    'badge-height': `unset`,
    'badge-width': `unset`,
    'badge-label-color': `unset`,
    'badge-label-size': `unset`,
    'badge-label-line-height': `unset`,
    'badge-label-font': `unset`,
    'badge-label-tracking': `unset`,
    'badge-label-font-weight': `unset`,

    'unselected-enabled-state-layer-color': Color.OnSurface.toCSSValue(),
    'unselected-hovered-state-layer-color': Color.OnSurface.toCSSValue(),
    'unselected-focused-state-layer-color': Color.OnSurface.toCSSValue(),
    'unselected-pressed-state-layer-color': Color.OnSurface.toCSSValue(),
    'selected-enabled-state-layer-color': Color.OnSecondaryContainer.toCSSValue(),
    'selected-hovered-state-layer-color': Color.OnSecondaryContainer.toCSSValue(),
    'selected-focused-state-layer-color': Color.OnSecondaryContainer.toCSSValue(),
    'selected-pressed-state-layer-color': Color.OnSecondaryContainer.toCSSValue(),

    'unselected-enabled-state-layer-opacity': `0`,
    'unselected-hovered-state-layer-opacity': State.HoveredStateLayerOpacity.toCSSValue(),
    'unselected-focused-state-layer-opacity': State.FocusedStateLayerOpacity.toCSSValue(),
    'unselected-pressed-state-layer-opacity': State.PressedStateLayerOpacity.toCSSValue(),
    'selected-enabled-state-layer-opacity': `0`,
    'selected-hovered-state-layer-opacity': State.HoveredStateLayerOpacity.toCSSValue(),
    'selected-focused-state-layer-opacity': State.FocusedStateLayerOpacity.toCSSValue(),
    'selected-pressed-state-layer-opacity': State.PressedStateLayerOpacity.toCSSValue(),

    'container-height': `64px`,
    'container-width': `104px`,
    'container-block-leading-space': `6px`,
    'container-block-trailing-space': `6px`,
    'container-inline-leading-space': `0px`,
    'container-inline-trailing-space': `0px`,
    'spacing-between-icon-and-label': `4px`,

    ...transformRadiusToLogicRadius({
        'icon-container-shape': Shape.Full.toCSSValue(),
        'indicator-shape': Shape.Full.toCSSValue(),
    }),
} as const satisfies IScheme

export const NavigationBarVerticalTabDefinition = createStyleDefinition<Partial<IScheme>>(DefaultScheme)
export const NavigationBarHorizontalTabDefinition = createStyleDefinition<Partial<IScheme>>({
    ...DefaultScheme,
    'container-height': `64px`,
    'container-width': `92px`,
    'container-block-leading-space': `0px`,
    'container-block-trailing-space': `0px`,
    'container-inline-leading-space': `0px`,
    'container-inline-trailing-space': `0px`,

    'icon-container-height': '40px',
    'icon-container-width': '92px',
    'icon-container-block-leading-space': `8px`,
    'icon-container-block-trailing-space': `8px`,
    'icon-container-inline-leading-space': `16px`,
    'icon-container-inline-trailing-space': `16px`,

    'indicator-height': `40px`,
    'indicator-width': `92px`,
    'spacing-between-icon-and-label': `4px`,
})
export const NavigationBarXRVerticalTabDefinition = createStyleDefinition<Partial<IScheme>>({
    ...DefaultScheme,
    'container-height': `80px`,
    'container-width': `64px`,
    "indicator-height": `32px`,
    "indicator-width": `64px`,
    'container-block-leading-space': `12px`,
    'container-block-trailing-space': `16px`,
    'container-inline-leading-space': `0px`,
    'container-inline-trailing-space': `0px`,
    "spacing-between-icon-and-label": `4px`,
    "icon-container-height": '32px',
    "icon-container-width": '64px',
})

export const NavigationRailVerticalTabDefinition = createStyleDefinition<Partial<IScheme>>({
    ...DefaultScheme,

    'container-height': `64px`,
    'container-width': `104px`,
    'container-block-leading-space': `6px`,
    'container-block-trailing-space': `6px`,
    'container-inline-leading-space': `0px`,
    'container-inline-trailing-space': `0px`,

    'icon-container-height': '32px',
    'icon-container-width': '56px',
    'icon-container-block-leading-space': `8px`,
    'icon-container-block-trailing-space': `8px`,
    'icon-container-inline-leading-space': `16px`,
    'icon-container-inline-trailing-space': `16px`,

    'indicator-height': `32px`,
    'indicator-width': `56px`,
    'spacing-between-icon-and-label': `4px`,
})
export const NavigationRailHorizontalTabDefinition = createStyleDefinition<Partial<IScheme>>({
    ...DefaultScheme,
    'container-height': `56px`,
    'container-width': `99px`,
    'container-block-leading-space': `0px`,
    'container-block-trailing-space': `0px`,
    'container-inline-leading-space': `0px`,
    'container-inline-trailing-space': `0px`,

    'icon-container-height': '56px',
    'icon-container-width': '99px',
    'icon-container-block-leading-space': `16px`,
    'icon-container-block-trailing-space': `16px`,
    'icon-container-inline-leading-space': `16px`,
    'icon-container-inline-trailing-space': `16px`,

    'indicator-height': `56px`,
    'indicator-width': `99px`,
    'spacing-between-icon-and-label': `8px`,

    "label-font": Typescale.LabelLarge.Font.toCSSValue(),
    "label-size": Typescale.LabelLarge.FontSize.toCSSValue(),
    "label-line-height": Typescale.LabelLarge.LineHeight.toCSSValue(),
    "label-tracking": Typescale.LabelLarge.Tracking.toCSSValue(),
    "label-font-weight": Typescale.LabelLarge.FontWeight.toCSSValue(),
})
export const NavigationRailRoundTabDefinition = createStyleDefinition<Partial<IScheme>>({
    ...DefaultScheme,
    'container-height': `64px`,
    'container-width': `104px`,
    'container-block-leading-space': `4px`,
    'container-block-trailing-space': `4px`,
    'container-inline-leading-space': `0px`,
    'container-inline-trailing-space': `0px`,

    'icon-container-height': '56px',
    'icon-container-width': '56px',
    'icon-container-block-leading-space': `0px`,
    'icon-container-block-trailing-space': `0px`,
    'icon-container-inline-leading-space': `0px`,
    'icon-container-inline-trailing-space': `0px`,

    'indicator-height': `56px`,
    'indicator-width': `56px`,
    'spacing-between-icon-and-label': `0px`,
})
export const NavigationRailXRVerticalTabDefinition = createStyleDefinition<Partial<IScheme>>({
    ...DefaultScheme,
    'container-height': `56px`,
    'container-width': `56px`,
    'container-block-leading-space': `0px`,
    'container-block-trailing-space': `4px`,
    'container-inline-leading-space': `2px`,
    'container-inline-trailing-space': `2px`,
    'indicator-height': `32px`,
    'indicator-width': `56px`,
    'icon-container-height': '32px',
    'icon-container-width': '56px',
    'spacing-between-icon-and-label': `4px`,
})
export const NavigationRailXRRoundTabDefinition = createStyleDefinition<Partial<IScheme>>({
    ...DefaultScheme,
    'container-height': `56px`,
    'container-width': `56px`,
    'container-block-leading-space': `0px`,
    'container-block-trailing-space': `0px`,
    'container-inline-leading-space': `0px`,
    'container-inline-trailing-space': `0px`,
    'indicator-height': `56px`,
    'indicator-width': `56px`,
    'icon-container-height': '56px',
    'icon-container-width': '56px',
    'spacing-between-icon-and-label': `0px`,
})

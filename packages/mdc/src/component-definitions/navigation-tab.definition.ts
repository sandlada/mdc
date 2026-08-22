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

import { Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

interface IScheme {
    'icon-container-shape'                  : any
    'indicator-shape'                       : any
    'icon-size'                             : any
    'unselected-icon-color'                 : any
    'selected-icon-color'                   : any
    'icon-container-height'                 : any
    'icon-container-width'                  : any
    'icon-container-block-leading-space'    : any
    'icon-container-block-trailing-space'   : any
    'icon-container-inline-leading-space'   : any
    'icon-container-inline-trailing-space'  : any
    'unselected-indicator-color'            : any
    'selected-indicator-color'              : any
    'indicator-height'                      : any
    'indicator-width'                       : any
    'unselected-label-color'                : any
    'selected-label-color'                  : any
    'label-size'                            : any
    'label-line-height'                     : any
    'label-font'                            : any
    'label-tracking'                        : any
    'label-font-weight'                     : any
    'badge-color'                           : any
    'badge-height'                          : any
    'badge-width'                           : any
    'badge-label-color'                     : any
    'badge-label-size'                      : any
    'badge-label-line-height'               : any
    'badge-label-font'                      : any
    'badge-label-tracking'                  : any
    'badge-label-font-weight'               : any
    'unselected-enabled-state-layer-color'  : any
    'unselected-hovered-state-layer-color'  : any
    'unselected-focused-state-layer-color'  : any
    'unselected-pressed-state-layer-color'  : any
    'selected-enabled-state-layer-color'    : any
    'selected-hovered-state-layer-color'    : any
    'selected-focused-state-layer-color'    : any
    'selected-pressed-state-layer-color'    : any
    'unselected-enabled-state-layer-opacity': any
    'unselected-hovered-state-layer-opacity': any
    'unselected-focused-state-layer-opacity': any
    'unselected-pressed-state-layer-opacity': any
    'selected-enabled-state-layer-opacity'  : any
    'selected-hovered-state-layer-opacity'  : any
    'selected-focused-state-layer-opacity'  : any
    'selected-pressed-state-layer-opacity'  : any
    'container-height'                      : any
    'container-width'                       : any
    'container-block-leading-space'         : any
    'container-block-trailing-space'        : any
    'container-inline-leading-space'        : string
    'container-inline-trailing-space'       : string
    'spacing-between-icon-and-label'        : any
}

const DefaultScheme = createStyleDefinition({
    'icon-size': `24px`,
    'unselected-icon-color': Color.OnSecondaryContainer,
    'selected-icon-color': Color.OnSecondaryContainer,

    'icon-container-height': `32px`,
    'icon-container-width': `56px`,
    'icon-container-block-leading-space': `0px`,
    'icon-container-block-trailing-space': `0px`,
    'icon-container-inline-leading-space': `0px`,
    'icon-container-inline-trailing-space': `0px`,

    'unselected-indicator-color': `transparent`,
    'selected-indicator-color': Color.SecondaryContainer,
    'indicator-height': `32px`,
    'indicator-width': `56px`,

    'unselected-label-color': Color.OnSurfaceVariant,
    'selected-label-color': Color.Secondary,
    'label-size': Typescale.LabelMedium.FontSize,
    'label-line-height': Typescale.LabelMedium.LineHeight,
    'label-font': Typescale.LabelMedium.Font,
    'label-tracking': Typescale.LabelMedium.Tracking,
    'label-font-weight': Typescale.LabelMedium.FontWeight,

    'badge-color': `unset`,
    'badge-height': `unset`,
    'badge-width': `unset`,
    'badge-label-color': `unset`,
    'badge-label-size': `unset`,
    'badge-label-line-height': `unset`,
    'badge-label-font': `unset`,
    'badge-label-tracking': `unset`,
    'badge-label-font-weight': `unset`,

    'unselected-enabled-state-layer-color': Color.OnSurface,
    'unselected-hovered-state-layer-color': Color.OnSurface,
    'unselected-focused-state-layer-color': Color.OnSurface,
    'unselected-pressed-state-layer-color': Color.OnSurface,
    'selected-enabled-state-layer-color': Color.OnSecondaryContainer,
    'selected-hovered-state-layer-color': Color.OnSecondaryContainer,
    'selected-focused-state-layer-color': Color.OnSecondaryContainer,
    'selected-pressed-state-layer-color': Color.OnSecondaryContainer,

    'unselected-enabled-state-layer-opacity': `0`,
    'unselected-hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'unselected-focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'unselected-pressed-state-layer-opacity': State.PressedStateLayerOpacity,
    'selected-enabled-state-layer-opacity': `0`,
    'selected-hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'selected-focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'selected-pressed-state-layer-opacity': State.PressedStateLayerOpacity,

    'container-height': `64px`,
    'container-width': `104px`,
    'container-block-leading-space': `6px`,
    'container-block-trailing-space': `6px`,
    'container-inline-leading-space': `0px`,
    'container-inline-trailing-space': `0px`,
    'spacing-between-icon-and-label': `4px`,

    'icon-container-shape': Shape.Full,
    'indicator-shape': Shape.Full,
})

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

    "label-font": Typescale.LabelLarge.Font,
    "label-size": Typescale.LabelLarge.FontSize,
    "label-line-height": Typescale.LabelLarge.LineHeight,
    "label-tracking": Typescale.LabelLarge.Tracking,
    "label-font-weight": Typescale.LabelLarge.FontWeight,
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

export const NavigationDrawerTabDefinition = createStyleDefinition<Partial<IScheme>>({
    ...DefaultScheme,
    'container-height': `56px`,
    'container-width': `336px`,
    'container-block-leading-space': `0px`,
    'container-block-trailing-space': `0px`,
    'container-inline-leading-space': `0px`,
    'container-inline-trailing-space': `0px`,

    'icon-size': `24px`,
    'icon-container-height': '24px',
    'icon-container-width': '24px',
    'icon-container-block-leading-space': `0px`,
    'icon-container-block-trailing-space': `0px`,
    'icon-container-inline-leading-space': `16px`,
    'icon-container-inline-trailing-space': `16px`,

    'indicator-height': `56px`,
    'indicator-width': `336px`,
    'indicator-shape': Shape.Full,
    'icon-container-shape': Shape.Full,
    'spacing-between-icon-and-label': `12px`,

    'label-font': Typescale.LabelLarge.Font,
    'label-size': Typescale.LabelLarge.FontSize,
    'label-line-height': Typescale.LabelLarge.LineHeight,
    'label-tracking': Typescale.LabelLarge.Tracking,
    'label-font-weight': Typescale.LabelLarge.FontWeight,

    'badge-label-font': Typescale.LabelLarge.Font,
    'badge-label-size': Typescale.LabelLarge.FontSize,
    'badge-label-line-height': Typescale.LabelLarge.LineHeight,
    'badge-label-tracking': Typescale.LabelLarge.Tracking,
    'badge-label-font-weight': Typescale.LabelLarge.FontWeight,

    'unselected-icon-color': Color.OnSurfaceVariant,
    'selected-icon-color': Color.OnSecondaryContainer,
    'unselected-label-color': Color.OnSurfaceVariant,
    'selected-label-color': Color.OnSecondaryContainer,
    'selected-indicator-color': Color.SecondaryContainer,
    'unselected-indicator-color': 'transparent',

    'unselected-enabled-state-layer-color': Color.OnSurface,
    'unselected-hovered-state-layer-color': Color.OnSurface,
    'unselected-focused-state-layer-color': Color.OnSurface,
    'unselected-pressed-state-layer-color': Color.OnSurface,
    'selected-enabled-state-layer-color': Color.OnSecondaryContainer,
    'selected-hovered-state-layer-color': Color.OnSecondaryContainer,
    'selected-focused-state-layer-color': Color.OnSecondaryContainer,
    'selected-pressed-state-layer-color': Color.OnSecondaryContainer,

    'unselected-enabled-state-layer-opacity': `0`,
    'unselected-hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'unselected-focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'unselected-pressed-state-layer-opacity': State.PressedStateLayerOpacity,
    'selected-enabled-state-layer-opacity': `0`,
    'selected-hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'selected-focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'selected-pressed-state-layer-opacity': State.PressedStateLayerOpacity,
})


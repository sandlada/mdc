/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Style definitions for `mdc-navigation-tab` aligned with Material Design 3
 * Figma Design Kit (`1SSCQ87SkS61fxfxErPXjk`, Navigation page).
 *
 * Variants:
 * - `bar-vertical`: Mobile portrait Navigation Bar item (56x32 pill + LabelMedium).
 * - `bar-horizontal`: Tablet/Medium Navigation Bar item (40px pill hugging icon + LabelMedium).
 * - `bar-xr-vertical`: XR Navigation Bar item (64x32 pill + EmphasizedLabelMedium on selected).
 * - `rail-vertical`: Collapsed Navigation Rail item (56x32 pill + LabelMedium).
 * - `rail-horizontal`: Expanded Navigation Rail item (56px pill hugging icon + LabelLarge + inline badge).
 * - `rail-round`: Collapsed Navigation Rail icon-only item (56x56 circle).
 * - `rail-xr-vertical`: XR Navigation Rail item (56x32 pill + EmphasizedLabelMedium on selected).
 * - `rail-xr-round`: XR Navigation Rail icon-only item (56x56 circle).
 * - `drawer` / `drawer-horizontal`: Navigation Drawer item (336x56 full-width pill).
 */

import { Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition } from '../../utils/style'

interface ITypescaleTokenLike {
    readonly FontSize: string | { ToCSSValue(): string }
    readonly LineHeight: string | { ToCSSValue(): string }
    readonly Font: string | { ToCSSValue(): string }
    readonly Tracking: string | { ToCSSValue(): string }
    readonly FontWeight: string | number | { ToCSSValue(): string }
}

const SharedTypescale = (
    typescale: ITypescaleTokenLike,
    prefix: 'unselected-label' | 'selected-label' | 'large-badge-label',
) => ({
    [`${prefix}-size`]    : { enabled: typescale.FontSize, hovered: typescale.FontSize, focused: typescale.FontSize, pressed: typescale.FontSize, disabled: typescale.FontSize },
    [`${prefix}-leading`] : { enabled: typescale.LineHeight, hovered: typescale.LineHeight, focused: typescale.LineHeight, pressed: typescale.LineHeight, disabled: typescale.LineHeight },
    [`${prefix}-font`]    : { enabled: typescale.Font, hovered: typescale.Font, focused: typescale.Font, pressed: typescale.Font, disabled: typescale.Font },
    [`${prefix}-tracking`]: { enabled: typescale.Tracking, hovered: typescale.Tracking, focused: typescale.Tracking, pressed: typescale.Tracking, disabled: typescale.Tracking },
    [`${prefix}-weight`]  : { enabled: typescale.FontWeight, hovered: typescale.FontWeight, focused: typescale.FontWeight, pressed: typescale.FontWeight, disabled: typescale.FontWeight },
})

const DisabledTextColor = `color-mix(in srgb, ${Color.OnSurface} 38%, transparent)`
const DisabledIndicatorColor = `color-mix(in srgb, ${Color.OnSurface} 12%, transparent)`

const DefaultScheme = {
    'icon-size'            : { enabled: `24px`, hovered: `24px`, focused: `24px`, pressed: `24px`, disabled: `24px` },
    'unselected-icon-color': { enabled: Color.OnSurfaceVariant, hovered: Color.OnSurfaceVariant, focused: Color.OnSurfaceVariant, pressed: Color.OnSurfaceVariant, disabled: DisabledTextColor },
    'selected-icon-color'  : { enabled: Color.OnSecondaryContainer, hovered: Color.OnSecondaryContainer, focused: Color.OnSecondaryContainer, pressed: Color.OnSecondaryContainer, disabled: DisabledTextColor },

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
    'selected-indicator-color'   : { enabled: Color.SecondaryContainer, hovered: Color.SecondaryContainer, focused: Color.SecondaryContainer, pressed: Color.SecondaryContainer, disabled: DisabledIndicatorColor },
    'indicator-height'           : { enabled: `32px`, hovered: `32px`, focused: `32px`, pressed: `32px`, disabled: `32px` },
    'indicator-width'            : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'indicator-shape-start-start': { enabled: Shape.Full, hovered: Shape.Full, focused: Shape.Full, pressed: Shape.Full, disabled: Shape.Full },
    'indicator-shape-start-end'  : { enabled: Shape.Full, hovered: Shape.Full, focused: Shape.Full, pressed: Shape.Full, disabled: Shape.Full },
    'indicator-shape-end-start'  : { enabled: Shape.Full, hovered: Shape.Full, focused: Shape.Full, pressed: Shape.Full, disabled: Shape.Full },
    'indicator-shape-end-end'    : { enabled: Shape.Full, hovered: Shape.Full, focused: Shape.Full, pressed: Shape.Full, disabled: Shape.Full },

    'unselected-label-color': { enabled: Color.OnSurfaceVariant, hovered: Color.OnSurfaceVariant, focused: Color.OnSurfaceVariant, pressed: Color.OnSurfaceVariant, disabled: DisabledTextColor },
    'selected-label-color'  : { enabled: Color.Secondary, hovered: Color.Secondary, focused: Color.Secondary, pressed: Color.Secondary, disabled: DisabledTextColor },
    ...SharedTypescale(Typescale.LabelMedium, 'unselected-label'),
    ...SharedTypescale(Typescale.LabelMedium, 'selected-label'),

    'label-opacity'   : { enabled: `1`, hovered: `1`, focused: `1`, pressed: `1`, disabled: `1` },
    'label-visibility': { enabled: `visible`, hovered: `visible`, focused: `visible`, pressed: `visible`, disabled: `visible` },

    'badge-color'                     : { enabled: Color.Error, hovered: Color.Error, focused: Color.Error, pressed: Color.Error, disabled: DisabledIndicatorColor },
    'small-badge-height'              : { enabled: `6px`, hovered: `6px`, focused: `6px`, pressed: `6px`, disabled: `6px` },
    'small-badge-width'               : { enabled: `6px`, hovered: `6px`, focused: `6px`, pressed: `6px`, disabled: `6px` },
    'small-badge-padding-inline-start': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'small-badge-padding-inline-end'  : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'small-badge-padding-block-start' : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'small-badge-padding-block-end'   : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'large-badge-label-color'         : { enabled: Color.OnError, hovered: Color.OnError, focused: Color.OnError, pressed: Color.OnError, disabled: DisabledTextColor },
    'large-badge-height'              : { enabled: `16px`, hovered: `16px`, focused: `16px`, pressed: `16px`, disabled: `16px` },
    'large-badge-width'               : { enabled: `16px`, hovered: `16px`, focused: `16px`, pressed: `16px`, disabled: `16px` },
    'large-badge-max-width'           : { enabled: `34px`, hovered: `34px`, focused: `34px`, pressed: `34px`, disabled: `34px` },
    'large-badge-padding-inline-start': { enabled: `4px`, hovered: `4px`, focused: `4px`, pressed: `4px`, disabled: `4px` },
    'large-badge-padding-inline-end'  : { enabled: `4px`, hovered: `4px`, focused: `4px`, pressed: `4px`, disabled: `4px` },
    'large-badge-padding-block-start' : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'large-badge-padding-block-end'   : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    ...SharedTypescale(Typescale.LabelSmall, 'large-badge-label'),

    'unselected-state-layer-color': { enabled: Color.OnSurface, hovered: Color.OnSurface, focused: Color.OnSurface, pressed: Color.OnSurface },
    'selected-state-layer-color'  : { enabled: Color.OnSecondaryContainer, hovered: Color.OnSecondaryContainer, focused: Color.OnSecondaryContainer, pressed: Color.OnSecondaryContainer },

    'unselected-state-layer-opacity': { enabled: `0`, hovered: State.HoveredStateLayerOpacity, focused: State.FocusedStateLayerOpacity, pressed: State.PressedStateLayerOpacity, disabled: State.DisabledStateLayerOpacity },
    'selected-state-layer-opacity'  : { enabled: `0`, hovered: State.HoveredStateLayerOpacity, focused: State.FocusedStateLayerOpacity, pressed: State.PressedStateLayerOpacity, disabled: State.DisabledStateLayerOpacity },

    'container-height'              : { enabled: `64px`, hovered: `64px`, focused: `64px`, pressed: `64px`, disabled: `64px` },
    'container-width'               : { enabled: `64px`, hovered: `64px`, focused: `64px`, pressed: `64px`, disabled: `64px` },
    'container-padding-inline-start': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-end'  : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-block-start' : { enabled: `6px`, hovered: `6px`, focused: `6px`, pressed: `6px`, disabled: `6px` },
    'container-padding-block-end'   : { enabled: `6px`, hovered: `6px`, focused: `6px`, pressed: `6px`, disabled: `6px` },
    'spacing-between-icon-and-label': { enabled: `4px`, hovered: `4px`, focused: `4px`, pressed: `4px`, disabled: `4px` },
} as const

export const NavigationBarVerticalTabDefinition = createStyleDefinition(DefaultScheme)

export const NavigationBarHorizontalTabDefinition = createStyleDefinition({
    ...DefaultScheme,
    'container-height'              : { enabled: `64px`, hovered: `64px`, focused: `64px`, pressed: `64px`, disabled: `64px` },
    'container-width'               : { enabled: `auto`, hovered: `auto`, focused: `auto`, pressed: `auto`, disabled: `auto` },
    'container-padding-block-start' : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-block-end'   : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-start': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-end'  : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },

    'icon-container-height'              : { enabled: `40px`, hovered: `40px`, focused: `40px`, pressed: `40px`, disabled: `40px` },
    'icon-container-width'               : { enabled: `auto`, hovered: `auto`, focused: `auto`, pressed: `auto`, disabled: `auto` },
    'icon-container-padding-block-start' : { enabled: `8px`, hovered: `8px`, focused: `8px`, pressed: `8px`, disabled: `8px` },
    'icon-container-padding-block-end'   : { enabled: `8px`, hovered: `8px`, focused: `8px`, pressed: `8px`, disabled: `8px` },
    'icon-container-padding-inline-start': { enabled: `16px`, hovered: `16px`, focused: `16px`, pressed: `16px`, disabled: `16px` },
    'icon-container-padding-inline-end'  : { enabled: `16px`, hovered: `16px`, focused: `16px`, pressed: `16px`, disabled: `16px` },

    'indicator-height'              : { enabled: `40px`, hovered: `40px`, focused: `40px`, pressed: `40px`, disabled: `40px` },
    'indicator-width'               : { enabled: `auto`, hovered: `auto`, focused: `auto`, pressed: `auto`, disabled: `auto` },
    'spacing-between-icon-and-label': { enabled: `4px`, hovered: `4px`, focused: `4px`, pressed: `4px`, disabled: `4px` },
    'selected-label-color'          : { enabled: Color.OnSecondaryContainer, hovered: Color.OnSecondaryContainer, focused: Color.OnSecondaryContainer, pressed: Color.OnSecondaryContainer, disabled: DisabledTextColor },
})

export const NavigationBarXRVerticalTabDefinition = createStyleDefinition({
    ...DefaultScheme,
    'container-height'              : { enabled: `80px`, hovered: `80px`, focused: `80px`, pressed: `80px`, disabled: `80px` },
    'container-width'               : { enabled: `112px`, hovered: `112px`, focused: `112px`, pressed: `112px`, disabled: `112px` },
    'container-padding-block-start' : { enabled: `12px`, hovered: `12px`, focused: `12px`, pressed: `12px`, disabled: `12px` },
    'container-padding-block-end'   : { enabled: `16px`, hovered: `16px`, focused: `16px`, pressed: `16px`, disabled: `16px` },
    'container-padding-inline-start': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-end'  : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'icon-container-height'         : { enabled: `32px`, hovered: `32px`, focused: `32px`, pressed: `32px`, disabled: `32px` },
    'icon-container-width'          : { enabled: `64px`, hovered: `64px`, focused: `64px`, pressed: `64px`, disabled: `64px` },
    'indicator-height'              : { enabled: `32px`, hovered: `32px`, focused: `32px`, pressed: `32px`, disabled: `32px` },
    'indicator-width'               : { enabled: `64px`, hovered: `64px`, focused: `64px`, pressed: `64px`, disabled: `64px` },
    'spacing-between-icon-and-label': { enabled: `4px`, hovered: `4px`, focused: `4px`, pressed: `4px`, disabled: `4px` },
    'selected-label-color'          : { enabled: Color.OnSurface, hovered: Color.OnSurface, focused: Color.OnSurface, pressed: Color.OnSurface, disabled: DisabledTextColor },
    ...SharedTypescale(Typescale.EmphasizedLabelMedium, 'selected-label'),
})

export const NavigationRailVerticalTabDefinition = createStyleDefinition({
    ...DefaultScheme,
    'container-height'              : { enabled: `64px`, hovered: `64px`, focused: `64px`, pressed: `64px`, disabled: `64px` },
    'container-width'               : { enabled: `96px`, hovered: `96px`, focused: `96px`, pressed: `96px`, disabled: `96px` },
    'container-padding-block-start' : { enabled: `6px`, hovered: `6px`, focused: `6px`, pressed: `6px`, disabled: `6px` },
    'container-padding-block-end'   : { enabled: `6px`, hovered: `6px`, focused: `6px`, pressed: `6px`, disabled: `6px` },
    'container-padding-inline-start': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-end'  : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },

    'icon-container-height'              : { enabled: `32px`, hovered: `32px`, focused: `32px`, pressed: `32px`, disabled: `32px` },
    'icon-container-width'               : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'icon-container-padding-inline-start': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'icon-container-padding-inline-end'  : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },

    'indicator-height'              : { enabled: `32px`, hovered: `32px`, focused: `32px`, pressed: `32px`, disabled: `32px` },
    'indicator-width'               : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'spacing-between-icon-and-label': { enabled: `4px`, hovered: `4px`, focused: `4px`, pressed: `4px`, disabled: `4px` },
})

export const NavigationRailHorizontalTabDefinition = createStyleDefinition({
    ...DefaultScheme,
    'container-height'              : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'container-width'               : { enabled: `auto`, hovered: `auto`, focused: `auto`, pressed: `auto`, disabled: `auto` },
    'container-padding-block-start' : { enabled: `16px`, hovered: `16px`, focused: `16px`, pressed: `16px`, disabled: `16px` },
    'container-padding-block-end'   : { enabled: `16px`, hovered: `16px`, focused: `16px`, pressed: `16px`, disabled: `16px` },
    'container-padding-inline-start': { enabled: `16px`, hovered: `16px`, focused: `16px`, pressed: `16px`, disabled: `16px` },
    'container-padding-inline-end'  : { enabled: `16px`, hovered: `16px`, focused: `16px`, pressed: `16px`, disabled: `16px` },

    'icon-container-height'              : { enabled: `24px`, hovered: `24px`, focused: `24px`, pressed: `24px`, disabled: `24px` },
    'icon-container-width'               : { enabled: `24px`, hovered: `24px`, focused: `24px`, pressed: `24px`, disabled: `24px` },
    'icon-container-padding-inline-start': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'icon-container-padding-inline-end'  : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },

    'indicator-height'              : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'indicator-width'               : { enabled: `auto`, hovered: `auto`, focused: `auto`, pressed: `auto`, disabled: `auto` },
    'spacing-between-icon-and-label': { enabled: `8px`, hovered: `8px`, focused: `8px`, pressed: `8px`, disabled: `8px` },

    'selected-label-color': { enabled: Color.OnSecondaryContainer, hovered: Color.OnSecondaryContainer, focused: Color.OnSecondaryContainer, pressed: Color.OnSecondaryContainer, disabled: DisabledTextColor },
    ...SharedTypescale(Typescale.LabelLarge, 'unselected-label'),
    ...SharedTypescale(Typescale.LabelLarge, 'selected-label'),
})

export const NavigationRailRoundTabDefinition = createStyleDefinition({
    ...DefaultScheme,
    'container-height'              : { enabled: `64px`, hovered: `64px`, focused: `64px`, pressed: `64px`, disabled: `64px` },
    'container-width'               : { enabled: `96px`, hovered: `96px`, focused: `96px`, pressed: `96px`, disabled: `96px` },
    'container-padding-block-start' : { enabled: `4px`, hovered: `4px`, focused: `4px`, pressed: `4px`, disabled: `4px` },
    'container-padding-block-end'   : { enabled: `4px`, hovered: `4px`, focused: `4px`, pressed: `4px`, disabled: `4px` },
    'container-padding-inline-start': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-end'  : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },

    'icon-container-height'         : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'icon-container-width'          : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'indicator-height'              : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'indicator-width'               : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'spacing-between-icon-and-label': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
})

export const NavigationRailXRVerticalTabDefinition = createStyleDefinition({
    ...DefaultScheme,
    'container-height'              : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'container-width'               : { enabled: `96px`, hovered: `96px`, focused: `96px`, pressed: `96px`, disabled: `96px` },
    'container-padding-block-start' : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-block-end'   : { enabled: `4px`, hovered: `4px`, focused: `4px`, pressed: `4px`, disabled: `4px` },
    'container-padding-inline-start': { enabled: `2px`, hovered: `2px`, focused: `2px`, pressed: `2px`, disabled: `2px` },
    'container-padding-inline-end'  : { enabled: `2px`, hovered: `2px`, focused: `2px`, pressed: `2px`, disabled: `2px` },
    'icon-container-height'         : { enabled: `32px`, hovered: `32px`, focused: `32px`, pressed: `32px`, disabled: `32px` },
    'icon-container-width'          : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'indicator-height'              : { enabled: `32px`, hovered: `32px`, focused: `32px`, pressed: `32px`, disabled: `32px` },
    'indicator-width'               : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'spacing-between-icon-and-label': { enabled: `4px`, hovered: `4px`, focused: `4px`, pressed: `4px`, disabled: `4px` },
    'selected-label-color'          : { enabled: Color.OnSurface, hovered: Color.OnSurface, focused: Color.OnSurface, pressed: Color.OnSurface, disabled: DisabledTextColor },
    ...SharedTypescale(Typescale.EmphasizedLabelMedium, 'selected-label'),
})

export const NavigationRailXRRoundTabDefinition = createStyleDefinition({
    ...DefaultScheme,
    'container-height'              : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'container-width'               : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'container-padding-block-start' : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-block-end'   : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-start': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-end'  : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'icon-container-height'         : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'icon-container-width'          : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'indicator-height'              : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'indicator-width'               : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'spacing-between-icon-and-label': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
})

export const NavigationDrawerTabDefinition = createStyleDefinition({
    ...DefaultScheme,
    'container-height'              : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'container-width'               : { enabled: `336px`, hovered: `336px`, focused: `336px`, pressed: `336px`, disabled: `336px` },
    'container-padding-block-start' : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-block-end'   : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-start': { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },
    'container-padding-inline-end'  : { enabled: `0px`, hovered: `0px`, focused: `0px`, pressed: `0px`, disabled: `0px` },

    'icon-size'                          : { enabled: `24px`, hovered: `24px`, focused: `24px`, pressed: `24px`, disabled: `24px` },
    'icon-container-height'              : { enabled: `24px`, hovered: `24px`, focused: `24px`, pressed: `24px`, disabled: `24px` },
    'icon-container-width'               : { enabled: `24px`, hovered: `24px`, focused: `24px`, pressed: `24px`, disabled: `24px` },
    'icon-container-padding-inline-start': { enabled: `16px`, hovered: `16px`, focused: `16px`, pressed: `16px`, disabled: `16px` },
    'icon-container-padding-inline-end'  : { enabled: `16px`, hovered: `16px`, focused: `16px`, pressed: `16px`, disabled: `16px` },

    'indicator-height'              : { enabled: `56px`, hovered: `56px`, focused: `56px`, pressed: `56px`, disabled: `56px` },
    'indicator-width'               : { enabled: `336px`, hovered: `336px`, focused: `336px`, pressed: `336px`, disabled: `336px` },
    'spacing-between-icon-and-label': { enabled: `12px`, hovered: `12px`, focused: `12px`, pressed: `12px`, disabled: `12px` },

    'unselected-icon-color'     : { enabled: Color.OnSurfaceVariant, hovered: Color.OnSurfaceVariant, focused: Color.OnSurfaceVariant, pressed: Color.OnSurfaceVariant, disabled: DisabledTextColor },
    'selected-icon-color'       : { enabled: Color.OnSecondaryContainer, hovered: Color.OnSecondaryContainer, focused: Color.OnSecondaryContainer, pressed: Color.OnSecondaryContainer, disabled: DisabledTextColor },
    'unselected-label-color'    : { enabled: Color.OnSurfaceVariant, hovered: Color.OnSurfaceVariant, focused: Color.OnSurfaceVariant, pressed: Color.OnSurfaceVariant, disabled: DisabledTextColor },
    'selected-label-color'      : { enabled: Color.OnSecondaryContainer, hovered: Color.OnSecondaryContainer, focused: Color.OnSecondaryContainer, pressed: Color.OnSecondaryContainer, disabled: DisabledTextColor },
    'selected-indicator-color'  : { enabled: Color.SecondaryContainer, hovered: Color.SecondaryContainer, focused: Color.SecondaryContainer, pressed: Color.SecondaryContainer, disabled: DisabledIndicatorColor },
    'unselected-indicator-color': { enabled: `transparent`, hovered: `transparent`, focused: `transparent`, pressed: `transparent`, disabled: `transparent` },

    ...SharedTypescale(Typescale.LabelLarge, 'unselected-label'),
    ...SharedTypescale(Typescale.LabelLarge, 'selected-label'),
    ...SharedTypescale(Typescale.LabelLarge, 'large-badge-label'),
})

export const NavigationTabVariants = {
    BarVertical     : NavigationBarVerticalTabDefinition,
    BarHorizontal   : NavigationBarHorizontalTabDefinition,
    BarXRVertical   : NavigationBarXRVerticalTabDefinition,
    RailVertical    : NavigationRailVerticalTabDefinition,
    RailHorizontal  : NavigationRailHorizontalTabDefinition,
    RailRound       : NavigationRailRoundTabDefinition,
    RailXRVertical  : NavigationRailXRVerticalTabDefinition,
    RailXRRound     : NavigationRailXRRoundTabDefinition,
    Drawer          : NavigationDrawerTabDefinition,
    DrawerHorizontal: NavigationDrawerTabDefinition,
} as const

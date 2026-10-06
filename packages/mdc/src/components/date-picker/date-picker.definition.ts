/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition } from '../../utils/style'

/**
 * @version
 * Material Design 3 Expressive
 */
export const DatePickerModalDefinition = createStyleDefinition({
    'container-shape-start-start': Shape.ExtraLarge,
    'container-shape-start-end': Shape.ExtraLarge,
    'container-shape-end-start': Shape.ExtraLarge,
    'container-shape-end-end': Shape.ExtraLarge,
    'enabled-container-color': Color.SurfaceContainerHigh,
    'enabled-container-elevation': '0',
    'container-min-width': `360px`,
    'container-padding-inline-start': `12px`,
    'container-padding-inline-end': `12px`,
    'container-padding-block-start': `0px`,
    'container-padding-block-end': `0px`,
    'header-container-height': `120px`,
    'header-container-padding-block-start': `16px`,
    'header-container-padding-block-end': `20px`,
    'header-container-padding-inline-start': `24px`,
    'header-container-padding-inline-end': `24px`,
    'nav-container-height': `56px`,
    'actions-container-height': `60px`,
    'headline-label-font': Typescale.HeadlineLarge.Font,
    'headline-label-leading': Typescale.HeadlineLarge.LineHeight,
    'headline-label-size': Typescale.HeadlineLarge.FontSize,
    'headline-label-weight': Typescale.HeadlineLarge.FontWeight,
    'headline-label-tracking': Typescale.HeadlineLarge.Tracking,
    'enabled-headline-label-color': Color.OnSurface,
    'supporting-text-label-font': Typescale.LabelMedium.Font,
    'supporting-text-label-leading': Typescale.LabelMedium.LineHeight,
    'supporting-text-label-size': Typescale.LabelMedium.FontSize,
    'supporting-text-label-weight': Typescale.LabelMedium.FontWeight,
    'supporting-text-label-tracking': Typescale.LabelMedium.Tracking,
    'enabled-supporting-text-label-color': Color.OnSurfaceVariant,
    'weekday-label-font': Typescale.LabelMedium.Font,
    'weekday-label-leading': Typescale.LabelMedium.LineHeight,
    'weekday-label-size': Typescale.LabelMedium.FontSize,
    'weekday-label-weight': Typescale.LabelMedium.FontWeight,
    'weekday-label-tracking': Typescale.LabelMedium.Tracking,
    'enabled-weekday-label-color': Color.OnSurfaceVariant,
    'day-label-font': Typescale.BodyLarge.Font,
    'day-label-leading': Typescale.BodyLarge.LineHeight,
    'day-label-size': Typescale.BodyLarge.FontSize,
    'day-label-weight': Typescale.BodyLarge.FontWeight,
    'day-label-tracking': Typescale.BodyLarge.Tracking,
    'enabled-day-label-color': Color.OnSurface,
    'enabled-today-day-label-color': Color.Primary,
    'today-day-container-outline-color': Color.Primary,
    'today-day-container-outline-width': `1px`,
    'enabled-selected-day-container-color': Color.Primary,
    'enabled-selected-day-label-color': Color.OnPrimary,
    'day-container-size': `48px`,
    'day-node-size': `40px`,
    'day-container-shape': Shape.Full,
    'enabled-outside-month-day-label-color': Color.OnSurfaceVariant,
    'enabled-disabled-day-label-color': Color.OnSurface,
    'enabled-disabled-day-label-opacity': State.DisabledStateLayerOpacity,
    'enabled-range-container-color': Color.PrimaryContainer,
    'enabled-range-label-color': Color.OnPrimaryContainer,
    'year-label-font': Typescale.BodyLarge.Font,
    'year-label-leading': Typescale.BodyLarge.LineHeight,
    'year-label-size': Typescale.BodyLarge.FontSize,
    'year-label-weight': Typescale.BodyLarge.FontWeight,
    'year-label-tracking': Typescale.BodyLarge.Tracking,
    'enabled-year-label-color': Color.OnSurface,
    'enabled-selected-year-container-color': Color.Primary,
    'enabled-selected-year-label-color': Color.OnPrimary,
    'enabled-today-year-label-color': Color.Primary,
    'year-container-width': `72px`,
    'year-container-height': `40px`,
    'year-container-shape': Shape.Full,
    'enabled-divider-color': Color.OutlineVariant,
    'hovered-day-state-layer-color': Color.OnSurface,
    'hovered-day-state-layer-opacity': State.HoveredStateLayerOpacity,
    'focused-day-state-layer-color': Color.OnSurface,
    'focused-day-state-layer-opacity': State.FocusedStateLayerOpacity,
    'pressed-day-state-layer-color': Color.OnSurface,
    'pressed-day-state-layer-opacity': State.PressedStateLayerOpacity,
    'hovered-year-state-layer-color': Color.OnSurface,
    'hovered-year-state-layer-opacity': State.HoveredStateLayerOpacity,
    'focused-year-state-layer-color': Color.OnSurface,
    'focused-year-state-layer-opacity': State.FocusedStateLayerOpacity,
    'pressed-year-state-layer-color': Color.OnSurface,
    'pressed-year-state-layer-opacity': State.PressedStateLayerOpacity,
    'hovered-menu-item-state-layer-color': Color.OnSurface,
    'hovered-menu-item-state-layer-opacity': State.HoveredStateLayerOpacity,
    'focused-menu-item-state-layer-color': Color.OnSurface,
    'focused-menu-item-state-layer-opacity': State.FocusedStateLayerOpacity,
    'pressed-menu-item-state-layer-color': Color.OnSurface,
    'pressed-menu-item-state-layer-opacity': State.PressedStateLayerOpacity,
    'enabled-menu-item-label-color': Color.OnSurface,
    'menu-item-label-font': Typescale.BodyLarge.Font,
    'menu-item-label-leading': Typescale.BodyLarge.LineHeight,
    'menu-item-label-size': Typescale.BodyLarge.FontSize,
    'menu-item-label-weight': Typescale.BodyLarge.FontWeight,
    'menu-item-label-tracking': Typescale.BodyLarge.Tracking,
    'enabled-menu-selected-container-color': Color.SurfaceContainerHighest,
    'enabled-menu-selected-icon-color': Color.OnSurface,
})

/**
 * @version
 * Material Design 3 Expressive
 */
export const DatePickerDockedDefinition = createStyleDefinition({
    'container-shape-start-start': Shape.ExtraSmall,
    'container-shape-start-end': Shape.ExtraSmall,
    'container-shape-end-start': Shape.ExtraSmall,
    'container-shape-end-end': Shape.ExtraSmall,
    'enabled-container-color': Color.SurfaceContainerHigh,
    'enabled-container-elevation': '0',
    'container-min-width': `360px`,
    'enabled-selected-day-container-color': Color.Primary,
    'enabled-selected-day-label-color': Color.OnPrimary,
    'enabled-day-label-color': Color.OnSurface,
    'day-container-size': `48px`,
    'day-node-size': `40px`,
    'day-container-shape': Shape.Full,
    'menu-container-padding-block-start': `8px`,
    'menu-container-padding-block-end': `8px`,
    'field-container-height': `56px`,
    'field-container-shape': Shape.ExtraSmall,
    'enabled-field-outline-color': Color.Outline,
    'enabled-field-label-color': Color.OnSurface,
    'enabled-field-icon-color': Color.OnSurfaceVariant,
    'field-label-font': Typescale.BodyLarge.Font,
    'field-label-leading': Typescale.BodyLarge.LineHeight,
    'field-label-size': Typescale.BodyLarge.FontSize,
    'field-label-weight': Typescale.BodyLarge.FontWeight,
    'field-label-tracking': Typescale.BodyLarge.Tracking,
    'field-icon-size': `24px`,
    'disabled-field-label-opacity': State.DisabledStateLayerOpacity,
    'enabled-field-supporting-label-color': Color.OnSurfaceVariant,
    'field-supporting-label-font': Typescale.BodySmall.Font,
    'field-supporting-label-leading': Typescale.BodySmall.LineHeight,
    'field-supporting-label-size': Typescale.BodySmall.FontSize,
    'field-supporting-label-weight': Typescale.BodySmall.FontWeight,
    'field-supporting-label-tracking': Typescale.BodySmall.Tracking,
    'enabled-field-trailing-container-color': Color.SurfaceContainerHighest,
})

/**
 * @version
 * Material Design 3 Expressive
 */
export const DatePickerInputDefinition = createStyleDefinition({
    'container-shape-start-start': Shape.ExtraLarge,
    'container-shape-start-end': Shape.ExtraLarge,
    'container-shape-end-start': Shape.ExtraLarge,
    'container-shape-end-end': Shape.ExtraLarge,
    'enabled-container-color': Color.SurfaceContainerHigh,
    'enabled-container-elevation': '0',
    'enabled-headline-label-color': Color.OnSurface,
    'enabled-supporting-text-label-color': Color.OnSurfaceVariant,
    'enabled-divider-color': Color.OutlineVariant,
    'enabled-input-outline-color': Color.Outline,
    'focused-input-outline-color': Color.Primary,
    'enabled-input-label-color': Color.OnSurfaceVariant,
    'input-label-font': Typescale.BodySmall.Font,
    'input-label-leading': Typescale.BodySmall.LineHeight,
    'input-label-size': Typescale.BodySmall.FontSize,
    'input-label-weight': Typescale.BodySmall.FontWeight,
    'input-label-tracking': Typescale.BodySmall.Tracking,
    'enabled-input-text-color': Color.OnSurface,
    'input-text-font': Typescale.BodyLarge.Font,
    'input-text-leading': Typescale.BodyLarge.LineHeight,
    'input-text-size': Typescale.BodyLarge.FontSize,
    'input-text-weight': Typescale.BodyLarge.FontWeight,
    'input-text-tracking': Typescale.BodyLarge.Tracking,
})

/**
 * Fullscreen range sheet tokens: modal elevation and colors with a
 * square full-bleed container.
 *
 * @version
 * Material Design 3 Expressive
 */
export const DatePickerFullscreenDefinition = createStyleDefinition({
    'container-shape-start-start': Shape.None,
    'container-shape-start-end': Shape.None,
    'container-shape-end-start': Shape.None,
    'container-shape-end-end': Shape.None,
    'enabled-container-color': Color.SurfaceContainerHigh,
    'enabled-container-elevation': '0',
    'container-min-width': `360px`,
    'top-bar-container-padding-block-start': `20px`,
    'top-bar-container-padding-block-end': `4px`,
})

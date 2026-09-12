/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape, Typescale } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

/**
 * Style definitions for `mdc-field`.
 *
 * Reference:
 * - MD3 spec: https://m3.material.io/components/text-fields/specs
 * - Android: `Widget.Material3.TextInputLayout.FilledBox` / `.OutlinedBox`
 * - Flutter: `InputDecoration` (filled vs. outlined)
 * - Jetpack Compose: `TextFieldDefaults` (filled) vs. `OutlinedTextFieldDefaults` (outlined)
 *
 * Container height: 56dp per MD3 spec.
 * Label typography: typescale body-large when populated; body-small when floating.
 * Supporting text: typescale body-small.
 */

// Tokens shared by both variants.
const shared = {
    // Container height — 56dp per MD3 spec.
    'container-height': `56px`,

    // Label typography — typescale body-large.
    'enabled-label-font':        Typescale.BodyLarge.Font,
    'enabled-label-size':        Typescale.BodyLarge.FontSize,
    'enabled-label-weight':      Typescale.BodyLarge.FontWeight,
    'enabled-label-tracking':    Typescale.BodyLarge.Tracking,
    'enabled-label-line-height': Typescale.BodyLarge.LineHeight,

    // Floating label (MD3 "notch" / "resting position") — body-small.
    'floating-label-font':        Typescale.BodySmall.Font,
    'floating-label-size':        Typescale.BodySmall.FontSize,
    'floating-label-weight':      Typescale.BodySmall.FontWeight,
    'floating-label-tracking':    Typescale.BodySmall.Tracking,
    'floating-label-line-height': Typescale.BodySmall.LineHeight,

    // Supporting text / error text — typescale body-small.
    'supporting-text-font':        Typescale.BodySmall.Font,
    'supporting-text-size':        Typescale.BodySmall.FontSize,
    'supporting-text-weight':      Typescale.BodySmall.FontWeight,
    'supporting-text-tracking':    Typescale.BodySmall.Tracking,
    'supporting-text-line-height': Typescale.BodySmall.LineHeight,

    // Counter — typescale body-small.
    'counter-font':        Typescale.BodySmall.Font,
    'counter-size':        Typescale.BodySmall.FontSize,
    'counter-weight':      Typescale.BodySmall.FontWeight,
    'counter-tracking':    Typescale.BodySmall.Tracking,
    'counter-line-height': Typescale.BodySmall.LineHeight,

    // Disabled opacity.
    'disabled-label-opacity':           `0.38`,
    'disabled-supporting-text-opacity': `0.38`,
    'disabled-counter-opacity':         `0.38`,
    'disabled-icon-opacity':            `0.38`,

    // State-layer opacities.
    'hovered-state-layer-opacity': `0.08`,
    'focused-state-layer-opacity': `0.1`,
    'pressed-state-layer-opacity': `0.1`,

    // Container internal padding (MD3 spec).
    'container-padding-inline-start': `16px`,
    'container-padding-inline-end'  : `16px`,
    'container-padding-block-start' : `8px`,
    'container-padding-block-end'   : `8px`,

    // Icon sizes.
    'leading-icon-size':  `24px`,
    'trailing-icon-size': `24px`,

    // Prefix / suffix text internal padding.
    'prefix-padding-inline-start': `2px`,
    'prefix-padding-inline-end'  : `2px`,
    'prefix-padding-block-start' : `0px`,
    'prefix-padding-block-end'   : `0px`,
    'suffix-padding-inline-start': `2px`,
    'suffix-padding-inline-end'  : `2px`,
    'suffix-padding-block-start' : `0px`,
    'suffix-padding-block-end'   : `0px`,
} as const

/**
 * Filled Field — `Widget.Material3.TextInputLayout.FilledBox`.
 *
 * Filled variant has rounded top corners (4dp) and square bottom corners.
 * The container is rendered with a `surface-container-highest` background
 * and a bottom-indicator underline that thickens on focus and switches to
 * the error color when `invalid`.
 */
export const FilledFieldDefinition = createStyleDefinition({
    ...shared,
    'container-shape-start-start': Shape.ExtraSmall,
    'container-shape-start-end':   Shape.ExtraSmall,
    'container-shape-end-start':   `0`,
    'container-shape-end-end':     `0`,

    // Background.
    'enabled-container-color':   Color.SurfaceContainerHighest,
    'hovered-container-color':   Color.SurfaceContainerHigh,
    'focused-container-color':   Color.SurfaceContainerHighest,
    'disabled-container-color':  Color.SurfaceContainerHighest,

    // Active indicator (filled variant uses a bottom underline).
    'enabled-active-indicator-color':   Color.OnSurfaceVariant,
    'hovered-active-indicator-color':   Color.OnSurface,
    'focused-active-indicator-color':   Color.Primary,
    'invalid-active-indicator-color':   Color.Error,
    'disabled-active-indicator-color':  Color.OnSurface,

    'enabled-active-indicator-height':   `1px`,
    'hovered-active-indicator-height':   `1px`,
    'focused-active-indicator-height':   `2px`,
    'invalid-active-indicator-height':   `2px`,
    'disabled-active-indicator-height':  `1px`,

    // Label color.
    'enabled-label-color':  Color.OnSurfaceVariant,
    'focused-label-color':  Color.Primary,
    'invalid-label-color':  Color.Error,
    'disabled-label-color': Color.OnSurface,

    // Supporting text / error text.
    'enabled-supporting-text-color':  Color.OnSurfaceVariant,
    'invalid-supporting-text-color':  Color.Error,
    'disabled-supporting-text-color': Color.OnSurface,

    // Counter color.
    'enabled-counter-color':  Color.OnSurfaceVariant,
    'invalid-counter-color':  Color.Error,
    'disabled-counter-color': Color.OnSurface,

    // Icon color.
    'enabled-icon-color':  Color.OnSurfaceVariant,
    'focused-icon-color':  Color.OnSurfaceVariant,
    'invalid-icon-color':  Color.OnSurfaceVariant,
    'disabled-icon-color': Color.OnSurface,
})

/**
 * Outlined Field — `Widget.Material3.TextInputLayout.OutlinedBox`.
 *
 * Outlined variant has uniform 4dp rounded corners and a 4-sided border. The
 * label "notch" effect is created by giving the label a solid background that
 * matches the container background (`transparent`), so the outline appears to
 * break at the label position.
 */
export const OutlinedFieldDefinition = createStyleDefinition({
    ...shared,
    'container-shape-start-start': Shape.ExtraSmall,
    'container-shape-start-end':   Shape.ExtraSmall,
    'container-shape-end-start':   Shape.ExtraSmall,
    'container-shape-end-end':     Shape.ExtraSmall,

    // Background — transparent so the page surface shows through.
    'enabled-container-color':   `transparent`,
    'hovered-container-color':   `transparent`,
    'focused-container-color':   `transparent`,
    'disabled-container-color':  `transparent`,

    // Outline (4-sided border).
    'outline-width': `1px`,
    'enabled-outline-color':  Color.Outline,
    'hovered-outline-color':  Color.OnSurface,
    'focused-outline-color':  Color.Primary,
    'invalid-outline-color':  Color.Error,
    'disabled-outline-color': Color.OnSurface,

    // Label color (same as filled).
    'enabled-label-color':  Color.OnSurfaceVariant,
    'focused-label-color':  Color.Primary,
    'invalid-label-color':  Color.Error,
    'disabled-label-color': Color.OnSurface,

    // Supporting text / error text (same as filled).
    'enabled-supporting-text-color':  Color.OnSurfaceVariant,
    'invalid-supporting-text-color':  Color.Error,
    'disabled-supporting-text-color': Color.OnSurface,

    // Counter color.
    'enabled-counter-color':  Color.OnSurfaceVariant,
    'invalid-counter-color':  Color.Error,
    'disabled-counter-color': Color.OnSurface,

    // Icon color (same as filled).
    'enabled-icon-color':  Color.OnSurfaceVariant,
    'focused-icon-color':  Color.OnSurfaceVariant,
    'invalid-icon-color':  Color.OnSurfaceVariant,
    'disabled-icon-color': Color.OnSurface,
})

/**
 * Default export — kept for parity with single-definition components.
 * The concrete class uses `FilledFieldDefinition` / `OutlinedFieldDefinition`
 * directly via the `variant` attribute.
 */
export const FieldDefinition = FilledFieldDefinition


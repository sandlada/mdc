/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import {
    createStyleDefinition,
    expandPadding,
    expandShape,
    expandTypescale,
} from '../../utils/style'

/**
 * Style definitions for `mdc-field`.
 *
 * Reference:
 * - MD3 spec: https://m3.material.io/components/text-fields/specs
 * - Android: `Widget.Material3.TextInputLayout.FilledBox` / `.OutlinedBox`
 * - Jetpack Compose: `TextFieldDefaults` / `OutlinedTextFieldDefaults`
 *
 * Container height: 56dp per MD3 spec.
 * Label typography: typescale body-large when resting; body-small when floating.
 * Supporting text & counter: typescale body-small.
 * Content / prefix / suffix typography: typescale body-large.
 */

const SharedFieldTokens = {
    // Container height — 56dp per MD3 spec.
    'container-height': '56px',

    // Typography.
    ...expandTypescale('enabled-label')(Typescale.BodyLarge),
    ...expandTypescale('floating-label')(Typescale.BodySmall),
    ...expandTypescale('supporting-text')(Typescale.BodySmall),
    ...expandTypescale('counter')(Typescale.BodySmall),
    ...expandTypescale('content')(Typescale.BodyLarge),

    // Content & prefix/suffix colors.
    'enabled-content-color': Color.OnSurface,
    'disabled-content-color': Color.OnSurface,
    'disabled-content-opacity': '0.38',

    'enabled-prefix-color': Color.OnSurfaceVariant,
    'disabled-prefix-color': Color.OnSurface,
    'enabled-suffix-color': Color.OnSurfaceVariant,
    'disabled-suffix-color': Color.OnSurface,

    // Label colors.
    'enabled-label-color': Color.OnSurfaceVariant,
    'hovered-label-color': Color.OnSurfaceVariant,
    'focused-label-color': Color.Primary,
    'invalid-label-color': Color.Error,
    'disabled-label-color': Color.OnSurface,

    // Supporting text / error text colors.
    'enabled-supporting-text-color': Color.OnSurfaceVariant,
    'hovered-supporting-text-color': Color.OnSurfaceVariant,
    'focused-supporting-text-color': Color.OnSurfaceVariant,
    'invalid-supporting-text-color': Color.Error,
    'disabled-supporting-text-color': Color.OnSurface,

    // Counter colors.
    'enabled-counter-color': Color.OnSurfaceVariant,
    'invalid-counter-color': Color.Error,
    'disabled-counter-color': Color.OnSurface,

    // Leading icon colors & size.
    'leading-icon-size': '24px',
    'enabled-leading-icon-color': Color.OnSurfaceVariant,
    'hovered-leading-icon-color': Color.OnSurfaceVariant,
    'focused-leading-icon-color': Color.OnSurfaceVariant,
    'invalid-leading-icon-color': Color.OnSurfaceVariant,
    'disabled-leading-icon-color': Color.OnSurface,

    // Trailing icon colors & size (MD3: error state colors trailing icon in Error).
    'trailing-icon-size': '24px',
    'enabled-trailing-icon-color': Color.OnSurfaceVariant,
    'hovered-trailing-icon-color': Color.OnSurfaceVariant,
    'focused-trailing-icon-color': Color.OnSurfaceVariant,
    'invalid-trailing-icon-color': Color.Error,
    'disabled-trailing-icon-color': Color.OnSurface,

    // Disabled opacities.
    'disabled-label-opacity': '0.38',
    'disabled-supporting-text-opacity': '0.38',
    'disabled-counter-opacity': '0.38',
    'disabled-leading-icon-opacity': '0.38',
    'disabled-trailing-icon-opacity': '0.38',

    // State-layer opacities.
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,

    // Container internal padding & icon spacing (MD3 spec: 16dp edge, 12dp edge with icon, 16dp icon-to-text gap).
    ...expandPadding('container-padding')({
        inlineStart: '16px',
        inlineEnd: '16px',
        blockStart: '8px',
        blockEnd: '8px',
    }),
    'container-icon-padding': '12px',
    'icon-content-gap': '16px',

    // Supporting text row padding.
    ...expandPadding('supporting-text-padding')({
        inlineStart: '16px',
        inlineEnd: '16px',
        blockStart: '4px',
        blockEnd: '0px',
    }),

    // Prefix / suffix internal padding.
    ...expandPadding('prefix-padding')({
        inlineStart: '0px',
        inlineEnd: '2px',
        blockStart: '0px',
        blockEnd: '0px',
    }),
    ...expandPadding('suffix-padding')({
        inlineStart: '2px',
        inlineEnd: '0px',
        blockStart: '0px',
        blockEnd: '0px',
    }),
} as const

/**
 * Filled Field — `Widget.Material3.TextInputLayout.FilledBox` / `TextFieldDefaults`.
 *
 * Rounded top corners (`4dp`), square bottom corners (`0dp`),
 * `surface-container-highest` container with hover state layer, and a bottom
 * active-indicator underline.
 */
export const FilledFieldDefinition = createStyleDefinition({
    ...SharedFieldTokens,
    ...expandShape('container-shape')({
        startStart: Shape.ExtraSmall,
        startEnd: Shape.ExtraSmall,
        endStart: '0px',
        endEnd: '0px',
    }),

    // Container & state layer.
    'enabled-container-color': Color.SurfaceContainerHighest,
    'hovered-state-layer-color': Color.OnSurface,
    'disabled-container-color': Color.OnSurface,
    'disabled-container-opacity': '0.04',

    // Active indicator (bottom underline).
    'enabled-active-indicator-color': Color.OnSurfaceVariant,
    'hovered-active-indicator-color': Color.OnSurface,
    'focused-active-indicator-color': Color.Primary,
    'invalid-active-indicator-color': Color.Error,
    'disabled-active-indicator-color': Color.OnSurface,
    'disabled-active-indicator-opacity': '0.38',

    'enabled-active-indicator-height': '1px',
    'hovered-active-indicator-height': '1px',
    'focused-active-indicator-height': '2px',
    'invalid-active-indicator-height': '1px',
    'invalid-focused-active-indicator-height': '2px',
    'disabled-active-indicator-height': '1px',
})

/**
 * Outlined Field — `Widget.Material3.TextInputLayout.OutlinedBox` / `OutlinedTextFieldDefaults`.
 *
 * Uniform `4dp` rounded corners, transparent container, and a 4-sided outline
 * with a true transparent notch cutout for the floating label.
 */
export const OutlinedFieldDefinition = createStyleDefinition({
    ...SharedFieldTokens,
    ...expandShape('container-shape')(Shape.ExtraSmall),

    // Background — transparent so any parent surface shows through.
    'enabled-container-color': 'transparent',
    'hovered-state-layer-color': 'transparent',
    'disabled-container-color': 'transparent',
    'disabled-container-opacity': '1',

    // Outline (4-sided border with notch).
    'enabled-outline-width': '1px',
    'hovered-outline-width': '1px',
    'focused-outline-width': '2px',
    'invalid-outline-width': '1px',
    'invalid-focused-outline-width': '2px',
    'disabled-outline-width': '1px',

    'enabled-outline-color': Color.Outline,
    'hovered-outline-color': Color.OnSurface,
    'focused-outline-color': Color.Primary,
    'invalid-outline-color': Color.Error,
    'disabled-outline-color': Color.OnSurface,
    'disabled-outline-opacity': '0.12',

    'outline-label-padding': '4px',
})

/**
 * Default definition — kept for parity with single-definition components.
 */
export const FieldDefinition = FilledFieldDefinition

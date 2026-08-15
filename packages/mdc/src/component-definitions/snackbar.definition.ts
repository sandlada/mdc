/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape, Typescale } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

/**
 * Shared (non-color) tokens for `mdc-snackbar`.
 *
 * Based on Material Components for Android `Widget.Material3.Snackbar` and
 * `SnackbarContentLayout`:
 *
 * - Container: ExtraSmall (4dp), elevation 6dp
 * - Label: body-medium
 * - Action: label-large, TextButton shape
 * - Close icon: 24dp
 * - Margin: 8dp, padding: 8dp horizontal, 14dp vertical (single line)
 * - Max width: 344dp
 */
const shared = {
    // Container shape & layout
    'container-shape-start-start'        : Shape.ExtraSmall,
    'container-shape-start-end'          : Shape.ExtraSmall,
    'container-shape-end-start'          : Shape.ExtraSmall,
    'container-shape-end-end'            : Shape.ExtraSmall,
    'container-elevation'                : `6`,
    'container-shadow-color'             : Color.Shadow,
    'container-min-height'               : `48px`,
    'container-max-width'                : `344px`,
    'container-margin'                   : `8px`,
    'container-padding-inline'           : `8px`,
    'container-padding-block'            : `14px`,
    'container-gap'                      : `8px`,

    // Label — body-medium
    'label-font'                    : Typescale.BodyMedium.Font,
    'label-size'                    : Typescale.BodyMedium.FontSize,
    'label-weight'                  : Typescale.BodyMedium.FontWeight,
    'label-tracking'                : Typescale.BodyMedium.Tracking,
    'label-line-height'             : Typescale.BodyMedium.LineHeight,
    'label-padding-inline'               : `4px`,

    // Action — label-large
    'action-font'                        : Typescale.LabelLarge.Font,
    'action-size'                   : Typescale.LabelLarge.FontSize,
    'action-weight'                 : Typescale.LabelLarge.FontWeight,
    'action-tracking'               : Typescale.LabelLarge.Tracking,
    'action-line-height'            : Typescale.LabelLarge.LineHeight,
    'action-container-shape-start-start' : Shape.Full,
    'action-container-shape-start-end'   : Shape.Full,
    'action-container-shape-end-start'   : Shape.Full,
    'action-container-shape-end-end'     : Shape.Full,
    'action-padding-inline'              : `12px`,
    'action-padding-block'               : `10px`,

    // Close icon
    'close-icon-size'                    : `24px`,
    'close-icon-padding'                 : `8px`,
    'close-icon-shape-start-start'       : Shape.Full,
    'close-icon-shape-start-end'         : Shape.Full,
    'close-icon-shape-end-start'         : Shape.Full,
    'close-icon-shape-end-end'           : Shape.Full,

    // Leading icon
    'icon-size'                          : `24px`,
} as const

// ─── Variant Definitions ────────────────────────────────────────────────────

export const SurfaceSnackbarDefinition = createStyleDefinition({
    ...shared,
    'enabled-container-color'                    : Color.SurfaceContainerHigh,
    'enabled-label-color'                   : Color.OnSurfaceVariant,
    'enabled-action-text-color'                  : Color.Primary,
    'enabled-close-icon-color'                   : Color.OnSurfaceVariant,
    'enabled-icon-color'                         : Color.OnSurfaceVariant,
    'hovered-action-state-layer-color'     : Color.Primary,
    'hovered-action-state-layer-opacity'   : `0.08`,
    'focused-action-state-layer-color'     : Color.Primary,
    'focused-action-state-layer-opacity'   : `0.1`,
    'pressed-action-state-layer-color'   : Color.Primary,
    'pressed-action-state-layer-opacity' : `0.1`,
})

export const InverseSurfaceSnackbarDefinition = createStyleDefinition({
    ...shared,
    'enabled-container-color'                    : Color.InverseSurface,
    'enabled-label-color'                   : Color.InverseOnSurface,
    'enabled-action-text-color'                  : Color.InversePrimary,
    'enabled-close-icon-color'                   : Color.InverseOnSurface,
    'enabled-icon-color'                         : Color.InverseOnSurface,
    'hovered-action-state-layer-color'     : Color.InversePrimary,
    'hovered-action-state-layer-opacity'   : `0.08`,
    'focused-action-state-layer-color'     : Color.InversePrimary,
    'focused-action-state-layer-opacity'   : `0.1`,
    'pressed-action-state-layer-color'   : Color.InversePrimary,
    'pressed-action-state-layer-opacity' : `0.1`,
})

export const PrimarySnackbarDefinition = createStyleDefinition({
    ...shared,
    'enabled-container-color'                    : Color.Primary,
    'enabled-label-color'                   : Color.OnPrimary,
    'enabled-action-text-color'                  : Color.OnPrimary,
    'enabled-close-icon-color'                   : Color.OnPrimary,
    'enabled-icon-color'                         : Color.OnPrimary,
    'hovered-action-state-layer-color'     : Color.OnPrimary,
    'hovered-action-state-layer-opacity'   : `0.08`,
    'focused-action-state-layer-color'     : Color.OnPrimary,
    'focused-action-state-layer-opacity'   : `0.1`,
    'pressed-action-state-layer-color'   : Color.OnPrimary,
    'pressed-action-state-layer-opacity' : `0.1`,
})

export const SecondarySnackbarDefinition = createStyleDefinition({
    ...shared,
    'enabled-container-color'                    : Color.Secondary,
    'enabled-label-color'                   : Color.OnSecondary,
    'enabled-action-text-color'                  : Color.OnSecondary,
    'enabled-close-icon-color'                   : Color.OnSecondary,
    'enabled-icon-color'                         : Color.OnSecondary,
    'hovered-action-state-layer-color'     : Color.OnSecondary,
    'hovered-action-state-layer-opacity'   : `0.08`,
    'focused-action-state-layer-color'     : Color.OnSecondary,
    'focused-action-state-layer-opacity'   : `0.1`,
    'pressed-action-state-layer-color'   : Color.OnSecondary,
    'pressed-action-state-layer-opacity' : `0.1`,
})

export const TertiarySnackbarDefinition = createStyleDefinition({
    ...shared,
    'enabled-container-color'                    : Color.Tertiary,
    'enabled-label-color'                   : Color.OnTertiary,
    'enabled-action-text-color'                  : Color.OnTertiary,
    'enabled-close-icon-color'                   : Color.OnTertiary,
    'enabled-icon-color'                         : Color.OnTertiary,
    'hovered-action-state-layer-color'     : Color.OnTertiary,
    'hovered-action-state-layer-opacity'   : `0.08`,
    'focused-action-state-layer-color'     : Color.OnTertiary,
    'focused-action-state-layer-opacity'   : `0.1`,
    'pressed-action-state-layer-color'   : Color.OnTertiary,
    'pressed-action-state-layer-opacity' : `0.1`,
})

export const ErrorSnackbarDefinition = createStyleDefinition({
    ...shared,
    'enabled-container-color'                    : Color.Error,
    'enabled-label-color'                   : Color.OnError,
    'enabled-action-text-color'                  : Color.OnError,
    'enabled-close-icon-color'                   : Color.OnError,
    'enabled-icon-color'                         : Color.OnError,
    'hovered-action-state-layer-color'     : Color.OnError,
    'hovered-action-state-layer-opacity'   : `0.08`,
    'focused-action-state-layer-color'     : Color.OnError,
    'focused-action-state-layer-opacity'   : `0.1`,
    'pressed-action-state-layer-color'   : Color.OnError,
    'pressed-action-state-layer-opacity' : `0.1`,
})

export const PrimaryContainerSnackbarDefinition = createStyleDefinition({
    ...shared,
    'enabled-container-color'                    : Color.PrimaryContainer,
    'enabled-label-color'                   : Color.OnPrimaryContainer,
    'enabled-action-text-color'                  : Color.Primary,
    'enabled-close-icon-color'                   : Color.OnPrimaryContainer,
    'enabled-icon-color'                         : Color.OnPrimaryContainer,
    'hovered-action-state-layer-color'     : Color.Primary,
    'hovered-action-state-layer-opacity'   : `0.08`,
    'focused-action-state-layer-color'     : Color.Primary,
    'focused-action-state-layer-opacity'   : `0.1`,
    'pressed-action-state-layer-color'   : Color.Primary,
    'pressed-action-state-layer-opacity' : `0.1`,
})

export const SecondaryContainerSnackbarDefinition = createStyleDefinition({
    ...shared,
    'enabled-container-color'                    : Color.SecondaryContainer,
    'enabled-label-color'                   : Color.OnSecondaryContainer,
    'enabled-action-text-color'                  : Color.Secondary,
    'enabled-close-icon-color'                   : Color.OnSecondaryContainer,
    'enabled-icon-color'                         : Color.OnSecondaryContainer,
    'hovered-action-state-layer-color'     : Color.Secondary,
    'hovered-action-state-layer-opacity'   : `0.08`,
    'focused-action-state-layer-color'     : Color.Secondary,
    'focused-action-state-layer-opacity'   : `0.1`,
    'pressed-action-state-layer-color'   : Color.Secondary,
    'pressed-action-state-layer-opacity' : `0.1`,
})

export const TertiaryContainerSnackbarDefinition = createStyleDefinition({
    ...shared,
    'enabled-container-color'                    : Color.TertiaryContainer,
    'enabled-label-color'                   : Color.OnTertiaryContainer,
    'enabled-action-text-color'                  : Color.Tertiary,
    'enabled-close-icon-color'                   : Color.OnTertiaryContainer,
    'enabled-icon-color'                         : Color.OnTertiaryContainer,
    'hovered-action-state-layer-color'     : Color.Tertiary,
    'hovered-action-state-layer-opacity'   : `0.08`,
    'focused-action-state-layer-color'     : Color.Tertiary,
    'focused-action-state-layer-opacity'   : `0.1`,
    'pressed-action-state-layer-color'   : Color.Tertiary,
    'pressed-action-state-layer-opacity' : `0.1`,
})

export const ErrorContainerSnackbarDefinition = createStyleDefinition({
    ...shared,
    'enabled-container-color'                    : Color.ErrorContainer,
    'enabled-label-color'                   : Color.OnErrorContainer,
    'enabled-action-text-color'                  : Color.Error,
    'enabled-close-icon-color'                   : Color.OnErrorContainer,
    'enabled-icon-color'                         : Color.OnErrorContainer,
    'hovered-action-state-layer-color'     : Color.Error,
    'hovered-action-state-layer-opacity'   : `0.08`,
    'focused-action-state-layer-color'     : Color.Error,
    'focused-action-state-layer-opacity'   : `0.1`,
    'pressed-action-state-layer-color'   : Color.Error,
    'pressed-action-state-layer-opacity' : `0.1`,
})

/**
 * Default style definition for `mdc-snackbar` (inverse-surface variant).
 * Kept as a convenience alias for consumers who don't need a specific variant.
 */
export const SnackbarDefinition = InverseSurfaceSnackbarDefinition

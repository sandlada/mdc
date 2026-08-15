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
    'label-text-font'                    : Typescale.BodyMedium.Font,
    'label-text-size'                    : Typescale.BodyMedium.FontSize,
    'label-text-weight'                  : Typescale.BodyMedium.FontWeight,
    'label-text-tracking'                : Typescale.BodyMedium.Tracking,
    'label-text-line-height'             : Typescale.BodyMedium.LineHeight,
    'label-padding-inline'               : `4px`,

    // Action — label-large
    'action-font'                        : Typescale.LabelLarge.Font,
    'action-text-size'                   : Typescale.LabelLarge.FontSize,
    'action-text-weight'                 : Typescale.LabelLarge.FontWeight,
    'action-text-tracking'               : Typescale.LabelLarge.Tracking,
    'action-text-line-height'            : Typescale.LabelLarge.LineHeight,
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
    'container-color'                    : Color.SurfaceContainerHigh,
    'label-text-color'                   : Color.OnSurfaceVariant,
    'action-text-color'                  : Color.Primary,
    'close-icon-color'                   : Color.OnSurfaceVariant,
    'icon-color'                         : Color.OnSurfaceVariant,
    'action-hover-state-layer-color'     : Color.Primary,
    'action-hover-state-layer-opacity'   : `0.08`,
    'action-focus-state-layer-color'     : Color.Primary,
    'action-focus-state-layer-opacity'   : `0.1`,
    'action-pressed-state-layer-color'   : Color.Primary,
    'action-pressed-state-layer-opacity' : `0.1`,
})

export const InverseSurfaceSnackbarDefinition = createStyleDefinition({
    ...shared,
    'container-color'                    : Color.InverseSurface,
    'label-text-color'                   : Color.InverseOnSurface,
    'action-text-color'                  : Color.InversePrimary,
    'close-icon-color'                   : Color.InverseOnSurface,
    'icon-color'                         : Color.InverseOnSurface,
    'action-hover-state-layer-color'     : Color.InversePrimary,
    'action-hover-state-layer-opacity'   : `0.08`,
    'action-focus-state-layer-color'     : Color.InversePrimary,
    'action-focus-state-layer-opacity'   : `0.1`,
    'action-pressed-state-layer-color'   : Color.InversePrimary,
    'action-pressed-state-layer-opacity' : `0.1`,
})

export const PrimarySnackbarDefinition = createStyleDefinition({
    ...shared,
    'container-color'                    : Color.Primary,
    'label-text-color'                   : Color.OnPrimary,
    'action-text-color'                  : Color.OnPrimary,
    'close-icon-color'                   : Color.OnPrimary,
    'icon-color'                         : Color.OnPrimary,
    'action-hover-state-layer-color'     : Color.OnPrimary,
    'action-hover-state-layer-opacity'   : `0.08`,
    'action-focus-state-layer-color'     : Color.OnPrimary,
    'action-focus-state-layer-opacity'   : `0.1`,
    'action-pressed-state-layer-color'   : Color.OnPrimary,
    'action-pressed-state-layer-opacity' : `0.1`,
})

export const SecondarySnackbarDefinition = createStyleDefinition({
    ...shared,
    'container-color'                    : Color.Secondary,
    'label-text-color'                   : Color.OnSecondary,
    'action-text-color'                  : Color.OnSecondary,
    'close-icon-color'                   : Color.OnSecondary,
    'icon-color'                         : Color.OnSecondary,
    'action-hover-state-layer-color'     : Color.OnSecondary,
    'action-hover-state-layer-opacity'   : `0.08`,
    'action-focus-state-layer-color'     : Color.OnSecondary,
    'action-focus-state-layer-opacity'   : `0.1`,
    'action-pressed-state-layer-color'   : Color.OnSecondary,
    'action-pressed-state-layer-opacity' : `0.1`,
})

export const TertiarySnackbarDefinition = createStyleDefinition({
    ...shared,
    'container-color'                    : Color.Tertiary,
    'label-text-color'                   : Color.OnTertiary,
    'action-text-color'                  : Color.OnTertiary,
    'close-icon-color'                   : Color.OnTertiary,
    'icon-color'                         : Color.OnTertiary,
    'action-hover-state-layer-color'     : Color.OnTertiary,
    'action-hover-state-layer-opacity'   : `0.08`,
    'action-focus-state-layer-color'     : Color.OnTertiary,
    'action-focus-state-layer-opacity'   : `0.1`,
    'action-pressed-state-layer-color'   : Color.OnTertiary,
    'action-pressed-state-layer-opacity' : `0.1`,
})

export const ErrorSnackbarDefinition = createStyleDefinition({
    ...shared,
    'container-color'                    : Color.Error,
    'label-text-color'                   : Color.OnError,
    'action-text-color'                  : Color.OnError,
    'close-icon-color'                   : Color.OnError,
    'icon-color'                         : Color.OnError,
    'action-hover-state-layer-color'     : Color.OnError,
    'action-hover-state-layer-opacity'   : `0.08`,
    'action-focus-state-layer-color'     : Color.OnError,
    'action-focus-state-layer-opacity'   : `0.1`,
    'action-pressed-state-layer-color'   : Color.OnError,
    'action-pressed-state-layer-opacity' : `0.1`,
})

export const PrimaryContainerSnackbarDefinition = createStyleDefinition({
    ...shared,
    'container-color'                    : Color.PrimaryContainer,
    'label-text-color'                   : Color.OnPrimaryContainer,
    'action-text-color'                  : Color.Primary,
    'close-icon-color'                   : Color.OnPrimaryContainer,
    'icon-color'                         : Color.OnPrimaryContainer,
    'action-hover-state-layer-color'     : Color.Primary,
    'action-hover-state-layer-opacity'   : `0.08`,
    'action-focus-state-layer-color'     : Color.Primary,
    'action-focus-state-layer-opacity'   : `0.1`,
    'action-pressed-state-layer-color'   : Color.Primary,
    'action-pressed-state-layer-opacity' : `0.1`,
})

export const SecondaryContainerSnackbarDefinition = createStyleDefinition({
    ...shared,
    'container-color'                    : Color.SecondaryContainer,
    'label-text-color'                   : Color.OnSecondaryContainer,
    'action-text-color'                  : Color.Secondary,
    'close-icon-color'                   : Color.OnSecondaryContainer,
    'icon-color'                         : Color.OnSecondaryContainer,
    'action-hover-state-layer-color'     : Color.Secondary,
    'action-hover-state-layer-opacity'   : `0.08`,
    'action-focus-state-layer-color'     : Color.Secondary,
    'action-focus-state-layer-opacity'   : `0.1`,
    'action-pressed-state-layer-color'   : Color.Secondary,
    'action-pressed-state-layer-opacity' : `0.1`,
})

export const TertiaryContainerSnackbarDefinition = createStyleDefinition({
    ...shared,
    'container-color'                    : Color.TertiaryContainer,
    'label-text-color'                   : Color.OnTertiaryContainer,
    'action-text-color'                  : Color.Tertiary,
    'close-icon-color'                   : Color.OnTertiaryContainer,
    'icon-color'                         : Color.OnTertiaryContainer,
    'action-hover-state-layer-color'     : Color.Tertiary,
    'action-hover-state-layer-opacity'   : `0.08`,
    'action-focus-state-layer-color'     : Color.Tertiary,
    'action-focus-state-layer-opacity'   : `0.1`,
    'action-pressed-state-layer-color'   : Color.Tertiary,
    'action-pressed-state-layer-opacity' : `0.1`,
})

export const ErrorContainerSnackbarDefinition = createStyleDefinition({
    ...shared,
    'container-color'                    : Color.ErrorContainer,
    'label-text-color'                   : Color.OnErrorContainer,
    'action-text-color'                  : Color.Error,
    'close-icon-color'                   : Color.OnErrorContainer,
    'icon-color'                         : Color.OnErrorContainer,
    'action-hover-state-layer-color'     : Color.Error,
    'action-hover-state-layer-opacity'   : `0.08`,
    'action-focus-state-layer-color'     : Color.Error,
    'action-focus-state-layer-opacity'   : `0.1`,
    'action-pressed-state-layer-color'   : Color.Error,
    'action-pressed-state-layer-opacity' : `0.1`,
})

/**
 * Default style definition for `mdc-snackbar` (inverse-surface variant).
 * Kept as a convenience alias for consumers who don't need a specific variant.
 */
export const SnackbarDefinition = InverseSurfaceSnackbarDefinition

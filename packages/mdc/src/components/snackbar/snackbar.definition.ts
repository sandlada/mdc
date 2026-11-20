/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ElevationLevel, Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, type PrimitiveTokenValue } from '../../utils/style'

/**
 * Shared (non-color) tokens for `mdc-snackbar`.
 *
 * Based on Material Design 3 & Material Components for Android
 * (`Widget.Material3.Snackbar` / `SnackbarContentLayout`):
 *
 * - Container: ExtraSmall (4dp), elevation Level 3 (6dp)
 * - Single-line min-height: 48dp; two-line min-height: 68dp; action-on-new-line min-height: 112dp
 * - Label: body-medium
 * - Action: label-large, TextButton shape
 * - Close icon: 24dp icon inside 40dp state-layer target
 * - Max width: 344dp (single-column mobile) / overridable via token
 */
const Shared = {
    // Container shape & layout
    'container-shape-start-start'             : Shape.ExtraSmall,
    'container-shape-start-end'               : Shape.ExtraSmall,
    'container-shape-end-start'               : Shape.ExtraSmall,
    'container-shape-end-end'                 : Shape.ExtraSmall,
    'container-elevation'                     : ElevationLevel.Level3,
    'container-shadow-color'                  : Color.Shadow,
    'container-min-height'                    : `48px`,
    'container-multiline-min-height'          : `68px`,
    'container-action-on-new-line-min-height' : `112px`,
    'container-max-width'                     : `344px`,
    'container-margin-inline-start'           : `8px`,
    'container-margin-inline-end'             : `8px`,
    'container-margin-block-start'            : `8px`,
    'container-margin-block-end'              : `8px`,
    'container-padding-inline-start'          : `16px`,
    'container-padding-inline-end'            : `8px`,
    'container-padding-block-start'           : `14px`,
    'container-padding-block-end'             : `14px`,
    'container-gap'                           : `8px`,

    // Label — body-medium
    'label-font'                              : Typescale.BodyMedium.Font,
    'label-size'                              : Typescale.BodyMedium.FontSize,
    'label-weight'                            : Typescale.BodyMedium.FontWeight,
    'label-tracking'                          : Typescale.BodyMedium.Tracking,
    'label-leading'                           : Typescale.BodyMedium.LineHeight,
    'label-padding-inline-start'              : `0px`,
    'label-padding-inline-end'                : `0px`,
    'label-padding-block-start'               : `0px`,
    'label-padding-block-end'                 : `0px`,

    // Action — label-large
    'action-font'                             : Typescale.LabelLarge.Font,
    'action-size'                             : Typescale.LabelLarge.FontSize,
    'action-weight'                           : Typescale.LabelLarge.FontWeight,
    'action-tracking'                         : Typescale.LabelLarge.Tracking,
    'action-leading'                          : Typescale.LabelLarge.LineHeight,
    'action-container-shape-start-start'      : Shape.Full,
    'action-container-shape-start-end'        : Shape.Full,
    'action-container-shape-end-start'        : Shape.Full,
    'action-container-shape-end-end'          : Shape.Full,
    'action-padding-inline-start'             : `12px`,
    'action-padding-inline-end'               : `12px`,
    'action-padding-block-start'              : `10px`,
    'action-padding-block-end'                : `10px`,

    // Close icon
    'close-icon-size'                         : `24px`,
    'close-icon-button-size'                  : `40px`,
    'close-icon-padding-inline-start'         : `8px`,
    'close-icon-padding-inline-end'           : `8px`,
    'close-icon-padding-block-start'          : `8px`,
    'close-icon-padding-block-end'            : `8px`,
    'close-icon-shape-start-start'            : Shape.Full,
    'close-icon-shape-start-end'              : Shape.Full,
    'close-icon-shape-end-start'              : Shape.Full,
    'close-icon-shape-end-end'                : Shape.Full,

    // Leading icon
    'icon-size'                               : `24px`,

    // Animation
    'slide-offset'                            : `100%`,
} as const

interface SnackbarVariantColors {
    container: PrimitiveTokenValue
    label: PrimitiveTokenValue
    actionText: PrimitiveTokenValue
    closeIcon: PrimitiveTokenValue
    icon: PrimitiveTokenValue
}

const createSnackbarVariant = (colors: SnackbarVariantColors) => createStyleDefinition({
    ...Shared,
    'enabled-container-color'                  : colors.container,
    'enabled-label-color'                      : colors.label,
    'enabled-action-text-color'                : colors.actionText,
    'enabled-close-icon-color'                 : colors.closeIcon,
    'enabled-icon-color'                       : colors.icon,
    'hovered-action-state-layer-color'         : colors.actionText,
    'hovered-action-state-layer-opacity'       : State.HoveredStateLayerOpacity,
    'focused-action-state-layer-color'         : colors.actionText,
    'focused-action-state-layer-opacity'       : State.FocusedStateLayerOpacity,
    'pressed-action-state-layer-color'         : colors.actionText,
    'pressed-action-state-layer-opacity'       : State.PressedStateLayerOpacity,
    'hovered-close-icon-state-layer-color'     : colors.closeIcon,
    'hovered-close-icon-state-layer-opacity'   : State.HoveredStateLayerOpacity,
    'focused-close-icon-state-layer-color'     : colors.closeIcon,
    'focused-close-icon-state-layer-opacity'   : State.FocusedStateLayerOpacity,
    'pressed-close-icon-state-layer-color'     : colors.closeIcon,
    'pressed-close-icon-state-layer-opacity'   : State.PressedStateLayerOpacity,
})

// ─── Variant Definitions ────────────────────────────────────────────────────

export const SurfaceSnackbarDefinition = createSnackbarVariant({
    container : Color.SurfaceContainerHigh,
    label     : Color.OnSurfaceVariant,
    actionText: Color.Primary,
    closeIcon : Color.OnSurfaceVariant,
    icon      : Color.OnSurfaceVariant,
})

export const InverseSurfaceSnackbarDefinition = createSnackbarVariant({
    container : Color.InverseSurface,
    label     : Color.InverseOnSurface,
    actionText: Color.InversePrimary,
    closeIcon : Color.InverseOnSurface,
    icon      : Color.InverseOnSurface,
})

export const PrimarySnackbarDefinition = createSnackbarVariant({
    container : Color.Primary,
    label     : Color.OnPrimary,
    actionText: Color.OnPrimary,
    closeIcon : Color.OnPrimary,
    icon      : Color.OnPrimary,
})

export const SecondarySnackbarDefinition = createSnackbarVariant({
    container : Color.Secondary,
    label     : Color.OnSecondary,
    actionText: Color.OnSecondary,
    closeIcon : Color.OnSecondary,
    icon      : Color.OnSecondary,
})

export const TertiarySnackbarDefinition = createSnackbarVariant({
    container : Color.Tertiary,
    label     : Color.OnTertiary,
    actionText: Color.OnTertiary,
    closeIcon : Color.OnTertiary,
    icon      : Color.OnTertiary,
})

export const ErrorSnackbarDefinition = createSnackbarVariant({
    container : Color.Error,
    label     : Color.OnError,
    actionText: Color.OnError,
    closeIcon : Color.OnError,
    icon      : Color.OnError,
})

export const PrimaryContainerSnackbarDefinition = createSnackbarVariant({
    container : Color.PrimaryContainer,
    label     : Color.OnPrimaryContainer,
    actionText: Color.Primary,
    closeIcon : Color.OnPrimaryContainer,
    icon      : Color.OnPrimaryContainer,
})

export const SecondaryContainerSnackbarDefinition = createSnackbarVariant({
    container : Color.SecondaryContainer,
    label     : Color.OnSecondaryContainer,
    actionText: Color.Secondary,
    closeIcon : Color.OnSecondaryContainer,
    icon      : Color.OnSecondaryContainer,
})

export const TertiaryContainerSnackbarDefinition = createSnackbarVariant({
    container : Color.TertiaryContainer,
    label     : Color.OnTertiaryContainer,
    actionText: Color.Tertiary,
    closeIcon : Color.OnTertiaryContainer,
    icon      : Color.OnTertiaryContainer,
})

export const ErrorContainerSnackbarDefinition = createSnackbarVariant({
    container : Color.ErrorContainer,
    label     : Color.OnErrorContainer,
    actionText: Color.Error,
    closeIcon : Color.OnErrorContainer,
    icon      : Color.OnErrorContainer,
})

/**
 * Default style definition for `mdc-snackbar` (inverse-surface variant).
 * Kept as a convenience alias for consumers who don't need a specific variant.
 */
export const SnackbarDefinition = InverseSurfaceSnackbarDefinition

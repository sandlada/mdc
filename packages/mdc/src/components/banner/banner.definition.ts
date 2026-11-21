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
    type PrimitiveTokenValue,
} from '../../utils/style'

/**
 * Shared (non-color) tokens for `mdc-banner`.
 *
 * Based on Material Design Banner & Android (`MaterialBannerView`) specifications:
 * - Full-width in-flow container, 0dp elevation with 1px bottom hairline divider
 * - Single-line min-height: 52px; stacked padding: 16px top / 8px bottom
 * - Leading icon: 24px icon, optional 40px circular icon container
 * - Headline: TitleSmall; Supporting text: BodyMedium
 * - Actions: LabelLarge TextButtons, 40px height, Full pill shape
 */
const Shared = {
    // Container geometry
    ...expandShape('container-shape')(Shape.None),
    'container-min-height'     : `52px`,
    'container-gap'            : `16px`,
    'container-actions-gap'    : `8px`,
    'container-text-gap'       : `2px`,
    'container-stacked-row-gap': `12px`,
    ...expandPadding('container-padding')({
        blockStart : `10px`,
        blockEnd   : `10px`,
        inlineStart: `16px`,
        inlineEnd  : `8px`,
    }),
    ...expandPadding('stacked-container-padding')({
        blockStart : `16px`,
        blockEnd   : `8px`,
        inlineStart: `16px`,
        inlineEnd  : `8px`,
    }),

    // Leading icon
    'icon-size'          : `24px`,
    'icon-container-size': `40px`,
    ...expandShape('icon-container-shape')(Shape.Full),

    // Typography
    ...expandTypescale('headline')(Typescale.TitleSmall),
    ...expandTypescale('supporting-text')(Typescale.BodyMedium),
    ...expandTypescale('action')(Typescale.LabelLarge),

    // Action button geometry
    'action-min-height': `40px`,
    ...expandShape('action-container-shape')(Shape.Full),
    ...expandPadding('action-padding')({
        block : `10px`,
        inline: `12px`,
    }),

    // Divider
    'divider-thickness': `1px`,
} as const

interface BannerVariantColors {
    container: PrimitiveTokenValue
    headline: PrimitiveTokenValue
    supportingText: PrimitiveTokenValue
    icon: PrimitiveTokenValue
    iconContainer: PrimitiveTokenValue
    iconContainerIcon: PrimitiveTokenValue
    actionText: PrimitiveTokenValue
    divider: PrimitiveTokenValue
}

const createBannerVariant = (colors: BannerVariantColors) => createStyleDefinition({
    ...Shared,
    'enabled-container-color'             : colors.container,
    'enabled-headline-color'              : colors.headline,
    'enabled-supporting-text-color'       : colors.supportingText,
    'enabled-icon-color'                  : colors.icon,
    'enabled-icon-container-color'        : colors.iconContainer,
    'enabled-icon-container-icon-color'   : colors.iconContainerIcon,
    'enabled-action-text-color'           : colors.actionText,
    'enabled-divider-color'               : colors.divider,
    'hovered-action-state-layer-color'    : colors.actionText,
    'hovered-action-state-layer-opacity'  : State.HoveredStateLayerOpacity,
    'focused-action-state-layer-color'    : colors.actionText,
    'focused-action-state-layer-opacity'  : State.FocusedStateLayerOpacity,
    'pressed-action-state-layer-color'    : colors.actionText,
    'pressed-action-state-layer-opacity'  : State.PressedStateLayerOpacity,
})

// ─── Variant Definitions ────────────────────────────────────────────────────

export const SurfaceBannerDefinition = createBannerVariant({
    container        : Color.Surface,
    headline         : Color.OnSurface,
    supportingText   : Color.OnSurface,
    icon             : Color.Primary,
    iconContainer    : Color.PrimaryContainer,
    iconContainerIcon: Color.OnPrimaryContainer,
    actionText       : Color.Primary,
    divider          : Color.OutlineVariant,
})

export const SurfaceContainerBannerDefinition = createBannerVariant({
    container        : Color.SurfaceContainerLow,
    headline         : Color.OnSurface,
    supportingText   : Color.OnSurfaceVariant,
    icon             : Color.Primary,
    iconContainer    : Color.PrimaryContainer,
    iconContainerIcon: Color.OnPrimaryContainer,
    actionText       : Color.Primary,
    divider          : Color.OutlineVariant,
})

export const PrimaryContainerBannerDefinition = createBannerVariant({
    container        : Color.PrimaryContainer,
    headline         : Color.OnPrimaryContainer,
    supportingText   : Color.OnPrimaryContainer,
    icon             : Color.OnPrimaryContainer,
    iconContainer    : Color.Primary,
    iconContainerIcon: Color.OnPrimary,
    actionText       : Color.OnPrimaryContainer,
    divider          : Color.OutlineVariant,
})

export const SecondaryContainerBannerDefinition = createBannerVariant({
    container        : Color.SecondaryContainer,
    headline         : Color.OnSecondaryContainer,
    supportingText   : Color.OnSecondaryContainer,
    icon             : Color.OnSecondaryContainer,
    iconContainer    : Color.Secondary,
    iconContainerIcon: Color.OnSecondary,
    actionText       : Color.OnSecondaryContainer,
    divider          : Color.OutlineVariant,
})

export const TertiaryContainerBannerDefinition = createBannerVariant({
    container        : Color.TertiaryContainer,
    headline         : Color.OnTertiaryContainer,
    supportingText   : Color.OnTertiaryContainer,
    icon             : Color.OnTertiaryContainer,
    iconContainer    : Color.Tertiary,
    iconContainerIcon: Color.OnTertiary,
    actionText       : Color.OnTertiaryContainer,
    divider          : Color.OutlineVariant,
})

export const ErrorContainerBannerDefinition = createBannerVariant({
    container        : Color.ErrorContainer,
    headline         : Color.OnErrorContainer,
    supportingText   : Color.OnErrorContainer,
    icon             : Color.OnErrorContainer,
    iconContainer    : Color.Error,
    iconContainerIcon: Color.OnError,
    actionText       : Color.OnErrorContainer,
    divider          : Color.OutlineVariant,
})

export const InverseSurfaceBannerDefinition = createBannerVariant({
    container        : Color.InverseSurface,
    headline         : Color.InverseOnSurface,
    supportingText   : Color.InverseOnSurface,
    icon             : Color.InversePrimary,
    iconContainer    : Color.InversePrimary,
    iconContainerIcon: Color.OnPrimaryContainer,
    actionText       : Color.InversePrimary,
    divider          : Color.OutlineVariant,
})

/** Default BannerDefinition (`surface` variant). */
export const BannerDefinition = SurfaceBannerDefinition

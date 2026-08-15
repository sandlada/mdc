/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape, Typescale } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

/**
 * Style definition for `mdc-tooltip`.
 *
 * Based on Material Components for Android `Widget.Material3.Tooltip`:
 *
 * Plain tooltip:
 * - Background: InverseSurface (colorPrimary in M3 theme overlay)
 * - Text: InverseOnSurface (colorOnPrimary)
 * - Shape: Full (pill shape)
 * - Padding: 4dp
 * - Min size: 28dp
 * - Margin: 2dp
 * - Text: body-small
 *
 * Rich tooltip (from Jetpack Compose):
 * - Background: SurfaceContainer
 * - Shape: Medium (12dp)
 * - Elevation: Level 2
 * - Padding: 16dp
 * - Text: body-medium
 * - Headline: title-small
 */

// Plain Tooltip — Widget.Material3.Tooltip
export const PlainTooltipDefinition = createStyleDefinition({
    'container-color'            : Color.InverseSurface,
    'container-shape-start-start': Shape.Full,
    'container-shape-start-end'  : Shape.Full,
    'container-shape-end-start'  : Shape.Full,
    'container-shape-end-end'    : Shape.Full,
    'container-padding-inline'   : `8px`,
    'container-padding-block'    : `4px`,
    'container-min-width'        : `28px`,
    'container-min-height'       : `28px`,
    'container-max-width'        : `200px`,
    'container-margin'           : `2px`,

    'label-text-font'            : Typescale.BodySmall.Font,
    'label-text-size'            : Typescale.BodySmall.FontSize,
    'label-text-weight'          : Typescale.BodySmall.FontWeight,
    'label-text-tracking'        : Typescale.BodySmall.Tracking,
    'label-text-line-height'     : Typescale.BodySmall.LineHeight,
    'label-text-color'           : Color.InverseOnSurface,
})

// Rich Tooltip — Jetpack Compose RichTooltip
export const RichTooltipDefinition = createStyleDefinition({
    'container-color'            : Color.SurfaceContainer,
    'container-shape-start-start': Shape.Medium,
    'container-shape-start-end'  : Shape.Medium,
    'container-shape-end-start'  : Shape.Medium,
    'container-shape-end-end'    : Shape.Medium,
    'container-elevation'        : `2`,
    'container-shadow-color'     : Color.Shadow,
    'container-padding'          : `16px`,
    'container-max-width'        : `320px`,

    'label-text-font'            : Typescale.BodyMedium.Font,
    'label-text-size'            : Typescale.BodyMedium.FontSize,
    'label-text-weight'          : Typescale.BodyMedium.FontWeight,
    'label-text-tracking'        : Typescale.BodyMedium.Tracking,
    'label-text-line-height'     : Typescale.BodyMedium.LineHeight,
    'label-text-color'           : Color.OnSurface,

    'headline-text-font'         : Typescale.TitleSmall.Font,
    'headline-text-size'         : Typescale.TitleSmall.FontSize,
    'headline-text-weight'       : Typescale.TitleSmall.FontWeight,
    'headline-text-tracking'     : Typescale.TitleSmall.Tracking,
    'headline-text-line-height'  : Typescale.TitleSmall.LineHeight,
    'headline-text-color'        : Color.OnSurface,
    'headline-padding-block'     : `8px`,

    'actions-gap'                : `8px`,
    'actions-padding-block'      : `8px`,
})

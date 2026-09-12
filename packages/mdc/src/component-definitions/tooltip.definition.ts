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
    'enabled-container-color'            : Color.InverseSurface,
    'container-shape-start-start'        : Shape.Full,
    'container-shape-start-end'          : Shape.Full,
    'container-shape-end-start'          : Shape.Full,
    'container-shape-end-end'            : Shape.Full,
    'container-padding-inline-start'     : `8px`,
    'container-padding-inline-end'       : `8px`,
    'container-padding-block-start'      : `4px`,
    'container-padding-block-end'        : `4px`,
    'container-min-width'                : `28px`,
    'container-min-height'               : `28px`,
    'container-max-width'                : `200px`,
    'container-margin-inline-start'      : `2px`,
    'container-margin-inline-end'        : `2px`,
    'container-margin-block-start'       : `2px`,
    'container-margin-block-end'         : `2px`,

    'label-font'                         : Typescale.BodySmall.Font,
    'label-size'                         : Typescale.BodySmall.FontSize,
    'label-weight'                       : Typescale.BodySmall.FontWeight,
    'label-tracking'                     : Typescale.BodySmall.Tracking,
    'label-line-height'                  : Typescale.BodySmall.LineHeight,
    'enabled-label-color'                : Color.InverseOnSurface,
})

// Rich Tooltip — Jetpack Compose RichTooltip
export const RichTooltipDefinition = createStyleDefinition({
    'enabled-container-color'            : Color.SurfaceContainer,
    'container-shape-start-start'        : Shape.Medium,
    'container-shape-start-end'          : Shape.Medium,
    'container-shape-end-start'          : Shape.Medium,
    'container-shape-end-end'            : Shape.Medium,
    'enabled-container-elevation'        : `2`,
    'enabled-container-shadow-color'     : Color.Shadow,
    'container-padding-inline-start'     : `16px`,
    'container-padding-inline-end'       : `16px`,
    'container-padding-block-start'      : `16px`,
    'container-padding-block-end'        : `16px`,
    'container-max-width'                : `320px`,

    'label-font'                         : Typescale.BodyMedium.Font,
    'label-size'                         : Typescale.BodyMedium.FontSize,
    'label-weight'                       : Typescale.BodyMedium.FontWeight,
    'label-tracking'                     : Typescale.BodyMedium.Tracking,
    'label-line-height'                  : Typescale.BodyMedium.LineHeight,
    'enabled-label-color'                : Color.OnSurface,

    'headline-font'                      : Typescale.TitleSmall.Font,
    'headline-size'                      : Typescale.TitleSmall.FontSize,
    'headline-weight'                    : Typescale.TitleSmall.FontWeight,
    'headline-tracking'                  : Typescale.TitleSmall.Tracking,
    'headline-line-height'               : Typescale.TitleSmall.LineHeight,
    'enabled-headline-color'             : Color.OnSurface,
    'headline-padding-inline-start'      : `0px`,
    'headline-padding-inline-end'        : `0px`,
    'headline-padding-block-start'       : `0px`,
    'headline-padding-block-end'         : `8px`,

    'actions-gap'                        : `8px`,
    'actions-padding-inline-start'       : `0px`,
    'actions-padding-inline-end'         : `0px`,
    'actions-padding-block-start'        : `8px`,
    'actions-padding-block-end'          : `0px`,
})

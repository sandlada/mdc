/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ElevationLevel, Shape, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition } from '../../utils/style'

/**
 * Style definition for `mdc-tooltip`.
 *
 * Aligned with Material Design 3 Figma Design Kit & Jetpack Compose
 * (`PlainTooltipTokens`, `RichTooltipTokens`, `Tooltip.kt`):
 *
 * Plain tooltip:
 * - Background: InverseSurface
 * - Text: InverseOnSurface
 * - Shape: ExtraSmall (4dp)
 * - Padding: 4dp vertical, 8dp horizontal
 * - Min size: 40dp x 24dp, Max width: 200dp
 * - Spacing to anchor: 4dp
 * - Text: body-small
 * - Caret: 16dp x 8dp (optional)
 *
 * Rich tooltip:
 * - Background: SurfaceContainer
 * - Shape: Medium (12dp)
 * - Elevation: Level 2 (3dp)
 * - Padding: 12dp top, 16dp horizontal, 12dp bottom (8dp bottom with actions)
 * - Max width: 320dp
 * - Subhead: title-small, OnSurfaceVariant, 4dp bottom gap
 * - Text: body-medium, OnSurfaceVariant
 * - Actions: start-aligned, 8dp top gap, Primary label-large
 * - Caret: 16dp x 8dp (optional)
 */

export const PlainTooltipDefinition = createStyleDefinition({
    'enabled-container-color'            : Color.InverseSurface,
    'container-shape-start-start'        : Shape.ExtraSmall,
    'container-shape-start-end'          : Shape.ExtraSmall,
    'container-shape-end-start'          : Shape.ExtraSmall,
    'container-shape-end-end'            : Shape.ExtraSmall,
    'container-padding-inline-start'     : `8px`,
    'container-padding-inline-end'       : `8px`,
    'container-padding-block-start'      : `4px`,
    'container-padding-block-end'        : `4px`,
    'container-min-width'                : `40px`,
    'container-min-height'               : `24px`,
    'container-max-width'                : `200px`,
    'container-margin-inline-start'      : `4px`,
    'container-margin-inline-end'        : `4px`,
    'container-margin-block-start'       : `4px`,
    'container-margin-block-end'         : `4px`,

    'label-font'                         : Typescale.BodySmall.Font,
    'label-size'                         : Typescale.BodySmall.FontSize,
    'label-weight'                       : Typescale.BodySmall.FontWeight,
    'label-tracking'                     : Typescale.BodySmall.Tracking,
    'label-leading'                      : Typescale.BodySmall.LineHeight,
    'enabled-label-color'                : Color.InverseOnSurface,

    'caret-width'                        : `16px`,
    'caret-height'                       : `8px`,
})

export const RichTooltipDefinition = createStyleDefinition({
    'enabled-container-color'            : Color.SurfaceContainer,
    'container-shape-start-start'        : Shape.Medium,
    'container-shape-start-end'          : Shape.Medium,
    'container-shape-end-start'          : Shape.Medium,
    'container-shape-end-end'            : Shape.Medium,
    'enabled-container-elevation'        : ElevationLevel.Level2,
    'enabled-container-shadow-color'     : Color.Shadow,
    'container-padding-inline-start'     : `16px`,
    'container-padding-inline-end'       : `16px`,
    'container-padding-block-start'      : `12px`,
    'container-padding-block-end'        : `12px`,
    'container-actions-padding-block-end': `8px`,
    'container-min-width'                : `40px`,
    'container-max-width'                : `320px`,
    'container-margin-inline-start'      : `4px`,
    'container-margin-inline-end'        : `4px`,
    'container-margin-block-start'       : `4px`,
    'container-margin-block-end'         : `4px`,

    'label-font'                         : Typescale.BodyMedium.Font,
    'label-size'                         : Typescale.BodyMedium.FontSize,
    'label-weight'                       : Typescale.BodyMedium.FontWeight,
    'label-tracking'                     : Typescale.BodyMedium.Tracking,
    'label-leading'                      : Typescale.BodyMedium.LineHeight,
    'enabled-label-color'                : Color.OnSurfaceVariant,

    'headline-font'                      : Typescale.TitleSmall.Font,
    'headline-size'                      : Typescale.TitleSmall.FontSize,
    'headline-weight'                    : Typescale.TitleSmall.FontWeight,
    'headline-tracking'                  : Typescale.TitleSmall.Tracking,
    'headline-leading'                   : Typescale.TitleSmall.LineHeight,
    'enabled-headline-color'             : Color.OnSurfaceVariant,
    'headline-padding-inline-start'      : `0px`,
    'headline-padding-inline-end'        : `0px`,
    'headline-padding-block-start'       : `0px`,
    'headline-padding-block-end'         : `4px`,

    'actions-gap'                        : `8px`,
    'actions-padding-inline-start'       : `0px`,
    'actions-padding-inline-end'         : `0px`,
    'actions-padding-block-start'        : `8px`,
    'actions-padding-block-end'          : `0px`,
    'enabled-action-label-color'         : Color.Primary,

    'caret-width'                        : `16px`,
    'caret-height'                       : `8px`,
})

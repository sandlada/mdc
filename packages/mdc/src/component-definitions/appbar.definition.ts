/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @implements
 * - small-app-bar
 * - center-aligned-app-bar
 * - medium-flexible-app-bar
 * - large-flexible-app-bar
 * - search-app-bar
 *
 * @link
 * https://m3.material.io/components/app-bars/specs
 */
import { ElevationLevel, Shape, Typescale } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

export const AppBarDefinition = createStyleDefinition({
    // Container colors
    'enabled-container-color'                               : Color.Surface,
    'enabled-container-color-scrolled'                      : Color.SurfaceContainer,
    'enabled-container-elevation'                           : ElevationLevel.Level0,
    'enabled-container-elevation-scrolled'                  : ElevationLevel.Level2,
    'enabled-container-shadow-color'                        : Color.Shadow,

    // Container shapes
    'enabled-container-shape-start-start'                   : Shape.None,
    'enabled-container-shape-start-end'                     : Shape.None,
    'enabled-container-shape-end-start'                     : Shape.None,
    'enabled-container-shape-end-end'                       : Shape.None,

    // Container padding (4px edge padding to 48px touch targets)
    'enabled-container-padding-inline-start'                : `4px`,
    'enabled-container-padding-inline-end'                  : `4px`,
    'enabled-container-padding-block-start'                 : `0px`,
    'enabled-container-padding-block-end'                   : `0px`,

    // Variant heights (from measurements.png & measurements2.png)
    'enabled-small-container-height'                        : `64px`,
    'enabled-medium-container-min-height'                   : `112px`,
    'enabled-large-container-min-height'                    : `120px`,
    'enabled-search-container-height'                       : `64px`,

    // Touch targets & icon sizes
    'enabled-icon-button-size'                              : `48px`,
    'enabled-icon-size'                                     : `24px`,

    // Gaps and Spacing (Small app bar: 4px button-to-title gap, 0px between 48px action buttons)
    'enabled-title-gap-space'                               : `4px`,
    'enabled-title-without-leading-inline-leading-space'    : `16px`,
    'enabled-actions-gap-space'                             : `0px`,

    // Flexible content padding (16px left/right, 12px bottom in MD3 Expressive)
    'enabled-flexible-content-padding-inline-start'         : `16px`,
    'enabled-flexible-content-padding-inline-end'           : `16px`,
    'enabled-flexible-content-padding-block-start'          : `0px`,
    'enabled-flexible-content-padding-block-end'            : `12px`,
    'enabled-flexible-top-row-height'                       : `56px`,

    // Foreground colors
    'enabled-headline-color'                                : Color.OnSurface,
    'enabled-subtitle-color'                                : Color.OnSurfaceVariant,
    'enabled-leading-icon-color'                            : Color.OnSurface,
    'enabled-trailing-icon-color'                           : Color.OnSurfaceVariant,

    // Search bar tokens (8px outer gap, 48px height, 16px internal padding, 8px/4px internal gaps)
    'enabled-search-box-container-color'                    : Color.SurfaceContainer,
    'enabled-search-box-container-color-scrolled'           : Color.SurfaceContainerHighest,
    'enabled-search-box-text-color'                         : Color.OnSurface,
    'enabled-search-box-placeholder-color'                  : Color.OnSurfaceVariant,
    'enabled-search-box-icon-color'                         : Color.OnSurfaceVariant,
    'enabled-search-box-height'                             : `48px`,
    'enabled-search-box-gap-space'                          : `8px`,
    'enabled-search-box-padding-inline-start'               : `16px`,
    'enabled-search-box-padding-inline-end'                 : `16px`,
    'enabled-search-box-padding-block-start'                : `0px`,
    'enabled-search-box-padding-block-end'                  : `0px`,
    'enabled-search-box-shape-start-start'                  : Shape.Full,
    'enabled-search-box-shape-start-end'                    : Shape.Full,
    'enabled-search-box-shape-end-start'                    : Shape.Full,
    'enabled-search-box-shape-end-end'                      : Shape.Full,

    // Typography: Small headline (title-large)
    'enabled-small-headline-font'                           : Typescale.TitleLarge.Font,
    'enabled-small-headline-line-height'                    : Typescale.TitleLarge.LineHeight,
    'enabled-small-headline-size'                           : Typescale.TitleLarge.FontSize,
    'enabled-small-headline-tracking'                       : Typescale.TitleLarge.Tracking,
    'enabled-small-headline-weight'                         : Typescale.TitleLarge.FontWeight,
    'enabled-small-headline-opacity'                        : `1`,

    // Typography: Medium headline (headline-medium)
    'enabled-medium-headline-font'                          : Typescale.HeadlineMedium.Font,
    'enabled-medium-headline-line-height'                   : Typescale.HeadlineMedium.LineHeight,
    'enabled-medium-headline-size'                          : Typescale.HeadlineMedium.FontSize,
    'enabled-medium-headline-tracking'                      : Typescale.HeadlineMedium.Tracking,
    'enabled-medium-headline-weight'                        : Typescale.HeadlineMedium.FontWeight,
    'enabled-medium-headline-opacity'                       : `1`,

    // Typography: Large headline (display-small)
    'enabled-large-headline-font'                           : Typescale.DisplaySmall.Font,
    'enabled-large-headline-line-height'                    : Typescale.DisplaySmall.LineHeight,
    'enabled-large-headline-size'                           : Typescale.DisplaySmall.FontSize,
    'enabled-large-headline-tracking'                       : Typescale.DisplaySmall.Tracking,
    'enabled-large-headline-weight'                         : Typescale.DisplaySmall.FontWeight,
    'enabled-large-headline-opacity'                        : `1`,

    // Typography: Subtitle (body-medium)
    'enabled-subtitle-font'                                 : Typescale.BodyMedium.Font,
    'enabled-subtitle-line-height'                          : Typescale.BodyMedium.LineHeight,
    'enabled-subtitle-size'                                 : Typescale.BodyMedium.FontSize,
    'enabled-subtitle-tracking'                             : Typescale.BodyMedium.Tracking,
    'enabled-subtitle-weight'                               : Typescale.BodyMedium.FontWeight,
    'enabled-subtitle-opacity'                              : `1`,

    // Typography: Search placeholder/input (body-large)
    'enabled-search-text-font'                              : Typescale.BodyLarge.Font,
    'enabled-search-text-line-height'                       : Typescale.BodyLarge.LineHeight,
    'enabled-search-text-size'                              : Typescale.BodyLarge.FontSize,
    'enabled-search-text-tracking'                          : Typescale.BodyLarge.Tracking,
    'enabled-search-text-weight'                            : Typescale.BodyLarge.FontWeight,
    'enabled-search-text-opacity'                           : `1`,
})

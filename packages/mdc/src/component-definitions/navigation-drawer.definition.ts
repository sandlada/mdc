/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ElevationLevel, Shape, Space, Typescale } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

/**
 * Style definitions for `mdc-navigation-drawer`.
 *
 * Follows Material Design 3 Navigation Drawer specifications:
 * https://m3.material.io/components/navigation-drawer/specs
 * https://m3.material.io/components/navigation-drawer/overview
 *
 * Specs:
 * - Container Width: 360px (Standard / Modal)
 * - Container Height: 100%
 * - Modal Container Shape: 0 top-left, 16px (Shape.Large) top-right, 16px bottom-right, 0 bottom-left (docked on start edge)
 * - Standard / Permanent Container Shape: 0 (Shape.None)
 * - Modal Container Color: SurfaceContainerLow (Tonal Level 1)
 * - Standard / Permanent Container Color: Surface
 * - Scrim: Scrim color with 0.38 (38%) opacity
 * - Headline: TitleSmall typography, OnSurfaceVariant color, 28px inline padding
 * - Inner Destinations: 336px width, 12px inline padding, 4px gap
 */

const sharedStructural = {
    // Container size
    'enabled-container-width'                                : `360px`,

    // Container shapes for start-docked resting state
    'enabled-container-shape-start-start'                    : Shape.None,
    'enabled-container-shape-start-end'                      : Shape.Large,
    'enabled-container-shape-end-end'                        : Shape.Large,
    'enabled-container-shape-end-start'                      : Shape.None,

    // Dragged shape (all corners rounded when floating/dragged)
    'dragged-container-shape-start-start'                    : Shape.Large,
    'dragged-container-shape-start-end'                      : Shape.Large,
    'dragged-container-shape-end-end'                        : Shape.Large,
    'dragged-container-shape-end-start'                      : Shape.Large,

    // Container elevation
    'enabled-container-elevation'                            : ElevationLevel.Level1,
    'container-shadow-color'                                 : Color.Shadow,

    // Header section padding
    'header-container-inline-leading-padding-space'          : `28px`,
    'header-container-inline-trailing-padding-space'         : `28px`,
    'header-container-block-leading-padding-space'           : `16px`,
    'header-container-block-trailing-padding-space'          : `16px`,

    // Headline typography & padding (MD3 TitleSmall)
    'headline-container-inline-leading-padding-space'        : `28px`,
    'headline-container-inline-trailing-padding-space'       : `28px`,
    'headline-container-block-leading-padding-space'         : `16px`,
    'headline-container-block-trailing-padding-space'        : `16px`,

    'enabled-headline-font'                                  : Typescale.TitleSmall.Font,
    'enabled-headline-line-height'                           : Typescale.TitleSmall.LineHeight,
    'enabled-headline-size'                                  : Typescale.TitleSmall.FontSize,
    'enabled-headline-tracking'                              : Typescale.TitleSmall.Tracking,
    'enabled-headline-weight'                                : Typescale.TitleSmall.FontWeight,

    // Destinations list container padding (360px container - 2*12px = 336px destination tabs)
    'content-container-inline-leading-padding-space'         : `12px`,
    'content-container-inline-trailing-padding-space'        : `12px`,
    'content-container-block-leading-padding-space'          : `0px`,
    'content-container-block-trailing-padding-space'         : `12px`,
    'content-item-gap'                                       : `0px`,

    // Footer section padding
    'footer-container-inline-leading-padding-space'          : `12px`,
    'footer-container-inline-trailing-padding-space'         : `12px`,
    'footer-container-block-leading-padding-space'           : `12px`,
    'footer-container-block-trailing-padding-space'          : `16px`,

    // Scrim
    'scrim-color'                                            : Color.Scrim,
    'scrim-opacity'                                          : `0.38`,
} as const

/**
 * Modal navigation drawer — overlay with scrim, `surface-container-low` background.
 */
export const ModalNavigationDrawerDefinition = createStyleDefinition({
    ...sharedStructural,
    'enabled-container-color'           : Color.SurfaceContainerLow,
    'enabled-headline-color'            : Color.OnSurfaceVariant,
    'enabled-divider-color'             : Color.OutlineVariant,
})

/**
 * Standard / dismissible navigation drawer — in-flow, `surface` background, no scrim.
 */
export const StandardNavigationDrawerDefinition = createStyleDefinition({
    ...sharedStructural,
    'enabled-container-shape-start-start': Shape.None,
    'enabled-container-shape-start-end'  : Shape.None,
    'enabled-container-shape-end-end'    : Shape.None,
    'enabled-container-shape-end-start'  : Shape.None,
    'enabled-container-elevation'        : ElevationLevel.Level0,
    'enabled-container-color'            : Color.Surface,
    'enabled-headline-color'             : Color.OnSurfaceVariant,
    'enabled-divider-color'              : Color.OutlineVariant,
})

/**
 * Permanent navigation drawer — persistent fixed in-flow panel.
 */
export const PermanentNavigationDrawerDefinition = createStyleDefinition({
    ...sharedStructural,
    'enabled-container-shape-start-start': Shape.None,
    'enabled-container-shape-start-end'  : Shape.None,
    'enabled-container-shape-end-end'    : Shape.None,
    'enabled-container-shape-end-start'  : Shape.None,
    'enabled-container-elevation'        : ElevationLevel.Level0,
    'enabled-container-color'            : Color.Surface,
    'enabled-headline-color'             : Color.OnSurfaceVariant,
    'enabled-divider-color'              : Color.OutlineVariant,
})

/** Default definition — Modal variant */
export const NavigationDrawerDefinition = ModalNavigationDrawerDefinition

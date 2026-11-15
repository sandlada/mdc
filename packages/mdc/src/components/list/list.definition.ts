/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandPadding, expandShape, expandTypescale } from '../../utils/style'

/**
 * Style definition for `mdc-list`.
 *
 * Based on the Material Design 3 Expressive list specification:
 * - Segmented gap: `2px` (`ListTokens.SegmentedGap`)
 * - Standard gap: `0px`
 * - Divider color: `OutlineVariant`
 */
export const ListDefinition = createStyleDefinition({
    'enabled-standard-gap'  : `0px`,
    'enabled-segmented-gap' : `2px`,
    'enabled-divider-color' : Color.OutlineVariant,
})

/**
 * Style definition for `mdc-list-item`.
 *
 * Based on the Material Design 3 Expressive list item specification (`ListTokens` / `MDC-Android`):
 *
 * - Container heights: `56px` (one-line) / `72px` (two-line) / `88px` (three-line)
 * - Padding: `10px` block, `16px` inline; `12px` gap between leading / content / trailing
 * - Standard shape: `0px` (`Shape.None`), `16px` (`Shape.Large`) when selected
 * - Segmented shapes: `16px` (`Shape.Large`) outer corners, `4px` (`Shape.ExtraSmall`) inner corners;
 *   morphs to `12px` (`Shape.Medium`) on hover and `16px` (`Shape.Large`) on focus / press / selected
 * - Typography: headline `BodyLarge`, supporting text `BodyMedium`, overline `LabelSmall`,
 *   trailing supporting text `LabelSmall`, avatar label `TitleMedium`
 * - Leading media: icon `24px`, avatar `40px` (`Shape.Full`), image `56px × 56px` (`Shape.Small`),
 *   video `100px × 56px` (`Shape.Small`)
 * - Selected state: `SecondaryContainer` / `OnSecondaryContainer`
 * - State layers: `OnSurface` at `8%` / `10%` / `10%` (hover / focus / press)
 * - Disabled: `OnSurface` at `38%` opacity
 *
 * @link
 * https://m3.material.io/components/lists/specs
 */
export const ListItemDefinition = createStyleDefinition({
    // Container geometry
    ...expandShape('enabled-container-shape')(Shape.None),
    ...expandShape('enabled-segmented-single-container-shape')(Shape.Large),
    ...expandShape('enabled-segmented-first-container-shape')({
        startStart: Shape.Large,
        startEnd: Shape.Large,
        endStart: Shape.ExtraSmall,
        endEnd: Shape.ExtraSmall,
    }),
    ...expandShape('enabled-segmented-middle-container-shape')(Shape.ExtraSmall),
    ...expandShape('enabled-segmented-last-container-shape')({
        startStart: Shape.ExtraSmall,
        startEnd: Shape.ExtraSmall,
        endStart: Shape.Large,
        endEnd: Shape.Large,
    }),

    // Expressive interactive state shapes
    ...expandShape('hovered-container-shape')(Shape.Medium),
    ...expandShape('focused-container-shape')(Shape.Large),
    ...expandShape('pressed-container-shape')(Shape.Large),
    ...expandShape('enabled-selected-container-shape')(Shape.Large),
    ...expandShape('enabled-swiped-container-shape')(Shape.Large),

    'one-line-container-height'   : `56px`,
    'two-line-container-height'   : `72px`,
    'three-line-container-height' : `88px`,

    ...expandPadding('enabled-container-padding')({ block: '10px', inline: '16px' }),
    'enabled-between-space'       : `12px`,
    'enabled-trailing-gap'        : `8px`,

    // Container colors
    'enabled-container-color'             : `transparent`,
    'hovered-container-color'             : `transparent`,
    'focused-container-color'             : `transparent`,
    'pressed-container-color'             : `transparent`,
    'disabled-container-color'            : `transparent`,

    'enabled-segmented-container-color'   : Color.Surface,
    'disabled-segmented-container-color'  : Color.Surface,

    'enabled-container-color-selected'    : Color.SecondaryContainer,
    'hovered-container-color-selected'    : Color.SecondaryContainer,
    'focused-container-color-selected'    : Color.SecondaryContainer,
    'pressed-container-color-selected'    : Color.SecondaryContainer,
    'disabled-container-color-selected'   : Color.OnSurface,

    // Headline label — BodyLarge
    ...expandTypescale('enabled-label')(Typescale.BodyLarge),
    'enabled-label-color'                 : Color.OnSurface,
    'enabled-label-color-selected'        : Color.OnSecondaryContainer,
    'disabled-label-color'                : Color.OnSurface,

    // Supporting text — BodyMedium
    ...expandTypescale('enabled-supporting-text')(Typescale.BodyMedium),
    'enabled-supporting-text-color'         : Color.OnSurfaceVariant,
    'enabled-supporting-text-color-selected': Color.OnSecondaryContainer,
    'disabled-supporting-text-color'        : Color.OnSurface,

    // Overline — LabelSmall
    ...expandTypescale('enabled-overline')(Typescale.LabelSmall),
    'enabled-overline-color'              : Color.OnSurfaceVariant,
    'enabled-overline-color-selected'     : Color.OnSecondaryContainer,
    'disabled-overline-color'             : Color.OnSurface,

    // Trailing supporting text — LabelSmall
    ...expandTypescale('enabled-trailing-supporting-text')(Typescale.LabelSmall),
    'enabled-trailing-supporting-text-color'         : Color.OnSurfaceVariant,
    'enabled-trailing-supporting-text-color-selected': Color.OnSecondaryContainer,
    'disabled-trailing-supporting-text-color'        : Color.OnSurface,

    // Leading / trailing icons & media
    'enabled-leading-icon-color'          : Color.OnSurfaceVariant,
    'enabled-leading-icon-color-selected' : Color.OnSecondaryContainer,
    'disabled-leading-icon-color'         : Color.OnSurface,
    'leading-icon-size'                   : `24px`,

    'enabled-trailing-icon-color'         : Color.OnSurfaceVariant,
    'enabled-trailing-icon-color-selected': Color.OnSecondaryContainer,
    'disabled-trailing-icon-color'        : Color.OnSurface,
    'trailing-icon-size'                  : `24px`,

    'leading-avatar-size'                 : `40px`,
    ...expandShape('leading-avatar-shape')(Shape.Full),
    'enabled-leading-avatar-color'        : Color.PrimaryContainer,
    'enabled-leading-avatar-label-color'  : Color.OnPrimaryContainer,
    ...expandTypescale('enabled-leading-avatar-label')(Typescale.TitleMedium),

    'leading-image-width'                 : `56px`,
    'leading-image-height'                : `56px`,
    ...expandShape('leading-image-shape')(Shape.Small),

    'leading-video-width'                 : `100px`,
    'leading-video-height'                : `56px`,
    ...expandShape('leading-video-shape')(Shape.Small),

    // Expandable indicator & nested children
    'expand-indicator-width'                          : `32px`,
    'expand-indicator-height'                         : `40px`,
    'expand-indicator-icon-size'                      : `24px`,
    ...expandShape('expand-indicator-shape')(Shape.Full),
    'enabled-expand-indicator-container-color'          : `transparent`,
    'enabled-expand-indicator-container-color-expanded' : Color.SurfaceContainer,
    'enabled-expand-indicator-icon-color'               : Color.OnSurfaceVariant,
    'enabled-expand-indicator-icon-color-expanded'      : Color.OnSurface,
    'enabled-standard-children-gap'                     : `0px`,
    'enabled-segmented-children-gap'                    : `2px`,

    // Swipe-to-reveal actions
    'enabled-swiped-container-color'                    : Color.SurfaceContainer,
    'enabled-swipe-gap'                                 : `4px`,
    'enabled-swipe-actions-gap'                         : `4px`,
    'swipe-action-min-width'                            : `56px`,
    'swipe-action-height'                               : `56px`,
    ...expandShape('swipe-action-shape')(Shape.Full),
    'enabled-swipe-action-container-color'              : Color.SurfaceContainerHighest,
    'enabled-swipe-action-label-color'                  : Color.OnSurface,
    'enabled-swipe-primary-action-container-color'      : Color.Primary,
    'enabled-swipe-primary-action-label-color'          : Color.OnPrimary,

    // State layers (wired into `mdc-ripple`)
    'hovered-state-layer-color'   : Color.OnSurface,
    'hovered-state-layer-opacity' : State.HoveredStateLayerOpacity,
    'focused-state-layer-color'   : Color.OnSurface,
    'focused-state-layer-opacity' : State.FocusedStateLayerOpacity,
    'pressed-state-layer-color'   : Color.OnSurface,
    'pressed-state-layer-opacity' : State.PressedStateLayerOpacity,

    // Disabled + touch
    'disabled-label-opacity'      : `0.38`,
    'min-touch-target-size'       : `48px`,
})

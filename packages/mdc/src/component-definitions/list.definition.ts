/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape, Typescale } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

/**
 * Style definition for `mdc-list-item`.
 *
 * Based on the Material 3 list item specification:
 *
 * - Container: 56dp (one-line) / 72dp (two-line) / 88dp (three-line), square corners
 * - Headline: body-large; supporting text: body-medium; overline: label-small;
 *   trailing supporting text: label-medium
 * - Leading icon: 24dp; leading avatar: 40dp full shape
 * - Selected state: secondary-container background
 * - State layer: on-surface at 8% / 10% / 10% (hover / focus / press)
 * - Disabled: on-surface at 38% label opacity
 * - Touch target: 48dp min
 */

export const ListItemDefinition = createStyleDefinition({
    // Container (geometry skips the state prefix, per chip.definition.ts precedent)
    'container-shape-start-start' : Shape.None,
    'container-shape-start-end'   : Shape.None,
    'container-shape-end-start'   : Shape.None,
    'container-shape-end-end'     : Shape.None,

    'one-line-container-height'   : `56px`,
    'two-line-container-height'   : `72px`,
    'three-line-container-height' : `88px`,

    'enabled-container-padding-inline-start': `16px`,
    'enabled-container-padding-inline-end'  : `16px`,
    'enabled-container-padding-block-start' : `0px`,
    'enabled-container-padding-block-end'   : `0px`,

    // Container colors (state × element × `-selected` suffix at END)
    'enabled-container-color'     : `transparent`,
    'hovered-container-color'     : `transparent`,
    'focused-container-color'     : `transparent`,
    'pressed-container-color'     : `transparent`,
    'disabled-container-color'    : `transparent`,

    'enabled-container-color-selected'  : Color.SecondaryContainer,
    'hovered-container-color-selected'  : Color.SecondaryContainer,
    'focused-container-color-selected'  : Color.SecondaryContainer,
    'pressed-container-color-selected'  : Color.SecondaryContainer,

    // Headline label — body-large
    'enabled-label-font'          : Typescale.BodyLarge.Font,
    'enabled-label-size'          : Typescale.BodyLarge.FontSize,
    'enabled-label-weight'        : Typescale.BodyLarge.FontWeight,
    'enabled-label-tracking'      : Typescale.BodyLarge.Tracking,
    'enabled-label-line-height'   : Typescale.BodyLarge.LineHeight,
    'enabled-label-color'         : Color.OnSurface,
    'enabled-label-color-selected': Color.OnSecondaryContainer,
    'disabled-label-color'        : Color.OnSurface,

    // Supporting text — body-medium
    'enabled-supporting-text-font'         : Typescale.BodyMedium.Font,
    'enabled-supporting-text-size'         : Typescale.BodyMedium.FontSize,
    'enabled-supporting-text-weight'       : Typescale.BodyMedium.FontWeight,
    'enabled-supporting-text-tracking'     : Typescale.BodyMedium.Tracking,
    'enabled-supporting-text-line-height'  : Typescale.BodyMedium.LineHeight,
    'enabled-supporting-text-color'        : Color.OnSurfaceVariant,
    'enabled-supporting-text-color-selected': Color.OnSecondaryContainer,

    // Overline — label-small
    'enabled-overline-font'         : Typescale.LabelSmall.Font,
    'enabled-overline-size'         : Typescale.LabelSmall.FontSize,
    'enabled-overline-weight'       : Typescale.LabelSmall.FontWeight,
    'enabled-overline-tracking'     : Typescale.LabelSmall.Tracking,
    'enabled-overline-line-height'  : Typescale.LabelSmall.LineHeight,
    'enabled-overline-color'        : Color.Primary,
    'enabled-overline-color-selected': Color.OnSecondaryContainer,

    // Trailing supporting text — label-medium
    'enabled-trailing-supporting-text-font'        : Typescale.LabelMedium.Font,
    'enabled-trailing-supporting-text-size'        : Typescale.LabelMedium.FontSize,
    'enabled-trailing-supporting-text-weight'      : Typescale.LabelMedium.FontWeight,
    'enabled-trailing-supporting-text-tracking'    : Typescale.LabelMedium.Tracking,
    'enabled-trailing-supporting-text-line-height' : Typescale.LabelMedium.LineHeight,
    'enabled-trailing-supporting-text-color'       : Color.OnSurfaceVariant,
    'enabled-trailing-supporting-text-color-selected': Color.OnSecondaryContainer,

    // Leading / trailing
    'enabled-leading-icon-color'        : Color.OnSurfaceVariant,
    'enabled-leading-icon-color-selected': Color.OnSecondaryContainer,
    'leading-icon-size'                 : `24px`,
    'enabled-trailing-icon-color'       : Color.OnSurfaceVariant,
    'enabled-trailing-icon-color-selected': Color.OnSecondaryContainer,

    // State layers (wired into `mdc-ripple`)
    'hovered-state-layer-color'   : Color.OnSurface,
    'hovered-state-layer-opacity' : `0.08`,
    'focused-state-layer-color'   : Color.OnSurface,
    'focused-state-layer-opacity' : `0.1`,
    'pressed-state-layer-color'   : Color.OnSurface,
    'pressed-state-layer-opacity' : `0.1`,

    // Disabled + touch
    'disabled-label-opacity'      : `0.38`,
    'min-touch-target-size'       : `48px`,
})

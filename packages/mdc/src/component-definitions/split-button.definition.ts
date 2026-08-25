/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

/** Any `Shape` — widened past the branded corner-key so different sizes can pass different corners. */
type TShape = Shape<string, number | string, string>
/** Any `Typescale` — widened past the branded scale-key so different sizes can pass different typography. */
type TTypescale = Typescale<unknown, unknown, unknown, unknown, unknown>

/**
 * Build the per-size corner token set for the split-button anatomy.
 *
 * The two buttons form one visually unified container: the outer corners
 * (leading's left edge, trailing's right edge) are fully rounded pills, while
 * the facing inner corners share a small `inner` radius. On press the inner
 * corners grow to `pressed` (MD3 Expressive morph). When the trailing button is
 * `expanded` (menu-open state) every one of its corners becomes `Shape.Full` so
 * it morphs into a circle.
 */
function corners(prefix: string, inner: TShape, pressed: TShape) {
    return {
        [`${prefix}-leading-button-container-shape-start-start`]      : Shape.Full,
        [`${prefix}-leading-button-container-shape-start-end`]        : inner,
        [`${prefix}-leading-button-container-shape-end-start`]        : Shape.Full,
        [`${prefix}-leading-button-container-shape-end-end`]          : inner,
        [`${prefix}-leading-button-container-shape-pressed-start-start`]   : Shape.Full,
        [`${prefix}-leading-button-container-shape-pressed-start-end`]     : pressed,
        [`${prefix}-leading-button-container-shape-pressed-end-start`]     : Shape.Full,
        [`${prefix}-leading-button-container-shape-pressed-end-end`]       : pressed,
        [`${prefix}-trailing-button-container-shape-start-start`]      : inner,
        [`${prefix}-trailing-button-container-shape-start-end`]        : Shape.Full,
        [`${prefix}-trailing-button-container-shape-end-start`]        : inner,
        [`${prefix}-trailing-button-container-shape-end-end`]          : Shape.Full,
        [`${prefix}-trailing-button-container-shape-pressed-start-start`]  : pressed,
        [`${prefix}-trailing-button-container-shape-pressed-start-end`]    : Shape.Full,
        [`${prefix}-trailing-button-container-shape-pressed-end-start`]    : pressed,
        [`${prefix}-trailing-button-container-shape-pressed-end-end`]      : Shape.Full,
        [`${prefix}-trailing-button-container-shape-expanded-start-start`] : Shape.Full,
        [`${prefix}-trailing-button-container-shape-expanded-start-end`]   : Shape.Full,
        [`${prefix}-trailing-button-container-shape-expanded-end-start`]   : Shape.Full,
        [`${prefix}-trailing-button-container-shape-expanded-end-end`]     : Shape.Full,
    } as const
}

/**
 * Build the per-size layout token set (dimensions, paddings, icon sizes and
 * label typography). Values follow the Material 3 split-button spec
 * (`md.comp.split-button`) and the Compose Material3 `SplitButton*Tokens`.
 */
function sized(
    s: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large',
    p: {
        height: string,
        leadingLeading: string,
        leadingTrailing: string,
        trailingLeading: string,
        trailingTrailing: string,
        leadingIcon: string,
        trailingIcon: string,
        opticalOffset: string,
        betweenIconLabel: string,
        minWidth: string,
        label: TTypescale,
        outlineWidth: string,
    },
) {
    return {
        [`${s}-container-height`]                             : p.height,
        [`${s}-between-space`]                                : `2px`,
        [`${s}-leading-button-padding-inline-start`]          : p.leadingLeading,
        [`${s}-leading-button-padding-inline-end`]            : p.leadingTrailing,
        [`${s}-leading-button-padding-block-start`]           : `0px`,
        [`${s}-leading-button-padding-block-end`]             : `0px`,
        [`${s}-trailing-button-padding-inline-start`]         : p.trailingLeading,
        [`${s}-trailing-button-padding-inline-end`]           : p.trailingTrailing,
        [`${s}-trailing-button-padding-block-start`]          : `0px`,
        [`${s}-trailing-button-padding-block-end`]            : `0px`,
        [`${s}-leading-icon-size`]                            : p.leadingIcon,
        [`${s}-trailing-icon-size`]                           : p.trailingIcon,
        [`${s}-trailing-icon-optical-offset`]: p.opticalOffset,
        [`${s}-between-icon-label-space`] : p.betweenIconLabel,
        [`${s}-leading-button-min-width`] : p.minWidth,
        [`${s}-trailing-button-min-width`]: p.minWidth,
        [`${s}-label-font`]               : p.label.Font,
        [`${s}-label-line-height`]        : p.label.LineHeight,
        [`${s}-label-size`]               : p.label.FontSize,
        [`${s}-label-tracking`]           : p.label.Tracking,
        [`${s}-label-weight`]             : p.label.FontWeight,
        [`${s}-outline-width`]            : p.outlineWidth,
    } as const
}

const shared = {
    ...corners('extra-small', Shape.ExtraSmall, Shape.Medium),
    ...sized('extra-small', {
        height: `32px`,
        leadingLeading: `12px`,
        leadingTrailing: `10px`,
        trailingLeading: `13px`,
        trailingTrailing: `13px`,
        leadingIcon: `20px`,
        trailingIcon: `20px`,
        opticalOffset: `-1px`,
        betweenIconLabel: `4px`,
        minWidth: `48px`,
        label: Typescale.LabelLarge,
        outlineWidth: `1px`,
    }),

    ...corners('small', Shape.ExtraSmall, Shape.Medium),
    ...sized('small', {
        height: `40px`,
        leadingLeading: `16px`,
        leadingTrailing: `12px`,
        trailingLeading: `13px`,
        trailingTrailing: `13px`,
        leadingIcon: `20px`,
        trailingIcon: `22px`,
        opticalOffset: `-1px`,
        betweenIconLabel: `8px`,
        minWidth: `48px`,
        label: Typescale.LabelLarge,
        outlineWidth: `1px`,
    }),

    ...corners('medium', Shape.ExtraSmall, Shape.Medium),
    ...sized('medium', {
        height: `56px`,
        leadingLeading: `24px`,
        leadingTrailing: `24px`,
        trailingLeading: `15px`,
        trailingTrailing: `15px`,
        leadingIcon: `24px`,
        trailingIcon: `26px`,
        opticalOffset: `-2px`,
        betweenIconLabel: `8px`,
        minWidth: `48px`,
        label: Typescale.TitleMedium,
        outlineWidth: `1px`,
    }),

    ...corners('large', Shape.Small, Shape.LargeIncreased),
    ...sized('large', {
        height: `96px`,
        leadingLeading: `48px`,
        leadingTrailing: `48px`,
        trailingLeading: `29px`,
        trailingTrailing: `29px`,
        leadingIcon: `32px`,
        trailingIcon: `38px`,
        opticalOffset: `-3px`,
        betweenIconLabel: `12px`,
        minWidth: `48px`,
        label: Typescale.HeadlineSmall,
        outlineWidth: `2px`,
    }),

    ...corners('extra-large', Shape.Medium, Shape.LargeIncreased),
    ...sized('extra-large', {
        height: `136px`,
        leadingLeading: `64px`,
        leadingTrailing: `64px`,
        trailingLeading: `43px`,
        trailingTrailing: `43px`,
        leadingIcon: `40px`,
        trailingIcon: `50px`,
        opticalOffset: `-6px`,
        betweenIconLabel: `16px`,
        minWidth: `48px`,
        label: Typescale.HeadlineLarge,
        outlineWidth: `3px`,
    }),
} as const

/**
 * Style definition for `mdc-split-button` — filled variant.
 *
 * @version
 * Material Design 3
 */
export const FilledSplitButtonDefinition = createStyleDefinition({
    ...shared,

    // Enabled
    'enabled-container-color'         : Color.Primary,
    'enabled-label-color'             : Color.OnPrimary,
    'enabled-icon-color'              : Color.OnPrimary,
    'enabled-container-shadow-color'  : Color.Shadow,
    'enabled-container-elevation'     : '0',

    // State layers
    'hovered-state-layer-color'  : Color.OnPrimary,
    'focused-state-layer-color'  : Color.OnPrimary,
    'pressed-state-layer-color'  : Color.OnPrimary,
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,

    // Disabled
    'disabled-container-color'       : Color.OnSurface,
    'disabled-container-opacity'     : `0.1`,
    'disabled-label-color'           : Color.OnSurface,
    'disabled-label-opacity'         : `0.38`,
    'disabled-icon-color'            : Color.OnSurface,
    'disabled-icon-opacity'          : `0.38`,
    'disabled-container-shadow-color': Color.Shadow,
    'disabled-container-elevation'   : '0',
})

/**
 * Style definition for `mdc-split-button` — filled-tonal variant.
 *
 * @version
 * Material Design 3
 */
export const FilledTonalSplitButtonDefinition = createStyleDefinition({
    ...shared,

    // Enabled
    'enabled-container-color'         : Color.SecondaryContainer,
    'enabled-label-color'             : Color.OnSecondaryContainer,
    'enabled-icon-color'              : Color.OnSecondaryContainer,
    'enabled-container-shadow-color'  : Color.Shadow,
    'enabled-container-elevation'     : '0',

    // State layers
    'hovered-state-layer-color'  : Color.OnSecondaryContainer,
    'focused-state-layer-color'  : Color.OnSecondaryContainer,
    'pressed-state-layer-color'  : Color.OnSecondaryContainer,
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,

    // Disabled
    'disabled-container-color'       : Color.OnSurface,
    'disabled-container-opacity'     : `0.1`,
    'disabled-label-color'           : Color.OnSurface,
    'disabled-label-opacity'         : `0.38`,
    'disabled-icon-color'            : Color.OnSurface,
    'disabled-icon-opacity'          : `0.38`,
    'disabled-container-shadow-color': Color.Shadow,
    'disabled-container-elevation'   : '0',
})

/**
 * Style definition for `mdc-split-button` — elevated variant.
 *
 * @version
 * Material Design 3
 */
export const ElevatedSplitButtonDefinition = createStyleDefinition({
    ...shared,

    // Enabled
    'enabled-container-color'         : Color.SurfaceContainerLow,
    'enabled-label-color'             : Color.Primary,
    'enabled-icon-color'              : Color.Primary,
    'enabled-container-shadow-color'  : Color.Shadow,
    'enabled-container-elevation'     : '1',

    // State layers
    'hovered-state-layer-color'  : Color.Primary,
    'focused-state-layer-color'  : Color.Primary,
    'pressed-state-layer-color'  : Color.Primary,
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,

    // Disabled
    'disabled-container-color'       : Color.OnSurface,
    'disabled-container-opacity'     : `0.1`,
    'disabled-label-color'           : Color.OnSurface,
    'disabled-label-opacity'         : `0.38`,
    'disabled-icon-color'            : Color.OnSurface,
    'disabled-icon-opacity'          : `0.38`,
    'disabled-container-shadow-color': Color.Shadow,
    'disabled-container-elevation'   : '0',
})

/**
 * Style definition for `mdc-split-button` — outlined variant.
 *
 * @version
 * Material Design 3
 */
export const OutlinedSplitButtonDefinition = createStyleDefinition({
    ...shared,

    // Enabled
    'enabled-outline-color'          : Color.OutlineVariant,
    'enabled-container-color'        : `transparent`,
    'enabled-label-color'            : Color.OnSurfaceVariant,
    'enabled-icon-color'             : Color.OnSurfaceVariant,
    'enabled-container-shadow-color' : Color.Shadow,
    'enabled-container-elevation'    : '0',

    // State layers
    'hovered-state-layer-color'  : Color.OnSurfaceVariant,
    'focused-state-layer-color'  : Color.OnSurfaceVariant,
    'pressed-state-layer-color'  : Color.OnSurfaceVariant,
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,

    // Disabled
    'disabled-outline-color'       : Color.OutlineVariant,
    'disabled-outline-opacity'     : `0.12`,
    'disabled-container-color'     : Color.OnSurface,
    'disabled-container-opacity'   : `0.1`,
    'disabled-label-color'         : Color.OnSurface,
    'disabled-label-opacity'       : `0.38`,
    'disabled-icon-color'          : Color.OnSurface,
    'disabled-icon-opacity'        : `0.38`,
    'disabled-container-shadow-color': Color.Shadow,
    'disabled-container-elevation' : '0',
})

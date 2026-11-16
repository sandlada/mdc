/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @link
 * https://m3.material.io/components/sliders/specs
 */

import { Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandShape, expandTypescale } from '../../utils/style'

/**
 * Style definition for `mdc-slider` (Material Design 3 Expressive).
 *
 * Aligns with Figma M3 Expressive prototype and Android Jetpack Compose
 * `SliderTokens` / `SliderDefaults`:
 * - 5 sizes (`extra-small` ~ `extra-large`) with track heights 16/24/40/56/96px
 *   and handle heights 44/44/52/68/108px
 * - Resting handle width 4px, pressed handle width 2px
 * - Thumb-to-track gap 6px (`ThumbTrackGapSize = 6.dp`)
 * - Inner track corner radius 2px (`TrackInsideCornerSize = 2.dp`)
 * - Stop indicator 4px dot (`TrackStopIndicatorSize = 4.dp`)
 * - Value indicator pill 48×44px, Full shape, 6px offset
 */
export const SliderDefinition = createStyleDefinition({
    // ── Size presets ──────────────────────────────────────────────────────────
    'extra-small-track-height'             : '16px',
    'extra-small-track-outer-corner-size'  : '8px',
    'extra-small-handle-height'            : '44px',
    'extra-small-stop-indicator-inset'     : '8px',

    'small-track-height'                   : '24px',
    'small-track-outer-corner-size'        : '8px',
    'small-handle-height'                  : '44px',
    'small-stop-indicator-inset'           : '10px',

    'medium-track-height'                  : '40px',
    'medium-track-outer-corner-size'       : '12px',
    'medium-handle-height'                 : '52px',
    'medium-stop-indicator-inset'          : '12px',
    'medium-icon-size'                     : '24px',
    'medium-icon-leading-space'            : '12px',

    'large-track-height'                   : '56px',
    'large-track-outer-corner-size'        : '16px',
    'large-handle-height'                  : '68px',
    'large-stop-indicator-inset'           : '16px',
    'large-icon-size'                      : '24px',
    'large-icon-leading-space'             : '16px',

    'extra-large-track-height'             : '96px',
    'extra-large-track-outer-corner-size'  : '28px',
    'extra-large-handle-height'            : '108px',
    'extra-large-stop-indicator-inset'     : '20px',
    'extra-large-icon-size'                : '32px',
    'extra-large-icon-leading-space'       : '24px',

    // ── Shared geometry ───────────────────────────────────────────────────────
    'track-inner-corner-size'              : '2px',
    'handle-width'                         : '4px',
    'pressed-handle-width'                 : '2px',
    'handle-shape'                         : Shape.Full,
    'thumb-track-gap'                      : '6px',
    'stop-indicator-size'                  : '4px',
    'stop-indicator-shape'                 : Shape.Full,
    'tick-size'                            : '4px',
    'tick-shape'                           : Shape.Full,
    'touch-target-size'                    : '48px',
    'state-layer-size'                     : '40px',

    // ── Colors (Enabled) ──────────────────────────────────────────────────────
    'enabled-active-track-color'           : Color.Primary,
    'enabled-inactive-track-color'         : Color.SecondaryContainer,
    'enabled-handle-color'                 : Color.Primary,
    'enabled-stop-indicator-color'         : Color.Primary,
    'enabled-active-tick-color'            : Color.OnPrimary,
    'enabled-active-tick-opacity'          : '0.38',
    'enabled-inactive-tick-color'          : Color.Primary,
    'enabled-inactive-tick-opacity'        : '0.38',
    'enabled-active-icon-color'            : Color.OnPrimary,
    'enabled-inactive-icon-color'          : Color.OnSecondaryContainer,

    // ── Interaction states ────────────────────────────────────────────────────
    'hovered-handle-color'                 : Color.Primary,
    'hovered-state-layer-color'            : Color.Primary,
    'hovered-state-layer-opacity'          : State.HoveredStateLayerOpacity,

    'focused-handle-color'                 : Color.Primary,
    'focused-state-layer-color'            : Color.Primary,
    'focused-state-layer-opacity'          : State.FocusedStateLayerOpacity,

    'pressed-handle-color'                 : Color.Primary,
    'pressed-state-layer-color'            : Color.Primary,
    'pressed-state-layer-opacity'          : State.PressedStateLayerOpacity,

    // ── Disabled ──────────────────────────────────────────────────────────────
    'disabled-active-track-color'          : Color.OnSurface,
    'disabled-active-track-opacity'        : '0.38',
    'disabled-inactive-track-color'        : Color.OnSurface,
    'disabled-inactive-track-opacity'      : '0.12',
    'disabled-handle-color'                : Color.OnSurface,
    'disabled-handle-opacity'              : '0.38',
    'disabled-stop-indicator-color'        : Color.OnSurface,
    'disabled-stop-indicator-opacity'      : '0.38',
    'disabled-active-tick-color'           : Color.InverseOnSurface,
    'disabled-active-tick-opacity'         : '0.38',
    'disabled-inactive-tick-color'         : Color.OnSurface,
    'disabled-inactive-tick-opacity'       : '0.38',
    'disabled-icon-color'                  : Color.OnSurface,
    'disabled-icon-opacity'                : '0.38',

    // ── Value indicator (label) ───────────────────────────────────────────────
    'label-container-min-width'            : '48px',
    'label-container-height'               : '44px',
    'label-container-padding-inline-start' : '16px',
    'label-container-padding-inline-end'   : '16px',
    'label-container-padding-block-start'  : '12px',
    'label-container-padding-block-end'    : '12px',
    'label-offset'                         : '6px',
    'enabled-label-container-color'        : Color.InverseSurface,
    'enabled-label-text-color'             : Color.InverseOnSurface,
    ...expandShape('label-container-shape')(Shape.Full),
    ...expandTypescale('label-text')(Typescale.LabelLarge),
})

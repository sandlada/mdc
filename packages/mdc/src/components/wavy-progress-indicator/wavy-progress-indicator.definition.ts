/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Color } from '../../utils/color'
import { createStyleDefinition } from '../../utils/style'

/**
 * MD3 Expressive Wavy Progress Indicator style tokens.
 *
 * Mirrors Jetpack Compose `WavyProgressIndicatorDefaults`
 * (`LinearWavyProgressIndicator` & `CircularWavyProgressIndicator`):
 *
 * - `LinearContainerHeight`: 10dp (`linear-container-height: 10px`)
 * - `LinearTrackThickness` / `LinearActiveIndicatorThickness`: 4dp
 * - `LinearStopIndicatorSize`: 4dp
 * - `LinearTrackGap` / `CircularTrackGap`: 4dp
 * - `LinearDeterminateWavelength`: 40dp, `LinearIndeterminateWavelength`: 20dp
 * - `LinearWaveAmplitude`: 3px (total wave height = 2 * 3 + 4 = 10px)
 * - `CircularWaveAmplitude`: 2px
 */
export const WavyProgressIndicatorDefinition = createStyleDefinition({
    // ── Shared ────────────────────────────────────────────────────────────────
    'enabled-active-indicator-color': Color.Primary,
    'enabled-track-color': Color.SecondaryContainer,
    'enabled-stop-indicator-color': Color.Primary,

    // ── Track gaps ────────────────────────────────────────────────────────────
    'linear-track-gap': '4px',
    'circular-track-gap': '4px',

    // ── Linear ────────────────────────────────────────────────────────────────
    'linear-container-height': '10px',
    'linear-track-thickness': '4px',
    'linear-active-indicator-thickness': '4px',
    'linear-stop-indicator-size': '4px',
    'linear-wave-amplitude': '3px',
    'linear-determinate-wavelength': '40px',
    'linear-indeterminate-wavelength': '20px',

    // ── Circular ──────────────────────────────────────────────────────────────
    'circular-extra-small-size': '32px',
    'circular-extra-small-stroke-width': '4px',
    'circular-extra-small-track-stroke-width': '4px',
    'circular-small-size': '48px',
    'circular-small-stroke-width': '4px',
    'circular-small-track-stroke-width': '4px',
    'circular-medium-size': '64px',
    'circular-medium-stroke-width': '4px',
    'circular-medium-track-stroke-width': '4px',
    'circular-large-size': '88px',
    'circular-large-stroke-width': '6px',
    'circular-large-track-stroke-width': '6px',
    'circular-wave-amplitude': '2px',
    'circular-determinate-wavelength': '28px',
    'circular-indeterminate-wavelength': '20px',
})

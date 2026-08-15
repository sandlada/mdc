/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

/**
 * MD3 Expressive Progress Indicator style tokens.
 *
 * Follows the Material 3 Expressive (MD3E) spec as implemented by Flutter
 * (year2024) and Jetpack Compose:
 *
 * - The track color is `secondaryContainer` (not `surfaceContainerHighest`).
 * - A `*track-gap` separates the active indicator from the track.
 * - A round stop indicator sits at the trailing edge of the linear track
 *   (determinate only).
 * - All ends use round caps (`Shape.Full`), matching round stroke caps.
 * - The circular track is drawn only while determinate, with the same gap.
 *
 * @link https://m3.material.io/components/progress-indicator/specs
 */
export const ExpressiveProgressIndicatorDefinition = createStyleDefinition({
    // ── Shared ────────────────────────────────────────────────────────────────
    'enabled-active-indicator-color'  : Color.Primary,
    'enabled-track-color'             : Color.SecondaryContainer,
    'enabled-stop-indicator-color'    : Color.Primary,

    // ── Track gaps (visual gap between active indicator and track) ───────────
    'linear-track-gap'   : '4px',
    'circular-track-gap' : '4px',

    // ── Shape (round ends everywhere, matching round stroke caps) ────────────
    'active-indicator-shape-start-start': Shape.Full,
    'active-indicator-shape-start-end'  : Shape.Full,
    'active-indicator-shape-end-start'  : Shape.Full,
    'active-indicator-shape-end-end'    : Shape.Full,
    'track-shape-start-start'           : Shape.Full,
    'track-shape-start-end'             : Shape.Full,
    'track-shape-end-start'             : Shape.Full,
    'track-shape-end-end'               : Shape.Full,
    'stop-indicator-shape-start-start'  : Shape.Full,
    'stop-indicator-shape-start-end'    : Shape.Full,
    'stop-indicator-shape-end-start'    : Shape.Full,
    'stop-indicator-shape-end-end'      : Shape.Full,

    // ── Linear ────────────────────────────────────────────────────────────────
    'linear-track-thickness'            : '4px',
    'linear-active-indicator-thickness' : '4px',
    'linear-stop-indicator-size'        : '4px',

    // ── Circular sizes ────────────────────────────────────────────────────────
    'circular-extra-small-size'        : '32px',
    'circular-extra-small-stroke-width': '4px',
    'circular-small-size'              : '48px',
    'circular-small-stroke-width'      : '4px',
    'circular-medium-size'             : '64px',
    'circular-medium-stroke-width'     : '4px',
    'circular-large-size'              : '88px',
    'circular-large-stroke-width'      : '6px',
})

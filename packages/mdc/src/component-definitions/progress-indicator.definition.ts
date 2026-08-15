/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

/**
 * MD3 Progress Indicator style tokens.
 *
 * Covers both linear and circular variants via a single definition.
 * The `variant` attribute selects `linear` (default) or `circular`.
 *
 * Linear anatomy: track, active indicator (determinate) / two animated bars
 * (indeterminate). Circular anatomy: SVG circle (determinate) / div-spinner
 * (indeterminate), four sizes: extra-small (32dp), small (48dp),
 * medium (64dp), large (88dp).
 *
 * The active indicator is clipped by the host's `track-shape` radius rather
 * than carrying its own shape tokens — matching @material/web, which scales
 * the active bar with `transform: scaleX()` and lets the host's
 * `border-radius` round the ends.
 *
 * @link https://m3.material.io/components/progress-indicator/specs
 */
export const ProgressIndicatorDefinition = createStyleDefinition({
    // ── Shared ────────────────────────────────────────────────────────────────
    'enabled-active-indicator-color'  : Color.Primary,
    'enabled-track-color'             : Color.SurfaceContainerHighest,

    // ── Shape ─────────────────────────────────────────────────────────────────
    'track-shape-start-start'         : Shape.Full,
    'track-shape-start-end'           : Shape.Full,
    'track-shape-end-start'           : Shape.Full,
    'track-shape-end-end'             : Shape.Full,

    // ── Linear ────────────────────────────────────────────────────────────────
    'linear-track-thickness'              : '4px',
    'linear-active-indicator-thickness'   : '4px',

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

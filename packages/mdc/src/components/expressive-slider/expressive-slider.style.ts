/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Styles for `mdc-expressive-slider` — Material Design 3 Expressive slider.
 *
 * Locked to the Figma prototype (node-id `58008:10353`):
 *
 * | Size          | Track h | Handle h | Rounded end |
 * | ------------- | ------- | -------- | ----------- |
 * | extra-small   | 16      | 44       | 16          |
 * | small         | 24      | 44       | 8           |
 * | medium        | 40      | 52       | 12          |
 * | large         | 56      | 68       | 16          |
 * | extra-large   | 96      | 108      | 28          |
 *
 * Three behavioral types — `standard`, `centered`, `range` — render through
 * shared CSS via `data-active` / `data-position` attributes. Two directions —
 * `horizontal` (default), `vertical` — swap flex direction and per-track
 * `inline-size` / `block-size`.
 *
 * ── Edge inset ────────────────────────────────────────────────────────
 * The visible track is inset by `--_edge-inset` (= `handleWidth / 2`) on
 * each side so the handle's interaction center is offset from the slider
 * edge at extremes and the edge-tick / edge-stop-indicator dots all line
 * up with the visible track edges. See expressive-slider.ts for the
 * per-segment inline-style math that uses this inset.
 *
 * Centered mode mirrors the same inset on each side of the 50% midpoint
 * (`--_center-inset`) so the active overlay has a center gap and rounded
 * ends on BOTH sides (per MD3E / Compose Material3 spec).
 *
 * @link https://m3.material.io/components/sliders/specs
 */

import { Duration, Easing, Shape } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import { SliderDefinition } from '../../component-definitions/slider.definition'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'

const tokenRecord = defineTokenRefsRecord(SliderDefinition, {
    expandShapes: false,
    useBaseFallback: true,
    prefix: '--mdc-expressive-slider',
})
const tokensStringified = unsafeCSS(defineVars(tokenRecord, true).join(''))

const short2Duration = unsafeCSS(Duration.Short2.ToCSSVariable())
const emphasizedEasing = unsafeCSS(Easing.Emphasized.ToCSSVariable())

export const ExpressiveSliderStyles = [
    css`
        :host {
            ${tokensStringified};

            /* Per-size internal aliases. */
            --_track-height: 16px;
            --_active-leading-shape: 16px;
            --_active-trailing-shape: 2px;
            --_inactive-leading-shape: 2px;
            --_inactive-trailing-shape: 16px;
            --_handle-size: 44px;
            --_handle-width: 4px;
            --_center-dot-size: 4px;
            --_stop-indicator-size: 4px;
            /* Visible gap between handle edge and track edge. */
            --_thumb-track-gap: 4px;
            /* Edge inset: the visible track is inset by handleWidth/2 on
               each side. Derives from --_handle-width so each size preset
               gets its own inset for free. */
            --_edge-inset: calc(var(--_handle-width) / 2);
            /* Centered-mode mirror: a symmetric inset on each side of 50%
               so the active overlay has a center gap. */
            --_center-inset: var(--_edge-inset);

            /* Fractions set at render time by the component. */
            --_start-fraction: 0;
            --_end-fraction: 0;
            --_tick-count: 0;
            /* Range-mode input clip points (published from the inline
               style so the input pointer-event split matches the handle
               split; defaults to fixed 50% when no override is set). */
            --_clip-to-start: 50%;
            --_clip-to-end: 50%;
            /* Active-tick clip math (see .tickmarks::after). The base
               formula uses --_with-tick-marks-container-size for the
               inset; we use --_edge-inset so the active ticks align
               with the visible track edges. */
            --_active-track-max-clip: calc(100% - var(--_edge-inset) * 2);
            --_start-fraction-not-zero: min(var(--_start-fraction) * 1e9, 1);
            --_active-track-start-offset: calc(var(--_with-tick-marks-container-size) * var(--_start-fraction-not-zero));
            --_active-track-start-clip: calc(var(--_active-track-start-offset) + var(--_active-track-max-clip) * var(--_start-fraction));
            --_end-fraction-not-one: min((1 - var(--_end-fraction)) * 1e9, 1);
            --_active-track-end-offset: calc(var(--_with-tick-marks-container-size) * var(--_end-fraction-not-one));
            --_active-track-end-clip: calc(var(--_active-track-end-offset) + var(--_active-track-max-clip) * (1 - var(--_end-fraction)));

            display: inline-flex;
            vertical-align: middle;
            min-inline-size: 200px;
            block-size: var(--_handle-size);
            position: relative;
        }

        :host([direction='vertical']) {
            writing-mode: vertical-lr;
            /* In vertical-lr: block-size = horizontal width, inline-size = vertical height. */
            block-size: var(--_handle-size);
            inline-size: 200px;
            min-inline-size: unset;
            min-block-size: unset;
        }

        :host([disabled]) {
            opacity: var(--_disabled-active-track-opacity);
        }

        @media (prefers-reduced-motion) {
            .label {
                transition-duration: 0;
            }
        }

        /* ── Size presets (Figma-locked geometry) ──────────────────────────── */
        :host([size='extra-small']) {
            --_track-height: var(--_extra-small-active-track-height);
            --_active-leading-shape: var(--_extra-small-active-track-leading-shape);
            --_active-trailing-shape: var(--_extra-small-active-track-trailing-shape);
            --_inactive-leading-shape: var(--_extra-small-inactive-track-leading-shape);
            --_inactive-trailing-shape: var(--_extra-small-inactive-track-trailing-shape);
            --_handle-size: var(--_extra-small-active-handle-height);
            --_handle-width: var(--_extra-small-handle-width);
        }

        :host([size='small']) {
            --_track-height: var(--_small-active-track-height);
            --_active-leading-shape: var(--_small-active-track-leading-shape);
            --_active-trailing-shape: var(--_small-active-track-trailing-shape);
            --_inactive-leading-shape: var(--_small-inactive-track-leading-shape);
            --_inactive-trailing-shape: var(--_small-inactive-track-trailing-shape);
            --_handle-size: var(--_small-active-handle-height);
            --_handle-width: var(--_small-handle-width);
        }

        :host([size='medium']) {
            --_track-height: var(--_medium-active-track-height);
            --_active-leading-shape: var(--_medium-active-track-leading-shape);
            --_active-trailing-shape: var(--_medium-active-track-trailing-shape);
            --_inactive-leading-shape: var(--_medium-inactive-track-leading-shape);
            --_inactive-trailing-shape: var(--_medium-inactive-track-trailing-shape);
            --_handle-size: var(--_medium-active-handle-height);
            --_handle-width: var(--_medium-handle-width);
        }

        :host([size='large']) {
            --_track-height: var(--_large-active-track-height);
            --_active-leading-shape: var(--_large-active-track-leading-shape);
            --_active-trailing-shape: var(--_large-active-track-trailing-shape);
            --_inactive-leading-shape: var(--_large-inactive-track-leading-shape);
            --_inactive-trailing-shape: var(--_large-inactive-track-trailing-shape);
            --_handle-size: var(--_large-active-handle-height);
            --_handle-width: var(--_large-handle-width);
        }

        :host([size='extra-large']) {
            --_track-height: var(--_extra-large-active-track-height);
            --_active-leading-shape: var(--_extra-large-active-track-leading-shape);
            --_active-trailing-shape: var(--_extra-large-active-track-trailing-shape);
            --_inactive-leading-shape: var(--_extra-large-inactive-track-leading-shape);
            --_inactive-trailing-shape: var(--_extra-large-inactive-track-trailing-shape);
            --_handle-size: var(--_extra-large-active-handle-height);
            --_handle-width: var(--_extra-large-handle-width);
        }

        /* ── Container (block layout) ─────────────────────────────────────────
           Absolute-positioned tracks and handles; no flex gap. The visible
           gap between the handle and surrounding tracks is set by the
           inline styles (and reads var(--_thumb-track-gap)). Cursor-to-
           value mapping stays linear because the native input spans the
           full container. For ranged mode the .ranged input.start/end
           clip-path rules consume --_clip-to-start/--_clip-to-end which
           are published from the inline style. */
        .container {
            flex: 1;
            display: block;
            inline-size: 100%;
            block-size: 100%;
            pointer-events: none;
            touch-action: none;
            user-select: none;
            position: relative;
        }

        /* ── Track segments (active + inactive) ─────────────────────────────── */
        .track {
            position: absolute;
            /* Cross-axis centering on the BLOCK axis. In horizontal mode
               (block axis = vertical) this centers the track vertically;
               in vertical-lr (block axis = horizontal) it centers the
               track horizontally. The track's block-size matches its
               track-height, so this is exact centering. */
            inset-block-start: calc(50% - var(--_track-height) / 2);
            block-size: var(--_track-height);
            background: var(--_enabled-inactive-track-color);
            overflow: clip;
            /* Main-axis edge-inset fallback. The TS render code always
               overrides these via inline styles, but the defaults keep
               the track from bleeding past the visible track range
               before the first paint. */
            inset-inline-start: var(--_edge-inset);
            inset-inline-end: var(--_edge-inset);
        }

        .track[data-active='true'] {
            background: var(--_enabled-active-track-color);
        }

        /* Range middle track — fills the active selection between the two
           handles. The handle body sits over each end, so both caps are
           rounded (CornerFull / --_active-leading-shape) — no inner-
           corner shaping is needed since the handle hides the very end. */
        .track.track-middle {
            border-start-start-radius: var(--_active-leading-shape);
            border-end-start-radius: var(--_active-leading-shape);
            border-start-end-radius: var(--_active-leading-shape);
            border-end-end-radius: var(--_active-leading-shape);
        }

        /* All four corners of every track segment are the rounded cap
           value. The active track uses --_active-leading-shape (the
           rounded-cap token); the inactive uses --_inactive-trailing-shape
           (also rounded-cap, equal to leading per size). The handle
           body hides the very end of each track, so we don't need an
           inner-corner shaping. Writing-mode handles the axis swap. */

        .track[data-position='start'][data-active='true'],
        .track[data-position='end'][data-active='true'] {
            border-start-start-radius: var(--_active-leading-shape);
            border-end-start-radius: var(--_active-leading-shape);
            border-start-end-radius: var(--_active-leading-shape);
            border-end-end-radius: var(--_active-leading-shape);
        }

        .track[data-position='start'][data-active='false'],
        .track[data-position='end'][data-active='false'] {
            border-start-start-radius: var(--_inactive-trailing-shape);
            border-end-start-radius: var(--_inactive-trailing-shape);
            border-start-end-radius: var(--_inactive-trailing-shape);
            border-end-end-radius: var(--_inactive-trailing-shape);
        }

        :host([disabled]) .track[data-active='true'] {
            background: var(--_disabled-active-track-color);
        }
        :host([disabled]) .track[data-active='false'] {
            background: var(--_disabled-inactive-track-color);
            opacity: calc(var(--_disabled-inactive-track-opacity) / var(--_disabled-active-track-opacity));
        }

        /* ── Stop indicator (4px dot at the OUTER end of each inactive segment) ──
           The dot's CENTER sits on the visible track's outer edge, which
           is edge-inset away from the slider edge. The dot's CENTER also
           lines up with the edge tick dot (when ticks enabled) and the
           handle center at value=min/value=max. Inset is calc'd so the
           dot's left/right edge lands at the slider edge: the dot then
           spans [0, stopIndicatorSize] with center at stopIndicatorSize/2
           which equals edge-inset when stop-indicator-size == handle-width. */
        .stop-indicator {
            position: absolute;
            inline-size: var(--_stop-indicator-size);
            block-size: var(--_stop-indicator-size);
            border-radius: 50%;
            background: var(--_enabled-active-stop-indicator-color);
            /* Cross-axis centering on the BLOCK axis (horizontal for
               vertical mode, vertical for horizontal mode). */
            inset-block-start: calc(50% - var(--_stop-indicator-size) / 2);
            /* Default for data-position='end' (right half / bottom half):
               dot pinned to the slider's right edge; center at edge-inset. */
            inset-inline-end: calc(var(--_edge-inset) - var(--_stop-indicator-size) / 2);
        }

        /* Horizontal: flip dot to inline-start when the segment sits on
           the LEFT half of the slider. */
        .track[data-position='start'] .stop-indicator {
            inset-inline-end: auto;
            inset-inline-start: calc(var(--_edge-inset) - var(--_stop-indicator-size) / 2);
        }

        :host([disabled]) .stop-indicator {
            background: var(--_disabled-active-stop-indicator-color);
        }

        /* Vertical: writing-mode: vertical-lr → inline axis is vertical,
           block axis is horizontal. The dot is centered horizontally
           (block-center) and pinned to the outer vertical edge. For
           data-position='start' (TOP half): dot's top edge at the slider
           top; for data-position='end' (BOTTOM half): dot's bottom edge
           at the slider bottom. */
        :host([direction='vertical']) .track[data-position='start'] .stop-indicator {
            /* In vertical mode, block axis is horizontal (cross-axis). Center
               the dot horizontally on the cross-axis. The inline-axis position
               (top/bottom) is the edge. */
            inset-block-start: calc(50% - var(--_stop-indicator-size) / 2);
            inset-block-end: auto;
            inset-inline-start: calc(var(--_edge-inset) - var(--_stop-indicator-size) / 2);
            inset-inline-end: auto;
        }
        :host([direction='vertical']) .track[data-position='end'] .stop-indicator {
            inset-block-start: calc(50% - var(--_stop-indicator-size) / 2);
            inset-block-end: auto;
            inset-inline-start: auto;
            inset-inline-end: calc(var(--_edge-inset) - var(--_stop-indicator-size) / 2);
        }

        /* ── Center dot (range slider center reference) ────────────────────── */
        .center-dot {
            position: absolute;
            inset-inline-start: 50%;
            inset-block-start: 50%;
            inline-size: var(--_center-dot-size);
            block-size: var(--_center-dot-size);
            border-radius: 50%;
            background: var(--_enabled-active-stop-indicator-color);
            transform: translate(-50%, -50%);
            z-index: 1;
            pointer-events: none;
        }

        /* ── Centered-mode center stop indicator (rendered when value=0) ──────
           A 4px dot at the slider's geometric center, used as the visual
           marker when the centered slider's value is exactly at the
           midpoint. Same shape and color as the corner stop indicators. */
        .center-stop {
            position: absolute;
            inset-inline-start: 50%;
            inset-block-start: 50%;
            inline-size: var(--_stop-indicator-size);
            block-size: var(--_stop-indicator-size);
            border-radius: 50%;
            background: var(--_enabled-active-stop-indicator-color);
            transform: translate(-50%, -50%);
            z-index: 1;
            pointer-events: none;
        }

        /* ── Handle (visual thumb) ───────────────────────────────────────────── */
        .handle {
            position: absolute;
            /* Cross-axis centering on the BLOCK axis. In horizontal mode
               (block = vertical) this centers the handle vertically; in
               vertical-lr (block = horizontal) it centers horizontally. */
            inset-block-start: calc(50% - var(--_handle-size) / 2);
            inline-size: var(--_handle-width);
            block-size: var(--_handle-size);
            background: var(--_enabled-handle-color);
            border-radius: 2px;
            z-index: 2;
        }

        :host([disabled]) .handle {
            background: var(--_disabled-handle-color);
            opacity: var(--_disabled-handle-opacity);
        }

        /* Vertical: handle is transposed (wide + 4px tall). In writing-mode:
           vertical-lr the inline axis is vertical, block is horizontal —
           so the wide dimension is block-size and the short dimension
           is inline-size. */
        :host([direction='vertical']) .handle {
            block-size: var(--_handle-size);
            inline-size: var(--_handle-width);
        }

        /* ── Handle nub (rendered inside .handle for state layers / focus) ─────
           Base slider's .handleNub holds the elevation wrapper; in the
           expressive variant we don't use elevation, but the nub still
           provides a hit-test surface for the ripple / focus-ring. Make
           it the full size of the handle so the state layers cover it. */
        .handleNub {
            inline-size: 100%;
            block-size: 100%;
            border-radius: inherit;
            pointer-events: none;
        }

        /* Range handles inherit positioning from the .handle rule above —
           cross-axis centering (inset-block-start: calc(50% - handle-size / 2)),
           sizes, and colors are all shared. The inline style set by the
           render code drives per-handle placement along the main axis. */

        /* ── Tick marks (per-step dots) ───────────────────────────────────────
           Two radial-gradients on ::before (inactive) and ::after (active),
           tiled across the visible-track width (inset by edge-inset on each
           side). The active variant is clipped by --_active-track-start-clip
           and --_active-track-end-clip (published from .container) so dots
           in the active region render in the active color. Per the base
           slider's pattern: the dot is placed at the LEFT edge of each
           background tile so the dots land on the slider's value positions
           (0%, 10%, ..., 100% for step=10 over min=0,max=100).

           Vertical mode: the radial-gradient tile pattern tiles along the
           inline axis (vertical in writing-mode: vertical-lr) — switch
           background-repeat from repeat-x to repeat-y under the vertical
           host. */
        .tickmarks {
            position: absolute;
            inset: 0;
            pointer-events: none;
            /* The tick container is inset by --_edge-inset on the main axis
               so the dots line up with the visible track edges. */
            padding-inline-start: var(--_edge-inset);
            padding-inline-end: var(--_edge-inset);
            inset-inline-start: var(--_edge-inset);
            inset-inline-end: var(--_edge-inset);
            block-size: 100%;
        }

        .tickmarks::before,
        .tickmarks::after {
            content: '';
            position: absolute;
            inset: 0;
            background-size: calc((100% - var(--_with-tick-marks-container-size) * 2) / var(--_tick-count)) 100%;
            background-repeat: repeat-x;
        }

        /* Inactive ticks — dots in the inactive color tiled across the
           visible track. The radial-gradient places the dot at the LEFT
           edge of each tile, and the background is offset so the FIRST
           dot lands at the left edge of the visible track. */
        .tickmarks::before {
            background-image: radial-gradient(
                circle at var(--_with-tick-marks-container-size) center,
                var(--_enabled-with-tick-marks-inactive-container-color, currentColor) 0,
                var(--_enabled-with-tick-marks-inactive-container-color, currentColor) calc(var(--_with-tick-marks-container-size) / 2),
                transparent calc(var(--_with-tick-marks-container-size) / 2)
            );
        }

        /* Active ticks — same gradient but in the active color, clipped
           by the active region (between valueStart and valueEnd). */
        .tickmarks::after {
            background-image: radial-gradient(
                circle at var(--_with-tick-marks-container-size) center,
                var(--_enabled-with-tick-marks-active-container-color, currentColor) 0,
                var(--_enabled-with-tick-marks-active-container-color, currentColor) calc(var(--_with-tick-marks-container-size) / 2),
                transparent calc(var(--_with-tick-marks-container-size) / 2)
            );
            clip-path: inset(0 var(--_active-track-end-clip) 0 var(--_active-track-start-clip));
        }

        /* RTL: swap the clip sides so the active-tick region flips with
           the value direction. */
        .tickmarks:dir(rtl)::after {
            clip-path: inset(0 var(--_active-track-start-clip) 0 var(--_active-track-end-clip));
        }

        /* Vertical: switch repeat axis so dots tile along the main axis
           (vertical in writing-mode: vertical-lr). */
        :host([direction='vertical']) .tickmarks::before,
        :host([direction='vertical']) .tickmarks::after {
            background-repeat: repeat-y;
        }

        /* ── Value indicator (label pill) ─────────────────────────────────────
           Position relative to the .handle element (its parent). In
           horizontal mode the label sits ABOVE the handle, centered
           horizontally. In vertical mode it sits to the RIGHT of the
           handle, centered vertically. The transform folds in the
           centering offset so the scale animation pivots on the same
           point as the placement. */
        .label {
            position: absolute;
            box-sizing: border-box;
            display: flex;
            padding: 4px;
            place-content: center;
            place-items: center;
            border-radius: ${unsafeCSS(Shape.Full.ToCSSVariable())};

            color: var(--_enabled-label-text-color);
            font-family: var(--_label-text-font);
            font-size: var(--_label-text-size);
            line-height: var(--_label-text-line-height);
            font-weight: var(--_label-text-weight);

            inset-block-end: 100%;
            inset-inline-start: 50%;
            min-inline-size: var(--_label-container-height);
            min-block-size: var(--_label-container-height);
            background: var(--_enabled-label-container-color);
            transform-origin: center bottom;
            transform: translate(-50%, 0) scale(0);
            transition-property: transform;
            transition-duration: ${short2Duration};
            transition-timing-function: ${emphasizedEasing};
            z-index: 3;
            pointer-events: none;
            white-space: nowrap;
        }

        /* Vertical mode: in writing-mode: vertical-lr the inline axis is
           vertical and the block axis is horizontal. The label sits to the
           RIGHT of the handle (block axis = horizontal) and is vertically
           centered (inline axis = vertical). The translateY(-50%) folds the
           vertical centering into the transform so the scale animation
           pivots on the same point as the placement. */
        :host([direction='vertical']) .label {
            inset-block-end: auto;
            inset-block-start: 100%;
            inset-inline-start: 50%;
            transform-origin: center left;
            margin-block-start: 8px;
            transform: translate(0, -50%) scale(0);
        }

        :host(:focus-within) .label,
        :where(:has(input:active)) .label,
        .handle.hover .label {
            transform: translate(-50%, 0) scale(1);
        }

        :host([direction='vertical']:focus-within) .label,
        :host([direction='vertical']) .handle.hover .label {
            transform: translate(0, -50%) scale(1);
        }

        /* ── Native input (interaction target) ──────────────────────────────── */
        input[type='range'] {
            opacity: 0;
            -webkit-tap-highlight-color: transparent;
            position: absolute;
            box-sizing: border-box;
            inset: 0;
            margin: 0;
            background: transparent;
            cursor: pointer;
            pointer-events: auto;
            appearance: none;
        }

        input[type='range']:focus {
            outline: none;
        }

        /* Range: clip the two native inputs so each half of the slider
           feeds pointer events to the right handle. input.start owns the
           half to the LEFT of the midpoint between the values; input.end
           owns the right half. The clip is driven by --_clip-to-start /
           --_clip-to-end (published from the inline style), so the split
           moves with the values rather than being fixed at 50%. Writing-
           mode handles the axis swap — clip-path inset() works on physical
           edges, and the input itself is reoriented via writing-mode:
           vertical-lr in vertical mode. */
        .ranged input.start {
            clip-path: inset(0 var(--_clip-to-end) 0 0);
        }
        .ranged input.end {
            clip-path: inset(0 0 0 var(--_clip-to-start));
        }

        /* Vertical: the slider's value axis is top-to-bottom (inline axis
           in vertical-lr), so input.start owns the TOP half and input.end
           owns the BOTTOM half. The clip-path inset function uses
           PHYSICAL edges (top/right/bottom/left), so we inset from the
           top/bottom here instead of from the right/left. --_clip-to-start
           is measured from inline-start (= top in vertical-lr);
           --_clip-to-end is measured from inline-end (= bottom in
           vertical-lr). */
        :host([direction='vertical']) .ranged input.start {
            clip-path: inset(0 0 var(--_clip-to-end) 0);
        }
        :host([direction='vertical']) .ranged input.end {
            clip-path: inset(var(--_clip-to-start) 0 0 0);
        }

        /* Vertical: native input needs vertical orientation. The
           direction: rtl previously used here flipped the input's
           internal min/max orientation, which inverted the scroll
           direction (drag DOWN decreased value while the layout had
           max at the bottom). Removing it makes the native input's
           value mapping match the rendered layout: drag DOWN increases
           value (toward max at the bottom of the slider), drag UP
           decreases value (toward min at the top). */
        :host([direction='vertical']) input[type='range'] {
            writing-mode: vertical-lr;
            inline-size: 100%;
            block-size: 100%;
        }

        ::-webkit-slider-runnable-track {
            -webkit-appearance: none;
        }
        ::-moz-range-track {
            appearance: none;
        }

        ::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            block-size: var(--_handle-size);
            inline-size: var(--_handle-width);
            opacity: 0;
            z-index: 2;
        }

        ::-moz-range-thumb {
            appearance: none;
            block-size: var(--_handle-size);
            inline-size: var(--_handle-size);
            transform: scaleX(0);
            opacity: 0;
            z-index: 2;
        }

        /* ── Active overlay (centered type only) ─────────────────────────────
           The overlay's block-size matches the track height (not the
           container) so it sits flush with the inactive tracks on the
           cross axis. It's vertically centered within the container.
           The center-side edge sits against --_center-inset (not against
           the handle), so both ends of the overlay are rounded (CornerFull).
           z-index: 1 keeps it above the tracks in vertical mode where DOM
           order may place tracks above the overlay. */
        .active-overlay {
            position: absolute;
            background: var(--_enabled-active-track-color);
            block-size: var(--_track-height);
            inset-block-start: calc((100% - var(--_track-height)) / 2);
            z-index: 1;
            border-start-start-radius: var(--_active-leading-shape);
            border-end-start-radius: var(--_active-leading-shape);
            border-start-end-radius: var(--_active-leading-shape);
            border-end-end-radius: var(--_active-leading-shape);
        }

        :host([disabled]) .active-overlay {
            background: var(--_disabled-active-track-color);
        }
    `,
]

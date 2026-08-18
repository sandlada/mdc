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
            --_track-segment-gap: 6px;
            --_range-handle-center-gap: 6px;
            --_center-dot-size: 4px;
            --_stop-indicator-size: 4px;

            /* Fractions set at render time by the component. */
            --_start-fraction: 0;
            --_end-fraction: 0;
            --_tick-count: 0;

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
           The expressive slider uses ABSOLUTE positioning for both the
           tracks and the handles (no flex layout). This is the only way
           to keep the cursor, the handle, the active overlay, and the
           ticks all aligned to the same fraction of the slider width.

           With a flex layout, the handle acted as a flex item in a fixed
           gap, so its position was determined by the gap center, not by
           the value. The cursor-to-value mapping is linear across the full
           slider width, so the handle drifted away from the cursor
           wherever the flex-gap-center formula disagreed with the value%
           formula. The only way to have both correct is to position
           everything absolutely.

           The visible gap between the handle and the surrounding tracks
           is set by the inline styles (the gap argument) — the container
           itself has no flex gap. The cursor-to-value mapping stays
           linear because the input still spans the full container.

           For ranged mode, the base slider's .ranged input.start/end
           clip-path rules consume --_clip-to-start/--_clip-to-end. We
           publish those from the inline styles so the input's
           pointer-event split matches the visible handle split. */
        .container {
            flex: 1;
            display: block;
            inline-size: 100%;
            block-size: 100%;
            pointer-events: none;
            touch-action: none;
            user-select: none;
            position: relative;

            --_state-layer-size: 0px;
        }

        /* ── Track segments (active + inactive) ─────────────────────────────── */
        .track {
            position: absolute;
            inset-block-start: 50%;
            transform: translateY(-50%);
            block-size: var(--_track-height);
            background: var(--_enabled-inactive-track-color);
            overflow: clip;
        }

        .track[data-active='true'] {
            background: var(--_enabled-active-track-color);
        }

        /* Range middle track — fills the active selection between the two
           handles. Both edges but up against the handles in the gaps, so
           both sides are sharp (2px trailing-shape). */
        .track.track-middle {
            border-start-start-radius: var(--_active-trailing-shape);
            border-end-start-radius: var(--_active-trailing-shape);
            border-start-end-radius: var(--_active-trailing-shape);
            border-end-end-radius: var(--_active-trailing-shape);
        }

        /* Rounded corners — outer edge (slider edge) carries the rounded cap,
           inner edge (where the track meets the handle / next segment) is 2px.
           Naming convention:
             active-leading-shape   — rounded cap on the slider's leading edge
                                      (used for active's outer corner)
             active-trailing-shape  — 2px on the slider's trailing edge
                                      (used for active's inner corner)
             inactive-trailing-shape — rounded cap on the slider's trailing edge
                                       (used for inactive's outer corner)
             inactive-leading-shape — 2px on the slider's leading edge
                                      (used for inactive's inner corner)
           Because the tokens map opposite sides for active vs inactive, the
           inactive CSS swaps the leading/trailing assignments relative to the
           active CSS. */

        /* Horizontal — active segment carries the rounded cap on its outer
           edge (slider-leading side for data-position='start', slider-trailing
           side for data-position='end'). */
        .track[data-position='start'][data-active='true'] {
            border-start-start-radius: var(--_active-leading-shape);
            border-end-start-radius: var(--_active-leading-shape);
            border-start-end-radius: var(--_active-trailing-shape);
            border-end-end-radius: var(--_active-trailing-shape);
        }
        .track[data-position='end'][data-active='true'] {
            border-start-start-radius: var(--_active-trailing-shape);
            border-end-start-radius: var(--_active-trailing-shape);
            border-start-end-radius: var(--_active-leading-shape);
            border-end-end-radius: var(--_active-leading-shape);
        }

        /* Horizontal — inactive segment carries the rounded cap on its outer
           edge. inactive-trailing-shape is the rounded value, so it goes on
           the slider-trailing side (RIGHT in horizontal). */
        .track[data-position='start'][data-active='false'] {
            border-start-start-radius: var(--_inactive-trailing-shape);
            border-end-start-radius: var(--_inactive-trailing-shape);
            border-start-end-radius: var(--_inactive-leading-shape);
            border-end-end-radius: var(--_inactive-leading-shape);
        }
        .track[data-position='end'][data-active='false'] {
            border-start-start-radius: var(--_inactive-leading-shape);
            border-end-start-radius: var(--_inactive-leading-shape);
            border-start-end-radius: var(--_inactive-trailing-shape);
            border-end-end-radius: var(--_inactive-trailing-shape);
        }

        /* Vertical — same logical rule, but the outer edge is now at the top
           or bottom of the track. The active segment in vertical standard
           sits on the BOTTOM (slider-min end), so its outer corner is the
           bottom corner. The inactive-start (TOP) and inactive-end (BOTTOM)
           tracks each carry the rounded cap on their outer edge. */
        :host([direction='vertical']) .track[data-position='start'][data-active='true'] {
            border-start-start-radius: var(--_active-leading-shape);
            border-end-start-radius: var(--_active-leading-shape);
            border-start-end-radius: var(--_active-trailing-shape);
            border-end-end-radius: var(--_active-trailing-shape);
        }
        :host([direction='vertical']) .track[data-position='end'][data-active='true'] {
            border-start-start-radius: var(--_active-trailing-shape);
            border-end-start-radius: var(--_active-trailing-shape);
            border-start-end-radius: var(--_active-leading-shape);
            border-end-end-radius: var(--_active-leading-shape);
        }
        :host([direction='vertical']) .track[data-position='start'][data-active='false'] {
            border-start-start-radius: var(--_inactive-trailing-shape);
            border-end-start-radius: var(--_inactive-trailing-shape);
            border-start-end-radius: var(--_inactive-leading-shape);
            border-end-end-radius: var(--_inactive-leading-shape);
        }
        :host([direction='vertical']) .track[data-position='end'][data-active='false'] {
            border-start-start-radius: var(--_inactive-leading-shape);
            border-end-start-radius: var(--_inactive-leading-shape);
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

        /* Vertical mode: tracks are absolutely positioned along the
           vertical axis. The inline styles set top / bottom (which
           are inset-block-start / inset-block-end in writing-mode:
           vertical-lr) instead of left / right. The cross-axis
           sizing (block-size = track-height) is the same as horizontal. */
        :host([direction='vertical']) .track {
            block-size: var(--_track-height);
            inline-size: auto;
            inset-inline-start: 0;
            inset-inline-end: 0;
        }

        /* ── Stop indicator (4px dot at the OUTER end of each inactive segment) ──
           The dot marks the slider's min (left edge of left segment) and max
           (right edge of right segment). Outer edge depends on data-position:
             data-position='end'   → inline-end of the segment
             data-position='start' → inline-start of the segment
           In vertical mode the axis swaps, so it becomes block-end / block-start. */
        .stop-indicator {
            position: absolute;
            inline-size: var(--_stop-indicator-size);
            block-size: var(--_stop-indicator-size);
            border-radius: 50%;
            background: var(--_enabled-active-stop-indicator-color);
            inset-block-start: 50%;
            inset-inline-end: var(--_stop-indicator-trailing-space);
            transform: translateY(-50%);
        }

        /* Horizontal: flip dot to inline-start when the segment sits on the
           LEFT half of the slider. */
        .track[data-position='start'] .stop-indicator {
            inset-inline-end: auto;
            inset-inline-start: var(--_stop-indicator-trailing-space);
            transform: translateY(-50%);
        }

        :host([disabled]) .stop-indicator {
            background: var(--_disabled-active-stop-indicator-color);
        }

        /* Vertical: writing-mode: vertical-lr → inline axis is vertical,
           block axis is horizontal. The dot is centered horizontally
           (block-center) and pinned to the outer vertical edge. */
        :host([direction='vertical']) .track[data-position='start'] .stop-indicator {
            inset-block-start: 50%;
            inset-block-end: auto;
            inset-inline-start: var(--_stop-indicator-trailing-space);
            inset-inline-end: auto;
            transform: translate(-50%, 0);
        }
        :host([direction='vertical']) .track[data-position='end'] .stop-indicator {
            inset-block-start: 50%;
            inset-block-end: auto;
            inset-inline-start: auto;
            inset-inline-end: var(--_stop-indicator-trailing-space);
            transform: translate(-50%, 0);
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

        /* ── Handle (visual thumb) ───────────────────────────────────────────── */
        .handle {
            position: absolute;
            inset-block-start: 50%;
            transform: translateY(-50%);
            inline-size: var(--_handle-width);
            block-size: var(--_handle-size);
            background: var(--_enabled-handle-color);
            border-radius: 2px;
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

        /* ── Range handles — position is set per-instance via inline style ───
           The render code computes startFraction/endFraction from the
           current renderValueStart/renderValueEnd and emits a position
           style attribute on each handle. The CSS only needs to give the
           handles the same default size/color as the standard handle and
           let the inline style drive the placement. */
        .handle.range-handle-start,
        .handle.range-handle-end {
            position: absolute;
            inset-block-start: 50%;
        }

        /* ── Tick marks (per-step dots) ─────────────────────────────────────── */
        .tickmarks {
            position: absolute;
            inset: 0;
            pointer-events: none;
        }

        .tickmarks::before {
            content: '';
            position: absolute;
            inset: 0;
            /* The dot is placed at the LEFT edge of each background tile so
               the dots land on the slider's value positions (0%, 10%, ...,
               100% for step=10). The background-position is offset by
               NEGATIVE container-size so the FIRST tile's left edge sits
               at -2px, putting its dot at 0px (the slider's left edge).
               The last visible tile bleeds 2px past the right edge, so
               the 11th dot lands at 100% (the slider's right edge).
               This keeps the dots aligned with the handle position for
               every tick value, including the slider's edges. */
            background-image: radial-gradient(
                circle at var(--_with-tick-marks-container-size) center,
                var(--_enabled-with-tick-marks-inactive-container-color, currentColor) 0,
                var(--_enabled-with-tick-marks-inactive-container-color, currentColor)
                    calc(var(--_with-tick-marks-container-size) / 2),
                transparent calc(var(--_with-tick-marks-container-size) / 2)
            );
            background-size: calc(100% / var(--_tick-count)) 100%;
            background-position: calc(-1 * var(--_with-tick-marks-container-size)) 0;
            background-repeat: repeat-x;
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
           vertical and the block axis is horizontal. The label sits to
           the RIGHT of the handle (block axis = horizontal) and is
           vertically centered (inline axis = vertical). The
           translateY(-50%) folds the vertical centering into the
           transform so the scale animation pivots on the same point
           as the placement. */
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

        /* Vertical mode: label is positioned to the right of the handle
           and vertically centered. The scale pivots around the same
           center point as the placement. */
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
           left half (clipped to the right of 50%), input.end owns the
           right half (clipped to the left of 50%). The clip is set via
           inline style on the input directly (passed from renderInput)
           so the main-axis logic (horizontal vs vertical writing-mode)
           is centralized in the TS, not duplicated in CSS. The clip
           pieces look like inset-inline-end: 50% (left half) or
           inset-inline-start: 50% (right half). */
        .ranged input.start {
            clip-path: inset(0 50% 0 0);
        }
        .ranged input.end {
            clip-path: inset(0 0 0 50%);
        }
        :host([direction='vertical']) .ranged input.start {
            clip-path: inset(50% 0 0 0);
        }
        :host([direction='vertical']) .ranged input.end {
            clip-path: inset(0 0 50% 0);
        }

        /* Vertical: native input needs vertical orientation. */
        :host([direction='vertical']) input[type='range'] {
            writing-mode: vertical-lr;
            direction: rtl;
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
           cross axis. It's vertically centered within the container. */
        .active-overlay {
            position: absolute;
            background: var(--_enabled-active-track-color);
            block-size: var(--_track-height);
            inset-block-start: calc((100% - var(--_track-height)) / 2);
        }

        /* Rounded corners for the centered active overlay. The overlay is
           positioned at the container level (set inline), so these
           rules only own the rounded caps. The edge touching the value
           (the handle side) is rounded; the edge touching the slider
           center is sharp. */
        .active-overlay[data-position='end'] {
            border-start-start-radius: var(--_active-trailing-shape);
            border-end-start-radius: var(--_active-trailing-shape);
            border-start-end-radius: var(--_active-leading-shape);
            border-end-end-radius: var(--_active-leading-shape);
        }
        .active-overlay[data-position='start'] {
            border-start-start-radius: var(--_active-leading-shape);
            border-end-start-radius: var(--_active-leading-shape);
            border-start-end-radius: var(--_active-trailing-shape);
            border-end-end-radius: var(--_active-trailing-shape);
        }
            border-end-end-radius: var(--_active-trailing-shape);
        }
    `,
]
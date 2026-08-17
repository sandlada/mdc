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

        /* ── Container (flex row → column in vertical) ────────────────────────
           In writing-mode: horizontal-tb, flex-direction: row gives a
           horizontal main axis. In writing-mode: vertical-lr the same
           flex-direction: row gives a VERTICAL main axis (because the
           flex direction 'row' maps to the inline axis of the writing
           mode). The base flex-direction: row therefore works for both
           modes without needing to flip — flipping to 'column' would
           give a horizontal main axis in vertical-lr, which is wrong.

           For ranged mode, the base slider's .ranged input.start/end
           clip-path rules (which split pointer events between the two
           handles) consume --_state-layer-size, --_start-fraction and
           --_end-fraction. We publish --_start-fraction / --_end-fraction
           already via styleMap; --_state-layer-size is pinned to 0 here
           so the base formula collapses to a clean midpoint between
           valueStart and valueEnd. */
        .container {
            flex: 1;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: var(--_track-segment-gap);
            inline-size: 100%;
            block-size: 100%;
            pointer-events: none;
            touch-action: none;
            user-select: none;
            position: relative;

            --_state-layer-size: 0px;
            --_clip-to-start: calc(
                var(--_start-fraction) * 100%
                + (var(--_end-fraction) - var(--_start-fraction)) * 50%
            );
            --_clip-to-end: calc(100% - var(--_clip-to-start));
        }

        /* ── Track segments (active + inactive) ─────────────────────────────── */
        .track {
            flex: 1 1 0;
            min-inline-size: 0;
            min-block-size: 0;
            block-size: var(--_track-height);
            background: var(--_enabled-inactive-track-color);
            position: relative;
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

        /* Vertical mode: tracks are narrower than the container so the
           handle can stick out beyond the track edges. In writing-mode:
           vertical-lr the inline axis is vertical (top→bottom) and the
           block axis is horizontal (left→right). The track is therefore a
           horizontal bar (block = full-width-ish, inline = flex-grow
           controlled vertically). */
        :host([direction='vertical']) .track {
            block-size: var(--_track-height);
            inline-size: auto;
            align-self: center;
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
            flex: none;
            inline-size: var(--_handle-width);
            block-size: var(--_handle-size);
            background: var(--_enabled-handle-color);
            border-radius: 2px;
            position: relative;
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
            display: flex;
            align-items: center;
            pointer-events: none;

            --_tick-track-padding: calc((var(--_handle-size) / 2) - 2px);
            inset-inline-start: var(--_tick-track-padding);
            inset-inline-end: var(--_tick-track-padding);

            background-size: calc((100% - 4px) / var(--_tick-count)) 100%;
        }

        .tickmarks::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: radial-gradient(
                circle at 2px center,
                var(--_enabled-with-tick-marks-inactive-container-color, currentColor) 0,
                var(--_enabled-with-tick-marks-inactive-container-color, currentColor) 1px,
                transparent 1px
            );
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
           left half (clipped to the right of the midpoint), input.end owns
           the right half (clipped to the left of the midpoint). The
           midpoint is computed from the --_start-fraction / --_end-fraction
           custom props. Mirrors the base slider's .ranged rules; those
           don't apply here because the expressive-slider overrides
           static styles and ships its own sheet. */
        .ranged input.start {
            clip-path: inset(0 var(--_clip-to-end) 0 0);
        }
        .ranged input.end {
            clip-path: inset(0 0 0 var(--_clip-to-start));
        }
        :host([direction='vertical']) .ranged input.start {
            clip-path: inset(var(--_clip-to-end) 0 0 0);
        }
        :host([direction='vertical']) .ranged input.end {
            clip-path: inset(0 0 var(--_clip-to-start) 0);
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

        /* ── Active overlay (centered type only) ───────────────────────────── */
        .active-overlay {
            position: absolute;
            background: var(--_enabled-active-track-color);
            block-size: 100%;
        }

        /* Horizontal: overlay in track-end grows from the track's LEFT edge
           (= slider center) toward the value (end side). Rounded cap sits at
           the value end. */
        .active-overlay[data-position='end'] {
            inset-block-start: 0;
            inset-inline-start: 0;
            border-start-start-radius: var(--_active-trailing-shape);
            border-end-start-radius: var(--_active-trailing-shape);
            border-start-end-radius: var(--_active-leading-shape);
            border-end-end-radius: var(--_active-leading-shape);
        }

        /* Horizontal: overlay in track-start grows from the track's RIGHT
           edge (= slider center) toward the value (start side). Rounded cap
           sits at the value start. */
        .active-overlay[data-position='start'] {
            inset-block-start: 0;
            inset-inline-end: 0;
            border-start-start-radius: var(--_active-leading-shape);
            border-end-start-radius: var(--_active-leading-shape);
            border-start-end-radius: var(--_active-trailing-shape);
            border-end-end-radius: var(--_active-trailing-shape);
        }

        /* Vertical: same logic, swapping top↔bottom. */
        :host([direction='vertical']) .active-overlay[data-position='end'] {
            inset-block-start: 0;
            inset-inline-start: 0;
            border-start-start-radius: var(--_active-trailing-shape);
            border-end-start-radius: var(--_active-trailing-shape);
            border-start-end-radius: var(--_active-leading-shape);
            border-end-end-radius: var(--_active-leading-shape);
        }
        :host([direction='vertical']) .active-overlay[data-position='start'] {
            inset-block-end: 0;
            inset-inline-start: 0;
            border-start-start-radius: var(--_active-leading-shape);
            border-end-start-radius: var(--_active-leading-shape);
            border-start-end-radius: var(--_active-trailing-shape);
            border-end-end-radius: var(--_active-trailing-shape);
        }
    `,
]
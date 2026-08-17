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

        /* ── Container (flex row → column in vertical) ──────────────────────── */
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
        }

        :host([direction='vertical']) .container {
            flex-direction: column;
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

        /* Rounded corners — leading side carries the rounded cap, trailing is 2px. */
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
        .track[data-position='start'][data-active='false'] {
            border-start-start-radius: var(--_inactive-leading-shape);
            border-end-start-radius: var(--_inactive-leading-shape);
            border-start-end-radius: var(--_inactive-trailing-shape);
            border-end-end-radius: var(--_inactive-trailing-shape);
        }
        .track[data-position='end'][data-active='false'] {
            border-start-start-radius: var(--_inactive-trailing-shape);
            border-end-start-radius: var(--_inactive-trailing-shape);
            border-start-end-radius: var(--_inactive-leading-shape);
            border-end-end-radius: var(--_inactive-leading-shape);
        }

        /* Vertical mode: flip which side carries the rounded cap because the
           active grows from the bottom (min) upward, not from the left. */
        :host([direction='vertical']) .track[data-position='start'][data-active='true'] {
            border-start-start-radius: var(--_active-trailing-shape);
            border-end-start-radius: var(--_active-trailing-shape);
            border-start-end-radius: var(--_active-leading-shape);
            border-end-end-radius: var(--_active-leading-shape);
        }
        :host([direction='vertical']) .track[data-position='end'][data-active='true'] {
            border-start-start-radius: var(--_active-leading-shape);
            border-end-start-radius: var(--_active-leading-shape);
            border-start-end-radius: var(--_active-trailing-shape);
            border-end-end-radius: var(--_active-trailing-shape);
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
           handle can stick out beyond the track edges. */
        :host([direction='vertical']) .track {
            inline-size: var(--_track-height);
            block-size: auto;
            align-self: center;
        }

        /* ── Stop indicator (4px dot at the inactive track end) ─────────────── */
        .stop-indicator {
            position: absolute;
            inline-size: var(--_stop-indicator-size);
            block-size: var(--_stop-indicator-size);
            border-radius: 50%;
            background: var(--_enabled-active-stop-indicator-color);
            inset-block-start: 50%;
            inset-inline-end: 4px;
            transform: translateY(-50%);
        }

        :host([disabled]) .stop-indicator {
            background: var(--_disabled-active-stop-indicator-color);
        }

        /* Vertical: stop indicator on the right edge of the top track. */
        :host([direction='vertical']) .track[data-position='start'] .stop-indicator {
            inset-block-start: auto;
            inset-block-end: 4px;
            transform: unset;
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

        /* Vertical: handle is transposed (wide + 4px tall). */
        :host([direction='vertical']) .handle {
            inline-size: var(--_handle-size);
            block-size: var(--_handle-width);
        }

        /* ── Range handles — symmetric about center ────────────────────────── */
        .handle.range-handle-start {
            position: absolute;
            inset-inline-start: 50%;
            inset-block-start: 50%;
            transform: translate(
                calc(-1 * (var(--_range-handle-center-gap) / 2 + var(--_handle-width))),
                -50%
            );
        }
        .handle.range-handle-end {
            position: absolute;
            inset-inline-start: 50%;
            inset-block-start: 50%;
            transform: translate(
                calc(var(--_range-handle-center-gap) / 2),
                -50%
            );
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

        /* ── Value indicator (label pill) ───────────────────────────────────── */
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
            min-inline-size: var(--_label-container-height);
            min-block-size: var(--_label-container-height);
            background: var(--_enabled-label-container-color);
            transform-origin: center bottom;
            transform: scale(0);
            transition-property: transform;
            transition-duration: ${short2Duration};
            transition-timing-function: ${emphasizedEasing};
            z-index: 3;
            pointer-events: none;
            white-space: nowrap;
        }

        /* Vertical mode: label sits to the right of the handle. */
        :host([direction='vertical']) .label {
            inset-block-end: auto;
            inset-inline-start: 100%;
            transform-origin: center left;
            margin-inline-start: 8px;
        }

        :host(:focus-within) .label,
        :where(:has(input:active)) .label,
        .handle.hover .label {
            transform: scale(1);
        }

        :host([direction='vertical']:focus-within) .label,
        :host([direction='vertical']:has(input:active)) .label,
        :host([direction='vertical']) .handle.hover .label {
            transform: scale(1);
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
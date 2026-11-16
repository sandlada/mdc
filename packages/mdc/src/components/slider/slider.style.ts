/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Styles for `mdc-slider` — Material Design 3 Expressive slider.
 *
 * @link https://m3.material.io/components/sliders/specs
 */

import { Duration, Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import { SliderDefinition } from './slider.definition'
import { stringifyTokens } from '../../utils/style'

const TokensStringified = stringifyTokens('--mdc-slider')(SliderDefinition)

const Short2Duration = unsafeCSS(Duration.Short2.ToCSSVariable())
const EmphasizedEasing = unsafeCSS(Easing.Emphasized.ToCSSVariable())

export const SliderStyles = [
    css`
        :host {
            ${TokensStringified};

            --_track-height: var(--_extra-small-track-height);
            --_track-outer-corner: var(--_extra-small-track-outer-corner-size);
            --_handle-height: var(--_extra-small-handle-height);
            --_stop-indicator-inset: var(--_extra-small-stop-indicator-inset);
            --_icon-size: 0px;
            --_icon-leading-space: 0px;

            --_rest-handle-width: var(--_handle-width);
            --_edge-inset: calc(var(--_rest-handle-width) / 2);
            --_travel: calc(100% - 2 * var(--_edge-inset));

            display: inline-flex;
            align-items: center;
            justify-content: center;
            vertical-align: middle;
            position: relative;
            box-sizing: border-box;
            inline-size: 280px;
            max-inline-size: 100%;
            min-inline-size: 96px;
            block-size: max(var(--_touch-target-size), var(--_handle-height));
            user-select: none;
            touch-action: none;
            -webkit-tap-highlight-color: transparent;
        }

        :host([direction='vertical']) {
            inline-size: max(var(--_touch-target-size), var(--_handle-height));
            max-inline-size: none;
            min-inline-size: 0;
            block-size: 240px;
            min-block-size: 96px;
        }

        /* ── Size presets ─────────────────────────────────────────────────────── */
        :host([size='small']) {
            --_track-height: var(--_small-track-height);
            --_track-outer-corner: var(--_small-track-outer-corner-size);
            --_handle-height: var(--_small-handle-height);
            --_stop-indicator-inset: var(--_small-stop-indicator-inset);
        }

        :host([size='medium']) {
            --_track-height: var(--_medium-track-height);
            --_track-outer-corner: var(--_medium-track-outer-corner-size);
            --_handle-height: var(--_medium-handle-height);
            --_stop-indicator-inset: var(--_medium-stop-indicator-inset);
            --_icon-size: var(--_medium-icon-size);
            --_icon-leading-space: var(--_medium-icon-leading-space);
        }

        :host([size='large']) {
            --_track-height: var(--_large-track-height);
            --_track-outer-corner: var(--_large-track-outer-corner-size);
            --_handle-height: var(--_large-handle-height);
            --_stop-indicator-inset: var(--_large-stop-indicator-inset);
            --_icon-size: var(--_large-icon-size);
            --_icon-leading-space: var(--_large-icon-leading-space);
        }

        :host([size='extra-large']) {
            --_track-height: var(--_extra-large-track-height);
            --_track-outer-corner: var(--_extra-large-track-outer-corner-size);
            --_handle-height: var(--_extra-large-handle-height);
            --_stop-indicator-inset: var(--_extra-large-stop-indicator-inset);
            --_icon-size: var(--_extra-large-icon-size);
            --_icon-leading-space: var(--_extra-large-icon-leading-space);
        }

        /* ── Container ────────────────────────────────────────────────────────── */
        .container {
            --_start-handle-width: var(--_handle-width);
            --_end-handle-width: var(--_handle-width);
            position: relative;
            inline-size: 100%;
            block-size: 100%;
            cursor: pointer;
            touch-action: none;
            user-select: none;
        }

        .container[data-pressed-thumb='start'] {
            --_start-handle-width: var(--_pressed-handle-width);
        }

        .container[data-pressed-thumb='end'] {
            --_end-handle-width: var(--_pressed-handle-width);
        }

        :host([disabled]) .container {
            cursor: default;
        }

        /* ── Track segments ───────────────────────────────────────────────────── */
        .track-segment {
            position: absolute;
            box-sizing: border-box;
            inset-block-start: calc(50% - var(--_track-height) / 2);
            block-size: var(--_track-height);
            inset-inline-start: var(--_seg-start);
            inline-size: max(0px, calc(var(--_seg-end) - var(--_seg-start)));
            background-color: var(--_enabled-inactive-track-color);
            overflow: hidden;
            pointer-events: none;

            border-start-start-radius: var(--_cap-start-radius);
            border-end-start-radius: var(--_cap-start-radius);
            border-start-end-radius: var(--_cap-end-radius);
            border-end-end-radius: var(--_cap-end-radius);
        }

        .track-segment[data-role='active'] {
            background-color: var(--_enabled-active-track-color);
        }

        .track-segment[data-cap-start='outer'] {
            --_cap-start-radius: var(--_track-outer-corner);
        }
        .track-segment[data-cap-start='inner'] {
            --_cap-start-radius: var(--_track-inner-corner-size);
        }
        .track-segment[data-cap-start='flat'] {
            --_cap-start-radius: 0px;
        }

        .track-segment[data-cap-end='outer'] {
            --_cap-end-radius: var(--_track-outer-corner);
        }
        .track-segment[data-cap-end='inner'] {
            --_cap-end-radius: var(--_track-inner-corner-size);
        }
        .track-segment[data-cap-end='flat'] {
            --_cap-end-radius: 0px;
        }

        :host([direction='vertical']) .track-segment {
            inset-inline-start: calc(50% - var(--_track-height) / 2);
            inline-size: var(--_track-height);
            inset-block-start: auto;
            inset-block-end: var(--_seg-start);
            block-size: max(0px, calc(var(--_seg-end) - var(--_seg-start)));

            border-end-start-radius: var(--_cap-start-radius);
            border-end-end-radius: var(--_cap-start-radius);
            border-start-start-radius: var(--_cap-end-radius);
            border-start-end-radius: var(--_cap-end-radius);
        }

        :host([disabled]) .track-segment[data-role='active'] {
            background-color: color-mix(
                in srgb,
                var(--_disabled-active-track-color) calc(var(--_disabled-active-track-opacity) * 100%),
                transparent
            );
        }

        :host([disabled]) .track-segment[data-role='inactive'] {
            background-color: color-mix(
                in srgb,
                var(--_disabled-inactive-track-color) calc(var(--_disabled-inactive-track-opacity) * 100%),
                transparent
            );
        }

        /* ── Stop indicators ──────────────────────────────────────────────────── */
        .stop-indicator {
            position: absolute;
            inline-size: var(--_stop-indicator-size);
            block-size: var(--_stop-indicator-size);
            border-radius: var(--_stop-indicator-shape);
            background-color: var(--_enabled-stop-indicator-color);
            pointer-events: none;
            z-index: 1;
            inset-block-start: 50%;
            transform: translate(-50%, -50%);
        }

        .stop-indicator[data-edge='start'] {
            inset-inline-start: var(--_stop-indicator-inset);
        }
        .stop-indicator[data-edge='end'] {
            inset-inline-end: var(--_stop-indicator-inset);
            transform: translate(50%, -50%);
        }
        .stop-indicator[data-edge='center'] {
            inset-inline-start: 50%;
            background-color: var(--_enabled-active-tick-color);
            opacity: var(--_enabled-active-tick-opacity);
        }

        :host(:dir(rtl)) .stop-indicator[data-edge='start'] {
            transform: translate(50%, -50%);
        }
        :host(:dir(rtl)) .stop-indicator[data-edge='end'] {
            transform: translate(-50%, -50%);
        }

        :host([direction='vertical']) .stop-indicator {
            inset-inline-start: 50%;
            inset-inline-end: auto;
            transform: translate(-50%, 50%);
        }
        :host([direction='vertical']) .stop-indicator[data-edge='start'] {
            inset-block-start: auto;
            inset-block-end: var(--_stop-indicator-inset);
        }
        :host([direction='vertical']) .stop-indicator[data-edge='end'] {
            inset-block-start: var(--_stop-indicator-inset);
            inset-block-end: auto;
            transform: translate(-50%, -50%);
        }
        :host([direction='vertical']) .stop-indicator[data-edge='center'] {
            inset-block-start: 50%;
            inset-block-end: auto;
            transform: translate(-50%, -50%);
        }

        :host([disabled]) .stop-indicator {
            background-color: color-mix(
                in srgb,
                var(--_disabled-stop-indicator-color) calc(var(--_disabled-stop-indicator-opacity) * 100%),
                transparent
            );
        }

        /* ── Discrete tick marks ──────────────────────────────────────────────── */
        .tick {
            position: absolute;
            inline-size: var(--_tick-size);
            block-size: var(--_tick-size);
            border-radius: var(--_tick-shape);
            background-color: color-mix(
                in srgb,
                var(--_enabled-inactive-tick-color) calc(var(--_enabled-inactive-tick-opacity) * 100%),
                transparent
            );
            pointer-events: none;
            z-index: 1;
            inset-block-start: 50%;
            inset-inline-start: calc(var(--_edge-inset) + var(--_tick-vf) * var(--_travel));
            transform: translate(-50%, -50%);
        }

        .tick[data-active='true'] {
            background-color: color-mix(
                in srgb,
                var(--_enabled-active-tick-color) calc(var(--_enabled-active-tick-opacity) * 100%),
                transparent
            );
        }

        :host(:dir(rtl)) .tick {
            transform: translate(50%, -50%);
        }

        :host([direction='vertical']) .tick {
            inset-inline-start: 50%;
            inset-block-start: auto;
            inset-block-end: calc(var(--_edge-inset) + var(--_tick-vf) * var(--_travel));
            transform: translate(-50%, 50%);
        }

        :host([disabled]) .tick {
            background-color: color-mix(
                in srgb,
                var(--_disabled-inactive-tick-color) calc(var(--_disabled-inactive-tick-opacity) * 100%),
                transparent
            );
        }

        :host([disabled]) .tick[data-active='true'] {
            background-color: color-mix(
                in srgb,
                var(--_disabled-active-tick-color) calc(var(--_disabled-active-tick-opacity) * 100%),
                transparent
            );
        }

        /* ── Inset icon (M / L / XL standard sliders) ─────────────────────────── */
        .inset-icon {
            position: absolute;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            inline-size: var(--_icon-size);
            block-size: var(--_icon-size);
            color: var(--_enabled-active-icon-color);
            pointer-events: none;
            z-index: 1;
            inset-block-start: 50%;
            inset-inline-start: var(--_icon-leading-space);
            transform: translateY(-50%);
            transition: opacity ${Short2Duration} ${EmphasizedEasing}, color ${Short2Duration} ${EmphasizedEasing};
        }

        .inset-icon[hidden] {
            display: none;
        }

        .inset-icon[data-reversed='true'] {
            inset-inline-start: auto;
            inset-inline-end: var(--_icon-leading-space);
        }

        .inset-icon[data-inactive-surface='true'] {
            color: var(--_enabled-inactive-icon-color);
        }

        .inset-icon[data-occluded='true'] {
            opacity: 0;
        }

        .inset-icon ::slotted(*),
        .inset-icon mdc-icon {
            font-size: var(--_icon-size);
            inline-size: var(--_icon-size);
            block-size: var(--_icon-size);
            color: inherit;
        }

        :host([direction='vertical']) .inset-icon {
            inset-inline-start: 50%;
            inset-inline-end: auto;
            inset-block-start: auto;
            inset-block-end: var(--_icon-leading-space);
            transform: translateX(-50%);
        }

        :host([direction='vertical']) .inset-icon[data-reversed='true'] {
            inset-block-end: auto;
            inset-block-start: var(--_icon-leading-space);
        }

        :host([disabled]) .inset-icon {
            color: color-mix(
                in srgb,
                var(--_disabled-icon-color) calc(var(--_disabled-icon-opacity) * 100%),
                transparent
            );
        }

        /* ── Thumb touch target + handle ──────────────────────────────────────── */
        .thumb {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            inline-size: var(--_touch-target-size);
            block-size: max(var(--_touch-target-size), var(--_handle-height));
            inset-block-start: 50%;
            inset-inline-start: calc(var(--_edge-inset) + var(--_vf) * var(--_travel));
            transform: translate(-50%, -50%);
            outline: none;
            z-index: 2;
        }

        :host(:dir(rtl)) .thumb {
            transform: translate(50%, -50%);
        }

        :host([direction='vertical']) .thumb {
            inline-size: max(var(--_touch-target-size), var(--_handle-height));
            block-size: var(--_touch-target-size);
            inset-inline-start: 50%;
            inset-block-start: auto;
            inset-block-end: calc(var(--_edge-inset) + var(--_vf) * var(--_travel));
            transform: translate(-50%, 50%);
        }

        .thumb.pressed {
            z-index: 3;
        }

        .thumb.focused {
            z-index: 3;
        }

        .handle-ring-anchor {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            inline-size: 16px;
            block-size: calc(var(--_handle-height) + 4px);
            border-radius: var(--_handle-shape);
            pointer-events: none;
        }

        :host([direction='vertical']) .handle-ring-anchor {
            inline-size: calc(var(--_handle-height) + 4px);
            block-size: 16px;
        }

        .state-layer {
            position: absolute;
            inline-size: var(--_state-layer-size);
            block-size: var(--_state-layer-size);
            border-radius: var(--_handle-shape);
            background-color: var(--_hovered-state-layer-color);
            opacity: 0;
            pointer-events: none;
            transition: opacity ${Short2Duration} ${EmphasizedEasing};
        }

        .thumb.hovered .state-layer {
            background-color: var(--_hovered-state-layer-color);
            opacity: var(--_hovered-state-layer-opacity);
        }

        .thumb.focused .state-layer {
            background-color: var(--_focused-state-layer-color);
            opacity: var(--_focused-state-layer-opacity);
        }

        .thumb.pressed .state-layer {
            background-color: var(--_pressed-state-layer-color);
            opacity: var(--_pressed-state-layer-opacity);
        }

        :host([disabled]) .state-layer {
            display: none;
        }

        .handle {
            position: relative;
            inline-size: var(--_end-handle-width);
            block-size: var(--_handle-height);
            border-radius: var(--_handle-shape);
            background-color: var(--_enabled-handle-color);
            pointer-events: none;
            transition:
                inline-size ${Short2Duration} ${EmphasizedEasing},
                block-size ${Short2Duration} ${EmphasizedEasing},
                background-color ${Short2Duration} ${EmphasizedEasing};
        }

        .thumb[data-thumb='start'] .handle {
            inline-size: var(--_start-handle-width);
        }

        :host([direction='vertical']) .handle {
            inline-size: var(--_handle-height);
            block-size: var(--_end-handle-width);
        }

        :host([direction='vertical']) .thumb[data-thumb='start'] .handle {
            block-size: var(--_start-handle-width);
        }

        .thumb.hovered .handle {
            background-color: var(--_hovered-handle-color);
        }

        .thumb.focused .handle {
            background-color: var(--_focused-handle-color);
        }

        .thumb.pressed .handle {
            background-color: var(--_pressed-handle-color);
        }

        :host([disabled]) .handle {
            background-color: color-mix(
                in srgb,
                var(--_disabled-handle-color) calc(var(--_disabled-handle-opacity) * 100%),
                transparent
            );
        }

        /* ── Value indicator (label pill) ─────────────────────────────────────── */
        .label {
            position: absolute;
            box-sizing: border-box;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-inline-size: var(--_label-container-min-width);
            block-size: var(--_label-container-height);
            padding-inline-start: var(--_label-container-padding-inline-start);
            padding-inline-end: var(--_label-container-padding-inline-end);
            padding-block-start: var(--_label-container-padding-block-start);
            padding-block-end: var(--_label-container-padding-block-end);
            border-start-start-radius: var(--_label-container-shape-start-start);
            border-start-end-radius: var(--_label-container-shape-start-end);
            border-end-start-radius: var(--_label-container-shape-end-start);
            border-end-end-radius: var(--_label-container-shape-end-end);
            background-color: var(--_enabled-label-container-color);
            color: var(--_enabled-label-text-color);

            font-family: var(--_label-text-font);
            font-size: var(--_label-text-size);
            line-height: var(--_label-text-leading);
            font-weight: var(--_label-text-weight);
            letter-spacing: var(--_label-text-tracking);

            inset-inline-start: 50%;
            inset-block-end: calc(50% + var(--_handle-height) / 2 + var(--_label-offset));
            transform-origin: center bottom;
            transform: translate(-50%, 4px) scale(0.75);
            opacity: 0;
            pointer-events: none;
            white-space: nowrap;
            z-index: 4;
            transition:
                opacity ${Short2Duration} ${EmphasizedEasing},
                transform ${Short2Duration} ${EmphasizedEasing};
        }

        :host([direction='vertical']) .label {
            inset-block-end: auto;
            inset-block-start: 50%;
            inset-inline-start: calc(50% + var(--_handle-height) / 2 + var(--_label-offset));
            transform-origin: left center;
            transform: translate(-4px, -50%) scale(0.75);
        }

        :host([direction='vertical']:dir(rtl)) .label {
            transform-origin: right center;
            transform: translate(4px, -50%) scale(0.75);
        }

        .thumb.hovered .label,
        .thumb.pressed .label,
        .thumb.focused .label {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
        }

        :host([direction='vertical']) .thumb.hovered .label,
        :host([direction='vertical']) .thumb.pressed .label,
        :host([direction='vertical']) .thumb.focused .label {
            opacity: 1;
            transform: translate(0, -50%) scale(1);
        }

        :host([disabled]) .label {
            display: none;
        }

        /* ── Accessibility media preferences ──────────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
            .handle,
            .state-layer,
            .label,
            .inset-icon {
                transition: none;
            }
        }

        @media (prefers-contrast: more) {
            .track-segment {
                border: 1px solid CanvasText;
            }
            .handle {
                outline: 1px solid Canvas;
            }
        }

        @media (prefers-reduced-transparency: reduce) {
            .tick,
            .tick[data-active='true'],
            .stop-indicator[data-edge='center'] {
                opacity: 1;
            }
        }

        @media (forced-colors: active) {
            .track-segment[data-role='inactive'] {
                background-color: Canvas;
                border: 1px solid CanvasText;
            }
            .track-segment[data-role='active'] {
                background-color: Highlight;
                border: 1px solid Highlight;
            }
            .handle {
                background-color: Highlight;
                border: 1px solid Canvas;
            }
            .stop-indicator,
            .tick {
                background-color: CanvasText;
                opacity: 1;
            }
            .tick[data-active='true'] {
                background-color: HighlightText;
                opacity: 1;
            }
            .label {
                background-color: Canvas;
                color: CanvasText;
                border: 1px solid CanvasText;
            }
            .inset-icon {
                color: HighlightText;
            }
            .inset-icon[data-inactive-surface='true'] {
                color: CanvasText;
            }
            :host([disabled]) .track-segment[data-role='inactive'],
            :host([disabled]) .track-segment[data-role='active'] {
                background-color: Canvas;
                border-color: GrayText;
            }
            :host([disabled]) .handle,
            :host([disabled]) .stop-indicator,
            :host([disabled]) .tick,
            :host([disabled]) .inset-icon {
                background-color: GrayText;
                color: GrayText;
            }
            :host([disabled]) .inset-icon {
                background-color: transparent;
            }
        }
    `,
]

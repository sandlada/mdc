/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { Easing } from '@sandlada/mdk'
import type { ElevationDefinition } from '../elevation/elevation.definition'
import { RippleDefinition } from '../ripple/ripple.definition'
import { TimePickerDialDefinition, TimePickerInputDefinition } from './time-picker.definition'
import { overrideTokens, stringifyTokens } from '../../utils/style'

const dialTokens = stringifyTokens('--mdc-time-picker')(TimePickerDialDefinition)
const inputTokens = stringifyTokens('--mdc-time-picker')(TimePickerInputDefinition)

const elevationStyles = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_enabled-container-elevation)`,
})()

/**
 * State-layer tokens bridge into the embedded `mdc-ripple`'s
 * hovered/focused/pressed color and opacity tokens.
 */
const rippleBridge = (group: 'dial' | 'time-selector' | 'period') => overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'hovered-color': `var(--_hovered-${group}-state-layer-color)`,
    'focused-color': `var(--_focused-${group}-state-layer-color)`,
    'pressed-color': `var(--_pressed-${group}-state-layer-color)`,
    'hovered-opacity': `var(--_hovered-${group}-state-layer-opacity)`,
    'focused-opacity': `var(--_focused-${group}-state-layer-opacity)`,
    'pressed-opacity': `var(--_pressed-${group}-state-layer-opacity)`,
})()

const dialRippleStyles = rippleBridge('dial')
const timeSelectorRippleStyles = rippleBridge('time-selector')
const periodRippleStyles = rippleBridge('period')

const stylePart = css`
    @layer mdc.time-picker.component {
        .container > mdc-elevation {
            ${elevationStyles};
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
        }

        :host {
            display: contents;
            user-select: none;
        }

        dialog {
            background: transparent;
            border: none;
            border-start-start-radius: var(--_container-shape-start-start);
            border-start-end-radius: var(--_container-shape-start-end);
            border-end-end-radius: var(--_container-shape-end-end);
            border-end-start-radius: var(--_container-shape-end-start);
            margin: auto;
            max-height: min(640px, calc(100% - 48px));
            max-width: min(640px, calc(100% - 48px));
            min-width: 280px;
            outline: none;
            overflow: visible;
            padding: 0;
            width: fit-content;
        }

        dialog[open] {
            display: flex;
            flex-direction: column;
        }

        ::backdrop {
            background: none;
        }

        .scrim {
            background: var(--md-sys-color-scrim, #000);
            display: none;
            inset: 0;
            opacity: 0.32;
            pointer-events: none;
            position: fixed;
            z-index: 1;
        }

        :host([open]) .scrim {
            display: flex;
        }

        .container {
            background: var(--_enabled-container-color);
            border-radius: inherit;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            padding-block-start: var(--_container-padding-block-start);
            padding-block-end: var(--_container-padding-block-end);
            padding-inline-start: var(--_container-padding-inline-start);
            padding-inline-end: var(--_container-padding-inline-end);
            position: relative;
            user-select: none;
        }

        .headline {
            color: var(--_enabled-headline-label-color);
            font-family: var(--_headline-label-font);
            font-size: var(--_headline-label-size);
            font-weight: var(--_headline-label-weight);
            letter-spacing: var(--_headline-label-tracking);
            line-height: var(--_headline-label-leading);
            margin: 0;
        }

        .body {
            align-items: center;
            display: flex;
            gap: 24px;
        }

        :host([orientation='vertical']) .body {
            flex-direction: column;
        }

        :host([orientation='horizontal']) .body {
            flex-direction: row;
        }

        .selectors {
            display: flex;
            gap: 8px;
        }

        :host([orientation='vertical']) .selectors {
            align-items: stretch;
            justify-content: space-between;
        }

        :host([orientation='horizontal']) .selectors {
            align-items: flex-start;
            flex-direction: column;
            gap: 24px;
        }

        .time-selectors {
            align-items: center;
            display: flex;
            gap: 8px;
        }

        .time-cell {
            align-items: center;
            appearance: none;
            background: var(--_enabled-time-selector-unselected-container-color);
            border: none;
            border-start-start-radius: var(--_time-selector-container-shape-start-start);
            border-start-end-radius: var(--_time-selector-container-shape-start-end);
            border-end-end-radius: var(--_time-selector-container-shape-end-end);
            border-end-start-radius: var(--_time-selector-container-shape-end-start);
            color: var(--_enabled-time-selector-unselected-label-color);
            cursor: pointer;
            display: flex;
            font-family: var(--_time-selector-label-font);
            font-size: var(--_time-selector-label-size);
            font-weight: var(--_time-selector-label-weight);
            height: var(--_time-selector-container-height);
            justify-content: center;
            letter-spacing: var(--_time-selector-label-tracking);
            line-height: var(--_time-selector-label-leading);
            padding: 0;
            position: relative;
            width: var(--_time-selector-container-width);
        }

        :host([is-24-hour]) .time-cell {
            width: var(--_time-selector-wide-container-width);
        }

        .time-cell mdc-ripple {
            border-radius: inherit;
            position: absolute;
            ${timeSelectorRippleStyles};
        }

        .time-cell.selected {
            background: var(--_enabled-time-selector-selected-container-color);
            color: var(--_enabled-time-selector-selected-label-color);
        }

        .time-cell:focus-visible {
            outline: 2px solid var(--_enabled-dial-selector-color);
            outline-offset: 2px;
        }

        .separator {
            color: var(--_enabled-time-selector-separator-color);
            font-family: var(--_time-selector-label-font);
            font-size: var(--_time-selector-label-size);
        }

        .period {
            border: 1px solid var(--_enabled-period-selector-outline-color);
            border-radius: 12px;
            display: flex;
            overflow: hidden;
        }

        :host([orientation='vertical']) .period {
            flex-direction: column;
            height: var(--_period-selector-vertical-container-height);
            width: var(--_period-selector-vertical-container-width);
        }

        :host([orientation='horizontal']) .period {
            flex-direction: row;
            height: var(--_period-selector-horizontal-container-height);
            width: var(--_period-selector-horizontal-container-width);
        }

        .period-button {
            align-items: center;
            appearance: none;
            background: var(--_enabled-period-selector-unselected-container-color);
            border: none;
            color: var(--_enabled-period-selector-unselected-label-color);
            cursor: pointer;
            display: flex;
            flex: 1;
            font-family: var(--_period-selector-label-font);
            font-size: var(--_period-selector-label-size);
            font-weight: var(--_period-selector-label-weight);
            justify-content: center;
            letter-spacing: var(--_period-selector-label-tracking);
            line-height: var(--_period-selector-label-leading);
            padding: 0;
            position: relative;
        }

        .period-button mdc-ripple {
            border-radius: inherit;
            position: absolute;
            ${periodRippleStyles};
        }

        .period-button.selected {
            background: var(--_enabled-period-selector-selected-container-color);
            color: var(--_enabled-period-selector-selected-label-color);
        }

        .dial {
            border-radius: 50%;
            background: var(--_enabled-dial-container-color);
            height: var(--_dial-container-size);
            position: relative;
            touch-action: none;
            width: var(--_dial-container-size);
        }

        .dial-label {
            align-items: center;
            appearance: none;
            background: transparent;
            border: none;
            border-radius: 50%;
            color: var(--_enabled-dial-label-color);
            cursor: pointer;
            display: flex;
            font-family: var(--_dial-label-font);
            font-size: var(--_dial-label-size);
            height: var(--_dial-selector-handle-size);
            justify-content: center;
            padding: 0;
            position: absolute;
            width: var(--_dial-selector-handle-size);
        }

        .dial-label mdc-ripple {
            border-radius: inherit;
            position: absolute;
            ${dialRippleStyles};
        }

        .dial-label:focus-visible {
            outline: 2px solid var(--_enabled-dial-selector-color);
            outline-offset: 2px;
        }

        .dial-track {
            background: var(--_enabled-dial-selector-color);
            height: calc(var(--_dial-container-size) / 2 - var(--_dial-selector-handle-size) / 2);
            left: 50%;
            position: absolute;
            top: 50%;
            transform-origin: top center;
            transition: transform 500ms ${unsafeCSS(Easing.ExpressiveFastSpatial.ToCSSValue())}, height 300ms ${unsafeCSS(Easing.StandardDefaultSpatial.ToCSSValue())};
            width: var(--_dial-selector-track-width);
            z-index: 1;
        }

        /* While dragging the hand follows magnetically with a faster,
           overshoot-free curve. */
        .dial.dragging .dial-track {
            transition-duration: 150ms, 200ms;
            transition-timing-function: ${unsafeCSS(Easing.Standard.ToCSSValue())}, ${unsafeCSS(Easing.StandardDefaultSpatial.ToCSSValue())};
        }

        .dial-handle {
            align-items: center;
            background: var(--_enabled-dial-selector-color);
            border-radius: 50%;
            bottom: calc(var(--_dial-selector-handle-size) / -2);
            color: var(--_enabled-dial-selected-label-color);
            display: flex;
            font-family: var(--_dial-label-font);
            font-size: var(--_dial-label-size);
            height: var(--_dial-selector-handle-size);
            justify-content: center;
            left: 50%;
            line-height: var(--_dial-label-leading);
            position: absolute;
            /* Counter-rotates against the track so the value stays upright;
               the transform is provided inline and must share the track's
               transition to remain upright while the hand sweeps. */
            transition: transform 500ms ${unsafeCSS(Easing.ExpressiveFastSpatial.ToCSSValue())};
            width: var(--_dial-selector-handle-size);
        }

        .dial.dragging .dial-handle {
            transition-duration: 150ms;
        }

        .dial-center {
            background: var(--_enabled-dial-selector-color);
            border-radius: 50%;
            height: var(--_dial-selector-center-size);
            left: 50%;
            position: absolute;
            top: 50%;
            transform: translate(-50%, -50%);
            width: var(--_dial-selector-center-size);
            z-index: 2;
        }

        .inputs {
            align-items: flex-start;
            display: flex;
            gap: 8px;
        }

        :host([orientation='vertical']) .inputs {
            justify-content: space-between;
        }

        .input-field {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .input-cell {
            appearance: none;
            background: var(--_enabled-input-container-color);
            border: 2px solid transparent;
            border-radius: var(--_input-container-shape);
            box-sizing: border-box;
            color: var(--md-sys-color-on-surface);
            font-family: var(--_time-selector-label-font);
            font-size: var(--_time-selector-label-size);
            height: var(--_input-container-height);
            padding: 0;
            text-align: center;
            user-select: text;
            width: var(--_input-container-width);
        }

        :host([is-24-hour]) .input-cell {
            width: var(--_time-selector-wide-container-width);
        }

        .input-cell:focus {
            background: var(--_focused-input-container-color);
            border-color: var(--_focused-input-outline-color);
            outline: none;
        }

        .input-label {
            color: var(--_enabled-input-label-color);
            font-family: var(--_dial-label-font);
            font-size: var(--_dial-label-size);
        }

        .inputs .separator {
            align-self: flex-start;
            display: inline-flex;
            height: var(--_input-container-height);
            align-items: center;
        }

        .actions {
            align-items: center;
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }

        .actions-spacer {
            flex: 1;
        }

        .entry-toggle {
            --mdc-icon-button-container-color: var(--md-sys-color-on-surface-variant);
            --mdc-icon-button-icon-color: var(--md-sys-color-surface-container-highest);
        }
    }

    @layer mdc.time-picker.motion {
        @media (prefers-reduced-motion: reduce) {
            :host, :host * {
                animation: none;
                transition: none;
            }
        }
    }

    @layer mdc.time-picker.hcm {
        @media (forced-colors: active) {
            dialog {
                outline: 2px solid WindowText;
            }
            .dial-label.selected {
                outline: 2px solid WindowText;
            }
        }
    }

    @layer mdc.time-picker.contrast {
        @media (prefers-contrast: more) {
            dialog {
                outline: 1px solid CanvasText;
            }
        }
    }

    @layer mdc.time-picker.transparency {
        @media (prefers-reduced-transparency: reduce) {
            .scrim {
                opacity: 1;
            }
        }
    }
`

export const TimePickerStyles = [
    css`
        @layer mdc.time-picker {
            @layer variable, component, motion, hcm, contrast, transparency;
        }
    `,
    css`@layer mdc.time-picker.variable {:host {${dialTokens};}}`,
    css`@layer mdc.time-picker.variable {:host([variant='input']) {${inputTokens};}}`,
    stylePart,
]

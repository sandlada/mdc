/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import {
    FilledFieldDefinition,
    OutlinedFieldDefinition,
} from './field.definition'
import { stringifyTokens } from '../../utils/style'

const FilledTokens = stringifyTokens('--mdc-field')(FilledFieldDefinition)
const OutlinedTokens = stringifyTokens('--mdc-field')(OutlinedFieldDefinition)

const StandardEasing = unsafeCSS(Easing.Standard.ToCSSValue())
const EmphasizedDecelerateEasing = unsafeCSS(Easing.EmphasizedDecelerate.ToCSSValue())

export const BaseFieldStyles = css`
    @layer mdc.field.base {
        :host {
            display: inline-flex;
            flex-direction: column;
            position: relative;
            box-sizing: border-box;
            color: var(--_enabled-content-color);
            min-width: 240px;
            vertical-align: top;
            -webkit-tap-highlight-color: transparent;
        }

        /* ---------- Container (the visible bounding box) ---------- */
        .container {
            position: relative;
            isolation: isolate;
            display: flex;
            align-items: center;
            box-sizing: border-box;
            height: var(--_container-height);
            padding-inline-start: var(--_container-padding-inline-start);
            padding-inline-end: var(--_container-padding-inline-end);
            padding-block-start: var(--_container-padding-block-start);
            padding-block-end: var(--_container-padding-block-end);
            border-start-start-radius: var(--_container-shape-start-start);
            border-start-end-radius: var(--_container-shape-start-end);
            border-end-start-radius: var(--_container-shape-end-start);
            border-end-end-radius: var(--_container-shape-end-end);
            cursor: text;
        }

        .container.has-leading-icon {
            padding-inline-start: var(--_container-icon-padding);
        }

        .container.has-trailing-icon {
            padding-inline-end: var(--_container-icon-padding);
        }

        :host([multiline]) .container {
            height: auto;
            min-height: var(--_container-height);
            align-items: flex-start;
            padding-block-start: var(--_container-padding-block-start);
            padding-block-end: var(--_container-padding-block-end);
        }

        /* ---------- Filled Variant: Background, State Layer & Active Indicator ---------- */
        .background,
        .state-layer {
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            z-index: 0;
        }

        .background {
            background-color: var(--_enabled-container-color);
            transition: background-color 150ms ${StandardEasing},
                        opacity 150ms ${StandardEasing};
        }

        :host([disabled]) .background {
            background-color: var(--_disabled-container-color);
            opacity: var(--_disabled-container-opacity);
        }

        .state-layer {
            background-color: var(--_hovered-state-layer-color);
            opacity: 0;
            transition: opacity 150ms ${StandardEasing};
        }

        :host([variant="filled"]:not([disabled]):hover) .state-layer {
            opacity: var(--_hovered-state-layer-opacity);
        }

        /* Filled active indicator (bottom underline) */
        .active-indicator {
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            z-index: 0;
        }

        .active-indicator::before,
        .active-indicator::after {
            content: '';
            position: absolute;
            inset-inline: 0;
            bottom: 0;
            pointer-events: none;
        }

        /* Resting / hover / invalid / disabled 1px indicator */
        .active-indicator::before {
            height: var(--_enabled-active-indicator-height);
            background-color: var(--_enabled-active-indicator-color);
            transition: background-color 150ms ${StandardEasing},
                        height 150ms ${StandardEasing};
        }

        :host([variant="filled"]:not([focused]):not(:focus-within):not([disabled]):hover) .active-indicator::before {
            height: var(--_hovered-active-indicator-height);
            background-color: var(--_hovered-active-indicator-color);
        }

        :host([variant="filled"][invalid]:not([disabled])) .active-indicator::before {
            height: var(--_invalid-active-indicator-height);
            background-color: var(--_invalid-active-indicator-color);
        }

        :host([variant="filled"][disabled]) .active-indicator::before {
            height: var(--_disabled-active-indicator-height);
            background-color: var(--_disabled-active-indicator-color);
            opacity: var(--_disabled-active-indicator-opacity);
        }

        /* Focused 2px indicator with scaleX expansion from center */
        .active-indicator::after {
            height: var(--_focused-active-indicator-height);
            background-color: var(--_focused-active-indicator-color);
            transform: scaleX(0);
            opacity: 0;
            transform-origin: center bottom;
            transition: transform 200ms ${EmphasizedDecelerateEasing},
                        opacity 150ms ${StandardEasing},
                        background-color 150ms ${StandardEasing};
        }

        :host([variant="filled"][focused]:not([disabled])) .active-indicator::after,
        :host([variant="filled"]:not([disabled]):focus-within) .active-indicator::after {
            transform: scaleX(1);
            opacity: 1;
        }

        :host([variant="filled"][invalid]:not([disabled])) .active-indicator::after {
            height: var(--_invalid-focused-active-indicator-height);
            background-color: var(--_invalid-active-indicator-color);
        }

        :host([variant="filled"][disabled]) .active-indicator::after {
            display: none;
        }

        /* ---------- Outlined Variant: 3-Segment Transparent Notch Outline ---------- */
        .outline {
            position: absolute;
            inset: 0;
            display: flex;
            border-radius: inherit;
            pointer-events: none;
            z-index: 0;
        }

        .outline-start,
        .outline-end {
            position: relative;
            box-sizing: border-box;
        }

        .outline-start {
            flex: 0 0 auto;
            width: calc(var(--_container-padding-inline-start) - var(--_outline-label-padding));
            border-start-start-radius: inherit;
            border-end-start-radius: inherit;
        }

        .outline-end {
            flex: 1 1 auto;
            border-start-end-radius: inherit;
            border-end-end-radius: inherit;
        }

        .outline-notch {
            position: relative;
            display: flex;
            align-items: flex-start;
            flex: 0 0 auto;
            max-width: calc(100% - 2 * (var(--_container-padding-inline-start) - var(--_outline-label-padding)));
        }

        .outline-label-spacer {
            visibility: hidden;
            height: 0;
            overflow: hidden;
            white-space: nowrap;
            padding-inline: var(--_outline-label-padding);
            font-family: var(--_floating-label-font);
            font-size: var(--_floating-label-size);
            font-weight: var(--_floating-label-weight);
            letter-spacing: var(--_floating-label-tracking);
            line-height: var(--_floating-label-leading);
        }

        .container:not(.has-label) .outline-label-spacer {
            padding-inline: 0;
            width: 0;
        }

        .outline-start::before,
        .outline-start::after,
        .outline-end::before,
        .outline-end::after,
        .outline-panel-inactive,
        .outline-panel-active {
            content: '';
            position: absolute;
            inset: 0;
            box-sizing: border-box;
            pointer-events: none;
            border-radius: inherit;
            border-style: solid;
        }

        /* Inactive (resting / hover / invalid / disabled) 1px outline */
        .outline-start::before,
        .outline-end::before,
        .outline-panel-inactive {
            border-color: var(--_enabled-outline-color);
            border-width: var(--_enabled-outline-width);
            transition: border-color 150ms ${StandardEasing};
        }

        .outline-start::before {
            border-inline-end-width: 0;
        }

        .outline-end::before {
            border-inline-start-width: 0;
        }

        .outline-panel-inactive {
            border-inline-width: 0;
        }

        .container.floating-label .outline-panel-inactive {
            border-block-start-color: transparent;
        }

        :host([variant="outlined"]:not([focused]):not(:focus-within):not([disabled]):hover) .outline-start::before,
        :host([variant="outlined"]:not([focused]):not(:focus-within):not([disabled]):hover) .outline-end::before,
        :host([variant="outlined"]:not([focused]):not(:focus-within):not([disabled]):hover) .outline-panel-inactive {
            border-color: var(--_hovered-outline-color);
        }

        :host([variant="outlined"]:not([focused]):not(:focus-within):not([disabled]):hover) .container.floating-label .outline-panel-inactive {
            border-block-start-color: transparent;
        }

        :host([variant="outlined"][invalid]:not([disabled])) .outline-start::before,
        :host([variant="outlined"][invalid]:not([disabled])) .outline-end::before,
        :host([variant="outlined"][invalid]:not([disabled])) .outline-panel-inactive {
            border-color: var(--_invalid-outline-color);
        }

        :host([variant="outlined"][invalid]:not([disabled])) .container.floating-label .outline-panel-inactive {
            border-block-start-color: transparent;
        }

        :host([variant="outlined"][disabled]) .outline-start::before,
        :host([variant="outlined"][disabled]) .outline-end::before,
        :host([variant="outlined"][disabled]) .outline-panel-inactive {
            border-color: var(--_disabled-outline-color);
            opacity: var(--_disabled-outline-opacity);
        }

        :host([variant="outlined"][disabled]) .container.floating-label .outline-panel-inactive {
            border-block-start-color: transparent;
        }

        /* Active (focused) 2px outline */
        .outline-start::after,
        .outline-end::after,
        .outline-panel-active {
            border-color: var(--_focused-outline-color);
            border-width: var(--_focused-outline-width);
            opacity: 0;
            transition: opacity 150ms ${StandardEasing},
                        border-color 150ms ${StandardEasing};
        }

        .outline-start::after {
            border-inline-end-width: 0;
        }

        .outline-end::after {
            border-inline-start-width: 0;
        }

        .outline-panel-active {
            border-inline-width: 0;
        }

        .container.floating-label .outline-panel-active {
            border-block-start-color: transparent;
        }

        :host([variant="outlined"][focused]:not([disabled])) .outline-start::after,
        :host([variant="outlined"][focused]:not([disabled])) .outline-end::after,
        :host([variant="outlined"][focused]:not([disabled])) .outline-panel-active,
        :host([variant="outlined"]:not([disabled]):focus-within) .outline-start::after,
        :host([variant="outlined"]:not([disabled]):focus-within) .outline-end::after,
        :host([variant="outlined"]:not([disabled]):focus-within) .outline-panel-active {
            opacity: 1;
        }

        :host([variant="outlined"][invalid]:not([disabled])) .outline-start::after,
        :host([variant="outlined"][invalid]:not([disabled])) .outline-end::after,
        :host([variant="outlined"][invalid]:not([disabled])) .outline-panel-active {
            border-width: var(--_invalid-focused-outline-width);
            border-color: var(--_invalid-outline-color);
        }

        :host([variant="outlined"][invalid]:not([disabled])) .container.floating-label .outline-panel-active {
            border-block-start-color: transparent;
        }

        :host([variant="outlined"][disabled]) .outline-start::after,
        :host([variant="outlined"][disabled]) .outline-end::after,
        :host([variant="outlined"][disabled]) .outline-panel-active {
            display: none;
        }

        /* ---------- Disabled Host State ---------- */
        :host([disabled]) {
            pointer-events: none;
        }
        :host([disabled]) .container {
            cursor: default;
        }
        :host([disabled]) .supporting-wrapper {
            opacity: var(--_disabled-supporting-text-opacity);
        }

        /* ---------- Content area (prefix, input, suffix) ---------- */
        .content {
            flex: 1;
            min-width: 0;
            display: flex;
            align-items: center;
            height: 100%;
            box-sizing: border-box;
            z-index: 1;
        }

        /* Filled with label: 8px top + 16px floating label + 24px input + 8px bottom = 56px */
        :host([variant="filled"]) .container.has-label .content {
            padding-block-start: 16px;
            padding-block-end: 0;
        }

        :host([variant="filled"]) .container:not(.has-label) .content,
        :host([variant="outlined"]) .content {
            padding-block-start: 0;
            padding-block-end: 0;
        }

        /* Multiline textarea content padding */
        :host([multiline][variant="filled"]) .container.has-label .content {
            padding-block-start: 16px;
            padding-block-end: 0;
        }

        :host([multiline][variant="outlined"]) .content,
        :host([multiline][variant="filled"]) .container:not(.has-label) .content {
            padding-block-start: 8px;
            padding-block-end: 8px;
        }

        /* ---------- Slotted input / textarea / select reset ---------- */
        .input {
            flex: 1;
            min-width: 0;
            display: flex;
            align-items: center;
            height: 100%;
            position: relative;
        }

        .input ::slotted(input),
        .input ::slotted(select) {
            background: transparent;
            border: none;
            outline: none;
            padding: 0;
            margin: 0;
            box-shadow: none;
            box-sizing: border-box;
            appearance: none;
            width: 100%;
            min-width: 0;
            height: var(--_content-leading);
            line-height: var(--_content-leading);
            font-family: var(--_content-font);
            font-size: var(--_content-size);
            font-weight: var(--_content-weight);
            letter-spacing: var(--_content-tracking);
            color: var(--_enabled-content-color);
            vertical-align: middle;
        }

        .input ::slotted(textarea) {
            background: transparent;
            border: none;
            outline: none;
            padding: 0;
            margin: 0;
            box-shadow: none;
            box-sizing: border-box;
            appearance: none;
            width: 100%;
            min-width: 0;
            height: 100%;
            min-height: var(--_content-leading);
            line-height: var(--_content-leading);
            font-family: var(--_content-font);
            font-size: var(--_content-size);
            font-weight: var(--_content-weight);
            letter-spacing: var(--_content-tracking);
            color: var(--_enabled-content-color);
            resize: none;
        }

        :host([resizable]) .input ::slotted(textarea) {
            resize: vertical;
        }

        .input ::slotted(input:disabled),
        .input ::slotted(textarea:disabled),
        .input ::slotted(select:disabled) {
            cursor: default;
            pointer-events: none;
            color: var(--_disabled-content-color);
            opacity: var(--_disabled-content-opacity);
        }

        /* Slotted Placeholder */
        .input ::slotted(input)::placeholder,
        .input ::slotted(textarea)::placeholder {
            color: var(--_enabled-label-color);
            opacity: 1;
            transition: opacity 150ms ${StandardEasing};
        }

        /* Hide placeholder when label is resting in an empty field */
        .container.has-label.resting-label .input ::slotted(input)::placeholder,
        .container.has-label.resting-label .input ::slotted(textarea)::placeholder {
            opacity: 0;
        }

        /* Hide native spinner buttons on number inputs */
        .input ::slotted(input[type="number"]) {
            appearance: textfield;
        }

        /* ---------- Leading / Trailing icons ---------- */
        .leading,
        .trailing {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            z-index: 1;
            transition: color 150ms ${StandardEasing};
        }

        .leading {
            min-width: var(--_leading-icon-size);
            height: var(--_leading-icon-size);
            margin-inline-end: var(--_icon-content-gap);
            color: var(--_enabled-leading-icon-color);
        }

        .trailing {
            min-width: var(--_trailing-icon-size);
            height: var(--_trailing-icon-size);
            margin-inline-start: var(--_icon-content-gap);
            gap: 4px;
            color: var(--_enabled-trailing-icon-color);
        }

        .container:not(.has-leading-icon) .leading { display: none; }
        .container:not(.has-trailing-icon) .trailing { display: none; }

        :host(:hover:not([disabled])) .leading {
            color: var(--_hovered-leading-icon-color);
        }
        :host(:hover:not([disabled])) .trailing {
            color: var(--_hovered-trailing-icon-color);
        }

        :host([focused]:not([disabled])) .leading,
        :host(:not([disabled]):focus-within) .leading {
            color: var(--_focused-leading-icon-color);
        }

        :host([focused]:not([disabled])) .trailing,
        :host(:not([disabled]):focus-within) .trailing {
            color: var(--_focused-trailing-icon-color);
        }

        :host([invalid]:not([disabled])) .leading {
            color: var(--_invalid-leading-icon-color);
        }

        :host([invalid]:not([disabled])) .trailing {
            color: var(--_invalid-trailing-icon-color);
        }

        :host([disabled]) .leading {
            color: var(--_disabled-leading-icon-color);
            opacity: var(--_disabled-leading-icon-opacity);
        }

        :host([disabled]) .trailing {
            color: var(--_disabled-trailing-icon-color);
            opacity: var(--_disabled-trailing-icon-opacity);
        }

        /* ---------- Prefix / Suffix (text + slot) ---------- */
        .prefix,
        .suffix {
            display: inline-flex;
            align-items: center;
            flex-shrink: 0;
            font-family: var(--_content-font);
            font-size: var(--_content-size);
            font-weight: var(--_content-weight);
            letter-spacing: var(--_content-tracking);
            line-height: var(--_content-leading);
            height: var(--_content-leading);
            white-space: nowrap;
            opacity: 1;
            transition: opacity 150ms ${StandardEasing};
        }
        .prefix {
            color: var(--_enabled-prefix-color);
            padding-inline-start: var(--_prefix-padding-inline-start);
            padding-inline-end: var(--_prefix-padding-inline-end);
            padding-block-start: var(--_prefix-padding-block-start);
            padding-block-end: var(--_prefix-padding-block-end);
        }
        .suffix {
            color: var(--_enabled-suffix-color);
            padding-inline-start: var(--_suffix-padding-inline-start);
            padding-inline-end: var(--_suffix-padding-inline-end);
            padding-block-start: var(--_suffix-padding-block-start);
            padding-block-end: var(--_suffix-padding-block-end);
        }
        :host([disabled]) .prefix {
            color: var(--_disabled-prefix-color);
            opacity: var(--_disabled-content-opacity);
        }
        :host([disabled]) .suffix {
            color: var(--_disabled-suffix-color);
            opacity: var(--_disabled-content-opacity);
        }
        .container:not(.has-prefix) .prefix { display: none; }
        .container:not(.has-suffix) .suffix { display: none; }

        /* Hide prefix/suffix when label is resting in an empty field */
        .container.has-label.resting-label .prefix,
        .container.has-label.resting-label .suffix {
            opacity: 0;
            pointer-events: none;
        }

        /* ---------- Floating label & Smooth Transition ---------- */
        .label {
            position: absolute;
            inset-inline-start: var(--_container-padding-inline-start);
            top: 50%;
            transform: translateY(-50%);
            transform-origin: top start;
            pointer-events: auto;
            cursor: text;
            color: var(--_enabled-label-color);
            font-family: var(--_enabled-label-font);
            font-size: var(--_enabled-label-size);
            font-weight: var(--_enabled-label-weight);
            letter-spacing: var(--_enabled-label-tracking);
            line-height: var(--_enabled-label-leading);
            max-width: calc(100% - 2 * var(--_container-padding-inline-start));
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            box-sizing: border-box;
            z-index: 1;
            transition: transform 150ms ${EmphasizedDecelerateEasing},
                        top 150ms ${EmphasizedDecelerateEasing},
                        font-size 150ms ${EmphasizedDecelerateEasing},
                        line-height 150ms ${EmphasizedDecelerateEasing},
                        color 150ms ${StandardEasing},
                        inset-inline-start 150ms ${EmphasizedDecelerateEasing};
        }

        /* Offset label start to align with input column when leading icon is present */
        .container.has-leading-icon .label {
            inset-inline-start: calc(var(--_container-icon-padding) + var(--_leading-icon-size) + var(--_icon-content-gap));
            max-width: calc(100% - var(--_container-icon-padding) - var(--_leading-icon-size) - var(--_icon-content-gap) - var(--_container-padding-inline-end));
        }

        /* Filled variant floating label (stays aligned with text column even with leading icon) */
        :host([variant="filled"]) .container.floating-label .label,
        :host([variant="filled"]) .label.floating,
        :host([variant="filled"][floating-label-behavior="always"]) .label {
            top: var(--_container-padding-block-start);
            transform: translateY(0);
            font-family: var(--_floating-label-font);
            font-size: var(--_floating-label-size);
            font-weight: var(--_floating-label-weight);
            letter-spacing: var(--_floating-label-tracking);
            line-height: var(--_floating-label-leading);
        }

        /* Outlined variant floating label (animates into the transparent outline notch) */
        :host([variant="outlined"]) .container.floating-label .label,
        :host([variant="outlined"]) .label.floating,
        :host([variant="outlined"][floating-label-behavior="always"]) .label {
            top: 0;
            transform: translateY(-50%);
            inset-inline-start: var(--_container-padding-inline-start);
            max-width: calc(100% - 2 * var(--_container-padding-inline-start));
            font-family: var(--_floating-label-font);
            font-size: var(--_floating-label-size);
            font-weight: var(--_floating-label-weight);
            letter-spacing: var(--_floating-label-tracking);
            line-height: var(--_floating-label-leading);
        }

        /* Multiline textarea resting label alignment */
        :host([multiline]) .container.has-label:not(.floating-label) .label {
            top: 16px;
            transform: translateY(0);
        }

        /* Label hidden when behavior==='never' and not populated */
        :host([floating-label-behavior="never"]:not([populated])) .label {
            display: none;
        }

        /* Label colors across interaction states */
        :host(:hover:not([disabled])) .label {
            color: var(--_hovered-label-color);
        }

        :host([focused]:not([disabled])) .label,
        :host(:not([disabled]):focus-within) .label {
            color: var(--_focused-label-color);
        }

        :host([invalid]:not([disabled])) .label {
            color: var(--_invalid-label-color);
        }

        :host([disabled]) .label {
            color: var(--_disabled-label-color);
            opacity: var(--_disabled-label-opacity);
        }

        /* Required asterisk */
        .required-asterisk {
            color: inherit;
        }

        /* ---------- Supporting text / error text / counter row ---------- */
        .supporting-wrapper {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
            box-sizing: border-box;
            padding-inline-start: var(--_supporting-text-padding-inline-start);
            padding-inline-end: var(--_supporting-text-padding-inline-end);
            padding-block-start: var(--_supporting-text-padding-block-start);
            padding-block-end: var(--_supporting-text-padding-block-end);
            min-height: 20px;
            font-family: var(--_supporting-text-font);
            font-size: var(--_supporting-text-size);
            font-weight: var(--_supporting-text-weight);
            letter-spacing: var(--_supporting-text-tracking);
            line-height: var(--_supporting-text-leading);
            color: var(--_enabled-supporting-text-color);
        }

        .supporting-text {
            flex: 1;
            min-width: 0;
        }

        .counter {
            flex-shrink: 0;
            margin-inline-start: auto;
            white-space: nowrap;
            font-family: var(--_counter-font);
            font-size: var(--_counter-size);
            font-weight: var(--_counter-weight);
            letter-spacing: var(--_counter-tracking);
            line-height: var(--_counter-leading);
            color: var(--_enabled-counter-color);
        }

        :host(:hover:not([disabled])) .supporting-wrapper {
            color: var(--_hovered-supporting-text-color);
        }
        :host([focused]:not([disabled])) .supporting-wrapper,
        :host(:not([disabled]):focus-within) .supporting-wrapper {
            color: var(--_focused-supporting-text-color);
        }
        :host([invalid]:not([disabled])) .supporting-text {
            color: var(--_invalid-supporting-text-color);
        }
        :host([invalid]:not([disabled])) .counter {
            color: var(--_invalid-counter-color);
        }

        /* ---------- Align-end (RTL-aware row reversal) ---------- */
        :host([align-end]) .container {
            flex-direction: row-reverse;
        }
        :host([align-end]) .content {
            flex-direction: row-reverse;
        }

        /* ---------- Reduced motion ---------- */
        @media (prefers-reduced-motion: reduce) {
            .background,
            .state-layer,
            .active-indicator::before,
            .active-indicator::after,
            .outline-start::before,
            .outline-start::after,
            .outline-end::before,
            .outline-end::after,
            .outline-panel-inactive,
            .outline-panel-active,
            .label,
            .leading,
            .trailing,
            .prefix,
            .suffix,
            .input ::slotted(input)::placeholder,
            .input ::slotted(textarea)::placeholder {
                transition: none;
            }
        }

        /* ---------- Reduced transparency ---------- */
        @media (prefers-reduced-transparency: reduce) {
            .state-layer {
                display: none;
            }
        }

        /* ---------- Contrast preferences ---------- */
        @media (prefers-contrast: more) {
            :host([variant="outlined"]) .outline-start::before,
            :host([variant="outlined"]) .outline-end::before,
            :host([variant="outlined"]) .outline-panel-inactive {
                border-width: 2px;
            }
            :host([variant="filled"]) .active-indicator::before {
                height: 2px;
            }
        }

        @media (prefers-contrast: less) {
            .state-layer {
                opacity: 0.04;
            }
        }

        /* ---------- Forced colors (Windows High Contrast) ---------- */
        @media (forced-colors: active) {
            .active-indicator::before,
            .active-indicator::after {
                background-color: CanvasText;
            }
            .outline-start::before,
            .outline-start::after,
            .outline-end::before,
            .outline-end::after,
            .outline-panel-inactive,
            .outline-panel-active {
                border-color: CanvasText;
            }
            :host([disabled]) .active-indicator::before {
                background-color: GrayText;
                opacity: 1;
            }
            :host([disabled]) .outline-start::before,
            :host([disabled]) .outline-end::before,
            :host([disabled]) .outline-panel-inactive {
                border-color: GrayText;
                opacity: 1;
            }
            :host([disabled]) .label,
            :host([disabled]) .leading,
            :host([disabled]) .trailing,
            :host([disabled]) .supporting-wrapper {
                color: GrayText;
                opacity: 1;
            }
            :host([invalid]:not([disabled])) .label,
            :host([invalid]:not([disabled])) .supporting-text,
            :host([invalid]:not([disabled])) .trailing {
                color: Highlight;
            }
        }
    }
`

export const FieldVariantStyles = css`
    @layer mdc.field.variant {
        :host([variant="filled"])   { ${FilledTokens}; }
        :host([variant="outlined"]) { ${OutlinedTokens}; }
    }
`

export const FieldStyles = [
    BaseFieldStyles,
    FieldVariantStyles,
]

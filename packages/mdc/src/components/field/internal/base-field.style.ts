/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'

/**
 * Base styles for `mdc-field`. Shared by both `filled` and `outlined` variants.
 * The variant-specific tokens (shapes, indicator, outline) are injected in
 * `field.style.ts` via `:host([variant="..."])` selectors.
 */
export const baseFieldStyles = css`
    @layer mdc.field.base {
        :host {
            display: inline-flex;
            flex-direction: column;
            position: relative;
            box-sizing: border-box;
            color: var(--_enabled-label-color);
            min-width: 240px;
            -webkit-tap-highlight-color: transparent;
            vertical-align: top;
        }

        /* ---------- Container (the visible bounding box) ---------- */
        .container {
            position: relative;
            display: flex;
            align-items: center;
            box-sizing: border-box;
            height: var(--_container-height, 56px);
            padding-inline-start: var(--_container-inline-leading-padding-space, 16px);
            padding-inline-end: var(--_container-inline-trailing-padding-space, 16px);
            border-start-start-radius: var(--_container-shape-start-start, 4px);
            border-start-end-radius: var(--_container-shape-start-end, 4px);
            border-end-start-radius: var(--_container-shape-end-start, 0px);
            border-end-end-radius: var(--_container-shape-end-end, 0px);
            cursor: text;
        }

        :host([multiline]) .container {
            height: auto;
            min-height: var(--_container-height, 56px);
            align-items: flex-start;
            padding-block-start: 8px;
            padding-block-end: 8px;
        }

        /* ---------- Filled Variant: Background & Animated Active Indicator (Underline) ---------- */
        :host([variant="filled"]) .container {
            background-color: var(--_enabled-container-color);
            transition: background-color 200ms cubic-bezier(0.2, 0, 0, 1);
        }

        :host([variant="filled"]:not([disabled]):hover) .container {
            background-color: var(--_hovered-container-color, var(--_enabled-container-color));
        }

        :host([variant="filled"][disabled]) .container {
            background-color: var(--_disabled-container-color, var(--_enabled-container-color));
        }

        /* Filled resting 1px indicator */
        :host([variant="filled"]) .container::before {
            content: '';
            position: absolute;
            inset-inline: 0;
            bottom: 0;
            height: var(--_enabled-active-indicator-height, 1px);
            background-color: var(--_enabled-active-indicator-color);
            transition: background-color 150ms cubic-bezier(0.2, 0, 0, 1);
            pointer-events: none;
            z-index: 1;
        }

        :host([variant="filled"]:not([focused]):not(:focus-within):not([disabled]):hover) .container::before {
            background-color: var(--_hovered-active-indicator-color);
        }

        :host([variant="filled"][invalid]:not([disabled])) .container::before {
            background-color: var(--_invalid-active-indicator-color);
        }

        :host([variant="filled"][disabled]) .container::before {
            background-color: var(--_disabled-active-indicator-color);
            opacity: var(--_disabled-label-opacity, 0.38);
        }

        /* Filled focus 2px active indicator with smooth scaleX & opacity transition */
        :host([variant="filled"]) .container::after {
            content: '';
            position: absolute;
            inset-inline: 0;
            bottom: 0;
            height: var(--_focused-active-indicator-height, 2px);
            background-color: var(--_focused-active-indicator-color);
            pointer-events: none;
            z-index: 2;
            transform: scaleX(0);
            opacity: 0;
            transform-origin: center bottom;
            transition: transform 200ms cubic-bezier(0.2, 0, 0, 1),
                        opacity 150ms cubic-bezier(0.2, 0, 0, 1),
                        background-color 150ms cubic-bezier(0.2, 0, 0, 1);
        }

        :host([variant="filled"][focused]) .container::after,
        :host([variant="filled"]:not([disabled]):focus-within) .container::after {
            transform: scaleX(1);
            opacity: 1;
        }

        :host([variant="filled"][invalid]) .container::after {
            background-color: var(--_invalid-active-indicator-color);
        }

        :host([variant="filled"][disabled]) .container::after {
            display: none;
        }

        /* ---------- Outlined Variant: Dual-Layer Animated Outline (Zero Layout Shift) ---------- */
        :host([variant="outlined"]) .container {
            background-color: transparent;
        }

        /* Outlined resting 1px border */
        :host([variant="outlined"]) .container::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            box-sizing: border-box;
            border: var(--_outline-width, 1px) solid var(--_enabled-outline-color);
            transition: border-color 150ms cubic-bezier(0.2, 0, 0, 1);
            z-index: 0;
        }

        :host([variant="outlined"]:not([focused]):not(:focus-within):not([disabled]):hover) .container::before {
            border-color: var(--_hovered-outline-color);
        }

        :host([variant="outlined"][invalid]) .container::before {
            border-color: var(--_invalid-outline-color);
        }

        :host([variant="outlined"][disabled]) .container::before {
            border-color: var(--_disabled-outline-color);
            opacity: var(--_disabled-label-opacity, 0.38);
        }

        /* Outlined focus 2px active border with smooth opacity transition */
        :host([variant="outlined"]) .container::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            box-sizing: border-box;
            border: 2px solid var(--_focused-outline-color);
            opacity: 0;
            transition: opacity 150ms cubic-bezier(0.2, 0, 0, 1),
                        border-color 150ms cubic-bezier(0.2, 0, 0, 1);
            z-index: 1;
        }

        :host([variant="outlined"][focused]) .container::after,
        :host([variant="outlined"]:not([disabled]):focus-within) .container::after {
            opacity: 1;
        }

        :host([variant="outlined"][invalid]) .container::after {
            border-color: var(--_invalid-outline-color);
        }

        :host([variant="outlined"][invalid][focused]) .container::after,
        :host([variant="outlined"][invalid]:not([disabled]):focus-within) .container::after {
            opacity: 1;
            border-color: var(--_invalid-outline-color);
        }

        :host([variant="outlined"][disabled]) .container::after {
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
            opacity: var(--_disabled-supporting-text-opacity, 0.38);
        }

        /* ---------- Content area (prefix, input, suffix) ---------- */
        .content {
            flex: 1;
            min-width: 0;
            display: flex;
            align-items: center;
            height: 100%;
            box-sizing: border-box;
            z-index: 2;
        }

        /* In filled variant with label, align input text in the lower half of container (MD3 spec: y = 24px..48px) */
        :host([variant="filled"]) .container.has-label .content {
            padding-top: 24px;
            padding-bottom: 8px;
        }

        :host([variant="filled"]:not(.has-label)) .content,
        :host([variant="outlined"]) .content {
            padding-top: 0;
            padding-bottom: 0;
        }

        /* Multiline textarea content padding */
        :host([multiline][variant="filled"]) .container.has-label .content {
            padding-top: 16px;
            padding-bottom: 4px;
        }

        :host([multiline][variant="outlined"]) .content,
        :host([multiline][variant="filled"]:not(.has-label)) .content {
            padding-top: 4px;
            padding-bottom: 4px;
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
            -webkit-appearance: none;
            -moz-appearance: none;
            width: 100%;
            min-width: 0;
            height: 24px;
            line-height: 24px;
            font-family: var(--_enabled-label-font, inherit);
            font-size: var(--_enabled-label-size, 16px);
            font-weight: var(--_enabled-label-weight, 400);
            letter-spacing: var(--_enabled-label-tracking, 0.5px);
            color: inherit;
            vertical-align: middle;
            -webkit-tap-highlight-color: transparent;
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
            -webkit-appearance: none;
            -moz-appearance: none;
            width: 100%;
            min-width: 0;
            height: 100%;
            min-height: 24px;
            line-height: 24px;
            font-family: var(--_enabled-label-font, inherit);
            font-size: var(--_enabled-label-size, 16px);
            font-weight: var(--_enabled-label-weight, 400);
            letter-spacing: var(--_enabled-label-tracking, 0.5px);
            color: inherit;
            resize: none;
            -webkit-tap-highlight-color: transparent;
        }

        :host([resizable]) .input ::slotted(textarea) {
            resize: vertical;
        }

        .input ::slotted(input:disabled),
        .input ::slotted(textarea:disabled),
        .input ::slotted(select:disabled) {
            cursor: default;
            pointer-events: none;
            opacity: var(--_disabled-label-opacity, 0.38);
        }

        /* Slotted Placeholder */
        .input ::slotted(input::placeholder),
        .input ::slotted(textarea::placeholder) {
            color: var(--_enabled-label-color);
            opacity: 0.6;
            transition: opacity 150ms cubic-bezier(0.2, 0, 0, 1);
        }

        /* Hide placeholder when label is resting in an empty field */
        .container.has-label.resting-label .input ::slotted(input::placeholder),
        .container.has-label.resting-label .input ::slotted(textarea::placeholder) {
            opacity: 0;
        }

        /* Hide native spinner buttons on number inputs */
        .input ::slotted(input[type="number"])::-webkit-inner-spin-button,
        .input ::slotted(input[type="number"])::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        .input ::slotted(input[type="number"]) {
            -moz-appearance: textfield;
        }

        /* ---------- Leading / Trailing icons ---------- */
        .leading,
        .trailing {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: var(--_enabled-icon-color);
            z-index: 2;
        }
        .leading {
            width: var(--_leading-icon-size, 24px);
            height: var(--_leading-icon-size, 24px);
            margin-inline-end: 12px;
        }
        .trailing {
            width: var(--_trailing-icon-size, 24px);
            height: var(--_trailing-icon-size, 24px);
            margin-inline-start: 12px;
        }
        .container:not(.has-leading-icon) .leading { display: none; }
        .container:not(.has-trailing-icon) .trailing { display: none; }

        :host([focused]:not([disabled])) .leading,
        :host([focused]:not([disabled])) .trailing {
            color: var(--_focused-icon-color, var(--_enabled-icon-color));
        }

        :host([invalid]:not([disabled])) .trailing {
            color: var(--_invalid-icon-color, var(--_enabled-icon-color));
        }

        :host([disabled]) .leading,
        :host([disabled]) .trailing {
            color: var(--_disabled-icon-color, var(--_enabled-icon-color));
            opacity: var(--_disabled-icon-opacity, 0.38);
        }

        /* ---------- Prefix / Suffix (text + slot) ---------- */
        .prefix,
        .suffix {
            display: inline-flex;
            align-items: center;
            flex-shrink: 0;
            color: var(--_enabled-label-color);
            font-family: var(--_enabled-label-font, inherit);
            font-size: var(--_enabled-label-size, 16px);
            font-weight: var(--_enabled-label-weight, 400);
            letter-spacing: var(--_enabled-label-tracking, 0.5px);
            line-height: 24px;
            height: 24px;
            white-space: nowrap;
            opacity: 1;
            transition: opacity 150ms cubic-bezier(0.2, 0, 0, 1);
        }
        .prefix {
            padding-inline-start: var(--_prefix-inline-leading-padding-space, 2px);
            padding-inline-end: var(--_prefix-inline-trailing-padding-space, 2px);
        }
        .suffix {
            padding-inline-start: var(--_suffix-inline-leading-padding-space, 2px);
            padding-inline-end: var(--_suffix-inline-trailing-padding-space, 2px);
        }
        .container:not(.has-prefix) .prefix { display: none; }
        .container:not(.has-suffix) .suffix { display: none; }

        /* Hide prefix/suffix when label is resting in an empty field */
        .container.has-label.resting-label .prefix,
        .container.has-label.resting-label .suffix {
            opacity: 0;
            pointer-events: none;
        }

        /* ---------- Floating label & Smooth Expanding Animation ---------- */
        .label {
            position: absolute;
            inset-inline-start: var(--_container-inline-leading-padding-space, 16px);
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
            line-height: var(--_enabled-label-line-height);
            max-width: calc(100% - 32px);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            box-sizing: border-box;
            z-index: 3;
            transition: transform 150ms cubic-bezier(0.2, 0, 0, 1),
                        top 150ms cubic-bezier(0.2, 0, 0, 1),
                        font-size 150ms cubic-bezier(0.2, 0, 0, 1),
                        line-height 150ms cubic-bezier(0.2, 0, 0, 1),
                        color 150ms cubic-bezier(0.2, 0, 0, 1),
                        inset-inline-start 150ms cubic-bezier(0.2, 0, 0, 1),
                        background-color 150ms cubic-bezier(0.2, 0, 0, 1);
        }

        /* When there is a leading icon and label is resting, offset label start to match input column */
        .container.has-leading-icon.resting-label .label,
        .container.has-leading-icon:not(.floating-label) .label {
            inset-inline-start: calc(var(--_container-inline-leading-padding-space, 16px) + var(--_leading-icon-size, 24px) + 12px);
        }

        /* Filled variant floating label */
        :host([variant="filled"]) .container.floating-label .label,
        :host([variant="filled"]) .label.floating,
        :host([variant="filled"][floating-label-behavior="always"]) .label {
            top: 8px;
            transform: translateY(0);
            inset-inline-start: var(--_container-inline-leading-padding-space, 16px);
            font-family: var(--_floating-label-font);
            font-size: var(--_floating-label-size);
            font-weight: var(--_floating-label-weight);
            letter-spacing: var(--_floating-label-tracking);
            line-height: var(--_floating-label-line-height);
        }

        /* Outlined variant floating label with notch mask */
        :host([variant="outlined"]) .container.floating-label .label,
        :host([variant="outlined"]) .label.floating,
        :host([variant="outlined"][floating-label-behavior="always"]) .label {
            top: 0;
            transform: translateY(-50%);
            inset-inline-start: 12px;
            padding-inline: 4px;
            background-color: var(--mdc-field-label-background, var(--mdc-theme-surface, #ffffff));
            font-family: var(--_floating-label-font);
            font-size: var(--_floating-label-size);
            font-weight: var(--_floating-label-weight);
            letter-spacing: var(--_floating-label-tracking);
            line-height: var(--_floating-label-line-height);
            border-radius: 2px;
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
            color: var(--_hovered-label-color, var(--_enabled-label-color));
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
            opacity: var(--_disabled-label-opacity, 0.38);
        }

        /* Required asterisk */
        .required-asterisk {
            color: var(--_invalid-label-color);
        }

        /* ---------- Supporting text / error text / counter row ---------- */
        .supporting-wrapper {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
            box-sizing: border-box;
            padding-inline-start: var(--_container-inline-leading-padding-space, 16px);
            padding-inline-end: var(--_container-inline-trailing-padding-space, 16px);
            padding-block-start: 4px;
            min-height: 16px;
            font-family: var(--_supporting-text-font);
            font-size: var(--_supporting-text-size);
            font-weight: var(--_supporting-text-weight);
            letter-spacing: var(--_supporting-text-tracking);
            line-height: var(--_supporting-text-line-height);
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
            color: var(--_enabled-counter-color, var(--_enabled-supporting-text-color));
        }

        :host([invalid]:not([disabled])) .supporting-text {
            color: var(--_invalid-supporting-text-color);
        }
        :host([invalid]:not([disabled])) .counter {
            color: var(--_invalid-counter-color, var(--_invalid-supporting-text-color));
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
            .container,
            .container::after,
            .container::before,
            .label,
            .prefix,
            .suffix {
                transition: none;
            }
        }

        /* ---------- Forced colors (Windows High Contrast) ---------- */
        @media (forced-colors: active) {
            .container::before {
                border-color: CanvasText;
            }
            :host([disabled]) {
                opacity: 1;
                border-color: GrayText;
            }
            :host([variant="outlined"]) .label {
                background-color: Canvas;
            }
        }
    }
`


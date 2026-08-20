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
            background-color: var(--_enabled-container-color);
            border-start-start-radius: var(--_container-shape-start-start, 4px);
            border-start-end-radius: var(--_container-shape-start-end, 4px);
            border-end-start-radius: var(--_container-shape-end-start, 0px);
            border-end-end-radius: var(--_container-shape-end-end, 0px);
            transition: background-color 200ms cubic-bezier(0.2, 0, 0, 1),
                        border-color 200ms cubic-bezier(0.2, 0, 0, 1);
            cursor: text;
        }

        :host([multiline]) .container {
            height: auto;
            min-height: var(--_container-height, 56px);
            align-items: flex-start;
            padding-block-start: 12px;
            padding-block-end: 12px;
        }

        /* ---------- Content area (prefix, input, suffix) ---------- */
        .content {
            flex: 1;
            min-width: 0;
            display: flex;
            align-items: center;
            position: relative;
            height: 100%;
            box-sizing: border-box;
        }

        /* In filled variant with label, push input down so it sits below floating label */
        :host([variant="filled"]) .container.has-label .content {
            padding-block-start: 16px;
            padding-block-end: 2px;
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
        .input ::slotted(textarea),
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
            height: 100%;
            font-family: inherit;
            font-size: inherit;
            font-weight: inherit;
            letter-spacing: inherit;
            line-height: inherit;
            color: inherit;
            -webkit-tap-highlight-color: transparent;
        }

        .input ::slotted(textarea) {
            resize: none;
            min-height: 1.5em;
            padding-block-start: 0;
        }

        :host([resizable]) .input ::slotted(textarea) {
            resize: vertical;
        }

        .input ::slotted(input:disabled),
        .input ::slotted(textarea:disabled),
        .input ::slotted(select:disabled) {
            cursor: default;
            pointer-events: none;
            opacity: 1;
        }

        /* Placeholder */
        .input ::slotted(input::placeholder),
        .input ::slotted(textarea::placeholder) {
            color: var(--_enabled-label-color);
            opacity: 0.6;
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

        /* ---------- Filled variant: bottom indicator (underline) ---------- */
        :host([variant="filled"]) .container::after {
            content: '';
            position: absolute;
            inset-inline: 0;
            bottom: 0;
            height: var(--_enabled-active-indicator-height, 1px);
            background-color: var(--_enabled-active-indicator-color);
            transition: height 100ms cubic-bezier(0.2, 0, 0, 1),
                        background-color 200ms cubic-bezier(0.2, 0, 0, 1);
            pointer-events: none;
        }

        :host([variant="filled"][focused]) .container::after,
        :host([variant="filled"]:focus-within) .container::after {
            height: var(--_focused-active-indicator-height, 2px);
            background-color: var(--_focused-active-indicator-color);
        }

        :host([variant="filled"]:not([focused]):not(:focus-within):hover) .container::after {
            background-color: var(--_hovered-active-indicator-color);
        }

        :host([variant="filled"][invalid]) .container::after {
            height: var(--_invalid-active-indicator-height, 2px);
            background-color: var(--_invalid-active-indicator-color);
        }

        /* ---------- Outlined variant: 4-sided outline ---------- */
        :host([variant="outlined"]) .container {
            border: var(--_outline-width, 1px) solid var(--_enabled-outline-color);
            background-color: transparent;
        }

        :host([variant="outlined"]:not([focused]):not(:focus-within):hover) .container {
            border-color: var(--_hovered-outline-color);
        }

        :host([variant="outlined"][focused]) .container,
        :host([variant="outlined"]:focus-within) .container {
            border-width: 2px;
            border-color: var(--_focused-outline-color);
        }

        :host([variant="outlined"][invalid]) .container {
            border-color: var(--_invalid-outline-color);
        }

        /* ---------- Disabled state ---------- */
        :host([disabled]) {
            opacity: var(--_disabled-label-opacity, 0.38);
            pointer-events: none;
        }
        :host([disabled]) .container {
            background-color: var(--_disabled-container-color);
            border-color: var(--_disabled-outline-color);
            cursor: default;
        }
        :host([disabled]) .supporting-wrapper {
            opacity: var(--_disabled-supporting-text-opacity, 0.38);
        }

        /* ---------- Leading / Trailing icons ---------- */
        .leading,
        .trailing {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: var(--_enabled-icon-color);
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

        /* ---------- Prefix / Suffix (text + slot) ---------- */
        .prefix,
        .suffix {
            display: inline-flex;
            align-items: center;
            flex-shrink: 0;
            color: var(--_enabled-label-color);
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
        .container.has-label.resting-label:not(.has-leading-icon) .prefix,
        .container.has-label.resting-label:not(.has-leading-icon) .suffix {
            opacity: 0;
        }

        /* ---------- Floating label ---------- */
        .label {
            position: absolute;
            inset-inline-start: var(--_container-inline-leading-padding-space, 16px);
            top: 50%;
            transform: translateY(-50%);
            transform-origin: start center;
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
            transition: transform 150ms cubic-bezier(0.2, 0, 0, 1),
                        top 150ms cubic-bezier(0.2, 0, 0, 1),
                        font-size 150ms cubic-bezier(0.2, 0, 0, 1),
                        color 150ms cubic-bezier(0.2, 0, 0, 1),
                        inset-inline-start 150ms cubic-bezier(0.2, 0, 0, 1);
        }

        /* When there is a leading icon and label is resting, offset label start */
        .container.has-leading-icon .label.resting,
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
            z-index: 1;
        }

        /* Label hidden when behavior==='never' and not populated */
        :host([floating-label-behavior="never"]:not([populated])) .label {
            display: none;
        }

        :host([focused]) .label,
        :host(:focus-within) .label {
            color: var(--_focused-label-color);
        }
        :host([invalid]) .label {
            color: var(--_invalid-label-color);
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

        :host([invalid]) .supporting-text {
            color: var(--_invalid-supporting-text-color);
        }
        :host([invalid]) .counter {
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
            .label,
            .prefix,
            .suffix {
                transition: none;
            }
        }

        /* ---------- Forced colors (Windows High Contrast) ---------- */
        @media (forced-colors: active) {
            .container {
                border: 1px solid CanvasText;
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


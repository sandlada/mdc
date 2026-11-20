/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import { stringifyTokens } from '../../utils/style'
import {
    FilledTextFieldDefinition,
    OutlinedTextFieldDefinition,
} from './text-field.definition'

const Stringify = stringifyTokens('--mdc-text-field')
const FilledTokens = Stringify(FilledTextFieldDefinition)
const OutlinedTokens = Stringify(OutlinedTextFieldDefinition)

const StandardEasing = unsafeCSS(Easing.Standard.ToCSSValue())

export const TextFieldVariableStyles = css`
    @layer mdc.text-field.variable {
        :host(:not([variant])),
        :host([variant="filled"]) {
            ${FilledTokens};
        }
        :host([variant="outlined"]) {
            ${OutlinedTokens};
        }
    }
`

export const BaseTextFieldStyles = css`
    @layer mdc.text-field.base {
        :host {
            display: inline-flex;
            flex-direction: column;
            vertical-align: top;
            outline: none;
            box-sizing: border-box;
            min-width: 240px;
            -webkit-tap-highlight-color: transparent;
        }

        .field {
            width: 100%;
        }

        .input {
            font-family: var(--_input-text-font);
            font-size: var(--_input-text-size);
            font-weight: var(--_input-text-weight);
            letter-spacing: var(--_input-text-tracking);
            line-height: var(--_input-text-leading);
            color: var(--_enabled-input-text-color);
            caret-color: var(--_caret-color);
        }

        .input::placeholder {
            color: var(--_enabled-placeholder-color);
            opacity: 1;
            transition: opacity 150ms ${StandardEasing};
        }

        .input.hide-placeholder::placeholder {
            opacity: 0;
        }

        .input::selection {
            background-color: var(--_selection-background-color);
            color: var(--_selection-color);
        }

        :host([error]) .input,
        .field[invalid] .input {
            caret-color: var(--_invalid-caret-color);
        }

        :host([disabled]) .input {
            color: var(--_disabled-input-text-color);
            opacity: var(--_disabled-input-text-opacity);
        }

        :host([disabled]) .input::placeholder {
            color: var(--_disabled-placeholder-color);
            opacity: var(--_disabled-placeholder-opacity);
        }

        :host([align-end]) .input {
            text-align: end;
        }

        /* Clear button (40dp state-layer target with 24dp icon) */
        .clear-button-wrapper {
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .clear-button {
            position: relative;
            isolation: isolate;
            appearance: none;
            border: none;
            background: transparent;
            padding: 0;
            margin: 0;
            cursor: pointer;
            color: var(--_enabled-clear-button-color);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: var(--_clear-button-size);
            height: var(--_clear-button-size);
            border-radius: 50%;
            outline: none;
        }

        .clear-button::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background-color: var(--_hovered-clear-button-state-layer-color);
            opacity: 0;
            pointer-events: none;
            z-index: 0;
            transition: opacity 150ms ${StandardEasing};
        }

        .clear-button:hover::before {
            opacity: var(--_hovered-clear-button-state-layer-opacity);
        }

        .clear-button:active::before {
            background-color: var(--_pressed-clear-button-state-layer-color);
            opacity: var(--_pressed-clear-button-state-layer-opacity);
        }

        .clear-button:focus-visible {
            outline: 2px solid var(--_caret-color);
            outline-offset: -2px;
        }

        .clear-icon {
            position: relative;
            z-index: 1;
            width: var(--_clear-button-icon-size);
            height: var(--_clear-button-icon-size);
            fill: currentColor;
        }

        @media (prefers-reduced-motion: reduce) {
            .input::placeholder,
            .clear-button::before {
                transition: none;
            }
        }

        @media (prefers-reduced-transparency: reduce) {
            .clear-button::before {
                display: none;
            }
        }

        @media (forced-colors: active) {
            .clear-button {
                color: ButtonText;
            }
            .clear-button:focus-visible {
                outline-color: Highlight;
            }
        }
    }
`

export const TextFieldStyles = [
    TextFieldVariableStyles,
    BaseTextFieldStyles,
]

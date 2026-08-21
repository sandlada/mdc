/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'

export const baseTextFieldStyles = css`
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

        /* Clear button */
        .clear-button-wrapper {
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .clear-button {
            appearance: none;
            border: none;
            background: transparent;
            padding: 0;
            margin: 0;
            cursor: pointer;
            color: inherit;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            outline: none;
            opacity: 0.7;
            transition: opacity 150ms cubic-bezier(0.2, 0, 0, 1),
                        background-color 150ms cubic-bezier(0.2, 0, 0, 1);
        }

        .clear-button:hover {
            opacity: 1;
            background-color: rgba(128, 128, 128, 0.15);
        }

        .clear-button:active {
            opacity: 1;
            background-color: rgba(128, 128, 128, 0.25);
        }

        .clear-button:focus-visible {
            opacity: 1;
            outline: 2px solid currentColor;
        }

        .clear-icon {
            width: 18px;
            height: 18px;
            fill: currentColor;
        }
    }
`

export const textFieldStyles = [baseTextFieldStyles]


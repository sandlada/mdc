/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { RippleDefinition } from '../../component-definitions/ripple.definition'
import { createWrappedTokens, stringTokens } from '../../utils/tokens'

const tokens = createWrappedTokens('--mdc-ripple', RippleDefinition)
const tokenString = stringTokens(tokens)

export const styles = css`

    @layer mdc.ripple.variable {
        :host {
            ${tokenString}
        }
    }

    @layer mdc.ripple.base {

        @media (forced-colors: active) {
            :host,
            .ripple {
                display: none;
            }
        }

        :host {
            display: flex;
            margin: auto;
            pointer-events: none;
            border-radius: inherit;
            position: absolute;
            inset: 0;
            overflow: hidden;
        }

        :host([disabled]) {
            display: none;
        }

        .ripple {
            border-radius: inherit;
            position: absolute;
            inset: 0;
            overflow: hidden;
            -webkit-tap-highlight-color: transparent;

            &::before,
            &::after {
                content: '';
                opacity: 0;
                position: absolute;
            }

            &::before {
                background-color: ${tokens['--_hovered-color']};
                inset: 0;
                transition: opacity 15ms linear, background-color 15ms linear;
            }

            &::after {
                background: radial-gradient(closest-side, ${tokens['--_pressed-color']} max(calc(100% - 70px), 65%), transparent 100%);
                transform-origin: center center;
                transition: opacity 375ms linear;
            }

        }

        :host([hovered]) .ripple::before {
            background-color: ${tokens['--_hovered-color']};
            opacity: ${tokens['--_hovered-opacity']};
        }

        :host([pressed]) .ripple::after {
            opacity: ${tokens['--_pressed-opacity']};
            transition-duration: 105ms;
        }
    }

`

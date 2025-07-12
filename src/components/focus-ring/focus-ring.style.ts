/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import { FocusRingDefinition } from '../../component-definitions/focus-ring.definition'
import { createWrappedTokens, stringTokens } from '../../utils/tokens'

const tokens = createWrappedTokens('--mdc-focus-ring', FocusRingDefinition)
const tokenString = stringTokens(tokens)

export const styles = css`

    @layer mdc.focus-ring.variable {
        :host {
            ${tokenString}
        }
    }

    @layer mdc.focus-ring.base {

        :host {
            animation-delay: 0s, calc(var(--_duration) * 0.25);
            animation-duration: calc(var(--_duration) * 0.25), calc(var(--_duration) * 0.75);
            animation-timing-function: ${unsafeCSS(Easing.Emphasized)};
            box-sizing: border-box;
            color: var(--_color);
            display: none;
            pointer-events: none;
            position: absolute;
        }

        :host([disabled]) {
            display: none;
        }

        :host([visible]) {
            display: flex;
        }

        :host(:not([inward])) {
            animation-name: outward-grow, outward-shrink;
            inset: calc(-1 * var(--_outward-offset));
            outline: var(--_width) solid currentColor;
        }

        :host([inward]) {
            animation-name: inward-grow, inward-shrink;
            border: var(--_width) solid currentColor;
            inset: var(--_inward-offset);
        }

        :host([shape-inherit]) {
            border-end-end-radius: inherit;
            border-end-start-radius: inherit;
            border-start-end-radius: inherit;
            border-start-start-radius: inherit;
        }

        :host(:not([shape-inherit])) {
            &:not([inward]) {
                border-end-end-radius: calc(var(--_shape-end-end) + var(--_outward-offset));
                border-end-start-radius: calc(var(--_shape-end-start) + var(--_outward-offset));
                border-start-end-radius: calc(var(--_shape-start-end) + var(--_outward-offset));
                border-start-start-radius: calc(var(--_shape-start-start) + var(--_outward-offset));
            }

            &[inward] {
                border-end-end-radius: calc(var(--_shape-end-end) - var(--_inward-offset));
                border-end-start-radius: calc(var(--_shape-end-start) - var(--_inward-offset));
                border-start-end-radius: calc(var(--_shape-start-end) - var(--_inward-offset));
                border-start-start-radius: calc(var(--_shape-start-start) - var(--_inward-offset));
            }
        }

        @keyframes outward-grow {
            from {
                outline-width: 0;
            }

            to {
                outline-width: var(--_active-width);
            }
        }

        @keyframes outward-shrink {
            from {
                outline-width: var(--_active-width);
            }
        }

        @keyframes inward-grow {
            from {
                border-width: 0;
            }

            to {
                border-width: var(--_active-width);
            }
        }

        @keyframes inward-shrink {
            from {
                border-width: var(--_active-width);
            }
        }

        @media (prefers-reduced-motion) {
            :host {
                animation: none;
            }
        }
    }
`

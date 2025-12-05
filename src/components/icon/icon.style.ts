/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { IconDefinition } from '../../component-definitions/icon.definition'
import { createWrappedTokens, stringTokens } from '../../utils/tokens'

const tokens = createWrappedTokens('--mdc-icon', IconDefinition)
const tokenString = stringTokens(tokens)

export const styles = css`
    @layer mdc.icon {

        @layer variable {
            :host {
                ${tokenString}
            }
        }

        @layer base {
            :host {
                font-size: var(--_size);
                width: var(--_size);
                height: var(--_size);
                color: inherit;
                font-variation-settings: inherit;
                font-weight: 400;
                font-family: var(--_font);
                display: inline-flex;
                font-style: normal;
                place-items: center;
                place-content: center;
                line-height: 1;
                overflow: hidden;
                letter-spacing: normal;
                text-transform: none;
                user-select: none;
                white-space: nowrap;
                word-wrap: normal;
                flex-shrink: 0;

                /* Support for all WebKit browsers. */
                -webkit-font-smoothing: antialiased;
                /* Support for Safari and Chrome. */
                text-rendering: optimizeLegibility;
                /* Support for Firefox. */
                -moz-osx-font-smoothing: grayscale;
            }

            .icon-container {
                font-family: var(--_font);
                font-weight: normal;
                font-style: normal;
                line-height: 1;
                letter-spacing: normal;
                text-transform: none;
                display: inline-block;
                white-space: nowrap;
                word-wrap: normal;
                direction: ltr;
                -webkit-font-feature-settings: 'liga';
                -webkit-font-smoothing: antialiased;

                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;

                font-variation-settings: inherit;
            }

            ::slotted(svg) {
                fill: currentColor;
            }

            ::slotted(*) {
                display: block;
                height: 100%;
                width: 100%;
            }

        }
    }
`

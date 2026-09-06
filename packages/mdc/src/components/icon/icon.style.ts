/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { IconDefinition } from '../../component-definitions/icon.definition'
import { pipe } from '../../utils/styles'
import { createStyleSheet, stringifyTokens } from '../../utils/styles/lit'

const tokens = stringifyTokens('--mdc-icon')(IconDefinition)

const stylePart = pipe(
    createStyleSheet
)(IconDefinition)(() => css`
:host {
    @layer mdc.icon.component {
        :host {
            font-size: var(--_size);
            width: var(--_size);
            height: var(--_size);
            font-family: var(--_font);
        }
    }
`)

export const styles = [
    css`
        @layer mdc.icon {
            @layer variable, component, motion, hcm, contrast, transparency;
        }
    `,
    css`@layer mdc.icon.variant {:host {${tokens};}}`,
    stylePart,
    css`
    @layer mdc.icon.component {
        :host {
            color: inherit;
            font-variation-settings: inherit;
            font-weight: 400;
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
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            direction: ltr;
            -webkit-font-feature-settings: 'liga';
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

    @layer mdc.icon.motion {
        @media (prefers-reduced-motion: reduce) {
            :host,
            :host * {
                animation: none;
                transition: none;
            }
        }
    }
    @layer mdc.icon.hcm {
        @media (forced-colors: active) {
            :host,
            ::slotted(*),
            ::slotted(svg) {
                color: currentColor;
            }
        }
    }
    @layer mdc.icon.contrast {
        @media (prefers-contrast: more) {
            :host {
                color: CanvasText;
            }
        }

        @media (prefers-contrast: less) {
            :host {
                color: GrayText;
            }
        }
    }
    @layer mdc.icon.transparncy {
        @media (prefers-reduced-transparency: reduce) {

        }
    }
`
]

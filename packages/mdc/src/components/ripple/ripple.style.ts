/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { RippleDefinition } from '../../component-definitions/ripple.definition'
import { pipe } from '../../utils/styles'
import { createStyleSheet, stringifyTokens } from '../../utils/styles/lit'

const tokens = stringifyTokens('--mdc-ripple')(RippleDefinition)

const stylePart = pipe(createStyleSheet)(RippleDefinition)(() => css`
    @layer mdc.ripple.component {
        :host {
            display: flex;
            margin: auto;
            pointer-events: none;
            border-radius: inherit;
            position: absolute;
            inset: 0;
            overflow: hidden;
            -webkit-tap-highlight-color: transparent;
        }

        .ripple {
            border-radius: inherit;
            position: absolute;
            inset: 0;
            overflow: hidden;
            -webkit-tap-highlight-color: transparent;
        }

        :host([disabled]),
        :host([disable-hover-state-layer]) .hover-state-layer,
        :host([disable-focus-state-layer]) .focus-state-layer,
        :host([disable-press-state-layer]) .press-state-layer {
            display: none;
        }

        :host,
        .hover-state-layer,
        .focus-state-layer,
        .press-state-layer {
            transition-behavior: allow-discrete;
            @starting-style {
                display: flex;
                opacity: 0;
            }
        }

        .hover-state-layer,
        .focus-state-layer,
        .press-state-layer {
            position: absolute;
            opacity: 0;
            border-radius: inherit;
            pointer-events: none;
            overflow: hidden;
            -webkit-tap-highlight-color: transparent;
            inset: 0;
        }

        .hover-state-layer {
            background-color: var(--_hovered-color);
            transition: opacity 200ms cubic-bezier(0.2, 0, 0, 1), background-color 200ms cubic-bezier(0.2, 0, 0, 1);
        }
        .focus-state-layer {
            background-color: var(--_focused-color);
            transition: opacity 150ms cubic-bezier(0.2, 0, 0, 1), background-color 150ms cubic-bezier(0.2, 0, 0, 1);
        }
        .press-state-layer {
            background: radial-gradient(closest-side, var(--_pressed-color) max(calc(100% - 70px), 65%), transparent 100%);
            transform-origin: center center;
            transition: opacity 375ms cubic-bezier(0.2, 0, 0, 1);
        }

        :host([hovered]:not([disable-hover-state-layer])) .hover-state-layer {
            opacity: var(--_hovered-opacity);
            transition-duration: 75ms;
        }
        :host([focused]:not([disable-focus-state-layer])) .focus-state-layer {
            opacity: var(--_focused-opacity);
            transition-duration: 75ms;
        }
        :host([pressed]:not([disable-press-state-layer])) .press-state-layer {
            opacity: var(--_pressed-opacity);
            transition-duration: 105ms;
        }
    }

    @layer mdc.ripple.motion {
        @media (prefers-reduced-motion: reduce) {
            :host,
            :host * {
                animation: none;
                transition: none;
            }
        }
    }

    @layer mdc.ripple.transparency {
        @media (prefers-reduced-transparency: reduce) {
            :host * {
            :host([hovered]:not([disable-hover-state-layer])) .hover-state-layer {
                opacity: 0.2;
            }
            :host([focused]:not([disable-focus-state-layer])) .focus-state-layer {
                opacity: 0.22;
            }
            :host([pressed]:not([disable-press-state-layer])) .press-state-layer {
                opacity: 0.22;
            }
            }
        }
    }

    @layer mdc.ripple.hcm {
        @media (forced-colors: active) {
            :host,
            .ripple {
                display: none;
            }
        }
    }

    @layer mdc.ripple.contrast {
        @media (prefers-contrast: more) {
            :host([hovered]:not([disable-hover-state-layer])) .hover-state-layer {
                opacity: 0.1;
            }
            :host([focused]:not([disable-focus-state-layer])) .focus-state-layer {
                opacity: 0.12;
            }
            :host([pressed]:not([disable-press-state-layer])) .press-state-layer {
                opacity: 0.12;
            }
        }

        @media (prefers-contrast: less) {
            :host([hovered]:not([disable-hover-state-layer])) .hover-state-layer {
                opacity: 0.05;
            }
            :host([focused]:not([disable-focus-state-layer])) .focus-state-layer {
                opacity: 0.08;
            }
            :host([pressed]:not([disable-press-state-layer])) .press-state-layer {
                opacity: 0.08;
            }
        }
    }
`)

export const styles = [
    css`
        @layer mdc.icon {
            @layer variable, component, motion, hcm, contrast, transparency;
        }
        @layer mdc.ripple.variable{:host{${tokens};}}
    `,
    stylePart,
]

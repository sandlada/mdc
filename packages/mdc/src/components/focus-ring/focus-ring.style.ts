/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import { FocusRingDefinition } from '../../component-definitions/focus-ring.definition'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'
import { createStyleSheet } from '../../utils'

const tokenRecord = defineTokenRefsRecord(FocusRingDefinition, {
    expandShapes: false,
    useBaseFallback: true,
    prefix: '--mdc-focus-ring',
})
const tokenString = unsafeCSS(defineVars(tokenRecord, true).join(''))

const stylePart = createStyleSheet([FocusRingDefinition], () => css`
    @layer mdc {

        :host {
            border-style: solid;
            border-width: 0px;
            border-color: currentColor;
            outline-style: solid;
            outline-width: 0px;
            outline-color: currentColor;
            animation-delay: 0s, calc(var(--_duration) * 0.25);
            animation-duration: calc(var(--_duration) * 0.25), calc(var(--_duration) * 0.75);
            animation-timing-function: ${unsafeCSS(Easing.Emphasized.ToCSSVariable())};
            transition-property: display, opacity, border-width, outline-width, border-color, outline-color, color;
            transition-duration: calc(var(--_duration) * 0.4);
            transition-behavior: allow-discrete;
            transition-timing-function: ${unsafeCSS(Easing.Emphasized.ToCSSVariable())};
            box-sizing: border-box;
            color: var(--_color);
            display: none;
            opacity: 0;
            pointer-events: none;
            position: absolute;
        }

        :host([focused]),
        :host([persistent]) {
            display: flex;
            opacity: 1;
            transition-duration: calc(var(--_duration) * 0.15);
        }

        @starting-style {
            :host([focused]),
            :host([persistent]) {
                opacity: 0;
            }
        }


        :host([disabled]) {
            display: none;
            opacity: 0;
        }

        :host([animation-disabled]) {
            animation: none;
            transition: none;
        }

        :host(:not([inward])) {
            inset: calc(-1 * var(--_outward-offset));
            outline-width: var(--_width);
        }
        :host([inward]) {
            border-width: var(--_width);
            inset: var(--_inward-offset);
        }

        :host([focused]:not([inward])) {
            animation-name: outward-grow, outward-shrink;
        }
        :host([focused][inward]) {
            animation-name: inward-grow, inward-shrink;
        }



        :host([shape-inherit]) {
            border-end-end-radius: inherit;
            border-end-start-radius: inherit;
            border-start-end-radius: inherit;
            border-start-start-radius: inherit;
        }

        /* NOTE: these two branches are written as flat selectors on purpose.
           Chrome does not resolve '&' nesting inside a ':host()' parent, so an
           '&:not([inward])' child rule never matches and the ring would end up
           with NO border-radius when 'shape-inherit' is off. */
        :host(:not([shape-inherit]):not([inward])) {
            border-end-end-radius: calc(var(--_shape-end-end) + var(--_outward-offset));
            border-end-start-radius: calc(var(--_shape-end-start) + var(--_outward-offset));
            border-start-end-radius: calc(var(--_shape-start-end) + var(--_outward-offset));
            border-start-start-radius: calc(var(--_shape-start-start) + var(--_outward-offset));
        }
        :host(:not([shape-inherit])[inward]) {
            border-end-end-radius: calc(var(--_shape-end-end) - var(--_inward-offset));
            border-end-start-radius: calc(var(--_shape-end-start) - var(--_inward-offset));
            border-start-end-radius: calc(var(--_shape-start-end) - var(--_inward-offset));
            border-start-start-radius: calc(var(--_shape-start-start) - var(--_inward-offset));
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

        @media (prefers-reduced-motion: reduce) {
            :host {
                animation: none;
                transition: none;
            }
        }

        @media (forced-colors: active) {
            :host {
                border-color: Highlight;
                outline-color: Highlight;
                color: Highlight;
            }
        }


        @media (prefers-contrast: more) {
            :host {
                color: CanvasText;
            }
        }

        @media (prefers-contrast: less) {
            :host {
                color: var(--_color-reduced-contrast);
            }
        }
    }
`)

export const FocusRingStyle = [
    css`@layer mdc {:host {${tokenString}}}`,
    stylePart,
]

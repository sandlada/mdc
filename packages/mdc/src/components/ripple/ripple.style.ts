/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { RippleDefinition } from '../../component-definitions/ripple.definition'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'

const tokenRecord = defineTokenRefsRecord(RippleDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-ripple'
})
const tokenString = unsafeCSS(defineVars(tokenRecord, true).join(''))

export const styles = css`
    :host {${tokenString};}

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
    }

    :host([disable-hover-state-layer]) .hover-state-layer {
        display: none;
    }
    :host([disable-focus-state-layer]) .focus-state-layer {
        display: none;
    }
    :host([disable-press-state-layer]) .press-state-layer {
        display: none;
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
    }

    .hover-state-layer {
        inset: 0;
        background-color: var(--_hovered-color);
        transition: opacity 15ms linear, background-color 15ms linear;
    }

    .focus-state-layer {
        inset: 0;
        background-color: var(--_focused-color);
        transition: opacity 50ms linear, background-color 15ms linear;
    }

    .press-state-layer {
        inset: 0;
        background: radial-gradient(closest-side, var(--_pressed-color) max(calc(100% - 70px), 65%), transparent 100%);
        transform-origin: center center;
        transition: opacity 375ms linear;
    }

    :host([hovered]:not([disable-hover-state-layer])) .hover-state-layer {
        background-color: var(--_hovered-color);
        opacity: var(--_hovered-opacity);
    }

    :host([focused]:not([disable-focus-state-layer])) .focus-state-layer {
        background-color: var(--_focused-color);
        opacity: var(--_focused-opacity);
    }

    :host([pressed]:not([disable-press-state-layer])) .press-state-layer {
        opacity: var(--_pressed-opacity);
        transition-duration: 105ms;
    }
`

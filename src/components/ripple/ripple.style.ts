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
        background-color: ${tokens['--_hovered-color']};
        transition: opacity 15ms linear, background-color 15ms linear;
    }

    .focus-state-layer {
        inset: 0;
        background-color: ${tokens['--_focused-color']};
        transition: opacity 50ms linear, background-color 15ms linear;
    }

    .press-state-layer {
        inset: 0;
        background: radial-gradient(closest-side, ${tokens['--_pressed-color']} max(calc(100% - 70px), 65%), transparent 100%);
        transform-origin: center center;
        transition: opacity 375ms linear;
    }

    :host([hovered]:not([disable-hover-state-layer])) .hover-state-layer {
        background-color: ${tokens['--_hovered-color']};
        opacity: ${tokens['--_hovered-opacity']};
    }

    :host([focused]:not([disable-focus-state-layer])) .focus-state-layer {
        background-color: ${tokens['--_focused-color']};
        opacity: ${tokens['--_focused-opacity']};
    }

    :host([pressed]:not([disable-press-state-layer])) .press-state-layer {
        opacity: ${tokens['--_pressed-opacity']};
        transition-duration: 105ms;
    }
`

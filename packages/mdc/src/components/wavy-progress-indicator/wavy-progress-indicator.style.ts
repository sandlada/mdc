/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { stringifyTokens } from '../../utils/style'
import { WavyProgressIndicatorDefinition } from './wavy-progress-indicator.definition'

const Tokens = stringifyTokens('--mdc-wavy-progress-indicator')(WavyProgressIndicatorDefinition)

const StylePart = css`
    @layer mdc.wavy-progress-indicator.base {
        :host([variant='linear']) {
            display: flex;
            position: relative;
            min-width: 80px;
            height: var(--_linear-container-height);
            content-visibility: auto;
            contain: strict;
        }

        :host([variant='circular']) {
            display: inline-flex;
            vertical-align: middle;
            position: relative;
            align-items: center;
            justify-content: center;
        }

        :host([variant='circular'][circular-size='extra-small']) {
            width: var(--_circular-extra-small-size);
            height: var(--_circular-extra-small-size);
            --_circular-stroke-width: var(--_circular-extra-small-stroke-width);
            --_circular-track-stroke-width: var(--_circular-extra-small-track-stroke-width);
        }

        :host([variant='circular'][circular-size='small']) {
            width: var(--_circular-small-size);
            height: var(--_circular-small-size);
            --_circular-stroke-width: var(--_circular-small-stroke-width);
            --_circular-track-stroke-width: var(--_circular-small-track-stroke-width);
        }

        :host([variant='circular'][circular-size='medium']) {
            width: var(--_circular-medium-size);
            height: var(--_circular-medium-size);
            --_circular-stroke-width: var(--_circular-medium-stroke-width);
            --_circular-track-stroke-width: var(--_circular-medium-track-stroke-width);
        }

        :host([variant='circular'][circular-size='large']) {
            width: var(--_circular-large-size);
            height: var(--_circular-large-size);
            --_circular-stroke-width: var(--_circular-large-stroke-width);
            --_circular-track-stroke-width: var(--_circular-large-track-stroke-width);
        }

        .progress {
            position: relative;
            width: 100%;
            height: 100%;
            direction: ltr;
        }

        :host([variant='circular']) .progress {
            flex: 1;
            align-self: stretch;
        }

        svg {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            display: block;
            overflow: visible;
        }

        .track-path {
            fill: none;
            stroke: var(--_enabled-track-color);
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        .active-path {
            fill: none;
            stroke: var(--_enabled-active-indicator-color);
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        :host([variant='linear']) .track-path {
            stroke-width: var(--_linear-track-thickness);
        }

        :host([variant='linear']) .active-path {
            stroke-width: var(--_linear-active-indicator-thickness);
        }

        :host([variant='circular']) .track-path {
            stroke-width: var(--_circular-track-stroke-width);
        }

        :host([variant='circular']) .active-path {
            stroke-width: var(--_circular-stroke-width);
        }

        .stop-dot {
            fill: var(--_enabled-stop-indicator-color);
        }

        /* RTL: flip linear indicator horizontally */
        :host([variant='linear']:dir(rtl)) {
            transform: scaleX(-1);
        }

        /* ── High contrast ─────────────────────────────────────────────────── */
        @media (prefers-contrast: more) {
            :host {
                outline: 1px solid currentColor;
            }
        }

        /* ── Reduced transparency ──────────────────────────────────────────── */
        @media (prefers-reduced-transparency: reduce) {
            .track-path,
            .active-path,
            .stop-dot {
                opacity: 1;
            }
        }

        /* ── Forced colors ─────────────────────────────────────────────────── */
        @media (forced-colors: active) {
            :host {
                outline: 1px solid CanvasText;
            }

            .track-path {
                stroke: CanvasText;
            }

            .active-path {
                stroke: Highlight;
            }

            .stop-dot {
                fill: Highlight;
            }
        }
    }
`

export const WavyProgressIndicatorStyles = [
    css`
        @layer mdc.wavy-progress-indicator {
            @layer variable, base;
        }
    `,
    css`@layer mdc.wavy-progress-indicator.variable {:host {${Tokens};}}`,
    StylePart,
]

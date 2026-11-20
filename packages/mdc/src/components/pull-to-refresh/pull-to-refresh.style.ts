/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { stringifyTokens } from '../../utils/style'
import { PullToRefreshDefinition } from './pull-to-refresh.definition'

const Tokens = stringifyTokens('--mdc-pull-to-refresh')(PullToRefreshDefinition)

const StylePart = css`
    @layer mdc.pull-to-refresh.base {
        :host {
            box-sizing: border-box;
            position: relative;
            display: block;
            overflow: hidden;
            isolation: isolate;
            -webkit-tap-highlight-color: transparent;
        }

        :host([hidden]) {
            display: none;
        }

        :host([variant='primary']),
        :host(:not([variant])) {
            --_resolved-circular-indicator-color: var(--_enabled-circular-indicator-color);
        }

        :host([variant='secondary']) {
            --_resolved-circular-indicator-color: var(--_enabled-circular-indicator-color-secondary);
        }

        :host([variant='tertiary']) {
            --_resolved-circular-indicator-color: var(--_enabled-circular-indicator-color-tertiary);
        }

        :host([variant='surface']) {
            --_resolved-circular-indicator-color: var(--_enabled-circular-indicator-color-surface);
        }

        .indicator-layer {
            position: absolute;
            inset-block-start: 0;
            inset-inline: 0;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            pointer-events: none;
            z-index: 1;
            will-change: transform, opacity;
        }

        .indicator-layer.animating {
            transition: transform var(--_settle-duration) var(--_settle-easing),
                opacity var(--_exit-duration) var(--_exit-easing);
        }

        .indicator-shell {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transform-origin: center center;
        }

        .circular-container {
            box-sizing: border-box;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: var(--_circular-container-size);
            height: var(--_circular-container-size);
            background-color: var(--_enabled-circular-container-color);
            box-shadow: var(--_indicator-elevation-shadow);
            border-start-start-radius: var(--_indicator-container-shape-start-start);
            border-start-end-radius: var(--_indicator-container-shape-start-end);
            border-end-end-radius: var(--_indicator-container-shape-end-end);
            border-end-start-radius: var(--_indicator-container-shape-end-start);
            --mdc-progress-indicator-enabled-active-indicator-color: var(--_resolved-circular-indicator-color);
        }

        .content {
            position: relative;
            width: 100%;
            height: 100%;
            overflow-y: auto;
            touch-action: pan-y;
            overscroll-behavior-y: contain;
            will-change: transform;
        }

        .content.animating {
            transition: transform var(--_settle-duration) var(--_settle-easing);
        }

        .sr-status {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
    }

    @layer mdc.pull-to-refresh.a11y {
        @media (forced-colors: active) {
            .circular-container {
                background-color: Canvas;
                border: 1px solid ButtonBorder;
                box-shadow: none;
            }
        }

        @media (prefers-contrast: more) {
            .circular-container {
                outline: 1px solid currentColor;
            }
        }

        @media (prefers-contrast: less) {
            .circular-container {
                box-shadow: none;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .indicator-layer.animating,
            .content.animating {
                transition: none;
            }
        }

        @media (prefers-reduced-transparency: reduce) {
            .circular-container {
                backdrop-filter: none;
            }
        }
    }
`

export const PullToRefreshStyles = css`
    @layer mdc.pull-to-refresh.variable {
        :host { ${Tokens}; }
    }
    ${StylePart}
`

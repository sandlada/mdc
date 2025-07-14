/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { LinearProgressIndicatorDefinition } from '../../component-definitions/progress-indicator.definition'
import { createWrappedTokens, stringTokens } from '../../utils/tokens'

const linearProgressTokens = createWrappedTokens('--mdc-linear-progress-indicator', LinearProgressIndicatorDefinition)
const linearString = stringTokens(linearProgressTokens)

// see https://github.com/material-components/material-components-web/blob/main/packages/mdc-linear-progress/_linear-progress.scss#L79
const determinateDuration = unsafeCSS(`250ms`)
const determinateEasing = unsafeCSS(`cubic-bezier(0.4, 0, 0.6, 1)`)
// see https://github.com/material-components/material-components-web/blob/main/packages/mdc-linear-progress/_linear-progress.scss#L218
const indeterminateDuration = unsafeCSS(`2s`)

export const linearProgressIndicatorStyle = css`

    @layer mdc.linear-progress-indicator.variable {
        :host {
            ${linearString};
        }
    }

    @layer mdc.linear-progress-indicator.base {
        :host {
            border-start-start-radius: var(--_track-shape-start-start);
            border-start-end-radius: var(--_track-shape-start-end);
            border-end-start-radius: var(--_track-shape-end-start);
            border-end-end-radius: var(--_track-shape-end-end);
            display: flex;
            position: relative;
            min-width: 80px;
            content-visibility: auto;
            contain: strict;
            margin-inline-start: 4px;
            margin-inline-end: 4px;
            height: var(--_height);
        }

        .progress {
            position: absolute;
            inset: 0;
            direction: ltr;
            border-radius: inherit;
            overflow: hidden;
            display: flex;
            align-items: center;
        }

        .stop-indicators {
            position: absolute;
            inset: 0px;
            z-index: 0;
            &::before,
            &::after {
                content: "";
                display: block;
                z-index: 1;
                position: absolute;
                border-start-start-radius: var(--_stop-indicator-shape-start-start);
                border-start-end-radius: var(--_stop-indicator-shape-start-end);
                border-end-start-radius: var(--_stop-indicator-shape-end-start);
                border-end-end-radius: var(--_stop-indicator-shape-end-end);
                height: var(--_stop-indicator-size);
                width: var(--_stop-indicator-size);
                background: var(--_stop-indicator-color);
            }
            &::before {
                inset: 0px;
            }
            &::after {
                inset: calc(100% - var(--_stop-indicator-size));
            }
        }

        .tracks {
            --_inset-ltr: inset(
                0
                calc(var(--_inactive-fraction) * 100% + (var(--_stop-indicator-size) / 2))
                0
                0
                round var(--_active-indicator-shape-start-start)
            );
            --_inset-rtl: inset(
                0
                0
                0
                calc(var(--_active-fraction) * 100% + (var(--_stop-indicator-size) / 2))
                round var(--_active-indicator-shape-start-start)
            );

            .active-track,
            .inactive-track {
                position: absolute;
                inset: 0px;
                z-index: -1;
            }

            .active-track {
                background: var(--_active-indicator-color);
            }
            .inactive-track {
                background: var(--_track-color);
            }


            .active-track {
                clip-path: var(--_inset-ltr);
            }
            .inactive-track {
                clip-path: var(--_inset-rtl);
            }
        }

        :not(.indeterminate) .indeteminate-bar {
            visibility: hidden;
        }
        .indeterminate .indeteminate-bar {
            visibility: visible;
        }

        .indeteminate-bar {
            position: absolute;
            inset: 0px;
            .bar {
                position: absolute;
                animation: none;
                width: 100%;
                height: var(--_height);
                transform-origin: left center;
                transition: transform ${determinateDuration} ${determinateEasing};

                .bar-inner {
                    position: absolute;
                    inset: 0;
                    animation: none;
                    background: var(--_active-indicator-color);
                }
            }
            .primary-bar {
                inset-inline-start: -145.167%;
            }

            .secondary-bar {
                inset-inline-start: -54.8889%;
                display: block;
            }

            .primary-bar {
                animation: linear infinite ${indeterminateDuration};
                animation-name: primary-indeterminate-translate;
            }

            .primary-bar > .bar-inner {
                animation: linear infinite ${indeterminateDuration} primary-indeterminate-scale;
            }

            .secondary-bar {
                animation: linear infinite ${indeterminateDuration};
                animation-name: secondary-indeterminate-translate;
            }

            .secondary-bar > .bar-inner {
                animation: linear infinite ${indeterminateDuration} secondary-indeterminate-scale;
            }

        }
        :host(:dir(rtl)) {
            transform: scale(-1);
        }


                @keyframes primary-indeterminate-scale {
            0% {
                transform: scaleX(0.08);
            }

            36.65% {
                animation-timing-function: cubic-bezier(0.334731, 0.12482, 0.785844, 1);
                transform: scaleX(0.08);
            }

            69.15% {
                animation-timing-function: cubic-bezier(0.06, 0.11, 0.6, 1);
                transform: scaleX(0.661479);
            }

            100% {
                transform: scaleX(0.08);
            }
        }

        @keyframes secondary-indeterminate-scale {
            0% {
                animation-timing-function: cubic-bezier(
                0.205028,
                0.057051,
                0.57661,
                0.453971
                );
                transform: scaleX(0.08);
            }

            19.15% {
                animation-timing-function: cubic-bezier(
                0.152313,
                0.196432,
                0.648374,
                1.00432
                );
                transform: scaleX(0.457104);
            }

            44.15% {
                animation-timing-function: cubic-bezier(
                0.257759,
                -0.003163,
                0.211762,
                1.38179
                );
                transform: scaleX(0.72796);
            }

            100% {
                transform: scaleX(0.08);
            }
        }

        @keyframes buffering {
            0% {
                transform: translateX(calc(var(--_stop-indicator-size) * 5));
            }
        }

        @keyframes primary-indeterminate-translate {
            0% {
                transform: translateX(0px);
            }

            20% {
                animation-timing-function: cubic-bezier(0.5, 0, 0.701732, 0.495819);
                transform: translateX(0px);
            }

            59.15% {
                animation-timing-function: cubic-bezier(
                0.302435,
                0.381352,
                0.55,
                0.956352
                );
                transform: translateX(83.6714%);
            }

            100% {
                transform: translateX(200.611%);
            }
        }

        @keyframes secondary-indeterminate-translate {
            0% {
                animation-timing-function: cubic-bezier(0.15, 0, 0.515058, 0.409685);
                transform: translateX(0px);
            }

            25% {
                animation-timing-function: cubic-bezier(0.31033, 0.284058, 0.8, 0.733712);
                transform: translateX(37.6519%);
            }

            48.35% {
                animation-timing-function: cubic-bezier(0.4, 0.627035, 0.6, 0.902026);
                transform: translateX(84.3862%);
            }

            100% {
                transform: translateX(160.278%);
            }
        }
    }
`

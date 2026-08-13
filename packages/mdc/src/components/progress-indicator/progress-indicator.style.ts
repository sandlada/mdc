/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { LinearProgressIndicatorDefinition } from '../../component-definitions/progress-indicator.definition'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'

const tokenRecord = defineTokenRefsRecord(LinearProgressIndicatorDefinition, {
    expandShapes: false,
    useBaseFallback: true,
    prefix: '--mdc-linear-progress-indicator'
})
const linearString = unsafeCSS(defineVars(tokenRecord, true).join(''))

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
        :host([wavy]) {
            height: 20px;
        }

        .progress {
            position: absolute;
            inset: 0;
            direction: ltr;
            border-radius: inherit;
            overflow: hidden;
            display: flex;
            align-items: center;

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
        }
        .indeterminate .stop {
            display: none;
        }
        .stop-indicators:not(.indeterminate) {
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
            .active-track,
            .inactive-track {
                position: absolute;
                inset: 0px;
                z-index: -1;
                transition: none;
            }

            .active-track {
                /* background: var(--_active-indicator-color); */
            }
            .inactive-track {
                background: var(--_track-color);
            }


            .active-track {
                /* clip-path: var(--_inset-ltr); */
            }
            .inactive-track {
                /* clip-path: var(--_inset-rtl); */
            }
        }

        .indeterminate .tracks {
            position: absolute;
            inset: 0px;

            &>.track {
                position: absolute;
                inset: 0px;
                clip-path: inset(0 calc(var(--_wave-length-start-fraction) * 100%) 0 var(--_wave-length-end-fraction));
                /* animation: wave-animation 3s infinite linear; */
            }
            &>.inactive-track {
                background: var(--_track-color);
                position: absolute;
                inset: 0px;
                z-index: -1;
            }
            &>.inactive-track.left {
                /* animation: wave-inactive-right-animation 10s infinite linear; */
            }
            &>.inactive-track.right {
                /* display: none; */
                /* animation: wave-inactive-right-animation 10s infinite linear; */
            }
        }

        .wave {

            fill: none;
            stroke: var(--_active-indicator-color);
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        @keyframes wave-animation {
            0% {
            }
            10% {
            }
        }


    }
`

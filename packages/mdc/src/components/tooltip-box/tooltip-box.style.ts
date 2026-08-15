/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'

export const TooltipBoxStyles = css`
    @layer mdc.tooltip-box.base {
        :host {
            display: inline-block;
            position: relative;
        }

        /*
         * Must NOT use display: contents — the anchor wrapper needs a box
         * so that floating-ui can measure getBoundingClientRect() on it.
         * inline-block keeps the wrapper from adding layout overhead while
         * giving it a proper bounding box that wraps the slotted content.
         */
        .anchor {
            display: inline-block;
        }
    }
`

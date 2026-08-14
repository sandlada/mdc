/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { OutlinedSegmentedButtonSetDefinition } from '../../../component-definitions/segmented-button.definition'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'

const tokenRecord = defineTokenRefsRecord(OutlinedSegmentedButtonSetDefinition, {
    expandShapes: false,
    useBaseFallback: true,
    prefix: '--mdc-segmented-button',
})
const tokenString = unsafeCSS(defineVars(tokenRecord, true).join(''))

export const SegmentedButtonSetStyles = css`
    :host {
        ${tokenString};

        display: flex;
        outline: none;
    }

    .container {
        display: grid;
        grid-auto-columns: 1fr;
        grid-auto-flow: column;
        grid-auto-rows: auto;
        height: var(--_container-height);
        width: 100%;
    }

    /* The container outline is drawn by each segment; only the first / last
       segment host carries the outer corner radii so the outline appears to
       wrap the group while adjacent segments share a single 1px divider. */
    .container ::slotted(:first-child) {
        border-start-start-radius: var(--_shape-start-start);
        border-end-start-radius: var(--_shape-end-start);
    }
    .container ::slotted(:last-child) {
        border-start-end-radius: var(--_shape-start-end);
        border-end-end-radius: var(--_shape-end-end);
    }
`

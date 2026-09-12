/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { SnackbarHostDefinition } from '../../component-definitions/snackbar-host.definition'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'

const tokenRecord = defineTokenRefsRecord(SnackbarHostDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-snackbar-host',
})
const tokenString = defineVars(tokenRecord, true).join('')

const base = css`
    @layer mdc.snackbar-host.variable {
        :host {
            ${unsafeCSS(tokenString)};
        }
    }

    @layer mdc.snackbar-host.base {
        :host {
            display: flex;
            position: fixed;
            z-index: var(--_enabled-z-index);
            pointer-events: none;
            box-sizing: border-box;
            max-width: var(--_enabled-container-max-width);
        }

        :host([scoped]) {
            position: absolute;
        }

        .container {
            display: contents;
        }

        mdc-snackbar {
            pointer-events: auto;
        }

        /* ── Placements ─────────────────────────────────────────────────────── */
        :host([placement="bottom-center"]) {
            bottom: max(var(--_enabled-container-margin-block-end), env(safe-area-inset-bottom, 0px));
            inset-inline: 0;
            justify-content: center;
            align-items: center;
            margin-inline: auto;
        }

        :host([placement="bottom-start"]) {
            bottom: max(var(--_enabled-container-margin-block-end), env(safe-area-inset-bottom, 0px));
            inset-inline-start: max(var(--_enabled-container-margin-inline-start), env(safe-area-inset-left, 0px));
        }

        :host([placement="bottom-end"]) {
            bottom: max(var(--_enabled-container-margin-block-end), env(safe-area-inset-bottom, 0px));
            inset-inline-end: max(var(--_enabled-container-margin-inline-end), env(safe-area-inset-right, 0px));
        }

        :host([placement="top-center"]) {
            top: max(var(--_enabled-container-margin-block-start), env(safe-area-inset-top, 0px));
            inset-inline: 0;
            justify-content: center;
            align-items: center;
            margin-inline: auto;
        }

        :host([placement="top-start"]) {
            top: max(var(--_enabled-container-margin-block-start), env(safe-area-inset-top, 0px));
            inset-inline-start: max(var(--_enabled-container-margin-inline-start), env(safe-area-inset-left, 0px));
        }

        :host([placement="top-end"]) {
            top: max(var(--_enabled-container-margin-block-start), env(safe-area-inset-top, 0px));
            inset-inline-end: max(var(--_enabled-container-margin-inline-end), env(safe-area-inset-right, 0px));
        }
    }
`

export const SnackbarHostStyles = [base]

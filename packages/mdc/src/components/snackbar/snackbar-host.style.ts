/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { SnackbarHostDefinition } from './snackbar-host.definition'
import { stringifyTokens } from '../../utils/style'

const TokenString = stringifyTokens('--mdc-snackbar-host')(SnackbarHostDefinition)

const Base = css`
    @layer mdc.snackbar-host.variable {
        :host {
            ${TokenString};
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
            display: flex;
            flex-direction: column;
            gap: var(--_enabled-container-gap);
            align-items: center;
            width: 100%;
            pointer-events: none;
        }

        :host([placement="bottom-start"]) .container,
        :host([placement="top-start"]) .container {
            align-items: flex-start;
        }

        :host([placement="bottom-end"]) .container,
        :host([placement="top-end"]) .container {
            align-items: flex-end;
        }

        :host([placement^="top"]) .container {
            flex-direction: column-reverse;
        }

        mdc-snackbar {
            pointer-events: auto;
        }

        /* ── Placements ─────────────────────────────────────────────────────── */
        :host([placement="bottom-center"]) {
            bottom: calc(max(var(--_enabled-container-margin-block-end), env(safe-area-inset-bottom, 0px)) + var(--_enabled-offset-block-end));
            inset-inline: 0;
            justify-content: center;
            align-items: center;
            margin-inline: auto;
        }

        :host([placement="bottom-start"]) {
            bottom: calc(max(var(--_enabled-container-margin-block-end), env(safe-area-inset-bottom, 0px)) + var(--_enabled-offset-block-end));
            inset-inline-start: max(var(--_enabled-container-margin-inline-start), env(safe-area-inset-left, 0px));
        }

        :host([placement="bottom-end"]) {
            bottom: calc(max(var(--_enabled-container-margin-block-end), env(safe-area-inset-bottom, 0px)) + var(--_enabled-offset-block-end));
            inset-inline-end: max(var(--_enabled-container-margin-inline-end), env(safe-area-inset-right, 0px));
        }

        :host([placement="top-center"]) {
            top: calc(max(var(--_enabled-container-margin-block-start), env(safe-area-inset-top, 0px)) + var(--_enabled-offset-block-start));
            inset-inline: 0;
            justify-content: center;
            align-items: center;
            margin-inline: auto;
            --mdc-snackbar-slide-offset: -100%;
        }

        :host([placement="top-start"]) {
            top: calc(max(var(--_enabled-container-margin-block-start), env(safe-area-inset-top, 0px)) + var(--_enabled-offset-block-start));
            inset-inline-start: max(var(--_enabled-container-margin-inline-start), env(safe-area-inset-left, 0px));
            --mdc-snackbar-slide-offset: -100%;
        }

        :host([placement="top-end"]) {
            top: calc(max(var(--_enabled-container-margin-block-start), env(safe-area-inset-top, 0px)) + var(--_enabled-offset-block-start));
            inset-inline-end: max(var(--_enabled-container-margin-inline-end), env(safe-area-inset-right, 0px));
            --mdc-snackbar-slide-offset: -100%;
        }
    }
`

export const SnackbarHostStyles = [Base]

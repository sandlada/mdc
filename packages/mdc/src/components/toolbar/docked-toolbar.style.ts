/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { stringifyTokens } from '../../utils/style'
import { DockedToolbarDefinition } from './toolbar.definition'
import { StandardToolbarIconButtonBridge, VibrantToolbarIconButtonBridge } from './internal/toolbar-bridges'

const DockedToolbarTokens = stringifyTokens('--mdc-docked-toolbar')(DockedToolbarDefinition)

export const DockedToolbarStyles = css`
    @layer mdc.docked-toolbar {
        :host {
            ${DockedToolbarTokens};
            display: flex;
            width: 100%;
            min-height: var(--_container-height);
            box-sizing: border-box;
        }

        :host([hidden]) {
            display: none !important;
        }

        .container {
            position: relative;
            display: flex;
            flex-direction: row;
            align-items: center;
            width: 100%;
            min-height: var(--_container-height);
            box-sizing: border-box;
            padding-inline-start: var(--_container-padding-inline-start);
            padding-inline-end: var(--_container-padding-inline-end);
            padding-block-start: var(--_container-padding-block-start);
            padding-block-end: var(--_container-padding-block-end);
            gap: var(--_min-space-between-actions);
            border-start-start-radius: var(--_enabled-container-shape-start-start);
            border-start-end-radius: var(--_enabled-container-shape-start-end);
            border-end-start-radius: var(--_enabled-container-shape-end-start);
            border-end-end-radius: var(--_enabled-container-shape-end-end);
            z-index: 0;
        }

        .container.align-space-between { justify-content: space-between; }
        .container.align-space-around  { justify-content: space-around; }
        .container.align-space-evenly  { justify-content: space-evenly; }
        .container.align-center        { justify-content: center; gap: var(--_max-space-between-actions); }
        .container.align-start         { justify-content: flex-start; gap: var(--_max-space-between-actions); }
        .container.align-end           { justify-content: flex-end; gap: var(--_max-space-between-actions); }

        .container.standard {
            ${StandardToolbarIconButtonBridge};
            color: var(--_enabled-standard-icon-color);
        }

        .container.vibrant {
            ${VibrantToolbarIconButtonBridge};
            color: var(--_enabled-vibrant-icon-color);
        }

        .background {
            position: absolute;
            inset: 0;
            border-radius: inherit;
            z-index: -1;
            pointer-events: none;
            transition: background-color 200ms cubic-bezier(0.2, 0, 0, 1);
        }

        .container.standard .background {
            background-color: var(--_enabled-standard-container-color);
        }

        .container.vibrant .background {
            background-color: var(--_enabled-vibrant-container-color);
        }

        .section-actions {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: inherit;
            flex: 1 1 auto;
            min-width: 0;
            gap: inherit;
        }

        .section-leading,
        .section-trailing {
            display: inline-flex;
            align-items: center;
            flex: 0 0 auto;
            gap: var(--_min-space-between-actions);
        }

        .section-leading:not(.has-content),
        .section-trailing:not(.has-content) {
            display: none;
        }

        @media (prefers-reduced-motion: reduce) {
            .background {
                transition: none;
            }
        }

        @media (prefers-contrast: more) {
            .background {
                border-block-start: 1px solid currentColor;
            }
        }

        @media (forced-colors: active) {
            .background {
                background-color: Canvas;
                border-block-start: 1px solid CanvasText;
            }
        }
    }
`

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { overrideTokens, stringifyTokens } from '../../utils/style'
import type { ElevationDefinition } from '../elevation/elevation.definition'
import { FloatingToolbarDefinition } from './toolbar.definition'
import { StandardToolbarIconButtonBridge, VibrantToolbarIconButtonBridge } from './internal/toolbar-bridges'

const FloatingToolbarTokens = stringifyTokens('--mdc-floating-toolbar')(FloatingToolbarDefinition)

const FloatingElevationBridge = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': 'var(--_enabled-container-elevation)',
    'shadow-color': 'var(--_enabled-container-shadow-color)',
})()

export const FloatingToolbarStyles = css`
    @layer mdc.floating-toolbar {
        :host {
            ${FloatingToolbarTokens};
            display: inline-flex;
            vertical-align: middle;
            box-sizing: border-box;
        }

        :host([hidden]) {
            display: none !important;
        }

        .wrapper {
            display: inline-flex;
            align-items: center;
            box-sizing: border-box;
            gap: 0;
        }

        .wrapper.has-fab {
            gap: var(--_fab-gap);
        }

        .wrapper.horizontal {
            flex-direction: row;
        }

        .wrapper.vertical {
            flex-direction: column;
        }

        .wrapper.fab-start.horizontal {
            flex-direction: row-reverse;
        }

        .wrapper.fab-start.vertical {
            flex-direction: column-reverse;
        }

        .container {
            position: relative;
            display: inline-flex;
            align-items: center;
            box-sizing: border-box;
            padding-block-start: var(--_container-padding-block-start);
            padding-block-end: var(--_container-padding-block-end);
            padding-inline-start: var(--_container-padding-inline-start);
            padding-inline-end: var(--_container-padding-inline-end);
            gap: var(--_space-between-actions);
            border-start-start-radius: var(--_enabled-container-shape-start-start);
            border-start-end-radius: var(--_enabled-container-shape-start-end);
            border-end-start-radius: var(--_enabled-container-shape-end-start);
            border-end-end-radius: var(--_enabled-container-shape-end-end);
            z-index: 0;
            transition:
                opacity 220ms cubic-bezier(0.2, 0, 0, 1),
                transform 300ms cubic-bezier(0.38, 1.21, 0.22, 1),
                max-width 300ms cubic-bezier(0.38, 1.21, 0.22, 1),
                max-height 300ms cubic-bezier(0.38, 1.21, 0.22, 1),
                padding 250ms cubic-bezier(0.2, 0, 0, 1);
        }

        .wrapper.horizontal .container {
            flex-direction: row;
            min-height: var(--_container-height);
        }

        .wrapper.vertical .container {
            flex-direction: column;
            min-width: var(--_container-width);
        }

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

        .container mdc-elevation {
            ${FloatingElevationBridge};
            border-radius: inherit;
        }

        .actions {
            display: inline-flex;
            align-items: center;
            gap: inherit;
        }

        .wrapper.horizontal .actions {
            flex-direction: row;
        }

        .wrapper.vertical .actions {
            flex-direction: column;
        }

        /* ── Collapsed state ─────────────────────────────────────────── */

        .wrapper.collapsed .container {
            opacity: 0;
            pointer-events: none;
            overflow: hidden;
            padding: 0;
        }

        .wrapper.collapsed.horizontal .container {
            max-width: 0;
            min-width: 0;
            transform: scaleX(0.8);
        }

        .wrapper.collapsed.vertical .container {
            max-height: 0;
            min-height: 0;
            transform: scaleY(0.8);
        }

        .wrapper.collapsed.has-fab {
            gap: 0;
        }

        .fab-container {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 auto;
        }

        .fab-container:not(.has-content) {
            display: none;
        }

        @media (prefers-reduced-motion: reduce) {
            .container,
            .background {
                transition: none;
            }
        }

        @media (prefers-contrast: more) {
            .background {
                border: 1px solid currentColor;
            }
        }

        @media (forced-colors: active) {
            .background {
                background-color: Canvas;
                border: 1px solid CanvasText;
            }
        }
    }
`

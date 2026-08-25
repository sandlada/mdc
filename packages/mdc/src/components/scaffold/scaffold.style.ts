/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { ScaffoldDefinition } from '../../component-definitions/scaffold.definition'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'

const tokenRecord = defineTokenRefsRecord(ScaffoldDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-scaffold',
})
const tokenString = defineVars(tokenRecord, true).join('')

const base = css`
    @layer mdc.scaffold.variable {
        :host {
            ${unsafeCSS(tokenString)};
        }
    }

    @layer mdc.scaffold.base {
        :host {
            display: block;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
        }

        :host([scroll-mode="window"]) {
            overflow: visible;
            height: auto;
            min-height: 100vh;
        }

        .container {
            display: grid;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            background-color: var(--_enabled-container-color);
            color: var(--_enabled-content-color);
            position: relative;
            isolation: isolate;
        }

        /* ── Full-Height Rail / Adaptive Layout (Default) ──────────────────── */
        .container.rail-full-height {
            grid-template-columns:
                [start-drawer] auto
                [start-rail] auto
                [content-start] 1fr [content-end]
                [end-rail] auto
                [end-drawer] auto;
            grid-template-rows:
                [top] auto
                [body] 1fr
                [bottom] auto;
        }

        .container.rail-full-height .start-drawer-area,
        .container.rail-full-height .start-rail-area,
        .container.rail-full-height .end-rail-area,
        .container.rail-full-height .end-drawer-area {
            grid-row: 1 / -1;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
            z-index: var(--_enabled-z-index-rail);
        }

        .container.rail-full-height .start-drawer-area {
            grid-column: start-drawer;
            z-index: var(--_enabled-z-index-drawer);
        }

        .container.rail-full-height .start-rail-area {
            grid-column: start-rail;
        }

        .container.rail-full-height .end-rail-area {
            grid-column: end-rail;
        }

        .container.rail-full-height .end-drawer-area {
            grid-column: end-drawer;
            z-index: var(--_enabled-z-index-drawer);
        }

        .container.rail-full-height .appbar-area {
            grid-column: content-start / content-end;
            grid-row: top;
            z-index: var(--_enabled-z-index-appbar);
        }

        .container.rail-full-height .body-area {
            grid-column: content-start / content-end;
            grid-row: body;
            overflow-y: auto;
            min-height: 0;
            min-width: 0;
            position: relative;
            display: flex;
            flex-direction: column;
        }

        .container.rail-full-height .bottom-bar-area {
            grid-column: content-start / content-end;
            grid-row: bottom;
            z-index: var(--_enabled-z-index-bottom-bar);
        }

        /* ── Below-Appbar Layout ───────────────────────────────────────────── */
        .container.rail-below-appbar {
            grid-template-columns:
                [start-drawer] auto
                [start-rail] auto
                [content-start] 1fr [content-end]
                [end-rail] auto
                [end-drawer] auto;
            grid-template-rows:
                [top] auto
                [body] 1fr
                [bottom] auto;
        }

        .container.rail-below-appbar .appbar-area {
            grid-column: 1 / -1;
            grid-row: top;
            z-index: var(--_enabled-z-index-appbar);
        }

        .container.rail-below-appbar .start-drawer-area,
        .container.rail-below-appbar .start-rail-area,
        .container.rail-below-appbar .end-rail-area,
        .container.rail-below-appbar .end-drawer-area {
            grid-row: body;
            height: 100%;
            display: flex;
            flex-direction: column;
            z-index: var(--_enabled-z-index-rail);
        }

        .container.rail-below-appbar .start-drawer-area {
            grid-column: start-drawer;
            z-index: var(--_enabled-z-index-drawer);
        }

        .container.rail-below-appbar .start-rail-area {
            grid-column: start-rail;
        }

        .container.rail-below-appbar .end-rail-area {
            grid-column: end-rail;
        }

        .container.rail-below-appbar .end-drawer-area {
            grid-column: end-drawer;
            z-index: var(--_enabled-z-index-drawer);
        }

        .container.rail-below-appbar .body-area {
            grid-column: content-start / content-end;
            grid-row: body;
            overflow-y: auto;
            min-height: 0;
            min-width: 0;
            position: relative;
            display: flex;
            flex-direction: column;
        }

        .container.rail-below-appbar .bottom-bar-area {
            grid-column: 1 / -1;
            grid-row: bottom;
            z-index: var(--_enabled-z-index-bottom-bar);
        }

        /* ── Scroll Mode Window adjustments ─────────────────────────────────── */
        :host([scroll-mode="window"]) .container .body-area {
            overflow-y: visible;
            height: auto;
        }

        /* ── Empty slot hiding ─────────────────────────────────────────────── */
        .start-drawer-area:not(.has-drawer),
        .start-rail-area:not(.has-rail),
        .end-rail-area:not(.has-end-rail),
        .end-drawer-area:not(.has-end-drawer),
        .appbar-area:not(.has-appbar),
        .bottom-bar-area:not(.has-bottom-bar),
        .bottom-sheet-area:not(.has-bottom-sheet),
        .fab-area:not(.has-fab) {
            display: none;
        }

        /* ── FAB Positioning & Motion ──────────────────────────────────────── */
        .fab-area {
            position: absolute;
            z-index: var(--_enabled-z-index-fab);
            pointer-events: auto;
            transition: transform 200ms cubic-bezier(0.2, 0, 0, 1),
                        bottom 200ms cubic-bezier(0.2, 0, 0, 1);
        }

        .fab-area.fab-bottom-end {
            inset-inline-end: var(--_enabled-fab-margin-inline-end);
            bottom: var(--_computed-fab-bottom, var(--_enabled-fab-margin-block-end));
        }

        .fab-area.fab-bottom-start {
            inset-inline-start: var(--_enabled-fab-margin-inline-start);
            bottom: var(--_computed-fab-bottom, var(--_enabled-fab-margin-block-end));
        }

        .fab-area.fab-bottom-center {
            inset-inline-start: 50%;
            transform: translateX(-50%);
            bottom: var(--_computed-fab-bottom, var(--_enabled-fab-margin-block-end));
        }

        .fab-area.fab-docked-end {
            inset-inline-end: var(--_enabled-fab-margin-inline-end);
            bottom: var(--_computed-bottom-bar-height, 0px);
            transform: translateY(50%);
        }

        .fab-area.fab-docked-center {
            inset-inline-start: 50%;
            bottom: var(--_computed-bottom-bar-height, 0px);
            transform: translate(-50%, 50%);
        }

        /* ── Overlays: Bottom Sheet & Snackbar Host ────────────────────────── */
        .bottom-sheet-area {
            position: absolute;
            inset-inline: 0;
            bottom: 0;
            z-index: var(--_enabled-z-index-bottom-sheet);
            pointer-events: none;
        }

        .bottom-sheet-area ::slotted(*) {
            pointer-events: auto;
        }

        .snackbar-host-area {
            position: absolute;
            inset: 0;
            z-index: var(--_enabled-z-index-snackbar-host);
            pointer-events: none;
        }

        .snackbar-host-area ::slotted(*) {
            pointer-events: auto;
        }

        /* ── Safe Area Inset Handling ──────────────────────────────────────── */
        :host([avoid-safe-area]) .container {
            padding-top: env(safe-area-inset-top, 0px);
            padding-bottom: env(safe-area-inset-bottom, 0px);
            padding-left: env(safe-area-inset-left, 0px);
            padding-right: env(safe-area-inset-right, 0px);
        }
    }
`

export const ScaffoldStyles = [base]

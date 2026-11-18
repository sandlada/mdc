/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { ScaffoldDefinition } from './scaffold.definition'
import { stringifyTokens } from '../../utils/style'

const TokenString = stringifyTokens('--mdc-scaffold')(ScaffoldDefinition)

const Base = css`
    @layer mdc.scaffold.variable {
        :host {
            ${TokenString};
            --_computed-top-bar-height: 0px;
            --_computed-resting-top-bar-height: 0px;
            --_computed-bottom-bar-height: 0px;
            --_computed-fab-height: 0px;
            --_computed-fab-bottom: 16px;
            --_computed-snackbar-bottom: 16px;
            --_computed-inner-padding-top: 0px;
            --_computed-inner-padding-bottom: 0px;
            --_computed-inner-padding-start: 0px;
            --_computed-inner-padding-end: 0px;
            --_safe-fab-bottom: 0px;
            --_safe-snackbar-bottom: 0px;
            --_probe-safe-top: 0px;
            --_probe-safe-bottom: 0px;
            --_probe-safe-left: 0px;
            --_probe-safe-right: 0px;
        }

        :host([avoid-safe-area]) {
            --_probe-safe-top: env(safe-area-inset-top, 0px);
            --_probe-safe-bottom: env(safe-area-inset-bottom, 0px);
            --_probe-safe-left: env(safe-area-inset-left, 0px);
            --_probe-safe-right: env(safe-area-inset-right, 0px);
        }
    }

    @layer mdc.scaffold.base {
        :host {
            display: block;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            position: relative;
            overflow: clip;
            background-color: var(--_enabled-container-color);
            color: var(--_enabled-content-color);
        }

        :host([scroll-mode="window"]) {
            overflow: visible;
            height: auto;
            min-height: 100svh;
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

        :host([scroll-mode="window"]) .container {
            height: auto;
            min-height: 100svh;
            overflow: visible;
        }

        /* Shared Grid Track Architecture */
        .container.rail-full-height,
        .container.rail-below-appbar {
            grid-template-columns:
                [start-drawer] auto
                [start-rail] auto
                [content-start] 1fr
                [content-end end-rail] auto
                [end-drawer] auto;
            grid-template-rows:
                [top] auto
                [body] 1fr
                [bottom] auto;
        }

        /* Full-Height Rail and Adaptive Layout (Default) */
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

        .container.rail-full-height .start-drawer-area,
        .container.rail-below-appbar .start-drawer-area {
            grid-column: start-drawer;
            z-index: var(--_enabled-z-index-drawer);
        }

        .container.rail-full-height .start-rail-area,
        .container.rail-below-appbar .start-rail-area {
            grid-column: start-rail;
        }

        .container.rail-full-height .end-rail-area,
        .container.rail-below-appbar .end-rail-area {
            grid-column: end-rail;
        }

        .container.rail-full-height .end-drawer-area,
        .container.rail-below-appbar .end-drawer-area {
            grid-column: end-drawer;
            z-index: var(--_enabled-z-index-drawer);
        }

        .container.rail-full-height .appbar-area {
            grid-column: content-start / content-end;
            grid-row: top;
            z-index: var(--_enabled-z-index-appbar);
        }

        .container.rail-full-height .bottom-bar-area {
            grid-column: content-start / content-end;
            grid-row: bottom;
            z-index: var(--_enabled-z-index-bottom-bar);
        }

        /* Below-Appbar Layout */
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
            position: relative;
            z-index: var(--_enabled-z-index-rail);
        }

        .container.rail-below-appbar .bottom-bar-area {
            grid-column: 1 / -1;
            grid-row: bottom;
            z-index: var(--_enabled-z-index-bottom-bar);
        }

        /* Body Area & Compose innerPadding Modes */
        .body-area {
            grid-column: content-start / content-end;
            overflow-y: auto;
            min-height: 0;
            min-width: 0;
            position: relative;
            display: block;
            box-sizing: border-box;
        }

        .container.padding-mode-docked .body-area {
            grid-row: body;
        }

        .container.padding-mode-inset .body-area {
            grid-row: 1 / -1;
            padding-block-start: var(--_computed-inner-padding-top, 0px);
            padding-block-end: var(--_computed-inner-padding-bottom, 0px);
            scroll-padding-top: var(--_computed-inner-padding-top, 0px);
            scroll-padding-bottom: var(--_computed-inner-padding-bottom, 0px);
        }

        .container.padding-mode-manual .body-area {
            grid-row: 1 / -1;
        }

        /* Slotted content stretches to its area without clobbering modal/floating hosts. */
        .appbar-area ::slotted(*),
        .bottom-bar-area ::slotted(*) {
            display: block;
            width: 100%;
        }

        .start-rail-area ::slotted(:not([variant="modal"]):not([variant="expanded-floating"])),
        .start-drawer-area ::slotted(:not([variant="modal"])),
        .end-rail-area ::slotted(:not([variant="modal"]):not([variant="expanded-floating"])),
        .end-drawer-area ::slotted(:not([variant="modal"])) {
            display: block;
            height: 100%;
        }

        /* Scroll Mode window adjustments */
        :host([scroll-mode="window"]) .container .body-area {
            overflow-y: visible;
            height: auto;
        }

        :host([scroll-mode="window"]) .container .appbar-area {
            position: sticky;
            top: 0;
        }

        :host([scroll-mode="window"]) .container .bottom-bar-area {
            position: sticky;
            bottom: 0;
        }

        /* Safe-area per area, mirroring contentWindowInsets (without double-counting). */
        :host([avoid-safe-area]) .appbar-area {
            padding-top: env(safe-area-inset-top, 0px);
        }

        :host([avoid-safe-area]) .bottom-bar-area {
            padding-bottom: env(safe-area-inset-bottom, 0px);
        }

        :host([avoid-safe-area]) .container.padding-mode-docked:not(.has-appbar) .body-area {
            padding-top: env(safe-area-inset-top, 0px);
        }

        :host([avoid-safe-area]) .container.padding-mode-docked:not(.has-bottom-bar) .body-area {
            padding-bottom: env(safe-area-inset-bottom, 0px);
        }

        :host([avoid-safe-area]) .container:not(.padding-mode-manual) .body-area {
            padding-inline-start: var(--_computed-inner-padding-start, 0px);
            padding-inline-end: var(--_computed-inner-padding-end, 0px);
        }

        :host([avoid-safe-area]) .container .appbar-area,
        :host([avoid-safe-area]) .container .bottom-bar-area {
            padding-inline-start: var(--_computed-inner-padding-start, 0px);
            padding-inline-end: var(--_computed-inner-padding-end, 0px);
            box-sizing: border-box;
        }

        /* Empty / adaptively hidden slot hiding (higher specificity than rail-full-height / rail-below-appbar) */
        .container .start-drawer-area:not(.has-drawer),
        .container .start-rail-area:not(.has-rail),
        .container .end-rail-area:not(.has-end-rail),
        .container .end-drawer-area:not(.has-end-drawer),
        .container .appbar-area:not(.has-appbar),
        .container .bottom-bar-area:not(.has-bottom-bar),
        .container .docked-bottom-bar-wrapper:not(.is-visible),
        .container .navigation-bar-wrapper:not(.is-visible),
        .container .bottom-sheet-area:not(.has-bottom-sheet),
        .container .fab-area:not(.has-fab),
        .container .snackbar-host-area:not(.has-snackbar-host) {
            display: none;
        }

        /* Content-Scoped Overlay Layer (constrained to content-start / content-end) */
        .content-overlay {
            grid-column: content-start / content-end;
            grid-row: 1 / -1;
            align-self: end;
            height: 0;
            overflow: visible;
            position: relative;
            z-index: var(--_enabled-z-index-fab);
            pointer-events: none;
        }

        :host([scroll-mode="window"]) .content-overlay {
            position: sticky;
            bottom: 0;
        }

        /* FAB Positioning, mirroring FabSpacing = 16dp */
        .fab-area {
            position: absolute;
            z-index: var(--_enabled-z-index-fab);
            pointer-events: none;
            bottom: calc(var(--_computed-fab-bottom, 16px) + var(--_safe-fab-bottom, 0px));
            transition: transform 200ms cubic-bezier(0.2, 0, 0, 1),
                        bottom 200ms cubic-bezier(0.2, 0, 0, 1);
        }

        .fab-area ::slotted(*) {
            pointer-events: auto;
        }

        .container.fab-start .fab-area {
            inset-inline-start: calc(var(--_enabled-fab-margin-inline-start) + var(--_computed-inner-padding-start, 0px));
        }

        .container.fab-end .fab-area,
        .container.fab-end-overlay .fab-area {
            inset-inline-end: calc(var(--_enabled-fab-margin-inline-end) + var(--_computed-inner-padding-end, 0px));
        }

        .container.fab-center .fab-area {
            inset-inline-start: var(--_computed-inner-padding-start, 0px);
            inset-inline-end: var(--_computed-inner-padding-end, 0px);
            display: flex;
            justify-content: center;
        }

        /* Overlays: Bottom Sheet and Snackbar Host */
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
            inset-inline-start: var(--_computed-inner-padding-start, 0px);
            inset-inline-end: var(--_computed-inner-padding-end, 0px);
            bottom: calc(var(--_computed-snackbar-bottom, 16px) + var(--_safe-snackbar-bottom, 0px));
            z-index: var(--_enabled-z-index-snackbar-host);
            pointer-events: none;
            display: flex;
            justify-content: center;
            padding-inline: 16px;
            box-sizing: border-box;
        }

        .snackbar-host-area ::slotted(*) {
            position: static;
            inset: auto;
            margin: 0;
            pointer-events: auto;
            max-width: 100%;
        }

        @media (prefers-reduced-motion: reduce) {
            .fab-area {
                transition: none;
            }
        }

        @media (prefers-contrast: more) {
            .container {
                outline: 1px solid currentColor;
                outline-offset: -1px;
            }
        }

        @media (prefers-contrast: less) {
            .container {
                outline: 1px solid color-mix(in srgb, currentColor 18%, transparent);
                outline-offset: -1px;
            }
        }

        @media (forced-colors: active) {
            .container {
                background-color: Canvas;
                color: CanvasText;
            }

            .fab-area,
            .snackbar-host-area,
            .bottom-sheet-area {
                forced-color-adjust: auto;
            }
        }

        @media (prefers-reduced-transparency: reduce) {
            .container {
                background-color: var(--_enabled-container-color);
            }
        }
    }
`

export const ScaffoldStyles = [Base]

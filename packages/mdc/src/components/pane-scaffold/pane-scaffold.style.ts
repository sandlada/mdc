/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { stringifyTokens } from '../../utils/style'
import { PaneScaffoldDefinition } from './pane-scaffold.definition'

const Tokens = stringifyTokens('--mdc-pane-scaffold')(PaneScaffoldDefinition)

export const PaneScaffoldStyles = css`
    @layer mdc.pane-scaffold {
        :host {
            ${Tokens}
            display: block;
            min-inline-size: 0;
            min-block-size: 0;
        }

        .grid {
            display: grid;
            position: relative;
            grid-template-columns: var(--_pane-tracks);
            block-size: 100%;
            min-block-size: 0;
            isolation: isolate;
        }

        :host(:dir(rtl)) .grid.excluded {
            grid-template-columns: var(--_pane-tracks-rtl);
        }

        .pane {
            min-inline-size: 0;
            min-block-size: 0;
            overflow: auto;
        }

        .grid:is(.reflowing, .block-partitioned) {
            grid-template-rows: var(--_pane-rows);
        }

        .reflowing .pane { grid-column: 1; grid-row: 1; }
        .reflowing .pane[data-reflowed] { grid-row: 3; }
        .block-partitioned > [part~='pane-spacer'] { grid-row: 2; }

        .scrim {
            position: absolute;
            inset: 0;
            z-index: 1;
            overflow: clip;
        }

        .scrim-visual {
            display: grid;
            position: absolute;
            inset: 0;
        }

        .default-scrim {
            background: var(--_enabled-scrim-color);
            opacity: var(--_enabled-scrim-opacity);
        }

        .pane[data-alignment] {
            position: absolute;
            inset: 0;
            z-index: 1;
            grid-area: auto;
            margin: auto;
            inline-size: min(100%, var(--_levitated-inline-size));
            block-size: min(100%, var(--_levitated-block-size));
            background: var(--_enabled-levitated-container-color);
            color: var(--_enabled-levitated-content-color);
        }

        .pane[data-alignment^='block-start'] { margin-block-start: 0; }
        .pane[data-alignment^='block-end'] { margin-block-end: 0; }
        .pane[data-alignment$='inline-start'] { margin-inline-start: 0; }
        .pane[data-alignment$='inline-end'] { margin-inline-end: 0; }

        .pane[data-pane-margins]:not([data-alignment], [data-preview-only], [data-pane-exit]) {
            margin-inline: var(--_pane-margin-inline-start) var(--_pane-margin-inline-end);
            margin-block: var(--_pane-margin-block-start) var(--_pane-margin-block-end);
        }

        :host(:dir(rtl)) .pane[data-pane-margins-rtl]:not([data-alignment], [data-preview-only], [data-pane-exit]) {
            margin-inline: var(--_pane-margin-inline-start-rtl) var(--_pane-margin-inline-end-rtl);
        }

        .pane[data-pane-margins][data-alignment] {
            inset: auto;
            inset-inline-start: var(--_levitated-inset-inline);
            inset-block-start: var(--_levitated-inset-block);
            inline-size: var(--_levitated-inset-width);
            block-size: var(--_levitated-inset-height);
            margin: 0;
        }

        .pane[data-resize-edge] {
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            reading-flow: flex-visual;
            overflow: hidden;
        }

        .pane[data-resize-edge='block-start'] { flex-direction: column-reverse; }
        .pane[data-resize-edge='inline-start'] { flex-direction: row-reverse; }
        .pane[data-resize-edge='inline-end'] { flex-direction: row; }

        .pane[data-resize-edge] > slot {
            display: block;
            flex: 1;
            min-block-size: 0;
            min-inline-size: 0;
            overflow: auto;
        }

        .floating-handle {
            display: grid;
            place-items: center;
            flex: 0 0 var(--_handle-min-touch-inline-size);
            touch-action: none;
            user-select: none;
            cursor: row-resize;
        }

        .floating-handle[aria-orientation='vertical'] { cursor: col-resize; }

        .handle-visual {
            display: grid;
            place-items: center;
            grid-area: 1 / 1;
            pointer-events: none;
        }

        .default-grip {
            inline-size: var(--_handle-block-size);
            block-size: var(--_handle-inline-size);
            border-radius: calc(var(--_handle-inline-size) / 2);
            background: var(--_enabled-handle-color);
        }

        :is(.splitter, .floating-handle[aria-orientation='vertical']) .default-grip {
            inline-size: var(--_handle-inline-size);
            block-size: var(--_handle-block-size);
        }

        :is(.splitter, .floating-handle):hover .default-grip { background: var(--_hovered-handle-color); }
        :is(.splitter, .floating-handle):is(:active, :focus-visible) .default-grip { background: var(--_pressed-handle-color); }

        .splitter {
            position: relative;
            z-index: 1;
            cursor: col-resize;
            touch-action: none;
            user-select: none;
            display: grid;
            place-items: center;
            justify-self: center;
            inline-size: max(100%, var(--_handle-min-touch-inline-size));
        }

        .splitter::before {
            content: '';
            grid-area: 1 / 1;
        }

        .splitter[data-collapsed='start'] { justify-self: start; }
        .splitter[data-collapsed='end'] { justify-self: end; }
        .splitter[inert] { z-index: 0; }

        .splitter::before {
            inline-size: 1px;
            block-size: 100%;
            background: var(--_enabled-separator-color);
        }

        .splitter:is(:hover, :active)::before {
            inline-size: 3px;
            background: var(--_hovered-separator-color);
        }

        :is(.splitter, .floating-handle):focus-visible {
            outline: 2px solid var(--_focused-separator-color);
            outline-offset: -2px;
        }

        [hidden] { display: none; }

        @media (prefers-reduced-motion: no-preference) {
            .animated:has([data-moving-pane]) { overflow: clip; }

            .animated .pane {
                transition: opacity var(--_pane-motion-duration), translate var(--_pane-motion-duration),
                    clip-path var(--_pane-motion-duration), display var(--_pane-motion-duration) allow-discrete;
            }

            .animated .pane[hidden] { opacity: 0; }
            .animated .pane[hidden]:not([data-pane-exit]) { transition: none; }
            .animated .pane[data-custom-enter]:not([hidden]) { transition: none; }
            .animated .pane[data-custom-exit][hidden] {
                display: block;
                opacity: 1;
                transition: none;
            }

            .animated .pane[hidden][data-pane-exit] {
                position: absolute;
                box-sizing: border-box;
                grid-area: auto;
                margin: 0;
                left: var(--_exit-left);
                top: var(--_exit-top);
                width: var(--_exit-width);
                height: var(--_exit-height);
                pointer-events: none;
            }

            .animated .pane[data-moving-pane] { translate: 0px; }
            .animated .pane[data-pane-motion=center] { clip-path: inset(0); }
            .animated .pane[hidden][data-pane-exit][data-moving-pane] {
                display: block;
                opacity: 1;
                transition: none;
            }
            .animated .pane[data-motion-delayed]:not([hidden]) {
                transition-delay: 0s, calc(var(--_pane-motion-duration) / 2), calc(var(--_pane-motion-duration) / 2), 0s;
            }

            @starting-style {
                .animated .pane:not([hidden], [data-custom-enter]) { opacity: 0; }
                .animated .pane[data-moving-pane]:not([hidden]) {
                    opacity: 1;
                    translate: var(--_pane-presence-translate);
                }
                .animated .pane[data-pane-motion=center]:not([hidden]) { clip-path: inset(0 50%); }
            }

            .grid.previewing .pane { transition: none; }

            .pane[data-preview-only] {
                position: absolute;
                grid-area: auto;
                box-sizing: border-box;
                margin: 0;
                left: var(--_preview-left);
                top: var(--_preview-top);
                width: var(--_preview-width);
                height: var(--_preview-height);
                pointer-events: none;
                z-index: 1;
            }

            .pane[data-preview-transform] {
                transform-origin: top left;
                transform: var(--_preview-transform);
            }

            .pane[data-preview-levitated] {
                z-index: 1;
                background: var(--_enabled-levitated-container-color);
                color: var(--_enabled-levitated-content-color);
            }
        }

        @media (prefers-contrast: more) {
            .pane[data-alignment] { outline: 2px solid var(--_hovered-separator-color); outline-offset: -2px; }
            .splitter::before {
                inline-size: 3px;
                background: var(--_hovered-separator-color);
            }
        }

        @media (prefers-contrast: less) {
            .splitter:hover::before {
                inline-size: 2px;
            }
        }

        @media (forced-colors: active) {
            .pane[data-alignment] { outline: 1px solid CanvasText; outline-offset: -1px; }
            .splitter::before { background: CanvasText; }
            .default-grip { background: CanvasText; }
            .splitter:is(:hover, :active, :focus-visible)::before { background: Highlight; }
            :is(.splitter, .floating-handle):is(:hover, :active, :focus-visible) .default-grip { background: Highlight; }
            :is(.splitter, .floating-handle):focus-visible { outline-color: Highlight; }
        }

        @media (prefers-reduced-transparency: reduce) {
            .default-scrim { opacity: 1; }
        }
    }
`

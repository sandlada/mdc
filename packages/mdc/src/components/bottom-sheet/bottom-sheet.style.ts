/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'
import type { ElevationDefinition } from '../../component-definitions/elevation.definition'
import {
    ModalBottomSheetDefinition,
    StandardBottomSheetDefinition,
} from '../../component-definitions/bottom-sheet.definition'
import { overrideComponentTokens, stringTokens } from '../../utils/tokens'

const standardTokenRecord = defineTokenRefsRecord(StandardBottomSheetDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-bottom-sheet',
})
const standardTokenString = unsafeCSS(
    defineVars(standardTokenRecord, true).join('')
)

const modalTokenRecord = defineTokenRefsRecord(ModalBottomSheetDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-bottom-sheet',
})
const modalTokenString = unsafeCSS(
    defineVars(modalTokenRecord, true).join('')
)

const standardTokens = css`
    dialog.standard {${standardTokenString};}
`

const modalTokens = css`
    dialog.modal {${modalTokenString};}
`

const getElevationStyles = () => {
    const styles = stringTokens(
        overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', {
            'enabled-level': `var(--_enabled-container-elevation)`,
            'enabled-shadow-color': `var(--_container-shadow-color)`,
        })
    )
    return css`
        .container > mdc-elevation {
            ${styles};
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            z-index: 0;
        }
    `
}

export const bottomSheetBaseStyles = css`
    :host {
        position: fixed;
        inset: 0;
        pointer-events: none;
        background: transparent;
        color: inherit;
        z-index: 1000;
        isolation: isolate;
    }

    dialog {
        display: block !important;
        position: fixed;
        inset: 0;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        max-width: none;
        max-height: none;
        margin: 0;
        padding: 0;
        border: 0;
        outline: none;
        overflow: hidden;
        background: transparent;
        color: currentColor;
        pointer-events: none;
    }

    dialog::backdrop { display: none; }

    /* Scrim */
    .scrim {
        position: absolute;
        inset: 0;
        background: var(--_enabled-container-color-modal);
        opacity: 0;
        pointer-events: none;
        z-index: 0;
    }

    dialog.standard .scrim {
        display: none !important;
    }

    :host([open]) dialog.modal .scrim {
        opacity: var(--_enabled-container-opacity-modal);
        pointer-events: auto;
    }

    /* Container */
    .container {
        position: absolute;
        inset-inline: 0;
        bottom: 0;
        width: 100%;
        max-height: var(--_enabled-container-max-height-peek);
        background: var(--_enabled-container-color);
        color: inherit;
        display: flex;
        flex-direction: column;

        border-start-start-radius: var(--_enabled-container-shape-start-start);
        border-start-end-radius: var(--_enabled-container-shape-start-end);
        border-end-start-radius: var(--_enabled-container-shape-end-start);
        border-end-end-radius: var(--_enabled-container-shape-end-end);
        transition: border-radius 200ms cubic-bezier(0.2, 0, 0, 1);

        transform: translateY(100%);
        pointer-events: auto;
        z-index: 1;
        will-change: transform;
        touch-action: pan-y;
    }

    :host([dragged-upward]) .container,
    .host.dragged-upward .container {
        border-start-start-radius: var(--_dragged-container-shape-start-start);
        border-start-end-radius: var(--_dragged-container-shape-start-end);
        border-end-start-radius: var(--_dragged-container-shape-end-start);
        border-end-end-radius: var(--_dragged-container-shape-end-end);
    }

    @media (min-width: 641px) {
        .container {
            inset-inline: 56px;
            max-width: 640px;
            margin-inline: auto;
        }
        dialog.detent-full .container {
            max-height: min(
                var(--_enabled-container-max-height-full),
                calc(100vh - 56px)
            );
        }
    }

    dialog:not([open]) {
        display: none !important;
    }

    :host([open]) .container {
        transform: translateY(0);
    }

    dialog.detent-full .container {
        max-height: min(
            var(--_enabled-container-max-height-full),
            calc(100vh - 72px)
        );
    }

    dialog.detent-peek .container {
        max-height: var(--_enabled-container-max-height-peek);
    }

    :host([touch-action='none']) .container {
        transition: border-radius 200ms cubic-bezier(0.2, 0, 0, 1);
    }

    /* Drag handle */
    .drag-handle {
        display: flex;
        justify-content: center;
        align-items: center;
        padding-block-start: var(--_drag-handle-container-padding-block-start);
        padding-block-end: var(--_drag-handle-container-padding-block-end);
        flex-shrink: 0;
        cursor: grab;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
    }

    .drag-handle-bar {
        width: var(--_drag-handle-width);
        height: var(--_drag-handle-height);
        border-radius: var(--_drag-handle-shape);
        background: var(--_enabled-drag-handle-color);
    }

    .drag-handle-hidden .drag-handle-bar {
        visibility: hidden;
    }

    :host([touch-action='none']) .drag-handle {
        cursor: grabbing;
    }

    /* Header */
    .header {
        flex-shrink: 0;
        padding-inline-start: var(--_header-container-padding-inline-start);
        padding-inline-end: var(--_header-container-padding-inline-end);
        padding-block-start: var(--_header-container-padding-block-start);
        padding-block-end: var(--_header-container-padding-block-end);
    }

    .host:not(.has-header) .header {
        display: none;
    }

    /* Content */
    .content {
        flex: 1 1 auto;
        overflow-y: auto;
        padding-inline-start: var(--_content-container-padding-inline-start);
        padding-inline-end: var(--_content-container-padding-inline-end);
        padding-block-start: var(--_content-container-padding-block-start);
        padding-block-end: var(--_content-container-padding-block-end);
        min-height: 0;
    }

    .host:not(.has-content) .content {
        display: none;
    }

    dialog.detent-peek .content {
        display: none;
    }

    .drag-handle,
    .header,
    .content {
        position: relative;
        z-index: 1;
    }

    /* Focus traps */
    .focus-trap {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
        outline: none;
    }

    .focus-trap-first { inset-block-start: 0; inset-inline-start: 0; }
    .focus-trap-last  { inset-block-end: 0; inset-inline-end: 0; }
`

export const bottomSheetStyles = [
    bottomSheetBaseStyles,
    standardTokens,
    modalTokens,
    getElevationStyles(),
]

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'
import type { ElevationDefinition } from '../../component-definitions/elevation.definition'
import {
    ModalSideSheetDefinition,
    StandardSideSheetDefinition,
} from '../../component-definitions/side-sheet.definition'
import { overrideComponentTokens, stringTokens } from '../../utils/tokens'

const standardTokenRecord = defineTokenRefsRecord(StandardSideSheetDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-side-sheet',
})
const standardTokenString = unsafeCSS(
    defineVars(standardTokenRecord, true).join('')
)

const modalTokenRecord = defineTokenRefsRecord(ModalSideSheetDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-side-sheet',
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

export const sideSheetBaseStyles = css`
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
        color: var(--_enabled-headline-color);
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
        top: 0;
        bottom: 0;
        inset-inline-end: 0;
        width: min(
            var(--_enabled-container-width),
            100%
        );
        max-width: var(--_container-max-width, 100%);
        background: var(--_enabled-container-color);
        color: inherit;
        display: flex;
        flex-direction: column;

        border-start-start-radius: var(--_enabled-container-shape-start-start);
        border-end-start-radius: var(--_enabled-container-shape-end-start);
        border-start-end-radius: var(--_enabled-container-shape-start-end);
        border-end-end-radius: var(--_enabled-container-shape-end-end);
        transition: border-radius 200ms cubic-bezier(0.2, 0, 0, 1);

        transform: translateX(100%);
        pointer-events: auto;
        z-index: 1;
        will-change: transform;
        touch-action: pan-x;
    }

    :host([dragged]) .container,
    .host.dragged .container {
        border-start-start-radius: var(--_dragged-container-shape-start-start);
        border-end-start-radius: var(--_dragged-container-shape-end-start);
        border-start-end-radius: var(--_dragged-container-shape-start-end);
        border-end-end-radius: var(--_dragged-container-shape-end-end);
    }

    dialog:not([open]) {
        display: none !important;
    }

    :host([open]) .container {
        transform: translateX(0);
    }

    /* sheet-edge=start */
    dialog.edge-start .container {
        inset-inline-end: auto;
        inset-inline-start: 0;
        border-start-start-radius: var(--_enabled-container-shape-start-end);
        border-end-start-radius: var(--_enabled-container-shape-end-end);
        border-start-end-radius: var(--_enabled-container-shape-start-start);
        border-end-end-radius: var(--_enabled-container-shape-end-start);
        transform: translateX(-100%);
    }

    :host([open]) dialog.edge-start .container {
        transform: translateX(0);
    }

    :host([touch-action='none']) .container {
        transition: border-radius 200ms cubic-bezier(0.2, 0, 0, 1);
    }

    /* Elevation */
    .container > mdc-elevation {
        --mdc-elevation-enabled-level: var(--_enabled-container-elevation);
        --mdc-elevation-enabled-shadow-color: var(--_container-shadow-color);
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        z-index: 0;
    }

    .headline,
    mdc-divider,
    .content,
    .actions {
        position: relative;
        z-index: 1;
    }

    /* Headline row */
    .headline {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-inline-start: var(--_headline-container-inline-leading-padding-space);
        padding-inline-end: var(--_headline-container-inline-trailing-padding-space);
        padding-block-start: var(--_headline-container-block-leading-padding-space);
        padding-block-end: var(--_headline-container-block-trailing-padding-space);
        min-height: 56px;
        color: var(--_enabled-headline-color);
        user-select: none;
        -webkit-user-select: none;
    }

    dialog.has-back-icon .headline,
    dialog.show-back-button .headline {
        padding-inline-start: var(--_headline-icon-container-inline-leading-padding-space);
    }

    .headline-label {
        flex: 1;
        margin: 0;
        font-family: var(--_enabled-headline-font);
        font-size: var(--_enabled-headline-size);
        font-weight: var(--_enabled-headline-weight);
        line-height: var(--_enabled-headline-line-height);
        letter-spacing: var(--_enabled-headline-tracking);
    }

    .headline-icon,
    .close-icon {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        cursor: pointer;
        color: inherit;
        border-radius: 50%;
        transition: background-color 150ms cubic-bezier(0.2, 0, 0, 1);
    }

    .headline-icon:hover,
    .close-icon:hover {
        background-color: var(--_hovered-icon-container-color);
    }

    .headline-icon:active,
    .close-icon:active {
        background-color: var(--_pressed-icon-container-color);
    }

    .headline-icon {
        color: var(--_enabled-headline-icon-color);
    }

    .close-icon {
        color: var(--_enabled-close-icon-color);
    }

    /* Dividers */
    mdc-divider {
        --mdc-divider-enabled-color: var(--_enabled-divider-color);
    }

    /* Content */
    .content {
        flex: 1 1 auto;
        overflow-y: auto;
        padding-inline-start: var(--_content-container-inline-leading-padding-space);
        padding-inline-end: var(--_content-container-inline-trailing-padding-space);
        padding-block-start: var(--_content-container-block-leading-padding-space);
        padding-block-end: var(--_content-container-block-trailing-padding-space);
        min-height: 0;
    }

    /* Actions */
    .actions {
        flex-shrink: 0;
        padding-block-start: var(--_actions-container-block-leading-padding-space);
        padding-block-end: var(--_actions-container-block-trailing-padding-space);
        min-height: var(--_actions-container-height);
    }

    .actions[hidden] { display: none; }

    .actions-row {
        display: flex;
        gap: 8px;
        align-items: center;
        padding-inline-start: var(--_content-container-inline-leading-padding-space);
        padding-inline-end: var(--_content-container-inline-trailing-padding-space);
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

export const sideSheetStyles = [
    sideSheetBaseStyles,
    standardTokens,
    modalTokens,
    getElevationStyles(),
]
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'

export const baseSideSheetStyles = css`
    :host {
        position: fixed;
        inset: 0;
        pointer-events: none;
        background: transparent;
        color: var(--mdc-side-sheet-enabled-headline-color, currentColor);
        z-index: 1000;
        isolation: isolate; /* keep scrim + container stacked without bleed */
    }

    :host([open]) { pointer-events: auto; }

    /* ─── Scrim (modal only — visible at runtime when variant is modal and open) ─── */
    .scrim {
        position: absolute;
        inset: 0;
        background: var(--mdc-side-sheet-enabled-container-color-modal, #000);
        opacity: 0;
        pointer-events: none;
        transition-property: opacity;
        transition-duration: var(--mdc-side-sheet-container-motion-duration, 250ms);
        transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
        z-index: 0;
    }

    :host(.modal[open]) .scrim {
        opacity: var(--mdc-side-sheet-enabled-container-opacity-modal, 0.32);
        pointer-events: auto;
    }

    /* ─── Container ─── */
    .container {
        position: absolute;
        top: 0;
        bottom: 0;
        inset-inline-end: 0;
        width: min(
            var(--mdc-side-sheet-enabled-container-width, 400px),
            100%
        );
        background: var(--mdc-side-sheet-enabled-container-color, #fff);
        color: inherit;
        display: flex;
        flex-direction: column;
        box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.15);

        /* The sheet edge that touches the viewport is straight; the
         * opposite edge is the rounded exterior corner. Sheet-edges are
         * defined relative to inline-end (the default below). */
        border-start-start-radius: var(
            --mdc-side-sheet-container-shape-start-start,
            28px
        );
        border-end-start-radius: var(
            --mdc-side-sheet-container-shape-end-start,
            28px
        );

        transform: translateX(100%);
        transition-property: transform;
        transition-duration: var(--mdc-side-sheet-container-motion-duration, 250ms);
        transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
        pointer-events: auto;
        will-change: transform, opacity;
        z-index: 1;
    }

    :host(.open) .container {
        transform: translateX(0);
    }

    /* sheet-edge=start: anchor to inline-start, flip rounded corners. */
    :host(.edge-start) .container {
        inset-inline-end: auto;
        inset-inline-start: 0;
        border-start-start-radius: 0;
        border-end-start-radius: 0;
        border-start-end-radius: var(
            --mdc-side-sheet-container-shape-start-end,
            28px
        );
        border-end-end-radius: var(
            --mdc-side-sheet-container-shape-end-end,
            28px
        );
        transform: translateX(-100%);
    }

    :host(.edge-start.open) .container {
        transform: translateX(0);
    }

    /* Quick mode: no transitions. */
    :host(.quick) .container,
    :host(.quick.open) .container,
    :host(.quick) .scrim {
        transition: none;
    }

    /* ─── Headline row ─── */
    .headline {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-inline-start: var(
            --mdc-side-sheet-headline-container-inline-leading-padding-space,
            24px
        );
        padding-inline-end: var(
            --mdc-side-sheet-headline-container-inline-trailing-padding-space,
            12px
        );
        padding-block-start: var(
            --mdc-side-sheet-headline-container-block-leading-padding-space,
            24px
        );
        padding-block-end: var(
            --mdc-side-sheet-headline-container-block-trailing-padding-space,
            12px
        );
        min-height: 56px;
        color: var(--mdc-side-sheet-enabled-headline-color, currentColor);
    }

    :host(.has-back-icon) .headline,
    :host(.show-back-button) .headline {
        padding-inline-start: var(
            --mdc-side-sheet-headline-icon-container-inline-leading-padding-space,
            16px
        );
    }

    .headline-label {
        flex: 1;
        margin: 0;
        font-family: var(--mdc-typescale-title-small-font, system-ui);
        font-size: var(--mdc-typescale-title-small-size, 14px);
        font-weight: var(--mdc-typescale-title-small-weight, 500);
        line-height: var(--mdc-typescale-title-small-line-height, 20px);
        letter-spacing: var(--mdc-typescale-title-small-tracking, 0.1px);
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
    }

    .headline-icon {
        color: var(--mdc-side-sheet-enabled-headline-icon-color, currentColor);
    }

    .close-icon {
        color: var(--mdc-side-sheet-enabled-close-icon-color, currentColor);
    }

    /* ─── Dividers ─── */
    mdc-divider {
        --mdc-divider-enabled-color: var(--mdc-side-sheet-enabled-divider-color, currentColor);
    }

    /* ─── Content ─── */
    .content {
        flex: 1 1 auto;
        overflow-y: auto;
        padding-inline-start: var(
            --mdc-side-sheet-content-container-inline-leading-padding-space,
            24px
        );
        padding-inline-end: var(
            --mdc-side-sheet-content-container-inline-trailing-padding-space,
            24px
        );
        padding-block-start: var(
            --mdc-side-sheet-content-container-block-leading-padding-space,
            16px
        );
        padding-block-end: var(
            --mdc-side-sheet-content-container-block-trailing-padding-space,
            24px
        );
        min-height: 0; /* flex child can shrink for overflow */
    }

    /* ─── Actions ─── */
    .actions {
        flex-shrink: 0;
        padding-block-start: var(
            --mdc-side-sheet-actions-container-block-leading-padding-space,
            16px
        );
        padding-block-end: var(
            --mdc-side-sheet-actions-container-block-trailing-padding-space,
            24px
        );
        min-height: var(
            --mdc-side-sheet-actions-container-height,
            72px
        );
    }

    .actions[hidden] { display: none; }

    .actions-row {
        display: flex;
        gap: 8px;
        align-items: center;
        padding-inline-start: var(
            --mdc-side-sheet-content-container-inline-leading-padding-space,
            24px
        );
        padding-inline-end: var(
            --mdc-side-sheet-content-container-inline-trailing-padding-space,
            24px
        );
    }

    /* ─── Focus traps (forwarded to Task 6) ─── */
    .focus-trap {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
    }

    .focus-trap-first { inset-block-start: 0; inset-inline-start: 0; }
    .focus-trap-last  { inset-block-end: 0; inset-inline-end: 0; }

    /* Keep focus traps out of layout flow. */
    .focus-trap { outline: none; }
`
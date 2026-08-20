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
        /* Never auto: the host spans the whole viewport, so an interactive
         * host would swallow every click on the page. The panel and the modal
         * scrim opt back in individually. */
        pointer-events: none;
        background: transparent;
        color: inherit;
        z-index: 1000;
        isolation: isolate;
    }

    /*
     * The UA stylesheet lays a <dialog> out as a centred, fit-content box
     * (position: absolute; inset-inline: 0; width/height: fit-content;
     * margin: auto; border: solid; padding: 1em). For :modal it additionally
     * caps at calc(100% - 6px - 2em) and sets overflow: auto.
     *
     * Override every one of those so the dialog is a transparent, inert,
     * full-viewport stage. Only then does the container rule below
     * (position: absolute; top/bottom/inset-inline-end: 0) resolve against
     * the viewport instead of a small centred box.
     *
     * display: block !important additionally defeats
     * dialog:not([open]) { display: none } so the element stays rendered
     * while the slide-out transition plays; JS calls dialog.close() at
     * transitionend.
     *
     * color picks up the variant headline-color token declared on
     * dialog.standard / dialog.modal in side-sheet.style.ts. The token is
     * not visible on :host, only on the dialog itself, so var() is read here.
     */
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
        /* Closed container sits at translateX(100%); UA overflow: auto would
         * add scrollable overflow to that transformed box. */
        overflow: hidden;
        background: transparent;
        color: var(--_enabled-headline-color, currentColor);
        pointer-events: none;
    }

    /* Hide the native ::backdrop — the side-sheet uses a custom scrim. */
    dialog::backdrop { display: none; }

    /* ─── Scrim (modal only — visible at runtime when variant is modal and open) ─── */
    /*
     * Opacity is animated by WAAPI via SideSheetDefaultOpenAnimation /
     * SideSheetDefaultCloseAnimation (see side-sheet.animation.ts). CSS
     * transitions were removed: a cancelled transition never fires
     * the transitionend event, which caused the rapid-toggle stuck-state bug.
     */
    .scrim {
        position: absolute;
        inset: 0;
        background: var(--_enabled-container-color-modal, #000);
        opacity: 0;
        pointer-events: none;
        z-index: 0;
    }

    :host([open]) dialog.modal .scrim {
        opacity: var(--_enabled-container-opacity-modal, 0.32);
        pointer-events: auto;
    }

    /* ─── Container ─── */
    .container {
        position: absolute;
        top: 0;
        bottom: 0;
        inset-inline-end: 0;
        width: min(
            var(--_enabled-container-width, 400px),
            100%
        );
        max-width: var(--_container-max-width, 100%);
        background: var(--_enabled-container-color, #fff);
        color: inherit;
        display: flex;
        flex-direction: column;
        box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.15);

        /* The sheet edge that touches the viewport is straight; the
         * opposite edge is the rounded exterior corner. Sheet-edges are
         * defined relative to inline-end (the default below). */
        border-start-start-radius: var(
            --_container-shape-start-start,
            28px
        );
        border-end-start-radius: var(
            --_container-shape-end-start,
            28px
        );

        transform: translateX(100%);
        /* transform is animated by WAAPI (see side-sheet.animation.ts). */
        pointer-events: auto;
        z-index: 1;
    }

    /*
     * Suppress the box-shadow once the dialog has left the top layer.
     *
     * The closed container sits at translateX(100%) — its box is fully
     * off-screen right — but its 16px box-shadow blur bleeds 16px back
     * INSIDE the dialog content box (which is full-viewport with
     * overflow: hidden). That sliver is visible at the right edge of
     * the viewport even though the container itself is gone.
     *
     * The native dialog element keeps its [open] attribute while the
     * slide-out transition runs (closeDialog() is deferred to
     * transitionend), so the shadow stays painted during the exit
     * animation and disappears the instant the dialog is closed.
     */
    dialog:not([open]) .container {
        box-shadow: none;
    }

    :host([open]) .container {
        transform: translateX(0);
    }

    /* sheet-edge=start: anchor to inline-start, flip rounded corners. */
    dialog.edge-start .container {
        inset-inline-end: auto;
        inset-inline-start: 0;
        border-start-start-radius: 0;
        border-end-start-radius: 0;
        border-start-end-radius: var(
            --_container-shape-start-end,
            28px
        );
        border-end-end-radius: var(
            --_container-shape-end-end,
            28px
        );
        transform: translateX(-100%);
    }

    :host([open]) dialog.edge-start .container {
        transform: translateX(0);
    }

    /* Quick mode is handled in JS — animateSideSheet returns early when
     * 'quick' is true, so no WAAPI Animation is ever started. The static
     * :host([open]) rules above apply immediately. */

    /* ─── Headline row ─── */
    .headline {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-inline-start: var(
            --_headline-container-inline-leading-padding-space,
            24px
        );
        padding-inline-end: var(
            --_headline-container-inline-trailing-padding-space,
            12px
        );
        padding-block-start: var(
            --_headline-container-block-leading-padding-space,
            24px
        );
        padding-block-end: var(
            --_headline-container-block-trailing-padding-space,
            12px
        );
        min-height: 56px;
        color: var(--_enabled-headline-color, currentColor);
    }

    dialog.has-back-icon .headline,
    dialog.show-back-button .headline {
        padding-inline-start: var(
            --_headline-icon-container-inline-leading-padding-space,
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
        color: var(--_enabled-headline-icon-color, currentColor);
    }

    .close-icon {
        color: var(--_enabled-close-icon-color, currentColor);
    }

    /* ─── Dividers ─── */
    mdc-divider {
        --mdc-divider-enabled-color: var(--_enabled-divider-color, currentColor);
    }

    /* ─── Content ─── */
    .content {
        flex: 1 1 auto;
        overflow-y: auto;
        padding-inline-start: var(
            --_content-container-inline-leading-padding-space,
            24px
        );
        padding-inline-end: var(
            --_content-container-inline-trailing-padding-space,
            24px
        );
        padding-block-start: var(
            --_content-container-block-leading-padding-space,
            16px
        );
        padding-block-end: var(
            --_content-container-block-trailing-padding-space,
            24px
        );
        min-height: 0; /* flex child can shrink for overflow */
    }

    /* ─── Actions ─── */
    .actions {
        flex-shrink: 0;
        padding-block-start: var(
            --_actions-container-block-leading-padding-space,
            16px
        );
        padding-block-end: var(
            --_actions-container-block-trailing-padding-space,
            24px
        );
        min-height: var(
            --_actions-container-height,
            72px
        );
    }

    .actions[hidden] { display: none; }

    .actions-row {
        display: flex;
        gap: 8px;
        align-items: center;
        padding-inline-start: var(
            --_content-container-inline-leading-padding-space,
            24px
        );
        padding-inline-end: var(
            --_content-container-inline-trailing-padding-space,
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
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'

export const baseBottomSheetStyles = css`
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
     * The UA stylesheet lays a <dialog> out as a centred, fit-content box.
     * Override every one of those so the dialog is a transparent, inert,
     * full-viewport stage. Only then does the container rule below
     * (position: absolute; bottom: 0; inset-inline: 0) resolve against
     * the viewport instead of a small centred box.
     *
     * display: block !important additionally defeats
     * dialog:not([open]) { display: none } so the element stays rendered
     * while the slide-out transition plays; JS calls dialog.close() after
     * the close animation settles.
     *
     * color picks up the variant surface-color token declared on
     * dialog.standard / dialog.modal in bottom-sheet.style.ts. The token is
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
        overflow: hidden;
        background: transparent;
        color: currentColor;
        pointer-events: none;
    }

    /* Hide the native ::backdrop — the bottom-sheet uses a custom scrim. */
    dialog::backdrop { display: none; }

    /* ─── Scrim (modal only — visible at runtime when variant is modal and open) ─── */
    /*
     * Opacity is animated by WAAPI via BottomSheetDefaultOpenAnimation /
     * BottomSheetDefaultCloseAnimation (see bottom-sheet.animation.ts). CSS
     * transitions were avoided: a cancelled transition never fires
     * the transitionend event, which caused the rapid-toggle stuck-state bug
     * that side-sheet also documented.
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

    /* ─── Container ───
     *
     * MD3 measurement (per docs/overviews/bottom-sheet/measurement.png):
     *   - Window ≤ 640dp (default rule below):
     *       full width, 72dp top margin
     *   - Window > 640dp (media query below):
     *       56dp side margins, 56dp top margin, max 640dp wide, centered
     *
     * The container is bottom-anchored (bottom: 0); the top is set with
     * a top rule for narrow viewports and overridden inside the media
     * query for wide ones.
     *
     * detent controls max-height (peek 40vh, full 96vh) — see bottom of file.
     */
    .container {
        position: absolute;
        inset-inline: 0;
        top: 72px;
        bottom: 0;
        width: 100%;
        max-height: var(
            --_enabled-container-max-height-peek,
            40vh
        );
        background: var(--_enabled-container-color, #fff);
        color: inherit;
        display: flex;
        flex-direction: column;
        box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.15);

        /* Bottom-anchored sheet: the top edge (toward the viewport) is
         * rounded; the bottom edge is flush against the viewport. */
        border-start-start-radius: var(
            --_container-shape-start-start,
            28px
        );
        border-start-end-radius: var(
            --_container-shape-start-end,
            28px
        );
        border-end-start-radius: 0;
        border-end-end-radius: 0;

        transform: translateY(100%);
        /* transform is animated by WAAPI (see bottom-sheet.animation.ts). */
        pointer-events: auto;
        z-index: 1;
        will-change: transform;
        touch-action: pan-y;
    }

    /*
     * Wide-viewport sizing per the MD3 spec — bottom-sheet centers itself
     * with 56dp side margins and caps at 640dp wide. The peek-detent
     * top: 56px matches the spec's "top margin of 56dp" for windows
     * wider than 640dp.
     */
    @media (min-width: 641px) {
        .container {
            top: 56px;
            inset-inline: 56px;
            max-width: 640px;
            margin-inline: auto;
        }
    }

    /*
     * Suppress the box-shadow once the dialog has left the top layer.
     * The closed container sits at translateY(100%) — its box is fully
     * off-screen below — but its 16px box-shadow blur bleeds 16px back
     * INSIDE the dialog content box. That sliver is visible at the bottom
     * edge of the viewport even though the container itself is gone.
     *
     * The native dialog element keeps its [open] attribute while the
     * slide-out transition runs (closeDialog() is deferred), so the
     * shadow stays painted during the exit animation and disappears the
     * instant the dialog is closed.
     */
    dialog:not([open]) .container {
        box-shadow: none;
    }

    :host([open]) .container {
        transform: translateY(0);
    }

    /* Detent: full */
    dialog.detent-full .container {
        max-height: var(
            --_enabled-container-max-height-full,
            96vh
        );
    }

    /* Detent: peek (default — explicit for clarity) */
    dialog.detent-peek .container {
        max-height: var(
            --_enabled-container-max-height-peek,
            40vh
        );
    }

    /* Quick mode is handled in JS — animateBottomSheet returns early when
     * 'quick' is true, so no WAAPI Animation is ever started. The static
     * :host([open]) rules above apply immediately. */

    /* ─── Drag visual feedback ─── */
    /*
     * During drag, the controller writes transform / opacity inline on
     * .container and .scrim. Suppress the CSS-ruled transitions so the
     * inline writes win instantly (otherwise any future transition rules
     * would compete with the drag's per-frame transform).
     */
    :host([touch-action='none']) .container {
        transition: none;
    }

    /* ─── Drag handle ───
     *
     * The handle is the only swipe-to-dismiss affordance. It is always
     * present in the DOM so consumers can hide-drag-handle to hide the
     * visual bar while keeping swipe functional (pointerdown on the
     * padded region still fires the drag controller).
     *
     * Geometry (per MD3 spec):
     *   - 22dp padding top and bottom around the bar
     *   - 32dp × 4dp centered pill at full width
     *
     * The inner .drag-handle-bar is the only visual element; the outer
     * .drag-handle is the click/touch target (cushions the precise tap
     * point and provides the swipe region when the bar is hidden).
     */
    .drag-handle {
        display: flex;
        justify-content: center;
        align-items: center;
        padding-block-start: var(
            --_drag-handle-container-block-leading-padding-space,
            22px
        );
        padding-block-end: var(
            --_drag-handle-container-block-trailing-padding-space,
            22px
        );
        flex-shrink: 0;
        cursor: grab;
        touch-action: pan-y;
    }

    .drag-handle-bar {
        width: var(--_drag-handle-width, 32px);
        height: var(--_drag-handle-height, 4px);
        border-radius: var(--_drag-handle-shape, 2px);
        background: var(--_enabled-drag-handle-color, currentColor);
    }

    /*
     * Hide the bar visually when hide-drag-handle is set; the outer
     * .drag-handle (with its padding region) stays interactive so swipe
     * still engages from the same screen position.
     */
    .drag-handle-hidden .drag-handle-bar {
        visibility: hidden;
    }

    /*
     * While the drag controller is active it sets the host's
     * touch-action attribute to 'none' and the draggable cursor. Reflect
     * that on the handle.
     */
    :host([touch-action='none']) .drag-handle {
        cursor: grabbing;
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

    /* ─── Focus traps ─── */
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

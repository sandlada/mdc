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

    dialog.standard .scrim {
        display: none !important;
    }

    :host([open]) dialog.modal .scrim {
        opacity: var(--_enabled-container-opacity-modal, 0.32);
        pointer-events: auto;
    }

    /* ─── Container ───
     *
     * MD3 measurement (per docs/overviews/bottom-sheet/measurement.png):
     *   - Window ≤ 640dp (default rule below):
     *       full width, bottom-anchored, 72dp gap at top is natural
     *         (sheet height is well below 100vh − 72dp for any reasonable
     *         viewport on the default peek detent)
     *   - Window > 640dp (media query below):
     *       56dp side margins, max 640dp wide, horizontally centered,
     *         still bottom-anchored. For detent=full, additionally cap
     *         max-height so the top edge has at least 56px of viewport.
     *
     * Positioning notes:
     *   - bottom: 0 keeps the sheet flush against the viewport bottom.
     *   - max-height controls how tall the sheet can grow (peek 40vh,
     *     full see below). Anything taller scrolls inside .content.
     *   - We deliberately DO NOT set a top offset here. Combining both
     *     top and bottom makes the height derive from their
     *     difference, so the max-height clamp would then place the
     *     bottom edge in the middle of the viewport instead of at 0.
     */
    .container {
        position: absolute;
        inset-inline: 0;
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

        /* Bottom-anchored sheet: the top edge (toward the viewport) is
         * rounded; the bottom edge is flush against the viewport by default.
         * Border radius transitions smoothly over 200ms. */
        border-start-start-radius: var(
            --_enabled-container-shape-start-start,
            var(--_container-shape-start-start, 28px)
        );
        border-start-end-radius: var(
            --_enabled-container-shape-start-end,
            var(--_container-shape-start-end, 28px)
        );
        border-end-start-radius: var(
            --_enabled-container-shape-end-start,
            var(--_container-shape-end-start, 0)
        );
        border-end-end-radius: var(
            --_enabled-container-shape-end-end,
            var(--_container-shape-end-end, 0)
        );
        transition: border-radius 200ms cubic-bezier(0.2, 0, 0, 1);

        transform: translateY(100%);
        /* transform is animated by WAAPI (see bottom-sheet.animation.ts). */
        pointer-events: auto;
        z-index: 1;
        will-change: transform;
        touch-action: pan-y;
    }

    /*
     * When dragging upward off the viewport bottom, round the bottom two corners
     * to match the top corners (dragged state).
     */
    :host([dragged-upward]) .container,
    .host.dragged-upward .container {
        border-start-start-radius: var(
            --_dragged-container-shape-start-start,
            var(--_enabled-container-shape-start-start, var(--_container-shape-start-start, 28px))
        );
        border-start-end-radius: var(
            --_dragged-container-shape-start-end,
            var(--_enabled-container-shape-start-end, var(--_container-shape-start-end, 28px))
        );
        border-end-start-radius: var(
            --_dragged-container-shape-end-start,
            var(--_enabled-container-shape-start-start, var(--_container-shape-start-start, 28px))
        );
        border-end-end-radius: var(
            --_dragged-container-shape-end-end,
            var(--_enabled-container-shape-start-end, var(--_container-shape-start-end, 28px))
        );
    }

    /*
     * Wide-viewport sizing per the MD3 spec — bottom-sheet centers itself
     * with 56dp side margins and caps at 640dp wide. The sheet remains
     * bottom-anchored; only inset-inline, max-width, and the detent-full
     * top-margin clamp (≥56dp) change here.
     */
    @media (min-width: 641px) {
        .container {
            inset-inline: 56px;
            max-width: 640px;
            margin-inline: auto;
        }
        /* Wide-viewport detent-full: tighten the top-margin clamp to ≥56dp. */
        dialog.detent-full .container {
            max-height: min(
                var(--_enabled-container-max-height-full, 96vh),
                calc(100vh - 56px)
            );
        }
    }

    /*
     * Suppress the container and elevation once the dialog has left the top layer.
     * The closed container sits at translateY(100%) — its box is fully
     * off-screen below — but its elevation shadow blur bleeds back
     * INSIDE the dialog content box.
     *
     * When closed (dialog:not([open])), hide the dialog and its elements entirely
     * so zero shadow bleeds into the viewport.
     */
    dialog:not([open]) {
        display: none !important;
    }

    :host([open]) .container {
        transform: translateY(0);
    }

    /* Detent: full — clamps to the smaller of the token value and the
     * viewport-aware spec gap (≥72dp narrow / ≥56dp wide). Without this
     * the sheet would eat into the top margin when the token's 96vh is
     * larger than (100vh − gap). */
    dialog.detent-full .container {
        max-height: min(
            var(--_enabled-container-max-height-full, 96vh),
            calc(100vh - 72px)
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
        /* Preserve border-radius animation while transform is updated directly */
        transition: border-radius 200ms cubic-bezier(0.2, 0, 0, 1);
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
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
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

    /* ─── Header (upper slot) ─── */
    .header {
        flex-shrink: 0;
        padding-inline-start: var(
            --_header-container-inline-leading-padding-space,
            var(--_content-container-inline-leading-padding-space, 24px)
        );
        padding-inline-end: var(
            --_header-container-inline-trailing-padding-space,
            var(--_content-container-inline-trailing-padding-space, 24px)
        );
        padding-block-start: var(
            --_header-container-block-leading-padding-space,
            0px
        );
        padding-block-end: var(
            --_header-container-block-trailing-padding-space,
            16px
        );
    }

    .host:not(.has-header) .header {
        display: none;
    }

    /* ─── Content (lower slot / body) ─── */
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

    .host:not(.has-content) .content {
        display: none;
    }

    /* In peek detent: hide the lower content slot so only header (and drag handle) are displayed */
    dialog.detent-peek .content {
        display: none;
    }

    .drag-handle,
    .header,
    .content {
        position: relative;
        z-index: 1;
    }

    /* ─── Elevation ─── */
    .container > mdc-elevation {
        --mdc-elevation-level: var(--_enabled-container-elevation, 1);
        --mdc-elevation-shadow-color: var(--_container-shadow-color, rgba(0, 0, 0, 0.15));
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        z-index: 0;
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

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { Easing } from '@sandlada/mdk'
import type { ElevationDefinition } from '../elevation/elevation.definition'
import {
    ModalSideSheetDefinition,
    StandardSideSheetDefinition,
} from './side-sheet.definition'
import { overrideTokens, stringifyTokens } from '../../utils/style'

const standardTokenString = stringifyTokens('--mdc-side-sheet')(StandardSideSheetDefinition)

const modalTokenString = stringifyTokens('--mdc-side-sheet')(ModalSideSheetDefinition)

const standardTokens = css`
    dialog.standard {${standardTokenString};}
`

const modalTokens = css`
    dialog.modal {${modalTokenString};}
`

const emphasizedEasing = unsafeCSS(Easing.Emphasized.ToCSSValue())
const emphasizedAccelerateEasing = unsafeCSS(Easing.EmphasizedAccelerate.ToCSSValue())

const getElevationStyles = () => {
    const styles = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
        'enabled-level': `var(--_enabled-container-elevation)`,
        'enabled-shadow-color': `var(--_container-shadow-color)`,
    })()
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
        display: block;
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
        /* Closed state: the exit transition animates towards display none.
        allow-discrete keeps the dialog rendered until it ends. */
        transition:
            display 150ms allow-discrete,
            overlay 150ms allow-discrete;
    }

    dialog[open] {
        transition:
            display 500ms allow-discrete,
            overlay 500ms allow-discrete;
    }

    dialog:not([open]) { display: none; }

    dialog::backdrop { display: none; }

    /*
     * The scrim renders permanently as a dialog descendant (state derived
     * from the native dialog[open], mirroring the dialog component) and
     * toggles via display + allow-discrete — the modern alternative to
     * the dialog's visibility trick, valid here because the scrim lives
     * inside the dialog subtree. Base rules stay scoped under dialog:
     * Chrome only honors the starting styles of newly rendered shadow
     * descendants when their matching base rules are scoped to the dialog
     * element; bare class selectors snap straight to the open values.
     */
    dialog .scrim {
        display: none;
        position: absolute;
        inset: 0;
        background: var(--_enabled-container-color-modal);
        opacity: 0;
        pointer-events: none;
        z-index: 0;
        transition:
            display 150ms allow-discrete,
            opacity 150ms linear;
    }

    dialog.modal.open .scrim {
        display: block;
        opacity: var(--_enabled-container-opacity-modal);
        pointer-events: auto;
        transition:
            display 500ms allow-discrete,
            opacity 500ms linear;
    }

    dialog.standard .scrim {
        display: none !important;
    }

    /* Container. Base rule scoped under dialog — see the scrim note on
    why the starting styles need this on first render. Transform offsets
    are PIXEL-based (token-driven) — Chrome resolves a starting-style
    percentage transform to the destination frame and never paints the
    slide; px keyframes animate correctly (mirrors the dialog's px
    transform). */
    /* Base container shape and transitions */
    dialog .container {
        position: absolute;
        top: 0;
        bottom: 0;
        width: min(
            var(--_enabled-container-width),
            100%
        );
        max-width: var(--_container-max-width, 100%);
        background: var(--_enabled-container-color);
        color: inherit;
        display: flex;
        flex-direction: column;
        transition:
            border-radius 200ms cubic-bezier(0.2, 0, 0, 1),
            transform 150ms ${emphasizedAccelerateEasing};
        pointer-events: auto;
        z-index: 1;
        will-change: transform;
        touch-action: pan-x;
    }

    /* Dock anchor: physical right (default dock) */
    dialog.right .container {
        left: auto;
        right: 0;
        border-start-start-radius: var(--_enabled-container-shape-start-start);
        border-end-start-radius: var(--_enabled-container-shape-end-start);
        border-start-end-radius: var(--_enabled-container-shape-start-end);
        border-end-end-radius: var(--_enabled-container-shape-end-end);
        /* Closed state values: the exit transition animates towards these. */
        transform: translateX(var(--_enabled-container-width));
    }

    /* Dock anchor: physical left */
    dialog.left .container {
        left: 0;
        right: auto;
        border-start-start-radius: var(--_enabled-container-shape-start-end);
        border-end-start-radius: var(--_enabled-container-shape-end-end);
        border-start-end-radius: var(--_enabled-container-shape-start-start);
        border-end-end-radius: var(--_enabled-container-shape-end-start);
        /* Closed state values: the exit transition animates towards these. */
        transform: translateX(calc(-1 * (var(--_enabled-container-width))));
    }

    /* Open state: the enter transition runs from the starting styles below. */
    dialog.open .container {
        transform: translateX(0);
        transition:
            border-radius 200ms cubic-bezier(0.2, 0, 0, 1),
            transform 500ms ${emphasizedEasing};
    }

    /* Peek sliver (handle-mode="peek", closed sheet): most of the sheet
    hangs off the docked edge, only the vertical grip stays grabbable. */
    dialog.peek .container {
        transition:
            border-radius 200ms cubic-bezier(0.2, 0, 0, 1),
            transform 150ms ${emphasizedAccelerateEasing};
    }

    dialog.right.peek:not(.open) .container {
        transform: translateX(calc(var(--_enabled-container-width) - var(--_peeked-container-width)));
    }

    dialog.left.peek:not(.open) .container {
        transform: translateX(calc(-1 * (var(--_enabled-container-width) - var(--_peeked-container-width))));
    }

    dialog.peek.open .container {
        transition:
            border-radius 200ms cubic-bezier(0.2, 0, 0, 1),
            transform 500ms ${emphasizedEasing};
    }

    :host([dragged]) dialog .container,
    :host([dragged]) dialog.peek:not(.open) .container {
        /* The drag paints inline transforms per pointer move; CSS
        transitions must not smooth behind them. Border-radius keeps its
        transition so the corner morph still animates. Kept alive through
        the settle animations, which carry the dragged state themselves.
        Scoped to tie specificity with dialog.open / dialog.peek (order
        decides). */
        transition: border-radius 200ms cubic-bezier(0.2, 0, 0, 1);
    }

    :host([dragged]) dialog.modal .scrim {
        transition: none;
    }

    /* Dragged state: all four corners round while off the dock. */
    :host([dragged]) dialog .container {
        border-start-start-radius: var(--_dragged-container-shape-start-start);
        border-end-start-radius: var(--_dragged-container-shape-end-start);
        border-start-end-radius: var(--_dragged-container-shape-start-end);
        border-end-end-radius: var(--_dragged-container-shape-end-end);
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
    .actions,
    .handle,
    .peek-grip {
        position: relative;
        z-index: 1;
    }

    /* Drag handle row */
    .handle {
        display: flex;
        justify-content: center;
        flex-shrink: 0;
        box-sizing: border-box;
        padding-block-start: var(--_handle-container-padding-block-start);
        padding-block-end: var(--_handle-container-padding-block-end);
        cursor: grab;
        user-select: none;
        -webkit-user-select: none;
        touch-action: pan-x;
    }

    .handle-grip {
        display: block;
        width: var(--_enabled-handle-width);
        height: var(--_enabled-handle-height);
        background: var(--_enabled-handle-color);
        border-start-start-radius: var(--_enabled-handle-shape-start-start);
        border-start-end-radius: var(--_enabled-handle-shape-start-end);
        border-end-start-radius: var(--_enabled-handle-shape-end-start);
        border-end-end-radius: var(--_enabled-handle-shape-end-end);
    }

    /* Peeked sliver: only the vertical grip pokes into the viewport, pinned
    to the sheet's inner edge. The horizontal top handle appears once the
    sheet is fully shown. */
    dialog.peek:not(.open) .handle {
        display: none;
    }

    .peek-grip {
        display: none;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: auto;
        right: auto;
        width: var(--_enabled-peek-grip-width);
        height: var(--_enabled-peek-grip-height);
        background: var(--_enabled-peek-grip-color);
        border-start-start-radius: var(--_enabled-peek-grip-shape-start-start);
        border-start-end-radius: var(--_enabled-peek-grip-shape-start-end);
        border-end-start-radius: var(--_enabled-peek-grip-shape-end-start);
        border-end-end-radius: var(--_enabled-peek-grip-shape-end-end);
        cursor: grab;
        user-select: none;
        -webkit-user-select: none;
        touch-action: pan-x;
    }

    dialog.right.peek:not(.open) .peek-grip {
        display: block;
        left: 0;
    }

    dialog.left.peek:not(.open) .peek-grip {
        display: block;
        left: auto;
        right: 0;
    }

    dialog:not(.draggable) .handle,
    dialog:not(.draggable) .peek-grip {
        cursor: default;
    }

    /* Headline row */
    .headline {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-inline-start: var(--_headline-container-padding-inline-start);
        padding-inline-end: var(--_headline-container-padding-inline-end);
        padding-block-start: var(--_headline-container-padding-block-start);
        padding-block-end: var(--_headline-container-padding-block-end);
        min-height: 56px;
        color: var(--_enabled-headline-color);
        user-select: none;
        -webkit-user-select: none;
    }

    dialog.has-back-icon .headline,
    dialog.show-back-button .headline {
        padding-inline-start: var(--_headline-icon-container-padding-inline-start);
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
        padding-inline-start: var(--_content-container-padding-inline-start);
        padding-inline-end: var(--_content-container-padding-inline-end);
        padding-block-start: var(--_content-container-padding-block-start);
        padding-block-end: var(--_content-container-padding-block-end);
        min-height: 0;
    }

    /* Actions */
    .actions {
        flex-shrink: 0;
        padding-block-start: var(--_actions-container-padding-block-start);
        padding-block-end: var(--_actions-container-padding-block-end);
        min-height: var(--_actions-container-height);
    }

    .actions[hidden] { display: none; }

    .actions-row {
        display: flex;
        gap: 8px;
        align-items: center;
        padding-inline-start: var(--_content-container-padding-inline-start);
        padding-inline-end: var(--_content-container-padding-inline-end);
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

    /* "quick" skips all transitions. These rules must stay after the
    open-state blocks to win the specificity tie. */
    dialog.quick,
    dialog.quick .container,
    dialog.quick .scrim,
    dialog.quick.peek .container {
        transition: none;
    }

    /* Starting styles for the scrim's open transition (the scrim's own
    display transition paints correctly). The CONTAINER must NOT use one:
    its open/close motion is WAAPI-driven — see SideSheetOpenAnimation —
    because Chrome does not paint a descendant transform transition when
    the ancestor dialog's display flips in the top layer. Declared after
    the main rules: starting-style declarations take part in the normal
    cascade, so a block placed earlier would lose to the matching
    open-state rules and the before-change value would equal the open
    value, killing the transition. */
    @starting-style {
        dialog.modal.open .scrim {
            opacity: 0;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        dialog,
        dialog[open],
        dialog .container,
        dialog.open .container,
        dialog.peek .container,
        dialog .scrim,
        dialog.modal.open .scrim {
            transition: none;
        }
    }

    @media (forced-colors: active) {
        .handle-grip {
            background: Highlight;
        }
    }
`

export const sideSheetStyles = [
    sideSheetBaseStyles,
    standardTokens,
    modalTokens,
    getElevationStyles(),
]

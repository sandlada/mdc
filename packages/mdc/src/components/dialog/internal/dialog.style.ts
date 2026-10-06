/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import { Color } from '../../../utils/color'
import { stringifyTokens } from '../../../utils/style'
import { BasicDialogDefinition } from '../dialog.definition'

const basicDialogTokenString = stringifyTokens('--mdc-basic-dialog')(BasicDialogDefinition)

const scrimColor = unsafeCSS(Color.Scrim)
const emphasizedEasing = unsafeCSS(Easing.Emphasized.ToCSSValue())
const emphasizedAccelerateEasing = unsafeCSS(Easing.EmphasizedAccelerate.ToCSSValue())

export const basicDialogStyle = css`
    @layer mdc.basic-dialog.variable { :host{${basicDialogTokenString};} }
    @layer mdc.basic-dialog.base {

    }
    :host {
        display: contents;
    }

    dialog {
        background: transparent;
        border: none;
        border-start-start-radius: var(--_container-shape-start-start);
        border-start-end-radius: var(--_container-shape-start-end);
        border-end-end-radius: var(--_container-shape-end-end);
        border-end-start-radius: var(--_container-shape-end-start);
        flex-direction: column;
        height: fit-content;
        margin: auto;
        max-height: min(560px, calc(100% - 48px));
        max-width: min(560px, calc(100% - 48px));
        min-height: 140px;
        min-width: 280px;
        outline: none;
        overflow: visible;
        padding: 0;
        width: fit-content;
        /* Closed state values: the close transition animates towards these. */
        transform: translateY(-50px);
        transition:
            display 150ms allow-discrete,
            overlay 150ms allow-discrete,
            transform 150ms ${emphasizedAccelerateEasing};
    }
    dialog[open] {
        display: flex;
        transform: translateY(0);
        transition:
            display 500ms allow-discrete,
            overlay 500ms allow-discrete,
            transform 500ms ${emphasizedEasing};
    }
    ::backdrop {
        background: none;
    }

    /*
     * The scrim keeps its open state tied to the native dialog "open"
     * attribute through the sibling ":has()" selector instead of
     * ":host([open])", and stays continuously rendered via "visibility"
     * instead of "display: none". Chrome stops creating enter transitions
     * that derive from a host attribute (and re-entry transitions of
     * shadow siblings) once a full modal open/close cycle has completed;
     * sibling-derived state and permanent rendering keep animating on
     * every cycle.
     */
    .scrim {
        background: ${scrimColor};
        visibility: hidden;
        inset: 0;
        opacity: 0;
        pointer-events: none;
        position: fixed;
        transition:
            visibility 150ms,
            opacity 150ms linear;
        z-index: 1;
    }
    .scrim:has(+ dialog[open]) {
        visibility: visible;
        opacity: 32%;
        transition:
            visibility 500ms,
            opacity 500ms linear;
    }

    h2 {
        all: unset;
        align-self: stretch;
    }

    /* Closed-state rules compiled under "dialog": Chrome only honors the
    starting styles of newly rendered shadow descendants when their matching
    base rules are scoped to the dialog element; bare class selectors snap
    straight to the open values. */
    dialog .headline {
        align-items: center;
        color: var(--_enabled-headline-label-color);
        display: flex;
        flex-direction: column;
        font-family: var(--_headline-label-font);
        font-size: var(--_headline-label-size);
        line-height: var(--_headline-label-line-height);
        font-weight: var(--_headline-label-weight);
        opacity: 0;
        position: relative;
        transition: opacity 100ms linear;
    }
    dialog[open] .headline {
        opacity: 1;
        transition: opacity 250ms linear;
    }

    slot[name='headline']::slotted(*) {
        align-items: center;
        align-self: stretch;
        box-sizing: border-box;
        display: flex;
        gap: 8px;
        padding: 24px 24px 0;
    }

    .icon {
        display: flex;
    }

    slot[name='icon']::slotted(*) {
        fill: currentColor;
        margin-top: 24px;
        color: var(--_enabled-icon-color);
        font-size: var(--_icon-size);
        height: var(--_icon-size);
        width: var(--_icon-size);
    }

    .has-icon slot[name='headline']::slotted(*) {
        justify-content: center;
        padding-top: 16px;
    }

    .scrollable slot[name='headline']::slotted(*) {
        padding-bottom: 16px;
    }

    .scrollable.has-headline slot[name='content']::slotted(*) {
        padding-top: 8px;
    }

    .container {
        border-radius: inherit;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow: hidden;
        position: relative;
        transform-origin: top;
    }

    dialog .container::before {
        background: var(--_enabled-container-color);
        border-radius: inherit;
        content: '';
        inset: 0;
        position: absolute;
        /* Closed state values: shrink to 35% then fade out with a delay. */
        height: 35%;
        opacity: 0;
        transition:
            height 150ms ${emphasizedAccelerateEasing},
            opacity 50ms linear 100ms;
    }
    dialog[open] .container::before {
        height: 100%;
        opacity: 1;
        transition:
            height 500ms ${emphasizedEasing},
            opacity 50ms linear;
    }

    .scroller {
        display: flex;
        flex: 1;
        flex-direction: column;
        overflow: hidden;
        z-index: 1;
    }

    .scrollable .scroller {
        overflow-y: scroll;
    }

    dialog .content {
        color: var(--_enabled-supporting-text-label-color);
        font-family: var(--_supporting-text-label-font);
        font-size: var(--_supporting-text-label-size);
        line-height: var(--_supporting-text-label-line-height);
        font-weight: var(--_supporting-text-label-weight);
        flex: 1;
        height: min-content;
        opacity: 0;
        position: relative;
        transition: opacity 100ms linear;
    }
    dialog[open] .content {
        opacity: 1;
        transition: opacity 250ms linear;
    }

    slot[name='content']::slotted(*) {
        display: block;
        box-sizing: border-box;
        padding: 16px 24px 24px;
    }

    .anchor {
        position: absolute;
    }

    .top.anchor {
        top: 0;
    }

    .bottom.anchor {
        bottom: 0;
    }

    dialog .actions {
        position: relative;
        box-sizing: border-box;
        display: flex;
        gap: 8px;
        opacity: 0;
        padding: 16px 24px 24px;
        justify-content: flex-end;
        transition: opacity 100ms linear;
    }
    dialog[open] .actions {
        opacity: 1;
        transition: opacity 300ms linear;
    }

    slot[name='actions']::slotted(*) {
        box-sizing: border-box;
    }

    .has-actions slot[name='content']::slotted(*) {
        padding-bottom: 8px;
    }

    mdc-divider {
        display: none;
        position: absolute;
    }

    .has-headline.show-top-divider .headline mdc-divider,
    .has-actions.show-bottom-divider .actions mdc-divider {
        display: flex;
    }

    .headline mdc-divider {
        bottom: 0;
    }

    .actions mdc-divider {
        top: 0;
    }

    .first-focus-trap,
    .last-focus-trap {
        position: absolute;
        width: 0;
        height: 0;
        overflow: hidden;
    }

    /* "quick" skips all transitions. These rules must stay after the
    "dialog[open]" / ".scrim:has(+ dialog[open])" blocks to win the specificity tie. */
    dialog.quick,
    dialog.quick .container::before,
    dialog.quick .headline,
    dialog.quick .content,
    dialog.quick .actions,
    .scrim.quick {
        transition: none;
    }
    .scrim.quick:has(+ dialog[open]) {
        transition: none;
    }

    /* Starting styles for the open transition. Declared after the main rules:
    starting-style declarations take part in the normal cascade, so a block
    placed earlier would lose to the matching open-state rules and the
    before-change value would equal the open value, killing the transition. */
    @starting-style {
        dialog[open] {
            transform: translateY(-50px);
        }
        dialog[open] .container::before {
            height: 35%;
            opacity: 0;
        }
        dialog[open] .headline {
            opacity: 0;
        }
        dialog[open] .content {
            opacity: 0;
        }
        dialog[open] .actions {
            opacity: 0;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        dialog,
        dialog[open],
        dialog .headline,
        dialog[open] .headline,
        dialog .content,
        dialog[open] .content,
        dialog .actions,
        dialog[open] .actions,
        dialog .container::before,
        dialog[open] .container::before,
        .scrim,
        .scrim:has(+ dialog[open]) {
            transition: none;
        }
    }

    @media (forced-colors: active) {
        dialog {
            outline: 2px solid WindowText;
        }
    }
}

`

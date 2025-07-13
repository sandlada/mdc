/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Color } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import { BasicDialogDefinition } from '../../component-definitions/dialog.definition'
import { createWrappedTokens, stringTokens } from '../../utils/tokens'

const basicDialogTokens = createWrappedTokens('--mdc-basic-dialog', BasicDialogDefinition)
const basicDialogTokenString = stringTokens(basicDialogTokens)

const scrimColor = unsafeCSS(Color.Scrim)

export const basicDialogStyle = css`
    @layer mdc.basic-dialog.variable { :host{${basicDialogTokenString};} }
    @layer mdc.basic-dialog.base {

    }
    :host {
        border-start-start-radius: var(--_container-shape-start-start);
        border-start-end-radius: var(--_container-shape-start-end);
        border-end-end-radius: var(--_container-shape-end-end);
        border-end-start-radius: var(--_container-shape-end-start);
        display: contents;
        margin: auto;
        max-height: min(560px, calc(100% - 48px));
        max-width: min(560px, calc(100% - 48px));
        min-height: 140px;
        min-width: 280px;
        position: fixed;
        height: fit-content;
        width: fit-content;
    }

    dialog {
        background: transparent;
        border: none;
        border-radius: inherit;
        flex-direction: column;
        height: inherit;
        margin: inherit;
        max-height: inherit;
        max-width: inherit;
        min-height: inherit;
        min-width: inherit;
        outline: none;
        overflow: visible;
        padding: 0;
        width: inherit;
    }
    dialog[open] {
        display: flex;
    }

    ::backdrop {
        background: none;
    }

    .scrim {
        background: ${scrimColor};
        display: none;
        inset: 0;
        opacity: 32%;
        pointer-events: none;
        position: fixed;
        z-index: 1;
    }
    :host([open]) .scrim {
        display: flex;
    }

    h2 {
        all: unset;
        align-self: stretch;
    }

    .headline {
        align-items: center;
        color: var(--_headline-label-color);
        display: flex;
        flex-direction: column;
        font-family: var(--_headline-label-font);
        font-size: var(--_headline-label-size);
        line-height: var(--_headline-label-line-height);
        font-weight: var(--_headline-label-weight);
        position: relative;
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
        color: var(--_icon-color);
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

    .container::before {
        background: var(--_container-color);
        border-radius: inherit;
        content: '';
        inset: 0;
        position: absolute;
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

    .content {
        color: var(--_supporting-text-label-color);
        font-family: var(--_supporting-text-label-font);
        font-size: var(--_supporting-text-label-size);
        line-height: var(--_supporting-text-label-line-height);
        font-weight: var(--_supporting-text-label-weight);
        flex: 1;
        height: min-content;
        position: relative;
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

    .actions {
        position: relative;
        box-sizing: border-box;
        display: flex;
        gap: 8px;
        padding: 16px 24px 24px;
        justify-content: flex-end;
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

    @media (forced-colors: active) {
        dialog {
            outline: 2px solid WindowText;
        }
    }
}

`

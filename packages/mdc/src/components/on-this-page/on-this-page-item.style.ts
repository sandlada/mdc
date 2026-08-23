/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Styles for `mdc-on-this-page-item`.
 */
import { css, unsafeCSS } from 'lit'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'
import { OnThisPageItemDefinition } from '../../definitions'

const tokenRecord = defineTokenRefsRecord(OnThisPageItemDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-on-this-page-item',
})
const tokenString = unsafeCSS(defineVars(tokenRecord, true).join(''))

export const OnThisPageItemStyles = css`
    :host {
        ${tokenString};
        display: inline-flex;
        box-sizing: border-box;
        outline: none;
        user-select: none;
        -webkit-user-select: none;
    }

    :host([indicator-fit="full"]),
    :host-context([indicator-fit="full"]) {
        display: flex;
        width: 100%;
    }

    .item {
        display: inline-flex;
        align-items: center;
        position: relative;
        box-sizing: border-box;
        min-height: var(--_enabled-container-height);
        height: auto;
        padding-inline-start: var(--_enabled-container-inline-leading-padding-space);
        padding-inline-end: var(--_enabled-container-inline-trailing-padding-space);
        padding-block-start: var(--_enabled-container-block-leading-padding-space);
        padding-block-end: var(--_enabled-container-block-trailing-padding-space);
        border-top-left-radius: var(--_enabled-container-shape-start-start);
        border-top-right-radius: var(--_enabled-container-shape-start-end);
        border-bottom-left-radius: var(--_enabled-container-shape-end-start);
        border-bottom-right-radius: var(--_enabled-container-shape-end-end);
        background-color: var(--_enabled-container-color);
        color: var(--_enabled-label-color-unselected);
        text-decoration: none;
        cursor: pointer;
        outline: none;
        transition: color 200ms cubic-bezier(0.2, 0, 0, 1), font-weight 200ms cubic-bezier(0.2, 0, 0, 1);
    }

    :host([indicator-fit="full"]) .item,
    :host-context([indicator-fit="full"]) .item {
        width: 100%;
    }

    .item.level-2 {
        padding-inline-start: calc(var(--_enabled-container-inline-leading-padding-space) + 12px);
    }

    .item.level-3 {
        padding-inline-start: calc(var(--_enabled-container-inline-leading-padding-space) + 24px);
    }

    .item.level-4 {
        padding-inline-start: calc(var(--_enabled-container-inline-leading-padding-space) + 36px);
    }

    .label {
        font-family: var(--_enabled-label-font);
        font-size: var(--_enabled-label-size);
        line-height: var(--_enabled-label-line-height);
        font-weight: var(--_enabled-label-weight);
        letter-spacing: var(--_enabled-label-tracking);
        opacity: var(--_enabled-label-opacity);
        color: inherit;
        white-space: normal;
        word-break: break-word;
        transition: color 200ms cubic-bezier(0.2, 0, 0, 1), font-weight 200ms cubic-bezier(0.2, 0, 0, 1);
    }

    :host(:hover) .item:not(.disabled) {
        color: var(--_hovered-label-color);
    }

    :host(:focus-visible) .item:not(.disabled) {
        color: var(--_focused-label-color);
    }

    :host(:active) .item:not(.disabled) {
        color: var(--_pressed-label-color);
    }

    .item.active {
        color: var(--_enabled-label-color-selected);
    }

    .item.active .label {
        font-weight: var(--_enabled-label-weight-selected);
    }

    .item.disabled {
        color: var(--_disabled-label-color);
        cursor: default;
        pointer-events: none;
    }

    .item.disabled .label {
        opacity: var(--_disabled-label-opacity);
    }
`

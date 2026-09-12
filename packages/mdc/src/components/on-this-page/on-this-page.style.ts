/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Styles for `mdc-on-this-page` — the in-page table of contents container,
 * header area, item list, and floating active indicator outline pill.
 */
import { css, unsafeCSS } from 'lit'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'
import { OnThisPageDefinition } from '../../definitions'

const tokenRecord = defineTokenRefsRecord(OnThisPageDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-on-this-page',
})
const tokenString = unsafeCSS(defineVars(tokenRecord, true).join(''))

export const OnThisPageStyles = css`
    :host {
        ${tokenString};
        display: block;
        box-sizing: border-box;
        width: var(--_enabled-container-width);
        color: inherit;
    }

    .container {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        width: 100%;
        padding-inline-start: var(--_enabled-container-padding-inline-start);
        padding-inline-end: var(--_enabled-container-padding-inline-end);
        padding-block-start: var(--_enabled-container-padding-block-start);
        padding-block-end: var(--_enabled-container-padding-block-end);
        background-color: var(--_enabled-container-color);
    }

    .header {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-block-end: var(--_enabled-header-block-trailing-space);
    }

    .caption {
        font-family: var(--_enabled-caption-font);
        font-size: var(--_enabled-caption-size);
        font-weight: var(--_enabled-caption-weight);
        line-height: var(--_enabled-caption-line-height);
        letter-spacing: var(--_enabled-caption-tracking);
        color: var(--_enabled-caption-color);
    }

    .headline {
        margin: 0;
        font-family: var(--_enabled-headline-font);
        font-size: var(--_enabled-headline-size);
        font-weight: var(--_enabled-headline-weight);
        line-height: var(--_enabled-headline-line-height);
        letter-spacing: var(--_enabled-headline-tracking);
        color: var(--_enabled-headline-color);
        word-break: break-word;
    }

    .items {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--_enabled-container-item-gap);
        box-sizing: border-box;
        width: 100%;
    }

    .container.fit-full .items {
        align-items: stretch;
    }

    .container.fit-full ::slotted(mdc-on-this-page-item),
    .container.fit-full mdc-on-this-page-item {
        display: flex;
        width: 100%;
    }

    .indicator {
        position: absolute;
        top: 0;
        left: 0;
        box-sizing: border-box;
        pointer-events: none;
        z-index: 0;
        opacity: 0;
        border-width: var(--_enabled-active-indicator-outline-width);
        border-style: solid;
        border-color: var(--_enabled-active-indicator-outline-color);
        background-color: var(--_enabled-active-indicator-container-color);
        border-top-left-radius: var(--_enabled-active-indicator-shape-start-start);
        border-top-right-radius: var(--_enabled-active-indicator-shape-start-end);
        border-bottom-left-radius: var(--_enabled-active-indicator-shape-end-start);
        border-bottom-right-radius: var(--_enabled-active-indicator-shape-end-end);
        will-change: transform, width, height, opacity;
        transition:
            transform var(--_active-indicator-transition-duration) var(--_active-indicator-transition-easing),
            width var(--_active-indicator-transition-duration) var(--_active-indicator-transition-easing),
            height var(--_active-indicator-transition-duration) var(--_active-indicator-transition-easing),
            opacity 200ms ease;
    }

    @media (prefers-reduced-motion: reduce) {
        .indicator {
            transition: opacity 150ms ease;
        }
    }
`

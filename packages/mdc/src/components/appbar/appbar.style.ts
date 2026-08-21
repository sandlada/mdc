/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'
import { AppBarDefinition } from '../../component-definitions/appbar.definition'

const tokenRecord = defineTokenRefsRecord(AppBarDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-appbar',
})

const tokenString = unsafeCSS(defineVars(tokenRecord, true).join(''))

export const AppBarStyles = css`
    :host {
        ${tokenString};
    }

    :host {
        display: block;
        width: 100%;
        box-sizing: border-box;
        position: relative;
    }

    .container {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 100%;
        box-sizing: border-box;
        background-color: var(--_enabled-container-color);
        color: var(--_enabled-headline-color);
        border-top-left-radius: var(--_enabled-container-shape-start-start);
        border-top-right-radius: var(--_enabled-container-shape-start-end);
        border-bottom-right-radius: var(--_enabled-container-shape-end-end);
        border-bottom-left-radius: var(--_enabled-container-shape-end-start);
        transition: background-color 200ms cubic-bezier(0.2, 0, 0, 1), box-shadow 200ms cubic-bezier(0.2, 0, 0, 1);
        z-index: 1;
    }

    .container.scrolled {
        background-color: var(--_enabled-container-color-scrolled);
    }

    /* Elevation integration */
    .container > mdc-elevation {
        --mdc-elevation-enabled-level: var(--_enabled-container-elevation);
        --mdc-elevation-enabled-shadow-color: var(--_enabled-container-shadow-color);
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        z-index: -1;
    }

    .container.scrolled > mdc-elevation {
        --mdc-elevation-enabled-level: var(--_enabled-container-elevation-scrolled);
    }

    /* App bar row layout */
    .appbar-row {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        min-height: var(--_enabled-small-container-height);
        box-sizing: border-box;
        padding-inline-start: var(--_enabled-container-inline-leading-padding-space);
        padding-inline-end: var(--_enabled-container-inline-trailing-padding-space);
        padding-block-start: var(--_enabled-container-block-leading-padding-space);
        padding-block-end: var(--_enabled-container-block-trailing-padding-space);
    }

    /* 48px touch targets for leading and trailing sections */
    .leading-section {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        min-width: var(--_enabled-icon-button-size);
        min-height: var(--_enabled-icon-button-size);
        color: var(--_enabled-leading-icon-color);
    }

    .container:not(.has-leading) .leading-section {
        display: none;
    }

    .trailing-section {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        gap: var(--_enabled-actions-gap-space);
        color: var(--_enabled-trailing-icon-color);
        margin-inline-start: auto;
    }

    .spacer {
        flex: 1 1 auto;
    }

    /* Button and icon sizing inside app bar */
    .leading-section ::slotted(mdc-icon-button),
    .leading-section ::slotted(button),
    .trailing-section ::slotted(mdc-icon-button),
    .trailing-section ::slotted(button) {
        width: var(--_enabled-icon-button-size);
        height: var(--_enabled-icon-button-size);
    }

    .leading-section ::slotted(mdc-icon),
    .trailing-section ::slotted(mdc-icon) {
        font-size: var(--_enabled-icon-size);
        --mdc-icon-size: var(--_enabled-icon-size);
    }

    /* Title and Subtitle */
    .title-container {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-inline-end: var(--_enabled-title-gap-space);
    }

    /* When leading button is present, 4px gap after 48px button gives 56px inset */
    .container.has-leading .title-container {
        padding-inline-start: var(--_enabled-title-gap-space);
    }

    /* When no leading button is present, title has 16px inset */
    .container:not(.has-leading) .title-container {
        padding-inline-start: var(--_enabled-title-without-leading-inline-leading-space);
    }

    .headline {
        margin: 0;
        font-family: var(--_enabled-small-headline-font);
        font-size: var(--_enabled-small-headline-size);
        line-height: var(--_enabled-small-headline-line-height);
        font-weight: var(--_enabled-small-headline-weight);
        letter-spacing: var(--_enabled-small-headline-tracking);
        color: var(--_enabled-headline-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .headline ::slotted(img),
    .headline ::slotted(svg) {
        max-height: 36px;
        width: auto;
        vertical-align: middle;
    }

    .subtitle {
        margin: 0;
        font-family: var(--_enabled-subtitle-font);
        font-size: var(--_enabled-subtitle-size);
        line-height: var(--_enabled-subtitle-line-height);
        font-weight: var(--_enabled-subtitle-weight);
        letter-spacing: var(--_enabled-subtitle-tracking);
        color: var(--_enabled-subtitle-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Centered alignment */
    .container.centered .title-container {
        text-align: center;
        align-items: center;
        padding-inline: var(--_enabled-title-gap-space);
    }

    .container.centered .headline,
    .container.centered .subtitle {
        text-align: center;
    }

    .container.small.centered .leading-section {
        min-width: var(--_enabled-icon-button-size);
    }

    .container.small.centered .trailing-section {
        min-width: var(--_enabled-icon-button-size);
    }

    /* Medium flexible variant */
    .container.medium-flexible {
        min-height: var(--_enabled-medium-container-min-height);
    }

    .container.medium-flexible .top-row {
        min-height: var(--_enabled-flexible-top-row-height);
        padding-block-start: 4px;
    }

    .container.medium-flexible .flexible-content {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding-inline-start: var(--_enabled-flexible-content-inline-leading-padding-space);
        padding-inline-end: var(--_enabled-flexible-content-inline-trailing-padding-space);
        padding-block-start: 4px;
        padding-block-end: var(--_enabled-flexible-content-block-trailing-padding-space);
    }

    .container.medium-flexible .flexible-content .title-container {
        padding-inline: 0;
    }

    .container.medium-flexible .headline {
        font-family: var(--_enabled-medium-headline-font);
        font-size: var(--_enabled-medium-headline-size);
        line-height: var(--_enabled-medium-headline-line-height);
        font-weight: var(--_enabled-medium-headline-weight);
        letter-spacing: var(--_enabled-medium-headline-tracking);
        white-space: normal;
        overflow: visible;
        word-break: break-word;
    }

    /* Large flexible variant */
    .container.large-flexible {
        min-height: var(--_enabled-large-container-min-height);
    }

    .container.large-flexible .top-row {
        min-height: var(--_enabled-flexible-top-row-height);
        padding-block-start: 4px;
    }

    .container.large-flexible .flexible-content {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding-inline-start: var(--_enabled-flexible-content-inline-leading-padding-space);
        padding-inline-end: var(--_enabled-flexible-content-inline-trailing-padding-space);
        padding-block-start: 4px;
        padding-block-end: var(--_enabled-flexible-content-block-trailing-padding-space);
    }

    .container.large-flexible .flexible-content .title-container {
        padding-inline: 0;
    }

    .container.large-flexible .headline {
        font-family: var(--_enabled-large-headline-font);
        font-size: var(--_enabled-large-headline-size);
        line-height: var(--_enabled-large-headline-line-height);
        font-weight: var(--_enabled-large-headline-weight);
        letter-spacing: var(--_enabled-large-headline-tracking);
        white-space: normal;
        overflow: visible;
        word-break: break-word;
    }

    /* Search app bar variant */
    .container.search {
        min-height: var(--_enabled-search-container-height);
    }

    .search-row {
        gap: 0;
    }

    .search-container {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        align-items: center;
        margin-inline-start: var(--_enabled-search-box-gap-space);
        margin-inline-end: var(--_enabled-search-box-gap-space);
    }

    .search-box {
        display: flex;
        align-items: center;
        width: 100%;
        height: var(--_enabled-search-box-height);
        background-color: var(--_enabled-search-box-container-color);
        border-radius: var(--_enabled-search-box-shape-start-start);
        padding-inline: var(--_enabled-search-box-inline-padding-space);
        gap: 8px;
        box-sizing: border-box;
        transition: background-color 200ms cubic-bezier(0.2, 0, 0, 1);
        cursor: pointer;
    }

    .container.scrolled .search-box {
        background-color: var(--_enabled-search-box-container-color-scrolled);
    }

    .search-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--_enabled-icon-size);
        height: var(--_enabled-icon-size);
        color: var(--_enabled-search-box-icon-color);
        flex-shrink: 0;
    }

    .search-input-wrapper {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        align-items: center;
    }

    .search-placeholder {
        font-family: var(--_enabled-search-text-font);
        font-size: var(--_enabled-search-text-size);
        line-height: var(--_enabled-search-text-line-height);
        letter-spacing: var(--_enabled-search-text-tracking);
        color: var(--_enabled-search-box-placeholder-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        user-select: none;
    }

    .search-box ::slotted(mdc-icon-button),
    .search-box ::slotted(button) {
        width: var(--_enabled-icon-button-size);
        height: var(--_enabled-icon-button-size);
    }
`

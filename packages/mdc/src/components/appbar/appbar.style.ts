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
        background-color: var(--_enabled-container-color, #fef7ff);
        color: var(--_enabled-headline-color, #1d1b20);
        border-top-left-radius: var(--_enabled-container-shape-start-start, 0);
        border-top-right-radius: var(--_enabled-container-shape-start-end, 0);
        border-bottom-right-radius: var(--_enabled-container-shape-end-end, 0);
        border-bottom-left-radius: var(--_enabled-container-shape-end-start, 0);
        transition: background-color 200ms cubic-bezier(0.2, 0, 0, 1), box-shadow 200ms cubic-bezier(0.2, 0, 0, 1);
        z-index: 1;
    }

    .container.scrolled {
        background-color: var(--_enabled-container-color-scrolled, #f3edf7);
    }

    /* Elevation integration */
    .container > mdc-elevation {
        --mdc-elevation-enabled-level: var(--_enabled-container-elevation, 0);
        --mdc-elevation-enabled-shadow-color: var(--_enabled-container-shadow-color, rgba(0, 0, 0, 0.15));
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        z-index: -1;
    }

    .container.scrolled > mdc-elevation {
        --mdc-elevation-enabled-level: var(--_enabled-container-elevation-scrolled, 2);
    }

    /* App bar row layout */
    .appbar-row {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        min-height: var(--_enabled-small-container-height, 64px);
        box-sizing: border-box;
        padding-inline-start: var(--_enabled-container-inline-leading-padding-space, 4px);
        padding-inline-end: var(--_enabled-container-inline-trailing-padding-space, 4px);
        padding-block-start: var(--_enabled-container-block-leading-padding-space, 0px);
        padding-block-end: var(--_enabled-container-block-trailing-padding-space, 0px);
    }

    /* 48px touch targets for leading and trailing sections */
    .leading-section {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        min-width: var(--_enabled-icon-button-size, 48px);
        min-height: var(--_enabled-icon-button-size, 48px);
        color: var(--_enabled-leading-icon-color, #1d1b20);
    }

    .container:not(.has-leading) .leading-section {
        display: none;
    }

    .trailing-section {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        gap: var(--_enabled-actions-gap-space, 0px);
        color: var(--_enabled-trailing-icon-color, #49454f);
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
        width: var(--_enabled-icon-button-size, 48px);
        height: var(--_enabled-icon-button-size, 48px);
    }

    .leading-section ::slotted(mdc-icon),
    .trailing-section ::slotted(mdc-icon) {
        font-size: var(--_enabled-icon-size, 24px);
        --mdc-icon-size: var(--_enabled-icon-size, 24px);
    }

    /* Title and Subtitle */
    .title-container {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-inline-end: var(--_enabled-title-gap-space, 4px);
    }

    /* When leading button is present, 4px gap after 48px button gives 56px inset */
    .container.has-leading .title-container {
        padding-inline-start: var(--_enabled-title-gap-space, 4px);
    }

    /* When no leading button is present, title has 12px padding (+4px container padding = 16px inset) */
    .container:not(.has-leading) .title-container {
        padding-inline-start: var(--_enabled-title-without-leading-inline-leading-space, 12px);
    }

    .headline {
        margin: 0;
        font-family: var(--_enabled-small-headline-font, Roboto);
        font-size: var(--_enabled-small-headline-size, 22px);
        line-height: var(--_enabled-small-headline-line-height, 28px);
        font-weight: var(--_enabled-small-headline-weight, 400);
        letter-spacing: var(--_enabled-small-headline-tracking, 0px);
        color: var(--_enabled-headline-color, #1d1b20);
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
        font-family: var(--_enabled-subtitle-font, Roboto);
        font-size: var(--_enabled-subtitle-size, 14px);
        line-height: var(--_enabled-subtitle-line-height, 20px);
        font-weight: var(--_enabled-subtitle-weight, 400);
        letter-spacing: var(--_enabled-subtitle-tracking, 0.25px);
        color: var(--_enabled-subtitle-color, #49454f);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Centered alignment */
    .container.centered .title-container {
        text-align: center;
        align-items: center;
        padding-inline: var(--_enabled-title-gap-space, 4px);
    }

    .container.centered .headline,
    .container.centered .subtitle {
        text-align: center;
    }

    .container.small.centered .leading-section {
        min-width: 48px;
    }

    .container.small.centered .trailing-section {
        min-width: 48px;
    }

    /* Medium flexible variant (112px height, 16px left/right padding, 12px bottom padding) */
    .container.medium-flexible {
        min-height: var(--_enabled-medium-container-min-height, 112px);
    }

    .container.medium-flexible .top-row {
        min-height: var(--_enabled-flexible-top-row-height, 56px);
        padding-block-start: 4px;
    }

    .container.medium-flexible .flexible-content {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding-inline-start: var(--_enabled-flexible-content-inline-leading-padding-space, 16px);
        padding-inline-end: var(--_enabled-flexible-content-inline-trailing-padding-space, 16px);
        padding-block-start: 4px;
        padding-block-end: var(--_enabled-flexible-content-block-trailing-padding-space, 12px);
    }

    .container.medium-flexible .flexible-content .title-container {
        padding-inline: 0;
    }

    .container.medium-flexible .headline {
        font-family: var(--_enabled-medium-headline-font, Roboto);
        font-size: var(--_enabled-medium-headline-size, 28px);
        line-height: var(--_enabled-medium-headline-line-height, 36px);
        font-weight: var(--_enabled-medium-headline-weight, 400);
        letter-spacing: var(--_enabled-medium-headline-tracking, 0px);
        white-space: normal;
        overflow: visible;
        word-break: break-word;
    }

    /* Large flexible variant (120px height in MD3E, 16px left/right padding, 12px bottom padding) */
    .container.large-flexible {
        min-height: var(--_enabled-large-container-min-height, 120px);
    }

    .container.large-flexible .top-row {
        min-height: var(--_enabled-flexible-top-row-height, 56px);
        padding-block-start: 4px;
    }

    .container.large-flexible .flexible-content {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding-inline-start: var(--_enabled-flexible-content-inline-leading-padding-space, 16px);
        padding-inline-end: var(--_enabled-flexible-content-inline-trailing-padding-space, 16px);
        padding-block-start: 4px;
        padding-block-end: var(--_enabled-flexible-content-block-trailing-padding-space, 12px);
    }

    .container.large-flexible .flexible-content .title-container {
        padding-inline: 0;
    }

    .container.large-flexible .headline {
        font-family: var(--_enabled-large-headline-font, Roboto);
        font-size: var(--_enabled-large-headline-size, 36px);
        line-height: var(--_enabled-large-headline-line-height, 44px);
        font-weight: var(--_enabled-large-headline-weight, 400);
        letter-spacing: var(--_enabled-large-headline-tracking, 0px);
        white-space: normal;
        overflow: visible;
        word-break: break-word;
    }

    /* Search app bar variant (64px height, 8px gaps, 48px search box) */
    .container.search {
        min-height: var(--_enabled-search-container-height, 64px);
    }

    .search-row {
        gap: 0;
    }

    .search-container {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        align-items: center;
        margin-inline-start: var(--_enabled-search-box-gap-space, 8px);
        margin-inline-end: var(--_enabled-search-box-gap-space, 8px);
    }

    .search-box {
        display: flex;
        align-items: center;
        width: 100%;
        height: var(--_enabled-search-box-height, 48px);
        background-color: var(--_enabled-search-box-container-color, #ece6f0);
        border-radius: var(--_enabled-search-box-shape-start-start, 9999px);
        padding-inline: var(--_enabled-search-box-inline-padding-space, 16px);
        gap: 8px;
        box-sizing: border-box;
        transition: background-color 200ms cubic-bezier(0.2, 0, 0, 1);
        cursor: pointer;
    }

    .container.scrolled .search-box {
        background-color: var(--_enabled-search-box-container-color-scrolled, #e6e0e9);
    }

    .search-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--_enabled-icon-size, 24px);
        height: var(--_enabled-icon-size, 24px);
        color: var(--_enabled-search-box-icon-color, #49454f);
        flex-shrink: 0;
    }

    .search-input-wrapper {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        align-items: center;
    }

    .search-placeholder {
        font-family: var(--_enabled-search-text-font, Roboto);
        font-size: var(--_enabled-search-text-size, 16px);
        line-height: var(--_enabled-search-text-line-height, 24px);
        letter-spacing: var(--_enabled-search-text-tracking, 0.5px);
        color: var(--_enabled-search-box-placeholder-color, #49454f);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        user-select: none;
    }

    .search-box ::slotted(mdc-icon-button),
    .search-box ::slotted(button) {
        width: var(--_enabled-icon-button-size, 48px);
        height: var(--_enabled-icon-button-size, 48px);
    }
`

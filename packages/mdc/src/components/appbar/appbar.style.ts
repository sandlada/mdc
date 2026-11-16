/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { overrideTokens, stringifyTokens } from '../../utils/style'
import type { ElevationDefinition } from '../elevation/elevation.definition'
import type { FocusRingDefinition } from '../focus-ring/focus-ring.definition'
import type { RippleDefinition } from '../ripple/ripple.definition'
import { AppBarDefinition } from './appbar.definition'

const TokenString = stringifyTokens('--mdc-appbar')(AppBarDefinition)

const ElevationStyles = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'enabled-level'       : `var(--_enabled-container-elevation)`,
    'enabled-shadow-color': `var(--_enabled-container-shadow-color)`,
})()

const ScrolledElevationStyles = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'enabled-level': `var(--_enabled-container-elevation-scrolled)`,
})()

const SearchFocusRingStyles = overrideTokens<typeof FocusRingDefinition>('--mdc-focus-ring')({
    'shape-start-start': `var(--_enabled-search-box-shape-start-start)`,
    'shape-start-end'  : `var(--_enabled-search-box-shape-start-end)`,
    'shape-end-start'  : `var(--_enabled-search-box-shape-end-start)`,
    'shape-end-end'    : `var(--_enabled-search-box-shape-end-end)`,
    'enabled-color'    : `var(--_focused-search-box-indicator-color)`,
    'width'            : `var(--_focused-search-box-indicator-thickness)`,
    'outward-offset'   : `var(--_focused-search-box-indicator-offset)`,
    'inward-offset'    : `var(--_focused-search-box-indicator-offset)`,
})()

const SearchRippleStyles = overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'enabled-hovered-color'  : `var(--_hovered-search-box-state-layer-color)`,
    'enabled-hovered-opacity': `var(--_hovered-search-box-state-layer-opacity)`,
    'enabled-pressed-color'  : `var(--_pressed-search-box-state-layer-color)`,
    'enabled-pressed-opacity': `var(--_pressed-search-box-state-layer-opacity)`,
})()

export const AppBarStyles = css`
    @layer mdc.appbar.variable {
        :host {
            ${TokenString};
        }
    }

    @layer mdc.appbar.composite.elevation {
        .container > mdc-elevation {
            ${ElevationStyles};
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            z-index: -1;
        }

        .container.scrolled > mdc-elevation {
            ${ScrolledElevationStyles};
        }
    }

    @layer mdc.appbar.composite.focus-ring {
        .search-box > mdc-focus-ring {
            border-radius: inherit;
            ${SearchFocusRingStyles};
        }
    }

    @layer mdc.appbar.composite.ripple {
        .search-box > mdc-ripple {
            border-radius: inherit;
            ${SearchRippleStyles};
        }
    }

    @layer mdc.appbar.base {
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
            border-start-start-radius: var(--_enabled-container-shape-start-start);
            border-start-end-radius: var(--_enabled-container-shape-start-end);
            border-end-end-radius: var(--_enabled-container-shape-end-end);
            border-end-start-radius: var(--_enabled-container-shape-end-start);
            transition:
                background-color var(--_enabled-transition-duration) var(--_enabled-transition-easing),
                box-shadow var(--_enabled-transition-duration) var(--_enabled-transition-easing);
            z-index: 1;
        }

        .container.scrolled {
            background-color: var(--_enabled-container-color-scrolled);
        }

        .container.collapsible.scrolled {
            background-color: color-mix(
                in srgb,
                var(--_enabled-container-color) calc((1 - var(--_scroll-progress, 1)) * 100%),
                var(--_enabled-container-color-scrolled) calc(var(--_scroll-progress, 1) * 100%)
            );
        }

        .container.collapsible > mdc-elevation {
            opacity: var(--_scroll-progress, 0);
        }

        /* App bar row layout */
        .appbar-row {
            position: relative;
            display: flex;
            align-items: center;
            width: 100%;
            min-height: var(--_enabled-small-container-height);
            box-sizing: border-box;
            padding-inline-start: var(--_enabled-container-padding-inline-start);
            padding-inline-end: var(--_enabled-container-padding-inline-end);
            padding-block-start: var(--_enabled-container-padding-block-start);
            padding-block-end: var(--_enabled-container-padding-block-end);
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
            min-height: var(--_enabled-icon-button-size);
            gap: var(--_enabled-actions-gap-space);
            color: var(--_enabled-trailing-icon-color);
            margin-inline-start: auto;
        }

        /* Button and icon sizing inside app bar */
        .leading-section ::slotted(button),
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
            padding-inline-start: var(--_enabled-title-without-leading-space);
        }

        .headline,
        .collapsed-headline {
            margin: 0;
            font-family: var(--_enabled-small-headline-font);
            font-size: var(--_enabled-small-headline-size);
            line-height: var(--_enabled-small-headline-leading);
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
            line-height: var(--_enabled-subtitle-leading);
            font-weight: var(--_enabled-subtitle-weight);
            letter-spacing: var(--_enabled-subtitle-tracking);
            color: var(--_enabled-subtitle-color);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* True mathematical centering for small centered app bar */
        .container.small.centered .appbar-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
            align-items: center;
        }

        .container.small.centered .leading-section {
            grid-column: 1;
            justify-self: start;
        }

        .container.small.centered .title-container {
            grid-column: 2;
            justify-self: center;
            max-width: 100%;
            text-align: center;
            align-items: center;
            padding-inline-start: var(--_enabled-title-gap-space);
            padding-inline-end: var(--_enabled-title-gap-space);
        }

        .container.small.centered .trailing-section {
            grid-column: 3;
            justify-self: end;
            margin-inline-start: 0;
        }

        .container.centered .title-container {
            text-align: center;
            align-items: center;
        }

        .container.centered .headline,
        .container.centered .subtitle {
            text-align: center;
        }

        /* Medium & Large flexible shared structure */
        .container.medium-flexible,
        .container.large-flexible {
            min-height: var(--_enabled-small-container-height);
        }

        .container.medium-flexible:not(.collapsed) {
            min-height: var(--_enabled-medium-container-min-height);
        }

        .container.large-flexible:not(.collapsed) {
            min-height: var(--_enabled-large-container-min-height);
        }

        .container.medium-flexible .top-row,
        .container.large-flexible .top-row {
            min-height: var(--_enabled-flexible-top-row-height);
            padding-block-start: var(--_enabled-flexible-top-row-padding-top);
        }

        .container.collapsed .top-row {
            min-height: var(--_enabled-small-container-height);
            padding-block-start: var(--_enabled-container-padding-block-start);
        }

        .collapsed-title {
            flex: 1 1 auto;
            min-width: 0;
            display: flex;
            align-items: center;
            padding-inline-end: var(--_enabled-title-gap-space);
            opacity: 0;
            pointer-events: none;
        }

        .container.has-leading .collapsed-title {
            padding-inline-start: var(--_enabled-title-gap-space);
        }

        .container:not(.has-leading) .collapsed-title {
            padding-inline-start: var(--_enabled-title-without-leading-space);
        }

        .container.centered .collapsed-title {
            justify-content: center;
            text-align: center;
        }

        .container.collapsed .collapsed-title {
            opacity: 1;
            pointer-events: auto;
        }

        .flexible-content-wrapper {
            flex: 1 1 auto;
            display: grid;
            grid-template-rows: 1fr;
            overflow: hidden;
        }

        .container.collapsed .flexible-content-wrapper {
            grid-template-rows: 0fr;
            opacity: 0;
            pointer-events: none;
        }

        .flexible-content {
            overflow: hidden;
            min-height: 0;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding-inline-start: var(--_enabled-flexible-content-padding-inline-start);
            padding-inline-end: var(--_enabled-flexible-content-padding-inline-end);
            padding-block-start: var(--_enabled-flexible-content-padding-top);
            padding-block-end: var(--_enabled-flexible-content-padding-block-end);
            box-sizing: border-box;
        }

        .container.collapsed .flexible-content {
            padding-block-start: 0;
            padding-block-end: 0;
        }

        .flexible-content .title-container {
            padding-inline: 0;
        }

        .container.medium-flexible .headline {
            font-family: var(--_enabled-medium-headline-font);
            font-size: var(--_enabled-medium-headline-size);
            line-height: var(--_enabled-medium-headline-leading);
            font-weight: var(--_enabled-medium-headline-weight);
            letter-spacing: var(--_enabled-medium-headline-tracking);
            white-space: normal;
            overflow: visible;
            word-break: break-word;
        }

        .container.large-flexible .headline {
            font-family: var(--_enabled-large-headline-font);
            font-size: var(--_enabled-large-headline-size);
            line-height: var(--_enabled-large-headline-leading);
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
            position: relative;
            display: flex;
            align-items: center;
            width: 100%;
            height: var(--_enabled-search-box-height);
            background-color: var(--_enabled-search-box-container-color);
            border-start-start-radius: var(--_enabled-search-box-shape-start-start);
            border-start-end-radius: var(--_enabled-search-box-shape-start-end);
            border-end-end-radius: var(--_enabled-search-box-shape-end-end);
            border-end-start-radius: var(--_enabled-search-box-shape-end-start);
            padding-inline-start: var(--_enabled-search-box-padding-inline-start);
            padding-inline-end: var(--_enabled-search-box-padding-inline-end);
            padding-block-start: var(--_enabled-search-box-padding-block-start);
            padding-block-end: var(--_enabled-search-box-padding-block-end);
            gap: var(--_enabled-search-box-inner-gap-space);
            box-sizing: border-box;
            transition: background-color var(--_enabled-transition-duration) var(--_enabled-transition-easing);
            cursor: pointer;
            outline: none;
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

        .container.centered .search-input-wrapper {
            justify-content: center;
        }

        .search-placeholder {
            font-family: var(--_enabled-search-text-font);
            font-size: var(--_enabled-search-text-size);
            line-height: var(--_enabled-search-text-leading);
            font-weight: var(--_enabled-search-text-weight);
            letter-spacing: var(--_enabled-search-text-tracking);
            color: var(--_enabled-search-box-placeholder-color);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            user-select: none;
        }

        .search-box ::slotted(button) {
            width: var(--_enabled-icon-button-size);
            height: var(--_enabled-icon-button-size);
        }
    }

    @layer mdc.appbar.a11y {
        @media (prefers-reduced-motion: reduce) {
            .container,
            .container.medium-flexible .top-row,
            .container.large-flexible .top-row,
            .collapsed-title,
            .flexible-content-wrapper,
            .search-box {
                transition: none;
            }
        }

        @media (prefers-reduced-transparency: reduce) {
            .container,
            .container.scrolled,
            .search-box {
                backdrop-filter: none;
            }
        }

        @media (prefers-contrast: more) {
            .container.scrolled {
                border-block-end: 1px solid currentColor;
            }

            .search-box {
                outline: 1px solid currentColor;
                outline-offset: -1px;
            }
        }

        @media (prefers-contrast: less) {
            .container.scrolled {
                border-block-end-color: transparent;
            }
        }

        @media (forced-colors: active) {
            .container,
            .container.scrolled {
                background-color: Canvas;
                color: CanvasText;
                border-block-end: 1px solid ButtonBorder;
            }

            .headline,
            .collapsed-headline,
            .subtitle,
            .leading-section,
            .trailing-section,
            .search-icon,
            .search-placeholder {
                color: CanvasText;
            }

            .search-box,
            .container.scrolled .search-box {
                background-color: Field;
                color: FieldText;
                border: 1px solid ButtonBorder;
            }
        }
    }
`

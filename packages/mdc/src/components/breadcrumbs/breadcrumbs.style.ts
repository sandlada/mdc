/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { stringifyTokens } from '../../utils/style'
import { BreadcrumbsDefinition } from './breadcrumbs.definition'

const Tokens = stringifyTokens('--mdc-breadcrumbs')(BreadcrumbsDefinition)

const SizeResolutionStyles = css`
    :host([size='small']) {
        --_resolved-item-height: var(--_small-item-height);
        --_resolved-item-gap: var(--_small-item-gap);
        --_resolved-separator-gap: var(--_small-separator-gap);
        --_resolved-icon-size: var(--_small-icon-size);
        --_resolved-separator-size: var(--_small-separator-size);
        --_resolved-padding-start: var(--_small-item-padding-inline-start);
        --_resolved-padding-end: var(--_small-item-padding-inline-end);
        --_resolved-square-ss: var(--_small-square-item-shape-start-start);
        --_resolved-square-se: var(--_small-square-item-shape-start-end);
        --_resolved-square-ee: var(--_small-square-item-shape-end-end);
        --_resolved-square-es: var(--_small-square-item-shape-end-start);
        --_resolved-label-font: var(--_small-item-label-font);
        --_resolved-label-size: var(--_small-item-label-size);
        --_resolved-label-leading: var(--_small-item-label-leading);
        --_resolved-label-tracking: var(--_small-item-label-tracking);
        --_resolved-label-weight: var(--_small-item-label-weight);
    }

    :host([size='medium']),
    :host(:not([size])) {
        --_resolved-item-height: var(--_medium-item-height);
        --_resolved-item-gap: var(--_medium-item-gap);
        --_resolved-separator-gap: var(--_medium-separator-gap);
        --_resolved-icon-size: var(--_medium-icon-size);
        --_resolved-separator-size: var(--_medium-separator-size);
        --_resolved-padding-start: var(--_medium-item-padding-inline-start);
        --_resolved-padding-end: var(--_medium-item-padding-inline-end);
        --_resolved-square-ss: var(--_medium-square-item-shape-start-start);
        --_resolved-square-se: var(--_medium-square-item-shape-start-end);
        --_resolved-square-ee: var(--_medium-square-item-shape-end-end);
        --_resolved-square-es: var(--_medium-square-item-shape-end-start);
        --_resolved-label-font: var(--_medium-item-label-font);
        --_resolved-label-size: var(--_medium-item-label-size);
        --_resolved-label-leading: var(--_medium-item-label-leading);
        --_resolved-label-tracking: var(--_medium-item-label-tracking);
        --_resolved-label-weight: var(--_medium-item-label-weight);
    }

    :host([size='large']) {
        --_resolved-item-height: var(--_large-item-height);
        --_resolved-item-gap: var(--_large-item-gap);
        --_resolved-separator-gap: var(--_large-separator-gap);
        --_resolved-icon-size: var(--_large-icon-size);
        --_resolved-separator-size: var(--_large-separator-size);
        --_resolved-padding-start: var(--_large-item-padding-inline-start);
        --_resolved-padding-end: var(--_large-item-padding-inline-end);
        --_resolved-square-ss: var(--_large-square-item-shape-start-start);
        --_resolved-square-se: var(--_large-square-item-shape-start-end);
        --_resolved-square-ee: var(--_large-square-item-shape-end-end);
        --_resolved-square-es: var(--_large-square-item-shape-end-start);
        --_resolved-label-font: var(--_large-item-label-font);
        --_resolved-label-size: var(--_large-item-label-size);
        --_resolved-label-leading: var(--_large-item-label-leading);
        --_resolved-label-tracking: var(--_large-item-label-tracking);
        --_resolved-label-weight: var(--_large-item-label-weight);
    }

    :host([shape='round']),
    :host(:not([shape])) {
        --_resolved-ss: var(--_round-item-shape-start-start);
        --_resolved-se: var(--_round-item-shape-start-end);
        --_resolved-ee: var(--_round-item-shape-end-end);
        --_resolved-es: var(--_round-item-shape-end-start);
    }

    :host([shape='square']) {
        --_resolved-ss: var(--_resolved-square-ss);
        --_resolved-se: var(--_resolved-square-se);
        --_resolved-ee: var(--_resolved-square-ee);
        --_resolved-es: var(--_resolved-square-es);
    }
`

const BreadcrumbsStylePart = css`
    @layer mdc.breadcrumbs.base {
        :host {
            box-sizing: border-box;
            position: relative;
            display: inline-flex;
            align-items: center;
            max-width: 100%;
            isolation: isolate;
            -webkit-tap-highlight-color: transparent;
        }

        :host([hidden]) {
            display: none;
        }

        ${SizeResolutionStyles}

        .nav {
            display: inline-flex;
            align-items: center;
            max-width: 100%;
        }

        .list {
            display: inline-flex;
            flex-wrap: wrap;
            align-items: center;
            list-style: none;
            margin: 0;
            padding: 0;
            gap: var(--_resolved-separator-gap);
        }

        .entry {
            display: inline-flex;
            align-items: center;
            min-width: 0;
        }

        .separator {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--_enabled-separator-color);
            font-size: var(--_resolved-separator-size);
            line-height: 1;
            user-select: none;
            flex-shrink: 0;
        }

        .separator mdc-icon {
            font-size: var(--_resolved-separator-size);
            width: var(--_resolved-separator-size);
            height: var(--_resolved-separator-size);
        }

        .overflow-wrapper {
            position: relative;
            display: inline-flex;
            align-items: center;
        }

        .overflow-button {
            position: relative;
            box-sizing: border-box;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: var(--_resolved-item-height);
            min-width: var(--_resolved-item-height);
            padding-inline: var(--_resolved-padding-start) var(--_resolved-padding-end);
            border: none;
            background: var(--_enabled-item-container-color);
            color: var(--_enabled-overflow-icon-color);
            cursor: pointer;
            outline: none;
            border-start-start-radius: var(--_resolved-ss);
            border-start-end-radius: var(--_resolved-se);
            border-end-end-radius: var(--_resolved-ee);
            border-end-start-radius: var(--_resolved-es);
            --mdc-ripple-hover-color: var(--_state-layer-color);
            --mdc-ripple-pressed-color: var(--_state-layer-color);
            --mdc-ripple-hover-opacity: var(--_hovered-state-layer-opacity);
            --mdc-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
        }

        :host([variant='tonal']) .overflow-button {
            background: var(--_enabled-tonal-container-color);
        }

        :host([variant='outlined']) .overflow-button {
            border: var(--_outlined-outline-width) solid var(--_enabled-outlined-outline-color);
        }

        .overflow-button mdc-icon {
            font-size: var(--_resolved-icon-size);
        }

        .data-item {
            position: relative;
            box-sizing: border-box;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: var(--_resolved-item-gap);
            height: var(--_resolved-item-height);
            padding-inline: var(--_resolved-padding-start) var(--_resolved-padding-end);
            border: none;
            background: var(--_enabled-item-container-color);
            color: var(--_enabled-item-label-color);
            text-decoration: none;
            cursor: pointer;
            outline: none;
            font-family: var(--_resolved-label-font);
            font-size: var(--_resolved-label-size);
            line-height: var(--_resolved-label-leading);
            letter-spacing: var(--_resolved-label-tracking);
            font-weight: var(--_resolved-label-weight);
            border-start-start-radius: var(--_resolved-ss);
            border-start-end-radius: var(--_resolved-se);
            border-end-end-radius: var(--_resolved-ee);
            border-end-start-radius: var(--_resolved-es);
            transition: color 150ms cubic-bezier(0.2, 0, 0, 1),
                background-color 150ms cubic-bezier(0.2, 0, 0, 1);
            --mdc-ripple-hover-color: var(--_state-layer-color);
            --mdc-ripple-pressed-color: var(--_state-layer-color);
            --mdc-ripple-hover-opacity: var(--_hovered-state-layer-opacity);
            --mdc-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
        }

        .data-item:hover:not(.disabled):not(.current) {
            color: var(--_hovered-item-label-color);
        }

        .data-item.current {
            color: var(--_enabled-current-label-color);
            cursor: default;
            font-weight: 600;
        }

        .data-item.disabled {
            opacity: var(--_disabled-content-opacity);
            cursor: default;
            pointer-events: none;
        }

        :host([variant='tonal']) .data-item {
            background: var(--_enabled-tonal-container-color);
        }

        :host([variant='tonal']) .data-item.current {
            background: var(--_enabled-tonal-current-container-color);
            color: var(--_enabled-tonal-current-label-color);
        }

        :host([variant='outlined']) .data-item {
            border: var(--_outlined-outline-width) solid var(--_enabled-outlined-outline-color);
        }

        .data-item mdc-icon {
            font-size: var(--_resolved-icon-size);
            color: inherit;
        }

        .hidden-slot {
            display: none;
        }
    }

    @layer mdc.breadcrumbs.a11y {
        @media (forced-colors: active) {
            .overflow-button,
            .data-item {
                border: 1px solid ButtonBorder;
                color: LinkText;
                background: Canvas;
            }
            .data-item.current {
                color: CanvasText;
                border-color: Highlight;
            }
            .data-item.disabled {
                color: GrayText;
                border-color: GrayText;
                opacity: 1;
            }
        }

        @media (prefers-contrast: more) {
            .overflow-button,
            .data-item {
                outline: 1px solid currentColor;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .data-item {
                transition: none;
            }
        }
    }
`

const BreadcrumbItemStylePart = css`
    @layer mdc.breadcrumbs.item.base {
        :host {
            box-sizing: border-box;
            position: relative;
            display: inline-flex;
            align-items: center;
            vertical-align: middle;
            isolation: isolate;
            -webkit-tap-highlight-color: transparent;
        }

        :host([hidden]) {
            display: none;
        }

        ${SizeResolutionStyles}

        .item {
            position: relative;
            box-sizing: border-box;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: var(--_resolved-item-gap);
            height: var(--_resolved-item-height);
            padding-inline: var(--_resolved-padding-start) var(--_resolved-padding-end);
            border: none;
            background: var(--_enabled-item-container-color);
            color: var(--_enabled-item-label-color);
            text-decoration: none;
            cursor: pointer;
            outline: none;
            font-family: var(--_resolved-label-font);
            font-size: var(--_resolved-label-size);
            line-height: var(--_resolved-label-leading);
            letter-spacing: var(--_resolved-label-tracking);
            font-weight: var(--_resolved-label-weight);
            border-start-start-radius: var(--_resolved-ss);
            border-start-end-radius: var(--_resolved-se);
            border-end-end-radius: var(--_resolved-ee);
            border-end-start-radius: var(--_resolved-es);
            transition: color 150ms cubic-bezier(0.2, 0, 0, 1),
                background-color 150ms cubic-bezier(0.2, 0, 0, 1);
            --mdc-ripple-hover-color: var(--_state-layer-color);
            --mdc-ripple-pressed-color: var(--_state-layer-color);
            --mdc-ripple-hover-opacity: var(--_hovered-state-layer-opacity);
            --mdc-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
        }

        .item:hover:not(.disabled):not(.current) {
            color: var(--_hovered-item-label-color);
        }

        .item.current {
            color: var(--_enabled-current-label-color);
            cursor: default;
            font-weight: 600;
        }

        .item.disabled {
            opacity: var(--_disabled-content-opacity);
            cursor: default;
            pointer-events: none;
        }

        :host([variant='tonal']) .item {
            background: var(--_enabled-tonal-container-color);
        }

        :host([variant='tonal']) .item.current {
            background: var(--_enabled-tonal-current-container-color);
            color: var(--_enabled-tonal-current-label-color);
        }

        :host([variant='outlined']) .item {
            border: var(--_outlined-outline-width) solid var(--_enabled-outlined-outline-color);
        }

        .icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: var(--_resolved-icon-size);
            color: var(--_enabled-item-icon-color);
        }

        .icon[hidden] {
            display: none;
        }

        .item:hover:not(.disabled):not(.current) .icon {
            color: var(--_hovered-item-label-color);
        }

        .item.current .icon {
            color: var(--_enabled-current-icon-color);
        }

        :host([variant='tonal']) .item.current .icon {
            color: var(--_enabled-tonal-current-label-color);
        }

        .icon mdc-icon {
            font-size: var(--_resolved-icon-size);
        }
    }

    @layer mdc.breadcrumbs.item.a11y {
        @media (forced-colors: active) {
            .item {
                border: 1px solid ButtonBorder;
                color: LinkText;
                background: Canvas;
            }
            .item.current {
                color: CanvasText;
                border-color: Highlight;
            }
            .item.disabled {
                color: GrayText;
                border-color: GrayText;
                opacity: 1;
            }
        }

        @media (prefers-contrast: more) {
            .item {
                outline: 1px solid currentColor;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .item {
                transition: none;
            }
        }
    }
`

export const BreadcrumbsStyles = css`
    @layer mdc.breadcrumbs.variable {
        :host { ${Tokens}; }
    }
    ${BreadcrumbsStylePart}
`

export const BreadcrumbItemStyles = css`
    @layer mdc.breadcrumbs.item.variable {
        :host { ${Tokens}; }
    }
    ${BreadcrumbItemStylePart}
`

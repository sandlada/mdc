/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { stringifyTokens } from '../../utils/style'
import { PaginationDefinition } from './pagination.definition'

const Tokens = stringifyTokens('--mdc-pagination')(PaginationDefinition)

const StylePart = css`
    @layer mdc.pagination.base {
        :host {
            box-sizing: border-box;
            position: relative;
            display: inline-flex;
            align-items: center;
            vertical-align: middle;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
        }

        :host([hidden]) {
            display: none;
        }

        :host([size='small']) {
            --_resolved-item-size: var(--_small-item-size);
            --_resolved-item-gap: var(--_small-item-gap);
            --_resolved-icon-size: var(--_small-icon-size);
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
            --_resolved-item-size: var(--_medium-item-size);
            --_resolved-item-gap: var(--_medium-item-gap);
            --_resolved-icon-size: var(--_medium-icon-size);
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
            --_resolved-item-size: var(--_large-item-size);
            --_resolved-item-gap: var(--_large-item-gap);
            --_resolved-icon-size: var(--_large-icon-size);
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

        .nav {
            display: inline-flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--_section-gap);
        }

        .page-list {
            display: inline-flex;
            align-items: center;
            gap: var(--_resolved-item-gap);
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .page-button,
        .control-button {
            box-sizing: border-box;
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: var(--_resolved-item-size);
            height: var(--_resolved-item-size);
            padding-inline: 8px;
            padding-block: 0;
            margin: 0;
            border: none;
            outline: none;
            cursor: pointer;
            background-color: var(--_enabled-item-container-color);
            color: var(--_enabled-item-label-color);
            font-family: var(--_resolved-label-font);
            font-size: var(--_resolved-label-size);
            line-height: var(--_resolved-label-leading);
            letter-spacing: var(--_resolved-label-tracking);
            font-weight: var(--_resolved-label-weight);
            border-start-start-radius: var(--_round-item-shape-start-start);
            border-start-end-radius: var(--_round-item-shape-start-end);
            border-end-end-radius: var(--_round-item-shape-end-end);
            border-end-start-radius: var(--_round-item-shape-end-start);
            transition: background-color 150ms cubic-bezier(0.2, 0, 0, 1),
                color 150ms cubic-bezier(0.2, 0, 0, 1),
                border-radius 150ms cubic-bezier(0.2, 0, 0, 1);
        }

        .control-button {
            width: var(--_resolved-item-size);
            padding-inline: 0;
            color: var(--_enabled-control-icon-color);
        }

        .ellipsis {
            box-sizing: border-box;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: var(--_resolved-item-size);
            height: var(--_resolved-item-size);
            color: var(--_enabled-ellipsis-color);
            pointer-events: none;
            user-select: none;
        }

        :host([shape='square']) .page-button,
        :host([shape='square']) .control-button {
            border-start-start-radius: var(--_resolved-square-ss);
            border-start-end-radius: var(--_resolved-square-se);
            border-end-end-radius: var(--_resolved-square-ee);
            border-end-start-radius: var(--_resolved-square-es);
        }

        .page-button.selected {
            background-color: var(--_enabled-selected-item-container-color);
            color: var(--_enabled-selected-item-label-color);
        }

        :host([shape='square']) .page-button.selected {
            border-start-start-radius: var(--_round-item-shape-start-start);
            border-start-end-radius: var(--_round-item-shape-start-end);
            border-end-end-radius: var(--_round-item-shape-end-end);
            border-end-start-radius: var(--_round-item-shape-end-start);
        }

        .page-button:disabled,
        .control-button:disabled {
            cursor: default;
            pointer-events: none;
            opacity: var(--_disabled-content-opacity);
        }

        .page-button mdc-ripple,
        .control-button mdc-ripple {
            --mdc-ripple-hover-color: currentColor;
            --mdc-ripple-pressed-color: currentColor;
            --mdc-ripple-hover-opacity: var(--_hovered-state-layer-opacity);
            --mdc-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
            border-radius: inherit;
        }

        .page-button mdc-focus-ring,
        .control-button mdc-focus-ring {
            z-index: 1;
        }

        mdc-icon {
            font-size: var(--_resolved-icon-size);
            width: var(--_resolved-icon-size);
            height: var(--_resolved-icon-size);
        }

        .range-text,
        .simple-status,
        .page-size-label,
        .jumper-label {
            color: var(--_enabled-supporting-text-color);
            font-family: var(--_supporting-label-font);
            font-size: var(--_supporting-label-size);
            line-height: var(--_supporting-label-leading);
            letter-spacing: var(--_supporting-label-tracking);
            font-weight: var(--_supporting-label-weight);
            white-space: nowrap;
        }

        .simple-status {
            color: var(--_enabled-item-label-color);
            padding-inline: 8px;
        }

        .page-size-group,
        .jumper-group {
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .page-size-select {
            min-width: 88px;
            --mdc-field-container-height: var(--_resolved-item-size);
        }

        .jumper-input {
            box-sizing: border-box;
            width: 56px;
            height: var(--_resolved-item-size);
            padding-inline: 8px;
            border: 1px solid var(--_enabled-jumper-outline-color);
            border-radius: var(--_resolved-square-ss);
            background: transparent;
            color: var(--_enabled-item-label-color);
            font-family: var(--_resolved-label-font);
            font-size: var(--_resolved-label-size);
            text-align: center;
            outline: none;
        }

        .jumper-input:focus {
            border-color: var(--_focused-jumper-outline-color);
            border-width: 2px;
        }

        .jumper-input:disabled {
            opacity: var(--_disabled-content-opacity);
            pointer-events: none;
        }

        /* Dots variant (Android HorizontalPager indicator) */
        .dots-list {
            display: inline-flex;
            align-items: center;
            gap: var(--_dot-gap);
            list-style: none;
            padding: 4px;
            margin: 0;
        }

        .dot-button {
            box-sizing: border-box;
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: var(--_dot-size);
            height: var(--_dot-size);
            padding: 0;
            margin: 0;
            border: none;
            outline: none;
            cursor: pointer;
            border-radius: var(--_round-item-shape-start-start);
            background-color: var(--_dot-color);
            transition: width 250ms cubic-bezier(0.2, 0, 0, 1),
                height 250ms cubic-bezier(0.2, 0, 0, 1),
                background-color 200ms cubic-bezier(0.2, 0, 0, 1),
                transform 200ms cubic-bezier(0.2, 0, 0, 1);
        }

        .dot-button.scale-active {
            width: var(--_active-dot-width);
            background-color: var(--_active-dot-color);
        }

        .dot-button.scale-medium {
            width: var(--_dot-medium-size);
            height: var(--_dot-medium-size);
        }

        .dot-button.scale-small {
            width: var(--_dot-small-size);
            height: var(--_dot-small-size);
        }

        .dot-button:disabled {
            cursor: default;
            pointer-events: none;
            opacity: var(--_disabled-content-opacity);
        }
    }

    @layer mdc.pagination.a11y {
        @media (forced-colors: active) {
            .page-button,
            .control-button,
            .dot-button {
                forced-color-adjust: none;
                border: 1px solid ButtonText;
                background-color: ButtonFace;
                color: ButtonText;
            }

            .page-button.selected,
            .dot-button.scale-active {
                background-color: Highlight;
                color: HighlightText;
                border-color: Highlight;
            }

            .page-button:disabled,
            .control-button:disabled,
            .dot-button:disabled {
                border-color: GrayText;
                color: GrayText;
            }
        }

        @media (prefers-contrast: more) {
            .page-button,
            .control-button {
                border: 1px solid currentColor;
            }
        }

        @media (prefers-contrast: less) {
            .page-button,
            .control-button,
            .dot-button {
                opacity: 0.9;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .page-button,
            .control-button,
            .dot-button {
                transition: none;
            }
        }
    }
`

export const PaginationStyles = [
    css`:host {${Tokens};}`,
    StylePart,
]

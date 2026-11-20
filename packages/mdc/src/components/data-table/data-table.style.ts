/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { stringifyTokens } from '../../utils/style'
import { DataTableDefinition } from './data-table.definition'

const Tokens = stringifyTokens('--mdc-data-table')(DataTableDefinition)

const StylePart = css`
    @layer mdc.data-table.base {
        :host {
            box-sizing: border-box;
            position: relative;
            display: block;
            width: 100%;
            -webkit-tap-highlight-color: transparent;
        }

        :host([hidden]) {
            display: none;
        }

        :host([size='small']) {
            --_resolved-header-height: var(--_small-header-height);
            --_resolved-row-height: var(--_small-row-height);
            --_resolved-cell-padding-inline: var(--_small-cell-padding-inline);
        }

        :host([size='medium']),
        :host(:not([size])) {
            --_resolved-header-height: var(--_medium-header-height);
            --_resolved-row-height: var(--_medium-row-height);
            --_resolved-cell-padding-inline: var(--_medium-cell-padding-inline);
        }

        :host([size='large']) {
            --_resolved-header-height: var(--_large-header-height);
            --_resolved-row-height: var(--_large-row-height);
            --_resolved-cell-padding-inline: var(--_large-cell-padding-inline);
        }

        .container {
            position: relative;
            display: flex;
            flex-direction: column;
            width: 100%;
            overflow: hidden;
            isolation: isolate;
            border-start-start-radius: var(--_container-shape-start-start);
            border-start-end-radius: var(--_container-shape-start-end);
            border-end-start-radius: var(--_container-shape-end-start);
            border-end-end-radius: var(--_container-shape-end-end);
            background-color: var(--_enabled-outlined-container-color);
            border: var(--_outline-width) solid var(--_enabled-outlined-outline-color);
        }

        :host([variant='filled']) .container {
            background-color: var(--_enabled-filled-container-color);
            border-color: transparent;
        }

        :host([variant='elevated']) .container {
            background-color: var(--_enabled-elevated-container-color);
            border-color: transparent;
        }

        .container mdc-elevation {
            --mdc-elevation-level: var(--_enabled-elevated-elevation);
            --mdc-elevation-shadow-color: var(--_enabled-elevated-shadow-color);
            z-index: -1;
        }

        .toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            min-height: var(--_toolbar-height);
            padding-inline: var(--_toolbar-padding-inline);
            background-color: var(--_enabled-toolbar-color);
            color: var(--_enabled-toolbar-label-color);
            border-bottom: var(--_outline-width) solid var(--_enabled-divider-color);
        }

        .toolbar.is-selection-active {
            background-color: var(--_enabled-selection-bar-color);
            color: var(--_enabled-selection-bar-label-color);
        }

        .toolbar-start {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 0;
        }

        .toolbar-title {
            margin: 0;
            font-family: var(--_toolbar-title-font);
            font-size: var(--_toolbar-title-size);
            line-height: var(--_toolbar-title-leading);
            font-weight: var(--_toolbar-title-weight);
            letter-spacing: var(--_toolbar-title-tracking);
        }

        .selection-count {
            font-family: var(--_toolbar-title-font);
            font-size: var(--_header-label-size);
            line-height: var(--_header-label-leading);
            font-weight: var(--_header-label-weight);
            letter-spacing: var(--_header-label-tracking);
        }

        .toolbar-end {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
        }

        .scroll-area {
            position: relative;
            width: 100%;
            overflow-x: auto;
            overflow-y: auto;
        }

        .loading-bar {
            position: absolute;
            inset-inline: 0;
            top: 0;
            z-index: 1;
            pointer-events: none;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            border-spacing: 0;
            text-align: start;
        }

        thead th {
            height: var(--_resolved-header-height);
            padding-inline: var(--_resolved-cell-padding-inline);
            background-color: var(--_enabled-header-container-color);
            color: var(--_enabled-header-label-color);
            font-family: var(--_header-label-font);
            font-size: var(--_header-label-size);
            line-height: var(--_header-label-leading);
            font-weight: var(--_header-label-weight);
            letter-spacing: var(--_header-label-tracking);
            border-bottom: var(--_outline-width) solid var(--_enabled-divider-color);
            white-space: nowrap;
            user-select: none;
            vertical-align: middle;
        }

        :host([sticky-header]) thead th {
            position: sticky;
            top: 0;
            z-index: 1;
        }

        thead th.is-sorted {
            color: var(--_enabled-header-sorted-label-color);
        }

        th.align-start,
        td.align-start {
            text-align: start;
        }

        th.align-center,
        td.align-center {
            text-align: center;
        }

        th.align-end,
        td.align-end {
            text-align: end;
        }

        td.is-numeric,
        th.is-numeric {
            font-variant-numeric: tabular-nums;
        }

        .checkbox-cell {
            width: var(--_checkbox-column-width);
            min-width: var(--_checkbox-column-width);
            padding-inline: 8px;
            text-align: center;
        }

        .expand-cell {
            width: var(--_expand-column-width);
            min-width: var(--_expand-column-width);
            padding-inline: 4px;
            text-align: center;
        }

        .expand-icon {
            transition: transform 200ms cubic-bezier(0.2, 0, 0, 1);
        }

        .expand-button.is-expanded .expand-icon {
            transform: rotate(180deg);
        }

        th.sticky-start,
        td.sticky-start {
            position: sticky;
            inset-inline-start: 0;
            z-index: 1;
            background-color: var(--_enabled-sticky-cell-color);
        }

        th.sticky-end,
        td.sticky-end {
            position: sticky;
            inset-inline-end: 0;
            z-index: 1;
            background-color: var(--_enabled-sticky-cell-color);
        }

        thead th.sticky-start,
        thead th.sticky-end {
            background-color: var(--_enabled-header-container-color);
        }

        td.is-ellipsis {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .sort-button {
            appearance: none;
            background: none;
            border: none;
            padding: 0;
            margin: 0;
            color: inherit;
            font: inherit;
            letter-spacing: inherit;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            vertical-align: middle;
            border-radius: 4px;
        }

        .sort-button:focus-visible {
            outline: 2px solid currentColor;
            outline-offset: 2px;
        }

        th.align-end .sort-button {
            flex-direction: row-reverse;
        }

        .sort-icon {
            --mdc-icon-size: var(--_sort-icon-size);
            font-size: var(--_sort-icon-size);
            color: var(--_enabled-sort-icon-color);
            opacity: 0;
            transform: rotate(0deg);
            transition: opacity 150ms cubic-bezier(0.2, 0, 0, 1), transform 200ms cubic-bezier(0.2, 0, 0, 1);
        }

        .sort-button:hover .sort-icon,
        .sort-button:focus-visible .sort-icon {
            opacity: 0.6;
        }

        th.is-sorted .sort-icon {
            opacity: 1;
            color: var(--_enabled-sorted-icon-color);
        }

        th.sort-descending .sort-icon {
            transform: rotate(180deg);
        }

        tbody tr {
            position: relative;
            height: var(--_resolved-row-height);
            background-color: var(--_enabled-row-container-color);
            color: var(--_enabled-row-label-color);
            transition: background-color 150ms cubic-bezier(0.2, 0, 0, 1);
        }

        :host([striped]) tbody tr:nth-child(even) {
            background-color: var(--_enabled-striped-row-color);
        }

        .container.is-hoverable tbody tr:not(.is-disabled):hover {
            background-color: color-mix(
                in srgb,
                var(--_hovered-state-layer-color) calc(var(--_hovered-state-layer-opacity) * 100%),
                transparent
            );
        }

        tbody tr.is-selectable {
            cursor: pointer;
        }

        tbody tr.is-selectable:focus-visible {
            outline: 2px solid var(--_enabled-sorted-icon-color);
            outline-offset: -2px;
        }

        tbody tr.expanded-row {
            height: auto;
            background-color: var(--_enabled-expanded-row-color);
        }

        tbody tr.expanded-row:hover {
            background-color: var(--_enabled-expanded-row-color);
        }

        tbody td.expanded-cell {
            height: auto;
            padding: 16px var(--_resolved-cell-padding-inline);
        }

        tbody tr.is-selected {
            background-color: color-mix(
                in srgb,
                var(--_enabled-selected-row-color) calc(var(--_enabled-selected-row-opacity) * 100%),
                transparent
            );
        }

        tbody tr.is-selected:hover {
            background-color: color-mix(
                in srgb,
                var(--_enabled-selected-row-color) calc(var(--_enabled-selected-row-opacity) * 100% + var(--_hovered-state-layer-opacity) * 100%),
                transparent
            );
        }

        tbody tr.is-disabled {
            opacity: var(--_disabled-content-opacity);
            cursor: default;
        }

        tbody td {
            height: var(--_resolved-row-height);
            padding-inline: var(--_resolved-cell-padding-inline);
            font-family: var(--_cell-label-font);
            font-size: var(--_cell-label-size);
            line-height: var(--_cell-label-leading);
            font-weight: var(--_cell-label-weight);
            letter-spacing: var(--_cell-label-tracking);
            border-bottom: var(--_outline-width) solid var(--_enabled-divider-color);
            vertical-align: middle;
        }

        tbody tr:last-child td {
            border-bottom: none;
        }

        .empty-cell {
            padding: 32px 16px;
            text-align: center;
            color: var(--_enabled-supporting-text-color);
            font-family: var(--_empty-label-font);
            font-size: var(--_empty-label-size);
            line-height: var(--_empty-label-leading);
            font-weight: var(--_empty-label-weight);
            letter-spacing: var(--_empty-label-tracking);
        }

        .footer {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-inline: 16px;
            padding-block: 4px;
            border-top: var(--_outline-width) solid var(--_enabled-divider-color);
            background-color: var(--_enabled-toolbar-color);
        }

        .footer:empty {
            display: none;
        }
    }

    @layer mdc.data-table.a11y {
        @media (forced-colors: active) {
            .container {
                forced-color-adjust: none;
                border: 1px solid CanvasText;
                background-color: Canvas;
                color: CanvasText;
            }

            thead th {
                background-color: Canvas;
                color: CanvasText;
                border-bottom: 1px solid CanvasText;
            }

            tbody td {
                border-bottom: 1px solid GrayText;
            }

            tbody tr.is-selected {
                background-color: Highlight;
                color: HighlightText;
            }

            tbody tr.is-disabled {
                color: GrayText;
            }
        }

        @media (prefers-contrast: more) {
            .container {
                border-color: currentColor;
            }

            thead th,
            tbody td,
            .toolbar,
            .footer {
                border-color: currentColor;
            }
        }

        @media (prefers-contrast: less) {
            .sort-icon {
                transition: none;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .sort-icon,
            .expand-icon,
            tbody tr {
                transition: none;
            }
        }

        @media (prefers-reduced-transparency: reduce) {
            tbody tr.is-selected {
                background-color: var(--_enabled-selected-row-color);
            }
        }
    }
`

export const DataTableStyles = [Tokens, StylePart]

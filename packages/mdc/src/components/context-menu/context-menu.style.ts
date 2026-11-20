/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { overrideTokens, stringifyTokens } from '../../utils/style'
import type { ElevationDefinition } from '../elevation/elevation.definition'
import {
    StandardContextMenuDefinition,
    VibrantContextMenuDefinition,
} from './context-menu.definition'

const Stringify = stringifyTokens('--mdc-context-menu')
const StandardTokens = Stringify(StandardContextMenuDefinition)
const VibrantTokens = Stringify(VibrantContextMenuDefinition)

const ElevationBridge = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_enabled-container-elevation)`,
})()

const VariablePart = css`
    @layer mdc.context-menu.variable {
        :host([variant='standard']),
        :host(:not([variant])) {
            ${StandardTokens};
        }
        :host([variant='vibrant']) {
            ${VibrantTokens};
        }
    }
`

const ComponentPart = css`
    @layer mdc.context-menu.component {
        :host {
            display: contents;
            isolation: isolate;
        }

        .target {
            display: block;
            user-select: none;
            -webkit-touch-callout: none;
            transition: transform 160ms cubic-bezier(0.2, 0, 0, 1);
            transform-origin: center;
        }

        :host([pressing]) .target {
            transform: scale(0.985);
        }

        :host(:not([open])) .surface {
            display: none;
        }

        .surface,
        .submenu-surface {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 1;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            min-width: var(--_enabled-container-min-width);
            max-width: var(--_enabled-container-max-width);
            max-height: var(--_enabled-container-max-height);
            padding-block-start: var(--_enabled-container-padding-block-start);
            padding-block-end: var(--_enabled-container-padding-block-end);
            padding-inline-start: var(--_enabled-container-padding-inline-start);
            padding-inline-end: var(--_enabled-container-padding-inline-end);
            border-start-start-radius: var(--_enabled-container-shape-start-start);
            border-start-end-radius: var(--_enabled-container-shape-start-end);
            border-end-end-radius: var(--_enabled-container-shape-end-end);
            border-end-start-radius: var(--_enabled-container-shape-end-start);
            background-color: var(--_enabled-container-color);
            outline: none;
        }

        .elevation {
            ${ElevationBridge};
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            z-index: -1;
        }

        .list {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            gap: 2px;
            overflow-y: auto;
            min-width: 0;
        }

        .menu-label {
            display: flex;
            align-items: center;
            height: var(--_enabled-group-label-height);
            padding-inline: var(--_enabled-item-padding-inline);
            color: var(--_enabled-group-label-color);
            font-family: var(--_enabled-group-label-font);
            font-size: var(--_enabled-group-label-size);
            line-height: var(--_enabled-group-label-leading);
            font-weight: var(--_enabled-group-label-weight);
            letter-spacing: var(--_enabled-group-label-tracking);
        }

        .menu-divider {
            height: var(--_enabled-divider-thickness);
            margin-block: 4px;
            margin-inline: 8px;
            background-color: var(--_enabled-divider-color);
            flex-shrink: 0;
        }

        .menu-item {
            position: relative;
            display: flex;
            align-items: center;
            gap: var(--_enabled-item-gap);
            width: 100%;
            min-height: var(--_enabled-item-height);
            padding-inline: var(--_enabled-item-padding-inline);
            padding-block: 0;
            border: none;
            border-start-start-radius: var(--_enabled-item-shape-start-start);
            border-start-end-radius: var(--_enabled-item-shape-start-end);
            border-end-end-radius: var(--_enabled-item-shape-end-end);
            border-end-start-radius: var(--_enabled-item-shape-end-start);
            background: transparent;
            color: var(--_enabled-item-label-color);
            font-family: var(--_enabled-item-label-font);
            font-size: var(--_enabled-item-label-size);
            line-height: var(--_enabled-item-label-leading);
            font-weight: var(--_enabled-item-label-weight);
            letter-spacing: var(--_enabled-item-label-tracking);
            text-align: start;
            cursor: pointer;
            outline: none;
            box-sizing: border-box;
        }

        .menu-item mdc-ripple {
            border-radius: inherit;
        }

        .menu-item mdc-focus-ring {
            border-radius: inherit;
        }

        .menu-item[aria-checked='true'] {
            background-color: var(--_enabled-item-selected-container-color);
            color: var(--_enabled-item-selected-label-color);
        }

        .menu-item.destructive {
            color: var(--_enabled-item-destructive-color);
        }

        .menu-item[aria-disabled='true'] {
            opacity: var(--_disabled-content-opacity);
            cursor: default;
            pointer-events: none;
        }

        .item-indicator,
        .item-icon,
        .submenu-arrow {
            --mdc-icon-size: var(--_enabled-icon-size);
            color: var(--_enabled-item-icon-color);
            flex-shrink: 0;
        }

        .item-indicator-placeholder {
            width: var(--_enabled-icon-size);
            height: var(--_enabled-icon-size);
            flex-shrink: 0;
        }

        .menu-item.destructive .item-icon {
            color: var(--_enabled-item-destructive-color);
        }

        .menu-item[aria-checked='true'] .item-indicator,
        .menu-item[aria-checked='true'] .item-icon {
            color: var(--_enabled-item-selected-label-color);
        }

        .item-label {
            flex: 1 1 auto;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .item-shortcut {
            flex-shrink: 0;
            padding-inline-start: 12px;
            color: var(--_enabled-item-shortcut-color);
            font-family: var(--_enabled-item-shortcut-font);
            font-size: var(--_enabled-item-shortcut-size);
            line-height: var(--_enabled-item-shortcut-leading);
            font-weight: var(--_enabled-item-shortcut-weight);
            letter-spacing: var(--_enabled-item-shortcut-tracking);
        }

        .submenu-row {
            position: relative;
        }
    }
`

const A11yPart = css`
    @layer mdc.context-menu.a11y {
        @media (prefers-reduced-motion: reduce) {
            .target {
                transition: none;
            }
        }

        @media (prefers-contrast: more) {
            .surface,
            .submenu-surface {
                border: 2px solid currentColor;
            }
            .menu-item:focus-visible {
                outline: 2px solid currentColor;
                outline-offset: -2px;
            }
        }

        @media (prefers-contrast: less) {
            .menu-divider {
                opacity: 0.6;
            }
        }

        @media (forced-colors: active) {
            .surface,
            .submenu-surface {
                background-color: Canvas;
                color: CanvasText;
                border: 1px solid CanvasText;
            }
            .menu-item {
                color: CanvasText;
            }
            .menu-item[aria-checked='true'] {
                background-color: Highlight;
                color: HighlightText;
            }
            .menu-item[aria-disabled='true'] {
                color: GrayText;
                opacity: 1;
            }
            .menu-item:focus-visible {
                outline: 2px solid Highlight;
                outline-offset: -2px;
            }
        }
    }
`

export const ContextMenuStyles = [VariablePart, ComponentPart, A11yPart]

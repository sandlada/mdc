/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import type { FocusRingDefinition } from '../focus-ring/focus-ring.definition'
import type { IconDefinition } from '../icon/icon.definition'
import type { RippleDefinition } from '../ripple/ripple.definition'
import { LegacyMenuItemDefinition } from './legacy-menu-item.definition'
import { overrideTokens, stringifyTokens } from '../../utils/style'

const legacyMenuItemTokens = stringifyTokens('--mdc-legacy-menu-item')(LegacyMenuItemDefinition)

const emphasizedEasing = unsafeCSS(Easing.Emphasized.ToCSSValue())

const rippleStyles = overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'enabled-hovered-color': `var(--_hovered-state-layer-color)`,
    'enabled-focused-color': `var(--_focused-state-layer-color)`,
    'enabled-pressed-color': `var(--_pressed-state-layer-color)`,
    'enabled-hovered-opacity': `var(--_hovered-state-layer-opacity)`,
    'enabled-focused-opacity': `var(--_focused-state-layer-opacity)`,
    'enabled-pressed-opacity': `var(--_pressed-state-layer-opacity)`,
})()

const focusRingStyles = overrideTokens<typeof FocusRingDefinition>('--mdc-focus-ring')({
    'shape-start-start': `var(--_enabled-container-shape-start-start)`,
    'shape-start-end': `var(--_enabled-container-shape-start-end)`,
    'shape-end-start': `var(--_enabled-container-shape-end-start)`,
    'shape-end-end': `var(--_enabled-container-shape-end-end)`,
})()

const leadingIconStyles = overrideTokens<typeof IconDefinition>('--mdc-icon')({
    'enabled-size': `var(--_enabled-leading-icon-size)`,
})()

const trailingIconStyles = overrideTokens<typeof IconDefinition>('--mdc-icon')({
    'enabled-size': `var(--_enabled-trailing-icon-size)`,
})()

export const LegacyMenuItemStyles = css`
    @layer mdc.legacy-menu-item.variable {
        :host { ${legacyMenuItemTokens}; }
    }

    @layer mdc.legacy-menu-item.base {
        :host {
            display: block;
            outline: none;
            -webkit-tap-highlight-color: transparent;
        }

        .container {
            all: unset;
            position: relative;
            box-sizing: border-box;
            display: flex;
            align-items: stretch;
            width: 100%;
            height: var(--_enabled-container-height);
            padding-inline-start: var(--_enabled-container-padding-inline-start);
            padding-inline-end: var(--_enabled-container-padding-inline-end);
            padding-block-start: var(--_enabled-container-padding-block-start);
            padding-block-end: var(--_enabled-container-padding-block-end);
            border-start-start-radius: var(--_enabled-container-shape-start-start);
            border-start-end-radius: var(--_enabled-container-shape-start-end);
            border-end-start-radius: var(--_enabled-container-shape-end-start);
            border-end-end-radius: var(--_enabled-container-shape-end-end);
            background-color: var(--_enabled-container-color);
            color: var(--_enabled-label-color);
            text-align: start;
            cursor: pointer;
            outline: none;
            -webkit-tap-highlight-color: transparent;
            transition: background-color 200ms ${emphasizedEasing};
        }

        .container:hover {
            background-color: var(--_hovered-container-color);
        }
        .container:focus-visible {
            background-color: var(--_focused-container-color);
        }
        .container:active {
            background-color: var(--_pressed-container-color);
        }

        .container.disabled {
            cursor: default;
            pointer-events: none;
            background-color: var(--_disabled-container-color);
            color: var(--_disabled-label-color);
            opacity: var(--_disabled-label-opacity);
        }
    }

    @layer mdc.legacy-menu-item.layout {
        .item {
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            flex: 1;
            min-width: 0;
            gap: var(--_enabled-leading-icon-label-space);
        }

        .leading {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            min-width: 0;
            color: var(--_enabled-leading-icon-color);
            ${leadingIconStyles};
        }

        :host(:not([has-leading])) .leading {
            display: none;
        }

        ::slotted([slot='leading']) {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            inline-size: var(--_enabled-leading-icon-size);
            block-size: var(--_enabled-leading-icon-size);
            font-size: var(--_enabled-leading-icon-size);
        }

        .content {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-self: stretch;
            flex: 1;
            min-width: 0;
        }

        :host(:not([has-supporting])) .supporting {
            display: none;
        }

        .end {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            min-width: 0;
            gap: var(--_enabled-label-trailing-icon-space);
            color: var(--_enabled-trailing-icon-color);
            ${trailingIconStyles};
        }

        :host(:not([has-end])) .end {
            display: none;
        }

        ::slotted([slot='trailing']) {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            inline-size: var(--_enabled-trailing-icon-size);
            block-size: var(--_enabled-trailing-icon-size);
            font-size: var(--_enabled-trailing-icon-size);
        }

        .shortcut,
        .badge {
            flex-shrink: 0;
        }

        .touch-target {
            position: absolute;
            top: 50%;
            left: 50%;
            height: 48px;
            width: 100%;
            transform: translate(-50%, -50%);
            pointer-events: none;
        }
    }

    @layer mdc.legacy-menu-item.label {
        .label,
        .supporting,
        .shortcut,
        .badge {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .label {
            display: block;
            font-family: var(--_enabled-label-font);
            font-size: var(--_enabled-label-size);
            font-weight: var(--_enabled-label-weight);
            letter-spacing: var(--_enabled-label-tracking);
            line-height: var(--_enabled-label-leading);
            color: var(--_enabled-label-color);
        }

        .supporting {
            display: block;
            font-family: var(--_enabled-label-font);
            font-size: var(--_enabled-label-size);
            font-weight: var(--_enabled-label-weight);
            letter-spacing: var(--_enabled-label-tracking);
            line-height: var(--_enabled-label-leading);
            color: var(--_enabled-shortcut-label-color);
        }

        .shortcut,
        .badge {
            font-family: var(--_enabled-label-font);
            font-size: var(--_enabled-label-size);
            font-weight: var(--_enabled-label-weight);
            letter-spacing: var(--_enabled-label-tracking);
            line-height: var(--_enabled-label-leading);
            color: var(--_enabled-shortcut-label-color);
        }
    }

    @layer mdc.legacy-menu-item.composite.ripple {
        .container mdc-ripple {
            border-radius: inherit;
            z-index: 0;
            ${rippleStyles};
        }
    }

    @layer mdc.legacy-menu-item.composite.focus-ring {
        .container mdc-focus-ring {
            border-radius: inherit;
            z-index: 1;
            ${focusRingStyles};
        }
    }

    @layer mdc.legacy-menu-item.composite.selected {
        .container.selected {
            background-color: var(--_enabled-container-color-selected);
            color: var(--_enabled-label-color-selected);
        }
        .container.selected:hover {
            background-color: var(--_hovered-container-color-selected);
        }
        .container.selected:focus-visible {
            background-color: var(--_focused-container-color-selected);
        }
        .container.selected:active {
            background-color: var(--_pressed-container-color-selected);
        }

        .container.selected .label {
            color: var(--_enabled-label-color-selected);
        }
        .container.selected .leading {
            color: var(--_enabled-leading-icon-color-selected);
        }
        .container.selected .end {
            color: var(--_enabled-trailing-icon-color-selected);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .container {
            transition: none;
        }
    }

    @media (forced-colors: active) {
        .container.selected {
            background-color: Highlight;
            color: HighlightText;
        }
        .container.selected .label {
            color: HighlightText;
        }
        .container.disabled {
            opacity: 1;
            color: GrayText;
        }
        .container {
            border: 1px solid CanvasText;
        }
    }

    @media (prefers-contrast: more) {
        .container {
            border: 1px solid CanvasText;
        }
        .container.selected {
            border-width: 2px;
        }
        .label {
            color: CanvasText;
        }
    }

    @media (prefers-contrast: less) {
        .container {
            border: 1px solid GrayText;
        }
        .label,
        .supporting,
        .shortcut,
        .badge {
            color: GrayText;
        }
    }

    @media (prefers-reduced-transparency: reduce) {
        .container {
            backdrop-filter: none;
        }
    }
`

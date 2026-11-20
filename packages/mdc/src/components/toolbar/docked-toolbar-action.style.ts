/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { overrideTokens, stringifyTokens } from '../../utils/style'
import type { FocusRingDefinition } from '../focus-ring/focus-ring.definition'
import type { RippleDefinition } from '../ripple/ripple.definition'
import { DockedToolbarActionDefinition } from './toolbar.definition'

const ActionTokens = stringifyTokens('--mdc-docked-toolbar-action')(DockedToolbarActionDefinition)

const StandardRippleBridge = overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'enabled-hovered-color': 'var(--_enabled-standard-icon-color)',
    'enabled-focused-color': 'var(--_enabled-standard-icon-color)',
    'enabled-pressed-color': 'var(--_enabled-standard-icon-color)',
    'enabled-hovered-opacity': 'var(--_hovered-state-layer-opacity)',
    'enabled-focused-opacity': 'var(--_focused-state-layer-opacity)',
    'enabled-pressed-opacity': 'var(--_pressed-state-layer-opacity)',
})()

const StandardSelectedRippleBridge = overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'enabled-hovered-color': 'var(--_enabled-standard-selected-icon-color)',
    'enabled-focused-color': 'var(--_enabled-standard-selected-icon-color)',
    'enabled-pressed-color': 'var(--_enabled-standard-selected-icon-color)',
    'enabled-hovered-opacity': 'var(--_hovered-state-layer-opacity)',
    'enabled-focused-opacity': 'var(--_focused-state-layer-opacity)',
    'enabled-pressed-opacity': 'var(--_pressed-state-layer-opacity)',
})()

const VibrantRippleBridge = overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'enabled-hovered-color': 'var(--_enabled-vibrant-icon-color)',
    'enabled-focused-color': 'var(--_enabled-vibrant-icon-color)',
    'enabled-pressed-color': 'var(--_enabled-vibrant-icon-color)',
    'enabled-hovered-opacity': 'var(--_hovered-state-layer-opacity)',
    'enabled-focused-opacity': 'var(--_focused-state-layer-opacity)',
    'enabled-pressed-opacity': 'var(--_pressed-state-layer-opacity)',
})()

const VibrantSelectedRippleBridge = overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'enabled-hovered-color': 'var(--_enabled-vibrant-selected-icon-color)',
    'enabled-focused-color': 'var(--_enabled-vibrant-selected-icon-color)',
    'enabled-pressed-color': 'var(--_enabled-vibrant-selected-icon-color)',
    'enabled-hovered-opacity': 'var(--_hovered-state-layer-opacity)',
    'enabled-focused-opacity': 'var(--_focused-state-layer-opacity)',
    'enabled-pressed-opacity': 'var(--_pressed-state-layer-opacity)',
})()

const ActionFocusRingBridge = overrideTokens<typeof FocusRingDefinition>('--mdc-focus-ring')({
    'shape-start-start': 'var(--_enabled-container-shape-start-start)',
    'shape-start-end': 'var(--_enabled-container-shape-start-end)',
    'shape-end-start': 'var(--_enabled-container-shape-end-start)',
    'shape-end-end': 'var(--_enabled-container-shape-end-end)',
})()

export const DockedToolbarActionStyles = css`
    @layer mdc.docked-toolbar-action {
        :host {
            ${ActionTokens};
            display: inline-flex;
            align-items: center;
            justify-content: center;
            vertical-align: middle;
            min-width: 48px;
            min-height: 48px;
            -webkit-tap-highlight-color: transparent;
        }

        :host([hidden]) {
            display: none !important;
        }

        .action {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: var(--_icon-label-gap);
            min-width: var(--_container-min-width);
            height: var(--_container-height);
            padding-inline-start: var(--_container-padding-inline-start);
            padding-inline-end: var(--_container-padding-inline-end);
            border: none;
            outline: none;
            background: transparent;
            cursor: pointer;
            user-select: none;
            box-sizing: border-box;
            border-start-start-radius: var(--_enabled-container-shape-start-start);
            border-start-end-radius: var(--_enabled-container-shape-start-end);
            border-end-start-radius: var(--_enabled-container-shape-end-start);
            border-end-end-radius: var(--_enabled-container-shape-end-end);
            font-family: var(--_label-font);
            font-size: var(--_label-size);
            line-height: var(--_label-leading);
            font-weight: var(--_label-weight);
            letter-spacing: var(--_label-tracking);
            transition: background-color 200ms cubic-bezier(0.2, 0, 0, 1), color 200ms cubic-bezier(0.2, 0, 0, 1);
        }

        .action.standard {
            ${StandardRippleBridge};
            background-color: var(--_enabled-standard-container-color);
            color: var(--_enabled-standard-icon-color);
        }

        .action.standard.selected {
            ${StandardSelectedRippleBridge};
            background-color: var(--_enabled-standard-selected-container-color);
            color: var(--_enabled-standard-selected-icon-color);
        }

        .action.vibrant {
            ${VibrantRippleBridge};
            background-color: var(--_enabled-vibrant-container-color);
            color: var(--_enabled-vibrant-icon-color);
        }

        .action.vibrant.selected {
            ${VibrantSelectedRippleBridge};
            background-color: var(--_enabled-vibrant-selected-container-color);
            color: var(--_enabled-vibrant-selected-icon-color);
        }

        .action:disabled {
            cursor: default;
            pointer-events: none;
            color: var(--_disabled-icon-color);
            opacity: var(--_disabled-icon-opacity);
        }

        .action mdc-focus-ring {
            ${ActionFocusRingBridge};
        }

        .icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: var(--_icon-size);
            line-height: 1;
        }

        .label:empty {
            display: none;
        }

        @media (prefers-reduced-motion: reduce) {
            .action {
                transition: none;
            }
        }

        @media (forced-colors: active) {
            .action.selected {
                outline: 2px solid SelectedItem;
            }
        }
    }
`

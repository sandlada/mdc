/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { overrideTokens, stringifyTokens } from '../../utils/style'
import type { IconDefinition } from '../icon/icon.definition'
import type { RippleDefinition } from '../ripple/ripple.definition'
import { StandardSelectOptionDefinition, VibrantSelectOptionDefinition } from './select-option.definition'

const Stringify = stringifyTokens('--mdc-select-option')
const StandardTokens = Stringify(StandardSelectOptionDefinition)
const VibrantTokens = Stringify(VibrantSelectOptionDefinition)

const RippleBridge = overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'hovered-color': `var(--_hovered-state-layer-color)`,
    'focused-color': `var(--_focused-state-layer-color)`,
    'pressed-color': `var(--_pressed-state-layer-color)`,
    'hovered-opacity': `var(--_hovered-state-layer-opacity)`,
    'focused-opacity': `var(--_focused-state-layer-opacity)`,
    'pressed-opacity': `var(--_pressed-state-layer-opacity)`,
})()

const SelectedRippleBridge = overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'hovered-color': `var(--_hovered-state-layer-color-selected)`,
    'focused-color': `var(--_focused-state-layer-color-selected)`,
    'pressed-color': `var(--_pressed-state-layer-color-selected)`,
})()

const LeadingIconBridge = overrideTokens<typeof IconDefinition>('--mdc-icon')({
    'size': `var(--_enabled-leading-icon-size)`,
})()

const TrailingIconBridge = overrideTokens<typeof IconDefinition>('--mdc-icon')({
    'size': `var(--_enabled-trailing-icon-size)`,
})()

const VariablePart = css`
    @layer mdc.select-option.variable {
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
    @layer mdc.select-option.component {
        :host {
            display: block;
            outline: none;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }

        :host([disabled]) {
            pointer-events: none;
        }

        .container {
            position: relative;
            display: flex;
            align-items: center;
            width: calc(100% - var(--_enabled-container-inset-inline) * 2);
            min-height: var(--_enabled-container-height);
            margin-block: var(--_enabled-container-inset-block);
            margin-inline: var(--_enabled-container-inset-inline);
            padding-block: var(--_enabled-container-padding-block-start) var(--_enabled-container-padding-block-end);
            padding-inline: var(--_enabled-container-padding-inline-start) var(--_enabled-container-padding-inline-end);
            box-sizing: border-box;
            cursor: pointer;
            user-select: none;
            border: none;
            outline: none;
            text-align: start;
            font: inherit;
            color: var(--_enabled-label-color);
            background-color: var(--_enabled-container-color);
            border-start-start-radius: var(--_enabled-container-shape-start-start);
            border-start-end-radius: var(--_enabled-container-shape-start-end);
            border-end-start-radius: var(--_enabled-container-shape-end-start);
            border-end-end-radius: var(--_enabled-container-shape-end-end);
            transition:
                background-color 150ms cubic-bezier(0.2, 0, 0, 1),
                border-radius 150ms cubic-bezier(0.2, 0, 0, 1);
            ${RippleBridge};
        }

        .container::after {
            content: '';
            position: absolute;
            inset-block: calc((var(--_enabled-container-height) - var(--_min-touch-target-size)) / 2);
            inset-inline: 0;
        }

        .container:hover {
            background-color: var(--_hovered-container-color);
            border-start-start-radius: var(--_hovered-container-shape-start-start);
            border-start-end-radius: var(--_hovered-container-shape-start-end);
            border-end-start-radius: var(--_hovered-container-shape-end-start);
            border-end-end-radius: var(--_hovered-container-shape-end-end);
        }

        .container:active {
            background-color: var(--_pressed-container-color);
            border-start-start-radius: var(--_pressed-container-shape-start-start);
            border-start-end-radius: var(--_pressed-container-shape-start-end);
            border-end-start-radius: var(--_pressed-container-shape-end-start);
            border-end-end-radius: var(--_pressed-container-shape-end-end);
        }

        .container.active {
            background-color: color-mix(in srgb, var(--_focused-state-layer-color) calc(var(--_focused-state-layer-opacity) * 100%), transparent);
        }

        .container.selected {
            color: var(--_enabled-label-color-selected);
            background-color: var(--_enabled-container-color-selected);
            border-start-start-radius: var(--_enabled-selected-container-shape-start-start);
            border-start-end-radius: var(--_enabled-selected-container-shape-start-end);
            border-end-start-radius: var(--_enabled-selected-container-shape-end-start);
            border-end-end-radius: var(--_enabled-selected-container-shape-end-end);
            ${SelectedRippleBridge};
        }

        .container.selected.active {
            background-color: color-mix(
                in srgb,
                var(--_focused-state-layer-color-selected) calc(var(--_focused-state-layer-opacity) * 100%),
                var(--_enabled-container-color-selected)
            );
        }

        .container.selected:hover {
            color: var(--_hovered-label-color-selected);
            background-color: var(--_hovered-container-color-selected);
        }

        .container.selected:active {
            color: var(--_pressed-label-color-selected);
            background-color: var(--_pressed-container-color-selected);
        }

        .container.disabled {
            cursor: default;
            pointer-events: none;
            color: var(--_disabled-label-color);
            background-color: var(--_disabled-container-color);
            opacity: var(--_disabled-label-opacity);
        }

        mdc-ripple {
            border-radius: inherit;
        }

        mdc-focus-ring {
            --mdc-focus-ring-shape-start-start: var(--_enabled-container-shape-start-start);
            --mdc-focus-ring-shape-start-end: var(--_enabled-container-shape-start-end);
            --mdc-focus-ring-shape-end-start: var(--_enabled-container-shape-end-start);
            --mdc-focus-ring-shape-end-end: var(--_enabled-container-shape-end-end);
        }

        .leading {
            display: none;
            flex-shrink: 0;
            align-items: center;
            justify-content: center;
            margin-inline-end: var(--_enabled-icon-label-space);
            color: var(--_enabled-leading-icon-color);
            ${LeadingIconBridge};
        }

        .leading.has-leading {
            display: inline-flex;
        }

        .container.selected .leading {
            color: var(--_enabled-leading-icon-color-selected);
        }

        .label-group {
            display: flex;
            flex-direction: column;
            flex: 1 1 auto;
            min-width: 0;
        }

        .headline {
            font-family: var(--_enabled-label-font);
            font-size: var(--_enabled-label-size);
            font-weight: var(--_enabled-label-weight);
            line-height: var(--_enabled-label-leading);
            letter-spacing: var(--_enabled-label-tracking);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .supporting-text {
            display: none;
            font-family: var(--_enabled-supporting-text-font);
            font-size: var(--_enabled-supporting-text-size);
            font-weight: var(--_enabled-supporting-text-weight);
            line-height: var(--_enabled-supporting-text-leading);
            letter-spacing: var(--_enabled-supporting-text-tracking);
            color: var(--_enabled-supporting-text-color);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .supporting-text.has-supporting {
            display: block;
        }

        .trailing {
            display: none;
            flex-shrink: 0;
            align-items: center;
            justify-content: center;
            margin-inline-start: var(--_enabled-icon-label-space);
            color: var(--_enabled-trailing-icon-color);
            ${TrailingIconBridge};
        }

        .trailing.has-trailing {
            display: inline-flex;
        }

        .container.selected .trailing {
            color: var(--_enabled-trailing-icon-color-selected);
        }

        .check-icon {
            width: var(--_enabled-trailing-icon-size);
            height: var(--_enabled-trailing-icon-size);
            fill: currentColor;
        }
    }
`

const A11yPart = css`
    @layer mdc.select-option.a11y {
        @media (prefers-reduced-motion: reduce) {
            .container {
                transition: none;
            }
        }

        @media (prefers-contrast: more) {
            .container.active,
            .container:focus-visible {
                outline: 2px solid currentColor;
                outline-offset: -2px;
            }
            .container.selected {
                outline: 2px solid currentColor;
                outline-offset: -2px;
            }
        }

        @media (prefers-contrast: less) {
            .container {
                transition-duration: 200ms;
            }
        }

        @media (forced-colors: active) {
            .container {
                color: ButtonText;
                background-color: Canvas;
                forced-color-adjust: none;
            }
            .container:hover,
            .container.active {
                outline: 2px solid Highlight;
                outline-offset: -2px;
            }
            .container.selected {
                color: HighlightText;
                background-color: Highlight;
                outline: 2px solid HighlightText;
                outline-offset: -2px;
            }
            .container.disabled {
                color: GrayText;
                opacity: 1;
            }
        }
    }
`

export const SelectOptionStyles = [VariablePart, ComponentPart, A11yPart]

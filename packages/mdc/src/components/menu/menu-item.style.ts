/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { overrideTokens, stringifyTokens } from '../../utils/style'
import type { IconDefinition } from '../icon/icon.definition'
import type { RippleDefinition } from '../ripple/ripple.definition'
import { StandardMenuItemDefinition, VibrantMenuItemDefinition } from './menu-item.definition'

const Stringify = stringifyTokens('--mdc-menu-item')
const StandardTokens = Stringify(StandardMenuItemDefinition)
const VibrantTokens = Stringify(VibrantMenuItemDefinition)

const RippleBridge = overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'enabled-hovered-color': `var(--_hovered-state-layer-color)`,
    'enabled-focused-color': `var(--_focused-state-layer-color)`,
    'enabled-pressed-color': `var(--_pressed-state-layer-color)`,
    'enabled-hovered-opacity': `var(--_hovered-state-layer-opacity)`,
    'enabled-focused-opacity': `var(--_focused-state-layer-opacity)`,
    'enabled-pressed-opacity': `var(--_pressed-state-layer-opacity)`,
})()

const LeadingIconBridge = overrideTokens<typeof IconDefinition>('--mdc-icon')({
    'enabled-size': `var(--_enabled-leading-icon-size)`,
})()

const TrailingIconBridge = overrideTokens<typeof IconDefinition>('--mdc-icon')({
    'enabled-size': `var(--_enabled-trailing-icon-size)`,
})()

const VariablePart = css`
    @layer mdc.menu-item.variable {
        :host([variant='standard']) {
            ${StandardTokens};
        }
        :host([variant='vibrant']) {
            ${VibrantTokens};
        }
    }
`

const ComponentPart = css`
    @layer mdc.menu-item.component {
        :host {
            display: block;
            box-sizing: border-box;
            /* The 44dp highlight is inset 4dp inline / 2dp block inside the
            48dp row (Figma "Container" x4 y2). The inline inset combines
            with the 12dp container padding to a 16dp leading/trailing space. */
            padding-block: var(--_enabled-container-inset-block);
            padding-inline: var(--_enabled-container-inset-inline);
            outline: none;
            -webkit-tap-highlight-color: transparent;
        }

        .container {
            all: unset;
            position: relative;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            width: 100%;
            height: var(--_enabled-container-height);
            padding-block-start: var(--_enabled-container-padding-block-start);
            padding-block-end: var(--_enabled-container-padding-block-end);
            padding-inline-start: var(--_enabled-container-padding-inline-start);
            padding-inline-end: var(--_enabled-container-padding-inline-end);
            border-start-start-radius: var(--_enabled-container-shape-start-start);
            border-start-end-radius: var(--_enabled-container-shape-start-end);
            border-end-end-radius: var(--_enabled-container-shape-end-end);
            border-end-start-radius: var(--_enabled-container-shape-end-start);
            background-color: var(--_enabled-container-color);
            color: var(--_enabled-label-color);
            text-align: start;
            cursor: pointer;
            outline: none;
            -webkit-tap-highlight-color: transparent;
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

    @layer mdc.menu-item.layout {
        .item {
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            flex: 1 1 auto;
            min-width: 0;
            gap: var(--_enabled-icon-label-space);
        }

        .leading {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            min-width: 0;
            color: var(--_enabled-leading-icon-color);
            ${LeadingIconBridge};
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
            flex: 1 1 auto;
            min-width: 0;
        }

        .trailing {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            min-width: 0;
            gap: var(--_enabled-icon-label-space);
            color: var(--_enabled-trailing-icon-color);
            ${TrailingIconBridge};
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

        .touch-target {
            position: absolute;
            top: 50%;
            left: 50%;
            height: var(--_min-touch-target-size);
            width: 100%;
            transform: translate(-50%, -50%);
            pointer-events: none;
        }
    }

    @layer mdc.menu-item.label {
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
            font-family: var(--_enabled-supporting-text-font);
            font-size: var(--_enabled-supporting-text-size);
            font-weight: var(--_enabled-supporting-text-weight);
            letter-spacing: var(--_enabled-supporting-text-tracking);
            line-height: var(--_enabled-supporting-text-leading);
            color: var(--_enabled-supporting-text-color);
        }

        :is(.shortcut, .badge) {
            font-family: var(--_enabled-label-font);
            font-size: var(--_enabled-label-size);
            font-weight: var(--_enabled-label-weight);
            letter-spacing: var(--_enabled-label-tracking);
            line-height: var(--_enabled-label-leading);
            color: var(--_enabled-shortcut-color);
        }
    }
`

const CompositePart = css`
    @layer mdc.menu-item.composite.ripple {
        .container mdc-ripple {
            border-radius: inherit;
            z-index: 0;
            ${RippleBridge};
        }
    }

    @layer mdc.menu-item.composite.focus-ring {
        .container mdc-focus-ring {
            border-radius: inherit;
            z-index: 1;
        }
    }

    @layer mdc.menu-item.composite.selected {
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
        .container.selected .trailing {
            color: var(--_enabled-trailing-icon-color-selected);
        }
    }
`

const MotionPart = css`
    @layer mdc.menu-item.motion {
        @media (prefers-reduced-motion: reduce) {
            .container,
            .container * {
                animation: none;
                transition: none;
            }
        }
    }
`

const HcmPart = css`
    @layer mdc.menu-item.hcm {
        @media (forced-colors: active) {
            .container {
                border: 1px solid CanvasText;
                forced-color-adjust: none;
            }
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
                border-color: GrayText;
            }
        }
    }
`

const ContrastPart = css`
    @layer mdc.menu-item.contrast {
        @media (prefers-contrast: more) {
            .container {
                border: 1px solid CanvasText;
            }
            .label,
            .supporting,
            .shortcut,
            .badge {
                color: CanvasText;
            }
        }
        @media (prefers-contrast: less) {
            .supporting,
            .shortcut {
                opacity: 0.7;
            }
        }
    }
`

const TransparencyPart = css`
    @layer mdc.menu-item.transparency {
        @media (prefers-reduced-transparency: reduce) {
            .container,
            .supporting,
            .shortcut {
                opacity: 1;
            }
        }
    }
`

export const MenuItemStyles = [
    css`
        @layer mdc.menu-item {
            @layer variable, component, layout, label, composite, motion, hcm, contrast, transparency;
        }
    `,
    VariablePart,
    ComponentPart,
    CompositePart,
    MotionPart,
    HcmPart,
    ContrastPart,
    TransparencyPart,
]

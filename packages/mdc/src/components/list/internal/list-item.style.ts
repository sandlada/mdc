/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import type { FocusRingDefinition } from '../../../component-definitions/focus-ring.definition'
import type { IconDefinition } from '../../../component-definitions/icon.definition'
import type { RippleDefinition } from '../../../component-definitions/ripple.definition'
import { ListItemDefinition } from '../../../component-definitions/list.definition'
import { overrideComponentTokens, stringTokens } from '../../../utils/tokens'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'

// Token injection for `mdc-list-item`
const listItemTokens = defineVars(defineTokenRefsRecord(ListItemDefinition, {
    expandShapes: true, useBaseFallback: true, prefix: '--mdc-list-item',
}), true).join('')

const emphasizedEasing = unsafeCSS(Easing.Emphasized.ToCSSValue())

const rippleStyles = stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', {
    'enabled-hovered-color': `var(--_hovered-state-layer-color)`,
    'enabled-focused-color': `var(--_focused-state-layer-color)`,
    'enabled-pressed-color': `var(--_pressed-state-layer-color)`,
    'enabled-hovered-opacity': `var(--_hovered-state-layer-opacity)`,
    'enabled-focused-opacity': `var(--_focused-state-layer-opacity)`,
    'enabled-pressed-opacity': `var(--_pressed-state-layer-opacity)`,
}))

const iconStyles = stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', {
    'enabled-size': `var(--_leading-icon-size)`,
}))

export const ListItemStyles = css`
    @layer mdc.list-item.variable {
        :host { ${unsafeCSS(listItemTokens)}; }
    }

    @layer mdc.list-item.base {
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
            min-height: var(--_one-line-container-height);
            padding-inline-start: var(--_enabled-container-padding-inline-start);
            padding-inline-end: var(--_enabled-container-padding-inline-end);
            padding-block-start: var(--_enabled-container-padding-block-start);
            padding-block-end: var(--_enabled-container-padding-block-end);
            border-start-start-radius: var(--_container-shape-start-start);
            border-start-end-radius: var(--_container-shape-start-end);
            border-end-start-radius: var(--_container-shape-end-start);
            border-end-end-radius: var(--_container-shape-end-end);
            background-color: var(--_enabled-container-color);
            color: var(--_enabled-label-color);
            text-align: start;
            cursor: pointer;
            outline: none;
            -webkit-tap-highlight-color: transparent;
            transition: background-color 200ms ${emphasizedEasing};
        }

        .container.one-line {
            min-height: var(--_one-line-container-height);
        }
        .container.two-line {
            min-height: var(--_two-line-container-height);
        }
        .container.three-line {
            min-height: var(--_three-line-container-height);
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

    @layer mdc.list-item.base.layout {
        .item {
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            flex: 1;
            min-width: 0;
            gap: 16px;
        }

        .leading {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            min-width: 0;
            color: var(--_enabled-leading-icon-color);
            ${unsafeCSS(iconStyles)};
        }

        ::slotted([slot='start']),
        ::slotted([slot='control']) {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .content {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-self: stretch;
            flex: 1;
            min-width: 0;
        }

        .end {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            min-width: 0;
            color: var(--_enabled-trailing-icon-color);
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

    @layer mdc.list-item.base.label {
        .headline,
        .overline,
        .supporting-text,
        .trailing-supporting-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .headline {
            display: block;
            font-family: var(--_enabled-label-font);
            font-size: var(--_enabled-label-size);
            font-weight: var(--_enabled-label-weight);
            letter-spacing: var(--_enabled-label-tracking);
            line-height: var(--_enabled-label-line-height);
            color: var(--_enabled-label-color);
        }

        .overline {
            font-family: var(--_enabled-overline-font);
            font-size: var(--_enabled-overline-size);
            font-weight: var(--_enabled-overline-weight);
            letter-spacing: var(--_enabled-overline-tracking);
            line-height: var(--_enabled-overline-line-height);
            color: var(--_enabled-overline-color);
        }

        .supporting-text {
            font-family: var(--_enabled-supporting-text-font);
            font-size: var(--_enabled-supporting-text-size);
            font-weight: var(--_enabled-supporting-text-weight);
            letter-spacing: var(--_enabled-supporting-text-tracking);
            line-height: var(--_enabled-supporting-text-line-height);
            color: var(--_enabled-supporting-text-color);
        }

        .trailing-supporting-text {
            font-family: var(--_enabled-trailing-supporting-text-font);
            font-size: var(--_enabled-trailing-supporting-text-size);
            font-weight: var(--_enabled-trailing-supporting-text-weight);
            letter-spacing: var(--_enabled-trailing-supporting-text-tracking);
            line-height: var(--_enabled-trailing-supporting-text-line-height);
            color: var(--_enabled-trailing-supporting-text-color);
        }
    }

    @layer mdc.list-item.composite.ripple {
        .container mdc-ripple {
            border-radius: inherit;
            z-index: 0;
            ${unsafeCSS(rippleStyles)};
        }
    }

    @layer mdc.list-item.composite.focus-ring {
        .container mdc-focus-ring {
            border-radius: inherit;
            z-index: 1;
        }
    }

    @layer mdc.list-item.composite.selected {
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

        .container.selected .headline {
            color: var(--_enabled-label-color-selected);
        }
        .container.selected .overline {
            color: var(--_enabled-overline-color-selected);
        }
        .container.selected .supporting-text {
            color: var(--_enabled-supporting-text-color-selected);
        }
        .container.selected .trailing-supporting-text {
            color: var(--_enabled-trailing-supporting-text-color-selected);
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
        .container.disabled {
            opacity: 1;
            color: GrayText;
        }
    }
`

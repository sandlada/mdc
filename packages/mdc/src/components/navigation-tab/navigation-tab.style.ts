/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Duration } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import { overrideComponentTokens, stringifyTokens, stringTokens } from '../../utils/style'
import type { IconDefinition } from '../icon/icon.definition'
import type { RippleDefinition } from '../ripple/ripple.definition'
import {
    NavigationBarHorizontalTabDefinition,
    NavigationBarVerticalTabDefinition,
    NavigationBarXRVerticalTabDefinition,
    NavigationDrawerTabDefinition,
    NavigationRailHorizontalTabDefinition,
    NavigationRailRoundTabDefinition,
    NavigationRailVerticalTabDefinition,
    NavigationRailXRRoundTabDefinition,
    NavigationRailXRVerticalTabDefinition,
} from './navigation-tab.definition'

const BarVS = stringifyTokens('--mdc-navigation-tab')(NavigationBarVerticalTabDefinition)
const BarHS = stringifyTokens('--mdc-navigation-tab')(NavigationBarHorizontalTabDefinition)
const BarXRVS = stringifyTokens('--mdc-navigation-tab')(NavigationBarXRVerticalTabDefinition)
const RailVS = stringifyTokens('--mdc-navigation-tab')(NavigationRailVerticalTabDefinition)
const RailHS = stringifyTokens('--mdc-navigation-tab')(NavigationRailHorizontalTabDefinition)
const RailRS = stringifyTokens('--mdc-navigation-tab')(NavigationRailRoundTabDefinition)
const RailXRVS = stringifyTokens('--mdc-navigation-tab')(NavigationRailXRVerticalTabDefinition)
const RailXRRS = stringifyTokens('--mdc-navigation-tab')(NavigationRailXRRoundTabDefinition)
const DrawerS = stringifyTokens('--mdc-navigation-tab')(NavigationDrawerTabDefinition)

const LabelFadeDuration = Duration.ExpressiveFastEffects.ToCSSValue()

const OverrideRipple = {
    unselected: stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>(
        '--mdc-ripple',
        {
            'enabled-hovered-color'  : 'var(--_hovered-unselected-state-layer-color)',
            'enabled-hovered-opacity': 'var(--_hovered-unselected-state-layer-opacity)',
            'enabled-focused-color'  : 'var(--_focused-unselected-state-layer-color)',
            'enabled-focused-opacity': 'var(--_focused-unselected-state-layer-opacity)',
            'enabled-pressed-color'  : 'var(--_pressed-unselected-state-layer-color)',
            'enabled-pressed-opacity': 'var(--_pressed-unselected-state-layer-opacity)',
        },
    )),
    selected: stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>(
        '--mdc-ripple',
        {
            'enabled-hovered-color'  : 'var(--_hovered-selected-state-layer-color)',
            'enabled-hovered-opacity': 'var(--_hovered-selected-state-layer-opacity)',
            'enabled-focused-color'  : 'var(--_focused-selected-state-layer-color)',
            'enabled-focused-opacity': 'var(--_focused-selected-state-layer-opacity)',
            'enabled-pressed-color'  : 'var(--_pressed-selected-state-layer-color)',
            'enabled-pressed-opacity': 'var(--_pressed-selected-state-layer-opacity)',
        },
    )),
}

const overrideIcon = (value: string = 'var(--_enabled-icon-size)') =>
    stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', {
        'enabled-size': value,
    }))

export const NavigationTabStyles = [
    // Token injection per variant
    css`
        :host([variant="bar-vertical"]) {
            ${BarVS};
        }
        :host([variant="bar-horizontal"]) {
            ${BarHS};
        }
        :host([variant="bar-xr-vertical"]) {
            ${BarXRVS};
        }
        :host([variant="rail-vertical"]) {
            ${RailVS};
        }
        :host([variant="rail-horizontal"]) {
            ${RailHS};
        }
        :host([variant="rail-round"]) {
            ${RailRS};
        }
        :host([variant="rail-xr-vertical"]) {
            ${RailXRVS};
        }
        :host([variant="rail-xr-round"]) {
            ${RailXRRS};
        }
        :host([variant="drawer"]),
        :host([variant="drawer-horizontal"]) {
            ${DrawerS};
        }
    `,
    // Shared base
    css`
        :host {
            flex-grow: 0;
            flex-shrink: 0;
            vertical-align: top;
            position: relative;
            box-sizing: border-box;
            display: inline-flex;
            width: fit-content;
            height: fit-content;
            cursor: pointer;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            z-index: 0;
        }

        :host([disabled]) {
            cursor: default;
            pointer-events: none;
        }

        .container {
            all: unset;
            color-scheme: inherit;
            position: relative;
            box-sizing: border-box;
            z-index: 0;
            text-decoration: none;
            color: inherit;
            cursor: inherit;
            padding-block-start: var(--_enabled-container-padding-block-start);
            padding-block-end: var(--_enabled-container-padding-block-end);
            padding-inline-start: var(--_enabled-container-padding-inline-start);
            padding-inline-end: var(--_enabled-container-padding-inline-end);
            min-height: var(--_enabled-container-height);
        }

        .indicator {
            display: flex;
            z-index: -1;
            overflow: clip;
            transform-origin: center;
            pointer-events: none;
            border-start-start-radius: var(--_enabled-indicator-shape-start-start);
            border-start-end-radius: var(--_enabled-indicator-shape-start-end);
            border-end-start-radius: var(--_enabled-indicator-shape-end-start);
            border-end-end-radius: var(--_enabled-indicator-shape-end-end);
        }

        .ripple-layer {
            position: relative;
            z-index: 0;
            pointer-events: none;
            overflow: hidden;
            border-start-start-radius: var(--_enabled-indicator-shape-start-start);
            border-start-end-radius: var(--_enabled-indicator-shape-start-end);
            border-end-start-radius: var(--_enabled-indicator-shape-end-start);
            border-end-end-radius: var(--_enabled-indicator-shape-end-end);
        }

        .label {
            justify-self: center;
            z-index: 1;
            pointer-events: none;
            user-select: none;
            font-family: var(--_enabled-unselected-label-font);
            font-size: var(--_enabled-unselected-label-size);
            font-weight: var(--_enabled-unselected-label-weight);
            line-height: var(--_enabled-unselected-label-leading);
            letter-spacing: var(--_enabled-unselected-label-tracking);
            color: var(--_enabled-unselected-label-color);
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            opacity: var(--_enabled-label-opacity);
            visibility: var(--_enabled-label-visibility);
            transition: opacity ${unsafeCSS(LabelFadeDuration)};
        }

        :host([checked]) .label {
            font-family: var(--_enabled-selected-label-font);
            font-size: var(--_enabled-selected-label-size);
            font-weight: var(--_enabled-selected-label-weight);
            line-height: var(--_enabled-selected-label-leading);
            letter-spacing: var(--_enabled-selected-label-tracking);
            color: var(--_enabled-selected-label-color);
        }

        .icon {
            ${overrideIcon()};
            width: var(--_enabled-icon-size);
            height: var(--_enabled-icon-size);
            fill: currentColor;
            display: grid;
            place-items: center;
            z-index: 1;
            pointer-events: none;
            user-select: none;
            color: var(--_enabled-unselected-icon-color);
        }

        :host([checked]) .icon {
            color: var(--_enabled-selected-icon-color);
        }

        .icon:is(.default-icon, .active-icon, .inactive-icon) {
            opacity: 0;
        }

        :host(:not([checked])) .container.has-inactive-icon .icon.inactive-icon {
            opacity: 1;
        }
        :host(:not([checked])) .container:not(.has-inactive-icon) .icon.default-icon {
            opacity: 1;
        }

        :host([checked]) .container.has-active-icon .icon.active-icon {
            opacity: 1;
        }
        :host([checked]) .container:not(.has-active-icon) .icon.default-icon {
            opacity: 1;
        }

        .icon-container {
            border-start-start-radius: var(--_enabled-icon-container-shape-start-start);
            border-start-end-radius: var(--_enabled-icon-container-shape-start-end);
            border-end-start-radius: var(--_enabled-icon-container-shape-end-start);
            border-end-end-radius: var(--_enabled-icon-container-shape-end-end);
            padding-inline-start: var(--_enabled-icon-container-padding-inline-start);
            padding-inline-end: var(--_enabled-icon-container-padding-inline-end);
            padding-block-start: var(--_enabled-icon-container-padding-block-start);
            padding-block-end: var(--_enabled-icon-container-padding-block-end);
            height: var(--_enabled-icon-container-height);
        }

        :host(:not([checked])) {
            ${OverrideRipple.unselected};
        }
        :host([checked]) {
            ${OverrideRipple.selected};
        }

        mdc-focus-ring {
            --mdc-focus-ring-shape-start-start: var(--_enabled-indicator-shape-start-start);
            --mdc-focus-ring-shape-start-end: var(--_enabled-indicator-shape-start-end);
            --mdc-focus-ring-shape-end-end: var(--_enabled-indicator-shape-end-end);
            --mdc-focus-ring-shape-end-start: var(--_enabled-indicator-shape-end-start);
        }
    `,
    // Indicator states (non-drawer)
    css`
        :host(:not([variant*="drawer"])) .indicator {
            height: var(--_enabled-indicator-height);
        }
        :host(:not([variant*="drawer"]):not([checked])) .indicator {
            transform: scaleX(0.2) scaleY(0.82);
            opacity: 0;
            background: var(--_enabled-unselected-indicator-color);
        }
        :host(:not([variant*="drawer"])[checked]) .indicator {
            transform: scaleX(1) scaleY(1);
            opacity: 1;
            background: var(--_enabled-selected-indicator-color);
        }
    `,
    // Vertical Layout (BarVertical, BarXRVertical, RailVertical, RailXRVertical)
    css`
        :host([variant="bar-vertical"]),
        :host([variant="bar-xr-vertical"]),
        :host([variant="rail-vertical"]),
        :host([variant="rail-xr-vertical"]) {
            min-width: var(--_enabled-container-width);
            height: var(--_enabled-container-height);
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        :host([variant="rail-vertical"]),
        :host([variant="rail-xr-vertical"]) {
            width: var(--_enabled-container-width);
        }

        :host([variant="bar-vertical"]) .container,
        :host([variant="bar-xr-vertical"]) .container,
        :host([variant="rail-vertical"]) .container,
        :host([variant="rail-xr-vertical"]) .container {
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: var(--_enabled-indicator-height) auto;
            gap: var(--_enabled-spacing-between-icon-and-label);
            place-content: center;
            justify-items: center;
            align-items: center;
            width: 100%;
            height: 100%;
        }

        :host([variant="bar-vertical"]) .indicator,
        :host([variant="bar-xr-vertical"]) .indicator,
        :host([variant="rail-vertical"]) .indicator,
        :host([variant="rail-xr-vertical"]) .indicator,
        :host([variant="bar-vertical"]) .ripple-layer,
        :host([variant="bar-xr-vertical"]) .ripple-layer,
        :host([variant="rail-vertical"]) .ripple-layer,
        :host([variant="rail-xr-vertical"]) .ripple-layer {
            position: relative;
            place-self: center;
            grid-column: 1 / 2;
            grid-row: 1 / 2;
            width: var(--_enabled-indicator-width);
            height: var(--_enabled-indicator-height);
        }

        :host([variant="bar-vertical"]) .icon-container,
        :host([variant="bar-xr-vertical"]) .icon-container,
        :host([variant="rail-vertical"]) .icon-container,
        :host([variant="rail-xr-vertical"]) .icon-container {
            position: relative;
            grid-column: 1 / 2;
            grid-row: 1 / 2;
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: 1fr;
            place-content: center;
            place-self: center;
            width: var(--_enabled-indicator-width);
            height: var(--_enabled-indicator-height);
            z-index: 1;
        }

        :host([variant="bar-vertical"]) .icon-container .icon,
        :host([variant="bar-xr-vertical"]) .icon-container .icon,
        :host([variant="rail-vertical"]) .icon-container .icon,
        :host([variant="rail-xr-vertical"]) .icon-container .icon {
            align-self: center;
            justify-self: center;
            grid-column: 1 / 2;
            grid-row: 1 / 2;
        }

        :host([variant="bar-vertical"]) .badge-container,
        :host([variant="bar-xr-vertical"]) .badge-container,
        :host([variant="rail-vertical"]) .badge-container,
        :host([variant="rail-xr-vertical"]) .badge-container {
            grid-column: 1 / 2;
            grid-row: 1 / 2;
            place-self: center;
            position: relative;
            width: var(--_enabled-indicator-width);
            height: var(--_enabled-indicator-height);
            z-index: 1;
            pointer-events: none;
        }

        :host([variant="bar-vertical"]) .badge-label,
        :host([variant="bar-xr-vertical"]) .badge-label,
        :host([variant="rail-vertical"]) .badge-label,
        :host([variant="rail-xr-vertical"]) .badge-label {
            position: absolute;
            top: 2px;
            inset-inline-start: 50%;
        }

        :host([variant="bar-vertical"]) .badge-label.dot:not(.exiting),
        :host([variant="bar-xr-vertical"]) .badge-label.dot:not(.exiting),
        :host([variant="rail-vertical"]) .badge-label.dot:not(.exiting),
        :host([variant="rail-xr-vertical"]) .badge-label.dot:not(.exiting) {
            top: 4px;
            inset-inline-start: calc(50% + 6px);
        }

        :host([variant="bar-vertical"]) .label.out-icon-container,
        :host([variant="bar-xr-vertical"]) .label.out-icon-container,
        :host([variant="rail-vertical"]) .label.out-icon-container,
        :host([variant="rail-xr-vertical"]) .label.out-icon-container {
            grid-column: 1 / 2;
            grid-row: 2 / 3;
            text-align: center;
            max-width: 100%;
            padding-inline: 4px;
            box-sizing: border-box;
        }

        :host([variant="bar-vertical"]) .label.in-icon-container,
        :host([variant="bar-xr-vertical"]) .label.in-icon-container,
        :host([variant="rail-vertical"]) .label.in-icon-container,
        :host([variant="rail-xr-vertical"]) .label.in-icon-container {
            display: none;
        }
    `,
    // Bar Horizontal (Figma Medium Window Navigation Bar: 40px hugging pill centered in 64px row)
    css`
        :host([variant="bar-horizontal"]) {
            height: var(--_enabled-container-height);
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        :host([variant="bar-horizontal"]) .container {
            display: inline-grid;
            grid-template-columns: auto;
            grid-template-rows: 1fr;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            position: relative;
            width: fit-content;
            min-height: 0;
            height: var(--_enabled-icon-container-height);
            border-radius: var(--_enabled-indicator-shape-start-start);
        }

        :host([variant="bar-horizontal"]) .indicator,
        :host([variant="bar-horizontal"]) .ripple-layer {
            grid-column: 1 / 2;
            grid-row: 1 / 2;
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: inherit;
        }

        :host([variant="bar-horizontal"]) .icon-container {
            grid-column: 1 / 2;
            grid-row: 1 / 2;
            display: inline-grid;
            grid-template-columns: var(--_enabled-icon-size) auto;
            grid-template-rows: 1fr;
            align-items: center;
            justify-items: center;
            gap: var(--_enabled-spacing-between-icon-and-label);
            box-sizing: border-box;
            position: relative;
            height: var(--_enabled-icon-container-height);
            width: fit-content;
            z-index: 1;
        }

        :host([variant="bar-horizontal"]) .icon-container .icon {
            grid-column: 1 / 2;
            grid-row: 1 / 2;
        }

        :host([variant="bar-horizontal"]) .label.in-icon-container {
            grid-column: 2 / 3;
            grid-row: 1 / 2;
            display: block;
            white-space: nowrap;
        }

        :host([variant="bar-horizontal"]) .label.out-icon-container {
            display: none;
        }

        :host([variant="bar-horizontal"]) .badge-container {
            grid-column: 1 / 2;
            grid-row: 1 / 2;
            position: relative;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        }

        :host([variant="bar-horizontal"]) .badge-label {
            position: absolute;
            top: 6px;
            inset-inline-start: 28px;
        }

        :host([variant="bar-horizontal"]) .badge-label.dot:not(.exiting) {
            top: 8px;
            inset-inline-start: 34px;
        }
    `,
    // Rail Horizontal (Figma Expanded Navigation Rail: 56px hugging pill, p=16px, gap=8px, inline trailing badge)
    css`
        :host([variant="rail-horizontal"]) {
            width: fit-content;
            max-width: 100%;
            height: var(--_enabled-container-height);
            display: inline-flex;
            align-self: flex-start;
        }

        :host([variant="rail-horizontal"]) .container {
            display: inline-flex;
            flex-direction: row;
            align-items: center;
            width: fit-content;
            max-width: 100%;
            height: var(--_enabled-container-height);
            gap: var(--_enabled-spacing-between-icon-and-label);
            box-sizing: border-box;
            position: relative;
            border-radius: var(--_enabled-indicator-shape-start-start);
        }

        :host([variant="rail-horizontal"]) .indicator,
        :host([variant="rail-horizontal"]) .ripple-layer {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            border-radius: inherit;
        }

        :host([variant="rail-horizontal"]:not([checked])) .indicator {
            opacity: 0;
            transform: scaleX(0.88);
            background: var(--_enabled-unselected-indicator-color);
        }
        :host([variant="rail-horizontal"][checked]) .indicator {
            opacity: 1;
            transform: scaleX(1);
            background: var(--_enabled-selected-indicator-color);
        }

        :host([variant="rail-horizontal"]) .icon-container {
            display: inline-grid;
            grid-template-columns: 1fr;
            grid-template-rows: 1fr;
            width: var(--_enabled-icon-size);
            height: var(--_enabled-icon-size);
            flex-shrink: 0;
            align-items: center;
            justify-items: center;
            z-index: 1;
            padding: 0;
            box-sizing: border-box;
        }

        :host([variant="rail-horizontal"]) .icon {
            grid-column: 1 / 2;
            grid-row: 1 / 2;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        :host([variant="rail-horizontal"]) .label.in-icon-container {
            display: none;
        }

        :host([variant="rail-horizontal"]) .label.out-icon-container {
            display: block;
            flex: 0 1 auto;
            min-width: 0;
            text-align: start;
            justify-self: start;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        :host([variant="rail-horizontal"]) .container:not(.has-badge) .badge-container {
            display: none;
        }

        :host([variant="rail-horizontal"]) .badge-container {
            position: static;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            z-index: 1;
            pointer-events: none;
        }

        :host([variant="rail-horizontal"]) .container.has-badge-dot .badge-container {
            position: absolute;
            top: 14px;
            inset-inline-start: 34px;
        }
    `,
    // Round (Collapsed Rail / XR Rail without label: 56x56 circle)
    css`
        :host([variant="rail-round"]),
        :host([variant="rail-xr-round"]) {
            width: var(--_enabled-container-width);
            height: var(--_enabled-container-height);
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        :host([variant="rail-xr-round"]) .container,
        :host([variant="rail-round"]) .container {
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: 1fr;
            place-content: center;
            place-items: center;
            position: relative;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
        }

        :host([variant="rail-xr-round"]) .indicator,
        :host([variant="rail-round"]) .indicator,
        :host([variant="rail-xr-round"]) .ripple-layer,
        :host([variant="rail-round"]) .ripple-layer {
            grid-column: 1 / 2;
            grid-row: 1 / 2;
            place-self: center;
            position: relative;
            width: var(--_enabled-indicator-width);
            height: var(--_enabled-indicator-height);
        }

        :host([variant="rail-xr-round"]) .icon-container,
        :host([variant="rail-round"]) .icon-container {
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: 1fr;
            align-items: center;
            justify-items: center;
            place-content: center;
            box-sizing: border-box;
            position: relative;
            grid-column: 1 / 2;
            grid-row: 1 / 2;
            width: var(--_enabled-icon-container-width);
            height: var(--_enabled-icon-container-height);
            z-index: 1;
        }

        :host([variant="rail-xr-round"]) .icon,
        :host([variant="rail-round"]) .icon {
            place-content: center;
            grid-column: 1 / 2;
            grid-row: 1 / 2;
        }

        :host([variant="rail-xr-round"]) .badge-container,
        :host([variant="rail-round"]) .badge-container {
            grid-column: 1 / 2;
            grid-row: 1 / 2;
            place-self: center;
            position: relative;
            width: var(--_enabled-indicator-width);
            height: var(--_enabled-indicator-height);
            z-index: 1;
            pointer-events: none;
        }

        :host([variant="rail-xr-round"]) .badge-label,
        :host([variant="rail-round"]) .badge-label {
            position: absolute;
            top: 10px;
            inset-inline-start: 50%;
        }

        :host([variant="rail-xr-round"]) .badge-label.dot:not(.exiting),
        :host([variant="rail-round"]) .badge-label.dot:not(.exiting) {
            top: 12px;
            inset-inline-start: calc(50% + 6px);
        }

        :host([variant="rail-xr-round"]) .label,
        :host([variant="rail-round"]) .label {
            display: none;
        }
    `,
    // Drawer & Drawer Horizontal (MD3 Navigation Drawer destination items)
    css`
        :host([variant="drawer"]),
        :host([variant="drawer-horizontal"]) {
            width: 100%;
            max-width: var(--_enabled-container-width);
            height: var(--_enabled-container-height);
            display: flex;
            position: relative;
            box-sizing: border-box;
        }

        :host([variant="drawer"]) .container,
        :host([variant="drawer-horizontal"]) .container {
            display: flex;
            flex-direction: row;
            align-items: center;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            position: relative;
            border-radius: var(--_enabled-indicator-shape-start-start);
            padding-inline-start: var(--_enabled-icon-container-padding-inline-start);
            padding-inline-end: var(--_enabled-icon-container-padding-inline-end);
        }

        :host([variant="drawer"]) .indicator,
        :host([variant="drawer-horizontal"]) .indicator,
        :host([variant="drawer"]) .ripple-layer,
        :host([variant="drawer-horizontal"]) .ripple-layer {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            border-radius: inherit;
        }

        :host([variant="drawer"]:not([checked])) .indicator,
        :host([variant="drawer-horizontal"]:not([checked])) .indicator {
            opacity: 0;
            transform: scaleX(0.92);
            background-color: var(--_enabled-unselected-indicator-color);
        }
        :host([variant="drawer"][checked]) .indicator,
        :host([variant="drawer-horizontal"][checked]) .indicator {
            opacity: 1;
            transform: scaleX(1);
            background-color: var(--_enabled-selected-indicator-color);
        }

        :host([variant="drawer"]) .icon-container,
        :host([variant="drawer-horizontal"]) .icon-container {
            display: inline-grid;
            grid-template-columns: 1fr;
            grid-template-rows: 1fr;
            width: var(--_enabled-icon-size);
            height: var(--_enabled-icon-size);
            flex-shrink: 0;
            align-items: center;
            justify-items: center;
            margin-inline-end: var(--_enabled-spacing-between-icon-and-label);
            z-index: 1;
            padding: 0;
            box-sizing: border-box;
        }

        :host([variant="drawer"]) .icon,
        :host([variant="drawer-horizontal"]) .icon {
            grid-column: 1 / 2;
            grid-row: 1 / 2;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        :host([variant="drawer"]) .label.in-icon-container,
        :host([variant="drawer-horizontal"]) .label.in-icon-container {
            display: none;
        }

        :host([variant="drawer"]) .label.out-icon-container,
        :host([variant="drawer-horizontal"]) .label.out-icon-container {
            display: block;
            flex: 1;
            text-align: start;
            justify-self: start;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        :host([variant="drawer"]) .badge-container,
        :host([variant="drawer-horizontal"]) .badge-container {
            margin-inline-start: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;
            flex-shrink: 0;
            padding-inline-end: 8px;
        }

        :host([variant="drawer"]) .badge-label,
        :host([variant="drawer-horizontal"]) .badge-label {
            background: transparent;
            font-family: var(--_enabled-large-badge-label-font);
            font-size: var(--_enabled-large-badge-label-size);
            font-weight: var(--_enabled-large-badge-label-weight);
            line-height: var(--_enabled-large-badge-label-leading);
            letter-spacing: var(--_enabled-large-badge-label-tracking);
            height: auto;
            min-width: 0;
            max-width: none;
            padding-inline: 0;
        }
        :host([variant="drawer"]:not([checked])) .badge-label:not(.dot),
        :host([variant="drawer-horizontal"]:not([checked])) .badge-label:not(.dot) {
            color: var(--_enabled-unselected-label-color);
        }
        :host([variant="drawer"][checked]) .badge-label:not(.dot),
        :host([variant="drawer-horizontal"][checked]) .badge-label:not(.dot) {
            color: var(--_enabled-selected-label-color);
        }
    `,
    // Badge base styles
    css`
        .badge-container {
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;
            pointer-events: none;
        }

        .badge-label {
            background: var(--_enabled-badge-color);
            color: var(--_enabled-large-badge-label-color);
            font-family: var(--_enabled-large-badge-label-font);
            font-size: var(--_enabled-large-badge-label-size);
            font-weight: var(--_enabled-large-badge-label-weight);
            line-height: var(--_enabled-large-badge-label-leading);
            letter-spacing: var(--_enabled-large-badge-label-tracking);
            border-radius: var(--_enabled-indicator-shape-start-start);
            height: var(--_enabled-large-badge-height);
            min-width: var(--_enabled-large-badge-width);
            max-width: var(--_enabled-large-badge-max-width);
            padding-inline-start: var(--_enabled-large-badge-padding-inline-start);
            padding-inline-end: var(--_enabled-large-badge-padding-inline-end);
            box-sizing: border-box;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .badge-label.dot:not(.exiting) {
            width: var(--_enabled-small-badge-width);
            min-width: var(--_enabled-small-badge-width);
            max-width: var(--_enabled-small-badge-width);
            height: var(--_enabled-small-badge-height);
            padding-inline: 0;
            border-radius: 50%;
            background: var(--_enabled-badge-color);
        }
    `,
    // Disabled states (declared after base rules to win cascade cleanly)
    css`
        :host([checked]) .container.disabled .icon {
            color: var(--_disabled-selected-icon-color);
        }
        :host(:not([checked])) .container.disabled .icon {
            color: var(--_disabled-unselected-icon-color);
        }
        :host([checked]) .container.disabled .indicator {
            background: var(--_disabled-selected-indicator-color);
        }
        :host(:not([checked])) .container.disabled .indicator {
            background: var(--_disabled-unselected-indicator-color);
        }
        :host([checked]) .container.disabled .label {
            color: var(--_disabled-selected-label-color);
        }
        :host(:not([checked])) .container.disabled .label {
            color: var(--_disabled-unselected-label-color);
        }
        .container.disabled .badge-label:not(.dot) {
            background: var(--_disabled-badge-color);
            color: var(--_disabled-large-badge-label-color);
        }
        .container.disabled .badge-label.dot {
            background: var(--_disabled-badge-color);
        }
    `,
    // Accessibility
    css`
        @media (prefers-reduced-motion: reduce) {
            :host([variant]),
            :host([variant]) *,
            :host([variant]) .container,
            :host([variant]) .container *,
            :host([variant]) .indicator,
            :host([variant]) .label,
            :host([variant]) .icon {
                transition: none;
                animation: none;
            }
        }

        @media (prefers-contrast: more) {
            :host([disabled]) {
                --_disabled-selected-icon-color: GrayText;
                --_disabled-unselected-icon-color: GrayText;
                --_disabled-selected-label-color: GrayText;
                --_disabled-unselected-label-color: GrayText;
            }

            :host([checked]) .container .label,
            :host(:not([checked])) .container .label,
            :host([checked]) .container .icon,
            :host(:not([checked])) .container .icon {
                color: CanvasText;
            }

            :host([checked]) .container .indicator {
                outline: 1px solid CanvasText;
                outline-offset: -1px;
            }

            :host([variant="rail-vertical"]) .container,
            :host([variant="rail-xr-vertical"]) .container,
            :host([variant="bar-vertical"]) .container,
            :host([variant="bar-xr-vertical"]) .container,
            :host([variant="rail-round"]) .container,
            :host([variant="rail-xr-round"]) .container {
                outline: 1px solid CanvasText;
                outline-offset: -1px;
            }
        }

        @media (prefers-contrast: less) {
            :host([variant="rail-vertical"]) .container,
            :host([variant="rail-xr-vertical"]) .container,
            :host([variant="bar-vertical"]) .container,
            :host([variant="bar-xr-vertical"]) .container,
            :host([variant="rail-round"]) .container,
            :host([variant="rail-xr-round"]) .container {
                outline: 1px solid GrayText;
                outline-offset: -1px;
            }
        }

        /* Forced colors is declared last so it wins over contrast rules
           when the platform reports both (Windows High Contrast). */
        @media (forced-colors: active) {
            :host([disabled]) {
                --_disabled-selected-icon-color: GrayText;
                --_disabled-unselected-icon-color: GrayText;
                --_disabled-selected-label-color: GrayText;
                --_disabled-unselected-label-color: GrayText;
                --_disabled-selected-indicator-color: GrayText;
                --_disabled-unselected-indicator-color: ButtonFace;
            }

            :host([checked]) .container .label,
            :host(:not([checked])) .container .label,
            :host([checked]) .container .icon,
            :host(:not([checked])) .container .icon {
                color: CanvasText;
            }

            :host([checked]) .container .icon {
                color: HighlightText;
            }

            :host([checked]) .container.rail-horizontal .label,
            :host([checked]) .container.bar-horizontal .label,
            :host([checked]) .container.drawer .label,
            :host([checked]) .container.drawer-horizontal .label {
                color: HighlightText;
            }

            :host([checked]) .container.disabled .label,
            :host(:not([checked])) .container.disabled .label,
            :host([checked]) .container.disabled .icon,
            :host(:not([checked])) .container.disabled .icon {
                color: GrayText;
            }

            :host([checked]) .container .indicator {
                background: Highlight;
                background-color: Highlight;
            }

            :host(:not([checked])) .container .indicator {
                background: ButtonFace;
                background-color: ButtonFace;
            }

            :host([variant="rail-vertical"]) .container,
            :host([variant="rail-xr-vertical"]) .container,
            :host([variant="bar-vertical"]) .container,
            :host([variant="bar-xr-vertical"]) .container,
            :host([variant="rail-round"]) .container,
            :host([variant="rail-xr-round"]) .container {
                outline: 1px solid CanvasText;
                outline-offset: -1px;
            }

            .ripple-layer,
            mdc-ripple {
                display: none;
            }
        }
    `,
]

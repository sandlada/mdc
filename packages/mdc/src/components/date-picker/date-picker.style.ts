/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import type { ElevationDefinition } from '../elevation/elevation.definition'
import { RippleDefinition } from '../ripple/ripple.definition'
import { DatePickerDockedDefinition, DatePickerFullscreenDefinition, DatePickerInputDefinition, DatePickerModalDefinition } from './date-picker.definition'
import { overrideTokens, stringifyTokens } from '../../utils/style'

const modalTokens = stringifyTokens('--mdc-date-picker')(DatePickerModalDefinition)
const dockedTokens = stringifyTokens('--mdc-date-picker')(DatePickerDockedDefinition)
const inputTokens = stringifyTokens('--mdc-date-picker')(DatePickerInputDefinition)
const fullscreenTokens = stringifyTokens('--mdc-date-picker')(DatePickerFullscreenDefinition)

const elevationStyles = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_enabled-container-elevation)`,
})()

/**
 * State-layer tokens bridge into the embedded `mdc-ripple`'s
 * hovered/focused/pressed color and opacity tokens.
 */
const rippleBridge = (group: 'day' | 'year' | 'menu-item') => overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'hovered-color': `var(--_hovered-${group}-state-layer-color)`,
    'focused-color': `var(--_focused-${group}-state-layer-color)`,
    'pressed-color': `var(--_pressed-${group}-state-layer-color)`,
    'hovered-opacity': `var(--_hovered-${group}-state-layer-opacity)`,
    'focused-opacity': `var(--_focused-${group}-state-layer-opacity)`,
    'pressed-opacity': `var(--_pressed-${group}-state-layer-opacity)`,
})()

const dayRippleStyles = rippleBridge('day')
const yearRippleStyles = rippleBridge('year')
const menuItemRippleStyles = rippleBridge('menu-item')

const stylePart = css`
    @layer mdc.date-picker.component {
        .container > mdc-elevation {
            ${elevationStyles};
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
        }

        :host {
            display: contents;
            user-select: none;
        }

        dialog {
            background: transparent;
            border: none;
            border-start-start-radius: var(--_container-shape-start-start);
            border-start-end-radius: var(--_container-shape-start-end);
            border-end-end-radius: var(--_container-shape-end-end);
            border-end-start-radius: var(--_container-shape-end-start);
            margin: auto;
            max-height: min(560px, calc(100% - 48px));
            max-width: min(560px, calc(100% - 48px));
            min-width: var(--_container-min-width);
            outline: none;
            overflow: visible;
            padding: 0;
            width: fit-content;
        }

        dialog[open] {
            display: flex;
            flex-direction: column;
        }

        ::backdrop {
            background: none;
        }

        .scrim {
            background: var(--md-sys-color-scrim, #000);
            display: none;
            inset: 0;
            opacity: 0.32;
            pointer-events: none;
            position: fixed;
            z-index: 1;
        }

        :host([open]) .scrim {
            display: flex;
        }

        .container {
            background: var(--_enabled-container-color);
            border-radius: inherit;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            min-width: var(--_container-min-width);
            padding-block-start: var(--_container-padding-block-start);
            padding-block-end: var(--_container-padding-block-end);
            padding-inline-start: var(--_container-padding-inline-start);
            padding-inline-end: var(--_container-padding-inline-end);
            position: relative;
            user-select: none;
        }

        .header {
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            height: var(--_header-container-height);
            justify-content: space-between;
            margin-inline-start: calc(-1 * var(--_container-padding-inline-start));
            margin-inline-end: calc(-1 * var(--_container-padding-inline-end));
            padding-block-start: var(--_header-container-padding-block-start);
            padding-block-end: var(--_header-container-padding-block-end);
            padding-inline-start: var(--_header-container-padding-inline-start);
            padding-inline-end: var(--_header-container-padding-inline-end);
        }

        .supporting-text {
            color: var(--_enabled-supporting-text-label-color);
            font-family: var(--_supporting-text-label-font);
            font-size: var(--_supporting-text-label-size);
            font-weight: var(--_supporting-text-label-weight);
            letter-spacing: var(--_supporting-text-label-tracking);
            line-height: var(--_supporting-text-label-leading);
            margin: 0;
        }

        .headline {
            align-items: center;
            color: var(--_enabled-headline-label-color);
            display: flex;
            font-family: var(--_headline-label-font);
            font-size: var(--_headline-label-size);
            font-weight: var(--_headline-label-weight);
            justify-content: space-between;
            letter-spacing: var(--_headline-label-tracking);
            line-height: var(--_headline-label-leading);
            margin: 0;
            min-height: 40px;
        }

        .nav-row {
            align-items: center;
            box-sizing: border-box;
            display: flex;
            height: var(--_nav-container-height);
            justify-content: space-between;
            margin-inline-start: calc(-1 * var(--_container-padding-inline-start));
            margin-inline-end: calc(-1 * var(--_container-padding-inline-end));
            padding-inline-start: var(--_container-padding-inline-start);
            padding-inline-end: var(--_container-padding-inline-end);
            position: relative;
        }

        .menu-button {
            --mdc-button-enabled-text-label-color: var(--_enabled-menu-item-label-color);
            --mdc-button-hovered-text-label-color: var(--_enabled-menu-item-label-color);
            --mdc-button-focused-text-label-color: var(--_enabled-menu-item-label-color);
            --mdc-button-pressed-text-label-color: var(--_enabled-menu-item-label-color);
            --mdc-button-hovered-text-state-layer-color: var(--_hovered-year-state-layer-color);
            --mdc-button-hovered-text-state-layer-opacity: var(--_hovered-year-state-layer-opacity);
            --mdc-button-focused-text-state-layer-color: var(--_focused-year-state-layer-color);
            --mdc-button-focused-text-state-layer-opacity: var(--_focused-year-state-layer-opacity);
            --mdc-button-pressed-text-state-layer-color: var(--_pressed-year-state-layer-color);
            --mdc-button-pressed-text-state-layer-opacity: var(--_pressed-year-state-layer-opacity);
            height: var(--_nav-container-height);
        }

        .docked-nav {
            flex-wrap: wrap;
            gap: 4px;
            justify-content: space-between;
        }

        .menu-group {
            align-items: center;
            display: flex;
        }

        .menu-group-label {
            align-items: center;
            color: var(--_enabled-weekday-label-color);
            display: inline-flex;
            font-family: var(--_menu-item-label-font);
            font-size: var(--_menu-item-label-size);
            font-weight: var(--_menu-item-label-weight);
            letter-spacing: var(--_menu-item-label-tracking);
            line-height: var(--_menu-item-label-leading);
            min-height: 40px;
            padding-inline: 12px;
        }

        .menu {
            background: var(--_enabled-container-color);
            border: none;
            border-block-start: 1px solid var(--_enabled-divider-color);
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            left: 0;
            right: 0;
            max-height: 280px;
            overflow-y: auto;
            padding-block: 8px;
            position: absolute;
            top: 100%;
            z-index: 2;
        }

        .menu-item {
            align-items: center;
            appearance: none;
            background: transparent;
            border: none;
            color: var(--_enabled-menu-item-label-color);
            cursor: pointer;
            display: flex;
            font-family: var(--_menu-item-label-font);
            font-size: var(--_menu-item-label-size);
            font-weight: var(--_menu-item-label-weight);
            gap: 12px;
            letter-spacing: var(--_menu-item-label-tracking);
            line-height: var(--_menu-item-label-leading);
            min-height: 48px;
            padding-inline: 16px;
            position: relative;
            text-align: start;
        }

        .menu-item mdc-ripple {
            position: absolute;
            ${menuItemRippleStyles};
        }

        .menu-item svg {
            height: 24px;
            width: 24px;
            fill: var(--_enabled-menu-selected-icon-color);
            visibility: hidden;
        }

        .menu-item.selected {
            background: var(--_enabled-menu-selected-container-color);
        }

        .menu-item.selected svg {
            visibility: visible;
        }

        .nav-label {
            color: var(--_enabled-supporting-text-label-color);
            font-family: var(--_weekday-label-font);
            font-size: var(--_weekday-label-size);
            font-weight: var(--_weekday-label-weight);
        }

        .nav-buttons {
            display: flex;
            gap: 4px;
        }

        .weekdays {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            margin-block-start: 0px;
        }

        .weekday {
            align-items: center;
            color: var(--_enabled-weekday-label-color);
            display: flex;
            font-family: var(--_weekday-label-font);
            font-size: var(--_weekday-label-size);
            font-weight: var(--_weekday-label-weight);
            height: var(--_day-container-size);
            justify-content: center;
            letter-spacing: var(--_weekday-label-tracking);
            line-height: var(--_weekday-label-leading);
        }

        .grid {
            border: none;
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            margin: 0;
            padding: 0;
        }

        .day {
            align-items: center;
            appearance: none;
            background: transparent;
            border: none;
            box-sizing: border-box;
            cursor: pointer;
            display: flex;
            height: var(--_day-container-size);
            justify-content: center;
            padding: 0;
            position: relative;
            width: 100%;
        }

        .day mdc-ripple {
            border-radius: var(--_day-container-shape);
            inset-block: calc((var(--_day-container-size) - var(--_day-node-size)) / 2);
            inset-inline: calc(50% - var(--_day-node-size) / 2);
            position: absolute;
            ${dayRippleStyles};
        }

        .day-inner {
            align-items: center;
            border-radius: var(--_day-container-shape);
            color: var(--_enabled-day-label-color);
            display: flex;
            font-family: var(--_day-label-font);
            font-size: var(--_day-label-size);
            font-weight: var(--_day-label-weight);
            height: var(--_day-node-size);
            justify-content: center;
            letter-spacing: var(--_day-label-tracking);
            line-height: var(--_day-label-leading);
            position: relative;
            width: var(--_day-node-size);
        }

        .day.outside .day-inner {
            color: var(--_enabled-outside-month-day-label-color);
        }

        .day.today .day-inner {
            color: var(--_enabled-today-day-label-color);
            outline: var(--_today-day-container-outline-width) solid var(--_today-day-container-outline-color);
            outline-offset: -1px;
        }

        .day.selected .day-inner {
            background: var(--_enabled-selected-day-container-color);
            color: var(--_enabled-selected-day-label-color);
        }

        .day.in-range .day-inner {
            background: transparent;
            color: var(--_enabled-range-label-color);
        }

        .day.in-range::before,
        .day.range-start::before,
        .day.range-end::before {
            content: '';
            position: absolute;
            top: calc((var(--_day-container-size) - var(--_day-node-size)) / 2);
            bottom: calc((var(--_day-container-size) - var(--_day-node-size)) / 2);
            background: var(--_enabled-range-container-color);
        }

        .day.in-range::before {
            left: 0;
            right: 0;
        }

        .day.range-start::before {
            left: calc(50% - var(--_day-node-size) / 2);
            right: 0;
            border-radius: calc(var(--_day-node-size) / 2) 0 0 calc(var(--_day-node-size) / 2);
        }

        .day.range-end::before {
            left: 0;
            right: calc(50% - var(--_day-node-size) / 2);
            border-radius: 0 calc(var(--_day-node-size) / 2) calc(var(--_day-node-size) / 2) 0;
        }

        .day.range-pending::before {
            content: none;
        }

        .day.col-first.in-range:not(.range-start)::before {
            left: calc(-1 * var(--_container-padding-inline-start));
        }

        .day.col-last.in-range:not(.range-end)::before {
            right: calc(-1 * var(--_container-padding-inline-end));
        }

        /* Endpoint sitting on the container edge: the band full-bleeds to the
           panel edge just like the middle cells. */
        .day.range-end.col-first::before {
            left: calc(-1 * var(--_container-padding-inline-start));
        }

        .day.range-start.col-last::before {
            right: calc(-1 * var(--_container-padding-inline-end));
        }

        .day.range-start .day-inner,
        .day.range-end .day-inner {
            background: var(--_enabled-selected-day-container-color);
            border-radius: var(--_day-container-shape);
            color: var(--_enabled-selected-day-label-color);
        }

        .day:disabled {
            cursor: default;
        }

        .day:disabled .day-inner {
            color: var(--_enabled-disabled-day-label-color);
            opacity: var(--_enabled-disabled-day-label-opacity);
        }

        .day:focus-visible {
            outline: none;
        }

        .day:focus-visible .day-inner {
            outline: 2px solid var(--_enabled-today-day-label-color);
            outline-offset: 1px;
        }

        .years {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 4px;
            max-height: 320px;
            overflow-y: auto;
        }

        .year {
            appearance: none;
            background: transparent;
            border: none;
            cursor: pointer;
            display: flex;
            height: var(--_day-container-size);
            align-items: center;
            justify-content: center;
            padding: 0;
            position: relative;
        }

        .year mdc-ripple {
            border-radius: var(--_year-container-shape);
            inset-block: calc((var(--_day-container-size) - var(--_year-container-height)) / 2);
            inset-inline: calc(50% - var(--_year-container-width) / 2);
            position: absolute;
            ${yearRippleStyles};
        }

        .year-inner {
            align-items: center;
            border-radius: var(--_year-container-shape);
            color: var(--_enabled-year-label-color);
            display: flex;
            font-family: var(--_year-label-font);
            font-size: var(--_year-label-size);
            height: var(--_year-container-height);
            justify-content: center;
            width: var(--_year-container-width);
        }

        .year.today .year-inner {
            color: var(--_enabled-today-year-label-color);
        }

        .year.selected .year-inner {
            background: var(--_enabled-selected-year-container-color);
            color: var(--_enabled-selected-year-label-color);
        }

        .year:focus-visible {
            outline: none;
        }

        .year:focus-visible .year-inner {
            outline: 2px solid var(--_enabled-today-year-label-color);
            outline-offset: 2px;
        }

        .divider {
            background: var(--_enabled-divider-color);
            height: 1px;
            margin-inline-start: calc(-1 * var(--_container-padding-inline-start));
            margin-inline-end: calc(-1 * var(--_container-padding-inline-end));
            margin-block: 0px;
            width: auto;
        }

        .actions {
            align-items: center;
            box-sizing: border-box;
            display: flex;
            gap: 8px;
            height: var(--_actions-container-height);
            justify-content: flex-end;
            margin-inline-start: calc(-1 * var(--_container-padding-inline-start));
            margin-inline-end: calc(-1 * var(--_container-padding-inline-end));
            padding-inline-start: var(--_container-padding-inline-start);
            padding-inline-end: var(--_container-padding-inline-end);
        }

        .actions-split {
            justify-content: space-between;
        }

        .actions-end {
            display: flex;
            gap: 8px;
        }

        .input-row {
            display: flex;
            gap: 8px;
        }

        .input-field {
            box-sizing: border-box;
            border: 1px solid var(--_enabled-input-outline-color);
            border-radius: 4px;
            display: flex;
            flex-direction: column;
            height: 56px;
            justify-content: center;
            padding-inline: 16px;
            padding-block-start: 8px;
            position: relative;
            width: 100%;
        }

        .input-field:focus-within {
            border-color: var(--_focused-input-outline-color);
            border-width: 2px;
            padding-inline: 15px;
        }

        .input-label {
            background: var(--_enabled-container-color);
            color: var(--_enabled-input-label-color);
            font-family: var(--_input-label-font);
            font-size: var(--_input-label-size);
            font-weight: var(--_input-label-weight);
            left: 12px;
            letter-spacing: var(--_input-label-tracking);
            line-height: var(--_input-label-leading);
            padding-inline: 4px;
            position: absolute;
            top: -8px;
        }

        .input-field:focus-within .input-label {
            color: var(--_focused-input-outline-color);
        }

        .input-field input {
            appearance: none;
            background: transparent;
            border: none;
            color: var(--_enabled-input-text-color);
            font-family: var(--_input-text-font);
            font-size: var(--_input-text-size);
            font-weight: var(--_input-text-weight);
            letter-spacing: var(--_input-text-tracking);
            line-height: var(--_input-text-leading);
            outline: none;
            padding: 0;
            user-select: text;
            width: 100%;
        }

        .top-bar {
            align-items: center;
            box-sizing: border-box;
            display: flex;
            justify-content: space-between;
            padding-block-start: var(--_top-bar-container-padding-block-start);
            padding-block-end: var(--_top-bar-container-padding-block-end);
        }

        .header-center {
            text-align: center;
        }

        .header-center .headline {
            justify-content: center;
        }

        .months {
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            margin-inline-start: calc(-1 * var(--_container-padding-inline-start));
            margin-inline-end: calc(-1 * var(--_container-padding-inline-end));
            overflow-y: auto;
            padding-inline-start: var(--_container-padding-inline-start);
            padding-inline-end: var(--_container-padding-inline-end);
            scrollbar-width: none;
        }

        .stack-month-label {
            color: var(--_enabled-supporting-text-label-color);
            font-family: var(--_weekday-label-font);
            font-size: var(--_weekday-label-size);
            font-weight: var(--_weekday-label-weight);
            letter-spacing: var(--_weekday-label-tracking);
            line-height: var(--_weekday-label-leading);
            margin: 0;
            padding-block: 12px 4px;
            padding-inline-start: 12px;
        }

        dialog.fullscreen {
            max-height: calc(100% - 48px);
            max-width: min(480px, calc(100% - 24px));
            width: min(480px, calc(100% - 24px));
        }

        dialog.fullscreen .header {
            height: auto;
            justify-content: center;
            padding-block-start: 8px;
            padding-block-end: 8px;
        }

        dialog.fullscreen .container {
            max-height: inherit;
        }

        dialog.fullscreen .months {
            max-height: 420px;
        }

        :host([variant='docked']) {
            display: inline-flex;
        }

        .docked-menu {
            position: fixed;
            z-index: 1000;
        }

        .docked-menu[hidden] {
            display: none;
        }

        .docked-wrap {
            display: inline-flex;
            flex-direction: column;
            user-select: none;
        }

        .docked-field {
            align-items: center;
            appearance: none;
            background: transparent;
            border: 1px solid var(--_enabled-field-outline-color);
            border-radius: var(--_field-container-shape);
            box-sizing: border-box;
            color: var(--_enabled-field-label-color);
            cursor: pointer;
            display: flex;
            font-family: var(--_field-label-font);
            font-size: var(--_field-label-size);
            font-weight: var(--_field-label-weight);
            gap: 8px;
            height: var(--_field-container-height);
            justify-content: space-between;
            letter-spacing: var(--_field-label-tracking);
            line-height: var(--_field-label-leading);
            min-width: 240px;
            padding-inline-start: 16px;
            padding-inline-end: 8px;
            position: relative;
            width: 100%;
        }

        .field-notch {
            background: var(--md-sys-color-surface);
            color: var(--_enabled-field-label-color);
            font-family: var(--_field-supporting-label-font);
            font-size: var(--_field-supporting-label-size);
            left: 12px;
            letter-spacing: var(--_field-supporting-label-tracking);
            line-height: var(--_field-supporting-label-leading);
            padding-inline: 4px;
            position: absolute;
            top: -8px;
        }

        .field-value {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .field-trailing {
            align-items: center;
            background: var(--_enabled-field-trailing-container-color);
            border-radius: 8px;
            display: inline-flex;
            justify-content: center;
            padding: 8px;
        }

        .field-supporting {
            color: var(--_enabled-field-supporting-label-color);
            font-family: var(--_field-supporting-label-font);
            font-size: var(--_field-supporting-label-size);
            font-weight: var(--_field-supporting-label-weight);
            letter-spacing: var(--_field-supporting-label-tracking);
            line-height: var(--_field-supporting-label-leading);
            padding-block-start: 4px;
            padding-inline-start: 16px;
        }

        .docked-field:disabled {
            cursor: default;
            opacity: var(--_disabled-field-label-opacity);
        }

        .docked-field:focus-visible {
            outline: 2px solid var(--_enabled-today-day-label-color);
            outline-offset: 2px;
        }

        .docked-field svg {
            color: var(--_enabled-field-icon-color);
            flex-shrink: 0;
            height: var(--_field-icon-size);
            width: var(--_field-icon-size);
            fill: currentColor;
        }

        :host([variant='docked']) .container {
            border-start-start-radius: var(--_container-shape-start-start);
            border-start-end-radius: var(--_container-shape-start-end);
            border-end-end-radius: var(--_container-shape-end-end);
            border-end-start-radius: var(--_container-shape-end-start);
            padding-block-start: var(--_menu-container-padding-block-start);
            padding-block-end: var(--_menu-container-padding-block-end);
        }
    }

    @layer mdc.date-picker.motion {
        @media (prefers-reduced-motion: reduce) {
            :host, :host * {
                animation: none;
                transition: none;
            }
        }
    }

    @layer mdc.date-picker.hcm {
        @media (forced-colors: active) {
            .day-inner, .year-inner {
                forced-color-adjust: none;
            }
            dialog {
                outline: 2px solid WindowText;
            }
            :host([variant='docked']) .container {
                outline: 2px solid WindowText;
            }
            .day.selected .day-inner {
                outline: 2px solid WindowText;
            }
            .day.today .day-inner {
                outline: 2px solid WindowText;
            }
        }
    }

    @layer mdc.date-picker.contrast {
        @media (prefers-contrast: more) {
            dialog {
                outline: 1px solid CanvasText;
            }
        }
        @media (prefers-contrast: less) {
            .divider {
                opacity: 0.7;
            }
        }
    }

    @layer mdc.date-picker.transparency {
        @media (prefers-reduced-transparency: reduce) {
            .scrim {
                opacity: 1;
            }
        }
    }
`

export const DatePickerStyles = [
    css`
        @layer mdc.date-picker {
            @layer variable, component, motion, hcm, contrast, transparency;
        }
    `,
    css`@layer mdc.date-picker.variable {:host {${modalTokens};}}`,
    css`@layer mdc.date-picker.variable {:host([variant='docked']) {${dockedTokens};}}`,
    css`@layer mdc.date-picker.variable {:host([variant='fullscreen']) {${fullscreenTokens};}}`,
    css`@layer mdc.date-picker.variable {:host([display-mode='input']) {${inputTokens};}}`,
    stylePart,
]

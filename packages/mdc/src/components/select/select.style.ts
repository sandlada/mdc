/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import { overrideTokens, stringifyTokens } from '../../utils/style'
import type { ElevationDefinition } from '../elevation/elevation.definition'
import { StandardSelectDefinition, VibrantSelectDefinition } from './select.definition'

const EmphasizedDecelerateEasing = unsafeCSS(Easing.EmphasizedDecelerate.ToCSSValue())
const EmphasizedAccelerateEasing = unsafeCSS(Easing.EmphasizedAccelerate.ToCSSValue())

const Stringify = stringifyTokens('--mdc-select')
const StandardTokens = Stringify(StandardSelectDefinition)
const VibrantTokens = Stringify(VibrantSelectDefinition)

const ElevationBridge = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_menu-container-elevation)`,
})()

const VariablePart = css`
    @layer mdc.select.variable {
        :host([menu-color-style='standard']),
        :host(:not([menu-color-style])) {
            ${StandardTokens};
        }
        :host([menu-color-style='vibrant']) {
            ${VibrantTokens};
        }
    }
`

const ComponentPart = css`
    @layer mdc.select.component {
        :host {
            position: relative;
            display: inline-flex;
            flex-direction: column;
            vertical-align: top;
            outline: none;
            box-sizing: border-box;
            min-width: 210px;
            -webkit-tap-highlight-color: transparent;
        }

        :host([disabled]) {
            pointer-events: none;
        }

        :host([open]) {
            z-index: 1;
        }

        .field {
            width: 100%;
            cursor: pointer;
        }

        :host([disabled]) .field {
            cursor: default;
        }

        .field-trigger {
            display: flex;
            align-items: center;
            width: 100%;
            min-height: 24px;
            outline: none;
            border: none;
            background: transparent;
            padding: 0;
            margin: 0;
            cursor: inherit;
            font-family: var(--_enabled-display-text-font);
            font-size: var(--_enabled-display-text-size);
            font-weight: var(--_enabled-display-text-weight);
            line-height: var(--_enabled-display-text-leading);
            letter-spacing: var(--_enabled-display-text-tracking);
            color: var(--_enabled-display-text-color);
            text-align: start;
        }

        :host([align-end]) .field-trigger {
            justify-content: flex-end;
            text-align: end;
        }

        :host([disabled]) .field-trigger {
            color: var(--_disabled-display-text-color);
            opacity: var(--_disabled-display-text-opacity);
        }

        .display-text {
            flex: 1 1 auto;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .display-text.placeholder {
            color: var(--_enabled-placeholder-color);
        }

        .dropdown-icon-slot {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--_enabled-dropdown-icon-color);
        }

        :host([open]) .dropdown-icon-slot,
        .field[focused] .dropdown-icon-slot {
            color: var(--_focused-dropdown-icon-color);
        }

        :host([error]) .dropdown-icon-slot,
        .field[invalid] .dropdown-icon-slot {
            color: var(--_invalid-dropdown-icon-color);
        }

        :host([disabled]) .dropdown-icon-slot {
            color: var(--_disabled-dropdown-icon-color);
            opacity: var(--_disabled-dropdown-icon-opacity);
        }

        .dropdown-arrow {
            width: var(--_dropdown-icon-size);
            height: var(--_dropdown-icon-size);
            fill: currentColor;
            transition: transform 200ms ${EmphasizedDecelerateEasing};
        }

        :host([open]) .dropdown-arrow {
            transform: rotate(180deg);
        }

        /* Floating listbox menu (promoted to Top Layer via popover="manual") */
        .menu {
            position: fixed;
            inset: auto;
            top: 0;
            left: 0;
            margin: 0;
            border: none;
            z-index: 1;
            display: none;
            flex-direction: column;
            box-sizing: border-box;
            min-width: var(--_menu-container-min-width);
            max-height: var(--_menu-container-max-height);
            padding-block: var(--_menu-container-padding-block-start) var(--_menu-container-padding-block-end);
            padding-inline: var(--_menu-container-padding-inline-start) var(--_menu-container-padding-inline-end);
            background-color: var(--_menu-container-color);
            color: inherit;
            border-start-start-radius: var(--_menu-container-shape-start-start);
            border-start-end-radius: var(--_menu-container-shape-start-end);
            border-end-start-radius: var(--_menu-container-shape-end-start);
            border-end-end-radius: var(--_menu-container-shape-end-end);
            opacity: 0;
            transform: scaleY(0.88);
            transform-origin: top center;
            transition:
                opacity 150ms ${EmphasizedAccelerateEasing},
                transform 150ms ${EmphasizedAccelerateEasing},
                overlay 150ms allow-discrete,
                display 150ms allow-discrete;
            ${ElevationBridge};
        }

        .menu.open,
        .menu:popover-open {
            display: flex;
            opacity: 1;
            transform: scaleY(1);
            transition:
                opacity 200ms ${EmphasizedDecelerateEasing},
                transform 200ms ${EmphasizedDecelerateEasing},
                overlay 200ms allow-discrete,
                display 200ms allow-discrete;
        }

        @starting-style {
            .menu.open,
            .menu:popover-open {
                opacity: 0;
                transform: scaleY(0.88);
            }
        }

        .menu[data-placement^='top'] {
            transform-origin: bottom center;
        }

        .menu.quick {
            transition: none;
        }

        .menu-items {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            overscroll-behavior: contain;
            max-height: inherit;
        }
    }
`

const A11yPart = css`
    @layer mdc.select.a11y {
        @media (prefers-reduced-motion: reduce) {
            .dropdown-arrow,
            .menu,
            .menu.open {
                transition: none;
            }
        }

        @media (prefers-reduced-transparency: reduce) {
            .menu {
                backdrop-filter: none;
            }
        }

        @media (prefers-contrast: more) {
            .menu {
                outline: 2px solid currentColor;
            }
        }

        @media (forced-colors: active) {
            .field-trigger {
                color: CanvasText;
            }
            :host([disabled]) .field-trigger {
                color: GrayText;
                opacity: 1;
            }
            .dropdown-icon-slot {
                color: ButtonText;
            }
            :host([disabled]) .dropdown-icon-slot {
                color: GrayText;
                opacity: 1;
            }
            .menu {
                background-color: Canvas;
                color: CanvasText;
                outline: 1px solid CanvasText;
                forced-color-adjust: none;
            }
        }
    }
`

export const SelectStyles = [VariablePart, ComponentPart, A11yPart]

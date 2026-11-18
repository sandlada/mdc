/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Styles for `mdc-tab`.
 *
 * Three variants consume the same `--_*` internal tokens, stringified per
 * variant via `stringifyTokens`:
 * - `primary`   : MD3 primary tab — 48dp / 64dp cell, stacked icon + label,
 *                 3dp content-fitted bottom indicator with 3dp top radius.
 * - `secondary` : MD3 secondary tab — 48dp cell, inline icon + label,
 *                 2dp full-width square indicator.
 * - `floating`  : MD3E floating tab — 56dp pill cell, filled pill indicator.
 *
 * The `.tab` container deliberately has NO `overflow: hidden` so the outward
 * focus ring is not clipped; each absolutely-positioned layer (ripple /
 * indicator) clips itself to the container shape instead.
 */
import { css } from 'lit'
import { FloatingTabDefinition, PrimaryTabDefinition, SecondaryTabDefinition } from './tab.definition'
import { FocusRingDefinition } from '../focus-ring/focus-ring.definition'
import { IconDefinition } from '../icon/icon.definition'
import { RippleDefinition } from '../ripple/ripple.definition'
import { overrideTokens, stringifyTokens } from '../../utils/style'

const PrimaryTokens = stringifyTokens('--mdc-tab')(PrimaryTabDefinition)
const SecondaryTokens = stringifyTokens('--mdc-tab')(SecondaryTabDefinition)
const FloatingTokens = stringifyTokens('--mdc-tab')(FloatingTabDefinition)

const OverrideRipple = {
    unselected: overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
        'enabled-hovered-color'  : 'var(--_hovered-state-layer-color-unselected)',
        'enabled-hovered-opacity': 'var(--_hovered-state-layer-opacity-unselected)',
        'enabled-focused-color'  : 'var(--_focused-state-layer-color-unselected)',
        'enabled-focused-opacity': 'var(--_focused-state-layer-opacity-unselected)',
        'enabled-pressed-color'  : 'var(--_pressed-state-layer-color-unselected)',
        'enabled-pressed-opacity': 'var(--_pressed-state-layer-opacity-unselected)',
    })(),
    selected: overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
        'enabled-hovered-color'  : 'var(--_hovered-state-layer-color-selected)',
        'enabled-hovered-opacity': 'var(--_hovered-state-layer-opacity-selected)',
        'enabled-focused-color'  : 'var(--_focused-state-layer-color-selected)',
        'enabled-focused-opacity': 'var(--_focused-state-layer-opacity-selected)',
        'enabled-pressed-color'  : 'var(--_pressed-state-layer-color-selected)',
        'enabled-pressed-opacity': 'var(--_pressed-state-layer-opacity-selected)',
    })(),
}

const OverrideFocusRing = overrideTokens<typeof FocusRingDefinition>('--mdc-focus-ring')({
    'shape-start-start': 'var(--_container-shape-start-start)',
    'shape-start-end'  : 'var(--_container-shape-start-end)',
    'shape-end-start'  : 'var(--_container-shape-end-start)',
    'shape-end-end'    : 'var(--_container-shape-end-end)',
})()

const OverrideIcon = overrideTokens<typeof IconDefinition>('--mdc-icon')({
    'enabled-size': 'var(--_icon-size)',
})()

export const TabStyles = [
    css`
        :host([variant="primary"]) {
            ${PrimaryTokens};
        }
        :host([variant="secondary"]) {
            ${SecondaryTokens};
        }
        :host([variant="floating"]) {
            ${FloatingTokens};
        }
    `,
    css`
        @layer mdc.tab.layout {
            :host {
                display: inline-flex;
                position: relative;
                box-sizing: border-box;
                vertical-align: top;
                flex: 0 1 auto;
                height: var(--_container-height);
                max-width: 360px;
                cursor: pointer;
                user-select: none;
                -webkit-tap-highlight-color: transparent;
                outline: none;
                z-index: 0;
            }

            :host([variant="primary"]) {
                min-width: 90px;
            }

            :host([has-icon]:not([icon-only])) {
                height: var(--_with-icon-and-label-text-container-height);
            }

            :host([disabled]) {
                cursor: default;
                pointer-events: none;
            }

            :host([icon-only]) .label {
                display: none;
            }

            .tab {
                position: relative;
                z-index: 0;
                box-sizing: border-box;
                display: flex;
                flex: 1;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                padding-block-start: var(--_container-block-leading-space);
                padding-block-end: var(--_container-block-trailing-space);
                padding-inline-start: var(--_container-inline-leading-space);
                padding-inline-end: var(--_container-inline-trailing-space);
                border-start-start-radius: var(--_container-shape-start-start);
                border-start-end-radius: var(--_container-shape-start-end);
                border-end-start-radius: var(--_container-shape-end-start);
                border-end-end-radius: var(--_container-shape-end-end);
                background-color: var(--_enabled-container-color);
                box-shadow: var(--_enabled-container-elevation);
            }
        }

        @layer mdc.tab.composite {
            .tab mdc-ripple {
                border-radius: inherit;
                z-index: 0;
                ${OverrideRipple.unselected};
            }
            :host([active]) .tab mdc-ripple {
                ${OverrideRipple.selected};
            }
            :host([disabled]) .tab mdc-ripple {
                display: none;
            }

            .tab > mdc-focus-ring {
                z-index: 1;
                ${OverrideFocusRing};
            }
        }

        @layer mdc.tab.content {
            .content {
                position: relative;
                box-sizing: border-box;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                min-width: 0;
                max-width: 100%;
            }

            /* MD3 primary: icon stacked above label. */
            :host([variant="primary"]) .content {
                flex-direction: column;
                gap: var(--_spacing-between-icon-and-label);
            }

            /* MD3 secondary / MD3E floating: inline icon + label. */
            :host([variant="secondary"]) .content,
            :host([variant="floating"]) .content {
                flex-direction: row;
                gap: var(--_spacing-between-icon-and-label);
            }
        }

        @layer mdc.tab.icon {
            .icon {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                flex: none;
                width: var(--_icon-size);
                height: var(--_icon-size);
                color: var(--_enabled-icon-color-unselected);
                ${OverrideIcon};
                pointer-events: none;
            }
            :host(:not([has-icon])) .icon {
                display: none;
            }
            :host(:hover:not([active]):not([disabled])) .icon {
                color: var(--_hovered-icon-color-unselected);
            }
            :host(:focus-visible:not([active]):not([disabled])) .icon {
                color: var(--_focused-icon-color-unselected);
            }
            :host(:active:not([active]):not([disabled])) .icon {
                color: var(--_pressed-icon-color-unselected);
            }
            :host([active]:not([disabled])) .icon {
                color: var(--_enabled-icon-color-selected);
            }
            :host([active]:hover:not([disabled])) .icon {
                color: var(--_hovered-icon-color-selected);
            }
            :host([active]:focus-visible:not([disabled])) .icon {
                color: var(--_focused-icon-color-selected);
            }
            :host([active]:active:not([disabled])) .icon {
                color: var(--_pressed-icon-color-selected);
            }
            :host([disabled]) .icon {
                color: var(--_disabled-icon-color);
                opacity: var(--_disabled-icon-opacity);
            }
        }

        @layer mdc.tab.label {
            .label {
                display: inline-block;
                box-sizing: border-box;
                min-width: 0;
                max-width: 100%;
                font-family: var(--_label-font);
                font-size: var(--_label-size);
                line-height: var(--_label-leading);
                font-weight: var(--_label-weight);
                letter-spacing: var(--_label-tracking);
                color: var(--_enabled-label-color-unselected);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                pointer-events: none;
            }
            :host(:hover:not([active]):not([disabled])) .label {
                color: var(--_hovered-label-color-unselected);
            }
            :host(:focus-visible:not([active]):not([disabled])) .label {
                color: var(--_focused-label-color-unselected);
            }
            :host(:active:not([active]):not([disabled])) .label {
                color: var(--_pressed-label-color-unselected);
            }
            :host([active]:not([disabled])) .label {
                color: var(--_enabled-label-color-selected);
            }
            :host([active]:hover:not([disabled])) .label {
                color: var(--_hovered-label-color-selected);
            }
            :host([active]:focus-visible:not([disabled])) .label {
                color: var(--_focused-label-color-selected);
            }
            :host([active]:active:not([disabled])) .label {
                color: var(--_pressed-label-color-selected);
            }
            :host([disabled]) .label {
                color: var(--_disabled-label-color);
                opacity: var(--_disabled-label-opacity);
            }
        }

        @layer mdc.tab.badge {
            .badge {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                pointer-events: none;
            }
            :host(:not([has-badge])) .badge {
                display: none;
            }
            :host([has-icon]) .badge {
                position: absolute;
                inset-block-start: -2px;
                inset-inline-end: -6px;
            }
            :host(:not([has-icon])) .badge {
                margin-inline-start: 4px;
            }
        }

        @layer mdc.tab.indicator {
            .indicator {
                position: absolute;
                box-sizing: border-box;
                background-color: var(--_enabled-active-indicator-color);
                border-start-start-radius: var(--_active-indicator-shape-start-start);
                border-start-end-radius: var(--_active-indicator-shape-start-end);
                border-end-start-radius: var(--_active-indicator-shape-end-start);
                border-end-end-radius: var(--_active-indicator-shape-end-end);
                transform-origin: center;
                z-index: -1;
                pointer-events: none;
            }
            :host(:not([active])) .indicator {
                opacity: 0;
            }
            :host([active][disabled]) .indicator {
                background-color: var(--_disabled-active-indicator-color);
                opacity: var(--_disabled-active-indicator-opacity);
            }

            /* Primary: content-fitted 3dp bar flush to the block-end edge. */
            :host([variant="primary"]) .indicator {
                inset-inline-start: 0;
                inset-inline-end: 0;
                margin-inline: auto;
                min-width: var(--_active-indicator-min-width);
                inset-block-end: var(--_active-indicator-block-trailing-space);
                height: var(--_active-indicator-height);
            }

            /* Secondary: full-width 2dp bar flush to the block-end edge. */
            :host([variant="secondary"]) .indicator {
                inset-inline-start: var(--_active-indicator-inline-leading-space);
                inset-inline-end: var(--_active-indicator-inline-trailing-space);
                inset-block-end: var(--_active-indicator-block-trailing-space);
                height: var(--_active-indicator-height);
            }

            /* MD3E floating: filled pill inside the container. */
            :host([variant="floating"]) .indicator {
                inset-block-start: var(--_active-indicator-block-leading-space);
                inset-block-end: var(--_active-indicator-block-trailing-space);
                inset-inline-start: var(--_active-indicator-inline-leading-space);
                inset-inline-end: var(--_active-indicator-inline-trailing-space);
            }
        }

        @layer mdc.tab.motion {
            @media (prefers-reduced-motion: reduce) {
                .indicator,
                .label,
                .icon {
                    transition: none;
                    animation: none;
                }
            }
        }

        @layer mdc.tab.contrast {
            @media (prefers-contrast: more) {
                :host([active]) .label {
                    font-weight: 700;
                }
                :host([variant="floating"][active]) .indicator {
                    outline: 2px solid CanvasText;
                }
            }

            @media (prefers-contrast: less) {
                :host(:not([active])) .label,
                :host(:not([active])) .icon {
                    opacity: 0.8;
                }
            }
        }

        @layer mdc.tab.transparency {
            @media (prefers-reduced-transparency: reduce) {
                :host([disabled]) .label,
                :host([disabled]) .icon {
                    opacity: 1;
                    color: color-mix(in srgb, var(--_disabled-label-color) 65%, Canvas);
                }
                :host([active][disabled]) .indicator {
                    opacity: 1;
                    background-color: color-mix(in srgb, var(--_disabled-active-indicator-color) 65%, Canvas);
                }
            }
        }

        @layer mdc.tab.hcm {
            @media (forced-colors: active) {
                :host(:not([active])) .label,
                :host(:not([active])) .icon {
                    color: CanvasText;
                }
                :host([active]) .label,
                :host([active]) .icon {
                    color: Highlight;
                }
                :host([active]) .indicator {
                    background-color: Highlight;
                }
                :host([variant="floating"][active]) .indicator {
                    background-color: Highlight;
                }
                :host([variant="floating"][active]) .label,
                :host([variant="floating"][active]) .icon {
                    color: HighlightText;
                }
                :host([disabled]) .label,
                :host([disabled]) .icon {
                    color: GrayText;
                    opacity: 1;
                }
                :host([active][disabled]) .indicator {
                    background-color: GrayText;
                    opacity: 1;
                }
            }
        }
    `,
]

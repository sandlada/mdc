/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import { RadioButtonDefinition } from '../../component-definitions/radio-button.definition'
import type { RippleDefinition } from '../../component-definitions/ripple.definition'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'
import { overrideComponentTokens, stringTokens } from '../../utils/tokens'

const tokenRecord = defineTokenRefsRecord(RadioButtonDefinition, {
    expandShapes: false,
    useBaseFallback: true,
    prefix: '--mdc-radio-button'
})
const tokenString = unsafeCSS(defineVars(tokenRecord, true).join(''))

export const radioButtonStyle = css`
    @layer mdc.radio-button {
        @layer variable {
            :host { ${tokenString} }
        }

        @layer base {
            :host {
                display: inline-flex;
                outline: none;
                position: relative;
                vertical-align: top;
                -webkit-tap-highlight-color: transparent;
                cursor: pointer;
                height: var(--_icon-size);
                width: var(--_icon-size);
                margin: max(0px, ((48px - var(--_state-layer-size)) / 1));
            }

            :host([disabled]) {
                cursor: default;
                pointer-events: none;
            }

            :host([touch-target='none']) {
                margin: 0px;
            }

            .container {
                display: flex;
                height: 100%;
                place-content: center;
                place-items: center;
                width: 100%;
                position: relative;
                z-index: 0;
            }

            .touch-target {
                all: unset;
                height: 48px;
                position: absolute;
                width: 48px;
                z-index: 1;
            }

            .icon {
                position: absolute;
                inset: 0;
                transform: rotate(-90deg);
            }

            .icon {
                fill: none;
                stroke-width: 2px;
                transform-origin: center;
            }

            .outer {
                transition-property: stroke, r, opacity;
            }
            .unselected .outer {
                r: 9px;
                stroke: var(--_enabled-icon-color-unselected);
                transition-timing-function: ${unsafeCSS(Easing.Emphasized)};
                transition-duration: 250ms;
            }
            .selected .outer {
                r: 8px;
                stroke: var(--_enabled-icon-color-selected);
                transition-timing-function: ${unsafeCSS(Easing.EmphasizedDecelerate)};
                transition-duration: 300ms;
            }

            .inner {
                transition-property: stroke, stroke-width, r, opacity;
            }
            .unselected .inner {
                r: 9px;
                stroke-width: 0px;
                stroke: var(--_enabled-icon-color-unselected);
                opacity: 0;
                transition-timing-function: ${unsafeCSS(Easing.Emphasized)};
                transition-duration: 250ms;
            }
            .selected .inner {
                r: 2.5px;
                stroke-width: 5px;
                stroke: var(--_enabled-icon-color-selected);
                opacity: 1;
                transition-timing-function: ${unsafeCSS(Easing.EmphasizedDecelerate)};
                transition-duration: 300ms;
            }

            :host([disabled])  {
                animation-duration: 0s;
                transition-duration: 0s;
            }

            :host(:hover) .unselected .icon {
                stroke: var(--_hovered-icon-color-unselected);
            }
            :host(:focus-within) .unselected .icon {
                stroke: var(--_focused-icon-color-unselected);
            }
            :host(:active) .unselected .icon {
                stroke: var(--_pressed-icon-color-unselected);
            }
            :host([disabled]) .unselected .icon :is(.outer, .inner) {
                stroke: var(--_disabled-icon-color-unselected);
                opacity: var(--_disabled-icon-opacity-unselected);
            }

            :host(:hover) .selected .icon {
                stroke: var(--_hovered-icon-color-selected);
            }
            :host(:focus-within) .selected .icon {
                stroke: var(--_focused-icon-color-selected);
            }
            :host(:active) .selected .icon {
                stroke: var(--_pressed-icon-color-selected);
            }
            :host([disabled]) .selected .icon :is(.outer, .inner) {
                stroke: var(--_disabled-icon-color-selected);
                opacity: var(--_disabled-icon-opacity-selected);
            }

        }

        @layer hcm {
            @media (forced-colors: active) {
                .icon {
                    fill: CanvasText;
                }

                :host([disabled]) .icon {
                    fill: GrayText;
                    opacity: 1;
                }
            }
        }

        @layer composite.ripple {
            .container mdc-ripple {
                border-radius: 50%;
                inset: unset;
                height: var(--_state-layer-size);
                width: var(--_state-layer-size);
            }
            .container.selected mdc-ripple {
                ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', {
                    'enabled-hovered-color': `var(--_hovered-state-layer-color-selected)`,
                    'enabled-hovered-opacity': `var(--_hovered-state-layer-opacity-selected)`,
                    'enabled-pressed-color': `var(--_pressed-state-layer-color-selected)`,
                    'enabled-pressed-opacity': `var(--_pressed-state-layer-opacity-selected)`,
                })))}
            }
            .container:not(.selected) mdc-ripple {
                ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', {
                    'enabled-hovered-color': `var(--_hovered-state-layer-color-unselected)`,
                    'enabled-hovered-opacity': `var(--_hovered-state-layer-opacity-unselected)`,
                    'enabled-pressed-color': `var(--_pressed-state-layer-color-unselected)`,
                    'enabled-pressed-opacity': `var(--_pressed-state-layer-opacity-unselected)`,
                })))}
            }
        }

        @layer composite.focus-ring {
            .container mdc-focus-ring {
                height: calc(var(--_icon-size) + 3px);
                width: calc(var(--_icon-size) + 3px);
                inset: unset;
                border-radius: 50%;
            }
        }
    }
`

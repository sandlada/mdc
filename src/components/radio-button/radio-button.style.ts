/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import { RadioButtonDefinition } from '../../component-definitions/radio-button.definition'
import type { RippleDefinition } from '../../component-definitions/ripple.definition'
import { createWrappedTokens, overrideComponentTokens, stringTokens } from '../../utils/tokens'

const tokens = createWrappedTokens('--mdc-radio-button', RadioButtonDefinition)
const tokenString = stringTokens(tokens)

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
            }

            .touch-target {
                height: 48px;
                position: absolute;
                width: 48px;
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
                transition: fill 50ms linear;
            }
            .unselected .outer {
                stroke: var(--_unselected-icon-color);
            }
            .selected .outer {
                stroke: var(--_selected-icon-color);
            }

            .inner {
                transition-property: stroke, stroke-width, r, opacity;
            }
            .unselected .inner {
                r: 9px;
                stroke-width: 0px;
                stroke: var(--_unselected-icon-color);
                opacity: 0;
                transition-timing-function: ${unsafeCSS(Easing.EmphasizedAccelerate)};
                transition-duration: 150ms;
            }
            .selected .inner {
                r: 2.5px;
                stroke-width: 5px;
                stroke: var(--_selected-icon-color);
                opacity: 1;
                transition-timing-function: ${unsafeCSS(Easing.EmphasizedDecelerate)};
                transition-duration: 500ms;
            }

            :host([disabled])  {
                animation-duration: 0s;
                transition-duration: 0s;
            }

            :host(:hover) .unselected .icon {
                stroke: var(--_hovered-unselected-icon-color);
            }
            :host(:focus-within) .unselected .icon {
                stroke: var(--_focused-unselected-icon-color);
            }
            :host(:active) .unselected .icon {
                stroke: var(--_pressed-unselected-icon-color);
            }
            :host([disabled]) .unselected .icon :is(.outer, .inner) {
                stroke: var(--_disabled-unselected-icon-color);
                opacity: var(--_disabled-unselected-icon-opacity);
            }

            :host(:hover) .selected .icon {
                stroke: var(--_hovered-selected-hover-icon-color);
            }
            :host(:focus-within) .selected .icon {
                stroke: var(--_focused-selected-focus-icon-color);
            }
            :host(:active) .selected .icon {
                stroke: var(--_pressed-selected-pressed-icon-color);
            }
            :host([disabled]) .selected .icon :is(.outer, .inner) {
                stroke: var(--_disabled-selected-icon-color);
                opacity: var(--_disabled-selected-icon-opacity);
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
                    'hovered-color': `var(--_hovered-selected-state-layer-color)`,
                    'hovered-opacity': `var(--_hovered-selected-state-layer-opacity)`,
                    'pressed-color': `var(--_pressed-selected-state-layer-color)`,
                    'pressed-opacity': `var(--_pressed-selected-state-layer-opacity)`,
                })))}
            }
            .container:not(.selected) mdc-ripple {
                ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', {
                    'hovered-color': `var(--_hovered-unselected-state-layer-color)`,
                    'hovered-opacity': `var(--_hovered-unselected-state-layer-opacity)`,
                    'pressed-color': `var(--_pressed-unselected-state-layer-color)`,
                    'pressed-opacity': `var(--_pressed-unselected-state-layer-opacity)`,
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

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { overrideTokens, stringifyTokens } from '../../utils/style'
import { css, unsafeCSS } from 'lit'
import type { RippleDefinition } from '../ripple/ripple.definition'
import { ButtonSizeDefinition } from './button-size.definition'
import {
    buttonLayoutStyles,
    elevationBridge,
    getFocusRingShape,
    getIconSizeStyle,
    getShape,
    sizePart,
    type TSize,
    type TState
} from './button.style'
import { ButtonVariants } from './button.definition'
import { ToggleButtonDefinition, ToggleStates } from './toggle-button.definition'

const toggleButtonTokens = stringifyTokens('--mdc-toggle-button')(ToggleButtonDefinition)
const sizeTokens = stringifyTokens('--mdc-toggle-button')(ButtonSizeDefinition)

const getSizedShape = (mode: TState) => css`
    &.extra-small { ${getShape('extra-small', mode)}; }
    &.small { ${getShape('small', mode)}; }
    &.medium { ${getShape('medium', mode)}; }
    &.large { ${getShape('large', mode)}; }
    &.extra-large { ${getShape('extra-large', mode)}; }
`

export const getToggleContainerShapeStyles = () => css`
    .container.round {${getSizedShape('container-shape-round')};}
    .container.square {${getSizedShape('container-shape-square')};}
    .container.round.togglable.selected {${getSizedShape('container-shape-round-selected')};}
    .container.square.togglable.selected {${getSizedShape('container-shape-square-selected')};}
    .container:not(.disable-morph).togglable:is(.selected, .unselected):has(.toggle-input:active) {${getSizedShape('container-shape-pressed-morph')};}
`

const getSizedFocusRingShape = (mode: TState) => css`
    &.extra-small mdc-focus-ring {${getFocusRingShape('extra-small', mode)};}
    &.small mdc-focus-ring {${getFocusRingShape('small', mode)};}
    &.medium mdc-focus-ring {${getFocusRingShape('medium', mode)};}
    &.large mdc-focus-ring {${getFocusRingShape('large', mode)};}
    &.extra-large mdc-focus-ring {${getFocusRingShape('extra-large', mode)};}
`

export const getToggleFocusRingStyles = () => css`
    .container.round {${getSizedFocusRingShape('container-shape-round')};}
    .container.square {${getSizedFocusRingShape('container-shape-square')};}
    .container.togglable.selected.round {${getSizedFocusRingShape('container-shape-round-selected')};}
    .container.togglable.selected.square {${getSizedFocusRingShape('container-shape-square-selected')};}
    .container:not(.disable-morph).togglable:is(.selected, .unselected):has(.toggle-input:active) {${getSizedFocusRingShape('container-shape-pressed-morph')};}
`

const toggleRippleBridge = (variant: string, toggle: string) => overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'hovered-color': `var(--_hovered-${variant}-${toggle}-state-layer-color)`,
    'focused-color': `var(--_focused-${variant}-${toggle}-state-layer-color)`,
    'pressed-color': `var(--_pressed-${variant}-${toggle}-state-layer-color)`,
    'hovered-opacity': `var(--_hovered-state-layer-opacity)`,
    'focused-opacity': `var(--_focused-state-layer-opacity)`,
    'pressed-opacity': `var(--_pressed-state-layer-opacity)`
})()

const toggleVariantRules = ButtonVariants.map((variant) => ToggleStates.map((toggle) => `
    .container.togglable.${toggle}.${variant} .background {
        background-color: var(--_enabled-${variant}-${toggle}-container-color);
    }
    .container.togglable.${toggle}.${variant} .label {
        color: var(--_enabled-${variant}-${toggle}-label-color);
    }
    .container.togglable.${toggle}.${variant} :is(::slotted([slot="icon"]), .icon) {
        color: var(--_enabled-${variant}-${toggle}-icon-color);
    }
    .container.togglable.disabled.${toggle}.${variant} .background {
        background-color: var(--_disabled-${variant}-${toggle}-container-color);
        opacity: var(--_disabled-container-opacity);
    }
    .container.togglable.disabled.${toggle}.${variant} .label {
        color: var(--_disabled-${variant}-${toggle}-label-color);
        opacity: var(--_disabled-label-opacity);
    }
    .container.togglable.disabled.${toggle}.${variant} :is(::slotted([slot="icon"]), .icon) {
        color: var(--_disabled-${variant}-${toggle}-icon-color);
        opacity: var(--_disabled-icon-opacity);
    }
`).join('\n\n')).join('\n\n')

const toggleElevationVariants = ['filled', 'filled-tonal', 'elevated'] as const

const toggleElevationRules = toggleElevationVariants.map((variant) => `
    .container.togglable.${variant} mdc-elevation {
        transition-duration: 0ms;
        ${elevationBridge(`--_enabled-${variant}-unselected-container-elevation`, `--_enabled-${variant}-unselected-container-shadow-color`).cssText};
    }
`).join('\n\n')

const togglePart = css`
    .toggle-input {
        all: unset;
        appearance: none;
        position: absolute;
        inset: 0;
        height: 100%;
        width: 100%;
        margin: 0;
        opacity: 0;
        outline: none;
        border: none;
        z-index: 1;
        cursor: inherit;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    ${unsafeCSS(toggleVariantRules)}

    .container.togglable.unselected.outlined .outline {
        border-color: var(--_enabled-outlined-unselected-outline-color);
    }
    .container.togglable.selected.outlined .outline {
        border-color: var(--_enabled-outlined-selected-outline-color);
    }

    ${unsafeCSS(toggleElevationRules)}
    .container.togglable.disabled.elevated mdc-elevation {
        ${elevationBridge('--_disabled-elevated-unselected-container-elevation', '--_disabled-elevated-unselected-container-shadow-color')};
    }

    .container.togglable.unselected.filled mdc-ripple {${toggleRippleBridge('filled', 'unselected')};}
    .container.togglable.selected.filled mdc-ripple {${toggleRippleBridge('filled', 'selected')};}
    .container.togglable.unselected.filled-tonal mdc-ripple {${toggleRippleBridge('filled-tonal', 'unselected')};}
    .container.togglable.selected.filled-tonal mdc-ripple {${toggleRippleBridge('filled-tonal', 'selected')};}
    .container.togglable.unselected.elevated mdc-ripple {${toggleRippleBridge('elevated', 'unselected')};}
    .container.togglable.selected.elevated mdc-ripple {${toggleRippleBridge('elevated', 'selected')};}
    .container.togglable.unselected.outlined mdc-ripple {${toggleRippleBridge('outlined', 'unselected')};}
    .container.togglable.selected.outlined mdc-ripple {${toggleRippleBridge('outlined', 'selected')};}
    .container.togglable.unselected.text mdc-ripple {${toggleRippleBridge('text', 'unselected')};}
    .container.togglable.selected.text mdc-ripple {${toggleRippleBridge('text', 'selected')};}
`

export const toggleA11y = css`
    @media (forced-colors: active) {
        .background {
            border: 1px solid CanvasText;
        }

        :host([disabled]) {
            --_disabled-filled-unselected-icon-color: GrayText;
            --_disabled-filled-selected-icon-color: GrayText;
            --_disabled-filled-tonal-unselected-icon-color: GrayText;
            --_disabled-filled-tonal-selected-icon-color: GrayText;
            --_disabled-elevated-unselected-icon-color: GrayText;
            --_disabled-elevated-selected-icon-color: GrayText;
            --_disabled-outlined-unselected-icon-color: GrayText;
            --_disabled-outlined-selected-icon-color: GrayText;
            --_disabled-text-unselected-icon-color: GrayText;
            --_disabled-text-selected-icon-color: GrayText;
            --_disabled-icon-opacity: 1;
            --_disabled-container-opacity: 1;
            --_disabled-filled-unselected-label-color: GrayText;
            --_disabled-filled-selected-label-color: GrayText;
            --_disabled-filled-tonal-unselected-label-color: GrayText;
            --_disabled-filled-tonal-selected-label-color: GrayText;
            --_disabled-elevated-unselected-label-color: GrayText;
            --_disabled-elevated-selected-label-color: GrayText;
            --_disabled-outlined-unselected-label-color: GrayText;
            --_disabled-outlined-selected-label-color: GrayText;
            --_disabled-text-unselected-label-color: GrayText;
            --_disabled-text-selected-label-color: GrayText;
            --_disabled-label-opacity: 1;
            --_disabled-filled-unselected-container-color: Canvas;
            --_disabled-filled-selected-container-color: Canvas;
            --_disabled-filled-tonal-unselected-container-color: Canvas;
            --_disabled-filled-tonal-selected-container-color: Canvas;
            --_disabled-elevated-unselected-container-color: Canvas;
            --_disabled-elevated-selected-container-color: Canvas;
            --_disabled-outlined-unselected-container-color: Canvas;
            --_disabled-outlined-selected-container-color: Canvas;
            --_disabled-text-unselected-container-color: Canvas;
            --_disabled-text-selected-container-color: Canvas;
            --_disabled-outlined-unselected-outline-color: GrayText;
            --_disabled-outlined-selected-outline-color: GrayText;
        }

        :host([disabled]) .container.outlined .outline {
            border-color: GrayText;
        }

        .container.outlined .outline {
            border-color: ButtonText;
        }

        .container.text {
            border: 1px solid transparent;
        }

        mdc-ripple {
            display: none;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .container,
        .container * {
            transition: none;
        }
    }

    @media (prefers-contrast: more) {
        .container .outline {
            border-color: CanvasText;
        }
        .container .label {
            color: CanvasText;
        }
        .container :is(::slotted([slot="icon"]), .icon) {
            color: CanvasText;
        }
    }

    @media (prefers-contrast: less) {
        .container .outline {
            border-color: GrayText;
        }
    }
`

export const toggleButtonStyles = [
    css`:host {${toggleButtonTokens}${sizeTokens};}`,
    getToggleContainerShapeStyles(),
    getToggleFocusRingStyles(),
    getIconSizeStyle(),
    buttonLayoutStyles,
    togglePart,
    sizePart,
    toggleA11y
]

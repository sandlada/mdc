/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { createStyleSheet, overrideTokens, stringifyTokens } from '@sandlada/styles/adapters/lit'
import { css } from 'lit'
import type { RippleDefinition } from '../ripple/ripple.definition'
import { ButtonSizeDefinition } from './button-size.definition'
import {
    buttonLayoutStyles,
    buttonTables,
    elevationBridge,
    getFocusRingShape,
    getIconSizeStyle,
    getShape,
    sizePart,
    type TSize,
    type TState
} from './button.style'
import { ToggleButtonDefinition } from './toggle-button.definition'

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

const togglePart = createStyleSheet(buttonTables)(ToggleButtonDefinition)(() => css`
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

    @state(.container) .container.togglable .background {
        background-color: var(--_container-color);
        opacity: var(--_container-opacity);
    }

    @state(.container) .container.togglable .label {
        color: var(--_label-color);
        opacity: var(--_label-opacity);
    }

    @state(.container) .container.togglable :is(::slotted([slot="icon"]), .icon) {
        color: var(--_icon-color);
        opacity: var(--_icon-opacity);
    }

    @state(.container) .container.togglable .outline {
        border-color: var(--_outline-color);
    }

    @state(.container) .container.togglable mdc-elevation {
        transition-duration: 0ms;
        ${elevationBridge}
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
`)

export const toggleA11y = createStyleSheet(buttonTables)(ToggleButtonDefinition)(() => css`
    @forced-colors {
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

    @reduced-motion {
        .container,
        .container * {
            transition: none;
        }
    }

    @contrast-more {
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

    @contrast-less {
        .container .outline {
            border-color: GrayText;
        }
    }
`)

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

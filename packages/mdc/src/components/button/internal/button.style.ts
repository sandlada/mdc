/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { flow } from '@sandlada/styles/foundation'
import { emptyTables, withState } from '@sandlada/styles/schema'
import { createStyleSheet, overrideTokens, stringifyTokens } from '@sandlada/styles/adapters/lit'
import { ButtonDefinition, ToggleButtonDefinition } from '../button.definition'
import type { RippleDefinition } from '../../ripple/ripple.definition'
import type { ElevationDefinition } from '../../elevation/elevation.definition'
import { FocusRingDefinition } from '../../focus-ring/focus-ring.definition'
import type { IconDefinition } from '../../icon/icon.definition'

const buttonTokens = stringifyTokens('--mdc-button')(ButtonDefinition)
const toggleButtonTokens = stringifyTokens('--mdc-button')(ToggleButtonDefinition)

const tables = flow(
    withState({
        enabled: '',
        hovered: ':hover',
        focused: ':focus-within',
        pressed: ':active',
        disabled: '.disabled',
        filled: '.filled',
        'filled-tonal': '.filled-tonal',
        elevated: '.elevated',
        outlined: '.outlined',
        text: '.text',
        unselected: '.unselected',
        selected: '.selected'
    })
)(emptyTables)

const elevationBridge = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_container-elevation)`,
    'shadow-color': `var(--_container-shadow-color)`
})()

type TState = 'container-shape-round' | 'container-shape-square' | 'container-shape-round-selected' | 'container-shape-square-selected' | 'container-shape-pressed-morph'
type TSize = 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'

const getContainerShapeStyles = () => {
    const getShape = (s: TSize, mode: TState) => unsafeCSS(`
        border-start-start-radius: min(var(--_${s}-${mode}-start-start), calc(var(--_${s}-container-height) / 2));
        border-start-end-radius: min(var(--_${s}-${mode}-start-end), calc(var(--_${s}-container-height) / 2));
        border-end-start-radius: min(var(--_${s}-${mode}-end-start), calc(var(--_${s}-container-height) / 2));
        border-end-end-radius: min(var(--_${s}-${mode}-end-end), calc(var(--_${s}-container-height) / 2));
    `)
    const getSizedShape = (mode: TState) => css`
        &.extra-small { ${getShape('extra-small', mode)}; }
        &.small { ${getShape('small', mode)}; }
        &.medium { ${getShape('medium', mode)}; }
        &.large { ${getShape('large', mode)}; }
        &.extra-large { ${getShape('extra-large', mode)}; }
    `
    return css`
        .container.round {${getSizedShape('container-shape-round')};}
        .container.square {${getSizedShape('container-shape-square')};}
        .container.round.togglable.selected {${getSizedShape('container-shape-round-selected')};}
        .container.square.togglable.selected {${getSizedShape('container-shape-square-selected')};}
        .container:not(.disable-morph, .togglable):is(.round, .square):active,
        .container:not(.disable-morph).togglable:is(.selected, .unselected):has(.toggle-input:active) {${getSizedShape('container-shape-pressed-morph')};}
    `
}
const getFocusRingStyles = () => {
    const getShape = (
        size: TSize,
        mode: TState
    ) => overrideTokens<typeof FocusRingDefinition>('--mdc-focus-ring')({
        'shape-start-start': `min(var(--_${size}-${mode}-start-start), calc(var(--_${size}-container-height) / 2))`,
        'shape-start-end': `min(var(--_${size}-${mode}-start-end), calc(var(--_${size}-container-height) / 2))`,
        'shape-end-end': `min(var(--_${size}-${mode}-end-end), calc(var(--_${size}-container-height) / 2))`,
        'shape-end-start': `min(var(--_${size}-${mode}-end-start), calc(var(--_${size}-container-height) / 2))`,
    })()
    const getSizedShape = (mode: TState) => css`
        &.extra-small mdc-focus-ring {${getShape('extra-small', mode)};}
        &.small mdc-focus-ring {${getShape('small', mode)};}
        &.medium mdc-focus-ring {${getShape('medium', mode)};}
        &.large mdc-focus-ring {${getShape('large', mode)};}
        &.extra-large mdc-focus-ring {${getShape('extra-large', mode)};}
    `
    return css`
        .container.round {${getSizedShape('container-shape-round')};}
        .container.square {${getSizedShape('container-shape-square')};}
        .container.togglable.selected.round {${getSizedShape('container-shape-round-selected')};}
        .container.togglable.selected.square {${getSizedShape('container-shape-square-selected')};}
        .container:not(.disable-morph, .togglable):is(.round, .square):active,
        .container:not(.disable-morph).togglable:is(.selected, .unselected):has(.toggle-input:active) {${getSizedShape('container-shape-pressed-morph')};}
    `
}
const getIconSizeStyle = () => {
    return css`
        .container.extra-small :is(::slotted([slot="icon"]), .icon) {${overrideTokens<typeof IconDefinition>('--mdc-icon')({ 'size': `var(--_extra-small-icon-size)` })()};}
        .container.small :is(::slotted([slot="icon"]), .icon) {${overrideTokens<typeof IconDefinition>('--mdc-icon')({ 'size': `var(--_small-icon-size)` })()};}
        .container.medium :is(::slotted([slot="icon"]), .icon) {${overrideTokens<typeof IconDefinition>('--mdc-icon')({ 'size': `var(--_medium-icon-size)` })()};}
        .container.large :is(::slotted([slot="icon"]), .icon) {${overrideTokens<typeof IconDefinition>('--mdc-icon')({ 'size': `var(--_large-icon-size)` })()};}
        .container.extra-large :is(::slotted([slot="icon"]), .icon) {${overrideTokens<typeof IconDefinition>('--mdc-icon')({ 'size': `var(--_extra-large-icon-size)` })()};}
    `
}

const rippleBridge = (variant: string) => overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'hovered-color': `var(--_hovered-${variant}-state-layer-color)`,
    'focused-color': `var(--_focused-${variant}-state-layer-color)`,
    'pressed-color': `var(--_pressed-${variant}-state-layer-color)`,
    'hovered-opacity': `var(--_hovered-state-layer-opacity)`,
    'focused-opacity': `var(--_focused-state-layer-opacity)`,
    'pressed-opacity': `var(--_pressed-state-layer-opacity)`
})()

const toggleRippleBridge = (variant: string, toggle: string) => overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'hovered-color': `var(--_hovered-${variant}-${toggle}-state-layer-color)`,
    'focused-color': `var(--_focused-${variant}-${toggle}-state-layer-color)`,
    'pressed-color': `var(--_pressed-${variant}-${toggle}-state-layer-color)`
})()

const buttonPart = createStyleSheet(tables)(ButtonDefinition)(() => css`
    :host {
        display: inline-flex;
        outline: none;
        vertical-align: top;
        cursor: pointer;
        contain: layout;
        -webkit-tap-highlight-color: transparent;
    }

    .container {
        all: unset;
        position: absolute;
        inset: 0;
        box-sizing: border-box;
        cursor: pointer;
        display: flex;
        outline: none;
        place-content: center;
        place-items: center;
        position: relative;
        z-index: 0;
        text-overflow: ellipsis;
        text-wrap: nowrap;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        vertical-align: top;
        transition-property: border-radius;
        transition-duration: 350ms;
        transition-timing-function: cubic-bezier(0.42, 1.67, 0.21, 0.9);
    }

    :host([disabled]),
    .container.disabled {
        cursor: default;
        pointer-events: none;
    }

    .container.extra-small {
        height: var(--_extra-small-container-height);
        min-width: calc(64px - var(--_extra-small-container-padding-inline-start) - var(--_extra-small-container-padding-inline-end));
    }
    .container.small {
        height: var(--_small-container-height);
        min-width: calc(64px - var(--_small-container-padding-inline-start) - var(--_small-container-padding-inline-end));
    }
    .container.medium {
        height: var(--_medium-container-height);
        min-width: calc(64px - var(--_medium-container-padding-inline-start) - var(--_medium-container-padding-inline-end));
    }
    .container.large {
        height: var(--_large-container-height);
        min-width: calc(64px - var(--_large-container-padding-inline-start) - var(--_large-container-padding-inline-end));
    }
    .container.extra-large {
        height: var(--_extra-large-container-height);
        min-width: calc(64px - var(--_extra-large-container-padding-inline-start) - var(--_extra-large-container-padding-inline-end));
    }

    .container.extra-small {
        padding: var(--_extra-small-container-padding);
        gap: var(--_extra-small-icon-label-space);
    }
    .container.small {
        padding: var(--_small-container-padding);
        gap: var(--_small-icon-label-space);
    }
    .container.medium {
        padding: var(--_medium-container-padding);
        gap: var(--_medium-icon-label-space);
    }
    .container.large {
        padding: var(--_large-container-padding);
        gap: var(--_large-icon-label-space);
    }
    .container.extra-large {
        padding: var(--_extra-large-container-padding);
        gap: var(--_extra-large-icon-label-space);
    }

    .container:not(.has-label) .label {
        display: none;
    }

    .label {
        width: auto;
        display: inline-flex;
        box-sizing: border-box;
        will-change: width, opacity;
        overflow: hidden;
    }

    .container.extra-small .label {
        typescale: var(--_extra-small-label);
    }
    .container.small .label {
        typescale: var(--_small-label);
    }
    .container.medium .label {
        typescale: var(--_medium-label);
    }
    .container.large .label {
        typescale: var(--_large-label);
    }
    .container.extra-large .label {
        typescale: var(--_extra-large-label);
    }

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

    @state(.container) .container .background {
        background-color: var(--_container-color);
        opacity: var(--_container-opacity);
    }

    .container .background {
        border-radius: inherit;
        inset: 0;
        position: absolute;
        z-index: -1;
    }

    @state(.container) .container .label {
        color: var(--_label-color);
        opacity: var(--_label-opacity);
    }

    .container :is(::slotted([slot="icon"]), .icon) {
        display: inline-flex;
        position: relative;
        writing-mode: horizontal-tb;
        fill: currentColor;
        flex-shrink: 0;
    }

    .container:not(.has-icon) .icon {
        display: none;
    }

    @state(.container) .container :is(::slotted([slot="icon"]), .icon) {
        color: var(--_icon-color);
        opacity: var(--_icon-opacity);
    }

    .container.extra-small :is(::slotted([slot="icon"]), .icon) {
        font-size: var(--_extra-small-icon-size);
        inline-size: var(--_extra-small-icon-size);
        block-size: var(--_extra-small-icon-size);
    }
    .container.small :is(::slotted([slot="icon"]), .icon) {
        font-size: var(--_small-icon-size);
        inline-size: var(--_small-icon-size);
        block-size: var(--_small-icon-size);
    }
    .container.medium :is(::slotted([slot="icon"]), .icon) {
        font-size: var(--_medium-icon-size);
        inline-size: var(--_medium-icon-size);
        block-size: var(--_medium-icon-size);
    }
    .container.large :is(::slotted([slot="icon"]), .icon) {
        font-size: var(--_large-icon-size);
        inline-size: var(--_large-icon-size);
        block-size: var(--_large-icon-size);
    }
    .container.extra-large :is(::slotted([slot="icon"]), .icon) {
        font-size: var(--_extra-large-icon-size);
        inline-size: var(--_extra-large-icon-size);
        block-size: var(--_extra-large-icon-size);
    }

    .container.extra-small .outline {
        border-width: var(--_extra-small-outline-width);
    }
    .container.small .outline {
        border-width: var(--_small-outline-width);
    }
    .container.medium .outline {
        border-width: var(--_medium-outline-width);
    }
    .container.large .outline {
        border-width: var(--_large-outline-width);
    }
    .container.extra-large .outline {
        border-width: var(--_extra-large-outline-width);
    }

    .outline {
        inset: 0;
        border-style: solid;
        position: absolute;
        box-sizing: border-box;
        border-start-start-radius: inherit;
        border-start-end-radius: inherit;
        border-end-start-radius: inherit;
        border-end-end-radius: inherit;
        z-index: -1;
    }

    @state(.container) .container .outline {
        border-color: var(--_outline-color);
    }

    @state(.container) .container mdc-elevation {
        transition-duration: 0ms;
        ${elevationBridge}
    }

    .container.filled mdc-ripple {${rippleBridge('filled')};}
    .container.filled-tonal mdc-ripple {${rippleBridge('filled-tonal')};}
    .container.elevated mdc-ripple {${rippleBridge('elevated')};}
    .container.outlined mdc-ripple {${rippleBridge('outlined')};}
    .container.text mdc-ripple {${rippleBridge('text')};}

    :is(.container .label, .label *) {
        text-overflow: inherit;
    }

    .touch-target {
        position: absolute;
        top: 50%;
        left: 50%;
        height: 100%;
        transform: translate(-50%, -50%);
        z-index: 1;
    }

    [touch-target='wrapper'] {
        margin: max(0px, (48px - var(--_container-height)) / 2) 0;
    }

    [touch-target='none'] .touch-target {
        display: none;
    }
`)

const togglePart = createStyleSheet(tables)(ToggleButtonDefinition)(() => css`
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

const a11y = createStyleSheet(tables)(ButtonDefinition)(() => css`
    @forced-colors {
        .background {
            border: 1px solid CanvasText;
        }

        :host([disabled]) {
            --_disabled-filled-icon-color: GrayText;
            --_disabled-filled-tonal-icon-color: GrayText;
            --_disabled-elevated-icon-color: GrayText;
            --_disabled-outlined-icon-color: GrayText;
            --_disabled-text-icon-color: GrayText;
            --_disabled-icon-opacity: 1;
            --_disabled-container-opacity: 1;
            --_disabled-filled-label-color: GrayText;
            --_disabled-filled-tonal-label-color: GrayText;
            --_disabled-elevated-label-color: GrayText;
            --_disabled-outlined-label-color: GrayText;
            --_disabled-text-label-color: GrayText;
            --_disabled-label-opacity: 1;
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
        }

        .container.disabled .background {
            border-color: GrayText;
        }
        .container.disabled .outline {
            opacity: 1;
        }
    }

    @reduced-motion {
        .container {
            transition: none;
        }
        .container mdc-elevation {
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

export const buttonStyles = [
    css`:host {${buttonTokens}${toggleButtonTokens};}`,
    getContainerShapeStyles(),
    getFocusRingStyles(),
    getIconSizeStyle(),
    buttonPart,
    togglePart,
    a11y
]

/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { ElevatedButtonDefinition, FilledButtonDefinition, FilledTonalButtonDefinition, OutlinedButtonDefinition, TextButtonDefinition } from '../../component-definitions/button.definition'
import type { ElevationDefinition } from '../../component-definitions/elevation.definition'
import type { FocusRingDefinition } from '../../component-definitions/focus-ring.definition'
import type { IconDefinition } from '../../component-definitions/icon.definition'
import type { RippleDefinition } from '../../component-definitions/ripple.definition'
import { createWrappedTokens, overrideComponentTokens, stringTokens } from '../../utils/tokens'

const elevatedTokens = createWrappedTokens('--mdc-elevated-button', ElevatedButtonDefinition)
const elevatedTokenString = unsafeCSS(stringTokens(elevatedTokens))

const filledTokens = createWrappedTokens('--mdc-filled-button', FilledButtonDefinition)
const filledTokenString = unsafeCSS(stringTokens(filledTokens))

const filledTonalTokens = createWrappedTokens('--mdc-filled-tonal-button', FilledTonalButtonDefinition)
const filledTonalTokenString = unsafeCSS(stringTokens(filledTonalTokens))

const outlinedTokens = createWrappedTokens('--mdc-outlined-button', OutlinedButtonDefinition)
const outlinedTokenString = unsafeCSS(stringTokens(outlinedTokens))

const textTokens = createWrappedTokens('--mdc-text-button', TextButtonDefinition)
const textTokenString = unsafeCSS(stringTokens(textTokens))

type TState = 'container-shape-round' | 'container-shape-square' | 'container-shape-round-toggle-selected' | 'container-shape-square-toggle-selected' | 'container-shape-pressed-morph'
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
        .container.round  {${getSizedShape('container-shape-round')};}
        .container.square {${getSizedShape('container-shape-square')};}
        .container.round.togglable.selected {${getSizedShape('container-shape-round-toggle-selected')};}
        .container.square.togglable.selected {${getSizedShape('container-shape-square-toggle-selected')};}
        .container:not(.disable-morph, .togglable):is(.round, .square):active,
        .container:not(.disable-morph).togglable:is(.selected, .unselected):has(.toggle-input:active) {${getSizedShape('container-shape-pressed-morph')};}
    `
}
const getFocusRingStyles = () => {
    const getShape = (
        size: TSize,
        mode: TState
    ) => stringTokens(overrideComponentTokens<keyof typeof FocusRingDefinition>('--mdc-focus-ring', {
        'shape-start-start': `min(var(--_${size}-${mode}-start-start), calc(var(--_${size}-container-height) / 2))`,
        'shape-start-end': `min(var(--_${size}-${mode}-start-end), calc(var(--_${size}-container-height) / 2))`,
        'shape-end-end': `min(var(--_${size}-${mode}-end-end), calc(var(--_${size}-container-height) / 2))`,
        'shape-end-start': `min(var(--_${size}-${mode}-end-start), calc(var(--_${size}-container-height) / 2))`,
    }))
    const getSizedShape = (mode: TState) => unsafeCSS(`
        &.extra-small mdc-focus-ring {${getShape('extra-small', mode)};}
        &.small mdc-focus-ring {${getShape('small', mode)};}
        &.medium mdc-focus-ring {${getShape('medium', mode)};}
        &.large mdc-focus-ring {${getShape('large', mode)};}
        &.extra-large mdc-focus-ring {${getShape('extra-large', mode)};}
    `)
    return css`
        .container.round {${getSizedShape('container-shape-round')};}
        .container.square {${getSizedShape('container-shape-square')};}
        .container.togglable.selected.round {${getSizedShape('container-shape-round-toggle-selected')};}
        .container.togglable.selected.square {${getSizedShape('container-shape-square-toggle-selected')};}
        .container:not(.disable-morph, .togglable):is(.round, .square):active,
        .container:not(.disable-morph).togglable:is(.selected, .unselected):has(.toggle-input:active) {${getSizedShape('container-shape-pressed-morph')};}
    `
}
const getIconSizeStyle = () => {
    return css`
        .container.extra-small :is(::slotted([slot="icon"]), .icon) {${stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: `var(--_extra-small-icon-size)` }))};}
        .container.small :is(::slotted([slot="icon"]), .icon) {${stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: `var(--_small-icon-size)` }))};}
        .container.medium :is(::slotted([slot="icon"]), .icon) {${stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: `var(--_medium-icon-size)` }))};}
        .container.large :is(::slotted([slot="icon"]), .icon) {${stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: `var(--_large-icon-size)` }))};}
        .container.extra-large :is(::slotted([slot="icon"]), .icon) {${stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: `var(--_extra-large-icon-size)` }))};}
    `
}

const ripple = css`
    .container mdc-ripple {${stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', { 'hovered-color': `var(--_hovered-state-layer-color)`, 'focused-color': `var(--_focused-state-layer-color)`,'pressed-color': `var(--_pressed-state-layer-color)`, 'hovered-opacity': `var(--_hovered-state-layer-opacity)`, 'focused-opacity': `var(--_focused-state-layer-opacity)`, 'pressed-opacity': `var(--_pressed-state-layer-opacity)`, }))};}
    .container.togglable.selected mdc-ripple {${stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', { 'hovered-color': `var(--_hovered-state-layer-color-toggle-selected)`, 'focused-color': `var(--_focused-state-layer-color-toggle-selected)`, 'pressed-color': `var(--_pressed-state-layer-color-toggle-selected)` }))};}
    .container.togglable.unselected mdc-ripple {${stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', { 'hovered-color': `var(--_hovered-state-layer-color-toggle-unselected)`, 'focused-color': `var(--_focused-state-layer-color-toggle-unselected)`, 'pressed-color': `var(--_pressed-state-layer-color-toggle-unselected)` }))};}
`
const elevation = css`
    .container mdc-elevation {transition-duration: 0ms;${stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', { level: `var(--_container-elevation)`, 'shadow-color': `var(--_container-shadow-color)` }))};}
    .container.disabled mdc-elevation {transition: none;${stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', { level: `var(--_disabled-container-elevation)` }))};}
    .container:focus-within mdc-elevation {${stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', { level: `var(--_focused-container-elevation)` }))};}
    .container:active mdc-elevation {${stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', { level: `var(--_pressed-container-elevation)` }))};}
`
const shared = css`
    :host {
        display: inline-flex;
        outline: none;
        vertical-align: top;
        cursor: pointer;
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

    /* Root Width & Height */

    .container {
        &.extra-small {
            height: var(--_extra-small-container-height);
            min-width: calc(64px - var(--_extra-small-leading-space) - var(--_extra-small-trailing-space));
        }
        &.small {
            height: var(--_small-container-height);
            min-width: calc(64px - var(--_small-leading-space) - var(--_small-trailing-space));
        }
        &.medium {
            height: var(--_medium-container-height);
            min-width: calc(64px - var(--_medium-leading-space) - var(--_medium-trailing-space));
        }
        &.large {
            height: var(--_large-container-height);
            min-width: calc(64px - var(--_large-leading-space) - var(--_large-trailing-space));
        }
        &.extra-large {
            height: var(--_extra-large-container-height);
            min-width: calc(64px - var(--_extra-large-leading-space) - var(--_extra-large-trailing-space));
        }
    }

    /* Button Size */

    .container.extra-small {
        padding-inline-start: var(--_extra-small-leading-space);
        padding-inline-end: var(--_extra-small-trailing-space);
        gap: var(--_extra-small-between-icon-label-space);
    }
    .container.small{
        padding-inline-start: var(--_small-leading-space);
        padding-inline-end: var(--_small-trailing-space);
        gap: var(--_small-between-icon-label-space);
    }
    .container.medium{
        padding-inline-start: var(--_medium-leading-space);
        padding-inline-end: var(--_medium-trailing-space);
        gap: var(--_medium-between-icon-label-space);
    }
    .container.large{
        padding-inline-start: var(--_large-leading-space);
        padding-inline-end: var(--_large-trailing-space);
        gap: var(--_large-between-icon-label-space);
    }
    .container.extra-large{
        padding-inline-start: var(--_extra-large-leading-space);
        padding-inline-end: var(--_extra-large-trailing-space);
        gap: var(--_extra-large-between-icon-label-space);
    }

    .container:not(.has-label) .label {
        display: none;
    }

    /* Label Size */

    .container.extra-small .label {
        font-family: var(--_extra-small-label-font);
        font-weight: var(--_extra-small-label-weight);
        line-height: var(--_extra-small-label-line-height);
        letter-spacing: var(--_extra-small-label-tracking);
        font-size: var(--_extra-small-label-size);
    }
    .container.small .label {
        font-family: var(--_small-label-font);
        font-weight: var(--_small-label-weight);
        line-height: var(--_small-label-line-height);
        letter-spacing: var(--_small-label-tracking);
        font-size: var(--_small-label-size);
    }
    .container.medium .label {
        font-family: var(--_medium-label-font);
        font-weight: var(--_medium-label-weight);
        line-height: var(--_medium-label-line-height);
        letter-spacing: var(--_medium-label-tracking);
        font-size: var(--_medium-label-size);
    }
    .container.large .label {
        font-family: var(--_large-label-font);
        font-weight: var(--_large-label-weight);
        line-height: var(--_large-label-line-height);
        letter-spacing: var(--_large-label-tracking);
        font-size: var(--_large-label-size);
    }
    .container.extra-large .label {
        font-family: var(--_extra-large-label-font);
        font-weight: var(--_extra-large-label-weight);
        line-height: var(--_extra-large-label-line-height);
        letter-spacing: var(--_extra-large-label-tracking);
        font-size: var(--_extra-large-label-size);
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

    /* Label Color */

    .container .label {
        overflow: hidden;
        color: var(--_label-color);
    }
    .container.disabled .label,
    .container.disabled.togglable:is(.selected, .unselected) .label {
        color: var(--_disabled-label-color);
        opacity: var(--_disabled-label-opacity);
    }
    .container:hover .label {
        color: var(--_hovered-label-color);
    }
    .container:focus-within .label {
        color: var(--_focused-label-color);
    }
    .container:active .label {
        color: var(--_pressed-label-color);
    }

    .container.togglable.selected .label {
        color: var(--_label-color-toggle-selected);
    }
    .container.togglable.selected:hover .label {
        color: var(--_hovered-label-color-toggle-selected);
    }

    .container.togglable.selected:focus-within .label {
        color: var(--_focused-label-color-toggle-selected);
    }

    .container.togglable.selected:active .label {
        color: var(--_pressed-label-color-toggle-selected);
    }

    .container.togglable.unselected .label {
        color: var(--_label-color-toggle-unselected);
    }
    .container.togglable.unselected:hover .label {
        color: var(--_hovered-label-color-toggle-unselected);
    }

    .container.togglable.unselected:focus-within .label {
        color: var(--_focused-label-color-toggle-unselected);
    }

    .container.togglable.unselected:active .label {
        color: var(--_pressed-label-color-toggle-unselected);
    }

    .container .background {
        border-radius: inherit;
        inset: 0;
        position: absolute;
        z-index: -1;
    }
    .container:not(.disabled) .background {
        background-color: var(--_container-color);
    }
    .container.togglable.selected:not(.disabled) .background {
        background-color: var(--_container-color-toggle-selected);
    }
    .container.togglable.unselected:not(.disabled) .background {
        background-color: var(--_container-color-toggle-unselected);
    }
    .container.disabled .background {
        background-color: var(--_disabled-container-color);
        opacity: var(--_disabled-container-opacity);
    }

    :is(.container .label, .label *) {
        text-overflow: inherit;
    }

    @media (forced-colors: active) {
        .background {
            border: 1px solid CanvasText;
        }

        :host:is([disabled], .disabled) {
            --_disabled-icon-color: GrayText;
            --_disabled-icon-opacity: 1;
            --_disabled-container-opacity: 1;
            --_disabled-label-color: GrayText;
            --_disabled-label-opacity: 1;
        }
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

`
const icon = css`
    .container :is(::slotted([slot="icon"]), .icon) {
        display: inline-flex;
        position: relative;
        writing-mode: horizontal-tb;
        fill: currentColor;
        flex-shrink: 0;
        color: var(--_icon-color);
    }

    .container:not(.has-icon) .icon {
        display: none;
    }

    .container:not(.disabled):hover :is(::slotted([slot="icon"]), .icon) {
        color: var(--_hovered-icon-color);
    }
    .container:not(.disabled):focus-within :is(::slotted([slot="icon"]), .icon) {
        color: var(--_focused-icon-color);
    }
    .container:not(.disabled):active :is(::slotted([slot="icon"]), .icon) {
        color: var(--_pressed-icon-color);
    }
    /* Selected */
    .container:not(.disabled).togglable.selected :is(::slotted([slot="icon"]), .icon) {
        color: var(--_icon-color-toggle-selected);
    }
    .container:not(.disabled).togglable.selected:hover :is(::slotted([slot="icon"]), .icon) {
        color: var(--_hovered-icon-color-toggle-selected);
    }
    .container:not(.disabled).togglable.selected:focus-within :is(::slotted([slot="icon"]), .icon) {
        color: var(--_focused-icon-color-toggle-selected);
    }
    .container:not(.disabled).togglable.selected:active :is(::slotted([slot="icon"]), .icon) {
        color: var(--_pressed-icon-color-toggle-selected);
    }
    /* Unselected */
    .container:not(.disabled).togglable.unselected :is(::slotted([slot="icon"]), .icon) {
        color: var(--_icon-color-toggle-unselected);
    }
    .container:not(.disabled).togglable.unselected:hover :is(::slotted([slot="icon"]), .icon) {
        color: var(--_hovered-icon-color-toggle-unselected);
    }
    .container:not(.disabled).togglable.unselected:focus-within :is(::slotted([slot="icon"]), .icon) {
        color: var(--_focused-icon-color-toggle-unselected);
    }
    .container:not(.disabled).togglable.unselected:active :is(::slotted([slot="icon"]), .icon) {
        color: var(--_pressed-icon-color-toggle-unselected);
    }
    /* Icon Size */
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
    /* Disabled */
    .container.disabled :is(::slotted([slot="icon"]), .icon) {
        color: var(--_disabled-icon-color);
        opacity: var(--_disabled-icon-opacity);
    }
`
const outline = css`
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
        border-color: var(--_outline-color);
        border-start-start-radius: inherit;
        border-start-end-radius: inherit;
        border-end-start-radius: inherit;
        border-end-end-radius: inherit;
        z-index: -1;
    }

    .container.togglable.selected .outline {
        border-color: var(--_outline-color-toggle-selected);
    }
    .container.togglable.unselected .outline {
        border-color: var(--_outline-color-toggle-unselected);
    }
    .container.disabled .outline {
        border-color: var(--_disabled-outline-color);
        opacity: var(--_disabled-outline-opacity);
    }
    .container.disabled.togglable.selected .outline {
        border-color: var(--_disabled-outline-color-toggle-selected);
    }
    .container.disabled.togglable.unselected .outline {
        border-color: var(--_disabled-outline-color-toggle-unselected);
    }

    .container:hover .outline {
        border-color: var(--_hovered-outline-color);
    }
    .container.togglable.selected:hover .outline {
        border-color: var(--_hovered-outline-color-toggle-selected);
    }
    .container.togglable.unselected:hover .outline {
        border-color: var(--_hovered-outline-color-toggle-unselected);
    }

    .container:focus-within .outline {
        border-color: var(--_focused-outline-color);
    }
    .container.togglable.selected:focus-within .outline {
        border-color: var(--_focused-outline-color-toggle-selected);
    }
    .container.togglable.unselected:focus-within .outline {
        border-color: var(--_focused-outline-color-toggle-unselected);
    }

    .container:active .outline {
        border-color: var(--_pressed-outline-color);
    }
    .container.togglable.selected:active .outline {
        border-color: var(--_pressed-outline-color-toggle-selected);
    }
    .container.togglable.unselected:active .outline {
        border-color: var(--_pressed-outline-color-toggle-unselected);
    }

    @media (forced-colors: active) {
        .container.disabled .background {
            border-color: GrayText;
        }
        .container.disabled .outline {
            opacity: 1;
        }
    }
`

const colorVariants = css`
    :host([variant="elevated"]) {${elevatedTokenString};}
    :host([variant="filled"]) {${filledTokenString};}
    :host([variant="filled-tonal"]) {${filledTonalTokenString};}
    :host([variant="outlined"]) {${outlinedTokenString};}
    :host([variant="text"]) {${textTokenString};}
`

export const buttonStyles = [
    getContainerShapeStyles(),
    getFocusRingStyles(),
    getIconSizeStyle(),
    ripple,
    elevation,
    shared,
    icon,
    outline,
    colorVariants,
]

/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { FilledIconButtonDefinition, FilledTonalIconButtonDefinition, OutlinedIconButtonDefinition, StandardIconButtonDefinition } from '../../component-definitions/icon-button.definition'
import type { IconDefinition } from '../../component-definitions/icon.definition'
import type { RippleDefinition } from '../../component-definitions/ripple.definition'
import type { FocusRingDefinition } from '../../definitions'
import { createWrappedTokens, overrideComponentTokens, stringTokens } from '../../utils/tokens'

const filledIconButtonTokens = createWrappedTokens('--mdc-icon-button', FilledIconButtonDefinition)
const filledTonalIconButtonTokens = createWrappedTokens('--mdc-icon-button', FilledTonalIconButtonDefinition)
const outlinedIconButtonTokens = createWrappedTokens('--mdc-icon-button', OutlinedIconButtonDefinition)
const standardIconButtonTokens = createWrappedTokens('--mdc-icon-button', StandardIconButtonDefinition)

const filledString = stringTokens(filledIconButtonTokens)
const filledTonalString = stringTokens(filledTonalIconButtonTokens)
const outlinedString = stringTokens(outlinedIconButtonTokens)
const standardString = stringTokens(standardIconButtonTokens)

type TShapeState = 'container-shape-round' | 'container-shape-square' | 'selected-container-shape-round' | 'selected-container-shape-square' | 'shape-pressed-morph'
type TSize = 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'

const getContainerShapes = () => {
    const shape = (s: TSize, ss: TShapeState) => unsafeCSS(`
        border-end-start-radius: min(var(--_${s}-${ss}-end-start), calc(var(--_${s}-container-height) / 2));
        border-end-end-radius: min(var(--_${s}-${ss}-end-end), calc(var(--_${s}-container-height) / 2));
        border-start-end-radius: min(var(--_${s}-${ss}-start-end), calc(var(--_${s}-container-height) / 2));
        border-start-start-radius: min(var(--_${s}-${ss}-start-start), calc(var(--_${s}-container-height) / 2));
    `)
    const sizedShape = (ss: TShapeState) => css`
        &.extra-small {${shape('extra-small', ss)};}
        &.small {${shape('small', ss)};}
        &.medium {${shape('medium', ss)};}
        &.large {${shape('large', ss)};}
        &.extra-large {${shape('extra-large', ss)};}
    `
    return css`
        .container.round {${sizedShape('container-shape-round')};}
        .container.square {${sizedShape('container-shape-square')};}
        .container.togglable.selected {
            &.round {${sizedShape('selected-container-shape-round')};}
            &.square {${sizedShape('selected-container-shape-square')};}
        }
        .container:not(.disable-morph, .togglable):is(.round, .square):active {${sizedShape('shape-pressed-morph')};}
        .container:not(.disable-morph).togglable:has(input:active) {${sizedShape('shape-pressed-morph')};}
    `
}
const getRippleStyle = () => {
    const getStyles = (togglable: boolean, selected: boolean) => unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', {
        "hovered-color": togglable ? `var(--_hovered-state-layer-color-toggle-${selected ? 'selected' : 'unselected'})` : `var(--_hovered-state-layer-color)`,
        "focused-color": togglable ? `var(--_focused-state-layer-color-toggle-${selected ? 'selected' : 'unselected'})` : `var(--_focused-state-layer-color)`,
        "pressed-color": togglable ? `var(--_pressed-state-layer-color-toggle-${selected ? 'selected' : 'unselected'})` : `var(--_pressed-state-layer-color)`,
        "hovered-opacity": `var(--_hovered-state-layer-opacity)`,
        "focused-opacity": `var(--_focused-state-layer-opacity)`,
        "pressed-opacity": `var(--_pressed-state-layer-opacity)`,
    })))
    return css`
        mdc-ripple { ${getStyles(false, false)}; }
        .togglable.selected mdc-ripple { ${getStyles(true, true)}; }
        .togglable.unselected mdc-ripple { ${getStyles(true, false)}; }
    `
}
const getFocusRingStyles = () => {
    const getShape = (
        size: TSize,
        mode: TShapeState
    ) => stringTokens(overrideComponentTokens<keyof typeof FocusRingDefinition>('--mdc-focus-ring', {
        'shape-start-start': `min(var(--_${size}-${mode}-start-start), calc(var(--_${size}-container-height) / 2))`,
        'shape-start-end': `min(var(--_${size}-${mode}-start-end), calc(var(--_${size}-container-height) / 2))`,
        'shape-end-end': `min(var(--_${size}-${mode}-end-end), calc(var(--_${size}-container-height) / 2))`,
        'shape-end-start': `min(var(--_${size}-${mode}-end-start), calc(var(--_${size}-container-height) / 2))`,
    }))
    const getSizedShape = (mode: TShapeState) => unsafeCSS(`
        &.extra-small mdc-focus-ring {${getShape('extra-small', mode)};}
        &.small mdc-focus-ring {${getShape('small', mode)};}
        &.medium mdc-focus-ring {${getShape('medium', mode)};}
        &.large mdc-focus-ring {${getShape('large', mode)};}
        &.extra-large mdc-focus-ring {${getShape('extra-large', mode)};}
    `)
    return css`
        .container.round {${getSizedShape('container-shape-round')};}
        .container.square {${getSizedShape('container-shape-square')};}
        .container.togglable.selected.round {${getSizedShape('selected-container-shape-round')};}
        .container.togglable.selected.square {${getSizedShape('selected-container-shape-square')};}
        .container:not(.disable-morph, .togglable):is(.round, .square):active,
        .container:not(.disable-morph).togglable:has(input:active) {${getSizedShape('shape-pressed-morph')};}
    `
}
const containerSize = css`
    .container {
        &.extra-small {
            height: var(--_extra-small-container-height);
        }
        &.small {
            height: var(--_small-container-height);
        }
        &.medium {
            height: var(--_medium-container-height);
        }
        &.large {
            height: var(--_large-container-height);
        }
        &.extra-large {
            height: var(--_extra-large-container-height);
        }
    }
    .container.narrow {
        &.extra-small {
            padding-inline-start: var(--_extra-small-narrow-leading-space);
            padding-inline-end: var(--_extra-small-narrow-trailing-space);
        }
        &.small {
            padding-inline-start: var(--_small-narrow-leading-space);
            padding-inline-end: var(--_small-narrow-trailing-space);
        }
        &.medium {
            padding-inline-start: var(--_medium-narrow-leading-space);
            padding-inline-end: var(--_medium-narrow-trailing-space);
        }
        &.large {
            padding-inline-start: var(--_large-narrow-leading-space);
            padding-inline-end: var(--_large-narrow-trailing-space);
        }
        &.extra-large {
            padding-inline-start: var(--_extra-large-narrow-leading-space);
            padding-inline-end: var(--_extra-large-narrow-trailing-space);
        }
    }
    .container.default {
        &.extra-small {
            padding-inline-start: var(--_extra-small-default-leading-space);
            padding-inline-end: var(--_extra-small-default-trailing-space);
        }
        &.small {
            padding-inline-start: var(--_small-default-leading-space);
            padding-inline-end: var(--_small-default-trailing-space);
        }
        &.medium {
            padding-inline-start: var(--_medium-default-leading-space);
            padding-inline-end: var(--_medium-default-trailing-space);
        }
        &.large {
            padding-inline-start: var(--_large-default-leading-space);
            padding-inline-end: var(--_large-default-trailing-space);
        }
        &.extra-large {
            padding-inline-start: var(--_extra-large-default-leading-space);
            padding-inline-end: var(--_extra-large-default-trailing-space);
        }
    }
    .container.wide {
        &.extra-small {
            padding-inline-start: var(--_extra-small-wide-leading-space);
            padding-inline-end: var(--_extra-small-wide-trailing-space);
        }
        &.small {
            padding-inline-start: var(--_small-wide-leading-space);
            padding-inline-end: var(--_small-wide-trailing-space);
        }
        &.medium {
            padding-inline-start: var(--_medium-wide-leading-space);
            padding-inline-end: var(--_medium-wide-trailing-space);
        }
        &.large {
            padding-inline-start: var(--_large-wide-leading-space);
            padding-inline-end: var(--_large-wide-trailing-space);
        }
        &.extra-large {
            padding-inline-start: var(--_extra-large-wide-leading-space);
            padding-inline-end: var(--_extra-large-wide-trailing-space);
        }
    }
`
const containerColor = css`
    .container:is(.filled, .filled-tonal):not(.disabled) .background {
        background: var(--_container-color);
    }
    .container:is(.filled, .filled-tonal):not(.disabled).togglable.unselected .background {
        background: var(--_container-color-toggle-unselected);
    }
    .container:is(.filled, .filled-tonal):not(.disabled).togglable.selected .background {
        background: var(--_container-color-toggle-selected);
    }
    .container:is(.filled, .filled-tonal).disabled .background {
        background: var(--_disabled-container-color);
        opacity: var(--_disabled-container-opacity);
    }
 
    .container.outlined:not(.disabled) .background {
        background: var(--_container-color);
    }
    .container.outlined.togglable.unselected .background {
        background: var(--_container-color-toggle-unselected);
    }
    .container.outlined.togglable.selected .background {
        background: var(--_container-color-toggle-selected);
    }
    .container.outlined:not(.togglable).disabled .background {
        background: var(--_disabled-container-color);
    }
    .container.outlined.togglable.disabled {
        &.unselected .background {
            background: var(--_disabled-container-color-toggle-unselected);
        }
        &.selected .background {
            background: var(--_disabled-container-color-toggle-selected);
        }
    }
`
const outlineStyle = css`
    .outline {
        all: unset;
        border-radius: inherit;
        position: absolute;
        inset: 0;
        height: 100%;
        width: 100%;
        z-index: -1;
        box-sizing: border-box;
        border-style: solid;
        background: transparent;
    }
    .container:not(.outlined) .outline {
        display: none;
    }

    .container.outlined.extra-small .outline {
        border-width: var(--_extra-small-outline-width);
    }
    .container.outlined.small .outline {
        border-width: var(--_small-outline-width);
    }
    .container.outlined.medium .outline {
        border-width: var(--_medium-outline-width);
    }
    .container.outlined.large .outline {
        border-width: var(--_large-outline-width);
    }
    .container.outlined.extra-large .outline {
        border-width: var(--_extra-large-outline-width);
    }

    .container.outlined:not(.disabled) .outline {
        border-color: var(--_outline-color);
    }
    .container.outlined:not(.disabled).togglable.unselected .outline {
        border-color: var(--_outline-color-toggle-unselected);
    }
    .container.outlined:not(.disabled).togglable.selected .outline {
        border-color: var(--_outline-color-toggle-selected);
    }

    .container.outlined.disabled .outline {
        outline-color: var(--_disabled-outline-color);
    }
    .container.outlined.disabled.togglable.unselected .outline {
        outline-color: var(--_disabled-outline-color-toggle-unselected);
    }
    .container.outlined.disabled.togglable.selected .outline {
        outline-color: var(--_disabled-outline-color-toggle-selected);
    }
`

const buttonSharedStyle = css`
    :host {
        display: inline-flex;
        vertical-align: top;
        border: none;
        outline: none;
        justify-content: center;
        user-select: none;
    }

    :host([disabled]),
    :host([disabled]) button,
    :host([disabled]) input,
    .container.disabled,
    .container.disabled button,
    .container.disabled input {
        cursor: default;
        pointer-events: none;
    }

    ::slotted(*) {
        font-weight: inherit;
        fill: currentColor;
        user-select: none;
    }

    input {
        all: unset;
        position: absolute;
        inset: 0px;
        border: none;
        outline: none;
        padding: 0;
        margin: 0;
        z-index: 1;
        user-select: none;
    }

    .container {
        padding: 0;
        margin: 0;
        cursor: pointer;
        position: relative;
        display: grid;
        place-content: center;
        flex-grow: 0;
        flex-shrink: 0;
        border: none;
        text-decoration: none;
        user-select: none;
        outline: none;
        appearance: none;
        background: transparent;
        user-select: none;
    }

    .background {
        user-select: none;
        border-radius: inherit;
        height: 100%;
        width: 100%;
        z-index: -1;
        position: absolute;
        inset: 0px;
    }

    .container,
    mdc-focus-ring {
        transition-property: border-radius;
        transition-duration: 350ms;
        transition-timing-function: cubic-bezier(0.42, 1.67, 0.21, 0.9);
    }
`

const iconColorStyle = css`
    .container:not(.disabled) {
        color: var(--_icon-color);
    }
    .container:not(.disabled).togglable.unselected {
        color: var(--_icon-color-toggle-unselected);
    }
    .container:not(.disabled).togglable.selected {
        color: var(--_icon-color-toggle-selected);
    }

    .container:not(.disabled):hover {
        color: var(--_hovered-icon-color);
    }
    .container:not(.disabled).togglable.unselected:hover {
        color: var(--_hovered-icon-color-toggle-unselected);
    }
    .container:not(.disabled).togglable.selected:hover {
        color: var(--_hovered-icon-color-toggle-selected);
    }

    .container:not(.disabled):focus-within {
        color: var(--_focused-icon-color);
    }
    .container:not(.disabled).togglable.unselected:focus-within {
        color: var(--_focused-icon-color-toggle-unselected);
    }
    .container:not(.disabled).togglable.selected:focus-within {
        color: var(--_focused-icon-color-toggle-selected);
    }

    .container:not(.disabled):active {
        color: var(--_pressed-icon-color);
    }
    .container:not(.disabled).togglable.unselected:active {
        color: var(--_pressed-icon-color-toggle-unselected);
    }
    .container:not(.disabled).togglable.selected:active {
        color: var(--_pressed-icon-color-toggle-selected);
    }

    .container.disabled {
        color: var(--_disabled-icon-color);
        opacity: var(--_disabled-icon-opacity);
    }
`

const iconSizeStyle = css`
    .container.extra-small ::slotted(*) {
        font-size: var(--_extra-small-icon-size);
        height: var(--_extra-small-icon-size);
        width: var(--_extra-small-icon-size);
    }
    .container.small ::slotted(*) {
        font-size: var(--_small-icon-size);
        height: var(--_small-icon-size);
        width: var(--_small-icon-size);
    }
    .container.medium ::slotted(*) {
        font-size: var(--_medium-icon-size);
        height: var(--_medium-icon-size);
        width: var(--_medium-icon-size);
    }
    .container.large ::slotted(*) {
        font-size: var(--_large-icon-size);
        height: var(--_large-icon-size);
        width: var(--_large-icon-size);
    }
    .container.extra-large ::slotted(*) {
        font-size: var(--_extra-large-icon-size);
        height: var(--_extra-large-icon-size);
        width: var(--_extra-large-icon-size);
    }

    .container.extra-small mdc-icon {${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: 'var(--_extra-small-icon-size)', })))};}
    .container.small mdc-icon {${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: 'var(: var(--_small-icon-size)', })))};}
    .container.medium mdc-icon {${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: 'var(: var(--_medium-icon-size)', })))};}
    .container.large mdc-icon {${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: 'var(: var(--_large-icon-size)', })))};}
    .container.extra-large mdc-icon {${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: 'var(--_extra-large-icon-size)', })))};}
`

const variant = css`
    :host:has(.container.filled) {${filledString};}
    :host:has(.container.filled-tonal) {${filledTonalString};}
    :host:has(.container.outlined) {${outlinedString};}
    :host:has(.container.standard) {${standardString};}
`

export const iconButtonStyles = [
    getContainerShapes(),
    getRippleStyle(),
    getFocusRingStyles(),
    containerSize,
    containerColor,
    outlineStyle,
    buttonSharedStyle,
    iconColorStyle,
    iconSizeStyle,
    variant,
]

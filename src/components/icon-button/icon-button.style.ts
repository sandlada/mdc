/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { FilledIconButtonDefinition, FilledTonalIconButtonDefinition, OutlinedIconButtonDefinition, StandardIconButtonDefinition } from '../../component-definitions/icon-button.definition'
import type { IconDefinition } from '../../component-definitions/icon.definition'
import type { RippleDefinition } from '../../component-definitions/ripple.definition'
import { createWrappedTokens, overrideComponentTokens, stringTokens } from '../../utils/tokens'

const filledIconButtonTokens = createWrappedTokens('--mdc-filled-icon-button', FilledIconButtonDefinition)
const filledTonalIconButtonTokens = createWrappedTokens('--mdc-filled-tonal-icon-button', FilledTonalIconButtonDefinition)
const outlinedIconButtonTokens = createWrappedTokens('--mdc-outlined-icon-button', OutlinedIconButtonDefinition)
const standardIconButtonTokens = createWrappedTokens('--mdc-standard-icon-button', StandardIconButtonDefinition)

const filledString = stringTokens(filledIconButtonTokens)
const filledTonalString = stringTokens(filledTonalIconButtonTokens)
const outlinedString = stringTokens(outlinedIconButtonTokens)
const standardString = stringTokens(standardIconButtonTokens)

const getShapes = (token: string) => {
    return unsafeCSS(`
        &.extra-small {
            border-end-start-radius: min(var(--_extra-small-${token}-end-start), calc(var(--_extra-small-container-height) / 2));
            border-end-end-radius: min(var(--_extra-small-${token}-end-end), calc(var(--_extra-small-container-height) / 2));
            border-start-end-radius: min(var(--_extra-small-${token}-start-end), calc(var(--_extra-small-container-height) / 2));
            border-start-start-radius: min(var(--_extra-small-${token}-start-start), calc(var(--_extra-small-container-height) / 2));
        }
        &.small {
            border-end-start-radius: min(var(--_small-${token}-end-start), calc(var(--_small-container-height) / 2));
            border-end-end-radius: min(var(--_small-${token}-end-end), calc(var(--_small-container-height) / 2));
            border-start-end-radius: min(var(--_small-${token}-start-end), calc(var(--_small-container-height) / 2));
            border-start-start-radius: min(var(--_small-${token}-start-start), calc(var(--_small-container-height) / 2));
        }
        &.medium {
            border-end-start-radius: min(var(--_medium-${token}-end-start), calc(var(--_medium-container-height) / 2));
            border-end-end-radius: min(var(--_medium-${token}-end-end), calc(var(--_medium-container-height) / 2));
            border-start-end-radius: min(var(--_medium-${token}-start-end), calc(var(--_medium-container-height) / 2));
            border-start-start-radius: min(var(--_medium-${token}-start-start), calc(var(--_medium-container-height) / 2));
        }
        &.large {
            border-end-start-radius: min(var(--_large-${token}-end-start), calc(var(--_large-container-height) / 2));
            border-end-end-radius: min(var(--_large-${token}-end-end), calc(var(--_large-container-height) / 2));
            border-start-end-radius: min(var(--_large-${token}-start-end), calc(var(--_large-container-height) / 2));
            border-start-start-radius: min(var(--_large-${token}-start-start), calc(var(--_large-container-height) / 2));
        }
        &.extra-large {
            border-end-start-radius: min(var(--_extra-large-${token}-end-start), calc(var(--_extra-large-container-height) / 2));
            border-end-end-radius: min(var(--_extra-large-${token}-end-end), calc(var(--_extra-large-container-height) / 2));
            border-start-end-radius: min(var(--_extra-large-${token}-start-end), calc(var(--_extra-large-container-height) / 2));
            border-start-start-radius: min(var(--_extra-large-${token}-start-start), calc(var(--_extra-large-container-height) / 2));
        }
    `)
}

const containerShapeStyle = css`
    @layer mdc.icon-button.base {
        .button.round {
            ${getShapes('container-shape-round')}
        }

        .button.square {
            ${getShapes('container-shape-square')}
        }

        .button.togglable.selected {
            &.round {
                ${getShapes('selected-container-shape-round')}
            }

            &.square {
                ${getShapes('selected-container-shape-square')}
            }
        }

        .button:is(.round, .square, .togglable.selected):active {
            ${getShapes('shape-pressed-morph')}
        }
    }
`

const containerSize = css`
    @layer mdc.icon-button.base {
        .button {
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

        .button.narrow {
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
        .button.default {
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
        .button.wide {
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
    }
`

const containerColorStyleForFilled = css`
    @layer mdc.icon-button.base {
        .button:not(.disabled) .background {
            background: var(--_container-color);
        }

        .button:not(.disabled).togglable.unselected .background {
            background: var(--_container-color-toggle-unselected);
        }

        .button:not(.disabled).togglable.selected .background {
            background: var(--_container-color-toggle-selected);
        }

        .button.disabled .background {
            background: var(--_disabled-container-color);
            opacity: var(--_disabled-container-opacity);
        }
    }
`
const containerColorStyleForStandard = css`
    @layer mdc.icon-button.base {
        .button .background {
            background: transparent;
        }
    }
`
const containerColorStyleForOutlined = css`
    @layer mdc.icon-button.base {
        .button:not(.disabled) .background {
            background: var(--_container-color);
        }

        .button.togglable.unselected .background {
            background: var(--_container-color-toggle-unselected);
        }

        .button.togglable.selected .background {
            background: var(--_container-color-toggle-selected);
        }

        .button:not(.togglable).disabled .background {
            background: var(--_disabled-container-color);
        }
        .button.togglable.disabled {
            &.unselected .background {
                background: var(--_disabled-container-color-toggle-unselected);
                opacity: var(--_disabled-container-opacity-toggle-unselected);
            }
            &.selected .background {
                background: var(--_disabled-container-color-toggle-selected);
                opacity: var(--_disabled-container-opacity-toggle-selected);
            }
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

    .button.extra-small .outline {
        border-width: var(--_extra-small-outline-width);
    }
    .button.small .outline {
        border-width: var(--_small-outline-width);
    }
    .button.medium .outline {
        border-width: var(--_medium-outline-width);
    }
    .button.large .outline {
        border-width: var(--_large-outline-width);
    }
    .button.extra-large .outline {
        border-width: var(--_extra-large-outline-width);
    }

    .outline:not(.disabled) {
        border-color: var(--_outline-color);
    }
    .outline:not(.disabled).togglable.unselected {
        border-color: var(--_outline-color-togglable-unselected);
    }
    .outline:not(.disabled).togglable.selected {
        border-color: var(--_outline-color-togglable-selected);
    }

    .outline.disabled {
        outline-color: var(--_disabled-outline-color);
        opacity: var(--_disabled-outline-opacity);
    }
`

const buttonSharedStyle = css`
    @layer mdc.icon-button.base {
        :host {
            display: inline-flex;
            vertical-align: top;
            border: none;
            outline: none;
            justify-content: center;
            user-select: none;
        }

        :host([disabled]),
        :host([disabled]) .button,
        :host([disabled]) .input,
        .button.disabled,
        .button.disabled .input {
            cursor: default;
            pointer-events: none;
        }

        ::slotted(*) {
            font-weight: inherit;
            fill: currentColor;
            user-select: none;
        }

        .input {
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

        .button {
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

            transition-property: border-radius;
            transition-duration: 350ms;
            transition-timing-function: cubic-bezier(0.42, 1.67, 0.21, 0.9);
        }
        .button:not(.togglable) {
            z-index: 1;
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
    }
`

const iconColorStyle = css`
    @layer mdc.icon-button.base {
        .button:not(.disabled) {
            color: var(--_icon-color);
        }
        .button:not(.disabled).togglable.unselected {
            color: var(--_icon-color-toggle-unselected);
        }
        .button:not(.disabled).togglable.selected {
            color: var(--_icon-color-toggle-selected);
        }

        .button:not(.disabled):hover {
            color: var(--_hovered-icon-color);
        }
        .button:not(.disabled).togglable.unselected:hover {
            color: var(--_hovered-icon-color-toggle-unselected);
        }
        .button:not(.disabled).togglable.selected:hover {
            color: var(--_hovered-icon-color-toggle-selected);
        }

        .button:not(.disabled):focus-within {
            color: var(--_focused-icon-color);
        }
        .button:not(.disabled).togglable.unselected:focus-within {
            color: var(--_focused-icon-color-toggle-unselected);
        }
        .button:not(.disabled).togglable.selected:focus-within {
            color: var(--_focused-icon-color-toggle-selected);
        }

        .button:not(.disabled):active {
            color: var(--_pressed-icon-color);
        }
        .button:not(.disabled).togglable.unselected:active {
            color: var(--_pressed-icon-color-toggle-unselected);
        }
        .button:not(.disabled).togglable.selected:active {
            color: var(--_pressed-icon-color-toggle-selected);
        }

        .button.disabled {
            color: var(--_disabled-icon-color);
            opacity: var(--_disabled-icon-opacity);
        }
    }
`

const iconSizeStyle = css`
    @layer mdc.icon-button.composite.icon {
        .button.extra-small ::slotted(*) {
            font-size: var(--_extra-small-icon-size);
            height: var(--_extra-small-icon-size);
            width: var(--_extra-small-icon-size);
        }
        .button.small ::slotted(*) {
            font-size: var(--_small-icon-size);
            height: var(--_small-icon-size);
            width: var(--_small-icon-size);
        }
        .button.medium ::slotted(*) {
            font-size: var(--_medium-icon-size);
            height: var(--_medium-icon-size);
            width: var(--_medium-icon-size);
        }
        .button.large ::slotted(*) {
            font-size: var(--_large-icon-size);
            height: var(--_large-icon-size);
            width: var(--_large-icon-size);
        }
        .button.extra-large ::slotted(*) {
            font-size: var(--_extra-large-icon-size);
            height: var(--_extra-large-icon-size);
            width: var(--_extra-large-icon-size);
        }

        .button.extra-small mdc-icon {
            ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: 'var(--_extra-small-icon-size)', })))}
        }
        .button.small mdc-icon {
            ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: 'var(: var(--_small-icon-size)', })))}
        }
        .button.medium mdc-icon {
            ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: 'var(: var(--_medium-icon-size)', })))}
        }
        .button.large mdc-icon {
            ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: 'var(: var(--_large-icon-size)', })))}
        }
        .button.extra-large mdc-icon {
            ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: 'var(--_extra-large-icon-size)', })))}
        }
    }
`

const getRippleStyle = () => {
    const getStyles = (togglable: boolean, selected: boolean) => unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', {
        "hovered-color": togglable ? `var(--_hovered-state-layer-color-toggle-${selected ? 'selected' : 'unselected'})` : `var(--_hovered-state-layer-color)`,
        "pressed-color": togglable ? `var(--_pressed-state-layer-color-toggle-${selected ? 'selected' : 'unselected'})` : `var(--_pressed-state-layer-color)`,
        "hovered-opacity": `var(--_hovered-state-layer-opacity)`,
        "pressed-opacity": `var(--_pressed-state-layer-opacity)`,
    })))

    return css`
        mdc-ripple { ${getStyles(false, false)}; }
        .togglable.selected mdc-ripple { ${getStyles(true, true)}; }
        .togglable.unselected mdc-ripple { ${getStyles(true, false)}; }

    `
}
const rippleStyle = css`
    @layer mdc.icon-button.composite.ripple {
        ${getRippleStyle()}
    }
`

export const filledIconButtonStyle = [
    containerShapeStyle,
    containerColorStyleForFilled,
    buttonSharedStyle,
    containerSize,
    iconColorStyle,
    rippleStyle,
    iconSizeStyle,
    css`
        @layer mdc.icon-button.filled.variable {
            :host {
                ${filledString}
            }
        }
    `
]
export const filledTonalIconButtonStyle = [
    containerShapeStyle,
    containerColorStyleForFilled,
    buttonSharedStyle,
    containerSize,
    iconColorStyle,
    rippleStyle,
    iconSizeStyle,
    css`
        @layer mdc.icon-button.filled-tonal.variable {
            :host {
                ${filledTonalString}
            }
        }
    `
]
export const outlinedIconButtonStyle = [
    containerShapeStyle,
    containerColorStyleForOutlined,
    buttonSharedStyle,
    containerSize,
    iconColorStyle,
    rippleStyle,
    iconSizeStyle,
    outlineStyle,
    css`
        @layer mdc.icon-button.outlined.variable {
            :host {
                ${outlinedString}
            }
        }
    `
]
export const standardIconButtonStyle = [
    containerShapeStyle,
    containerColorStyleForStandard,
    buttonSharedStyle,
    containerSize,
    iconColorStyle,
    rippleStyle,
    iconSizeStyle,
    css`
        @layer mdc.icon-button.standard.variable {
            :host {
                ${standardString}
            }
        }
    `
]

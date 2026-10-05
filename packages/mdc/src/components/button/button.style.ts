/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { overrideTokens, stringifyTokens } from '../../utils/style'
import { css, unsafeCSS } from 'lit'
import type { ElevationDefinition } from '../elevation/elevation.definition'
import { FocusRingDefinition } from '../focus-ring/focus-ring.definition'
import type { IconDefinition } from '../icon/icon.definition'
import type { RippleDefinition } from '../ripple/ripple.definition'
import { ButtonSizeDefinition, ButtonSizes } from './button-size.definition'
import { ButtonDefinition, ButtonVariants } from './button.definition'

const buttonTokens = stringifyTokens('--mdc-button')(ButtonDefinition)
const sizeTokens = stringifyTokens('--mdc-button')(ButtonSizeDefinition)

export const elevationBridge = (levelVar: string, shadowColorVar: string) => overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(${levelVar})`,
    'shadow-color': `var(${shadowColorVar})`
})()

export type TState = 'container-shape-round' | 'container-shape-square' | 'container-shape-round-selected' | 'container-shape-square-selected' | 'container-shape-pressed-morph'
export type TSize = 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'

export const getShape = (s: TSize, mode: TState) => unsafeCSS(`
    border-start-start-radius: min(var(--_${s}-${mode}-start-start), calc(var(--_${s}-container-height) / 2));
    border-start-end-radius: min(var(--_${s}-${mode}-start-end), calc(var(--_${s}-container-height) / 2));
    border-end-start-radius: min(var(--_${s}-${mode}-end-start), calc(var(--_${s}-container-height) / 2));
    border-end-end-radius: min(var(--_${s}-${mode}-end-end), calc(var(--_${s}-container-height) / 2));
`)

export const getSizedShape = (mode: TState) => css`
    &.extra-small { ${getShape('extra-small', mode)}; }
    &.small { ${getShape('small', mode)}; }
    &.medium { ${getShape('medium', mode)}; }
    &.large { ${getShape('large', mode)}; }
    &.extra-large { ${getShape('extra-large', mode)}; }
`

export const getContainerShapeStyles = () => css`
    .container.round {${getSizedShape('container-shape-round')};}
    .container.square {${getSizedShape('container-shape-square')};}
    .container:not(.disable-morph):is(.round, .square):active {${getSizedShape('container-shape-pressed-morph')};}
`

export const getFocusRingShape = (
    size: TSize,
    mode: TState
) => overrideTokens<typeof FocusRingDefinition>('--mdc-focus-ring')({
    'shape-start-start': `min(var(--_${size}-${mode}-start-start), calc(var(--_${size}-container-height) / 2))`,
    'shape-start-end': `min(var(--_${size}-${mode}-start-end), calc(var(--_${size}-container-height) / 2))`,
    'shape-end-end': `min(var(--_${size}-${mode}-end-end), calc(var(--_${size}-container-height) / 2))`,
    'shape-end-start': `min(var(--_${size}-${mode}-end-start), calc(var(--_${size}-container-height) / 2))`,
})()

export const getSizedFocusRingShape = (mode: TState) => css`
    &.extra-small mdc-focus-ring {${getFocusRingShape('extra-small', mode)};}
    &.small mdc-focus-ring {${getFocusRingShape('small', mode)};}
    &.medium mdc-focus-ring {${getFocusRingShape('medium', mode)};}
    &.large mdc-focus-ring {${getFocusRingShape('large', mode)};}
    &.extra-large mdc-focus-ring {${getFocusRingShape('extra-large', mode)};}
`

export const getFocusRingStyles = () => css`
    .container.round {${getSizedFocusRingShape('container-shape-round')};}
    .container.square {${getSizedFocusRingShape('container-shape-square')};}
    .container:not(.disable-morph):is(.round, .square):active {${getSizedFocusRingShape('container-shape-pressed-morph')};}
`

export const getIconSizeStyle = () => css`
    .container.extra-small :is(::slotted([slot="icon"]), .icon) {${overrideTokens<typeof IconDefinition>('--mdc-icon')({ 'size': `var(--_extra-small-icon-size)` })()};}
    .container.small :is(::slotted([slot="icon"]), .icon) {${overrideTokens<typeof IconDefinition>('--mdc-icon')({ 'size': `var(--_small-icon-size)` })()};}
    .container.medium :is(::slotted([slot="icon"]), .icon) {${overrideTokens<typeof IconDefinition>('--mdc-icon')({ 'size': `var(--_medium-icon-size)` })()};}
    .container.large :is(::slotted([slot="icon"]), .icon) {${overrideTokens<typeof IconDefinition>('--mdc-icon')({ 'size': `var(--_large-icon-size)` })()};}
    .container.extra-large :is(::slotted([slot="icon"]), .icon) {${overrideTokens<typeof IconDefinition>('--mdc-icon')({ 'size': `var(--_extra-large-icon-size)` })()};}
`

export const rippleBridge = (variant: string) => overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'hovered-color': `var(--_hovered-${variant}-state-layer-color)`,
    'focused-color': `var(--_focused-${variant}-state-layer-color)`,
    'pressed-color': `var(--_pressed-${variant}-state-layer-color)`,
    'hovered-opacity': `var(--_hovered-state-layer-opacity)`,
    'focused-opacity': `var(--_focused-state-layer-opacity)`,
    'pressed-opacity': `var(--_pressed-state-layer-opacity)`
})()

export const buttonLayoutStyles = css`
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

    .container .background {
        border-radius: inherit;
        inset: 0;
        position: absolute;
        z-index: -1;
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
`

const buttonElevationVariants = ['filled', 'filled-tonal', 'elevated'] as const

const buttonVariantRules = ButtonVariants.map((variant) => `
    .container.${variant} .background {
        background-color: var(--_enabled-${variant}-container-color);
    }
    .container.${variant} .label {
        color: var(--_enabled-${variant}-label-color);
    }
    .container.${variant} :is(::slotted([slot="icon"]), .icon) {
        color: var(--_enabled-${variant}-icon-color);
    }
    .container.disabled.${variant} .background {
        background-color: var(--_disabled-${variant}-container-color);
        opacity: var(--_disabled-container-opacity);
    }
    .container.disabled.${variant} .label {
        color: var(--_disabled-${variant}-label-color);
        opacity: var(--_disabled-label-opacity);
    }
    .container.disabled.${variant} :is(::slotted([slot="icon"]), .icon) {
        color: var(--_disabled-${variant}-icon-color);
        opacity: var(--_disabled-icon-opacity);
    }
`).join('\n\n')

const buttonElevationRules = buttonElevationVariants.map((variant) => `
    .container.${variant} mdc-elevation {
        transition-duration: 0ms;
        ${elevationBridge(`--_enabled-${variant}-container-elevation`, `--_enabled-${variant}-container-shadow-color`).cssText};
    }
`).join('\n\n')

const buttonPart = css`
    ${unsafeCSS(buttonVariantRules)}

    .container.outlined .outline {
        border-color: var(--_enabled-outlined-outline-color);
    }

    ${unsafeCSS(buttonElevationRules)}
    .container.disabled.elevated mdc-elevation {
        ${elevationBridge('--_disabled-elevated-container-elevation', '--_disabled-elevated-container-shadow-color')};
    }

    .container.filled mdc-ripple {${rippleBridge('filled')};}
    .container.filled-tonal mdc-ripple {${rippleBridge('filled-tonal')};}
    .container.elevated mdc-ripple {${rippleBridge('elevated')};}
    .container.outlined mdc-ripple {${rippleBridge('outlined')};}
    .container.text mdc-ripple {${rippleBridge('text')};}
`

const sizeVariantRules = ButtonSizes.map((size) => `
    .container.${size} {
        height: var(--_${size}-container-height);
        min-width: calc(64px - var(--_${size}-container-padding-inline-start) - var(--_${size}-container-padding-inline-end));
        padding-block-start: var(--_${size}-container-padding-block-start);
        padding-block-end: var(--_${size}-container-padding-block-end);
        padding-inline-start: var(--_${size}-container-padding-inline-start);
        padding-inline-end: var(--_${size}-container-padding-inline-end);
        gap: var(--_${size}-icon-label-space);
    }

    .container.${size} .label {
        font-family: var(--_${size}-label-font);
        font-size: var(--_${size}-label-size);
        line-height: var(--_${size}-label-leading);
        font-weight: var(--_${size}-label-weight);
        letter-spacing: var(--_${size}-label-tracking);
    }

    .container.${size} :is(::slotted([slot="icon"]), .icon) {
        font-size: var(--_${size}-icon-size);
        inline-size: var(--_${size}-icon-size);
        block-size: var(--_${size}-icon-size);
    }

    .container.${size} .outline {
        border-width: var(--_${size}-outline-width);
    }
`).join('\n\n')

export const sizePart = css`
    ${unsafeCSS(sizeVariantRules)}
`

export const a11y = css`
    @media (forced-colors: active) {
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
            --_disabled-filled-container-color: Canvas;
            --_disabled-filled-tonal-container-color: Canvas;
            --_disabled-elevated-container-color: Canvas;
            --_disabled-outlined-container-color: Canvas;
            --_disabled-text-container-color: Canvas;
            --_disabled-outlined-outline-color: GrayText;
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

export const buttonStyles = [
    css`:host {${buttonTokens}${sizeTokens};}`,
    getContainerShapeStyles(),
    getFocusRingStyles(),
    getIconSizeStyle(),
    buttonLayoutStyles,
    buttonPart,
    sizePart,
    a11y
]

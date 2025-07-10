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

const getSharedShapes = (mode: 'container-shape-round' | 'container-shape-square' | 'container-shape-round-toggle-selected' | 'container-shape-square-toggle-selected' | 'container-shape-pressed-morph') => {
    const size = (s: string) => css`
        & {
            border-start-start-radius: min(var(--_${unsafeCSS(s)}-${unsafeCSS(mode)}-start-start), calc(var(--_${unsafeCSS(s)}-container-height) / 2));
            border-start-end-radius: min(var(--_${unsafeCSS(s)}-${unsafeCSS(mode)}-start-end), calc(var(--_${unsafeCSS(s)}-container-height) / 2));
            border-end-start-radius: min(var(--_${unsafeCSS(s)}-${unsafeCSS(mode)}-end-start), calc(var(--_${unsafeCSS(s)}-container-height) / 2));
            border-end-end-radius: min(var(--_${unsafeCSS(s)}-${unsafeCSS(mode)}-end-end), calc(var(--_${unsafeCSS(s)}-container-height) / 2));
        }
    `

    return css`
        &.extra-small { ${unsafeCSS(size('extra-small'))}; }
        &.small { ${unsafeCSS(size('small'))}; }
        &.medium { ${unsafeCSS(size('medium'))}; }
        &.large { ${unsafeCSS(size('large'))}; }
        &.extra-large { ${unsafeCSS(size('extra-large'))}; }
    `
}

const shared = css`
    @layer mdc.button.shared {

        :host {
            display: inline-flex;
            outline: none;
            vertical-align: top;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
        }

        .surface {
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
            // Override vertical-align with shortest value "top". Vertical-align's
            // default "baseline" value causes buttons to be misaligned next to each
            // other if one button has an icon and the other does not.
            vertical-align: top;
            transition-property: border-radius;
            transition-duration: 350ms;
            transition-timing-function: cubic-bezier(0.42, 1.67, 0.21, 0.9);
        }

        :host([disabled]) {
            cursor: default;
            pointer-events: none;
        }

        /* Root Shape */

        .surface.round  {
            ${unsafeCSS(getSharedShapes('container-shape-round'))}
        }
        .surface.square {
            ${unsafeCSS(getSharedShapes('container-shape-square'))}
        }

        .surface.round.togglable.selected {
            ${unsafeCSS(getSharedShapes('container-shape-round-toggle-selected'))}
        }
        .surface.square.togglable.selected {
            ${unsafeCSS(getSharedShapes('container-shape-square-toggle-selected'))}
        }

        /* Pressed Shape */

        .surface:is(.round, .square, .togglable.selected, .togglable.unselected):active {
            ${unsafeCSS(getSharedShapes('container-shape-pressed-morph'))}
        }

        /* Root Width & Height */

        .surface {
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

        .surface.extra-small .button {
            padding-inline-start: var(--_extra-small-leading-space);
            padding-inline-end: var(--_extra-small-trailing-space);
            gap: var(--_extra-small-between-icon-label-space);
        }
        .surface.small .button{
            padding-inline-start: var(--_small-leading-space);
            padding-inline-end: var(--_small-trailing-space);
            gap: var(--_small-between-icon-label-space);
        }
        .surface.medium .button{
            padding-inline-start: var(--_medium-leading-space);
            padding-inline-end: var(--_medium-trailing-space);
            gap: var(--_medium-between-icon-label-space);
        }
        .surface.large .button{
            padding-inline-start: var(--_large-leading-space);
            padding-inline-end: var(--_large-trailing-space);
            gap: var(--_large-between-icon-label-space);
        }
        .surface.extra-large .button{
            padding-inline-start: var(--_extra-large-leading-space);
            padding-inline-end: var(--_extra-large-trailing-space);
            gap: var(--_extra-large-between-icon-label-space);
        }

        /* Label Size */

        .surface.extra-small .label {
            font-family: var(--_extra-small-label-font);
            font-weight: var(--_extra-small-label-weight);
            line-height: var(--_extra-small-label-line-height);
            letter-spacing: var(--_extra-small-label-tracking);
            font-size: var(--_extra-small-label-size);
        }
        .surface.small .label {
            font-family: var(--_small-label-font);
            font-weight: var(--_small-label-weight);
            line-height: var(--_small-label-line-height);
            letter-spacing: var(--_small-label-tracking);
            font-size: var(--_small-label-size);
        }
        .surface.medium .label {
            font-family: var(--_medium-label-font);
            font-weight: var(--_medium-label-weight);
            line-height: var(--_medium-label-line-height);
            letter-spacing: var(--_medium-label-tracking);
            font-size: var(--_medium-label-size);
        }
        .surface.large .label {
            font-family: var(--_large-label-font);
            font-weight: var(--_large-label-weight);
            line-height: var(--_large-label-line-height);
            letter-spacing: var(--_large-label-tracking);
            font-size: var(--_large-label-size);
        }
        .surface.extra-large .label {
            font-family: var(--_extra-large-label-font);
            font-weight: var(--_extra-large-label-weight);
            line-height: var(--_extra-large-label-line-height);
            letter-spacing: var(--_extra-large-label-tracking);
            font-size: var(--_extra-large-label-size);
        }

        .button {
            border-radius: inherit;
            cursor: inherit;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: none;
            outline: none;
            -webkit-appearance: none;
            vertical-align: middle;
            background: transparent;
            text-decoration: none;
            width: 100%;
            height: 100%;
            z-index: 0;
            text-transform: inherit;

            &::-moz-focused-inner {
                border: 0;
            }
        }

        .togglable-input {
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

        .surface .label {
            overflow: hidden;
            color: var(--_label-color);
        }
        .surface.disabled .label,
        .surface.disabled.togglable:is(.selected, .unselected) .label {
            color: var(--_disabled-label-color);
            opacity: var(--_disabled-label-opacity);
        }
        .surface:hover .label {
            color: var(--_hovered-label-color);
        }
        .surface:focus-within .label {
            color: var(--_focused-label-color);
        }
        .surface:active .label {
            color: var(--_pressed-label-color);
        }

        .surface.togglable.selected .label {
            color: var(--_label-color-toggle-selected);
        }
        .surface.togglable.selected:hover .label {
            color: var(--_hovered-label-color-toggle-selected);
        }

        .surface.togglable.selected:focus-within .label {
            color: var(--_focused-label-color-toggle-selected);
        }

        .surface.togglable.selected:active .label {
            color: var(--_pressed-label-color-toggle-selected);
        }

        .surface.togglable.unselected .label {
            color: var(--_label-color-toggle-unselected);
        }
        .surface.togglable.unselected:hover .label {
            color: var(--_hovered-label-color-toggle-unselected);
        }

        .surface.togglable.unselected:focus-within .label {
            color: var(--_focused-label-color-toggle-unselected);
        }

        .surface.togglable.unselected:active .label {
            color: var(--_pressed-label-color-toggle-unselected);
        }

        .surface .background {
            border-radius: inherit;
            inset: 0;
            position: absolute;
            z-index: -1;
        }
        .surface:not(.disabled) .background {
            background-color: var(--_container-color);
        }
        .surface.togglable.selected:not(.disabled) .background {
            background-color: var(--_container-color-toggle-selected);
        }
        .surface.togglable.unselected:not(.disabled) .background {
            background-color: var(--_container-color-toggle-unselected);
        }
        .surface.disabled .background {
            background-color: var(--_disabled-container-color);
            opacity: var(--_disabled-container-opacity);
        }

        // Inherit text-overflow down through label and slotted content so that it
        // can be customized on the .root.
        :is(.button, .label, .label *) {
            text-overflow: inherit;
        }



        @media (forced-colors: active) {
            .background {
                // Use CanvasText to increase visibility of buttons when the background
                // is not rendered. Buttons that use outlines by default should change The
                // outline color to GrayText when disabled.
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

        .touch {
            position: absolute;
            top: 50%;
            height: 100%;
            left: 0;
            right: 0;
            transform: translateY(-50%);
        }

        [touch-target='wrapper'] {
            margin: max(0px, (48px - var(--_container-height)) / 2) 0;
        }

        [touch-target='none'] .touch {
            display: none;
        }

    }
`
const elevation = css`
    @layer mdc.button.composite.elevation {
        mdc-elevation {
            transition-duration: 0ms;

            ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', { level: `var(--_container-elevation)`, 'shadow-color': `var(--_container-shadow-color)` })))}
        }

        :host(:is([disabled], [soft-disabled])) mdc-elevation {
            transition: none;
            ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', { level: `var(--_disabled-container-elevation)` })))}
        }

        :host(:focus-within) mdc-elevation {
            ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', { level: `var(--_focused-container-elevation)` })))}
        }

        :host(:active) mdc-elevation {
            ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', { level: `var(--_pressed-container-elevation)` })))}
        }
    }
`

const getFocusRingShapes = (mode: 'container-shape-round' | 'container-shape-square' | 'container-shape-round-toggle-selected' | 'container-shape-square-toggle-selected' | 'container-shape-pressed-morph') => {
    const getSizeShape = (size: string) => unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof FocusRingDefinition>('--mdc-focus-ring', {
        'shape-start-start': `min(var(--_${size}-${mode}-start-start), calc(var(--_${size}-container-height) / 2))`,
        'shape-start-end': `min(var(--_${size}-${mode}-start-end), calc(var(--_${size}-container-height) / 2))`,
        'shape-end-end': `min(var(--_${size}-${mode}-end-end), calc(var(--_${size}-container-height) / 2))`,
        'shape-end-start': `min(var(--_${size}-${mode}-end-start), calc(var(--_${size}-container-height) / 2))`,
    })))

    return css`
        &.extra-small mdc-focus-ring {${unsafeCSS(getSizeShape('extra-small'))};}
        &.small mdc-focus-ring {${unsafeCSS(getSizeShape('small'))};}
        &.medium mdc-focus-ring {${unsafeCSS(getSizeShape('medium'))};}
        &.large mdc-focus-ring {${unsafeCSS(getSizeShape('large'))};}
        &.extra-large mdc-focus-ring {${unsafeCSS(getSizeShape('extra-small'))};}
    `
}

const focusRing = css`
    @layer mdc.button.composite.focus-ring {

        .surface.round {
            ${unsafeCSS(getFocusRingShapes('container-shape-round'))}
        }

        .surface.square {
            ${unsafeCSS(getFocusRingShapes('container-shape-square'))}
        }

        /* Toggle */

        .surface.togglable.selected.round {
            ${unsafeCSS(getFocusRingShapes('container-shape-round-toggle-selected'))}
        }
        .surface.togglable.selected.square {
            ${unsafeCSS(getFocusRingShapes('container-shape-square-toggle-selected'))}
        }

        /* Pressed */

        .surface:is(.round, .square, .togglable.selected):active {
            ${unsafeCSS(getFocusRingShapes('container-shape-pressed-morph'))}
        }
    }
`

const ripple = css`
    @layer mdc.button.composite.ripple {
        mdc-ripple {
            ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', { 'hovered-color': `var(--_hovered-state-layer-color)`, 'pressed-color': `var(--_pressed-state-layer-color)`, 'hovered-opacity': `var(--_hovered-state-layer-opacity)`, 'pressed-opacity': `var(--_pressed-state-layer-opacity)`, })))};
        }

        .surface.togglable.selected mdc-ripple {
            ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', { 'hovered-color': `var(--_hovered-state-layer-color-toggle-selected)`, 'pressed-color': `var(--_pressed-state-layer-color-toggle-selected)` })))};
        }
        .surface.togglable.unselected mdc-ripple {
            ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', { 'hovered-color': `var(--_hovered-state-layer-color-toggle-unselected)`, 'pressed-color': `var(--_pressed-state-layer-color-toggle-unselected)` })))};
        }
    }
`

const icon = css`
    @layer mdc.button.composite.icon {

        // The icon CSS class overrides styles defined in the .material-icons CSS
        // class, which is loaded separately so the order of CSS definitions is not
        // guaranteed. Therefore, increase specifity to ensure overrides apply.
        ::slotted([slot="icon"]) {
            display: inline-flex;
            position: relative;
            writing-mode: horizontal-tb;
            fill: currentColor;
            flex-shrink: 0;
            color: var(--_icon-color);
        }

        :host(:hover) ::slotted([slot="icon"]) {
            color: var(--_hovered-icon-color);
        }

        :host(:focus-within) ::slotted([slot="icon"]) {
            color: var(--_focused-icon-color);
        }

        :host(:active) ::slotted([slot="icon"]) {
            color: var(--_pressed-icon-color);
        }

        /* Selected */

        .surface.togglable.selected ::slotted([slot="icon"]) {
            color: var(--_icon-color-toggle-selected);
        }

        .surface.togglable.selected:hover ::slotted([slot="icon"]) {
            color: var(--_hovered-icon-color-toggle-selected);
        }

        .surface.togglable.selected:focus-within ::slotted([slot="icon"]) {
            color: var(--_focused-icon-color-toggle-selected);
        }

        .surface.togglable.selected:active ::slotted([slot="icon"]) {
            color: var(--_pressed-icon-color-toggle-selected);
        }

        /* Unselected */

        .surface.togglable.unselected ::slotted([slot="icon"]) {
            color: var(--_icon-color-toggle-unselected);
        }

        .surface.togglable.unselected:hover ::slotted([slot="icon"]) {
            color: var(--_hovered-icon-color-toggle-unselected);
        }

        .surface.togglable.unselected:focus-within ::slotted([slot="icon"]) {
            color: var(--_focused-icon-color-toggle-unselected);
        }

        .surface.togglable.unselected:active ::slotted([slot="icon"]) {
            color: var(--_pressed-icon-color-toggle-unselected);
        }

        /* Icon Size */

        .surface.extra-small ::slotted([slot="icon"]) {
            font-size: var(--_extra-small-icon-size);
            inline-size: var(--_extra-small-icon-size);
            block-size: var(--_extra-small-icon-size);
            ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: `var(--_extra-small-icon-size)` })))}
        }

        .surface.small ::slotted([slot="icon"]) {
            font-size: var(--_small-icon-size);
            inline-size: var(--_small-icon-size);
            block-size: var(--_small-icon-size);
            ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: `var(--_small-icon-size)` })))}
        }

        .surface.medium ::slotted([slot="icon"]) {
            font-size: var(--_medium-icon-size);
            inline-size: var(--_medium-icon-size);
            block-size: var(--_medium-icon-size);
            ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: `var(--_medium-icon-size)` })))}
        }

        .surface.large ::slotted([slot="icon"]) {
            font-size: var(--_large-icon-size);
            inline-size: var(--_large-icon-size);
            block-size: var(--_large-icon-size);
            ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: `var(--_large-icon-size)` })))}
        }

        .surface.extra-large ::slotted([slot="icon"]) {
            font-size: var(--_extra-large-icon-size);
            inline-size: var(--_extra-large-icon-size);
            block-size: var(--_extra-large-icon-size);
            ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: `var(--_extra-large-icon-size)` })))}
        }

        :host[disabled] ::slotted([slot="icon"]) {
            color: var(--_disabled-icon-color);
            opacity: var(--_disabled-icon-opacity);
        }
    }
`

export const elevatedButtonStyles = [
    shared,
    elevation,
    focusRing,
    ripple,
    icon,
    css`
    @layer mdc.button.elevated {
        @layer variable {
            :host {
                ${elevatedTokenString}
            }
        }
    }
`]
export const filledButtonStyles = [
    shared,
    elevation,
    focusRing,
    ripple,
    icon,
    css`
    @layer mdc.button.filled {
        @layer variable {
            :host {
                ${filledTokenString}
            }
        }
    }
`]
export const filledTonalButtonStyles = [
    shared,
    elevation,
    focusRing,
    ripple,
    icon,
    css`
    @layer mdc.button.filled-tonal {
        @layer variable {
            :host {
                ${filledTonalTokenString}
            }
        }
    }
`]
export const outlinedButtonStyles = [
    shared,
    focusRing,
    ripple,
    icon,
    css`
    @layer mdc.button.outlined {
        @layer variable {
            :host {
                ${outlinedTokenString}
            }
        }

        @layer base {
            /* Outline */
            .surface.extra-small .outline {
                border-width: var(--_extra-small-outline-width);
            }
            .surface.small .outline {
                border-width: var(--_small-outline-width);
            }
            .surface.medium .outline {
                border-width: var(--_medium-outline-width);
            }
            .surface.large .outline {
                border-width: var(--_large-outline-width);
            }
            .surface.extra-large .outline {
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

            .surface.togglable.selected .outline {
                border-color: var(--_outline-color-toggle-selected);
            }
            .surface.togglable.unselected .outline {
                border-color: var(--_outline-color-toggle-unselected);
            }
            :host([disabled]) .outline {
                border-color: var(--_disabled-outline-color);
                opacity: var(--_disabled-outline-opacity);
            }
            .surface.disabled.togglable.selected .outline {
                border-color: var(--_disabled-outline-color-toggle-selected);
            }
            .surface.disabled.togglable.unselected .outline {
                border-color: var(--_disabled-outline-color-toggle-unselected);
            }

            :host(:hover) .outline {
                border-color: var(--_hovered-outline-color);
            }
            .surface.togglable.selected:hover .outline {
                border-color: var(--_hovered-outline-color-toggle-selected);
            }
            .surface.togglable.unselected:hover .outline {
                border-color: var(--_hovered-outline-color-toggle-unselected);
            }

            :host(:focus-within) .outline {
                border-color: var(--_focused-outline-color);
            }
            .surface.togglable.selected:focus-within .outline {
                border-color: var(--_focused-outline-color-toggle-selected);
            }
            .surface.togglable.unselected:focus-within .outline {
                border-color: var(--_focused-outline-color-toggle-unselected);
            }

            :host(:active) .outline {
                border-color: var(--_pressed-outline-color);
            }
            .surface.togglable.selected:active .outline {
                border-color: var(--_pressed-outline-color-toggle-selected);
            }
            .surface.togglable.unselected:active .outline {
                border-color: var(--_pressed-outline-color-toggle-unselected);
            }



            @media (forced-colors: active) {
                :host([disabled]) .background {
                    // Only outlined buttons change their border when disabled to distinmdish
                    // them from other buttons that add a border for increased visibility in
                    // HCM.
                    border-color: GrayText;
                }

                :host([disabled]) .outline {
                    opacity: 1;
                }
            }
        }
    }
`]
export const textButtonStyles = [
    shared,
    focusRing,
    ripple,
    icon,
    css`
    @layer mdc.button.text {
        @layer variable {
            :host {
                ${textTokenString}
            }
        }
    }
`]

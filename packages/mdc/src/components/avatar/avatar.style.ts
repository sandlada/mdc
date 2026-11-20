/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { stringifyTokens } from '../../utils/style'
import { AvatarDefinition } from './avatar.definition'

const Tokens = stringifyTokens('--mdc-avatar')(AvatarDefinition)

const StylePart = css`
    @layer mdc.avatar.base {
        :host {
            box-sizing: border-box;
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            vertical-align: middle;
            flex-grow: 0;
            flex-shrink: 0;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            width: var(--_resolved-size);
            height: var(--_resolved-size);
        }

        :host([hidden]) {
            display: none;
        }

        :host([size='extra-small']) {
            --_resolved-size: var(--_extra-small-container-size);
            --_resolved-icon-size: var(--_extra-small-icon-size);
            --_resolved-label-font: var(--_extra-small-label-font);
            --_resolved-label-size: var(--_extra-small-label-size);
            --_resolved-label-leading: var(--_extra-small-label-leading);
            --_resolved-label-tracking: var(--_extra-small-label-tracking);
            --_resolved-label-weight: var(--_extra-small-label-weight);
            --_resolved-square-shape-ss: var(--_extra-small-square-container-shape-start-start);
            --_resolved-square-shape-se: var(--_extra-small-square-container-shape-start-end);
            --_resolved-square-shape-ee: var(--_extra-small-square-container-shape-end-end);
            --_resolved-square-shape-es: var(--_extra-small-square-container-shape-end-start);
        }

        :host([size='small']) {
            --_resolved-size: var(--_small-container-size);
            --_resolved-icon-size: var(--_small-icon-size);
            --_resolved-label-font: var(--_small-label-font);
            --_resolved-label-size: var(--_small-label-size);
            --_resolved-label-leading: var(--_small-label-leading);
            --_resolved-label-tracking: var(--_small-label-tracking);
            --_resolved-label-weight: var(--_small-label-weight);
            --_resolved-square-shape-ss: var(--_small-square-container-shape-start-start);
            --_resolved-square-shape-se: var(--_small-square-container-shape-start-end);
            --_resolved-square-shape-ee: var(--_small-square-container-shape-end-end);
            --_resolved-square-shape-es: var(--_small-square-container-shape-end-start);
        }

        :host([size='medium']),
        :host(:not([size])) {
            --_resolved-size: var(--_medium-container-size);
            --_resolved-icon-size: var(--_medium-icon-size);
            --_resolved-label-font: var(--_medium-label-font);
            --_resolved-label-size: var(--_medium-label-size);
            --_resolved-label-leading: var(--_medium-label-leading);
            --_resolved-label-tracking: var(--_medium-label-tracking);
            --_resolved-label-weight: var(--_medium-label-weight);
            --_resolved-square-shape-ss: var(--_medium-square-container-shape-start-start);
            --_resolved-square-shape-se: var(--_medium-square-container-shape-start-end);
            --_resolved-square-shape-ee: var(--_medium-square-container-shape-end-end);
            --_resolved-square-shape-es: var(--_medium-square-container-shape-end-start);
        }

        :host([size='large']) {
            --_resolved-size: var(--_large-container-size);
            --_resolved-icon-size: var(--_large-icon-size);
            --_resolved-label-font: var(--_large-label-font);
            --_resolved-label-size: var(--_large-label-size);
            --_resolved-label-leading: var(--_large-label-leading);
            --_resolved-label-tracking: var(--_large-label-tracking);
            --_resolved-label-weight: var(--_large-label-weight);
            --_resolved-square-shape-ss: var(--_large-square-container-shape-start-start);
            --_resolved-square-shape-se: var(--_large-square-container-shape-start-end);
            --_resolved-square-shape-ee: var(--_large-square-container-shape-end-end);
            --_resolved-square-shape-es: var(--_large-square-container-shape-end-start);
        }

        :host([size='extra-large']) {
            --_resolved-size: var(--_extra-large-container-size);
            --_resolved-icon-size: var(--_extra-large-icon-size);
            --_resolved-label-font: var(--_extra-large-label-font);
            --_resolved-label-size: var(--_extra-large-label-size);
            --_resolved-label-leading: var(--_extra-large-label-leading);
            --_resolved-label-tracking: var(--_extra-large-label-tracking);
            --_resolved-label-weight: var(--_extra-large-label-weight);
            --_resolved-square-shape-ss: var(--_extra-large-square-container-shape-start-start);
            --_resolved-square-shape-se: var(--_extra-large-square-container-shape-start-end);
            --_resolved-square-shape-ee: var(--_extra-large-square-container-shape-end-end);
            --_resolved-square-shape-es: var(--_extra-large-square-container-shape-end-start);
        }

        :host([variant='tonal']),
        :host(:not([variant])) {
            --_resolved-container-color: var(--_enabled-tonal-container-color);
            --_resolved-label-color: var(--_enabled-tonal-label-color);
            --_resolved-outline-color: var(--_enabled-tonal-outline-color);
        }

        :host([variant='filled']) {
            --_resolved-container-color: var(--_enabled-filled-container-color);
            --_resolved-label-color: var(--_enabled-filled-label-color);
            --_resolved-outline-color: var(--_enabled-filled-outline-color);
        }

        :host([variant='outlined']) {
            --_resolved-container-color: var(--_enabled-outlined-container-color);
            --_resolved-label-color: var(--_enabled-outlined-label-color);
            --_resolved-outline-color: var(--_enabled-outlined-outline-color);
        }

        :host([variant='surface']) {
            --_resolved-container-color: var(--_enabled-surface-container-color);
            --_resolved-label-color: var(--_enabled-surface-label-color);
            --_resolved-outline-color: var(--_enabled-surface-outline-color);
        }

        .container.palette-0 {
            --_resolved-container-color: var(--_auto-color-0-container);
            --_resolved-label-color: var(--_auto-color-0-label);
        }
        .container.palette-1 {
            --_resolved-container-color: var(--_auto-color-1-container);
            --_resolved-label-color: var(--_auto-color-1-label);
        }
        .container.palette-2 {
            --_resolved-container-color: var(--_auto-color-2-container);
            --_resolved-label-color: var(--_auto-color-2-label);
        }
        .container.palette-3 {
            --_resolved-container-color: var(--_auto-color-3-container);
            --_resolved-label-color: var(--_auto-color-3-label);
        }
        .container.palette-4 {
            --_resolved-container-color: var(--_auto-color-4-container);
            --_resolved-label-color: var(--_auto-color-4-label);
        }
        .container.palette-5 {
            --_resolved-container-color: var(--_auto-color-5-container);
            --_resolved-label-color: var(--_auto-color-5-label);
        }

        .container {
            box-sizing: border-box;
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            overflow: hidden;
            padding: 0;
            margin: 0;
            border: none;
            outline: none;
            text-decoration: none;
            background-color: var(--_resolved-container-color);
            color: var(--_resolved-label-color);
            border-start-start-radius: var(--_round-container-shape-start-start);
            border-start-end-radius: var(--_round-container-shape-start-end);
            border-end-end-radius: var(--_round-container-shape-end-end);
            border-end-start-radius: var(--_round-container-shape-end-start);
            box-shadow: inset 0 0 0 var(--_outline-width) var(--_resolved-outline-color);
        }

        :host([shape='square']) .container {
            border-start-start-radius: var(--_resolved-square-shape-ss);
            border-start-end-radius: var(--_resolved-square-shape-se);
            border-end-end-radius: var(--_resolved-square-shape-ee);
            border-end-start-radius: var(--_resolved-square-shape-es);
        }

        .container.interactive {
            cursor: pointer;
        }

        :host([disabled]) .container {
            cursor: default;
            pointer-events: none;
        }

        :host([disabled]) .container::before {
            content: '';
            position: absolute;
            inset: 0;
            background: var(--_resolved-label-color);
            opacity: var(--_disabled-container-opacity);
            pointer-events: none;
            z-index: 0;
        }

        :host([disabled]) .image,
        :host([disabled]) .initials,
        :host([disabled]) .fallback-icon {
            opacity: var(--_disabled-content-opacity);
        }

        .image {
            position: relative;
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            border-radius: inherit;
            z-index: 0;
        }

        .image.loading {
            opacity: 0;
            position: absolute;
            inset: 0;
        }

        .initials {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-family: var(--_resolved-label-font);
            font-size: var(--_resolved-label-size);
            line-height: var(--_resolved-label-leading);
            letter-spacing: var(--_resolved-label-tracking);
            font-weight: var(--_resolved-label-weight);
            color: var(--_resolved-label-color);
            white-space: nowrap;
            z-index: 0;
        }

        .fallback-icon,
        ::slotted([slot='icon']) {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: var(--_resolved-icon-size);
            width: var(--_resolved-icon-size);
            height: var(--_resolved-icon-size);
            color: var(--_resolved-label-color);
            z-index: 0;
        }

        mdc-ripple {
            --mdc-ripple-hover-color: var(--_resolved-label-color);
            --mdc-ripple-pressed-color: var(--_resolved-label-color);
            --mdc-ripple-hover-opacity: var(--_hovered-state-layer-opacity);
            --mdc-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
            border-radius: inherit;
            z-index: 0;
        }

        mdc-focus-ring {
            z-index: 1;
        }

        .badge {
            position: absolute;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            z-index: 1;
        }

        :host([badge-placement='bottom-end']) .badge,
        :host(:not([badge-placement])) .badge {
            inset-block-end: 0;
            inset-inline-end: 0;
            transform: translate(15%, 15%);
        }

        :host([badge-placement='top-end']) .badge {
            inset-block-start: 0;
            inset-inline-end: 0;
            transform: translate(15%, -15%);
        }

        .badge[hidden] {
            display: none;
        }
    }

    @layer mdc.avatar.a11y {
        @media (forced-colors: active) {
            .container {
                forced-color-adjust: none;
                background-color: Canvas;
                color: CanvasText;
                box-shadow: inset 0 0 0 1px CanvasText;
            }

            .container.interactive:hover,
            .container.interactive:focus-visible {
                box-shadow: inset 0 0 0 2px Highlight;
            }
        }

        @media (prefers-contrast: more) {
            .container {
                box-shadow: inset 0 0 0 1.5px currentColor;
            }
        }

        @media (prefers-contrast: less) {
            .container {
                opacity: 0.92;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .image {
                transition: none;
            }
        }
    }
`

export const AvatarStyles = [
    css`:host {${Tokens};}`,
    StylePart,
]

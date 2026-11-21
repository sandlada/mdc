/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { stringifyTokens } from '../../utils/style'
import { ShapeDefinition } from './shape.definition'

const Tokens = stringifyTokens('--mdc-shape')(ShapeDefinition)

const StylePart = css`
    @layer mdc.shape.variable {
        :host {
            --_resolved-size: var(--_medium-container-size);
            --_resolved-container-color: var(--_enabled-tonal-container-color);
            --_resolved-content-color: var(--_enabled-tonal-content-color);
            --_resolved-outline-color: transparent;
            --_resolved-outline-width: 0px;
            --_resolved-filter: none;
        }

        .container.size-extra-small {
            --_resolved-size: var(--_extra-small-container-size);
        }

        .container.size-small {
            --_resolved-size: var(--_small-container-size);
        }

        .container.size-medium {
            --_resolved-size: var(--_medium-container-size);
        }

        .container.size-large {
            --_resolved-size: var(--_large-container-size);
        }

        .container.size-extra-large {
            --_resolved-size: var(--_extra-large-container-size);
        }

        /* Color role re-keying (defaults = primary) */
        .container.color-secondary {
            --_enabled-filled-container-color: var(--_enabled-filled-container-color-secondary);
            --_enabled-filled-content-color: var(--_enabled-filled-content-color-secondary);
            --_enabled-tonal-container-color: var(--_enabled-tonal-container-color-secondary);
            --_enabled-tonal-content-color: var(--_enabled-tonal-content-color-secondary);
            --_enabled-outlined-outline-color: var(--_enabled-outlined-outline-color-secondary);
            --_enabled-elevated-content-color: var(--_enabled-elevated-content-color-secondary);
        }

        .container.color-tertiary {
            --_enabled-filled-container-color: var(--_enabled-filled-container-color-tertiary);
            --_enabled-filled-content-color: var(--_enabled-filled-content-color-tertiary);
            --_enabled-tonal-container-color: var(--_enabled-tonal-container-color-tertiary);
            --_enabled-tonal-content-color: var(--_enabled-tonal-content-color-tertiary);
            --_enabled-outlined-outline-color: var(--_enabled-outlined-outline-color-tertiary);
            --_enabled-elevated-content-color: var(--_enabled-elevated-content-color-tertiary);
        }

        .container.color-error {
            --_enabled-filled-container-color: var(--_enabled-filled-container-color-error);
            --_enabled-filled-content-color: var(--_enabled-filled-content-color-error);
            --_enabled-tonal-container-color: var(--_enabled-tonal-container-color-error);
            --_enabled-tonal-content-color: var(--_enabled-tonal-content-color-error);
            --_enabled-outlined-outline-color: var(--_enabled-outlined-outline-color-error);
            --_enabled-elevated-content-color: var(--_enabled-elevated-content-color-error);
        }

        .container.color-surface {
            --_enabled-filled-container-color: var(--_enabled-filled-container-color-surface);
            --_enabled-filled-content-color: var(--_enabled-filled-content-color-surface);
            --_enabled-tonal-container-color: var(--_enabled-tonal-container-color-surface);
            --_enabled-tonal-content-color: var(--_enabled-tonal-content-color-surface);
            --_enabled-outlined-outline-color: var(--_enabled-outlined-outline-color-surface);
            --_enabled-elevated-content-color: var(--_enabled-elevated-content-color-surface);
        }

        /* Variant selection */
        .container.variant-filled {
            --_resolved-container-color: var(--_enabled-filled-container-color);
            --_resolved-content-color: var(--_enabled-filled-content-color);
        }

        .container.variant-tonal {
            --_resolved-container-color: var(--_enabled-tonal-container-color);
            --_resolved-content-color: var(--_enabled-tonal-content-color);
        }

        .container.variant-outlined {
            --_resolved-container-color: var(--_enabled-outlined-container-color);
            --_resolved-content-color: var(--_enabled-outlined-content-color);
            --_resolved-outline-color: var(--_enabled-outlined-outline-color);
            --_resolved-outline-width: var(--_outline-width);
        }

        .container.variant-elevated {
            --_resolved-container-color: var(--_enabled-elevated-container-color);
            --_resolved-content-color: var(--_enabled-elevated-content-color);
            --_resolved-filter: drop-shadow(0 var(--_elevated-shadow-offset-y) var(--_elevated-shadow-blur) var(--_elevated-shadow-color));
        }

        .container.variant-surface {
            --_resolved-container-color: var(--_enabled-surface-container-color);
            --_resolved-content-color: var(--_enabled-surface-content-color);
        }

        .container.variant-transparent {
            --_resolved-container-color: var(--_enabled-transparent-container-color);
            --_resolved-content-color: var(--_enabled-transparent-content-color);
        }
    }

    @layer mdc.shape.base {
        :host {
            display: inline-flex;
            position: relative;
            box-sizing: border-box;
            width: var(--_resolved-size);
            height: var(--_resolved-size);
            vertical-align: middle;
            -webkit-tap-highlight-color: transparent;
            user-select: none;
        }

        :host([size='extra-small']) {
            --_resolved-size: var(--_extra-small-container-size);
        }

        :host([size='small']) {
            --_resolved-size: var(--_small-container-size);
        }

        :host([size='medium']) {
            --_resolved-size: var(--_medium-container-size);
        }

        :host([size='large']) {
            --_resolved-size: var(--_large-container-size);
        }

        :host([size='extra-large']) {
            --_resolved-size: var(--_extra-large-container-size);
        }

        :host([hidden]) {
            display: none;
        }

        .container {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            padding: 0;
            margin: 0;
            border: none;
            background: transparent;
            font: inherit;
            color: var(--_resolved-content-color);
            box-sizing: border-box;
            isolation: isolate;
            outline: none;
            overflow: visible;
            cursor: default;
            z-index: 0;
        }

        .container.interactive {
            cursor: pointer;
        }

        .container.disabled {
            cursor: default;
            pointer-events: none;
        }

        .shape-svg {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            overflow: visible;
            pointer-events: none;
            filter: var(--_resolved-filter);
            z-index: -1;
        }

        .shape-fill {
            fill: var(--_resolved-container-color);
            transition: fill 180ms ease;
        }

        .container.disabled .shape-fill {
            opacity: var(--_disabled-container-opacity);
        }

        .clip-layer {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
        }

        .content {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            color: var(--_resolved-content-color);
            z-index: 0;
        }

        .container.disabled .content {
            opacity: var(--_disabled-content-opacity);
        }

        ::slotted(img),
        ::slotted(video),
        ::slotted(picture),
        ::slotted(canvas) {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .stroke-svg {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            overflow: visible;
            pointer-events: none;
            z-index: 1;
        }

        .shape-stroke {
            fill: none;
            stroke: var(--_resolved-outline-color);
            stroke-width: var(--_resolved-outline-width);
            transition: stroke 180ms ease;
        }

        .container.disabled .shape-stroke {
            opacity: var(--_disabled-content-opacity);
        }

        .shape-focus-stroke {
            fill: none;
            stroke: transparent;
            stroke-width: var(--_focus-outline-width);
            stroke-linejoin: round;
        }

        .container.interactive.focused-visible .shape-focus-stroke {
            stroke: var(--_focus-outline-color);
        }

        mdc-ripple {
            --mdc-ripple-hover-color: var(--_resolved-content-color);
            --mdc-ripple-pressed-color: var(--_resolved-content-color);
            --mdc-ripple-hover-opacity: var(--_hovered-state-layer-opacity);
            --mdc-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
            z-index: 1;
        }
    }

    @layer mdc.shape.a11y {
        @media (forced-colors: active) {
            .shape-fill {
                forced-color-adjust: none;
                fill: Canvas;
            }

            .shape-stroke {
                forced-color-adjust: none;
                stroke: CanvasText;
                stroke-width: 1.5px;
            }

            .content {
                color: CanvasText;
            }

            .container.interactive:hover .shape-stroke,
            .container.interactive.focused-visible .shape-stroke {
                stroke: Highlight;
                stroke-width: 2px;
            }

            .container.disabled .shape-stroke {
                stroke: GrayText;
            }

            .container.disabled .content {
                color: GrayText;
            }
        }

        @media (prefers-contrast: more) {
            .shape-stroke {
                stroke: currentColor;
                stroke-width: 1.5px;
            }
        }

        @media (prefers-contrast: less) {
            .shape-fill {
                opacity: 0.9;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .shape-fill,
            .shape-stroke {
                transition: none;
            }
        }

        @media (prefers-reduced-transparency: reduce) {
            .container.variant-elevated {
                --_resolved-filter: none;
            }
        }
    }
`

export const ShapeStyles = [
    css`:host {${Tokens};}`,
    StylePart,
]

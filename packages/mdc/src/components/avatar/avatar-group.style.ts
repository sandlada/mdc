/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { stringifyTokens } from '../../utils/style'
import { AvatarGroupDefinition } from './avatar-group.definition'

const Tokens = stringifyTokens('--mdc-avatar-group')(AvatarGroupDefinition)

const StylePart = css`
    @layer mdc.avatar-group.base {
        :host {
            box-sizing: border-box;
            position: relative;
            display: inline-flex;
            align-items: center;
            vertical-align: middle;
            isolation: isolate;
        }

        :host([hidden]) {
            display: none;
        }

        :host([size='extra-small']) {
            --_resolved-size: var(--_extra-small-avatar-size);
            --_resolved-overlap: var(--_extra-small-overlap-distance);
            --_resolved-square-shape-ss: var(--_extra-small-square-overflow-shape-start-start);
            --_resolved-square-shape-se: var(--_extra-small-square-overflow-shape-start-end);
            --_resolved-square-shape-ee: var(--_extra-small-square-overflow-shape-end-end);
            --_resolved-square-shape-es: var(--_extra-small-square-overflow-shape-end-start);
            --_resolved-label-font: var(--_extra-small-overflow-label-font);
            --_resolved-label-size: var(--_extra-small-overflow-label-size);
            --_resolved-label-leading: var(--_extra-small-overflow-label-leading);
            --_resolved-label-tracking: var(--_extra-small-overflow-label-tracking);
            --_resolved-label-weight: var(--_extra-small-overflow-label-weight);
        }

        :host([size='small']) {
            --_resolved-size: var(--_small-avatar-size);
            --_resolved-overlap: var(--_small-overlap-distance);
            --_resolved-square-shape-ss: var(--_small-square-overflow-shape-start-start);
            --_resolved-square-shape-se: var(--_small-square-overflow-shape-start-end);
            --_resolved-square-shape-ee: var(--_small-square-overflow-shape-end-end);
            --_resolved-square-shape-es: var(--_small-square-overflow-shape-end-start);
            --_resolved-label-font: var(--_small-overflow-label-font);
            --_resolved-label-size: var(--_small-overflow-label-size);
            --_resolved-label-leading: var(--_small-overflow-label-leading);
            --_resolved-label-tracking: var(--_small-overflow-label-tracking);
            --_resolved-label-weight: var(--_small-overflow-label-weight);
        }

        :host([size='medium']),
        :host(:not([size])) {
            --_resolved-size: var(--_medium-avatar-size);
            --_resolved-overlap: var(--_medium-overlap-distance);
            --_resolved-square-shape-ss: var(--_medium-square-overflow-shape-start-start);
            --_resolved-square-shape-se: var(--_medium-square-overflow-shape-start-end);
            --_resolved-square-shape-ee: var(--_medium-square-overflow-shape-end-end);
            --_resolved-square-shape-es: var(--_medium-square-overflow-shape-end-start);
            --_resolved-label-font: var(--_medium-overflow-label-font);
            --_resolved-label-size: var(--_medium-overflow-label-size);
            --_resolved-label-leading: var(--_medium-overflow-label-leading);
            --_resolved-label-tracking: var(--_medium-overflow-label-tracking);
            --_resolved-label-weight: var(--_medium-overflow-label-weight);
        }

        :host([size='large']) {
            --_resolved-size: var(--_large-avatar-size);
            --_resolved-overlap: var(--_large-overlap-distance);
            --_resolved-square-shape-ss: var(--_large-square-overflow-shape-start-start);
            --_resolved-square-shape-se: var(--_large-square-overflow-shape-start-end);
            --_resolved-square-shape-ee: var(--_large-square-overflow-shape-end-end);
            --_resolved-square-shape-es: var(--_large-square-overflow-shape-end-start);
            --_resolved-label-font: var(--_large-overflow-label-font);
            --_resolved-label-size: var(--_large-overflow-label-size);
            --_resolved-label-leading: var(--_large-overflow-label-leading);
            --_resolved-label-tracking: var(--_large-overflow-label-tracking);
            --_resolved-label-weight: var(--_large-overflow-label-weight);
        }

        :host([size='extra-large']) {
            --_resolved-size: var(--_extra-large-avatar-size);
            --_resolved-overlap: var(--_extra-large-overlap-distance);
            --_resolved-square-shape-ss: var(--_extra-large-square-overflow-shape-start-start);
            --_resolved-square-shape-se: var(--_extra-large-square-overflow-shape-start-end);
            --_resolved-square-shape-ee: var(--_extra-large-square-overflow-shape-end-end);
            --_resolved-square-shape-es: var(--_extra-large-square-overflow-shape-end-start);
            --_resolved-label-font: var(--_extra-large-overflow-label-font);
            --_resolved-label-size: var(--_extra-large-overflow-label-size);
            --_resolved-label-leading: var(--_extra-large-overflow-label-leading);
            --_resolved-label-tracking: var(--_extra-large-overflow-label-tracking);
            --_resolved-label-weight: var(--_extra-large-overflow-label-weight);
        }

        .group {
            display: inline-flex;
            align-items: center;
            position: relative;
        }

        ::slotted(mdc-avatar[data-group-hidden]) {
            display: none;
        }

        ::slotted(mdc-avatar) {
            position: relative;
            z-index: 0;
            transition: margin-inline-start 200ms cubic-bezier(0.2, 0, 0, 1);
        }

        ::slotted(mdc-avatar:not([data-group-first])) {
            margin-inline-start: calc(-1 * var(--_resolved-overlap));
        }

        /* Round shape: true transparent cutout using CSS mask-image */
        :host(:not([shape='square'])[stack-order='start-on-top']) ::slotted(mdc-avatar:not([data-group-first])),
        :host(:not([shape='square']):not([stack-order])) ::slotted(mdc-avatar:not([data-group-first])) {
            mask-image: radial-gradient(
                circle calc(var(--_resolved-size) / 2 + var(--_ring-width))
                at calc(var(--_resolved-overlap) - var(--_resolved-size) / 2) 50%,
                transparent 98%,
                #000 100%
            );
        }

        :host(:not([shape='square'])[stack-order='end-on-top']) ::slotted(mdc-avatar:not([data-group-last])),
        :host(:not([shape='square'])[stack-order='end-on-top'][data-has-overflow]) ::slotted(mdc-avatar[data-group-last]) {
            mask-image: radial-gradient(
                circle calc(var(--_resolved-size) / 2 + var(--_ring-width))
                at calc(100% + var(--_resolved-size) / 2 - var(--_resolved-overlap)) 50%,
                transparent 98%,
                #000 100%
            );
        }

        /* Square shape: solid ring border fallback */
        :host([shape='square']) ::slotted(mdc-avatar),
        :host([shape='square']) .overflow-indicator {
            box-shadow: 0 0 0 var(--_ring-width) var(--_ring-color);
            border-start-start-radius: var(--_resolved-square-shape-ss);
            border-start-end-radius: var(--_resolved-square-shape-se);
            border-end-end-radius: var(--_resolved-square-shape-ee);
            border-end-start-radius: var(--_resolved-square-shape-es);
        }

        :host(:not([shape='square'])) .overflow-indicator {
            border-start-start-radius: var(--_round-overflow-shape-start-start);
            border-start-end-radius: var(--_round-overflow-shape-start-end);
            border-end-end-radius: var(--_round-overflow-shape-end-end);
            border-end-start-radius: var(--_round-overflow-shape-end-start);
        }

        .overflow-indicator {
            box-sizing: border-box;
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: var(--_resolved-size);
            height: var(--_resolved-size);
            margin-inline-start: calc(-1 * var(--_resolved-overlap));
            padding: 0;
            border: none;
            outline: none;
            background-color: var(--_overflow-container-color);
            color: var(--_overflow-label-color);
            font-family: var(--_resolved-label-font);
            font-size: var(--_resolved-label-size);
            line-height: var(--_resolved-label-leading);
            letter-spacing: var(--_resolved-label-tracking);
            font-weight: var(--_resolved-label-weight);
            flex-shrink: 0;
            z-index: 0;
            transition: margin-inline-start 200ms cubic-bezier(0.2, 0, 0, 1);
        }

        :host(:not([shape='square']):not([stack-order='end-on-top'])) .overflow-indicator {
            mask-image: radial-gradient(
                circle calc(var(--_resolved-size) / 2 + var(--_ring-width))
                at calc(var(--_resolved-overlap) - var(--_resolved-size) / 2) 50%,
                transparent 98%,
                #000 100%
            );
        }

        .overflow-indicator.clickable {
            cursor: pointer;
        }

        .overflow-indicator mdc-ripple {
            --mdc-ripple-hover-color: var(--_overflow-label-color);
            --mdc-ripple-pressed-color: var(--_overflow-label-color);
            --mdc-ripple-hover-opacity: var(--_hovered-state-layer-opacity);
            --mdc-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);
            border-radius: inherit;
        }

        .overflow-indicator mdc-focus-ring {
            z-index: 1;
        }

        /* Hover expand behavior */
        :host([hover-expand]:hover) ::slotted(mdc-avatar:not([data-group-first])),
        :host([hover-expand]:focus-within) ::slotted(mdc-avatar:not([data-group-first])),
        :host([hover-expand]:hover) .overflow-indicator,
        :host([hover-expand]:focus-within) .overflow-indicator {
            margin-inline-start: var(--_expanded-gap);
        }

        :host([hover-expand]) ::slotted(mdc-avatar:hover),
        :host([hover-expand]) ::slotted(mdc-avatar:focus-within),
        :host([hover-expand]) .overflow-indicator:hover,
        :host([hover-expand]) .overflow-indicator:focus-visible {
            z-index: 1;
        }
    }

    @layer mdc.avatar-group.interactive {
        :host([hover-expand]:hover) ::slotted(mdc-avatar),
        :host([hover-expand]:focus-within) ::slotted(mdc-avatar),
        :host([hover-expand]:hover) .overflow-indicator,
        :host([hover-expand]:focus-within) .overflow-indicator {
            mask-image: none;
        }
    }

    @layer mdc.avatar-group.a11y {
        @media (forced-colors: active) {
            .overflow-indicator {
                forced-color-adjust: none;
                background-color: Canvas;
                color: CanvasText;
                box-shadow: 0 0 0 1px CanvasText;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            ::slotted(mdc-avatar),
            .overflow-indicator {
                transition: none;
            }
        }
    }
`

export const AvatarGroupStyles = [
    css`:host {${Tokens};}`,
    StylePart,
]

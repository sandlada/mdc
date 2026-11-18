/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { overrideTokens, stringifyTokens } from '../../utils/style'
import type { ElevationDefinition } from '../elevation/elevation.definition'
import type { PrimaryFabDefinition } from '../fab/fab.definition'
import { BottomAppBarDefinition } from './bottom-appbar.definition'

const TokenString = stringifyTokens('--mdc-bottom-appbar')(BottomAppBarDefinition)

const ElevationStyles = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'enabled-level'       : `var(--_enabled-container-elevation)`,
    'enabled-shadow-color': `var(--_enabled-container-shadow-color)`,
})()

const EmbeddedFabStyles = overrideTokens<typeof PrimaryFabDefinition>('--mdc-fab')({
    'enabled-container-elevation': `0`,
    'hovered-container-elevation': `0`,
    'focused-container-elevation': `0`,
    'pressed-container-elevation': `0`,
})()

export const BottomAppBarStyles = css`
    @layer mdc.bottom-appbar.variable {
        :host {
            ${TokenString};
        }
    }

    @layer mdc.bottom-appbar.composite.elevation {
        .container > mdc-elevation {
            ${ElevationStyles};
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            z-index: 0;
        }

        .fab ::slotted(mdc-fab) {
            ${EmbeddedFabStyles};
        }
    }

    @layer mdc.bottom-appbar.base {
        :host {
            display: block;
            width: 100%;
            box-sizing: border-box;
            position: relative;
        }

        .container {
            position: relative;
            display: flex;
            align-items: center;
            width: 100%;
            height: var(--_enabled-container-height);
            box-sizing: border-box;
            background-color: var(--_enabled-container-color);
            color: var(--_enabled-icon-color);
            border-start-start-radius: var(--_enabled-container-shape-start-start);
            border-start-end-radius: var(--_enabled-container-shape-start-end);
            border-end-end-radius: var(--_enabled-container-shape-end-end);
            border-end-start-radius: var(--_enabled-container-shape-end-start);
            padding-inline-start: var(--_enabled-container-padding-inline-start);
            padding-inline-end: var(--_enabled-container-padding-inline-end);
            padding-block-start: var(--_enabled-container-padding-block-start);
            padding-block-end: var(--_enabled-container-padding-block-end);
            gap: var(--_enabled-fab-gap-space);
            transition: transform var(--_enabled-transition-duration) var(--_enabled-transition-easing);
        }

        .container.is-hidden {
            transform: translateY(100%);
            pointer-events: none;
        }

        .actions {
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            flex: 1 1 auto;
            min-width: 0;
            gap: var(--_enabled-actions-gap-space);
        }

        .actions ::slotted(*) {
            flex-shrink: 0;
        }

        .fab {
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            flex-shrink: 0;
            margin-inline-start: auto;
        }

        .container:not(.has-fab) .fab {
            display: none;
        }

        @media (prefers-reduced-motion: reduce) {
            .container {
                transition: none;
            }
        }

        @media (prefers-contrast: more) {
            .container {
                outline: 1px solid currentColor;
                outline-offset: -1px;
            }
        }

        @media (prefers-contrast: less) {
            .container {
                outline: 1px solid color-mix(in srgb, currentColor 18%, transparent);
                outline-offset: -1px;
            }
        }

        @media (forced-colors: active) {
            .container {
                background-color: Canvas;
                color: CanvasText;
                border-top: 1px solid CanvasText;
            }
        }

        @media (prefers-reduced-transparency: reduce) {
            .container {
                background-color: var(--_enabled-container-color);
            }
        }
    }
`

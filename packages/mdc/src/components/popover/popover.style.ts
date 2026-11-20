/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { overrideTokens, stringifyTokens } from '../../utils/style'
import type { ElevationDefinition } from '../elevation/elevation.definition'
import {
    OutlinedPopoverDefinition,
    StandardPopoverDefinition,
    VibrantPopoverDefinition,
} from './popover.definition'

const Stringify = stringifyTokens('--mdc-popover')
const StandardTokens = Stringify(StandardPopoverDefinition)
const OutlinedTokens = Stringify(OutlinedPopoverDefinition)
const VibrantTokens = Stringify(VibrantPopoverDefinition)

const ElevationBridge = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_enabled-container-elevation)`,
})()

const VariablePart = css`
    @layer mdc.popover.variable {
        :host([variant='standard']),
        :host(:not([variant])) {
            ${StandardTokens};
        }
        :host([variant='outlined']) {
            ${OutlinedTokens};
        }
        :host([variant='vibrant']) {
            ${VibrantTokens};
        }
    }
`

const ComponentPart = css`
    @layer mdc.popover.component {
        :host {
            display: inline-block;
            position: relative;
            isolation: isolate;
            -webkit-tap-highlight-color: transparent;
        }

        .anchor {
            display: inline-block;
        }

        :host(:not([open])) .surface,
        :host(:not([open])) .scrim {
            display: none;
        }

        .scrim {
            position: fixed;
            inset: 0;
            z-index: 1;
            background-color: var(--_enabled-scrim-color);
            opacity: var(--_enabled-scrim-opacity);
        }

        .surface {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 1;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            min-width: var(--_enabled-container-min-width);
            max-width: var(--_enabled-container-max-width);
            max-height: var(--_enabled-container-max-height);
            padding-block-start: var(--_enabled-container-padding-block-start);
            padding-block-end: var(--_enabled-container-padding-block-end);
            padding-inline-start: var(--_enabled-container-padding-inline-start);
            padding-inline-end: var(--_enabled-container-padding-inline-end);
            border-start-start-radius: var(--_enabled-container-shape-start-start);
            border-start-end-radius: var(--_enabled-container-shape-start-end);
            border-end-end-radius: var(--_enabled-container-shape-end-end);
            border-end-start-radius: var(--_enabled-container-shape-end-start);
            background-color: var(--_enabled-container-color);
            color: var(--_enabled-container-text-color);
            border: var(--_enabled-outline-width) solid var(--_enabled-outline-color);
            font-family: var(--_enabled-body-font);
            font-size: var(--_enabled-body-size);
            line-height: var(--_enabled-body-leading);
            font-weight: var(--_enabled-body-weight);
            letter-spacing: var(--_enabled-body-tracking);
            outline: none;
        }

        .elevation {
            ${ElevationBridge};
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            z-index: -1;
        }

        .content {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            gap: var(--_enabled-section-gap);
            overflow: auto;
            min-width: 0;
        }

        .header-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }

        .header-row[hidden] {
            display: none;
        }

        .header {
            flex: 1 1 auto;
            min-width: 0;
            color: var(--_enabled-header-text-color);
            font-family: var(--_enabled-header-font);
            font-size: var(--_enabled-header-size);
            line-height: var(--_enabled-header-leading);
            font-weight: var(--_enabled-header-weight);
            letter-spacing: var(--_enabled-header-tracking);
        }

        .close-btn {
            flex-shrink: 0;
            margin: -6px -6px -6px 0;
        }

        .footer {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 8px;
            padding-top: 4px;
        }

        .header[hidden],
        .footer[hidden] {
            display: none;
        }

        .arrow {
            position: absolute;
            width: var(--_enabled-arrow-size);
            height: var(--_enabled-arrow-size);
            background-color: var(--_enabled-container-color);
            border-inline-start: var(--_enabled-outline-width) solid var(--_enabled-outline-color);
            border-block-start: var(--_enabled-outline-width) solid var(--_enabled-outline-color);
            border-start-start-radius: 2px;
            transform: rotate(45deg);
            pointer-events: none;
            z-index: 0;
        }

        .surface[data-placement^='top'] .arrow {
            transform: rotate(225deg);
        }

        .surface[data-placement^='bottom'] .arrow {
            transform: rotate(45deg);
        }

        .surface[data-placement^='left'] .arrow {
            transform: rotate(135deg);
        }

        .surface[data-placement^='right'] .arrow {
            transform: rotate(315deg);
        }
    }
`

const A11yPart = css`
    @layer mdc.popover.a11y {
        @media (prefers-contrast: more) {
            .surface {
                border: 2px solid currentColor;
            }
        }

        @media (prefers-contrast: less) {
            .surface {
                border-color: color-mix(in srgb, currentColor 20%, transparent);
            }
        }

        @media (prefers-reduced-transparency: reduce) {
            .scrim {
                opacity: 0.6;
            }
        }

        @media (forced-colors: active) {
            .surface {
                background-color: Canvas;
                color: CanvasText;
                border: 1px solid CanvasText;
            }
            .arrow {
                background-color: Canvas;
                border-color: CanvasText;
            }
            .scrim {
                background-color: Canvas;
                opacity: 0.75;
            }
        }
    }
`

export const PopoverStyles = [VariablePart, ComponentPart, A11yPart]

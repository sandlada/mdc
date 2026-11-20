/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import { overrideTokens, stringifyTokens } from '../../utils/style'
import type { ElevationDefinition } from '../elevation/elevation.definition'
import {
    PlainTooltipDefinition,
    RichTooltipDefinition,
} from './tooltip.definition'

const PlainTokens = stringifyTokens('--mdc-tooltip')(PlainTooltipDefinition)
const RichTokens = stringifyTokens('--mdc-tooltip')(RichTooltipDefinition)

const ElevationBridge = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_enabled-container-elevation)`,
    'shadow-color': `var(--_enabled-container-shadow-color)`,
})()

const EmphasizedDecelerateEasing = unsafeCSS(Easing.EmphasizedDecelerate.ToCSSValue())
const EmphasizedAccelerateEasing = unsafeCSS(Easing.EmphasizedAccelerate.ToCSSValue())

export const TooltipStyles = css`
    @layer mdc.tooltip.variable {
        :host(:not([rich])) { ${PlainTokens}; }
        :host([rich]) { ${RichTokens}; }
    }

    @layer mdc.tooltip.base {
        :host {
            display: inline-block;
            position: absolute;
            z-index: 1;
            pointer-events: none;
            max-width: max-content;
        }

        .container {
            position: relative;
            box-sizing: border-box;
            opacity: 0;
            transform: scale(0.8);
            transform-origin: bottom center;
            pointer-events: none;
            will-change: transform, opacity;
        }

        :host([position="top"]) .container {
            transform-origin: bottom center;
        }

        :host([position="bottom"]) .container {
            transform-origin: top center;
        }

        :host([position="left"]) .container {
            transform-origin: right center;
        }

        :host([position="right"]) .container {
            transform-origin: left center;
        }

        :host([open]) .container {
            opacity: 1;
            transform: scale(1);
            pointer-events: auto;
            transition: transform 150ms ${EmphasizedDecelerateEasing},
                        opacity 150ms ${EmphasizedDecelerateEasing};
        }

        :host(.hiding) .container {
            opacity: 0;
            transform: scale(0.8);
            pointer-events: none;
            transition: transform 75ms ${EmphasizedAccelerateEasing},
                        opacity 75ms ${EmphasizedAccelerateEasing};
        }

        :host([managed]) .container,
        :host([managed][open]) .container,
        :host([managed].hiding) .container {
            transition: none;
        }

        :host([managed][open]) .container {
            opacity: 1;
            transform: none;
        }

        :host([managed]:not([open])) .container {
            opacity: 0;
            transform: none;
            pointer-events: none;
        }
    }

    @layer mdc.tooltip.base.plain {
        :host(:not([rich])) .container {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding-inline-start: var(--_container-padding-inline-start);
            padding-inline-end: var(--_container-padding-inline-end);
            padding-block-start: var(--_container-padding-block-start);
            padding-block-end: var(--_container-padding-block-end);
            min-width: var(--_container-min-width);
            min-height: var(--_container-min-height);
            max-width: var(--_container-max-width);
            border-start-start-radius: var(--_container-shape-start-start);
            border-start-end-radius: var(--_container-shape-start-end);
            border-end-start-radius: var(--_container-shape-end-start);
            border-end-end-radius: var(--_container-shape-end-end);
            background-color: var(--_enabled-container-color);
            color: var(--_enabled-label-color);
            font-family: var(--_label-font);
            font-size: var(--_label-size);
            font-weight: var(--_label-weight);
            letter-spacing: var(--_label-tracking);
            line-height: var(--_label-leading);
            overflow-wrap: break-word;
            text-align: start;
        }
    }

    @layer mdc.tooltip.base.rich {
        :host([rich]) .container {
            display: flex;
            flex-direction: column;
            padding-inline-start: var(--_container-padding-inline-start);
            padding-inline-end: var(--_container-padding-inline-end);
            padding-block-start: var(--_container-padding-block-start);
            padding-block-end: var(--_container-padding-block-end);
            min-width: var(--_container-min-width);
            max-width: var(--_container-max-width);
            border-start-start-radius: var(--_container-shape-start-start);
            border-start-end-radius: var(--_container-shape-start-end);
            border-end-start-radius: var(--_container-shape-end-start);
            border-end-end-radius: var(--_container-shape-end-end);
            background-color: var(--_enabled-container-color);
            color: var(--_enabled-label-color);
        }

        :host([rich]) .container.has-actions {
            padding-block-end: var(--_container-actions-padding-block-end);
        }

        :host([rich]) mdc-elevation {
            ${ElevationBridge};
            border-radius: inherit;
        }

        :host([rich]) .headline {
            font-family: var(--_headline-font);
            font-size: var(--_headline-size);
            font-weight: var(--_headline-weight);
            letter-spacing: var(--_headline-tracking);
            line-height: var(--_headline-leading);
            color: var(--_enabled-headline-color);
            padding-inline-start: var(--_headline-padding-inline-start);
            padding-inline-end: var(--_headline-padding-inline-end);
            padding-block-start: var(--_headline-padding-block-start);
            padding-block-end: var(--_headline-padding-block-end);
        }

        :host([rich]) .container:not(.has-headline) .headline {
            display: none;
        }

        :host([rich]) .content {
            font-family: var(--_label-font);
            font-size: var(--_label-size);
            font-weight: var(--_label-weight);
            letter-spacing: var(--_label-tracking);
            line-height: var(--_label-leading);
            color: var(--_enabled-label-color);
        }

        :host([rich]) .actions {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: flex-start;
            gap: var(--_actions-gap);
            padding-inline-start: var(--_actions-padding-inline-start);
            padding-inline-end: var(--_actions-padding-inline-end);
            padding-block-start: var(--_actions-padding-block-start);
            padding-block-end: var(--_actions-padding-block-end);
            color: var(--_enabled-action-label-color);
        }

        :host([rich]) .container:not(.has-actions) .actions {
            display: none;
        }
    }

    @layer mdc.tooltip.caret {
        .caret {
            position: absolute;
            width: var(--_caret-width);
            height: var(--_caret-height);
            fill: var(--_enabled-container-color);
            pointer-events: none;
            display: block;
        }

        :host([position="top"]) .caret {
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
        }

        :host([position="bottom"]) .caret {
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%) rotate(180deg);
        }

        :host([position="left"]) .caret {
            left: calc(100% - 4px);
            top: 50%;
            transform: translateY(-50%) rotate(-90deg);
        }

        :host([position="right"]) .caret {
            right: calc(100% - 4px);
            top: 50%;
            transform: translateY(-50%) rotate(90deg);
        }
    }

    @layer mdc.tooltip.position {
        :host([position="top"]) {
            left: 50%;
            bottom: 100%;
            transform: translateX(-50%);
            margin-block-end: var(--_container-margin-block-end);
        }

        :host([position="bottom"]) {
            left: 50%;
            top: 100%;
            transform: translateX(-50%);
            margin-block-start: var(--_container-margin-block-start);
        }

        :host([position="left"]) {
            right: 100%;
            top: 50%;
            transform: translateY(-50%);
            margin-inline-end: var(--_container-margin-inline-end);
        }

        :host([position="right"]) {
            left: 100%;
            top: 50%;
            transform: translateY(-50%);
            margin-inline-start: var(--_container-margin-inline-start);
        }
    }

    @media (forced-colors: active) {
        :host(:not([rich])) .container,
        :host([rich]) .container {
            background-color: Canvas;
            color: CanvasText;
            border: 1px solid CanvasText;
        }

        :host([rich]) .headline,
        :host([rich]) .content {
            color: CanvasText;
        }

        .caret {
            fill: CanvasText;
        }
    }

    @media (prefers-contrast: more) {
        .container {
            outline: 1px solid currentColor;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .container,
        :host([open]) .container,
        :host(.hiding) .container {
            transition: none;
        }
    }
`

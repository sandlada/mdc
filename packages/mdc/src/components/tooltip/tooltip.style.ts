/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import {
    PlainTooltipDefinition,
    RichTooltipDefinition,
} from '../../component-definitions/tooltip.definition'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'

const plainTokens = defineVars(defineTokenRefsRecord(PlainTooltipDefinition, {
    expandShapes: true, useBaseFallback: true, prefix: '--mdc-tooltip',
}), true).join('')

const richTokens = defineVars(defineTokenRefsRecord(RichTooltipDefinition, {
    expandShapes: true, useBaseFallback: true, prefix: '--mdc-tooltip',
}), true).join('')

const emphasizedDecelerateEasing = unsafeCSS(Easing.EmphasizedDecelerate.ToCSSValue())
const emphasizedAccelerateEasing = unsafeCSS(Easing.EmphasizedAccelerate.ToCSSValue())

export const TooltipStyles = css`
    @layer mdc.tooltip.variable {
        :host(:not([rich])) { ${unsafeCSS(plainTokens)}; }
        :host([rich]) { ${unsafeCSS(richTokens)}; }
    }

    @layer mdc.tooltip.base {
        :host {
            display: inline-block;
            position: absolute;
            z-index: 1000;
            pointer-events: none;
            max-width: max-content;
        }

        .container {
            box-sizing: border-box;
            opacity: 0;
            transform: scale(0.8);
            transform-origin: center center;
            pointer-events: none;
            will-change: transform, opacity;
        }

        :host([open]) .container {
            opacity: 1;
            transform: scale(1);
            pointer-events: auto;
            transition: transform 250ms ${emphasizedDecelerateEasing},
                        opacity 150ms ${emphasizedDecelerateEasing};
        }

        :host(.hiding) .container {
            opacity: 0;
            transform: scale(0.8);
            transition: transform 150ms ${emphasizedAccelerateEasing},
                        opacity 150ms ${emphasizedAccelerateEasing};
        }
    }

    @layer mdc.tooltip.base.plain {
        :host(:not([rich])) .container {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: var(--_container-padding-block) var(--_container-padding-inline);
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
            line-height: var(--_label-line-height);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    @layer mdc.tooltip.base.rich {
        :host([rich]) .container {
            display: flex;
            flex-direction: column;
            padding: var(--_container-padding);
            max-width: var(--_container-max-width);
            border-start-start-radius: var(--_container-shape-start-start);
            border-start-end-radius: var(--_container-shape-start-end);
            border-end-start-radius: var(--_container-shape-end-start);
            border-end-end-radius: var(--_container-shape-end-end);
            background-color: var(--_enabled-container-color);
            color: var(--_enabled-label-color);
            box-shadow: 0 1px 2px 0 rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15);
        }

        :host([rich]) .headline {
            font-family: var(--_headline-font);
            font-size: var(--_headline-size);
            font-weight: var(--_headline-weight);
            letter-spacing: var(--_headline-tracking);
            line-height: var(--_headline-line-height);
            color: var(--_enabled-headline-color);
            padding-bottom: var(--_headline-padding-block);
        }

        :host([rich]:not(.has-headline)) .headline {
            display: none;
        }

        :host([rich]) .content {
            font-family: var(--_label-font);
            font-size: var(--_label-size);
            font-weight: var(--_label-weight);
            letter-spacing: var(--_label-tracking);
            line-height: var(--_label-line-height);
            color: var(--_enabled-label-color);
        }

        :host([rich]) .actions {
            display: flex;
            justify-content: flex-end;
            gap: var(--_actions-gap);
            padding-top: var(--_actions-padding-block);
        }

        :host([rich]:not(.has-actions)) .actions {
            display: none;
        }
    }

    @layer mdc.tooltip.position {
        :host([position="top"]) {
            left: 50%;
            bottom: 100%;
            transform: translateX(-50%);
            margin-bottom: var(--_container-margin, 4px);
        }

        :host([position="bottom"]) {
            left: 50%;
            top: 100%;
            transform: translateX(-50%);
            margin-top: var(--_container-margin, 4px);
        }

        :host([position="left"]) {
            right: 100%;
            top: 50%;
            transform: translateY(-50%);
            margin-right: var(--_container-margin, 4px);
        }

        :host([position="right"]) {
            left: 100%;
            top: 50%;
            transform: translateY(-50%);
            margin-left: var(--_container-margin, 4px);
        }
    }

    @media (forced-colors: active) {
        .container {
            border: 1px solid CanvasText;
        }
    }
`

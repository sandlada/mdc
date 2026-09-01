/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { BadgeDefinition } from '../../component-definitions/badge.definition'
import {
    pipe,
    stringifyTokens,
    mapStateTriggers,
    createStyleSheet
} from '../../utils/styles'

const tokens = stringifyTokens('--mdc-badge')(BadgeDefinition)

const compileBadgeStyles = pipe(
    mapStateTriggers({
        'small': '.small',
        'large': '.large',
    }),
    createStyleSheet
)

const stylePart = compileBadgeStyles(BadgeDefinition)(() => css`
    :host {
        box-sizing: border-box;
        position: relative;
        vertical-align: top;
        display: inline-flex;
        -webkit-tap-highlight-color: transparent;
        flex-grow: 0;
        flex-shrink: 0;
    }

    .container {
        box-sizing: border-box;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    @anchor .container {
        height: var(--_container-size);
        min-width: var(--_container-size);
        background: var(--_container-color);

        border-start-start-radius: var(--_container-shape-start-start);
        border-start-end-radius: var(--_container-shape-start-end);
        border-end-end-radius: var(--_container-shape-end-end);
        border-end-start-radius: var(--_container-shape-end-start);

        padding-block-start: var(--_container-padding-block-start);
        padding-block-end: var(--_container-padding-block-end);
        padding-inline-start: var(--_container-padding-inline-start);
        padding-inline-end: var(--_container-padding-inline-end);

        .label {
            color: var(--_label-color);
            font-family: var(--_label-font);
            line-height: var(--_label-leading);
            font-size: var(--_label-size);
            letter-spacing: var(--_label-tracking);
            font-weight: var(--_label-weight);
        }
    }

    .label {
        display: inline-flex;
        transform: scale(1);
        transform-origin: center;
        transition-duration: 100ms;
    }

    .container.small .label {
        transform: scale(0);
    }

    @media (forced-colors: active) {
        .container {
            forced-color-adjust: none;
        }

        .container.large {
            background: Highlight;
            color: HighlightText;
        }

        .container.small {
            background: Highlight;
        }
    }

    @media (prefers-contrast: more) {
        .container.large {
            background: Canvas;
            color: CanvasText;
            border: 1px solid CanvasText;
        }

        .container.small {
            background: CanvasText;
        }
    }

    @media (prefers-contrast: less) {
        .container.large {
            opacity: 0.85;
        }

        .container.small {
            opacity: 0.85;
        }
    }
`)

export const BadgeStyles = [
    css`:host {
        ${tokens}
    }`,
    stylePart,
]

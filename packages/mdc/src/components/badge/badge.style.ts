/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { createStyleSheet, stringifyTokens } from '@sandlada/styles/adapters/lit'
import { flow } from '@sandlada/styles/foundation'
import { emptyTables, withState } from '@sandlada/styles/schema'
import { css } from 'lit'
import { BadgeDefinition } from './badge.definition'

const tokens = stringifyTokens('--mdc-badge')(BadgeDefinition)

const compileBadgeStyles = createStyleSheet(flow(
    withState({
        'small': '.small',
        'large': '.large'
    })
)(emptyTables))

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
        background: var(--_container-color);

        .label {
            color: var(--_label-color);
            font-family: var(--_label-font);
            line-height: var(--_label-leading);
            font-size: var(--_label-size);
            letter-spacing: var(--_label-tracking);
            font-weight: var(--_label-weight);
        }
    }

    @state(.container) .container {
        shape: var(--_container-shape);
        height: var(--_container-size);
        min-width: var(--_container-size);
        padding-block-start: var(--_container-padding-block-start);
        padding-block-end: var(--_container-padding-block-end);
        padding-inline-start: var(--_container-padding-inline-start);
        padding-inline-end: var(--_container-padding-inline-end);
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
    css`:host {${tokens};}`,
    stylePart,
]

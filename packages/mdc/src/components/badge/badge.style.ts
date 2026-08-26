/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { BadgeDefinition } from '../../definitions'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'
import { createStyleSheet } from '../../utils'

const tokenRecord = defineTokenRefsRecord(BadgeDefinition, {
    expandShapes: false,
    useBaseFallback: true,
    prefix: '--md-badge',
})
const tokens = defineVars(tokenRecord, true).join('')

const stylePart = createStyleSheet([BadgeDefinition], () => css`
    :host {
        box-sizing: border-box;
        position: relative;
        vertical-align: top;
        display: inline-flex;
        -webkit-tap-highlight-color: transparent;
    }

    .container {
        box-sizing: border-box;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .container.large {
        height: var(--_large-container-size);
        min-width: var(--_large-container-size);
        background: var(--_large-container-color);
        border-start-start-radius: var(--_large-container-shape-start-start);
        border-start-end-radius: var(--_large-container-shape-start-end);
        border-end-end-radius: var(--_large-container-shape-end-end);
        border-end-start-radius: var(--_large-container-shape-end-start);

        padding-block-start: var(--_large-container-padding-block-start);
        padding-block-end: var(--_large-container-padding-block-end);
        padding-inline-start: var(--_large-container-padding-inline-start);
        padding-inline-end: var(--_large-container-padding-inline-end);
    }
    .container.small {
        height: var(--_small-container-size);
        min-width: var(--_small-container-size);
        background: var(--_small-container-color);
        border-start-start-radius: var(--_small-container-shape-start-start);
        border-start-end-radius: var(--_small-container-shape-start-end);
        border-end-end-radius: var(--_small-container-shape-end-end);
        border-end-start-radius: var(--_small-container-shape-end-start);
        padding-block-start: var(--_small-container-padding-block-start);
        padding-block-end: var(--_small-container-padding-block-end);
        padding-inline-start: var(--_small-container-padding-inline-start);
        padding-inline-end: var(--_small-container-padding-inline-end);
    }

    .label {
        display: inline-flex;
        transform: scale(1);
        transform-origin: center;
        transition-duration: 100ms;
    }

    .container.large {
        color: var(--_large-label-color);
        font-family: var(--_large-label-font);
        line-height: var(--_large-label-line-height);
        font-size: var(--_large-label-size);
        letter-spacing: var(--_large-label-tracking);
        font-weight: var(--_large-label-weight);
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
    css`:host {${unsafeCSS(tokens)};}`,
    stylePart,
]

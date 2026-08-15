import { css, unsafeCSS } from 'lit'
import { BadgeDefinition } from '../../definitions'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'

const tokenRecord = defineTokenRefsRecord(BadgeDefinition, {
    expandShapes: false,
    useBaseFallback: true,
    prefix: '--md-badge'
})
const tokens = defineVars(tokenRecord, true).join('')

export const BadgeStyles = [
    css`:host {${unsafeCSS(tokens)};}`,
    css`
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
            background: var(--_enabled-large-container-color);
            border-start-start-radius: var(--_large-container-shape-start-start);
            border-start-end-radius: var(--_large-container-shape-start-end);
            border-end-end-radius: var(--_large-container-shape-end-end);
            border-end-start-radius: var(--_large-container-shape-end-start);

            padding-block-start: var(--_large-container-block-leading-padding-space);
            padding-block-end: var(--_large-container-block-trailing-padding-space);
            padding-inline-start: var(--_large-container-inline-leading-padding-space);
            padding-inline-end: var(--_large-container-inline-trailing-padding-space);
        }
        .container.small {
            height: var(--_small-container-size);
            min-width: var(--_small-container-size);
            background: var(--_enabled-small-container-color);
            border-start-start-radius: var(--_small-container-shape-start-start);
            border-start-end-radius: var(--_small-container-shape-start-end);
            border-end-end-radius: var(--_small-container-shape-end-end);
            border-end-start-radius: var(--_small-container-shape-end-start);
            padding-block-start: var(--_small-container-block-leading-padding-space);
            padding-block-end: var(--_small-container-block-trailing-padding-space);
            padding-inline-start: var(--_small-container-inline-leading-padding-space);
            padding-inline-end: var(--_small-container-inline-trailing-padding-space);
        }

        .label {
            display: inline-flex;
            transform: scale(1);
            transform-origin: center;
            transition-duration: 100ms;
        }

        .container.large {
            color: var(--_enabled-large-label-color);
            font-family: var(--_large-label-font);
            line-height: var(--_large-label-line-height);
            font-size: var(--_large-label-size);
            letter-spacing: var(--_large-label-tracking);
            font-weight: var(--_large-label-weight);
        }
        .container.small .label {
            transform: scale(0);
        }

    `,
]

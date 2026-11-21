/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { stringifyTokens } from '../../utils/style'
import { EmptyStateDefinition } from './empty-state.definition'

const Tokens = stringifyTokens('--mdc-empty-state')(EmptyStateDefinition)

export const EmptyStateStyles = css`
    @layer mdc.empty-state {
        :host {
            ${Tokens};
            box-sizing: border-box;
            display: grid;
            grid-template-columns: minmax(0, var(--_container-max-inline-size));
            place-content: safe center;
            gap: var(--_container-gap);
            padding-block: var(--_container-padding-block-start) var(--_container-padding-block-end);
            padding-inline: var(--_container-padding-inline-start) var(--_container-padding-inline-end);
            text-align: center;
            overflow-wrap: anywhere;
        }

        :host([hidden]:not([hidden='until-found'])),
        slot[hidden] {
            display: none;
        }

        slot {
            display: block;
        }

        [name='illustration'] {
            color: var(--_enabled-illustration-color);
        }

        [name='illustration']:not([hidden]):has(~ slot:not([hidden])) {
            margin-block-end: var(--_illustration-spacing);
        }

        [name='illustration']::slotted(*) {
            max-inline-size: 100%;
            vertical-align: middle;
        }

        [name='illustration']::slotted(img) {
            block-size: auto;
        }

        [name='illustration']::slotted(mdc-icon) {
            --mdc-icon-size: var(--_illustration-icon-size);
        }

        [name='headline'] {
            color: var(--_enabled-headline-color);
            font: var(--_headline-weight) var(--_headline-size) / var(--_headline-leading) var(--_headline-font);
            letter-spacing: var(--_headline-tracking);
            opacity: var(--_headline-opacity);
        }

        [name='supporting-text'] {
            color: var(--_enabled-supporting-text-color);
            font: var(--_supporting-text-weight) var(--_supporting-text-size) / var(--_supporting-text-leading) var(--_supporting-text-font);
            letter-spacing: var(--_supporting-text-tracking);
            opacity: var(--_supporting-text-opacity);
        }

        [name='headline']::slotted(*),
        [name='supporting-text']::slotted(*) {
            margin: 0;
            font: inherit;
        }

        [name='actions']:not([hidden]) {
            display: flex;
            flex-wrap: wrap;
            justify-content: safe center;
            gap: var(--_actions-gap);
        }

        slot:not([hidden]) ~ [name='actions']:not([hidden]) {
            margin-block-start: var(--_actions-spacing);
        }

        [name='actions']::slotted(*) {
            min-inline-size: 0;
            max-inline-size: 100%;
        }

        @media (prefers-contrast: more) {
            :host {
                outline: 1px solid currentColor;
                outline-offset: -1px;
            }
        }

        @media (prefers-contrast: less) {
            [name='illustration'] {
                color: var(--_enabled-supporting-text-color);
            }
        }

        @media (forced-colors: active) {
            :host {
                outline: 1px solid CanvasText;
                outline-offset: -1px;
            }

            [name='illustration'],
            [name='headline'],
            [name='supporting-text'] {
                color: CanvasText;
                opacity: 1;
            }
        }

        @media (prefers-reduced-transparency: reduce) {
            [name='headline'],
            [name='supporting-text'] {
                opacity: 1;
            }
        }
    }
`

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { stringifyTokens } from '../../utils/style'
import { SkeletonGroupDefinition } from './skeleton-group.definition'

const Tokens = stringifyTokens('--mdc-skeleton-group')(SkeletonGroupDefinition)

const StylePart = css`
    @layer mdc.skeleton-group.base {
        :host {
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: var(--_gap);
            isolation: isolate;
        }

        :host([hidden]) {
            display: none;
        }

        .group {
            display: contents;
        }
    }
`

export const SkeletonGroupStyles = [
    css`:host {${Tokens};}`,
    StylePart,
]

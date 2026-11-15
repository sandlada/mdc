/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { stringifyTokens } from '../../utils/style'
import { ListDefinition } from './list.definition'

const ListTokens = stringifyTokens('--mdc-list')(ListDefinition)

export const ListStyles = css`
    @layer mdc.list.variable {
        :host { ${ListTokens}; }
    }

    @layer mdc.list.base {
        :host {
            display: block;
            outline: none;
        }

        .container {
            display: flex;
            flex-direction: column;
            gap: var(--_enabled-standard-gap);
        }

        :host([variant='segmented']) .container {
            gap: var(--_enabled-segmented-gap);
        }
    }
`

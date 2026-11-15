/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { stringifyTokens } from '../../utils/style'
import { ChipSetDefinition } from './chip-set.definition'

const TokenString = stringifyTokens('--mdc-chip-set')(ChipSetDefinition)

export const ChipSetStyles = css`
    @layer mdc.chip-set {
        @layer variable, component;
    }

    @layer mdc.chip-set.variable {
        :host {
            ${TokenString};
        }
    }

    @layer mdc.chip-set.component {
        :host {
            display: block;
            max-width: 100%;
            outline: none;
        }

        :host([hidden]) {
            display: none;
        }

        .container {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--_container-gap-space);
        }

        :host([single-line]) .container {
            flex-wrap: nowrap;
            overflow-x: auto;
            scrollbar-width: none;
        }
    }
`

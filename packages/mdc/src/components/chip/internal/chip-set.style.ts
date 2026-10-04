/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { ChipSetDefinition } from '../chip-set.definition'
import { stringifyTokens } from '@sandlada/styles/adapters/lit'

const tokenString = stringifyTokens('--mdc-chip-set')(ChipSetDefinition)

export const ChipSetStyles = css`
    @layer mdc.chip-set.variable {
        :host {
            ${tokenString};
        }
    }

    @layer mdc.chip-set.base {
        :host {
            display: inline-flex;
            outline: none;
        }

        .container {
            display: flex;
            align-items: center;
            gap: var(--_container-gap-space);
        }
    }
`

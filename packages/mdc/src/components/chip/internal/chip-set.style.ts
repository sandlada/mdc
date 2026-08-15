/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { ChipSetDefinition } from '../../../component-definitions/chip-set.definition'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'

const tokenRecord = defineTokenRefsRecord(ChipSetDefinition, {
    expandShapes: false,
    useBaseFallback: true,
    prefix: '--mdc-chip-set',
})
const tokenString = unsafeCSS(defineVars(tokenRecord, true).join(''))

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

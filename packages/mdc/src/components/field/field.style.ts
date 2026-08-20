/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import {
    FilledFieldDefinition,
    OutlinedFieldDefinition,
} from '../../component-definitions/field.definition'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'

const filledTokens = defineVars(defineTokenRefsRecord(FilledFieldDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-field',
}), true).join('')

const outlinedTokens = defineVars(defineTokenRefsRecord(OutlinedFieldDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-field',
}), true).join('')

/**
 * Concrete styles for `mdc-field`. Composes the base styles from
 * `internal/base-field.style.ts` with per-variant token cascades gated by
 * the `variant` attribute.
 */
export const fieldStyles = [
    css`
        @layer mdc.field.variant {
            :host([variant="filled"])   { ${unsafeCSS(filledTokens)}; }
            :host([variant="outlined"]) { ${unsafeCSS(outlinedTokens)}; }
        }
    `,
]

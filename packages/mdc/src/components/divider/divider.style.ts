/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { DividerDefinition } from '../../component-definitions/divider.definition'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'

const tokenRecord = defineTokenRefsRecord(DividerDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-divider'
})
const tokenString = unsafeCSS(defineVars(tokenRecord, true).join(''))

export const DividerStyles = css`
    @layer mdc.divider.variant {
        :host { ${tokenString}; }
    }
    @layer mdc.divider.base {
        :host {
            box-sizing: border-box;
            color: var(--_color);
            display: flex;
            height: var(--_thickness);
            width: 100%;
        }

        :host([inset]),
        :host([inset-start]) {
            padding-inline-start: 16px;
        }

        :host([inset]),
        :host([inset-end]) {
            padding-inline-end: 16px;
        }

        :host::before {
            background: currentColor;
            content: '';
            height: 100%;
            width: 100%;
        }

        @media (forced-colors: active) {
            :host::before {
            background: CanvasText;
            }
        }
    }
`

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'
import {
    ModalSideSheetDefinition,
    StandardSideSheetDefinition,
} from '../../component-definitions/side-sheet.definition'
import { baseSideSheetStyles } from './internal/base-side-sheet.style'

const standardTokenRecord = defineTokenRefsRecord(StandardSideSheetDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-side-sheet',
})
const standardTokenString = unsafeCSS(
    defineVars(standardTokenRecord, true).join('')
)

const modalTokenRecord = defineTokenRefsRecord(ModalSideSheetDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-side-sheet',
})
const modalTokenString = unsafeCSS(
    defineVars(modalTokenRecord, true).join('')
)

export const sideSheetStyles = [
    baseSideSheetStyles,
    standardTokenString,
    modalTokenString,
    css`
        :host(.standard) {
            /* Standard tokens are bound at the host level so the
             * .container, .headline, .close-icon etc. selectors can read
             * them through inheritance. */
        }
    `,
]
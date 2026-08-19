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

// Each variant's tokens are scoped to its host-class so the modal record
// does not clobber the standard record (and vice versa). The variant class
// lives on the inner `<dialog>` element (rendered via classMap), so we
// reach it through `:host:has(...)` — same pattern as snackbar.style.ts and
// button.style.ts.
const standardTokens = css`
    :host:has(.standard) {${standardTokenString};}
`

const modalTokens = css`
    :host:has(.modal) {${modalTokenString};}
`

export const sideSheetStyles = [
    baseSideSheetStyles,
    standardTokens,
    modalTokens,
]
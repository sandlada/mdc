/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'
import type { ElevationDefinition } from '../../component-definitions/elevation.definition'
import {
    ModalSideSheetDefinition,
    StandardSideSheetDefinition,
} from '../../component-definitions/side-sheet.definition'
import { overrideComponentTokens, stringTokens } from '../../utils/tokens'
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

// Each variant's tokens are scoped to its variant-class so the modal record
// does not clobber the standard record (and vice versa). The variant class
// lives on the inner `<dialog>` element (rendered via classMap), so we
// target it directly via `dialog.<variant>` — Lit shadow CSS can match
// elements rendered in the shadow root this way.
const standardTokens = css`
    dialog.standard {${standardTokenString};}
`

const modalTokens = css`
    dialog.modal {${modalTokenString};}
`

const getElevationStyles = () => {
    const styles = stringTokens(
        overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', {
            'enabled-level': `var(--_enabled-container-elevation, 1)`,
            'enabled-shadow-color': `var(--_container-shadow-color, rgba(0, 0, 0, 0.15))`,
        })
    )
    return css`
        .container > mdc-elevation {
            ${styles};
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            z-index: 0;
        }
    `
}

export const sideSheetStyles = [
    baseSideSheetStyles,
    standardTokens,
    modalTokens,
    getElevationStyles(),
]
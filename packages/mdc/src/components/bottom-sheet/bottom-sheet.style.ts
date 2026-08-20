/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'
import type { ElevationDefinition } from '../../component-definitions/elevation.definition'
import {
    ModalBottomSheetDefinition,
    StandardBottomSheetDefinition,
} from '../../component-definitions/bottom-sheet.definition'
import { overrideComponentTokens, stringTokens } from '../../utils/tokens'
import { baseBottomSheetStyles } from './internal/base-bottom-sheet.style'

const standardTokenRecord = defineTokenRefsRecord(StandardBottomSheetDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-bottom-sheet',
})
const standardTokenString = unsafeCSS(
    defineVars(standardTokenRecord, true).join('')
)

const modalTokenRecord = defineTokenRefsRecord(ModalBottomSheetDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-bottom-sheet',
})
const modalTokenString = unsafeCSS(
    defineVars(modalTokenRecord, true).join('')
)

// Each variant's tokens are scoped to its variant-class so the modal record
// does not clobber the standard record (and vice versa). The variant class
// lives on the inner <dialog> element (rendered via classMap), so we target
// it directly via 'dialog.<variant>' — Lit shadow CSS can match elements
// rendered in the shadow root this way.
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

export const bottomSheetStyles = [
    baseBottomSheetStyles,
    standardTokens,
    modalTokens,
    getElevationStyles(),
]

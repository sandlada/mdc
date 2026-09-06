/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Lit adapter for `@sandlada/mdc/utils/styles`.
 *
 * This is the ONLY place under `utils/styles` allowed to import `lit`.
 * Core (`stringifyTokens`, `createStyleSheet`, ...) returns framework-agnostic
 * `MDCStyleSheet`; convert once here when assigning to Lit `static styles`.
 */

import { unsafeCSS, type CSSResult } from 'lit'
import type { CSSLike } from '../css-like'

/**
 * Converts a framework-agnostic sheet (or raw string) into a Lit `CSSResult`.
 */
export function toLit(sheet: CSSLike | string): CSSResult {
    if (typeof sheet === 'string') {
        return unsafeCSS(sheet)
    }
    return unsafeCSS(sheet.cssText)
}

/**
 * Maps an array of sheets/strings into Lit `CSSResult`s.
 */
export function toLitAll(sheets: ReadonlyArray<CSSLike | string>): CSSResult[] {
    return sheets.map(toLit)
}

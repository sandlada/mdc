/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/**
 * Strips comments from CSS string while preserving quoted strings.
 * Only standard CSS block comments (`/* … *​/`) are stripped: CSS has no
 * `//` line comments, so `//` sequences (e.g. `url(https://…)`) are
 * preserved verbatim (BUG-02).
 */
export function stripComments(css: string): string {
    let result = ''
    let inSingleQuote = false
    let inDoubleQuote = false
    let inBlockComment = false
    let isEscaped = false

    for (let i = 0; i < css.length; i++) {
        const ch = css[i]
        const next = i + 1 < css.length ? css[i + 1] : ''

        if (isEscaped) {
            isEscaped = false
            if (!inBlockComment) {
                result += ch
            }
            continue
        }

        if (ch === '\\') {
            isEscaped = true
            if (!inBlockComment) {
                result += ch
            }
            continue
        }

        if (inBlockComment) {
            if (ch === '*' && next === '/') {
                inBlockComment = false
                i++ // skip '/'
            }
            continue
        }

        if (ch === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote
            result += ch
            continue
        }

        if (ch === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote
            result += ch
            continue
        }

        if (inSingleQuote || inDoubleQuote) {
            result += ch
            continue
        }

        if (ch === '/' && next === '*') {
            inBlockComment = true
            i++ // skip '*'
            continue
        }

        result += ch
    }

    return result
}

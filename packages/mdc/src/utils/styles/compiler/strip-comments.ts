/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/**
 * Strips comments from CSS string while preserving quoted strings.
 */
export function stripComments(css: string): string {
    let result = ''
    let inSingleQuote = false
    let inDoubleQuote = false
    let inBlockComment = false
    let inLineComment = false
    let isEscaped = false

    for (let i = 0; i < css.length; i++) {
        const ch = css[i]
        const next = i + 1 < css.length ? css[i + 1] : ''

        if (isEscaped) {
            isEscaped = false
            if (!inBlockComment && !inLineComment) {
                result += ch
            }
            continue
        }

        if (ch === '\\') {
            isEscaped = true
            if (!inBlockComment && !inLineComment) {
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

        if (inLineComment) {
            if (ch === '\n' || ch === '\r') {
                inLineComment = false
                result += ch
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

        if (ch === '/' && next === '/') {
            inLineComment = true
            i++ // skip '/'
            continue
        }

        result += ch
    }

    return result
}

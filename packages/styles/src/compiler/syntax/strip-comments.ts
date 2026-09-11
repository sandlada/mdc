/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/**
 * Strips C-style block comments (/* ... *\/) without touching double slashes (//) per BUG-02.
 */
export const stripComments = (css: string): string => {
    let result = ''
    let i = 0
    let inString = false
    let stringQuote = ''
    let inUrl = false

    while (i < css.length) {
        const ch = css[i]
        const next = css[i + 1]

        if (inString) {
            result += ch
            if (ch === '\\') {
                if (i + 1 < css.length) {
                    result += css[i + 1]
                    i++
                }
            } else if (ch === stringQuote) {
                inString = false
            }
            i++
            continue
        }

        if (inUrl) {
            result += ch
            if (ch === ')') {
                inUrl = false
            }
            i++
            continue
        }

        if (ch === '"' || ch === "'") {
            inString = true
            stringQuote = ch
            result += ch
            i++
            continue
        }

        if (
            (ch === 'u' || ch === 'U') &&
            (css[i + 1] === 'r' || css[i + 1] === 'R') &&
            (css[i + 2] === 'l' || css[i + 2] === 'L') &&
            css[i + 3] === '('
        ) {
            result += css.slice(i, i + 4)
            i += 4
            inUrl = true
            continue
        }

        if (ch === '/' && next === '*') {
            const endIdx = css.indexOf('*/', i + 2)
            if (endIdx === -1) {
                break
            }
            i = endIdx + 2
            continue
        }

        result += ch
        i++
    }

    return result
}

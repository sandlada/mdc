/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { stripComments } from './strip-comments'

/**
 * Splits a CSS property value string into whitespace-separated tokens at depth 0
 * (ignoring whitespace inside parentheses, brackets, and quotes, and stripping comments).
 */
export const splitCssValues = (val: string): string[] => {
    const tokens: string[] = []
    let current = ''
    let parenDepth = 0
    let bracketDepth = 0
    let inSingleQuote = false
    let inDoubleQuote = false
    let isEscaped = false

    const clean = stripComments(val).trim()

    for (let i = 0; i < clean.length; i++) {
        const ch = clean[i]

        if (isEscaped) {
            isEscaped = false
            current += ch
            continue
        }
        if (ch === '\\') {
            isEscaped = true
            current += ch
            continue
        }
        if (ch === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote
            current += ch
            continue
        }
        if (ch === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote
            current += ch
            continue
        }
        if (inSingleQuote || inDoubleQuote) {
            current += ch
            continue
        }

        if (ch === '(') {
            parenDepth++
            current += ch
            continue
        }
        if (ch === ')') {
            if (parenDepth > 0) parenDepth--
            current += ch
            continue
        }
        if (ch === '[') {
            bracketDepth++
            current += ch
            continue
        }
        if (ch === ']') {
            if (bracketDepth > 0) bracketDepth--
            current += ch
            continue
        }

        if (parenDepth === 0 && bracketDepth === 0 && /\s/.test(ch)) {
            if (current.trim()) {
                tokens.push(current.trim())
                current = ''
            }
            continue
        }

        current += ch
    }

    if (current.trim()) {
        tokens.push(current.trim())
    }

    return tokens
}

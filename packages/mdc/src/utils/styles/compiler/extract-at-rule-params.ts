/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/**
 * Extracts balanced parentheses parameter for an at-rule header.
 * e.g. "@when(:host([checked]))" -> { param: ":host([checked])", rest: "" }
 * e.g. "@state(:where(:host)) :where(:host)" -> { param: ":where(:host)", rest: ":where(:host)" }
 */
export const extractAtRuleParams = (
    header: string,
    keyword: string
): { param: string; rest: string } | null => {
    const trimmed = header.trim()
    const prefixRegex = new RegExp(`^${keyword}\\s*\\(`)
    const match = trimmed.match(prefixRegex)
    if (!match) return null

    const startIdx = match[0].length
    let depth = 1
    let inSingleQuote = false
    let inDoubleQuote = false
    let isEscaped = false
    let endIdx = -1

    for (let i = startIdx; i < trimmed.length; i++) {
        const ch = trimmed[i]
        if (isEscaped) {
            isEscaped = false
            continue
        }
        if (ch === '\\') {
            isEscaped = true
            continue
        }
        if (ch === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote
            continue
        }
        if (ch === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote
            continue
        }
        if (inSingleQuote || inDoubleQuote) continue

        if (ch === '(') {
            depth++
        } else if (ch === ')') {
            depth--
            if (depth === 0) {
                endIdx = i
                break
            }
        }
    }

    if (endIdx === -1) {
        return null
    }

    return {
        param: trimmed.slice(startIdx, endIdx).trim(),
        rest: trimmed.slice(endIdx + 1).trim()
    }
}

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Single copy of IDE text utilities (source ranges, balanced blocks, key
 * cleaning) shared by `definition-analyzer` and `stylesheet-analyzer`.
 * Pure string logic, no `mdc` semantics here.
 */
import type { SourceRange } from './types'

export function cleanKey(raw: string): string {
    return raw.replace(/^['"`]/, '').replace(/['"`]$/, '').replace(/^--/, '').trim()
}

export function cleanPrefix(raw: string): string {
    return raw.replace(/^['"`]/, '').replace(/['"`]$/, '').replace(/-+$/, '').trim()
}

export function cleanNamespace(targetPrefix: string, name?: string): string {
    if (name && name.trim().length > 0) {
        return name.replace(/^--/, '').replace(/^(mdc|md)-/, '').replace(/-+$/, '').trim()
    }
    return targetPrefix.replace(/^--/, '').replace(/^(mdc|md)-/, '').replace(/-+$/, '').trim()
}

export function getSourceRange(sourceText: string, startIndex: number, length: number): SourceRange {
    const textBefore = sourceText.substring(0, Math.max(0, startIndex))
    const lines = textBefore.split('\n')
    const startLine = lines.length - 1
    const startCol = lines[lines.length - 1].length

    const matchText = sourceText.substring(startIndex, startIndex + length)
    const matchLines = matchText.split('\n')
    const endLine = startLine + matchLines.length - 1
    const endCol = matchLines.length === 1 ? startCol + length : matchLines[matchLines.length - 1].length

    return { startLine, startCol, endLine, endCol }
}

export function extractBalancedBlock(
    text: string,
    startIndex: number,
    openChar = '{',
    closeChar = '}'
): { content: string; startIndex: number; endIndex: number } | null {
    let depth = 0
    let start = -1
    let inString: string | null = null
    let isEscaped = false
    let inSingleComment = false
    let inBlockComment = false

    for (let i = startIndex; i < text.length; i++) {
        const char = text[i]
        const nextChar = text[i + 1]

        if (inSingleComment) {
            if (char === '\n') {
                inSingleComment = false
            }
            continue
        }

        if (inBlockComment) {
            if (char === '*' && nextChar === '/') {
                inBlockComment = false
                i++
            }
            continue
        }

        if (inString) {
            if (isEscaped) {
                isEscaped = false
            } else if (char === '\\') {
                isEscaped = true
            } else if (char === inString) {
                inString = null
            }
            continue
        }

        if (char === '/' && nextChar === '/') {
            inSingleComment = true
            i++
            continue
        }

        if (char === '/' && nextChar === '*') {
            inBlockComment = true
            i++
            continue
        }

        if (char === '"' || char === "'" || char === '`') {
            inString = char
            continue
        }

        if (char === openChar) {
            if (depth === 0) start = i + 1
            depth++
        } else if (char === closeChar) {
            depth--
            if (depth === 0 && start !== -1) {
                return { content: text.substring(start, i), startIndex: start, endIndex: i }
            }
        }
    }
    return null
}

export function extractObjectProperties(bodyText: string): Array<{ key: string; valRaw: string; index: number; length: number }> {
    const entries: Array<{ key: string; valRaw: string; index: number; length: number }> = []
    let i = 0
    while (i < bodyText.length) {
        // Skip whitespace
        while (i < bodyText.length && /\s/.test(bodyText[i])) i++
        if (i >= bodyText.length) break

        // Skip single-line comments
        if (bodyText[i] === '/' && bodyText[i + 1] === '/') {
            while (i < bodyText.length && bodyText[i] !== '\n') i++
            continue
        }
        // Skip block comments
        if (bodyText[i] === '/' && bodyText[i + 1] === '*') {
            i += 2
            while (i < bodyText.length && !(bodyText[i - 1] === '*' && bodyText[i] === '/')) i++
            i++
            continue
        }

        // Match property key: 'key': or "key": or `key`: or key:
        const keyMatch = /^(['"`]?)([a-zA-Z0-9_-]+)\1\s*:/.exec(bodyText.substring(i))
        if (!keyMatch) {
            i++
            continue
        }

        const entryStart = i
        const key = keyMatch[2]
        i += keyMatch[0].length

        // Skip whitespace after colon
        while (i < bodyText.length && /\s/.test(bodyText[i])) i++
        const valStart = i

        let parenDepth = 0
        let bracketDepth = 0
        let braceDepth = 0
        let inString: string | null = null
        let isEscaped = false

        while (i < bodyText.length) {
            const char = bodyText[i]

            if (inString) {
                if (isEscaped) {
                    isEscaped = false
                } else if (char === '\\') {
                    isEscaped = true
                } else if (char === inString) {
                    inString = null
                }
                i++
                continue
            }

            if (char === '"' || char === "'" || char === '`') {
                inString = char
                i++
                continue
            }

            if (char === '(') {
                parenDepth++
                i++
                continue
            }
            if (char === ')') {
                if (parenDepth > 0) parenDepth--
                i++
                continue
            }
            if (char === '[') {
                bracketDepth++
                i++
                continue
            }
            if (char === ']') {
                if (bracketDepth > 0) bracketDepth--
                i++
                continue
            }
            if (char === '{') {
                braceDepth++
                i++
                continue
            }
            if (char === '}') {
                if (braceDepth > 0) braceDepth--
                i++
                continue
            }

            if (parenDepth === 0 && bracketDepth === 0 && braceDepth === 0) {
                if (char === '/' && bodyText[i + 1] === '/') {
                    break
                }
                if (char === ',' || char === '\n' || char === ';') {
                    break
                }
            }
            i++
        }

        const valRaw = bodyText.substring(valStart, i).trim()
        const entryLength = i - entryStart
        if (key && valRaw) {
            entries.push({ key, valRaw, index: entryStart, length: entryLength })
        }
        if (i < bodyText.length && (bodyText[i] === ',' || bodyText[i] === ';')) {
            i++
        }
    }
    return entries
}

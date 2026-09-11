/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

function stripComments(css: string): string {
    return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

export interface ParsedStatement {
    readonly type: "decl" | "block"
    readonly header?: string
    readonly body?: string
    readonly property?: string
    readonly value?: string
}

export interface TransformResult {
    readonly baseRules: string[]
    readonly hoistedRules: string[]
}

export function findMatchingBrace(css: string, openBraceIndex: number): number {
    let depth = 1
    let inSingleQuote = false
    let inDoubleQuote = false
    let isEscaped = false

    for (let i = openBraceIndex + 1; i < css.length; i++) {
        const ch = css[i]
        if (isEscaped) {
            isEscaped = false
            continue
        }
        if (ch === "\\") {
            isEscaped = true
            continue
        }
        if (ch === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote
            continue
        }
        if (ch === "\"" && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote
            continue
        }
        if (inSingleQuote || inDoubleQuote) continue

        if (ch === "{") depth++
        else if (ch === "}") {
            depth--
            if (depth === 0) return i
        }
    }
    return css.length
}

export function parseStatements(css: string): ParsedStatement[] {
    const source = css.includes("/*") ? stripComments(css) : css
    const statements: ParsedStatement[] = []
    let i = 0
    const len = source.length

    while (i < len) {
        while (i < len && /\s/.test(source[i])) i++
        if (i >= len) break

        let parenDepth = 0
        let bracketDepth = 0
        let inSingleQuote = false
        let inDoubleQuote = false
        let isEscaped = false
        let delimType: ";" | "{" | null = null
        let delimIdx = -1

        for (let j = i; j < len; j++) {
            const ch = source[j]
            if (isEscaped) {
                isEscaped = false
                continue
            }
            if (ch === "\\") {
                isEscaped = true
                continue
            }
            if (ch === "'" && !inDoubleQuote) {
                inSingleQuote = !inSingleQuote
                continue
            }
            if (ch === "\"" && !inSingleQuote) {
                inDoubleQuote = !inDoubleQuote
                continue
            }
            if (inSingleQuote || inDoubleQuote) continue

            if (ch === "(") parenDepth++
            else if (ch === ")") {
                if (parenDepth > 0) parenDepth--
            } else if (ch === "[") bracketDepth++
            else if (ch === "]") {
                if (bracketDepth > 0) bracketDepth--
            }

            if (parenDepth === 0 && bracketDepth === 0) {
                if (ch === ";") {
                    delimType = ";"
                    delimIdx = j
                    break
                }
                if (ch === "{") {
                    delimType = "{"
                    delimIdx = j
                    break
                }
            }
        }

        if (!delimType) {
            const chunk = source.slice(i).trim()
            if (chunk) {
                const colonIdx = chunk.indexOf(":")
                if (colonIdx !== -1) {
                    statements.push({
                        type: "decl",
                        property: chunk.slice(0, colonIdx).trim(),
                        value: chunk.slice(colonIdx + 1).trim()
                    })
                }
            }
            break
        }

        if (delimType === ";") {
            const chunk = source.slice(i, delimIdx).trim()
            if (chunk) {
                const colonIdx = chunk.indexOf(":")
                if (colonIdx !== -1) {
                    statements.push({
                        type: "decl",
                        property: chunk.slice(0, colonIdx).trim(),
                        value: chunk.slice(colonIdx + 1).trim()
                    })
                }
            }
            i = delimIdx + 1
            continue
        }

        if (delimType === "{") {
            const header = source.slice(i, delimIdx).trim()
            const closeIdx = findMatchingBrace(source, delimIdx)
            const body = source.slice(delimIdx + 1, closeIdx).trim()
            statements.push({
                type: "block",
                header,
                body
            })
            i = closeIdx + 1
            continue
        }
    }

    return statements
}

const LEGACY_AT_RULE_RE = /^@(anchor|slot|slotted|size|elevation)(?![a-zA-Z0-9_-])/

export function isLegacyHeader(header: string): boolean {
    return LEGACY_AT_RULE_RE.test(header.trim())
}

export function formatRule(selector: string, content: string): string {
    const trimmedContent = content.trim()
    if (!trimmedContent) {
        return `${selector} {}`
    }
    return `${selector} { ${trimmedContent} }`
}

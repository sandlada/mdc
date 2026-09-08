/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Marker protocol for the `@sandlada/styles/rolldown` pre-build plugin.
 *
 * A `css` template literal opts into build-time compilation by containing
 * the marker comment somewhere in its body:
 *
 * ```css
 * css`
 *     /* @mdc-style *\/
 *     @state(.container) .container { ... }
 * `
 * ```
 *
 * Rationale: the marker is a plain CSS comment, so it is harmless to every
 * parser in the chain (`clean-css`, `stripComments`, browsers) when the
 * plugin is misordered or absent. A bare at-rule marker (e.g. `@tag`) would
 * itself be invalid CSS and would crash downstream minifiers before the
 * plugin ever runs.
 *
 * After compilation the marker is replaced with the compiled marker, which
 * makes the transform idempotent and lets the runtime `createStyleSheet`
 * pass the output through its cheap legacy path exactly once.
 */

export const STYLE_MARKER = '@mdc-style'

export const COMPILED_MARKER = '@mdc-compiled'

export interface MarkedLiteral {
    readonly start: number
    readonly end: number
    readonly bodyStart: number
    readonly bodyEnd: number
    readonly body: string
}

export const hasMarker = (marker: string) => (code: string): boolean =>
    code.includes(marker)

export const hasCompiledMarker = (compiledMarker: string) => (code: string): boolean =>
    code.includes(compiledMarker)

/**
 * Scan `code` for `css` tagged template literals and return those whose
 * body contains `marker`. The scanner understands `\` escapes and skips
 * `${...}` interpolations with balanced-brace tracking (including nested
 * braces and quoted strings), so nested backticks inside interpolations
 * never terminate the literal early.
 */
export const extractMarkedCssLiterals = (marker: string) => (code: string): MarkedLiteral[] => {
    const found: MarkedLiteral[] = []
    let i = 0
    while (i < code.length) {
        const tag = code.indexOf('css`', i)
        if (tag === -1) return found
        const bodyStart = tag + 4
        const end = scanTemplateEnd(code, bodyStart)
        if (end === -1) return found
        const body = code.slice(bodyStart, end)
        if (body.includes(marker)) {
            found.push({ start: tag, end: end + 1, bodyStart, bodyEnd: end, body })
        }
        i = end + 1
    }
    return found
}

const scanTemplateEnd = (code: string, from: number): number => {
    let i = from
    while (i < code.length) {
        const ch = code[i]
        if (ch === '\\') {
            i += 2
            continue
        }
        if (ch === '`') return i
        if (ch === '$' && code[i + 1] === '{') {
            i = skipBalanced(code, i + 2)
            continue
        }
        i += 1
    }
    return -1
}

const skipBalanced = (code: string, from: number): number => {
    let depth = 1
    let i = from
    while (i < code.length && depth > 0) {
        const ch = code[i]
        if (ch === '\\') {
            i += 2
            continue
        }
        if (ch === "'" || ch === '"' || ch === '`') {
            i = skipQuoted(code, i)
            continue
        }
        if (ch === '{') depth += 1
        else if (ch === '}') depth -= 1
        i += 1
    }
    return i
}

const skipQuoted = (code: string, from: number): number => {
    const quote = code[from]
    let i = from + 1
    while (i < code.length) {
        const ch = code[i]
        if (ch === '\\') {
            i += 2
            continue
        }
        if (ch === quote) return i + 1
        if (quote === '`' && ch === '$' && code[i + 1] === '{') {
            i = skipBalanced(code, i + 2)
            continue
        }
        i += 1
    }
    return i
}

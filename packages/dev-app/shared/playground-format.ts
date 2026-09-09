/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

// Dev-app-local code formatters for the styles playground editors.
// Pure string functions, zero DOM — intentionally NOT a shared library:
// these presentation preferences belong to the dev tool only.
//
// `formatCss` is ported from `packages/vscode-mdc/src/core/compiler-engine.ts`
// (`formatCss`, IDE-layer pretty-printer); the vscode-mdc copy stays as-is.

const INDENT = '    '

/**
 * Pretty-prints CSS (including `@state` / `@variant` / `@when` nesting):
 * one declaration per line, blocks indented, blank line between rules.
 * Total on string input — never throws, never drops characters.
 */
export function formatCss(rawCss: string): string {
    let result = ''
    let indent = 0
    let inComment = false
    let inString: string | null = null
    let parenDepth = 0

    const clean = rawCss.replace(/\r\n/g, '\n')
    let buffer = ''

    for (let i = 0; i < clean.length; i++) {
        const char = clean[i]
        const next = clean[i + 1]

        if (inString === null && char === '/' && next === '*') {
            inComment = true
            buffer += '/*'
            i++
            continue
        }
        if (inComment) {
            buffer += char
            if (char === '*' && next === '/') {
                inComment = false
                buffer += '/'
                i++
            }
            continue
        }

        if (char === '"' || char === "'") {
            if (inString === char) {
                inString = null
            } else if (inString === null) {
                inString = char
            }
            buffer += char
            continue
        }
        if (inString !== null) {
            buffer += char
            continue
        }

        if (char === '(') {
            parenDepth++
            buffer += char
            continue
        }
        if (char === ')') {
            parenDepth = Math.max(0, parenDepth - 1)
            buffer += char
            continue
        }

        if (parenDepth === 0) {
            if (char === '{') {
                const trimmed = buffer.trim()
                if (trimmed !== '') {
                    result += (result.endsWith('\n') || result === '' ? '' : '\n') +
                        INDENT.repeat(indent) + trimmed + ' {\n'
                } else {
                    result += ' {\n'
                }
                buffer = ''
                indent++
                continue
            }
            if (char === '}') {
                const trimmed = buffer.trim()
                if (trimmed !== '') {
                    result += INDENT.repeat(indent) + trimmed + (trimmed.endsWith(';') ? '' : ';') + '\n'
                }
                buffer = ''
                indent = Math.max(0, indent - 1)
                result += INDENT.repeat(indent) + '}\n\n'
                continue
            }
            if (char === ';') {
                const trimmed = buffer.trim()
                if (trimmed !== '') {
                    result += INDENT.repeat(indent) + trimmed + ';\n'
                }
                buffer = ''
                continue
            }
        }

        buffer += char
    }

    const remaining = buffer.trim()
    if (remaining !== '') {
        result += INDENT.repeat(indent) + remaining + '\n'
    }

    return result.replace(/\n{3,}/g, '\n\n').trim()
}

/**
 * Pretty-prints JSON with 4-space indent.
 * Throws `SyntaxError` on invalid input — callers keep the original text.
 */
export function formatJson(source: string): string {
    return JSON.stringify(JSON.parse(source), null, 4)
}

const VOID_ELEMENTS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'source', 'track', 'wbr'
])

const INLINE_ELEMENTS = new Set([
    'a', 'abbr', 'b', 'bdi', 'bdo', 'button', 'cite', 'code', 'data', 'dfn',
    'em', 'i', 'kbd', 'label', 'mark', 'option', 'output', 'q', 's', 'samp',
    'select', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var'
])

const tagNameOf = (tag: string): string =>
    (/^<\/?([a-zA-Z][^\s/>]*)/.exec(tag)?.[1] ?? '').toLowerCase()

/**
 * Pretty-prints simple sample markup: block elements get their own lines,
 * `<tag>text</tag>` stays compact, comments and raw text are preserved.
 * Fault-tolerant by design — unbalanced tags are kept verbatim, nothing is
 * dropped. Dev-tool grade, not a spec-compliant serializer.
 */
export function formatHtml(source: string): string {
    const clean = source.replace(/\r\n/g, '\n')
    if (clean.trim().length === 0) {
        return ''
    }
    const tokens = clean.match(/<!--[\s\S]*?-->|<![^>]*>|<\/?[a-zA-Z][^<>]*>|[^<]+/g) ?? []
    const lines: string[] = []
    let indent = 0
    let inlineDepth = 0
    let i = 0
    while (i < tokens.length) {
        const token = tokens[i] as string
        if (token.startsWith('<!--') || token.startsWith('<!')) {
            lines.push(INDENT.repeat(indent) + token.trim())
            i++
            continue
        }
        if (token.startsWith('</')) {
            if (inlineDepth > 0) {
                inlineDepth--
            } else {
                indent = Math.max(0, indent - 1)
            }
            lines.push(INDENT.repeat(indent) + token.trim())
            i++
            continue
        }
        if (token.startsWith('<')) {
            const name = tagNameOf(token)
            const selfClosing = token.endsWith('/>') || VOID_ELEMENTS.has(name)
            const text = tokens[i + 1]
            const close = tokens[i + 2]
            if (!selfClosing && text !== undefined && !text.startsWith('<') &&
                close !== undefined && close.startsWith('</') && tagNameOf(close) === name) {
                lines.push(INDENT.repeat(indent) + `${token.trim()}${text.trim()}${close.trim()}`)
                i += 3
                continue
            }
            if (INLINE_ELEMENTS.has(name)) {
                const prev = lines[lines.length - 1]
                if (prev !== undefined && !prev.endsWith('>') && prev.trim().length > 0) {
                    lines[lines.length - 1] = `${prev} ${token.trim()}`
                } else {
                    lines.push(INDENT.repeat(indent) + token.trim())
                }
                if (!selfClosing) {
                    inlineDepth++
                }
                i++
                continue
            }
            lines.push(INDENT.repeat(indent) + token.trim())
            if (!selfClosing) {
                indent++
            }
            i++
            continue
        }
        const collapsed = token.replace(/\s+/g, ' ').trim()
        if (collapsed.length > 0) {
            const prev = lines[lines.length - 1]
            if (prev !== undefined && !prev.endsWith('>') && prev.trim().length > 0) {
                lines[lines.length - 1] = `${prev} ${collapsed}`
            } else {
                lines.push(INDENT.repeat(indent) + collapsed)
            }
        }
        i++
    }
    return lines.join('\n')
}

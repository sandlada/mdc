/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Marked-file orchestration for the pre-build plugin. For a `*.style.ts`
 * file containing exactly one `css` literal with the style marker:
 *
 *   1. Detect the call shape — direct `createStyleSheet(Def)(() => css`…`)`
 *      or composed tables `flow(withState({...}), withVariant({...}))(emptyTables)`
 *      with `createStyleSheet(tables)(Def)(() => css`…`)`.
 *   2. Resolve the definition import (relative paths only in MVP) and load
 *      the live definition object via the VM loader.
 *   3. Compile the literal body with `compileStateSheet` and splice the
 *      compiled CSS back, swapping the marker for the compiled marker.
 *
 * Anything outside the two shapes (multiple marked literals, non-relative
 * definition imports, non-literal triggers) throws fail-fast: silently
 * passing uncompiled `@state` / nesting downstream would re-trigger the
 * `clean-css` crash this plugin exists to prevent.
 */

import * as path from 'node:path'
import { compileStateSheet } from '../compiler/compile-state-sheet'
import { loadDefinition } from './definition-loader'
import { COMPILED_MARKER, extractMarkedCssLiterals } from './markers'

export interface MarkedFileInput {
    readonly id: string
    readonly code: string
    readonly marker: string
}

export interface MarkedFileOutput {
    readonly changed: boolean
    readonly code: string
}

export interface CompileMarkedDeps {
    readonly load: (exportName: string) => (entryPath: string) => Promise<{ definition: Record<string, unknown> }>
    readonly compile: typeof compileStateSheet
}

const defaultDeps: CompileMarkedDeps = { load: loadDefinition, compile: compileStateSheet }

const DIRECT_RE = /createStyleSheet\s*\(\s*([A-Za-z0-9_$]+)\s*\)\s*\(\s*\(\s*\)\s*=>\s*css`/

const TABLES_DEF_RE = /\)\s*\(\s*([A-Za-z0-9_$]+)\s*\)\s*\(\s*\(\s*\)\s*=>\s*css`/

const FLOW_STATE_RE = /withState\s*\(\s*\{/

const FLOW_VARIANT_RE = /withVariant\s*\(\s*\{/

const IMPORT_RE = (defName: string) =>
    new RegExp(`import\\s*\\{[^}]*\\b${defName}\\b[^}]*\\}\\s*from\\s*['"]([^'"]+)['"]`)

export const findDefinitionImport = (defName: string) => (code: string): string | null => {
    const match = IMPORT_RE(defName).exec(code)
    return match ? match[1] : null
}

export const extractBalancedBody = (code: string, openIndex: number): string | null => {
    if (code[openIndex] !== '{') return null
    let depth = 0
    let i = openIndex
    while (i < code.length) {
        const ch = code[i]
        if (ch === "'" || ch === '"' || ch === '`') {
            i = skipString(code, i)
            continue
        }
        if (ch === '{') depth += 1
        else if (ch === '}') {
            depth -= 1
            if (depth === 0) return code.slice(openIndex, i + 1)
        }
        i += 1
    }
    return null
}

const skipString = (code: string, from: number): number => {
    const quote = code[from]
    let i = from + 1
    while (i < code.length) {
        if (code[i] === '\\') {
            i += 2
            continue
        }
        if (code[i] === quote) return i + 1
        i += 1
    }
    return i
}

export interface FlowTablesSource {
    readonly states: string | null
    readonly variants: string | null
}

const extractFlowMapping = (pattern: RegExp) => (code: string): string | null => {
    const match = pattern.exec(code)
    if (!match) return null
    const openIndex = code.indexOf('{', match.index + match[0].length - 1)
    if (openIndex === -1) return null
    return extractBalancedBody(code, openIndex)
}

/**
 * Extracts inline `withState({...})` / `withVariant({...})` bodies from a
 * `flow(...)` composed-tables file. Either side may be absent (null).
 */
export const extractTablesSource = (code: string): FlowTablesSource => ({
    states: extractFlowMapping(FLOW_STATE_RE)(code),
    variants: extractFlowMapping(FLOW_VARIANT_RE)(code)
})

export const evaluateTablesMapping = (source: string) => (id: string): Record<string, string> => {
    let value: unknown
    try {
        value = new Function(`return (${source})`)()
    } catch (error) {
        throw new Error(`[mdc-styles] ${id}: tables mapping is not statically evaluable: ${String(error)}`)
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`[mdc-styles] ${id}: tables mapping must be a plain object literal`)
    }
    for (const [key, val] of Object.entries(value)) {
        if (val === null || val === undefined) continue
        if (typeof val !== 'string') {
            throw new Error(`[mdc-styles] ${id}: tables mapping key '${key}' must be a string selector`)
        }
    }
    return value as Record<string, string>
}

export const compileMarkedFile = (deps: CompileMarkedDeps = defaultDeps) => async (input: MarkedFileInput): Promise<MarkedFileOutput> => {
    const { id, code, marker } = input
    const literals = extractMarkedCssLiterals(marker)(code)
    if (literals.length === 0) return { changed: false, code }
    if (literals.length > 1) {
        throw new Error(`[mdc-styles] ${id}: expected exactly one marked css literal, found ${literals.length}`)
    }
    const literal = literals[0]

    const direct = DIRECT_RE.exec(code)
    const viaTables = direct ? null : TABLES_DEF_RE.exec(code)
    const tablesSource = extractTablesSource(code)
    const hasTables = tablesSource.states !== null || tablesSource.variants !== null
    const defName = direct ? direct[1] : viaTables ? viaTables[1] : null
    if (!defName || (!direct && !hasTables)) {
        throw new Error(`[mdc-styles] ${id}: unsupported shape; expected createStyleSheet(Def)(() => css\`...\`) or flow(withState({...}), withVariant({...}))(emptyTables) with createStyleSheet(tables)(Def)(() => css\`...\`)`)
    }

    const specifier = findDefinitionImport(defName)(code)
    if (!specifier) {
        throw new Error(`[mdc-styles] ${id}: cannot find import for definition ${defName}`)
    }
    if (!specifier.startsWith('.')) {
        throw new Error(`[mdc-styles] ${id}: non-relative definition imports are not supported in MVP: ${specifier}`)
    }
    const defPath = path.resolve(path.dirname(id), specifier)

    const { definition } = await deps.load(defName)(defPath)
    const body = literal.body.split(marker).join('')
    const compiled = hasTables
        ? deps.compile(definition, body, {
            tables: {
                states: tablesSource.states ? evaluateTablesMapping(tablesSource.states)(id) : {},
                variants: tablesSource.variants ? evaluateTablesMapping(tablesSource.variants)(id) : {}
            }
        })
        : deps.compile(definition, body)

    const replacement = `\n/* ${COMPILED_MARKER} */\n${compiled}\n`
    return {
        changed: true,
        code: code.slice(0, literal.bodyStart) + replacement + code.slice(literal.bodyEnd),
    }
}

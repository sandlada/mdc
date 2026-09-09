/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { resolveState, type TriggerTables } from '../../triggers/tables'
import type { StateSchema } from '../../define-schema'
import type { StateDimensionItem } from '../rewrite-state-variables'
import { mergeHoistedRules } from '../merge-hoisted-rules'
import type { AtRulesCompilerContext } from '../compile-at-rules-sheet'
import type { AtRuleHandlerResult } from '../at-rules/at-rule-handler'
import { handleIsolationBlock, isIsolationHeader } from '../at-rules/transform-isolation'
import { handleVariantBlock } from '../at-rules/transform-variant'
import { handleWhenBlock } from '../at-rules/transform-when'
import { handleStateBlock } from '../at-rules/transform-state'
import { handleDeclaration, handleStandardRule } from '../at-rules/transform-rule'
import { stripComments } from '../strip-comments'

export interface ParsedStatement {
    readonly type: 'decl' | 'block'
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

        if (ch === '{') depth++
        else if (ch === '}') {
            depth--
            if (depth === 0) return i
        }
    }
    return css.length
}

export function parseStatements(css: string): ParsedStatement[] {
    const source = css.includes('/*') || css.includes('//') ? stripComments(css) : css
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
        let delimType: ';' | '{' | null = null
        let delimIdx = -1

        for (let j = i; j < len; j++) {
            const ch = source[j]
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

            if (ch === '(') parenDepth++
            else if (ch === ')') {
                if (parenDepth > 0) parenDepth--
            } else if (ch === '[') bracketDepth++
            else if (ch === ']') {
                if (bracketDepth > 0) bracketDepth--
            }

            if (parenDepth === 0 && bracketDepth === 0) {
                if (ch === ';') {
                    delimType = ';'
                    delimIdx = j
                    break
                }
                if (ch === '{') {
                    delimType = '{'
                    delimIdx = j
                    break
                }
            }
        }

        if (!delimType) {
            const chunk = source.slice(i).trim()
            if (chunk) {
                const colonIdx = chunk.indexOf(':')
                if (colonIdx !== -1) {
                    statements.push({
                        type: 'decl',
                        property: chunk.slice(0, colonIdx).trim(),
                        value: chunk.slice(colonIdx + 1).trim()
                    })
                }
            }
            break
        }

        if (delimType === ';') {
            const chunk = source.slice(i, delimIdx).trim()
            if (chunk) {
                const colonIdx = chunk.indexOf(':')
                if (colonIdx !== -1) {
                    statements.push({
                        type: 'decl',
                        property: chunk.slice(0, colonIdx).trim(),
                        value: chunk.slice(colonIdx + 1).trim()
                    })
                }
            }
            i = delimIdx + 1
            continue
        }

        if (delimType === '{') {
            const header = source.slice(i, delimIdx).trim()
            const closeIdx = findMatchingBrace(source, delimIdx)
            const body = source.slice(delimIdx + 1, closeIdx).trim()
            statements.push({
                type: 'block',
                header,
                body
            })
            i = closeIdx + 1
            continue
        }
    }

    return statements
}

/**
 * Removed legacy-engine DSL. Matches only at block-header position with a strict
 * word boundary, mirroring the `@state` / `@variant` / `@when` dispatcher guards.
 * `@slotted` is listed separately because the `@slot` boundary does not match it.
 */
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

export function resolveStateModifiers(
    definition: any,
    tables: TriggerTables
): { states: StateDimensionItem[] | StateDimensionItem[][]; isCombo: boolean; schema?: StateSchema<any> } {
    let schema: StateSchema<any> | undefined = definition?.schema
    if (!schema && Array.isArray(definition)) {
        for (const item of definition) {
            if (item?.schema) {
                schema = item.schema
                break
            }
        }
    }
    if (!schema && typeof definition === 'object' && definition !== null) {
        for (const val of Object.values(definition)) {
            if (val && typeof val === 'object' && (val as any).schema) {
                schema = (val as any).schema
                break
            }
        }
    }

    if (schema?.dimensions && schema.dimensions.length > 1) {
        // Cartesian combo
        const combos = schema.validCombinations as readonly (readonly string[])[]
        const comboItems: StateDimensionItem[][] = []

        for (const combo of combos) {
            const items: StateDimensionItem[] = []
            for (const sName of combo) {
                const resolved = resolveState(sName, { anchor: '', isHostAnchor: false })(tables)
                items.push({
                    name: sName,
                    modifier: resolved.modifier,
                    target: resolved.target
                })
            }
            comboItems.push(items)
        }
        return { states: comboItems, isCombo: true, schema }
    }

    const stateNames: string[] = schema?.states ? [...schema.states] : []
    if (stateNames.length === 0) {
        return {
            states: [
                { name: 'enabled', modifier: '', target: 'self' }
            ],
            isCombo: false,
            schema
        }
    }

    const singleItems: StateDimensionItem[] = stateNames.map((sName) => {
        const resolved = resolveState(sName, { anchor: '', isHostAnchor: false })(tables)
        return {
            name: sName,
            modifier: resolved.modifier,
            target: resolved.target
        }
    })

    return { states: singleItems, isCombo: false, schema }
}

export function transformStatements(
    statements: readonly ParsedStatement[],
    ctx: AtRulesCompilerContext
): TransformResult {
    const baseParts: string[] = []
    const hoistedParts: string[] = []

    for (const stmt of statements) {
        if (stmt.type === 'decl') {
            const decl = handleDeclaration(stmt, ctx)
            if (decl) {
                baseParts.push(decl)
            }
            continue
        }

        if (stmt.type === 'block') {
            const header = stmt.header!
            const body = stmt.body!

            if (isLegacyHeader(header)) {
                if (ctx.options?.onWarn) {
                    ctx.options.onWarn({
                        type: 'invalid-legacy-syntax',
                        message: `Legacy at-rule "${header}" was removed with the legacy engine and is dropped.`
                    })
                }
                // [D] 已移除 DSL：一律丟棄整塊，不透傳、不展開。
                continue
            }

            let result: AtRuleHandlerResult
            if (isIsolationHeader(header)) {
                result = handleIsolationBlock(header, body, ctx, transformStatements)
            } else if (/^@variant(?![a-zA-Z0-9_-])/.test(header)) {
                result = handleVariantBlock(header, body, ctx, transformStatements)
            } else if (/^@when(?![a-zA-Z0-9_-])/.test(header)) {
                result = handleWhenBlock(header, body, ctx, transformStatements)
            } else if (/^@state(?![a-zA-Z0-9_-])/.test(header)) {
                result = handleStateBlock(header, body, ctx, transformStatements)
            } else {
                result = handleStandardRule(header, body, ctx, transformStatements)
            }

            if (result.base !== undefined) {
                baseParts.push(result.base)
            }
            if (result.hoisted !== undefined && result.hoisted.length > 0) {
                hoistedParts.push(...result.hoisted)
            }
        }
    }

    return {
        baseRules: baseParts.filter(Boolean),
        hoistedRules: mergeHoistedRules(hoistedParts.filter(Boolean))
    }
}

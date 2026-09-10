/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * `@variant` handler (V1–V3): exact-name list validation and shell generation.
 */

import type { AtRulesCompilerContext } from '../compile-at-rules-sheet'
import { emptyTables, resolveVariant } from '../../schema'
import { splitSelectorByComma } from '../compose-state-selector'
import { extractAtRuleParams } from '../extract-at-rule-params'
import { formatRule, parseStatements, type ParsedStatement } from './at-rules-transformer'
import type { AtRuleHandlerResult, Recurse } from './at-rule-handler'

export const hasNestedVariant = (stmts: readonly ParsedStatement[]): boolean => {
    for (const stmt of stmts) {
        if (stmt.type === 'block' && stmt.header) {
            const trimmed = stmt.header.trim()
            if (/^@variant(?![a-zA-Z0-9_-])/.test(trimmed)) {
                return true
            }
            if (stmt.body && hasNestedVariant(parseStatements(stmt.body))) {
                return true
            }
        }
    }
    return false
}

export function handleVariantBlock(
    header: string,
    body: string,
    ctx: AtRulesCompilerContext,
    recurse: Recurse
): AtRuleHandlerResult {
    if (ctx.variantSelector !== undefined) {
        if (ctx.options?.onWarn) {
            ctx.options.onWarn({
                type: 'nested-variant',
                message: 'Nested @variant at-rules are not supported.'
            })
        }
        return {}
    }
    const extracted = extractAtRuleParams(header, '@variant')
    if (!extracted || !extracted.param) {
        if (ctx.options?.onWarn) {
            ctx.options.onWarn({
                type: 'invalid-variant',
                message: `Invalid @variant syntax: "${header}".`
            })
        }
        // [D] 截斷 / 無參數表頭屬無效 DSL：丟棄整塊，不外洩 @variant 包裝。
        return {}
    }

    const rawParam = extracted.param
    const variantNames = splitSelectorByComma(rawParam)
        .map((v) => v.trim())
        .filter(Boolean)

    if (variantNames.length === 0) {
        if (ctx.options?.onWarn) {
            ctx.options.onWarn({
                type: 'invalid-variant',
                message: `Empty @variant name list: "${header}".`
            })
        }
        // [D] 空名單屬無效 DSL：丟棄整塊，不輸出空殼。
        return {}
    }

    if (variantNames.some((v) => v === '*' || v.startsWith('!'))) {
        if (ctx.options?.onWarn) {
            ctx.options.onWarn({
                type: 'invalid-variant-name',
                message: `Wildcards and negations are not supported in @variant: "${rawParam}".`
            })
        }
        // [D] 通配 / 否定屬非法名單：丟棄整塊並直接返回，避免再落入字典
        // 查找二次 warn（BUG-05：`unknown-variant` 不應重複觸發）。
        return {}
    }

    const tables = ctx.tables ?? emptyTables

    const knownVariants = ctx.meta?.allVariantNames
    const variantShells: string[] = []
    for (const v of variantNames) {
        if (knownVariants && knownVariants.length > 0 && !knownVariants.includes(v)) {
            if (ctx.options?.onWarn) {
                ctx.options.onWarn({
                    type: 'unknown-variant',
                    message: `Unknown variant "${v}" in @variant: "${rawParam}".`
                })
            }
            // [D] 字典缺 key：丢弃整块。
            return {}
        }
        const selector = resolveVariant(v)(tables)
        if (!selector) {
            if (ctx.options?.onWarn) {
                ctx.options.onWarn({
                    type: 'unknown-variant',
                    message: `Unmapped variant "${v}" in @variant: "${rawParam}".`
                })
            }
            // [D] registry 无映射：丢弃整块，不回退默认。
            return {}
        }
        variantShells.push(selector)
    }
    const variantShell = variantShells.join(', ')

    const innerStmts = parseStatements(body)
    if (hasNestedVariant(innerStmts)) {
        if (ctx.options?.onWarn) {
            ctx.options.onWarn({
                type: 'nested-variant',
                message: 'Nested @variant at-rules are not supported.'
            })
        }
        // [D] 嵌套 @variant 非法丟棄整塊
        return {}
    }

    const innerCtx: AtRulesCompilerContext = {
        ...ctx,
        ancestorPath: [variantShell],
        variantSelector: variantShell
    }
    const innerRes = recurse(innerStmts, innerCtx)

    const baseContent = innerRes.baseRules.join(' ')
    return { base: formatRule(variantShell, baseContent), hoisted: innerRes.hoistedRules }
}

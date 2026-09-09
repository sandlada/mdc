/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * `@when` handler (W1–W4): host-condition validation and shell hoisting.
 */

import type { AtRulesCompilerContext } from '../compile-at-rules-sheet'
import { splitSelectorByComma } from '../compose-state-selector'
import { extractAtRuleParams } from '../extract-at-rule-params'
import { formatRule, parseStatements, type ParsedStatement } from '../internal/at-rules-transformer'
import type { AtRuleHandlerResult, Recurse } from './at-rule-handler'
import { hoistCondition, isHostMountedSelector } from './hoist-helpers'

export const hasNestedWhen = (stmts: readonly ParsedStatement[]): boolean => {
    for (const stmt of stmts) {
        if (stmt.type === 'block' && stmt.header) {
            const trimmed = stmt.header.trim()
            if (/^@when(?![a-zA-Z0-9_-])/.test(trimmed)) {
                return true
            }
            if (stmt.body && hasNestedWhen(parseStatements(stmt.body))) {
                return true
            }
        }
    }
    return false
}

export function handleWhenBlock(
    header: string,
    body: string,
    ctx: AtRulesCompilerContext,
    recurse: Recurse
): AtRuleHandlerResult {
    const extracted = extractAtRuleParams(header, '@when')
    if (!extracted || !extracted.param) {
        if (ctx.options?.onWarn) {
            ctx.options.onWarn({
                type: 'invalid-when',
                message: `Invalid @when syntax: "${header}".`
            })
        }
        // [D] 截斷 / 無參數表頭屬無效 DSL：丟棄整塊，不外洩 @when 包裝。
        return {}
    }

    const rawParam = extracted.param
    const whenConditions = splitSelectorByComma(rawParam)
        .map((c) => c.trim())
        .filter(Boolean)

    if (whenConditions.length === 0) {
        if (ctx.options?.onWarn) {
            ctx.options.onWarn({
                type: 'invalid-when',
                message: `Empty @when condition list: "${header}".`
            })
        }
        // [D] 空條件屬無效 DSL：丟棄整塊，不展開為空殼。
        return {}
    }

    const whenConditionSelector = whenConditions.join(', ')

    // BUG-06: host 先驗與 `transform-state` 內嵌 `@when` 一致（host 先於嵌套）。
    // 非 host 掛載與嵌套並存時報 `invalid-when-condition`，不再被 `nested-when` 搶先。
    if (!whenConditions.every(isHostMountedSelector)) {
        if (ctx.options?.onWarn) {
            ctx.options.onWarn({
                type: 'invalid-when-condition',
                message: `@when condition "${rawParam}" must be mounted on :host.`
            })
        }
        // [D] 非 host 掛載一律丟棄整塊，不外洩 @when 包裝。
        return {}
    }

    const innerStmts = parseStatements(body)
    if (hasNestedWhen(innerStmts)) {
        if (ctx.options?.onWarn) {
            ctx.options.onWarn({
                type: 'nested-when',
                message: 'Nested @when at-rules are not supported.'
            })
        }
        // [D] 嵌套 @when 非法丟棄整塊
        return {}
    }

    const innerRes = recurse(innerStmts, {
        ...ctx,
        ancestorPath: []
    })
    const whenContent = innerRes.baseRules.join(' ')

    if (ctx.ancestorPath.length === 0) {
        return { base: formatRule(whenConditionSelector, whenContent) }
    }

    return { hoisted: [hoistCondition(ctx.variantSelector, ctx.ancestorPath, whenConditionSelector, whenContent)] }
}

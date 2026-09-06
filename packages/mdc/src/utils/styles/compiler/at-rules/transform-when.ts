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
import { formatRule, parseStatements } from '../internal/at-rules-transformer'
import type { AtRuleHandlerResult, Recurse } from './at-rule-handler'
import { hoistCondition } from './hoist-helpers'

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
        return { base: formatRule(header, body) }
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
        return { base: formatRule(header, body) }
    }

    const hasHost = whenConditions.some(
        (c) =>
            c.startsWith(':host') ||
            c.startsWith(':where(:host') ||
            c.startsWith(':is(:host')
    )

    const whenConditionSelector = whenConditions.join(', ')
    const innerStmts = parseStatements(body)
    const innerRes = recurse(innerStmts, {
        ...ctx,
        ancestorPath: []
    })
    const whenContent = innerRes.baseRules.join(' ')

    if (!hasHost) {
        if (ctx.options?.onWarn) {
            ctx.options.onWarn({
                type: 'invalid-when-condition',
                message: `@when condition "${rawParam}" must explicitly contain :host.`
            })
        }
        return { base: formatRule(whenConditionSelector, whenContent) }
    }

    if (ctx.ancestorPath.length === 0) {
        return { base: formatRule(whenConditionSelector, whenContent) }
    }

    return { hoisted: [hoistCondition(ctx.variantSelector, ctx.ancestorPath, whenConditionSelector, whenContent)] }
}

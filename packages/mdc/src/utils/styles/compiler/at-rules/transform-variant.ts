/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * `@variant` handler (V1–V3): exact-name list validation and shell generation.
 */

import type { AtRulesCompilerContext } from '../compile-at-rules-sheet'
import { splitSelectorByComma } from '../compose-state-selector'
import { extractAtRuleParams } from '../extract-at-rule-params'
import { formatRule, parseStatements } from '../internal/at-rules-transformer'
import type { AtRuleHandlerResult, Recurse } from './at-rule-handler'

export function handleVariantBlock(
    header: string,
    body: string,
    ctx: AtRulesCompilerContext,
    recurse: Recurse
): AtRuleHandlerResult {
    const extracted = extractAtRuleParams(header, '@variant')
    if (!extracted || !extracted.param) {
        if (ctx.options?.onWarn) {
            ctx.options.onWarn({
                type: 'invalid-variant',
                message: `Invalid @variant syntax: "${header}".`
            })
        }
        return { base: formatRule(header, body) }
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
        return { base: formatRule(header, body) }
    }

    if (variantNames.some((v) => v === '*' || v.startsWith('!'))) {
        if (ctx.options?.onWarn) {
            ctx.options.onWarn({
                type: 'invalid-variant-name',
                message: `Wildcards and negations are not supported in @variant: "${rawParam}".`
            })
        }
    }

    const selectorFn = ctx.options?.variantSelector ?? ((v: string) => `:host([variant="${v}"])`)
    const variantShell = variantNames.map((v) => selectorFn(v)).join(', ')

    const innerStmts = parseStatements(body)
    const innerCtx: AtRulesCompilerContext = {
        ...ctx,
        ancestorPath: [variantShell],
        variantSelector: variantShell
    }
    const innerRes = recurse(innerStmts, innerCtx)

    const baseContent = innerRes.baseRules.join(' ')
    return { base: formatRule(variantShell, baseContent), hoisted: innerRes.hoistedRules }
}

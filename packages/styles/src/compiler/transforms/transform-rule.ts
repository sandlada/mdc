/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * Standard-rule handler: plain CSS declarations (with property-macro
 * expansion and state-variable rewriting) and nested rule blocks.
 */

import type { AtRulesCompilerContext } from '../sheet'
import { expandDeclaration } from '../declarations'
import { formatRule, parseStatements, type ParsedStatement } from '../internal/primitives'
import { rewriteStateVariables } from './rewrite-state-variables'
import type { AtRuleHandlerResult, Recurse } from './at-rule-handler'
import { isHostRootSelector, toAmpersandRelative } from '../hoist'

export function handleDeclaration(
    statement: ParsedStatement,
    ctx: AtRulesCompilerContext
): string | null {
    const expanded = expandDeclaration(statement.property!, statement.value!)
    if (ctx.currentStates && ctx.currentStates.length > 0 && ctx.meta) {
        const rawDecls = expanded.split(';').map(d => d.trim()).filter(Boolean)
        const validDecls: string[] = []
        for (const singleDecl of rawDecls) {
            const varMatches = [...singleDecl.matchAll(/var\(\s*--_([a-zA-Z0-9_-]+)/g)]
            let isMissingStateToken = false
            for (const m of varMatches) {
                const tokenName = m[1]
                if (ctx.meta.isStateToken(tokenName)) {
                    const hasInAnyState = ctx.currentStates.some(s => ctx.meta!.hasStateToken(tokenName, s))
                    if (!hasInAnyState) {
                        isMissingStateToken = true
                        break
                    }
                }
            }
            if (!isMissingStateToken) {
                validDecls.push(rewriteStateVariables(singleDecl, ctx.currentStates, ctx.meta) + ';')
            }
        }
        if (validDecls.length > 0) {
            return validDecls.join(' ')
        }
        return null
    }
    return expanded
}

export function handleStandardRule(
    header: string,
    body: string,
    ctx: AtRulesCompilerContext,
    recurse: Recurse
): AtRuleHandlerResult {
    const innerStmts = parseStatements(body)
    const innerCtx: AtRulesCompilerContext = {
        ...ctx,
        ancestorPath: [...ctx.ancestorPath, header]
    }
    const innerRes = recurse(innerStmts, innerCtx)

    const baseContent = innerRes.baseRules.join(' ')
    if (ctx.variantSelector !== undefined && ctx.ancestorPath.length === 1 && isHostRootSelector(header)) {
        const relative = toAmpersandRelative(header)
        if (relative !== null) {
            if (!relative) {
                return { base: baseContent, hoisted: innerRes.hoistedRules }
            }
            return { base: formatRule(relative, baseContent), hoisted: innerRes.hoistedRules }
        }
    }
    return { base: formatRule(header, baseContent), hoisted: innerRes.hoistedRules }
}

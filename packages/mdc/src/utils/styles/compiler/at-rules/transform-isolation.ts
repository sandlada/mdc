/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * Isolation-container handler: `@layer`, `@media`, `@supports`, `@scope`.
 * Pass-through recursion preserving the container as hoisting boundary.
 */

import type { AtRulesCompilerContext } from '../compile-at-rules-sheet'
import { formatRule, parseStatements } from '../internal/at-rules-transformer'
import type { AtRuleHandlerResult, Recurse } from './at-rule-handler'

export function isIsolationHeader(header: string): boolean {
    return header.startsWith('@layer')
        || header.startsWith('@media')
        || header.startsWith('@supports')
        || header.startsWith('@scope')
}

export function handleIsolationBlock(
    header: string,
    body: string,
    ctx: AtRulesCompilerContext,
    recurse: Recurse
): AtRuleHandlerResult {
    const innerStmts = parseStatements(body)
    const innerCtx: AtRulesCompilerContext = {
        ...ctx,
        ancestorPath: [...ctx.ancestorPath],
        isolationContainer: header
    }
    const innerRes = recurse(innerStmts, innerCtx)
    const innerCombined = [...innerRes.baseRules, ...innerRes.hoistedRules].join(' ')
    return { base: formatRule(header, innerCombined) }
}

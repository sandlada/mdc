/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * Isolation-container handler: `@layer`, `@media`, `@supports`, `@scope`, `@container`.
 * Preserves the container as a hoisting boundary.
 */

import type { AtRulesCompilerContext } from '../sheet'
import { formatRule, parseStatements } from '../internal/primitives'
import type { AtRuleHandlerResult, Recurse } from './at-rule-handler'

export function isIsolationHeader(header: string): boolean {
    return /^@(layer|media|supports|scope|container)(?![a-zA-Z0-9_-])/.test(header)
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

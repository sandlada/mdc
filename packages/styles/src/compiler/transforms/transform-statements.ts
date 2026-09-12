/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { handleIsolationBlock, isIsolationHeader } from './transform-isolation'
import { handleVariantBlock } from './transform-variant'
import { handleWhenBlock } from './transform-when'
import { handleStateBlock } from './transform-state'
import { handleDeclaration, handleStandardRule } from './transform-rule'
import {
    isLegacyHeader,
    type ParsedStatement,
    type TransformResult
} from '../internal/primitives'
import { mergeHoistedRules } from '../hoist'
import type { AtRulesCompilerContext } from '../sheet'
import type { AtRuleHandlerResult } from './at-rule-handler'

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

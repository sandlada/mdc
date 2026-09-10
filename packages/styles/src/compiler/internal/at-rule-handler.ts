/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { AtRulesCompilerContext } from '../compile-at-rules-sheet'
import type { ParsedStatement, TransformResult } from './at-rules-transformer'

/**
 * Recursive entry invoked by handlers for nested statement lists.
 * Handlers receive the dispatcher through this parameter and must never
 * import the dispatcher module directly (avoids runtime import cycles).
 */
export type Recurse = (
    statements: readonly ParsedStatement[],
    ctx: AtRulesCompilerContext
) => TransformResult

export interface AtRuleHandlerResult {
    readonly base?: string
    readonly hoisted?: readonly string[]
}

/**
 * Contract for single-at-rule handlers: one file per at-rule.
 * Pure string transformation; pushing into base/hoisted accumulators
 * stays the dispatcher's responsibility.
 */
export type AtRuleHandler = (
    header: string,
    body: string,
    ctx: AtRulesCompilerContext,
    recurse: Recurse
) => AtRuleHandlerResult

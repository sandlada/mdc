/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { AtRulesCompilerContext } from '../sheet'
import type { ParsedStatement, TransformResult } from '../internal/primitives'

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

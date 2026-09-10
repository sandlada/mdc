/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { TriggerTables } from '../schema'
import { compileAtRulesSheet } from './compile-at-rules-sheet'

export interface StyleDiagnosticWarning {
    readonly type: 'unknown-variant' | string
    readonly message: string
    readonly token?: string
    readonly variant?: string
    readonly variants?: readonly string[]
    readonly missingVariants?: readonly string[]
    readonly ruleSelector?: string
}

export interface CompileStateSheetOptions {
    readonly tables?: TriggerTables
    readonly variantSelector?: (variantName: string) => string
    readonly onWarn?: (warning: StyleDiagnosticWarning) => void
}

/**
 * Compiles an MDC CSS template string with ATRules and state awareness into standard CSS.
 *
 * Single-engine entrypoint: every stylesheet is compiled by the At-Rules compiler
 * (`compileAtRulesSheet`; semantics Oracle: `at-rules/` specs). There is no legacy
 * engine and no routing. Removed DSL (`@anchor`, `@slot`, `@slotted`, `@size`,
 * `@elevation`, wildcard / negated `@variant`) is rejected fail-fast as `[D]`
 * (dropped with a warning) by the At-Rules dispatcher.
 *
 * @param definition - Component style definition containing StateSchema and token mappings.
 * @param cssText - Raw stylesheet template string with `@state`, exact-name `@variant`,
 * `@when(:host(...))`, property expanders and a11y macros.
 * @param options - Compilation options including TriggerTables.
 * @returns Formatted standard CSS string.
 *
 * @example
 * ```typescript
 * import { compileStateSheet } from '@sandlada/styles/compiler'
 * import { emptyTables, flow, withState } from '@sandlada/styles/triggers'
 * import { ButtonDefinition } from './button.definition'
 *
 * const tables = flow(
 *     withState({ 'enabled': '', 'selected': '[selected]' })
 * )(emptyTables)
 *
 * // New @state system:
 * const compiled = compileStateSheet(ButtonDefinition, `
 *     @state(button) button {
 *         background-color: var(--_container-color);
 *         .label { color: var(--_label-color); }
 *     }
 * `, { tables })
 * ```
 */
export function compileStateSheet(
    definition: Record<string, any>,
    cssText: string,
    options?: CompileStateSheetOptions
): string {
    if (!cssText || typeof cssText !== 'string' || cssText.trim().length === 0) {
        return ''
    }

    return compileAtRulesSheet(definition, cssText, options)
}

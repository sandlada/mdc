/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { StateTriggerRegistry, type StateTrigger } from '../triggers'
import type { VariantTriggerRegistry } from '../triggers'
import { extractStateTokenMetadata } from './extract-state-token-metadata'
import { stripComments } from './strip-comments'
import { isAtRulesStylesheet, hasDefiniteAtRules } from './is-at-rules-stylesheet'
import { compileAtRulesSheet } from './compile-at-rules-sheet'
import { parseCssRecursive, compileAstNodes } from './internal/ast-compiler'

export type ASTNode =
    | StyleRuleNode
    | WrapperAtRuleNode
    | KeyframesNode

export interface DeclarationNode {
    readonly property: string
    readonly value: string
    readonly referencedTokens: readonly string[]
    readonly stateTokens: readonly string[]
    readonly isStateDependent: boolean
}

export interface StyleRuleNode {
    readonly type: 'style-rule' | 'rule'
    readonly anchor: string
    readonly selector: string
    readonly hostCondition?: string
    readonly whenCondition?: string
    readonly declarations: readonly DeclarationNode[]
    readonly children?: readonly ASTNode[]
    readonly elevationLevel?: number
}

export interface WrapperAtRuleNode {
    readonly type: 'wrapper-at-rule'
    readonly name?: string
    readonly params?: string
    readonly atRuleHeader: string
    readonly children: readonly ASTNode[]
}

export interface KeyframeStepNode {
    readonly selector: string
    readonly declarations: readonly DeclarationNode[]
}

export interface KeyframesNode {
    readonly type: 'keyframes'
    readonly name?: string
    readonly header: string
    readonly steps: readonly KeyframeStepNode[]
    readonly rawBody?: string
}

export interface StyleDiagnosticWarning {
    readonly type: 'missing-token-in-shared-scope' | 'missing-token-in-variant-scope' | 'unknown-variant' | string
    readonly message: string
    readonly token?: string
    readonly variant?: string
    readonly variants?: readonly string[]
    readonly missingVariants?: readonly string[]
    readonly ruleSelector?: string
}

export interface CompileStateSheetOptions {
    readonly registry?: StateTriggerRegistry
    readonly triggers?: Record<string, StateTrigger | string> | (StateTrigger | Record<string, StateTrigger | string>)[]
    readonly variantRegistry?: VariantTriggerRegistry
    readonly variantSelector?: (variantName: string) => string
    readonly onWarn?: (warning: StyleDiagnosticWarning) => void
}

/**
 * Compiles an MDC CSS template string with ATRules and state awareness into standard CSS with minimal differential rules.
 *
 * @param definition - Component style definition containing StateSchema and token mappings.
 * @param cssText - Raw stylesheet template string. New-system ATRules (`@state`,
 * `@variant` exact names, `@when(:host(...))`, property expanders, a11y macros;
 * semantics Oracle: `at-rules/` specs) route to the At-Rules compiler; stylesheets
 * containing `@anchor <sel>` / `@size` route to the legacy token-differential engine
 * (which additionally lowers `@slot` / `@slotted` / `@size` / `@elevation` and
 * wildcard `@variant`).
 * @param options - Compilation options including StateTriggerRegistry.
 * @returns Formatted standard CSS string.
 *
 * @example
 * ```typescript
 * import { compileStateSheet } from '@sandlada/styles/compiler'
 * import { mapStateTriggers } from '@sandlada/styles/triggers'
 * import { ButtonDefinition } from './button.definition'
 *
 * const triggers = mapStateTriggers({
 *     'enabled': '',
 *     'selected': '[selected]'
 * })
 *
 * // New @state system:
 * const compiled = compileStateSheet(ButtonDefinition, `
 *     @state(button) button {
 *         background-color: var(--_container-color);
 *         .label { color: var(--_label-color); }
 *     }
 * `, { registry: triggers })
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

    if (
        hasDefiniteAtRules(cssText) ||
        (!cssText.includes('@anchor') && !options?.onWarn && isAtRulesStylesheet(cssText))
    ) {
        return compileAtRulesSheet(definition, cssText, options)
    }

    const registry = options?.registry
        ? options.registry.clone()
        : new StateTriggerRegistry(options?.triggers)

    if (options?.triggers && options.registry) {
        registry.registerAll(options.triggers)
    }

    const meta = extractStateTokenMetadata(definition)
    const cleanCss = stripComments(cssText)
    const nodes = parseCssRecursive(cleanCss, meta, options)
    const chunks = compileAstNodes(nodes, meta, registry)

    const output: string[] = []
    if (chunks.base.length > 0) {
        output.push(chunks.base.join('\n\n'))
    }

    for (const [_, deltaRules] of chunks.deltas.entries()) {
        if (deltaRules.length > 0) {
            output.push(deltaRules.join('\n\n'))
        }
    }

    return output.join('\n\n')
}

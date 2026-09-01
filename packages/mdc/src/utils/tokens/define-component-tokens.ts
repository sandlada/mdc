/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { unsafeCSS, type CSSResult } from 'lit'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'

export interface DefineComponentTokensOptions {
    /**
     * The CSS variable prefix to apply to the var() references (e.g. `'--mdc-navigation-tab'`).
     */
    prefix?: string

    /**
     * Keys to expand into 4 logical corners (border-radius).
     * When `true`, auto-detects keys ending in `shape`.
     * When a string array, uses the given keys explicitly.
     */
    expandShapes?: boolean | readonly string[]

    /**
     * When `true` with `expandShapes`, each corner's `var()` also falls back to
     * the base var before the original value.
     */
    useBaseFallback?: boolean
}

/**
 * Generates CSS variable declarations for component tokens.
 * Encapsulates the `defineTokenRefsRecord -> defineVars -> unsafeCSS` pipeline.
 *
 * @param definition - Component token definition object
 * @param options - Configuration options for token refs generation
 * @returns Lit `CSSResult` containing CSS variable declarations without wrapping selector
 *
 * @example
 * ```typescript
 * const tokens = defineComponentTokens(NavigationBarVerticalTabDefinition, {
 *     prefix: '--mdc-navigation-tab',
 *     expandShapes: true,
 *     useBaseFallback: true,
 * })
 *
 * export const NavigationTabStyles = [
 *     css`:host { ${tokens} }`
 * ]
 * ```
 */
export function defineComponentTokens(
    definition: Record<string, any>,
    options?: DefineComponentTokensOptions
): CSSResult {
    if (!definition) {
        return unsafeCSS('')
    }
    const tokenRecord = defineTokenRefsRecord(definition as Record<string, string>, options as any)
    const varsArray = defineVars(tokenRecord, true)
    return unsafeCSS(varsArray.join(''))
}

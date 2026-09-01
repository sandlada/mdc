/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { unsafeCSS, type CSSResult } from 'lit'
import { FORWARDED_TOKEN_META } from './create-style-definition'

export interface DefineComponentTokenRefsOptions {
    /**
     * The CSS variable prefix of the parent component (e.g. `'--mdc-button'`).
     */
    prefix: string

    /**
     * Optional selector to wrap the CSS declarations with.
     * When provided, outputs `${selector} { ... }`.
     * When omitted, outputs direct CSS declarations string.
     */
    selector?: string
}

export type DefineComponentTokenRefsPrefixOrOptions = string | DefineComponentTokenRefsOptions

/**
 * Generates unified CSS variable declarations on component `:host`.
 *
 * Automatically handles:
 * 1. Parent private variables: `--_enabled-container-color: var(--mdc-button-enabled-container-color, fallback);`
 * 2. Forwarded child public variables (ONLY for states/tokens supported by Target Definition):
 *    e.g. `--mdc-icon-enabled-color: var(--mdc-button-enabled-icon-color, fallback);`
 */
export function defineComponentTokenRefs(
    definition: Record<string, any>,
    prefixOrOptions: DefineComponentTokenRefsPrefixOrOptions
): CSSResult {
    const prefix = typeof prefixOrOptions === 'string' ? prefixOrOptions : prefixOrOptions.prefix
    const selector = typeof prefixOrOptions === 'object' ? prefixOrOptions.selector : undefined

    const prefixNormalized = prefix.startsWith('--') ? prefix : `--${prefix}`
    const metaMap = (definition as any)?.[FORWARDED_TOKEN_META] as Map<string, any> | undefined

    const declarations: string[] = []

    for (const [key, value] of Object.entries(definition ?? {})) {
        if (value === null || value === undefined) continue

        const meta = metaMap?.get(key)
        const parentVarName = `${prefixNormalized}-${key}`

        // Always emit parent private variable for internal styling / createStyleSheet consumption
        const privateVarName = `--_${key}`
        declarations.push(`${privateVarName}: var(${parentVarName}, ${value});`)

        // If this token was forwarded to a child component, check if target definition actually supports this state
        if (meta) {
            const { targetPrefix, cleanKey, targetDefKeys } = meta
            const targetDefKeysSet = new Set(targetDefKeys || [])

            if (meta.state) {
                // If this is a state variant (e.g. 'hovered', 'enabled', 'pressed', 'hover')
                const targetStateKey = `${meta.state}-${cleanKey}`
                const targetColonKey = `${meta.state}:${cleanKey}`
                if (targetDefKeysSet.has(targetStateKey)) {
                    // Child definition actually supports this state (e.g. Ripple's hovered-color)
                    const targetVarName = `${targetPrefix}-${targetStateKey}`
                    declarations.push(`${targetVarName}: var(${parentVarName}, ${value});`)
                } else if (targetDefKeysSet.has(targetColonKey)) {
                    const targetVarName = `${targetPrefix}-${targetColonKey}`
                    declarations.push(`${targetVarName}: var(${parentVarName}, ${value});`)
                } else if (meta.state === 'enabled' && (targetDefKeysSet.has(`enabled-${cleanKey}`) || targetDefKeysSet.has(cleanKey))) {
                    // Target only defines enabled (e.g. Icon only has enabled-color), emit public bridge for enabled
                    const targetVarName = `${targetPrefix}-${targetDefKeysSet.has(`enabled-${cleanKey}`) ? `enabled-${cleanKey}` : cleanKey}`
                    declarations.push(`${targetVarName}: var(${parentVarName}, ${value});`)
                }
            } else {
                // Single value (e.g. size: '18px')
                if (targetDefKeysSet.has(`enabled-${cleanKey}`)) {
                    const targetVarName = `${targetPrefix}-enabled-${cleanKey}`
                    declarations.push(`${targetVarName}: var(${parentVarName}, ${value});`)
                } else if (targetDefKeysSet.has(cleanKey)) {
                    const targetVarName = `${targetPrefix}-${cleanKey}`
                    declarations.push(`${targetVarName}: var(${parentVarName}, ${value});`)
                }
            }
        }
    }

    const cssOutput = declarations.join(' ')

    if (!cssOutput) {
        return unsafeCSS('')
    }

    if (selector) {
        return unsafeCSS(`${selector} { ${cssOutput} }`)
    }

    return unsafeCSS(cssOutput)
}

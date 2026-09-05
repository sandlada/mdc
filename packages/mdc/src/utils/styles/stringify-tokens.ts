/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { unsafeCSS, type CSSResult } from 'lit'
import type { StateSchema } from './define-schema'
import type { ResolvedStyleDefinition, TokenValue, PrimitiveTokenValue } from './create-style-definition'

export interface StringifyTokensOptions {
    /**
     * Public CSS custom property prefix (e.g. `'--mdc-button'`).
     */
    readonly prefix: string

    /**
     * Whether to generate public override variables mapping to private variables.
     * Default: true.
     */
    readonly includePublicVars?: boolean

    /**
     * Optional CSS selector to wrap declarations with. Default: none (returns declaration block).
     */
    readonly selector?: string
}

export type StringifyPrefixOrOptions = string | StringifyTokensOptions

function normalizeOptions(prefixOrOptions: StringifyPrefixOrOptions): {
    prefix: string
    includePublicVars: boolean
    selector?: string
} {
    if (typeof prefixOrOptions === 'string') {
        const rawPrefix = prefixOrOptions.trim()
        const normalizedPrefix = rawPrefix.startsWith('--') ? rawPrefix : `--${rawPrefix}`
        return {
            prefix: normalizedPrefix.replace(/-+$/, ''),
            includePublicVars: true
        }
    }

    const { prefix = '', includePublicVars = true, selector } = prefixOrOptions ?? {}
    const rawPrefix = prefix.trim()
    const normalizedPrefix = rawPrefix.startsWith('--') ? rawPrefix : `--${rawPrefix}`
    return {
        prefix: normalizedPrefix.replace(/-+$/, ''),
        includePublicVars,
        selector
    }
}

function formatTokenValue(val: unknown): string {
    if (val === null || val === undefined) {
        return ''
    }
    if (typeof val === 'object' && val !== null) {
        if (typeof (val as any).ToCSSVariable === 'function') {
            return (val as any).ToCSSVariable()
        }
        if ('cssText' in val && typeof (val as any).cssText === 'string') {
            return (val as any).cssText
        }
        if ('rawVal' in val) {
            return formatTokenValue((val as any).rawVal)
        }
    }
    return String(val)
}

function isPlainObject(value: unknown): value is Record<string, any> {
    if (typeof value !== 'object' || value === null) {
        return false
    }
    const proto = Object.getPrototypeOf(value)
    return proto === Object.prototype || proto === null
}

const RESERVED_DEF_KEYS = new Set(['__brand', 'schema', 'tokens', 'flatTokenKeys', 'forwardedBridges'])

/**
 * Generates `:host` private (`--_*`) and public (`--mdc-<prefix>-*`) CSS custom property declarations from a token definition.
 *
 * Emits base state fallback chains (`--_enabled-<key>: var(<prefix>-enabled-<key>, var(<prefix>-<key>, <baseVal>));`),
 * delta state declarations (`--_<state>-<key>: var(<prefix>-<state>-<key>, <stateVal>);`),
 * static token properties (`--_<key>: var(<prefix>-<key>, <value>);`), and child component bridges.
 *
 * @param prefixOrOptions - Public CSS variable prefix string (e.g. `'--mdc-button'`) or configuration options.
 * @returns A curried function accepting a style definition and returning a Lit `CSSResult`.
 *
 * @example
 * ```typescript
 * import { css } from 'lit'
 * import { stringifyTokens } from '@sandlada/mdc/utils/styles/stringify-tokens'
 * import { ButtonDefinition } from './button.definition'
 *
 * const buttonTokens = stringifyTokens('--mdc-button')(ButtonDefinition)
 *
 * export const ButtonHostStyles = css`
 *     :host {
 *         ${buttonTokens}
 *     }
 * `
 * ```
 */
export function stringifyTokens(
    prefixOrOptions: StringifyPrefixOrOptions
) {
    const options = normalizeOptions(prefixOrOptions)

    return <
        const TStates extends readonly string[] = readonly string[],
        const TTokens extends Record<string, TokenValue<TStates, PrimitiveTokenValue>> = Record<string, TokenValue<TStates, PrimitiveTokenValue>>
    >(
        definition: ResolvedStyleDefinition<StateSchema<TStates>, TTokens> | Record<string, any>
    ): CSSResult => {
        if (!definition || typeof definition !== 'object') {
            return unsafeCSS('')
        }

        const schema = (definition as any).schema
        const states: readonly string[] = schema?.states ?? (Array.isArray((definition as any).states) ? (definition as any).states : ['enabled'])
        const baseState = states[0] ?? 'enabled'

        const tokensObj = (('tokens' in definition && typeof (definition as any).tokens === 'object' && (definition as any).tokens !== null)
            ? (definition as any).tokens
            : definition) as Record<string, any>

        const forwardedBridges = ('forwardedBridges' in definition && typeof (definition as any).forwardedBridges === 'object' && (definition as any).forwardedBridges !== null)
            ? (definition as any).forwardedBridges
            : undefined

        const declarations: string[] = []
        const tokenMultiStateMap = new Map<string, boolean>()

        for (const [key, rawValue] of Object.entries(tokensObj)) {
            if (rawValue === null || rawValue === undefined || RESERVED_DEF_KEYS.has(key)) {
                continue
            }

            const cleanKey = key.startsWith('--') ? key.slice(2) : key

            if (Array.isArray(rawValue)) {
                tokenMultiStateMap.set(cleanKey, true)
                for (let i = 0; i < states.length; i++) {
                    const stateName = states[i]
                    const stateVal = formatTokenValue(rawValue[i])
                    if (stateVal.length > 0) {
                        if (options.includePublicVars) {
                            declarations.push(`--_${stateName}-${cleanKey}: var(${options.prefix}-${stateName}-${cleanKey}, ${stateVal});`)
                        } else {
                            declarations.push(`--_${stateName}-${cleanKey}: ${stateVal};`)
                        }
                    }
                }
                continue
            }

            if (
                isPlainObject(rawValue) &&
                typeof (rawValue as any).ToCSSVariable !== 'function' &&
                !('_$cssResult$' in (rawValue as any)) &&
                !('cssText' in (rawValue as any))
            ) {
                tokenMultiStateMap.set(cleanKey, true)
                for (const [sName, sVal] of Object.entries(rawValue)) {
                    if (sVal !== null && sVal !== undefined) {
                        const sValStr = formatTokenValue(sVal)
                        if (options.includePublicVars) {
                            declarations.push(`--_${sName}-${cleanKey}: var(${options.prefix}-${sName}-${cleanKey}, ${sValStr});`)
                        } else {
                            declarations.push(`--_${sName}-${cleanKey}: ${sValStr};`)
                        }
                    }
                }
                continue
            }

            // Static invariant token
            tokenMultiStateMap.set(cleanKey, false)
            const staticVal = formatTokenValue(rawValue)

            if (options.includePublicVars) {
                declarations.push(`--_${cleanKey}: var(${options.prefix}-${cleanKey}, ${staticVal});`)
            } else {
                declarations.push(`--_${cleanKey}: ${staticVal};`)
            }
        }

        // Bridge variables for child components
        if (forwardedBridges) {
            for (const bridge of Object.values(forwardedBridges) as any[]) {
                if (!bridge || typeof bridge !== 'object') {
                    continue
                }
                const { targetPrefix, cleanKey: childKey, parentKey } = bridge
                const cleanParent = parentKey.startsWith('--') ? parentKey.slice(2) : parentKey
                const isMultiState = tokenMultiStateMap.get(cleanParent) ?? false

                const privateVarName = isMultiState
                    ? `--_${baseState}-${cleanParent}`
                    : `--_${cleanParent}`

                declarations.push(`${targetPrefix}-${childKey}: var(${privateVarName});`)
            }
        }

        if (declarations.length === 0) {
            return unsafeCSS('')
        }

        if (options.selector && options.selector.trim().length > 0) {
            const indented = declarations.map((d) => `    ${d}`).join('\n')
            return unsafeCSS(`${options.selector} {\n${indented}\n}`)
        }

        return unsafeCSS(declarations.join('\n'))
    }
}

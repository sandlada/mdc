/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Token stringifier for `utils/style`: emits `:host` private (`--_*`)
 * declarations with public (`--mdc-<prefix>-*`) override fallbacks.
 *
 * Simplified port without schema / Cartesian logic: static primitives emit
 * one declaration each, plain record values emit one declaration per entry.
 * Array values fail fast — the simplified system holds no schema to name
 * positional entries with.
 */

import { unsafeCSS, type CSSResult } from 'lit'
import type { ResolvedStyleDefinition } from './create-style-definition'

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

const normalizeOptions = (prefixOrOptions: StringifyPrefixOrOptions): {
    prefix: string
    includePublicVars: boolean
    selector?: string
} => {
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

const formatTokenValue = (val: unknown): string => {
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

const isPlainObject = (value: unknown): value is Record<string, any> => {
    if (typeof value !== 'object' || value === null) {
        return false
    }
    const proto = Object.getPrototypeOf(value)
    return proto === Object.prototype || proto === null
}

const isLeafCapableObject = (value: unknown): boolean => {
    if (typeof value !== 'object' || value === null) {
        return false
    }
    const record = value as Record<string, unknown>
    return typeof record['ToCSSVariable'] === 'function' || '_$cssResult$' in record || 'cssText' in record
}

const RESERVED_DEF_KEYS = new Set(['__brand', 'schema', 'tokens', 'flatTokenKeys', 'forwardedBridges'])

/**
 * Generates private (`--_*`) CSS custom property declarations with public
 * override fallbacks from a token definition.
 *
 * @example
 * ```typescript
 * import { css } from 'lit'
 * import { stringifyTokens } from '../../utils/style'
 * import { DividerDefinition } from './divider.definition'
 *
 * const dividerTokens = stringifyTokens('--mdc-divider')(DividerDefinition)
 *
 * export const DividerStyles = [
 *     css`@layer mdc.divider.variable {:host {${dividerTokens};}}`,
 * ]
 * ```
 */
export function stringifyTokens(
    prefixOrOptions: StringifyPrefixOrOptions
) {
    const options = normalizeOptions(prefixOrOptions)

    return (
        definition: ResolvedStyleDefinition<any> | Record<string, any>
    ): CSSResult => {
        if (!definition || typeof definition !== 'object') {
            return unsafeCSS('')
        }

        const tokensObj = (('tokens' in definition && typeof (definition as any).tokens === 'object' && (definition as any).tokens !== null)
            ? (definition as any).tokens
            : definition) as Record<string, any>

        const declarations: string[] = []

        for (const [key, rawValue] of Object.entries(tokensObj)) {
            if (rawValue === null || rawValue === undefined || RESERVED_DEF_KEYS.has(key)) {
                continue
            }

            const cleanKey = key.startsWith('--') ? key.slice(2) : key

            if (Array.isArray(rawValue)) {
                throw new Error(`[stringifyTokens] Token '${cleanKey}' uses an array but the simplified style system holds no schema: only static values and plain records are allowed.`)
            }

            if (
                isPlainObject(rawValue) &&
                !isLeafCapableObject(rawValue)
            ) {
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
            const staticVal = formatTokenValue(rawValue)

            if (options.includePublicVars) {
                declarations.push(`--_${cleanKey}: var(${options.prefix}-${cleanKey}, ${staticVal});`)
            } else {
                declarations.push(`--_${cleanKey}: ${staticVal};`)
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

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { unsafeCSS, type CSSResult } from 'lit'
import { STATE_NAMES, type StateName, type StateTuple } from './state'
import { normalizeStateTokenKey } from './create-style-definition'

export interface OverrideTokensOptions {
    /**
     * The CSS variable prefix of the target component, for example `--mdc-focus-ring` or `--mdc-button`.
     */
    prefix: string

    /**
     * Optional selector to wrap the CSS declarations with.
     * When provided, outputs `${selector} { --prefix-key: value; }`.
     * When omitted, outputs direct CSS declarations `--prefix-key: value;`.
     */
    selector?: string
}

export type OverridePrefixOrOptions = string | OverrideTokensOptions

type CleanKey<K extends string> = K extends `--${infer Rest}` ? Rest : K

type StripPrefix<K extends string> =
    K extends `${string}:${infer Rest}`
        ? StripPrefix<Rest>
        : K extends `enabled-${infer Rest}`
            ? Rest
            : K extends `hovered-${infer Rest}`
                ? Rest
                : K extends `pressed-${infer Rest}`
                    ? Rest
                    : K extends `focused-${infer Rest}`
                        ? Rest
                        : K extends `disabled-${infer Rest}`
                            ? Rest
                            : K

type ExtractBaseKeys<T> = T extends Record<string, any>
    ? {
        [K in keyof T & string]: StripPrefix<CleanKey<K>>
    }[keyof T & string]
    : string

type StandardStates =
    | 'enabled'
    | 'hover'
    | 'hovered'
    | 'active'
    | 'pressed'
    | 'focus'
    | 'focused'
    | 'disabled'
    | 'checked'
    | 'selected'
    | 'dragged'
    | 'error'

type LegacyPrefixes = 'enabled' | 'hovered' | 'pressed' | 'focused' | 'disabled'

export type OverrideTokenKey<T> = T extends Record<string, any>
    ? | (keyof T & string)
      | ExtractBaseKeys<T>
      | `${StandardStates}:${ExtractBaseKeys<T>}`
      | `${LegacyPrefixes}-${ExtractBaseKeys<T>}`
    : string

export type OverrideValue = string | number | CSSResult

export type OverrideTokensMap<TDef> = Partial<{
    [K in OverrideTokenKey<TDef> | (string & {})]:
        | OverrideValue
        | StateTuple<OverrideValue>
        | readonly (OverrideValue | null | undefined)[]
        | Record<string, OverrideValue | null | undefined>
        | null
        | undefined
}>

export type OverrideTokens<TDef> = OverrideTokensMap<TDef>

function formatValue(v: any): string {
    if (typeof v === 'object' && v !== null && 'cssText' in v) {
        return (v as CSSResult).cssText
    }
    return String(v)
}

function findMatchingDefinitionKey(cleanKey: string, defKeysSet: Set<string>): string | undefined {
    if (defKeysSet.has(cleanKey)) return cleanKey

    const norm = normalizeStateTokenKey(cleanKey)
    if (defKeysSet.has(norm.canonicalKey)) return norm.canonicalKey

    // If cleanKey is a base key (norm.states.length === 0)
    if (norm.states.length === 0) {
        if (defKeysSet.has(`enabled-${cleanKey}`)) return `enabled-${cleanKey}`
    }

    // Check single-state aliases
    if (norm.states.length === 1) {
        const s = norm.states[0]
        if (s === 'hover') {
            if (defKeysSet.has(`hover:${norm.baseKey}`)) return `hover:${norm.baseKey}`
            if (defKeysSet.has(`hovered-${norm.baseKey}`)) return `hovered-${norm.baseKey}`
        }
        if (s === 'active') {
            if (defKeysSet.has(`active:${norm.baseKey}`)) return `active:${norm.baseKey}`
            if (defKeysSet.has(`pressed-${norm.baseKey}`)) return `pressed-${norm.baseKey}`
        }
        if (s === 'focus') {
            if (defKeysSet.has(`focus:${norm.baseKey}`)) return `focus:${norm.baseKey}`
            if (defKeysSet.has(`focused-${norm.baseKey}`)) return `focused-${norm.baseKey}`
        }
        if (s === 'disabled') {
            if (defKeysSet.has(`disabled:${norm.baseKey}`)) return `disabled:${norm.baseKey}`
            if (defKeysSet.has(`disabled-${norm.baseKey}`)) return `disabled-${norm.baseKey}`
        }
        if (s === 'enabled') {
            if (defKeysSet.has(`enabled-${norm.baseKey}`)) return `enabled-${norm.baseKey}`
            if (defKeysSet.has(norm.baseKey)) return norm.baseKey
        }
    }

    if (norm.isLegacyHyphen) {
        if (defKeysSet.has(norm.canonicalKey)) return norm.canonicalKey
    }

    return undefined
}

function processOverrides(
    definition: Record<string, any> | undefined,
    prefixOrOptions: OverridePrefixOrOptions,
    tokens: Record<string, any>
): CSSResult {
    const prefixRaw = typeof prefixOrOptions === 'string' ? prefixOrOptions : prefixOrOptions.prefix
    const selector = typeof prefixOrOptions === 'object' ? prefixOrOptions.selector : undefined
    const prefix = prefixRaw.startsWith('--') ? prefixRaw : `--${prefixRaw}`

    const defKeys = definition && typeof definition === 'object' ? Object.keys(definition) : []
    const defKeysSet = new Set(defKeys)

    const declarations: string[] = []

    for (const [rawKey, val] of Object.entries(tokens ?? {})) {
        if (val === null || val === undefined) continue

        const cleanKey = rawKey.startsWith('--') ? rawKey.replace(/^--/, '') : rawKey

        // 1. Tuple / Array of values
        if (Array.isArray(val)) {
            for (let i = 0; i < STATE_NAMES.length; i++) {
                const stateVal = val[i]
                if (stateVal === null || stateVal === undefined) continue

                const stateName = STATE_NAMES[i]
                const targetKey = `${stateName}-${cleanKey}`
                declarations.push(`${prefix}-${targetKey}: ${formatValue(stateVal)};`)
            }
            continue
        }

        // 2. Nested state record { hover: 'blue', active: 'red' }
        if (
            typeof val === 'object' &&
            val !== null &&
            !('cssText' in val) &&
            typeof (val as any).ToCSSVariable !== 'function'
        ) {
            for (const [state, stateVal] of Object.entries(val)) {
                if (stateVal === null || stateVal === undefined) continue
                let candidateKey = cleanKey
                if (state === '' || state === 'base') {
                    candidateKey = cleanKey
                } else if (state === 'enabled') {
                    candidateKey = `enabled-${cleanKey}`
                } else {
                    candidateKey = `${state}:${cleanKey}`
                }

                const matchedKey = findMatchingDefinitionKey(candidateKey, defKeysSet) || candidateKey
                declarations.push(`${prefix}-${matchedKey}: ${formatValue(stateVal)};`)
            }
            continue
        }

        // 3. Check if cleanKey is a base key with defined state variants in definition
        const normalizedKeyInfo = normalizeStateTokenKey(cleanKey)
        if (normalizedKeyInfo.states.length === 0) {
            // It is a base key (e.g. 'container-color')
            const matchedVariants = defKeys.filter((k) => {
                const itemNorm = normalizeStateTokenKey(k)
                return itemNorm.baseKey === cleanKey
            })

            if (matchedVariants.length > 1) {
                for (const stateKey of matchedVariants) {
                    declarations.push(`${prefix}-${stateKey}: ${formatValue(val)};`)
                }
                continue
            }
            if (matchedVariants.length === 1) {
                const stateKey = matchedVariants[0]
                declarations.push(`${prefix}-${stateKey}: ${formatValue(val)};`)
                continue
            }
        }

        // 4. Exact or normalized single key matching in definition
        const matchedKey = findMatchingDefinitionKey(cleanKey, defKeysSet)
        if (matchedKey) {
            declarations.push(`${prefix}-${matchedKey}: ${formatValue(val)};`)
            continue
        }

        // 5. Fallback for custom or direct property
        declarations.push(`${prefix}-${cleanKey}: ${formatValue(val)};`)
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

export type OverrideTokensCurriedWithTokens<TDef extends Record<string, any>> = (
    definition?: TDef
) => CSSResult

export type OverrideTokensCurried<TDef extends Record<string, any>> = (
    tokens: OverrideTokens<TDef>
) => OverrideTokensCurriedWithTokens<TDef>

/**
 * Pure functional, curried, data-last token override function with 1-to-1 type safety.
 *
 * @example
 * ```typescript
 * // Curried data-last with pipe:
 * const overrideButton = pipe(
 *     ButtonDefinition,
 *     overrideTokens('--mdc-button')({ 'container-color': 'red' })
 * )
 *
 * // Direct call:
 * overrideTokens(ButtonDefinition, '--mdc-button', { 'container-color': 'red' })
 * ```
 */
export function overrideTokens<TDef extends Record<string, any> = Record<string, any>>(
    prefixOrOptions: OverridePrefixOrOptions
): (tokens: OverrideTokens<TDef>) => (definition?: TDef) => CSSResult

export function overrideTokens<TDef extends Record<string, any> = Record<string, any>>(
    prefixOrOptions: OverridePrefixOrOptions,
    tokens: OverrideTokens<TDef>
): (definition?: TDef) => CSSResult

export function overrideTokens<TDef extends Record<string, any>>(
    definition: TDef,
    prefixOrOptions: OverridePrefixOrOptions,
    tokens: OverrideTokens<TDef>
): CSSResult

export function overrideTokens(arg1: any, arg2?: any, arg3?: any): any {
    // Case 1: Uncurried (definition, prefix, tokens)
    if (arg3 !== undefined) {
        return processOverrides(arg1, arg2, arg3)
    }

    // Case 2: 2 args (prefixOrOptions, tokens) -> (definition) => CSSResult
    if (arg2 !== undefined) {
        return (definition?: any) => processOverrides(definition, arg1, arg2)
    }

    // Case 3: 1 arg (prefixOrOptions) -> (tokens) => (definition) => CSSResult
    return (tokens: any) => (definition?: any) => processOverrides(definition, arg1, tokens)
}

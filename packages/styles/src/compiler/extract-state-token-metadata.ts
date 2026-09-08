/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { StateSchema } from '../define-schema'
import { canonicalizeState } from './compose-state-selector'
import {
    formatValueString,
    isPlainObject,
    isVariantDictionary,
    RESERVED_DEF_KEYS
} from './internal/metadata-helpers'

export interface StateTokenMetadata {
    hasToken(name: string): boolean
    isStateToken(name: string): boolean
    hasStateToken(name: string, state: string): boolean
    allTokens: ReadonlySet<string>
    allStateTokens: ReadonlySet<string>
    allDefinedStates: ReadonlySet<string>
    getDefinedStates(name: string): ReadonlySet<string>
    resolveStateVarName(name: string, state: string): string
    hasStateDelta(tokenName: string, state: string): boolean
    statesList: readonly string[]
    baseState: string
    isVariantDictionary: boolean
    allVariantNames: readonly string[]
    variantTokensMap: ReadonlyMap<string, ReadonlySet<string>>
    intersectionTokens: ReadonlySet<string>
}

/**
 * Extracts comprehensive state token metadata from component style definition(s) or variant dictionaries.
 */
export function extractStateTokenMetadata(definition: any): StateTokenMetadata {
    const isVarDict = isVariantDictionary(definition)
    const allVariantNames: string[] = isVarDict ? Object.keys(definition) : []
    const variantTokensMap = new Map<string, Set<string>>()

    if (isVarDict) {
        for (const [vName, vDef] of Object.entries(definition)) {
            if (!vDef || typeof vDef !== 'object') continue
            const vTokenSet = new Set<string>()
            const tokensObj = ('tokens' in vDef && typeof vDef.tokens === 'object' && vDef.tokens !== null)
                ? vDef.tokens
                : vDef

            for (const [rawKey, rawVal] of Object.entries(tokensObj)) {
                if (rawVal === null || rawVal === undefined || RESERVED_DEF_KEYS.has(rawKey)) {
                    continue
                }
                const key = rawKey.startsWith('--_')
                    ? rawKey.slice(3)
                    : rawKey.startsWith('--')
                        ? rawKey.slice(2)
                        : rawKey
                vTokenSet.add(key)
            }
            variantTokensMap.set(vName, vTokenSet)
        }
    }

    const intersectionTokens = new Set<string>()
    if (allVariantNames.length > 0) {
        const firstSet = variantTokensMap.get(allVariantNames[0]) ?? new Set()
        for (const token of firstSet) {
            if (allVariantNames.every((v) => variantTokensMap.get(v)?.has(token))) {
                intersectionTokens.add(token)
            }
        }
    }

    const definitions = isVarDict
        ? Object.values(definition)
        : Array.isArray(definition)
            ? definition
            : [definition]

    const allTokens = new Set<string>()
    const allStateTokens = new Set<string>()
    const allDefinedStates = new Set<string>()
    const definedStatesPerToken = new Map<string, Set<string>>()
    const deltaStatesPerToken = new Map<string, Set<string>>()
    const stateVarMap = new Map<string, string>()

    let statesList: string[] = []

    for (const def of definitions) {
        if (!def || typeof def !== 'object') continue

        const schema: StateSchema<any> | undefined = def.schema
        if (schema && Array.isArray(schema.states) && schema.states.length > 0) {
            for (const s of schema.states) {
                if (!statesList.includes(s)) {
                    statesList.push(s)
                }
            }
        } else if (Array.isArray(def.states) && def.states.length > 0) {
            for (const s of def.states) {
                if (!statesList.includes(s)) {
                    statesList.push(s)
                }
            }
        }
    }

    if (statesList.length === 0) {
        statesList = ['enabled', 'hovered', 'pressed', 'focused', 'disabled']
    }

    const baseState = statesList[0] ?? 'enabled'

    for (const def of definitions) {
        if (!def || typeof def !== 'object') continue

        const tokensObj = ('tokens' in def && typeof def.tokens === 'object' && def.tokens !== null)
            ? def.tokens
            : def

        for (const [rawKey, rawVal] of Object.entries(tokensObj)) {
            if (rawVal === null || rawVal === undefined || RESERVED_DEF_KEYS.has(rawKey)) {
                continue
            }

            const key = rawKey.startsWith('--_')
                ? rawKey.slice(3)
                : rawKey.startsWith('--')
                    ? rawKey.slice(2)
                    : rawKey

            allTokens.add(key)

            // Multi-state Array / Tuple
            if (Array.isArray(rawVal)) {
                allStateTokens.add(key)

                let tokenStates = definedStatesPerToken.get(key)
                if (!tokenStates) {
                    tokenStates = new Set<string>()
                    definedStatesPerToken.set(key, tokenStates)
                }

                let deltaStates = deltaStatesPerToken.get(key)
                if (!deltaStates) {
                    deltaStates = new Set<string>()
                    deltaStatesPerToken.set(key, deltaStates)
                }

                const baseValStr = formatValueString(rawVal[0])
                stateVarMap.set(`${key}:${baseState}`, `${baseState}-${key}`)
                stateVarMap.set(`${key}:enabled`, `${baseState}-${key}`)
                stateVarMap.set(`${key}:base`, `${baseState}-${key}`)

                for (let i = 0; i < statesList.length && i < rawVal.length; i++) {
                    const rawItem = rawVal[i]
                    if (rawItem === null || rawItem === undefined) {
                        continue
                    }
                    const sName = statesList[i]
                    const sValStr = formatValueString(rawItem)

                    tokenStates.add(sName)
                    allDefinedStates.add(sName)
                    stateVarMap.set(`${key}:${sName}`, `${sName}-${key}`)

                    const canonical = canonicalizeState(sName)
                    if (canonical !== sName) {
                        tokenStates.add(canonical)
                        stateVarMap.set(`${key}:${canonical}`, `${sName}-${key}`)
                    }

                    if (i > 0 && sValStr !== baseValStr) {
                        deltaStates.add(sName)
                        if (canonical !== sName) {
                            deltaStates.add(canonical)
                        }
                    }
                }
                continue
            }

            // Multi-state Record / Object
            if (
                isPlainObject(rawVal) &&
                typeof (rawVal as any).ToCSSVariable !== 'function' &&
                !('_$cssResult$' in (rawVal as any)) &&
                !('cssText' in (rawVal as any))
            ) {
                allStateTokens.add(key)

                let tokenStates = definedStatesPerToken.get(key)
                if (!tokenStates) {
                    tokenStates = new Set<string>()
                    definedStatesPerToken.set(key, tokenStates)
                }

                let deltaStates = deltaStatesPerToken.get(key)
                if (!deltaStates) {
                    deltaStates = new Set<string>()
                    deltaStatesPerToken.set(key, deltaStates)
                }

                const baseValRaw = rawVal[baseState] ?? rawVal['enabled'] ?? Object.values(rawVal)[0]
                const baseValStr = formatValueString(baseValRaw)

                stateVarMap.set(`${key}:${baseState}`, `${baseState}-${key}`)
                stateVarMap.set(`${key}:enabled`, `${baseState}-${key}`)
                stateVarMap.set(`${key}:base`, `${baseState}-${key}`)

                for (const [sName, sVal] of Object.entries(rawVal)) {
                    if (sVal === null || sVal === undefined) continue

                    const sValStr = formatValueString(sVal)
                    tokenStates.add(sName)
                    allDefinedStates.add(sName)
                    stateVarMap.set(`${key}:${sName}`, `${sName}-${key}`)

                    const canonical = canonicalizeState(sName)
                    if (canonical !== sName) {
                        tokenStates.add(canonical)
                        stateVarMap.set(`${key}:${canonical}`, `${sName}-${key}`)
                    }

                    if (sName !== baseState && sName !== 'enabled' && sValStr !== baseValStr) {
                        deltaStates.add(sName)
                        if (canonical !== sName) {
                            deltaStates.add(canonical)
                        }
                    }
                }
                continue
            }

            // Static invariant token
            stateVarMap.set(`${key}:${baseState}`, key)
            stateVarMap.set(`${key}:enabled`, key)
            stateVarMap.set(`${key}:base`, key)
        }
    }

    return {
        hasToken(name: string) {
            const clean = name.replace(/^--_?/, '')
            return allTokens.has(clean) || stateVarMap.has(`${clean}:${baseState}`)
        },
        isStateToken(name: string) {
            const clean = name.replace(/^--_?/, '')
            return allStateTokens.has(clean)
        },
        hasStateToken(name: string, state: string) {
            const clean = name.replace(/^--_?/, '')
            const states = definedStatesPerToken.get(clean)
            if (!states) return false
            const canonical = canonicalizeState(state)
            return states.has(state) || states.has(canonical)
        },
        allTokens,
        allStateTokens,
        allDefinedStates,
        getDefinedStates(name: string) {
            const clean = name.replace(/^--_?/, '')
            return definedStatesPerToken.get(clean) ?? new Set()
        },
        resolveStateVarName(name: string, state: string) {
            const clean = name.replace(/^--_?/, '')
            const canonical = canonicalizeState(state)
            const exact = stateVarMap.get(`${clean}:${state}`) ?? stateVarMap.get(`${clean}:${canonical}`)
            if (exact) return exact

            if (state === 'base' || state === 'enabled' || state === baseState) {
                const baseVar = stateVarMap.get(`${clean}:${baseState}`) ?? stateVarMap.get(`${clean}:enabled`) ?? stateVarMap.get(`${clean}:base`)
                if (baseVar) return baseVar
                return clean
            }

            return `${state}-${clean}`
        },
        hasStateDelta(tokenName: string, state: string) {
            const clean = tokenName.replace(/^--_?/, '')
            const deltas = deltaStatesPerToken.get(clean)
            if (!deltas) return false
            const canonical = canonicalizeState(state)
            return deltas.has(state) || deltas.has(canonical)
        },
        statesList,
        baseState,
        isVariantDictionary: isVarDict,
        allVariantNames: Object.freeze(allVariantNames),
        variantTokensMap,
        intersectionTokens
    }
}

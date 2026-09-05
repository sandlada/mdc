/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { StateTriggerRegistry, type StateTrigger, type TriggerContext } from './map-state-triggers'
import type { StateSchema } from './define-schema'
import { compileAtRulesSheet, isAtRulesStylesheet, hasDefiniteAtRules } from './at-rules-compiler'
export { compileAtRulesSheet, isAtRulesStylesheet, hasDefiniteAtRules } from './at-rules-compiler'

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
    readonly variantSelector?: (variantName: string) => string
    readonly onWarn?: (warning: StyleDiagnosticWarning) => void
}

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

export function canonicalizeState(state: string): string {
    if (state === 'hovered') return 'hover'
    if (state === 'pressed') return 'active'
    if (state === 'focused') return 'focus'
    return state
}

function formatValueString(val: unknown): string {
    if (val === null || val === undefined) return ''
    if (typeof val === 'object' && val !== null) {
        if (typeof (val as any).ToCSSVariable === 'function') {
            return (val as any).ToCSSVariable()
        }
        if ('cssText' in val && typeof (val as any).cssText === 'string') {
            return (val as any).cssText
        }
        if ('rawVal' in val) {
            return formatValueString((val as any).rawVal)
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

function isVariantDictionary(definition: unknown): definition is Record<string, any> {
    if (!definition || typeof definition !== 'object' || Array.isArray(definition)) {
        return false
    }
    const obj = definition as Record<string, any>
    if ('__brand' in obj && obj['__brand'] === 'ResolvedStyleDefinition') {
        return false
    }
    if ('schema' in obj && obj['schema'] && typeof obj['schema'] === 'object' && obj['schema']['__brand'] === 'StateSchema') {
        return false
    }
    if ('tokens' in obj && obj['tokens'] && typeof obj['tokens'] === 'object') {
        return false
    }
    const entries = Object.entries(obj)
    if (entries.length === 0) {
        return false
    }
    return entries.every(([_, val]) =>
        val && typeof val === 'object' && !Array.isArray(val) && !('_$cssResult$' in val) && !('ToCSSVariable' in val)
    )
}

function globToRegex(glob: string): RegExp {
    const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
    return new RegExp(`^${escaped}$`)
}

export function matchVariants(patterns: readonly string[], allVariantNames: readonly string[]): string[] {
    const cleanPatterns = patterns.map((p) => p.trim()).filter(Boolean)
    const positivePatterns = cleanPatterns.filter((p) => !p.startsWith('!'))
    const negativePatterns = cleanPatterns.filter((p) => p.startsWith('!')).map((p) => p.slice(1).trim()).filter(Boolean)

    let matched: string[] = []

    if (positivePatterns.length > 0) {
        if (allVariantNames.length > 0) {
            matched = allVariantNames.filter((name) =>
                positivePatterns.some((pat) => globToRegex(pat).test(name))
            )
        } else {
            matched = positivePatterns
        }
    } else {
        matched = [...allVariantNames]
    }

    if (negativePatterns.length > 0) {
        matched = matched.filter((name) =>
            !negativePatterns.some((pat) => globToRegex(pat).test(name))
        )
    }

    return matched
}

function emitWarning(options: CompileStateSheetOptions | undefined, warning: StyleDiagnosticWarning): void {
    if (options?.onWarn) {
        options.onWarn(warning)
    } else {
        console.warn(warning.message)
    }
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
                    const sName = statesList[i]
                    const sValStr = formatValueString(rawVal[i])

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

/**
 * Strips comments from CSS string while preserving quoted strings.
 */
export function stripComments(css: string): string {
    let result = ''
    let inSingleQuote = false
    let inDoubleQuote = false
    let inBlockComment = false
    let inLineComment = false
    let isEscaped = false

    for (let i = 0; i < css.length; i++) {
        const ch = css[i]
        const next = i + 1 < css.length ? css[i + 1] : ''

        if (isEscaped) {
            isEscaped = false
            if (!inBlockComment && !inLineComment) {
                result += ch
            }
            continue
        }

        if (ch === '\\') {
            isEscaped = true
            if (!inBlockComment && !inLineComment) {
                result += ch
            }
            continue
        }

        if (inBlockComment) {
            if (ch === '*' && next === '/') {
                inBlockComment = false
                i++ // skip '/'
            }
            continue
        }

        if (inLineComment) {
            if (ch === '\n' || ch === '\r') {
                inLineComment = false
                result += ch
            }
            continue
        }

        if (ch === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote
            result += ch
            continue
        }

        if (ch === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote
            result += ch
            continue
        }

        if (inSingleQuote || inDoubleQuote) {
            result += ch
            continue
        }

        if (ch === '/' && next === '*') {
            inBlockComment = true
            i++ // skip '*'
            continue
        }

        if (ch === '/' && next === '/') {
            inLineComment = true
            i++ // skip '/'
            continue
        }

        result += ch
    }

    return result
}

/**
 * Depth-aware finder for the next top-level delimiter (';' or '{').
 */
function findNextDelimiter(css: string, start: number): { type: ';' | '{'; index: number } | null {
    let inSingleQuote = false
    let inDoubleQuote = false
    let parenDepth = 0
    let bracketDepth = 0
    let isEscaped = false

    for (let i = start; i < css.length; i++) {
        const ch = css[i]

        if (isEscaped) {
            isEscaped = false
            continue
        }

        if (ch === '\\') {
            isEscaped = true
            continue
        }

        if (ch === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote
            continue
        }

        if (ch === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote
            continue
        }

        if (inSingleQuote || inDoubleQuote) {
            continue
        }

        if (ch === '(') {
            parenDepth++
            continue
        }

        if (ch === ')') {
            if (parenDepth > 0) parenDepth--
            continue
        }

        if (ch === '[') {
            bracketDepth++
            continue
        }

        if (ch === ']') {
            if (bracketDepth > 0) bracketDepth--
            continue
        }

        if (parenDepth === 0 && bracketDepth === 0) {
            if (ch === ';') {
                return { type: ';', index: i }
            }
            if (ch === '{') {
                return { type: '{', index: i }
            }
        }
    }

    return null
}

/**
 * Finds the matching closing brace '}' for an opening brace at openBraceIndex.
 */
function findMatchingClosingBrace(css: string, openBraceIndex: number): number {
    let depth = 1
    let inSingleQuote = false
    let inDoubleQuote = false
    let isEscaped = false

    for (let i = openBraceIndex + 1; i < css.length; i++) {
        const ch = css[i]

        if (isEscaped) {
            isEscaped = false
            continue
        }

        if (ch === '\\') {
            isEscaped = true
            continue
        }

        if (ch === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote
            continue
        }

        if (ch === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote
            continue
        }

        if (inSingleQuote || inDoubleQuote) {
            continue
        }

        if (ch === '{') {
            depth++
        } else if (ch === '}') {
            depth--
            if (depth === 0) {
                return i
            }
        }
    }

    return css.length
}

/**
 * Parses CSS declarations string into a structured DeclarationNode.
 */
function parseDeclarationString(raw: string, meta: StateTokenMetadata): DeclarationNode | null {
    const colonIdx = raw.indexOf(':')
    if (colonIdx === -1) return null

    const property = raw.slice(0, colonIdx).trim()
    const value = raw.slice(colonIdx + 1).trim()
    if (!property || !value) return null

    const referencedTokens: string[] = []
    const stateTokens: string[] = []

    const varMatches = value.matchAll(/var\(--_([a-zA-Z0-9_:-]+)\)/g)
    for (const match of varMatches) {
        const tokenName = match[1]
        referencedTokens.push(tokenName)
        if (meta.isStateToken(tokenName) || meta.hasToken(tokenName)) {
            if (meta.isStateToken(tokenName)) {
                stateTokens.push(tokenName)
            }
        }
    }

    return {
        property,
        value,
        referencedTokens,
        stateTokens,
        isStateDependent: stateTokens.length > 0
    }
}

/**
 * Splits a selector on top-level commas respecting (), [], and quotes.
 */
export function splitSelectorByComma(selector: string): string[] {
    const parts: string[] = []
    let current = ''
    let parenDepth = 0
    let bracketDepth = 0
    let inSingleQuote = false
    let inDoubleQuote = false
    let isEscaped = false

    for (let i = 0; i < selector.length; i++) {
        const ch = selector[i]

        if (isEscaped) {
            isEscaped = false
            current += ch
            continue
        }

        if (ch === '\\') {
            isEscaped = true
            current += ch
            continue
        }

        if (ch === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote
            current += ch
            continue
        }

        if (ch === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote
            current += ch
            continue
        }

        if (inSingleQuote || inDoubleQuote) {
            current += ch
            continue
        }

        if (ch === '(') {
            parenDepth++
            current += ch
            continue
        }

        if (ch === ')') {
            if (parenDepth > 0) parenDepth--
            current += ch
            continue
        }

        if (ch === '[') {
            bracketDepth++
            current += ch
            continue
        }

        if (ch === ']') {
            if (bracketDepth > 0) bracketDepth--
            current += ch
            continue
        }

        if (ch === ',' && parenDepth === 0 && bracketDepth === 0) {
            const trimmed = current.trim()
            if (trimmed) parts.push(trimmed)
            current = ''
            continue
        }

        current += ch
    }

    const trailing = current.trim()
    if (trailing) parts.push(trailing)

    return parts.length > 0 ? parts : [selector.trim()]
}

/**
 * Splits a selector into its leading host component and any trailing descendant/combinator part.
 * e.g. ':host(:not(.hidden)) .elevation::before' -> { hostPart: ':host(:not(.hidden))', descendantPart: '.elevation::before' }
 */
export function extractHostAndDescendant(selector: string): { hostPart: string; descendantPart: string } {
    const trimmed = selector.trim()
    if (!trimmed.startsWith(':host')) {
        return { hostPart: '', descendantPart: trimmed }
    }

    let i = 5
    const len = trimmed.length

    if (i < len && trimmed[i] === '(') {
        let depth = 0
        while (i < len) {
            if (trimmed[i] === '(') depth++
            else if (trimmed[i] === ')') {
                depth--
                if (depth === 0) {
                    i++
                    break
                }
            }
            i++
        }
    }

    while (i < len) {
        if (trimmed[i] === ':' || trimmed[i] === '[' || trimmed[i] === '.') {
            const nextMatch = trimmed.slice(i).match(/^(:[a-zA-Z0-9_-]+(\([^)]*\))?|\[[^\]]*\]|\.[a-zA-Z0-9_-]+)/)
            if (nextMatch) {
                i += nextMatch[0].length
            } else {
                break
            }
        } else {
            break
        }
    }

    const hostPart = trimmed.slice(0, i).trim()
    const descendantPart = trimmed.slice(i).trim()
    return { hostPart, descendantPart }
}

/**
 * Appends a modifier to a :host selector, respecting depth-balanced parentheses and comma-separated selectors.
 */
export function appendToHostSelector(hostSelector: string, modifier: string): string {
    if (!modifier) return hostSelector
    if (!hostSelector) return modifier

    const modParts = splitSelectorByComma(modifier)
    if (modParts.length > 1) {
        return modParts.map((m) => appendToHostSelector(hostSelector, m)).join(', ')
    }

    const parts = splitSelectorByComma(hostSelector)
    if (parts.length > 1) {
        return parts.map((part) => appendToHostSelector(part, modifier)).join(', ')
    }

    const trimmedHost = hostSelector.trim()
    const trimmedMod = modifier.trim()

    if (!trimmedMod || trimmedMod === ':host') return trimmedHost

    // Handle :where(...) or :is(...) containing host selectors
    if (trimmedHost.startsWith(':where(') && trimmedHost.endsWith(')')) {
        const inner = trimmedHost.slice(7, -1)
        const innerParts = splitSelectorByComma(inner)
        const appended = innerParts.map((p) => appendToHostSelector(p, trimmedMod)).join(', ')
        return `:where(${appended})`
    }

    if (trimmedHost.startsWith(':is(') && trimmedHost.endsWith(')')) {
        const inner = trimmedHost.slice(4, -1)
        const innerParts = splitSelectorByComma(inner)
        const appended = innerParts.map((p) => appendToHostSelector(p, trimmedMod)).join(', ')
        return `:is(${appended})`
    }

    if (trimmedHost === ':host') {
        if (trimmedMod.startsWith(':where(') || trimmedMod.startsWith(':is(')) {
            return trimmedMod
        }
        if (trimmedMod.startsWith(':host')) {
            if (trimmedMod.startsWith(':host[') || trimmedMod.startsWith(':host.')) {
                const rest = trimmedMod.slice(5)
                const nextMatch = rest.match(/^[.\[][^\s>+~]*/)
                if (nextMatch) {
                    const hostInner = nextMatch[0]
                    const after = rest.slice(hostInner.length)
                    return `:host(${hostInner})${after}`
                }
            }
            return trimmedMod
        }
        if (trimmedMod.startsWith('(') && trimmedMod.endsWith(')')) {
            return `:host${trimmedMod}`
        }
        if (trimmedMod.startsWith('[') || trimmedMod.startsWith(':') || trimmedMod.startsWith('.')) {
            return `:host(${trimmedMod})`
        }
        return `:host(${trimmedMod})`
    }

    // When trimmedHost is not plain ':host' (e.g. :host([variant="filled"]))
    let modToAppend = trimmedMod
    let modDescendant = ''

    if (trimmedMod.startsWith(':host')) {
        const { hostPart, descendantPart } = extractHostAndDescendant(trimmedMod)
        modDescendant = descendantPart
        if (hostPart.startsWith(':host(') && hostPart.endsWith(')')) {
            modToAppend = hostPart.slice(6, -1)
        } else if (hostPart.startsWith(':host')) {
            modToAppend = hostPart.slice(5)
        } else {
            modToAppend = hostPart
        }
    } else if (trimmedMod.startsWith('(') && trimmedMod.endsWith(')')) {
        modToAppend = trimmedMod.slice(1, -1)
    }

    if (!modToAppend && !modDescendant) return trimmedHost

    let resultHost = trimmedHost

    if (modToAppend) {
        if (trimmedHost.startsWith(':host(')) {
            let depth = 0
            let closeIdx = -1

            for (let i = 5; i < trimmedHost.length; i++) {
                if (trimmedHost[i] === '(') depth++
                else if (trimmedHost[i] === ')') {
                    depth--
                    if (depth === 0) {
                        closeIdx = i
                        break
                    }
                }
            }

            if (closeIdx !== -1) {
                const inner = trimmedHost.slice(6, closeIdx)
                const after = trimmedHost.slice(closeIdx + 1)
                resultHost = `:host(${inner}${modToAppend})${after}`
            }
        } else if (trimmedHost.startsWith(':host:')) {
            resultHost = `:host(${modToAppend})${trimmedHost.slice(5)}`
        } else {
            resultHost = `${trimmedHost}${modToAppend}`
        }
    }

    if (modDescendant) {
        return `${resultHost} ${modDescendant}`.replace(/\s+/g, ' ')
    }

    return resultHost
}

export interface ComposeSelectorOptions {
    readonly anchor: string
    readonly targetSelector: string
    readonly hostCondition?: string
    readonly whenCondition?: string
    readonly states?: readonly string[]
    readonly registry?: StateTriggerRegistry
}

/**
 * Composes a full CSS selector across host triggers, anchor triggers, @when conditions,
 * and pseudo-element attachments.
 */
export function composeStateSelector(options: ComposeSelectorOptions): string {
    const {
        anchor,
        targetSelector,
        hostCondition,
        whenCondition,
        states = [],
        registry = new StateTriggerRegistry()
    } = options

    // If hostCondition has commas (e.g. :host([variant="filled"]), :host([variant="tonal"]))
    if (hostCondition) {
        const hostParts = splitSelectorByComma(hostCondition)
        if (hostParts.length > 1) {
            return hostParts.map((hPart) => composeStateSelector({
                ...options,
                hostCondition: hPart
            })).join(', ')
        }
    }

    if (targetSelector) {
        const targetParts = splitSelectorByComma(targetSelector)
        if (targetParts.length > 1) {
            return targetParts.map((part) => composeStateSelector({
                ...options,
                targetSelector: part
            })).join(', ')
        }
    }

    // Check if target is a standalone pseudo-element like ::slotted(...)
    if (targetSelector && targetSelector.startsWith('::slotted')) {
        return targetSelector
    }

    const isHostAnchor = anchor.startsWith(':host') || anchor.startsWith(':where(') || anchor.startsWith(':is(')
    const triggerContext: TriggerContext = {
        anchor,
        isHostAnchor,
        whenCondition
    }

    const hostModifiers: string[] = []
    const selfClassModifiers: string[] = []
    const selfPseudoModifiers: string[] = []

    for (const stateName of states) {
        if (!stateName || stateName === 'enabled' || stateName === 'base') continue
        const resolved = registry.resolve(stateName, triggerContext)
        if (resolved.target === 'host' || isHostAnchor) {
            if (resolved.modifier && !hostModifiers.includes(resolved.modifier)) {
                hostModifiers.push(resolved.modifier)
            }
        } else {
            if (resolved.modifier) {
                if (resolved.modifier.startsWith('.')) {
                    if (!selfClassModifiers.includes(resolved.modifier)) {
                        selfClassModifiers.push(resolved.modifier)
                    }
                } else {
                    if (!selfPseudoModifiers.includes(resolved.modifier)) {
                        selfPseudoModifiers.push(resolved.modifier)
                    }
                }
            }
        }
    }

    // Split anchor for pseudo-elements (e.g. .container::after -> base: .container, pseudo: ::after)
    let anchorBase = anchor
    let anchorPseudo = ''
    const pseudoIndex = anchor.indexOf('::')
    if (pseudoIndex !== -1) {
        anchorBase = anchor.slice(0, pseudoIndex)
        anchorPseudo = anchor.slice(pseudoIndex)
    }

    let anchorCompoundMod = ''
    let descendantSelector = ''

    if (targetSelector && targetSelector !== anchor && targetSelector.startsWith(anchorBase)) {
        const after = targetSelector.slice(anchorBase.length)
        if (after.startsWith(' ') || after.startsWith('>') || after.startsWith('+') || after.startsWith('~')) {
            descendantSelector = after
        } else if (after.startsWith('::')) {
            anchorPseudo = after
        } else if (after.startsWith('.') || after.startsWith('[') || after.startsWith(':')) {
            const combinatorMatch = after.match(/[\s>+~]|::/)
            if (combinatorMatch && combinatorMatch.index !== undefined) {
                anchorCompoundMod = after.slice(0, combinatorMatch.index)
                descendantSelector = after.slice(combinatorMatch.index)
            } else {
                anchorCompoundMod = after
            }
        }
    }

    // 1. Compose Host Selector
    let composedHost = ''
    if (isHostAnchor) {
        if (hostCondition) {
            composedHost = (anchor === ':host' || anchor === hostCondition)
                ? hostCondition
                : appendToHostSelector(hostCondition, anchor.startsWith(':host(') ? anchor.slice(6, -1) : anchor)
        } else {
            composedHost = anchor
        }
    } else if (hostCondition) {
        composedHost = hostCondition.startsWith(':host') || hostCondition.startsWith(':where(') || hostCondition.startsWith(':is(')
            ? hostCondition
            : `:host(${hostCondition})`
    } else if (hostModifiers.length > 0) {
        composedHost = ':host'
    }

    if (anchorCompoundMod && isHostAnchor) {
        composedHost = appendToHostSelector(composedHost, anchorCompoundMod)
    }

    for (const mod of hostModifiers) {
        composedHost = appendToHostSelector(composedHost || ':host', mod)
    }

    // 2. Compose Anchor Selector (when anchor is not host)
    let composedAnchor = isHostAnchor ? '' : anchorBase
    if (!isHostAnchor) {
        if (anchorCompoundMod) {
            composedAnchor = `${composedAnchor}${anchorCompoundMod}`
        }

        for (const mod of selfClassModifiers) {
            composedAnchor = `${composedAnchor}${mod}`
        }

        if (whenCondition) {
            if (whenCondition.startsWith(':host')) {
                composedHost = composedHost
                    ? appendToHostSelector(composedHost, whenCondition.replace(/^:host\(?/, '').replace(/\)$/, ''))
                    : whenCondition
            } else if (whenCondition.startsWith('.') || whenCondition.startsWith('[') || whenCondition.startsWith(':')) {
                composedAnchor = `${composedAnchor}${whenCondition}`
            } else {
                composedAnchor = `${composedAnchor}.${whenCondition}`
            }
        }

        for (const mod of selfPseudoModifiers) {
            composedAnchor = `${composedAnchor}${mod}`
        }

        if (anchorPseudo) {
            composedAnchor = `${composedAnchor}${anchorPseudo}`
        }
    }

    // 3. Assemble base selector
    let fullBase = ''
    if (isHostAnchor) {
        fullBase = composedHost || ':host'
    } else if (composedHost) {
        fullBase = composedAnchor ? `${composedHost} ${composedAnchor}` : composedHost
    } else {
        fullBase = composedAnchor
    }

    // 4. Combine with descendant selector
    if (descendantSelector) {
        return `${fullBase}${descendantSelector}`
    }

    if (!targetSelector || targetSelector === anchor || targetSelector === anchorBase || anchorCompoundMod) {
        return fullBase
    }

    if (targetSelector.startsWith(':host')) {
        return targetSelector
    }

    return fullBase ? `${fullBase} ${targetSelector}` : targetSelector
}

function isWrapperAtRule(header: string): boolean {
    return /^@(layer|media|supports|container|starting-style)(\s|$)/i.test(header)
}

function isKeyframesAtRule(header: string): boolean {
    return /^@(-webkit-)?keyframes(\s|$)/i.test(header)
}

function parseKeyframeSteps(body: string, meta: StateTokenMetadata): KeyframeStepNode[] {
    const steps: KeyframeStepNode[] = []
    let i = 0
    const len = body.length

    while (i < len) {
        while (i < len && /\s/.test(body[i])) i++
        if (i >= len) break

        const delim = findNextDelimiter(body, i)
        if (!delim || delim.type !== '{') break

        const openBrace = delim.index
        const selector = body.slice(i, openBrace).trim()
        const closeBrace = findMatchingClosingBrace(body, openBrace)

        const stepContent = body.slice(openBrace + 1, closeBrace).trim()
        i = closeBrace + 1

        const declarations: DeclarationNode[] = []
        let k = 0
        while (k < stepContent.length) {
            while (k < stepContent.length && /\s/.test(stepContent[k])) k++
            if (k >= stepContent.length) break
            const nextDelim = findNextDelimiter(stepContent, k)
            const chunk = nextDelim
                ? stepContent.slice(k, nextDelim.index).trim()
                : stepContent.slice(k).trim()
            k = nextDelim ? nextDelim.index + 1 : stepContent.length
            if (chunk) {
                const decl = parseDeclarationString(chunk, meta)
                if (decl) declarations.push(decl)
            }
        }

        if (selector) {
            steps.push({ selector, declarations })
        }
    }

    return steps
}

function extractAtRuleParam(header: string, prefix: string): string {
    const openIdx = header.indexOf('(')
    if (openIdx === -1) return ''

    let depth = 0
    let closeIdx = -1
    for (let k = openIdx; k < header.length; k++) {
        if (header[k] === '(') depth++
        else if (header[k] === ')') {
            depth--
            if (depth === 0) {
                closeIdx = k
                break
            }
        }
    }

    if (closeIdx !== -1) {
        return header.slice(openIdx + 1, closeIdx).trim()
    }
    return ''
}

function normalizeTokenName(tokenName: string, statesList: readonly string[]): string {
    const statesToCheck = new Set([...statesList, 'enabled', 'hovered', 'hover', 'pressed', 'active', 'focused', 'focus', 'disabled'])
    for (const s of statesToCheck) {
        if (tokenName.startsWith(`${s}-`)) {
            return tokenName.slice(s.length + 1)
        }
    }
    return tokenName
}

function checkDeclarationDiagnostics(
    decl: DeclarationNode,
    meta: StateTokenMetadata,
    options: CompileStateSheetOptions | undefined,
    currentScopeVariants: readonly string[] | null
): void {
    if (!meta.isVariantDictionary) return

    for (const rawToken of decl.referencedTokens) {
        const tokenName = (meta.allTokens.has(rawToken) || meta.hasToken(rawToken))
            ? rawToken
            : normalizeTokenName(rawToken, meta.statesList)

        if (currentScopeVariants === null) {
            // Top-Level Shared Scope
            const definedIn = meta.allVariantNames.filter((v) => {
                const vTokens = meta.variantTokensMap.get(v)
                return vTokens?.has(tokenName) || vTokens?.has(rawToken)
            })
            const missingIn = meta.allVariantNames.filter((v) => {
                const vTokens = meta.variantTokensMap.get(v)
                return !vTokens?.has(tokenName) && !vTokens?.has(rawToken)
            })

            if (missingIn.length > 0 && definedIn.length > 0) {
                emitWarning(options, {
                    type: 'missing-token-in-shared-scope',
                    message: `[MDC Style Warning] Token "--_${rawToken}" referenced in top-level shared scope is only defined in variants [${definedIn.join(', ')}], missing in [${missingIn.join(', ')}]. Consider moving it into a @variant(...) block.`,
                    token: rawToken,
                    variants: definedIn,
                    missingVariants: missingIn
                })
            }
        } else {
            // @variant(...) scope
            for (const v of currentScopeVariants) {
                const vTokens = meta.variantTokensMap.get(v)
                if (vTokens && !vTokens.has(tokenName) && !vTokens.has(rawToken)) {
                    emitWarning(options, {
                        type: 'missing-token-in-variant-scope',
                        message: `[MDC Style Warning] Token "--_${rawToken}" referenced in @variant(${currentScopeVariants.join(', ')}) is not defined in variant "${v}".`,
                        token: rawToken,
                        variant: v,
                        variants: currentScopeVariants
                    })
                }
            }
        }
    }
}

function composeHostCondition(
    variants: readonly string[] | null,
    modifiers: readonly string[],
    options?: CompileStateSheetOptions
): string | undefined {
    const selectorFn = options?.variantSelector ?? ((v: string) => `:host([variant="${v}"])`)

    let baseHosts: string[] = []
    if (variants && variants.length > 0) {
        baseHosts = variants.map((v) => selectorFn(v))
    }

    if (baseHosts.length > 0) {
        return baseHosts.map((base) => {
            let res = base
            for (const mod of modifiers) {
                res = appendToHostSelector(res, mod)
            }
            return res
        }).join(', ')
    }

    if (modifiers.length > 0) {
        let res = ':host'
        for (const mod of modifiers) {
            res = appendToHostSelector(res, mod)
        }
        return res
    }

    return undefined
}

/**
 * Recursive descent parser for nested CSS blocks with ATRules.
 */
function parseCssRecursive(
    css: string,
    meta: StateTokenMetadata,
    options?: CompileStateSheetOptions,
    currentAnchor: string = ':host',
    currentTarget: string = '',
    currentHostCondition?: string,
    currentWhen?: string,
    isExplicitAnchor: boolean = false,
    currentScopeVariants: readonly string[] | null = null,
    currentHostModifiers: readonly string[] = []
): ASTNode[] {
    const nodes: ASTNode[] = []
    const currentDeclarations: DeclarationNode[] = []
    let currentElevation: number | undefined

    let i = 0
    const len = css.length

    while (i < len) {
        while (i < len && /\s/.test(css[i])) i++
        if (i >= len) break

        const delim = findNextDelimiter(css, i)
        if (!delim) {
            const trailing = css.slice(i).trim()
            if (trailing) {
                if (trailing.startsWith('@elevation')) {
                    const elevMatch = trailing.match(/@elevation\((\d+)\)/)
                    if (elevMatch) {
                        currentElevation = parseInt(elevMatch[1], 10)
                    }
                } else {
                    const decl = parseDeclarationString(trailing, meta)
                    if (decl) {
                        checkDeclarationDiagnostics(decl, meta, options, currentScopeVariants)
                        currentDeclarations.push(decl)
                    }
                }
            }
            break
        }

        // Case 1: Declaration or Statement ';'
        if (delim.type === ';') {
            const declChunk = css.slice(i, delim.index).trim()
            if (declChunk) {
                if (declChunk.startsWith('@elevation')) {
                    const elevMatch = declChunk.match(/@elevation\((\d+)\)/)
                    if (elevMatch) {
                        currentElevation = parseInt(elevMatch[1], 10)
                    }
                } else {
                    const decl = parseDeclarationString(declChunk, meta)
                    if (decl) {
                        checkDeclarationDiagnostics(decl, meta, options, currentScopeVariants)
                        currentDeclarations.push(decl)
                    }
                }
            }
            i = delim.index + 1
            continue
        }

        // Case 2: Block '{'
        const header = css.slice(i, delim.index).trim()
        const openBrace = delim.index
        const closeBrace = findMatchingClosingBrace(css, openBrace)
        const body = css.slice(openBrace + 1, closeBrace).trim()
        i = closeBrace + 1

        if (!header) continue

        // ATRule: @anchor <sel>
        if (header.startsWith('@anchor')) {
            const anchorSelector = header.replace(/^@anchor\s+/, '').trim()
            const anchorParts = splitSelectorByComma(anchorSelector)
            for (const anc of anchorParts) {
                const childRules = parseCssRecursive(
                    body,
                    meta,
                    options,
                    anc,
                    anc,
                    currentHostCondition,
                    currentWhen,
                    true,
                    currentScopeVariants,
                    currentHostModifiers
                )
                nodes.push(...childRules)
            }
            continue
        }

        // ATRule: @when(...)
        if (header.startsWith('@when')) {
            const whenConditionRaw = extractAtRuleParam(header, '@when')
            if (whenConditionRaw.startsWith(':host')) {
                const nextHostMods = [...currentHostModifiers, whenConditionRaw]
                const childHostCond = composeHostCondition(currentScopeVariants, nextHostMods, options)
                const childRules = parseCssRecursive(
                    body,
                    meta,
                    options,
                    currentAnchor,
                    currentTarget,
                    childHostCond,
                    currentWhen,
                    isExplicitAnchor,
                    currentScopeVariants,
                    nextHostMods
                )
                nodes.push(...childRules)
            } else {
                const formattedWhen = whenConditionRaw.startsWith('.') || whenConditionRaw.startsWith('[') || whenConditionRaw.startsWith(':')
                    ? whenConditionRaw
                    : `.${whenConditionRaw}`
                const combinedWhen = currentWhen
                    ? `${currentWhen}${formattedWhen}`
                    : formattedWhen
                const childRules = parseCssRecursive(
                    body,
                    meta,
                    options,
                    currentAnchor,
                    currentTarget,
                    currentHostCondition,
                    combinedWhen,
                    isExplicitAnchor,
                    currentScopeVariants,
                    currentHostModifiers
                )
                nodes.push(...childRules)
            }
            continue
        }

        // ATRule: @variant(...)
        if (header.startsWith('@variant')) {
            const variantParam = extractAtRuleParam(header, '@variant')
            const patterns = variantParam ? variantParam.split(',').map((v) => v.trim()).filter(Boolean) : []
            const availableVariants = currentScopeVariants !== null ? currentScopeVariants : meta.allVariantNames
            const matched = matchVariants(patterns, availableVariants)

            if (meta.isVariantDictionary) {
                for (const pat of patterns) {
                    const cleanPat = pat.startsWith('!') ? pat.slice(1).trim() : pat
                    const patMatches = matchVariants([cleanPat], meta.allVariantNames)
                    if (patMatches.length === 0) {
                        emitWarning(options, {
                            type: 'unknown-variant',
                            message: `[MDC Style Warning] Unknown variant pattern "${pat}" in @variant(${variantParam}). Available variants: [${meta.allVariantNames.join(', ')}].`,
                            variant: pat,
                            variants: meta.allVariantNames
                        })
                    }
                }

                if (matched.length === 0) {
                    continue
                }
            }

            const selectorFn = options?.variantSelector ?? ((v: string) => `:host([variant="${v}"])`)
            const nextScopeVariants = matched.length > 0
                ? matched
                : (meta.isVariantDictionary ? [] : (currentScopeVariants ?? patterns.filter((p) => !p.startsWith('!'))))

            let childHostCond = composeHostCondition(
                nextScopeVariants.length > 0 ? nextScopeVariants : (patterns.filter((p) => !p.startsWith('!')).length > 0 ? patterns.filter((p) => !p.startsWith('!')) : null),
                currentHostModifiers,
                options
            )

            if (!childHostCond && nextScopeVariants.length === 0 && patterns.length > 0) {
                childHostCond = patterns.filter((p) => !p.startsWith('!')).map((v) => selectorFn(v)).join(', ')
            }

            const childRules = parseCssRecursive(
                body,
                meta,
                options,
                currentAnchor,
                currentTarget,
                childHostCond,
                currentWhen,
                isExplicitAnchor,
                nextScopeVariants.length > 0 ? nextScopeVariants : (currentScopeVariants ?? null),
                currentHostModifiers
            )
            nodes.push(...childRules)
            continue
        }

        // ATRule: @size(...)
        if (header.startsWith('@size')) {
            const sizeParam = extractAtRuleParam(header, '@size')
            const sizesRaw = sizeParam ? sizeParam.split(',').map((s) => s.trim()).filter(Boolean) : []
            const combinedSizeHost = sizesRaw.map((s) => `:host([size="${s}"])`).join(', ')

            const nextHostMods = [...currentHostModifiers, combinedSizeHost]
            const childHostCond = composeHostCondition(currentScopeVariants, nextHostMods, options)

            const childRules = parseCssRecursive(
                body,
                meta,
                options,
                currentAnchor,
                currentTarget,
                childHostCond,
                currentWhen,
                isExplicitAnchor,
                currentScopeVariants,
                nextHostMods
            )
            nodes.push(...childRules)
            continue
        }

        // ATRule: @slotted(...) — Check @slotted before @slot!
        if (header.startsWith('@slotted')) {
            const slotName = extractAtRuleParam(header, '@slotted')
            const slottedSelector = (slotName === 'default' || slotName === '')
                ? '::slotted(:not([slot]))'
                : `::slotted([slot="${slotName}"])`

            const childRules = parseCssRecursive(
                body,
                meta,
                options,
                slottedSelector,
                slottedSelector,
                undefined,
                undefined,
                true,
                currentScopeVariants,
                []
            )
            nodes.push(...childRules)
            continue
        }

        // ATRule: @slot(...)
        if (header.startsWith('@slot')) {
            const slotName = extractAtRuleParam(header, '@slot')
            const slotQuery = (slotName === 'default' || slotName === '')
                ? ':host(:has(:not([slot])))'
                : `:host(:has([slot="${slotName}"]))`

            const nextHostMods = [...currentHostModifiers, slotQuery]
            const childHostCond = composeHostCondition(currentScopeVariants, nextHostMods, options)

            const childRules = parseCssRecursive(
                body,
                meta,
                options,
                currentAnchor,
                currentTarget,
                childHostCond,
                currentWhen,
                isExplicitAnchor,
                currentScopeVariants,
                nextHostMods
            )
            nodes.push(...childRules)
            continue
        }

        // ATRule: @keyframes
        if (isKeyframesAtRule(header)) {
            const steps = parseKeyframeSteps(body, meta)
            nodes.push({
                type: 'keyframes',
                header,
                steps
            })
            continue
        }

        // Wrapper At-Rules (@layer, @media, @supports, @container, @starting-style)
        if (isWrapperAtRule(header)) {
            const children = parseCssRecursive(
                body,
                meta,
                options,
                currentAnchor,
                currentTarget,
                currentHostCondition,
                currentWhen,
                isExplicitAnchor,
                currentScopeVariants,
                currentHostModifiers
            )
            nodes.push({
                type: 'wrapper-at-rule',
                atRuleHeader: header,
                children
            })
            continue
        }

        const headerParts = splitSelectorByComma(header)
        if (headerParts.length > 1) {
            for (const part of headerParts) {
                const partRules = parseCssRecursive(
                    `${part} { ${body} }`,
                    meta,
                    options,
                    currentAnchor,
                    currentTarget,
                    currentHostCondition,
                    currentWhen,
                    isExplicitAnchor,
                    currentScopeVariants,
                    currentHostModifiers
                )
                nodes.push(...partRules)
            }
            continue
        }

        // Host selector refinement
        let childAnchor = currentAnchor
        let childHostCond = currentHostCondition
        let childHostMods = currentHostModifiers
        let composedTarget = header

        if (!isExplicitAnchor && header.startsWith(':host')) {
            const { hostPart, descendantPart } = extractHostAndDescendant(header)
            if (descendantPart) {
                childAnchor = ''
                childHostCond = undefined
                composedTarget = header
            } else if (header === ':host') {
                childAnchor = currentHostCondition || ':host'
                childHostCond = currentHostCondition || ':host'
                composedTarget = ''
            } else {
                childHostMods = [...currentHostModifiers, header]
                childHostCond = composeHostCondition(currentScopeVariants, childHostMods, options) || header
                childAnchor = childHostCond
                composedTarget = ''
            }
        } else if (currentTarget) {
            const parentParts = splitSelectorByComma(currentTarget)
            const combined: string[] = []

            for (const p of parentParts) {
                if (header.startsWith('&')) {
                    combined.push(header.replace(/^&/, p))
                } else {
                    combined.push(`${p} ${header}`)
                }
            }
            composedTarget = combined.join(', ')
        } else if (!isExplicitAnchor) {
            composedTarget = header
            childAnchor = currentAnchor === ':host' ? '' : currentAnchor
        }

        const childRules = parseCssRecursive(
            body,
            meta,
            options,
            childAnchor,
            composedTarget,
            childHostCond,
            currentWhen,
            isExplicitAnchor,
            currentScopeVariants,
            childHostMods
        )
        nodes.push(...childRules)
    }

    if (currentDeclarations.length > 0 || currentElevation !== undefined) {
        const finalDecls = [...currentDeclarations]
        if (currentElevation !== undefined) {
            finalDecls.push({
                property: 'box-shadow',
                value: `var(--mdc-elevation-level-${currentElevation})`,
                referencedTokens: [],
                stateTokens: [],
                isStateDependent: false
            })

            const shadowTransition = 'box-shadow 200ms cubic-bezier(0.2, 0, 0, 1)'
            const existingTransIdx = finalDecls.findIndex((d) => d.property === 'transition')

            if (existingTransIdx !== -1) {
                const existing = finalDecls[existingTransIdx]
                if (!existing.value.includes('box-shadow')) {
                    finalDecls[existingTransIdx] = {
                        ...existing,
                        value: `${existing.value}, ${shadowTransition}`
                    }
                }
            } else {
                finalDecls.push({
                    property: 'transition',
                    value: shadowTransition,
                    referencedTokens: [],
                    stateTokens: [],
                    isStateDependent: false
                })
            }
        }

        nodes.unshift({
            type: 'style-rule',
            selector: currentTarget || currentAnchor,
            anchor: currentAnchor,
            hostCondition: currentHostCondition,
            whenCondition: currentWhen,
            declarations: Object.freeze(finalDecls),
            elevationLevel: currentElevation
        })
    }

    return nodes
}

/**
 * Resolves a declaration value for a specific state (e.g. 'enabled', 'hovered', 'selected').
 */
function resolveStateValue(
    decl: DeclarationNode,
    state: string,
    meta: StateTokenMetadata
): string {
    let result = decl.value
    for (const token of decl.referencedTokens) {
        if (state === 'enabled' || state === 'base' || state === meta.baseState) {
            const baseVarName = meta.resolveStateVarName(token, meta.baseState)
            result = result.replaceAll(`var(--_${token})`, `var(--_${baseVarName})`)
        } else if (meta.hasStateDelta(token, state) || meta.hasStateToken(token, state)) {
            const stateVarName = meta.resolveStateVarName(token, state)
            result = result.replaceAll(`var(--_${token})`, `var(--_${stateVarName})`)
        } else {
            const fallbackVarName = meta.resolveStateVarName(token, meta.baseState)
            result = result.replaceAll(`var(--_${token})`, `var(--_${fallbackVarName})`)
        }
    }
    return result
}

/**
 * Decomposes compound shorthand properties (border, outline, background) for delta rule generation.
 */
function decomposeDeclarationForDelta(
    decl: DeclarationNode,
    state: string,
    meta: StateTokenMetadata
): { property: string; value: string } | null {
    if (!decl.isStateDependent) return null
    if (!decl.stateTokens.some((t) => meta.hasStateDelta(t, state))) return null

    const resolvedVal = resolveStateValue(decl, state, meta)

    // Handle border shorthand decomposition
    if (decl.property === 'border') {
        const varMatch = resolvedVal.match(/var\(--_[a-zA-Z0-9_:-]+\)/)
        if (varMatch) {
            return {
                property: 'border-color',
                value: varMatch[0]
            }
        }
        const colorMatch = resolvedVal.match(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|transparent|currentColor|[a-zA-Z]+)$/)
        return {
            property: 'border-color',
            value: colorMatch ? colorMatch[0] : resolvedVal
        }
    }

    // Handle outline shorthand decomposition
    if (decl.property === 'outline') {
        const varMatch = resolvedVal.match(/var\(--_[a-zA-Z0-9_:-]+\)/)
        if (varMatch) {
            return {
                property: 'outline-color',
                value: varMatch[0]
            }
        }
        const colorMatch = resolvedVal.match(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|transparent|currentColor|[a-zA-Z]+)$/)
        return {
            property: 'outline-color',
            value: colorMatch ? colorMatch[0] : resolvedVal
        }
    }

    // Handle background / background-color
    if (decl.property === 'background') {
        return {
            property: 'background-color',
            value: resolvedVal
        }
    }

    return {
        property: decl.property,
        value: resolvedVal
    }
}

interface CompiledChunks {
    base: string[]
    deltas: Map<string, string[]>
}

function compileAstNodes(
    nodes: readonly ASTNode[],
    meta: StateTokenMetadata,
    registry: StateTriggerRegistry
): CompiledChunks {
    const chunks: CompiledChunks = {
        base: [],
        deltas: new Map<string, string[]>()
    }

    const nonBaseStates = meta.statesList.filter((s) => s !== meta.baseState && s !== 'enabled')
    for (const state of nonBaseStates) {
        chunks.deltas.set(state, [])
    }

    for (const node of nodes) {
        if (node.type === 'style-rule' || node.type === 'rule') {
            const { anchor, selector, hostCondition, whenCondition, declarations, elevationLevel } = node

            // 1. Base Rule (enabled / base state)
            const baseDecls: string[] = []
            for (const decl of declarations) {
                const resolvedVal = resolveStateValue(decl, meta.baseState, meta)
                baseDecls.push(`${decl.property}: ${resolvedVal};`)
            }

            if (baseDecls.length > 0) {
                const baseSel = composeStateSelector({
                    anchor,
                    targetSelector: selector,
                    hostCondition,
                    whenCondition,
                    states: [],
                    registry
                })
                chunks.base.push(`${baseSel} {\n    ${baseDecls.join('\n    ')}\n}`)
            }

            // 2. Differential Delta Rules
            for (const state of nonBaseStates) {
                const stateDecls: string[] = []

                for (const decl of declarations) {
                    const deltaDecl = decomposeDeclarationForDelta(decl, state, meta)
                    if (deltaDecl) {
                        stateDecls.push(`${deltaDecl.property}: ${deltaDecl.value};`)
                    }
                }

                if (elevationLevel !== undefined && (state === 'disabled' || state === 'disabled-state')) {
                    stateDecls.push('box-shadow: none;')
                }

                if (stateDecls.length > 0) {
                    const stateSel = composeStateSelector({
                        anchor,
                        targetSelector: selector,
                        hostCondition,
                        whenCondition,
                        states: [state],
                        registry
                    })
                    chunks.deltas.get(state)!.push(`${stateSel} {\n    ${stateDecls.join('\n    ')}\n}`)
                }
            }
        } else if (node.type === 'keyframes') {
            const stepStrings: string[] = []
            for (const step of node.steps) {
                const declStrings: string[] = []
                for (const decl of step.declarations) {
                    const resolvedVal = resolveStateValue(decl, meta.baseState, meta)
                    declStrings.push(`${decl.property}: ${resolvedVal};`)
                }
                stepStrings.push(`    ${step.selector} {\n        ${declStrings.join('\n        ')}\n    }`)
            }
            chunks.base.push(`${node.header} {\n${stepStrings.join('\n\n')}\n}`)
        } else if (node.type === 'wrapper-at-rule') {
            const inner = compileAstNodes(node.children, meta, registry)

            if (inner.base.length > 0) {
                chunks.base.push(`${node.atRuleHeader} {\n${inner.base.join('\n\n')}\n}`)
            }

            for (const state of nonBaseStates) {
                const stateRules = inner.deltas.get(state)
                if (stateRules && stateRules.length > 0) {
                    chunks.deltas.get(state)!.push(`${node.atRuleHeader} {\n${stateRules.join('\n\n')}\n}`)
                }
            }
        }
    }

    return chunks
}

/**
 * Compiles an MDC CSS template string with ATRules and state awareness into standard CSS with minimal differential rules.
 *
 * @param definition - Component style definition containing StateSchema and token mappings.
 * @param cssText - Raw stylesheet template string. New-system ATRules (`@state`,
 * `@variant` exact names, `@when(:host(...))`, property expanders, a11y macros;
 * semantics Oracle: `at-rules.spec.ts`) route to the At-Rules compiler; stylesheets
 * containing `@anchor <sel>` / `@size` route to the legacy token-differential engine
 * (which additionally lowers `@slot` / `@slotted` / `@size` / `@elevation` and
 * wildcard `@variant`).
 * @param options - Compilation options including StateTriggerRegistry.
 * @returns Formatted standard CSS string.
 *
 * @example
 * ```typescript
 * import { compileStateSheet } from '@sandlada/mdc/utils/styles/state-sheet-compiler'
 * import { mapStateTriggers } from '@sandlada/mdc/utils/styles/map-state-triggers'
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
 *
 * // Legacy token-differential system (routes via `@anchor <sel>`):
 * const legacy = compileStateSheet(ButtonDefinition, `
 *     @anchor .container {
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

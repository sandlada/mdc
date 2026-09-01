/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { StateTriggerRegistry } from './map-state-triggers'
import { type StateTrigger, type TriggerContext } from './host-trigger'
import type { StateSchema } from './define-schema'

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

export interface CompileStateSheetOptions {
    readonly registry?: StateTriggerRegistry
    readonly triggers?: Record<string, StateTrigger | string> | (StateTrigger | Record<string, StateTrigger | string>)[]
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
}

function canonicalizeState(state: string): string {
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

/**
 * Extracts comprehensive state token metadata from component style definition(s).
 */
export function extractStateTokenMetadata(definition: any): StateTokenMetadata {
    const definitions = Array.isArray(definition) ? definition : [definition]
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
        baseState
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
            currentAccum += ch
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

let currentAccum = ''

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
 * Appends a modifier to a :host selector, respecting depth-balanced parentheses and comma-separated selectors.
 */
export function appendToHostSelector(hostSelector: string, modifier: string): string {
    if (!modifier) return hostSelector

    const parts = splitSelectorByComma(hostSelector)
    if (parts.length > 1) {
        return parts.map((part) => appendToHostSelector(part, modifier)).join(', ')
    }

    const trimmed = hostSelector.trim()
    if (trimmed === ':host') {
        const cleanMod = modifier.startsWith('(') && modifier.endsWith(')')
            ? modifier
            : modifier.startsWith('[') || modifier.startsWith(':') || modifier.startsWith('.')
                ? `(${modifier})`
                : `(${modifier})`
        return `:host${cleanMod}`
    }

    if (trimmed.startsWith(':host(')) {
        let depth = 0
        let closeIdx = -1

        for (let i = 5; i < trimmed.length; i++) {
            if (trimmed[i] === '(') depth++
            else if (trimmed[i] === ')') {
                depth--
                if (depth === 0) {
                    closeIdx = i
                    break
                }
            }
        }

        if (closeIdx !== -1) {
            const inner = trimmed.slice(6, closeIdx)
            const after = trimmed.slice(closeIdx + 1)
            const modToAppend = modifier.startsWith(':host(')
                ? modifier.slice(6, -1)
                : modifier
            return `:host(${inner}${modToAppend})${after}`
        }
    }

    return `${trimmed}${modifier}`
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

    const isHostAnchor = anchor === ':host' || anchor.startsWith(':host(')
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
        composedHost = anchor
    } else if (hostCondition) {
        composedHost = hostCondition.startsWith(':host')
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
        fullBase = `${composedHost} ${composedAnchor}`
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

    return `${fullBase} ${targetSelector}`
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

/**
 * Recursive descent parser for nested CSS blocks with ATRules.
 */
function parseCssRecursive(
    css: string,
    meta: StateTokenMetadata,
    currentAnchor: string = ':host',
    currentTarget: string = '',
    currentHostCondition?: string,
    currentWhen?: string,
    isExplicitAnchor: boolean = false
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
                    if (decl) currentDeclarations.push(decl)
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
                const childRules = parseCssRecursive(body, meta, anc, anc, currentHostCondition, currentWhen, true)
                nodes.push(...childRules)
            }
            continue
        }

        // ATRule: @when(...)
        if (header.startsWith('@when')) {
            const whenConditionRaw = extractAtRuleParam(header, '@when')
            if (whenConditionRaw.startsWith(':host')) {
                const childRules = parseCssRecursive(body, meta, currentAnchor, currentTarget, whenConditionRaw, currentWhen, isExplicitAnchor)
                nodes.push(...childRules)
            } else {
                const formattedWhen = whenConditionRaw.startsWith('.') || whenConditionRaw.startsWith('[') || whenConditionRaw.startsWith(':')
                    ? whenConditionRaw
                    : `.${whenConditionRaw}`
                const combinedWhen = currentWhen
                    ? `${currentWhen}${formattedWhen}`
                    : formattedWhen
                const childRules = parseCssRecursive(body, meta, currentAnchor, currentTarget, currentHostCondition, combinedWhen, isExplicitAnchor)
                nodes.push(...childRules)
            }
            continue
        }

        // ATRule: @variant(...)
        if (header.startsWith('@variant')) {
            const variantParam = extractAtRuleParam(header, '@variant')
            const variantsRaw = variantParam ? variantParam.split(',').map((v) => v.trim()).filter(Boolean) : []
            const combinedVariantHost = variantsRaw.map((v) => `:host([variant="${v}"])`).join(', ')

            const childRules = parseCssRecursive(body, meta, currentAnchor, currentTarget, combinedVariantHost, currentWhen, isExplicitAnchor)
            nodes.push(...childRules)
            continue
        }

        // ATRule: @size(...)
        if (header.startsWith('@size')) {
            const sizeParam = extractAtRuleParam(header, '@size')
            const sizesRaw = sizeParam ? sizeParam.split(',').map((s) => s.trim()).filter(Boolean) : []
            const combinedSizeHost = sizesRaw.map((s) => `:host([size="${s}"])`).join(', ')

            const childRules = parseCssRecursive(body, meta, currentAnchor, currentTarget, combinedSizeHost, currentWhen, isExplicitAnchor)
            nodes.push(...childRules)
            continue
        }

        // ATRule: @slotted(...) — Check @slotted before @slot!
        if (header.startsWith('@slotted')) {
            const slotName = extractAtRuleParam(header, '@slotted')
            const slottedSelector = (slotName === 'default' || slotName === '')
                ? '::slotted(:not([slot]))'
                : `::slotted([slot="${slotName}"])`

            const childRules = parseCssRecursive(body, meta, slottedSelector, slottedSelector, undefined, undefined, true)
            nodes.push(...childRules)
            continue
        }

        // ATRule: @slot(...)
        if (header.startsWith('@slot')) {
            const slotName = extractAtRuleParam(header, '@slot')
            const slotQuery = (slotName === 'default' || slotName === '')
                ? ':host(:has(:not([slot])))'
                : `:host(:has([slot="${slotName}"]))`

            const childRules = parseCssRecursive(body, meta, currentAnchor, currentTarget, slotQuery, currentWhen, isExplicitAnchor)
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
            const children = parseCssRecursive(body, meta, currentAnchor, currentTarget, currentHostCondition, currentWhen, isExplicitAnchor)
            nodes.push({
                type: 'wrapper-at-rule',
                atRuleHeader: header,
                children
            })
            continue
        }

        // Host selector refinement
        let childAnchor = currentAnchor
        let childHostCond = currentHostCondition
        if (!isExplicitAnchor && header.startsWith(':host')) {
            childAnchor = header
            childHostCond = header
        }

        // Normal descendant / child selector with & expansion
        let composedTarget = header
        if (currentTarget) {
            const parentParts = splitSelectorByComma(currentTarget)
            const headerParts = splitSelectorByComma(header)
            const combined: string[] = []

            for (const p of parentParts) {
                for (const h of headerParts) {
                    if (h.startsWith('&')) {
                        combined.push(h.replace(/^&/, p))
                    } else {
                        combined.push(`${p} ${h}`)
                    }
                }
            }
            composedTarget = combined.join(', ')
        }

        const childRules = parseCssRecursive(body, meta, childAnchor, composedTarget, childHostCond, currentWhen, isExplicitAnchor)
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
 * @param cssText - Raw stylesheet template string containing ATRules (@anchor, @when, @variant, @slot, @size, @elevation).
 * @param options - Compilation options including StateTriggerRegistry.
 * @returns Formatted standard CSS string.
 *
 * @example
 * ```typescript
 * import { compileStateSheet } from '@sandlada/mdc/utils/styles/state-sheet-compiler'
 * import { mapStateTriggers } from '@sandlada/mdc/utils/styles/map-state-triggers'
 * import { hostTrigger } from '@sandlada/mdc/utils/styles/host-trigger'
 * import { ButtonDefinition } from './button.definition'
 *
 * const triggers = mapStateTriggers({
 *     'enabled': '',
 *     'selected': hostTrigger('[selected]')
 * })
 *
 * const compiled = compileStateSheet(ButtonDefinition, `
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

    const registry = options?.registry
        ? options.registry.clone()
        : new StateTriggerRegistry(options?.triggers)

    if (options?.triggers && options.registry) {
        registry.registerAll(options.triggers)
    }

    const meta = extractStateTokenMetadata(definition)
    const cleanCss = stripComments(cssText)
    const nodes = parseCssRecursive(cleanCss, meta)
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

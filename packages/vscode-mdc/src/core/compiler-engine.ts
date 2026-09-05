/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * SSOT note: pure selector/string/state helpers (`splitSelectorByComma`,
 * `appendToHostSelector`, `matchVariants`, `canonicalizeState`,
 * `StateTriggerRegistry` + triggers) come from `@sandlada/mdc/style-engine`
 * (Node-safe, DOM-free). Do NOT fork them here.
 * What stays local is intentional IDE-layer only: `DefinitionMeta`-based static
 * metadata, layered preview formatting, and the rolldown+VM genuine-CSS path.
 */
import type { DefinitionMeta, TokenValueMeta } from './types'
import { rolldown } from 'rolldown'
import * as lit from 'lit'
import * as vm from 'vm'
import * as path from 'path'
import { createRequire } from 'module'
import {
    splitSelectorByComma,
    appendToHostSelector,
    matchVariants,
    compileStateSheet,
    extractStateTokenMetadata,
    defineSchema,
    createStyleDefinition,
    forwardTokens,
    expandShape,
    expandPadding,
    expandTypescale,
    StateTriggerRegistry,
    mapStateTriggers,
    pipe,
    canonicalizeState
} from '@sandlada/mdc/style-engine'
export {
    splitSelectorByComma,
    appendToHostSelector,
    matchVariants,
    compileStateSheet,
    extractStateTokenMetadata,
    defineSchema,
    createStyleDefinition,
    forwardTokens,
    expandShape,
    expandPadding,
    expandTypescale,
    StateTriggerRegistry,
    mapStateTriggers,
    pipe,
    canonicalizeState
}

export type StateName = string
export const DEFAULT_STATE_NAMES: readonly string[] = ['enabled', 'hovered', 'focused', 'pressed', 'disabled'] as const
export const STATE_NAMES: readonly string[] = DEFAULT_STATE_NAMES
export type StateDeltaName = string
export const STATE_DELTA_NAMES: readonly string[] = ['hovered', 'focused', 'pressed', 'disabled'] as const

export interface TriggerTarget {
    readonly target: 'host' | 'self'
    readonly modifier: string
}

export type CustomTriggerMap = Map<string, { target: 'host' | 'self'; modifier: string }>

/**
 * Resolves a state name to a target + selector modifier by delegating to
 * `StateTriggerRegistry` (SSOT). Custom entries override registry defaults;
 * unregistered names fall back to the registry heuristics. `anchor` is unused
 * (kept empty) because only `isHostAnchor` affects resolution.
 */
export function resolveTrigger(
    stateName: string,
    isHostAnchor: boolean,
    customTriggers?: CustomTriggerMap
): TriggerTarget {
    const registry = new StateTriggerRegistry()
    if (customTriggers) {
        for (const [name, custom] of customTriggers) {
            registry.register(name, custom.modifier)
        }
    }
    const resolved = registry.resolve(stateName, { anchor: '', isHostAnchor })
    return { target: resolved.target, modifier: resolved.modifier }
}

export interface CompilerOptions {
    readonly triggers?: CustomTriggerMap
    readonly variantSelector?: (variantName: string) => string
}

export interface StateTokenMetadata {
    isStateToken(name: string): boolean
    hasStateToken(name: string, state: string): boolean
    hasToken(name: string): boolean
    hasStateDelta(tokenName: string, state: string): boolean
    resolveStateVarName(name: string, state: string): string
    allStateTokens: ReadonlySet<string>
    allTokens: ReadonlySet<string>
    statesList: readonly string[]
    baseState: string
}

export interface Declaration {
    property: string
    value: string
    referencedTokens: string[]
    isStateful: boolean
    stateTokens: string[]
}

export interface KeyframeStep {
    selector: string
    declarations: Declaration[]
}

export interface KeyframesNode {
    type: 'keyframes'
    header: string
    steps: KeyframeStep[]
}

export interface WrapperAtRuleNode {
    type: 'wrapper-at-rule'
    atRuleHeader: string
    children: AstNode[]
}

export interface StyleRuleNode {
    type: 'style-rule'
    selector: string
    anchor: string
    hostCondition?: string
    whenCondition?: string
    declarations: Declaration[]
    elevationLevel?: number
}

export type AstNode = WrapperAtRuleNode | KeyframesNode | StyleRuleNode

export interface CompiledChunks {
    base: string[]
    deltas: Map<string, string[]>
    atRules: string[]
}

export interface CompilationResult {
    exportName: string
    definitionNames: string[]
    totalRules: number
    stats: {
        baseRules: number
        hoverRules: number
        focusRules: number
        pressRules: number
        disabledRules: number
        otherRules: number
        atRules: number
    }
    compiledCss: string
    layers: {
        tokenLayer?: string
        stateSheetLayer?: string
        staticLayer?: string
    }
}

/**
 * Builds state token metadata from a set of DefinitionMeta objects.
 * Mirrors the main package `extractStateTokenMetadata`: states come from each
 * definition's schema (`states[0]` is the base state), records count as state
 * tokens, and deltas are computed by comparing values against the base value.
 */
export function extractStateTokenMetadataFromMeta(definitions: (DefinitionMeta | undefined)[]): StateTokenMetadata {
    const statesList: string[] = []
    const pushState = (s: string) => {
        if (s && !statesList.includes(s)) statesList.push(s)
    }

    for (const def of definitions) {
        if (!def) continue
        const schemaStates: string[] | undefined = (def.schema as { states?: string[] } | undefined)?.states
        if (schemaStates && schemaStates.length > 0) {
            for (const s of schemaStates) pushState(s)
        }
    }
    if (statesList.length === 0) {
        for (const s of DEFAULT_STATE_NAMES) pushState(s)
    }
    const baseState = statesList[0] ?? 'enabled'

    const allTokens = new Set<string>()
    const allStateTokens = new Set<string>()
    const definedStatesPerToken = new Map<string, Set<string>>()
    const deltaStatesPerToken = new Map<string, Set<string>>()
    const stateVarMap = new Map<string, string>()

    const ensureTokenStates = (key: string): Set<string> => {
        let set = definedStatesPerToken.get(key)
        if (!set) {
            set = new Set<string>()
            definedStatesPerToken.set(key, set)
        }
        return set
    }
    const ensureDeltaStates = (key: string): Set<string> => {
        let set = deltaStatesPerToken.get(key)
        if (!set) {
            set = new Set<string>()
            deltaStatesPerToken.set(key, set)
        }
        return set
    }
    const registerStateName = (tokenStates: Set<string>, key: string, sName: string) => {
        tokenStates.add(sName)
        stateVarMap.set(`${key}:${sName}`, `${sName}-${key}`)
        const canonical = canonicalizeState(sName)
        if (canonical !== sName) {
            tokenStates.add(canonical)
            stateVarMap.set(`${key}:${canonical}`, `${sName}-${key}`)
        }
    }

    for (const def of definitions) {
        if (!def) continue
        for (const [rawKey, token] of def.ownTokens) {
            const key = rawKey.replace(/^--_/, '').replace(/^--/, '')
            if (!key) continue
            allTokens.add(key)

            if (token.isTuple || token.isRecord) {
                allStateTokens.add(key)
                const tokenStates = ensureTokenStates(key)
                const deltaStates = ensureDeltaStates(key)
                const stateMap: Record<string, string> = token.stateMap ?? {}

                const baseValRaw = stateMap[baseState] ?? stateMap['enabled'] ?? Object.values(stateMap)[0]
                const baseValStr = baseValRaw === null || baseValRaw === undefined ? '' : String(baseValRaw)

                stateVarMap.set(`${key}:${baseState}`, `${baseState}-${key}`)
                stateVarMap.set(`${key}:enabled`, `${baseState}-${key}`)
                stateVarMap.set(`${key}:base`, `${baseState}-${key}`)

                for (const sName of Object.keys(stateMap)) {
                    const sVal = stateMap[sName]
                    if (sVal === null || sVal === undefined) continue
                    const sValStr = String(sVal)
                    registerStateName(tokenStates, key, sName)
                    if (sName !== baseState && sName !== 'enabled' && sValStr !== baseValStr) {
                        deltaStates.add(sName)
                        const canonical = canonicalizeState(sName)
                        if (canonical !== sName) deltaStates.add(canonical)
                    }
                }
                continue
            }

            stateVarMap.set(`${key}:${baseState}`, key)
            stateVarMap.set(`${key}:enabled`, key)
            stateVarMap.set(`${key}:base`, key)
        }
    }

    const resolveStateVarName = (name: string, state: string): string => {
        const clean = name.replace(/^--_?/, '')
        const canonical = canonicalizeState(state)
        const exact = stateVarMap.get(`${clean}:${state}`) ?? stateVarMap.get(`${clean}:${canonical}`)
        if (exact) return exact
        if (state === 'base' || state === 'enabled' || state === baseState) {
            const baseVar = stateVarMap.get(`${clean}:${baseState}`)
                ?? stateVarMap.get(`${clean}:enabled`)
                ?? stateVarMap.get(`${clean}:base`)
            if (baseVar) return baseVar
            return clean
        }
        return `${state}-${clean}`
    }

    return {
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
        hasToken(name: string) {
            const clean = name.replace(/^--_?/, '')
            return allTokens.has(clean) || stateVarMap.has(`${clean}:${baseState}`)
        },
        hasStateDelta(tokenName: string, state: string) {
            const clean = tokenName.replace(/^--_?/, '')
            const deltas = deltaStatesPerToken.get(clean)
            if (!deltas) return false
            const canonical = canonicalizeState(state)
            return deltas.has(state) || deltas.has(canonical)
        },
        resolveStateVarName,
        allStateTokens,
        allTokens,
        statesList,
        baseState
    }
}

/**
 * Strips comments while preserving quoted strings (mirrors the main package scanner).
 */
function stripComments(css: string): string {
    let result = ''
    let inSingleQuote = false
    let inDoubleQuote = false
    let inBlockComment = false
    let inLineComment = false
    let isEscaped = false

    for (let i = 0; i < css.length; i++) {
        const ch = css[i]
        const next = i + 1 < css.length ? css[i + 1] : ''

        if (inBlockComment) {
            if (ch === '*' && next === '/') {
                inBlockComment = false
                i++
            }
            continue
        }

        if (inLineComment) {
            if (ch === '\n') {
                inLineComment = false
                result += ch
            }
            continue
        }

        if (inSingleQuote || inDoubleQuote) {
            result += ch
            if (isEscaped) {
                isEscaped = false
            } else if (ch === '\\') {
                isEscaped = true
            } else if ((inSingleQuote && ch === "'") || (inDoubleQuote && ch === '"')) {
                inSingleQuote = false
                inDoubleQuote = false
            }
            continue
        }

        if (ch === '/' && next === '*') {
            inBlockComment = true
            i++
            continue
        }

        if (ch === '/' && next === '/') {
            inLineComment = true
            i++
            continue
        }

        if (ch === "'") {
            inSingleQuote = true
            result += ch
            continue
        }

        if (ch === '"') {
            inDoubleQuote = true
            result += ch
            continue
        }

        result += ch
    }

    return result
}

function findNextDelimiter(css: string, start: number): { type: ';' | '{'; index: number } | null {
    let inSingleQuote = false
    let inDoubleQuote = false
    let isEscaped = false
    let parenDepth = 0
    let bracketDepth = 0

    for (let i = start; i < css.length; i++) {
        const ch = css[i]

        if (inSingleQuote || inDoubleQuote) {
            if (isEscaped) {
                isEscaped = false
            } else if (ch === '\\') {
                isEscaped = true
            } else if ((inSingleQuote && ch === "'") || (inDoubleQuote && ch === '"')) {
                inSingleQuote = false
                inDoubleQuote = false
            }
            continue
        }

        if (ch === "'") {
            inSingleQuote = true
            continue
        }
        if (ch === '"') {
            inDoubleQuote = true
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
        if (parenDepth !== 0 || bracketDepth !== 0) continue

        if (ch === ';') return { type: ';', index: i }
        if (ch === '{') return { type: '{', index: i }
    }

    return null
}

function findMatchingClosingBrace(css: string, openBraceIndex: number): number {
    let depth = 0
    let inSingleQuote = false
    let inDoubleQuote = false
    let isEscaped = false

    for (let i = openBraceIndex; i < css.length; i++) {
        const ch = css[i]

        if (inSingleQuote || inDoubleQuote) {
            if (isEscaped) {
                isEscaped = false
            } else if (ch === '\\') {
                isEscaped = true
            } else if ((inSingleQuote && ch === "'") || (inDoubleQuote && ch === '"')) {
                inSingleQuote = false
                inDoubleQuote = false
            }
            continue
        }

        if (ch === "'") {
            inSingleQuote = true
            continue
        }
        if (ch === '"') {
            inDoubleQuote = true
            continue
        }
        if (ch === '{') {
            depth++
            continue
        }
        if (ch === '}') {
            depth--
            if (depth === 0) return i
        }
    }

    return css.length - 1
}

function parseDeclarationString(raw: string, meta: StateTokenMetadata): Declaration | null {
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
        isStateful: stateTokens.length > 0,
        stateTokens
    }
}

function parseKeyframeSteps(body: string, meta: StateTokenMetadata): KeyframeStep[] {
    const steps: KeyframeStep[] = []
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

        const declarations: Declaration[] = []
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

function isWrapperAtRule(header: string): boolean {
    return /^@(layer|media|supports|container|starting-style)(\s|$)/i.test(header)
}

function isKeyframesAtRule(header: string): boolean {
    return /^@(-webkit-)?keyframes(\s|$)/i.test(header)
}

function defaultVariantSelector(variantName: string): string {
    return `:host([variant="${variantName}"])`
}

function composeHostCondition(
    variants: readonly string[] | null,
    modifiers: readonly string[],
    options?: CompilerOptions
): string | undefined {
    const selectorFn = options?.variantSelector ?? defaultVariantSelector

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

function extractAtRuleParam(header: string): string {
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
 * Recursive CSS parser supporting @anchor, @when, @variant, @size, @slot,
 * @slotted, @elevation, @keyframes, nested selectors, and wrapper at-rules.
 */
function parseCssRecursive(
    css: string,
    meta: StateTokenMetadata,
    currentAnchor: string = ':host',
    currentTarget: string = '',
    currentHostCondition?: string,
    currentWhen?: string,
    isExplicitAnchor: boolean = false,
    currentScopeVariants: readonly string[] | null = null,
    currentHostModifiers: readonly string[] = [],
    options?: CompilerOptions
): AstNode[] {
    const nodes: AstNode[] = []
    const currentDeclarations: Declaration[] = []
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
                    if (decl) currentDeclarations.push(decl)
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

        // ATRule: @anchor <sel> (comma-separated anchors supported)
        if (header.startsWith('@anchor')) {
            const anchorSelector = header.replace(/^@anchor\s+/, '').trim()
            const anchorParts = splitSelectorByComma(anchorSelector)
            for (const anc of anchorParts) {
                const childRules = parseCssRecursive(
                    body, meta, anc, anc, currentHostCondition, currentWhen,
                    true, currentScopeVariants, currentHostModifiers, options
                )
                nodes.push(...childRules)
            }
            continue
        }

        // ATRule: @when(...)
        if (header.startsWith('@when')) {
            const whenConditionRaw = extractAtRuleParam(header)
            if (whenConditionRaw.startsWith(':host')) {
                const nextHostMods = [...currentHostModifiers, whenConditionRaw]
                const childHostCond = composeHostCondition(currentScopeVariants, nextHostMods, options)
                const childRules = parseCssRecursive(
                    body, meta, currentAnchor, currentTarget, childHostCond,
                    currentWhen, isExplicitAnchor, currentScopeVariants, nextHostMods, options
                )
                nodes.push(...childRules)
            } else {
                const formattedWhen = whenConditionRaw.startsWith('.') || whenConditionRaw.startsWith('[') || whenConditionRaw.startsWith(':')
                    ? whenConditionRaw
                    : `.${whenConditionRaw}`
                const combinedWhen = currentWhen ? `${currentWhen}${formattedWhen}` : formattedWhen
                const childRules = parseCssRecursive(
                    body, meta, currentAnchor, currentTarget, currentHostCondition,
                    combinedWhen, isExplicitAnchor, currentScopeVariants, currentHostModifiers, options
                )
                nodes.push(...childRules)
            }
            continue
        }

        // ATRule: @variant(...) — scopes children to matching variants
        if (header.startsWith('@variant')) {
            const variantParam = extractAtRuleParam(header)
            const patterns = variantParam ? variantParam.split(',').map((v) => v.trim()).filter(Boolean) : []
            const selectorFn = options?.variantSelector ?? defaultVariantSelector
            const childHostCond = patterns.filter((p) => !p.startsWith('!')).map((v) => selectorFn(v)).join(', ') || undefined
            const childRules = parseCssRecursive(
                body, meta, currentAnchor, currentTarget,
                childHostCond ?? currentHostCondition,
                currentWhen, isExplicitAnchor, currentScopeVariants, currentHostModifiers, options
            )
            nodes.push(...childRules)
            continue
        }

        // ATRule: @size(...) — lowers to :host([size="..."]) modifiers
        if (header.startsWith('@size')) {
            const sizeParam = extractAtRuleParam(header)
            const sizesRaw = sizeParam ? sizeParam.split(',').map((s) => s.trim()).filter(Boolean) : []
            const combinedSizeHost = sizesRaw.map((s) => `:host([size="${s}"])`).join(', ')
            const nextHostMods = [...currentHostModifiers, combinedSizeHost]
            const childHostCond = composeHostCondition(currentScopeVariants, nextHostMods, options)
            const childRules = parseCssRecursive(
                body, meta, currentAnchor, currentTarget, childHostCond,
                currentWhen, isExplicitAnchor, currentScopeVariants, nextHostMods, options
            )
            nodes.push(...childRules)
            continue
        }

        // ATRule: @slotted(...) — must be checked before @slot
        if (header.startsWith('@slotted')) {
            const slotName = extractAtRuleParam(header)
            const slottedSelector = (slotName === 'default' || slotName === '')
                ? '::slotted(:not([slot]))'
                : `::slotted([slot="${slotName}"])`
            const childRules = parseCssRecursive(
                body, meta, slottedSelector, slottedSelector, undefined, undefined,
                true, currentScopeVariants, [], options
            )
            nodes.push(...childRules)
            continue
        }

        // ATRule: @slot(...)
        if (header.startsWith('@slot')) {
            const slotName = extractAtRuleParam(header)
            const slotQuery = (slotName === 'default' || slotName === '')
                ? ':host(:has(:not([slot])))'
                : `:host(:has([slot="${slotName}"]))`
            const nextHostMods = [...currentHostModifiers, slotQuery]
            const childHostCond = composeHostCondition(currentScopeVariants, nextHostMods, options)
            const childRules = parseCssRecursive(
                body, meta, currentAnchor, currentTarget, childHostCond,
                currentWhen, isExplicitAnchor, currentScopeVariants, nextHostMods, options
            )
            nodes.push(...childRules)
            continue
        }

        // Handle @keyframes
        if (isKeyframesAtRule(header)) {
            const steps = parseKeyframeSteps(body, meta)
            nodes.push({
                type: 'keyframes',
                header,
                steps
            })
            continue
        }

        // Handle wrapper at-rules
        if (isWrapperAtRule(header)) {
            const children = parseCssRecursive(
                body, meta, currentAnchor, currentTarget, currentHostCondition,
                currentWhen, isExplicitAnchor, currentScopeVariants, currentHostModifiers, options
            )
            nodes.push({
                type: 'wrapper-at-rule',
                atRuleHeader: header,
                children
            })
            continue
        }

        // Host selector refinement (comma-separated :host lists split per branch)
        let childAnchor = currentAnchor
        let childHostCond = currentHostCondition
        let childHostMods = currentHostModifiers
        let composedTarget = header

        if (!isExplicitAnchor && header.startsWith(':host')) {
            if (header === ':host') {
                childAnchor = currentHostCondition || ':host'
                childHostCond = currentHostCondition || ':host'
                composedTarget = ''
            } else {
                const headerParts = splitSelectorByComma(header)
                if (headerParts.length > 1 && headerParts.every((part) => part.startsWith(':host'))) {
                    for (const part of headerParts) {
                        const partMods = [...currentHostModifiers, part]
                        const partHostCond = composeHostCondition(currentScopeVariants, partMods, options) || part
                        const partRules = parseCssRecursive(
                            body, meta, partHostCond, '', partHostCond,
                            currentWhen, isExplicitAnchor, currentScopeVariants, partMods, options
                        )
                        nodes.push(...partRules)
                    }
                    continue
                }
                childHostMods = [...currentHostModifiers, header]
                childHostCond = composeHostCondition(currentScopeVariants, childHostMods, options) || header
                childAnchor = childHostCond
                composedTarget = ''
            }
        } else if (currentTarget) {
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

        const childRules = parseCssRecursive(
            body, meta, childAnchor, composedTarget, childHostCond,
            currentWhen, isExplicitAnchor, currentScopeVariants, childHostMods, options
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
                isStateful: false
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
                    isStateful: false
                })
            }
        }

        nodes.unshift({
            type: 'style-rule',
            selector: currentTarget || currentAnchor,
            anchor: currentAnchor,
            hostCondition: currentHostCondition,
            whenCondition: currentWhen,
            declarations: finalDecls,
            elevationLevel: currentElevation
        })
    }

    return nodes
}

function resolveStateValue(decl: Declaration, state: string, meta: StateTokenMetadata): string {
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
 * Decomposes compound shorthand properties (border, outline, background) for delta rules.
 */
function decomposeDeclarationForDelta(
    decl: Declaration,
    state: string,
    meta: StateTokenMetadata
): { property: string; value: string } | null {
    if (!decl.isStateful) return null
    if (!decl.stateTokens.some((t) => meta.hasStateDelta(t, state))) return null

    const resolvedVal = resolveStateValue(decl, state, meta)

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

export interface ComposeSelectorOptions {
    readonly anchor: string
    readonly targetSelector: string
    readonly hostCondition?: string
    readonly whenCondition?: string
    readonly states?: readonly string[]
    readonly triggers?: CustomTriggerMap
}

/**
 * Composes a full CSS selector across host triggers, anchor triggers, @when
 * conditions, and pseudo-element attachments (mirrors the main package).
 */
export function composeStateSelector(options: ComposeSelectorOptions): string {
    const {
        anchor,
        targetSelector,
        hostCondition,
        whenCondition,
        states = [],
        triggers
    } = options

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

    if (targetSelector && targetSelector.startsWith('::slotted')) {
        return targetSelector
    }

    const isHostAnchor = anchor.startsWith(':host') || anchor.startsWith(':where(') || anchor.startsWith(':is(')
    const hostModifiers: string[] = []
    const selfClassModifiers: string[] = []
    const selfPseudoModifiers: string[] = []

    for (const stateName of states) {
        if (!stateName || stateName === 'enabled' || stateName === 'base') continue
        const resolved = resolveTrigger(stateName, isHostAnchor, triggers)
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

    let fullBase = ''
    if (isHostAnchor) {
        fullBase = composedHost || ':host'
    } else if (composedHost) {
        fullBase = `${composedHost} ${composedAnchor}`
    } else {
        fullBase = composedAnchor
    }

    if (descendantSelector) {
        return `${fullBase}${descendantSelector}`
    }

    if (!targetSelector || targetSelector === anchor || targetSelector === anchorBase || anchorCompoundMod) {
        return fullBase
    }

    return `${fullBase} ${targetSelector}`
}

function compileAstNodes(
    nodes: AstNode[],
    meta: StateTokenMetadata,
    options?: CompilerOptions
): CompiledChunks {
    const chunks: CompiledChunks = {
        base: [],
        deltas: new Map<string, string[]>(),
        atRules: []
    }

    const triggers = options?.triggers
    const nonBaseStates = meta.statesList.filter((s) => s !== meta.baseState && s !== 'enabled')
    for (const state of nonBaseStates) {
        chunks.deltas.set(state, [])
    }

    for (const node of nodes) {
        if (node.type === 'style-rule') {
            const { anchor, selector, hostCondition, whenCondition, declarations, elevationLevel } = node

            // 1. Base Rule (base state, elevation already synthesized at parse time)
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
                    triggers
                })
                chunks.base.push(`${baseSel} {\n    ${baseDecls.join('\n    ')}\n}`)
            }

            // 2. Differential Delta Rules (only where values actually differ)
            for (const state of nonBaseStates) {
                const stateDecls: string[] = []

                for (const decl of declarations) {
                    const deltaDecl = decomposeDeclarationForDelta(decl, state, meta)
                    if (deltaDecl) {
                        stateDecls.push(`${deltaDecl.property}: ${deltaDecl.value};`)
                    }
                }

                if (elevationLevel !== undefined && state === 'disabled') {
                    stateDecls.push('box-shadow: none;')
                }

                if (stateDecls.length > 0) {
                    const stateSel = composeStateSelector({
                        anchor,
                        targetSelector: selector,
                        hostCondition,
                        whenCondition,
                        states: [state],
                        triggers
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
            const inner = compileAstNodes(node.children, meta, options)

            if (inner.base.length > 0) {
                chunks.atRules.push(`${node.atRuleHeader} {\n${inner.base.join('\n\n')}\n}`)
            }

            for (const [state, stateRules] of inner.deltas) {
                if (stateRules.length > 0) {
                    const target = chunks.deltas.get(state)
                    if (target) {
                        target.push(`${node.atRuleHeader} {\n${stateRules.join('\n\n')}\n}`)
                    } else {
                        chunks.deltas.set(state, [`${node.atRuleHeader} {\n${stateRules.join('\n\n')}\n}`])
                    }
                }
            }

            if (inner.atRules.length > 0) {
                chunks.atRules.push(...inner.atRules)
            }
        }
    }

    return chunks
}

/**
 * Cleans template interpolation wrappers (e.g. `${overrideStyleSheet(...)}` -> CSS properties).
 */
function cleanTemplateInterpolations(raw: string): string {
    return raw.replace(/\$\{\s*overrideStyleSheet\([^,]+,\s*['"`]([^'"`]+)['"`],\s*\{([\s\S]*?)\}\s*\)\s*\};?/g, (_, prefix, propBody) => {
        const cleanPrefix = prefix.replace(/-$/, '')
        const propLines = propBody.split(',')
        const res: string[] = []
        for (const p of propLines) {
            const m = /['"`]?([a-zA-Z0-9_-]+)['"`]?\s*:\s*['"`]?([^'"`]+)['"`]?/.exec(p)
            if (m) {
                const propKey = m[1]
                const propVal = m[2]
                res.push(`${cleanPrefix}-${propKey}: ${propVal};`)
            }
        }
        return res.join('\n')
    })
}

/**
 * Cleanly formats CSS declarations and blocks for readable presentation.
 */
export function formatCss(rawCss: string): string {
    let result = ''
    let indent = 0
    const indentUnit = '    '
    let inComment = false
    let inString: string | null = null
    let parenDepth = 0

    const clean = rawCss.replace(/\r\n/g, '\n')
    let buffer = ''

    for (let i = 0; i < clean.length; i++) {
        const char = clean[i]
        const next = clean[i + 1]

        // Comments
        if (!inString && char === '/' && next === '*') {
            inComment = true
            buffer += '/*'
            i++
            continue
        }
        if (inComment) {
            buffer += char
            if (char === '*' && next === '/') {
                inComment = false
                buffer += '/'
                i++
            }
            continue
        }

        // Strings
        if (char === '"' || char === "'") {
            if (inString === char) {
                inString = null
            } else if (!inString) {
                inString = char
            }
            buffer += char
            continue
        }
        if (inString) {
            buffer += char
            continue
        }

        // Parens
        if (char === '(') {
            parenDepth++
            buffer += char
            continue
        }
        if (char === ')') {
            parenDepth = Math.max(0, parenDepth - 1)
            buffer += char
            continue
        }

        if (parenDepth === 0) {
            if (char === '{') {
                const trimmed = buffer.trim()
                if (trimmed) {
                    result += (result.endsWith('\n') || result === '' ? '' : '\n') +
                        indentUnit.repeat(indent) + trimmed + ' {\n'
                } else {
                    result += ' {\n'
                }
                buffer = ''
                indent++
                continue
            }
            if (char === '}') {
                const trimmed = buffer.trim()
                if (trimmed) {
                    result += indentUnit.repeat(indent) + trimmed + (trimmed.endsWith(';') ? '' : ';') + '\n'
                }
                buffer = ''
                indent = Math.max(0, indent - 1)
                result += indentUnit.repeat(indent) + '}\n\n'
                continue
            }
            if (char === ';') {
                const trimmed = buffer.trim()
                if (trimmed) {
                    result += indentUnit.repeat(indent) + trimmed + ';\n'
                }
                buffer = ''
                continue
            }
        }

        buffer += char
    }

    const remaining = buffer.trim()
    if (remaining) {
        result += indentUnit.repeat(indent) + remaining + '\n'
    }

    return result.replace(/\n{3,}/g, '\n\n').trim()
}

/**
 * Counts total CSS rules in a stylesheet string.
 */
export function countCssRules(cssText: string): number {
    const matches = cssText.match(/\{/g)
    return matches ? matches.length : 0
}

/**
 * Adapts static `DefinitionMeta` objects (regex-extracted, range-annotated) to
 * the runtime definition shape consumed by `@sandlada/mdc/style-engine`
 * (`{ schema: { states }, tokens }`). Enables parity checks and one-off
 * delegation (e.g. `compileStateSheet(synthetic, css)`) without forking
 * semantics. Returns a single merged definition; callers with multiple
 * definitions should pass them all at once.
 */
export function definitionMetasToStyleDefinition(
    definitions: (DefinitionMeta | undefined)[]
): Record<string, any> {
    const statesList: string[] = []
    const pushState = (s: string) => {
        if (s && !statesList.includes(s)) statesList.push(s)
    }
    for (const def of definitions) {
        if (!def) continue
        const schemaStates: string[] | undefined = (def.schema as { states?: string[] } | undefined)?.states
            ?? (def.schema as { flatStates?: string[] } | undefined)?.flatStates
        if (schemaStates && schemaStates.length > 0) {
            for (const s of schemaStates) pushState(s)
        }
    }
    if (statesList.length === 0) {
        for (const s of DEFAULT_STATE_NAMES) pushState(s)
    }

    const tokens: Record<string, any> = {}
    for (const def of definitions) {
        if (!def) continue
        for (const [rawKey, token] of def.ownTokens) {
            const key = rawKey.replace(/^--_/, '').replace(/^--/, '')
            if (!key || key in tokens) continue
            const stateMap: Record<string, string> = (token as TokenValueMeta).stateMap ?? {}
            if ((token as TokenValueMeta).isTuple) {
                tokens[key] = statesList.map((s) => stateMap[s] ?? stateMap['enabled'] ?? null)
            } else if ((token as TokenValueMeta).isRecord) {
                tokens[key] = { ...stateMap }
            } else {
                tokens[key] = (token as TokenValueMeta).rawValue ?? ''
            }
        }
    }

    return { schema: { states: statesList }, tokens }
}

/**
 * Extracts and compiles the entire exported CSSResult / CSSResult[] from a *.style.ts file
 * via static AST differential analysis.
 */
export function compileExportedStylesToCssSync(
    sourceText: string,
    definitionMetaMap?: Map<string, DefinitionMeta>,
    filePath: string = 'style.ts'
): CompilationResult {
    // 1. Find `export const [XxxStyles] = ...`
    const exportRegex = /export\s+const\s+([a-zA-Z0-9_$]+Styles?)\s*=\s*([\s\S]+)$/m
    const expMatch = exportRegex.exec(sourceText)
    const exportName = expMatch ? expMatch[1] : 'Styles'

    // 2. Discover all Definition names referenced in file
    const defNames: string[] = []
    const defRefRegex = /createStyleSheet\s*\(\s*(?:\[([^\]]+)\]|([a-zA-Z0-9_$]+))/g
    let dMatch: RegExpExecArray | null
    while ((dMatch = defRefRegex.exec(sourceText)) !== null) {
        if (dMatch[1]) {
            const names = dMatch[1].split(',').map((s) => s.trim()).filter(Boolean)
            defNames.push(...names)
        } else if (dMatch[2]) {
            defNames.push(dMatch[2].trim())
        }
    }
    // Curried definition-second application: createStyleSheet(..)(Def) / pipe(..)(Def)
    const curriedDefRegex = /\)\s*\(\s*([a-zA-Z0-9_$]+)\s*\)\s*(?:=>|`)/g
    while ((dMatch = curriedDefRegex.exec(sourceText)) !== null) {
        defNames.push(dMatch[1].trim())
    }
    const uniqueDefNames = Array.from(new Set(defNames))

    // 3. Build state token metadata + compiler options (custom triggers from analyzed definitions)
    const defMetas = definitionMetaMap
        ? uniqueDefNames.map((n) => definitionMetaMap.get(n)).filter(Boolean)
        : []
    const stateMeta = extractStateTokenMetadataFromMeta(defMetas)

    const customTriggers: CustomTriggerMap = new Map()
    for (const meta of defMetas) {
        if (!meta || !meta.stateTriggers) continue
        for (const [stateName, trigger] of meta.stateTriggers) {
            if (!stateName || customTriggers.has(stateName)) continue
            const modifier = trigger.modifier ?? trigger.selector ?? ''
            if (trigger.target === 'host' || trigger.target === 'self') {
                customTriggers.set(stateName, { target: trigger.target, modifier })
            }
        }
    }
    const compilerOptions: CompilerOptions = customTriggers.size > 0 ? { triggers: customTriggers } : {}

    // 4. Extract Token declarations mirroring stringifyTokens shape (names only, no runtime values)
    const tokenPrefixes = new Map<string, string>()
    const stringifyCallRegex = /stringifyTokens\s*\(\s*(?:\{\s*prefix\s*:\s*['"`]([^'"`]+)['"`][\s\S]*?\}|['"`]([^'"`]+)['"`])\s*\)\s*\(\s*([a-zA-Z0-9_$]+)\s*\)/g
    let sMatch: RegExpExecArray | null
    while ((sMatch = stringifyCallRegex.exec(sourceText)) !== null) {
        const prefix = (sMatch[1] ?? sMatch[2] ?? '').trim()
        const defName = (sMatch[3] ?? '').trim()
        if (prefix && defName && !tokenPrefixes.has(defName)) {
            tokenPrefixes.set(defName, prefix.startsWith('--') ? prefix : `--${prefix}`)
        }
    }
    const legacyRecordRegex = /defineTokenRefsRecord\s*\(\s*([a-zA-Z0-9_$]+)\s*,[\s\S]*?prefix\s*:\s*['"`]([^'"`]+)['"`]/g
    while ((sMatch = legacyRecordRegex.exec(sourceText)) !== null) {
        const defName = (sMatch[1] ?? '').trim()
        const prefix = (sMatch[2] ?? '').trim()
        if (prefix && defName && !tokenPrefixes.has(defName)) {
            tokenPrefixes.set(defName, prefix.startsWith('--') ? prefix : `--${prefix}`)
        }
    }

    let tokenLayer = ''
    if (defMetas.length > 0) {
        const lines: string[] = [':host {']
        for (const meta of defMetas) {
            if (!meta) continue
            const prefix = tokenPrefixes.get(meta.name) ?? '--mdc-component'
            for (const [key, token] of meta.ownTokens) {
                if (token.isTuple || token.isRecord) {
                    const states = token.states && token.states.length > 0 ? token.states : [stateMeta.baseState]
                    for (const sName of states) {
                        lines.push(`    --_${sName}-${key}: var(${prefix}-${sName}-${key});`)
                    }
                } else {
                    lines.push(`    --_${key}: var(${prefix}-${key});`)
                }
            }
        }
        lines.push('}')
        if (lines.length > 2) {
            tokenLayer = lines.join('\n')
        }
    }

    // 5. Extract all createStyleSheet template bodies
    const stateRulesList: CompiledChunks[] = []

    const cssTemplateRegex = /(?:createStyleSheet\s*\([\s\S]*?\)\s*=>\s*)?css`([\s\S]*?)`/g
    let cMatch: RegExpExecArray | null
    while ((cMatch = cssTemplateRegex.exec(sourceText)) !== null) {
        const rawTemplate = cMatch[1]
        const cleanTemplate = cleanTemplateInterpolations(rawTemplate)
        const stripped = stripComments(cleanTemplate)
        const nodes = parseCssRecursive(stripped, stateMeta, ':host', '', undefined, undefined, false, null, [], compilerOptions)
        const chunks = compileAstNodes(nodes, stateMeta, compilerOptions)
        stateRulesList.push(chunks)
    }

    if (stateRulesList.length === 0) {
        const rawSheetRegex = /createStyleSheet\s*\([\s\S]*?,?\s*`([\s\S]*?)`\)/g
        while ((cMatch = rawSheetRegex.exec(sourceText)) !== null) {
            const rawTemplate = cMatch[1]
            const cleanTemplate = cleanTemplateInterpolations(rawTemplate)
            const stripped = stripComments(cleanTemplate)
            const nodes = parseCssRecursive(stripped, stateMeta, ':host', '', undefined, undefined, false, null, [], compilerOptions)
            const chunks = compileAstNodes(nodes, stateMeta, compilerOptions)
            stateRulesList.push(chunks)
        }
    }

    // 6. Aggregate Chunks & Statistics
    const baseChunks: string[] = []
    const mergedDeltas = new Map<string, string[]>()
    const atRuleChunks: string[] = []

    for (const chunk of stateRulesList) {
        if (chunk.base.length > 0) baseChunks.push(...chunk.base)
        for (const [state, rules] of chunk.deltas) {
            if (rules.length === 0) continue
            const target = mergedDeltas.get(state)
            if (target) target.push(...rules)
            else mergedDeltas.set(state, [...rules])
        }
        if (chunk.atRules.length > 0) atRuleChunks.push(...chunk.atRules)
    }

    const deltaBucketOf = (state: string): 'hover' | 'focus' | 'press' | 'disabled' | 'other' => {
        const canonical = canonicalizeState(state)
        if (canonical === 'hover' || state === 'hovered') return 'hover'
        if (canonical === 'focus' || state === 'focused') return 'focus'
        if (canonical === 'active' || state === 'pressed') return 'press'
        if (state === 'disabled') return 'disabled'
        return 'other'
    }

    const stats = {
        baseRules: baseChunks.length,
        hoverRules: 0,
        focusRules: 0,
        pressRules: 0,
        disabledRules: 0,
        otherRules: 0,
        atRules: atRuleChunks.length
    }
    const deltaSections: Array<{ state: string; rules: string[] }> = []
    for (const [state, rules] of mergedDeltas) {
        if (rules.length === 0) continue
        deltaSections.push({ state, rules })
        const bucket = deltaBucketOf(state)
        if (bucket === 'hover') stats.hoverRules += rules.length
        else if (bucket === 'focus') stats.focusRules += rules.length
        else if (bucket === 'press') stats.pressRules += rules.length
        else if (bucket === 'disabled') stats.disabledRules += rules.length
        else stats.otherRules += rules.length
    }
    const totalRules = stats.baseRules + stats.hoverRules + stats.focusRules + stats.pressRules + stats.disabledRules + stats.otherRules + stats.atRules

    const deltaLayerTitles: Record<string, string> = {
        hover: '[Layer 2.1] Hovered State Deltas (:hover)',
        focus: '[Layer 2.2] Focused State Deltas (:focus-visible)',
        press: '[Layer 2.3] Pressed / Active State Deltas (:active)',
        disabled: '[Layer 2.4] Disabled State Deltas ([disabled])'
    }

    // 7. Format Output Document
    const sections: string[] = []
    const cleanFileName = filePath.split(/[/\\]/).pop() || filePath
    const otherCount = stats.otherRules > 0 ? `, Other: ${stats.otherRules}` : ''
    sections.push(`/**
 * ====================================================================
 * MDC Compiled Stylesheet Preview (Live)
 * Source: ${cleanFileName}
 * Export: ${exportName} (CSSResult / CSSResult[])
 * Definitions: ${uniqueDefNames.length > 0 ? uniqueDefNames.join(', ') : 'None'}
 * Rules Generated: ${totalRules} (Base: ${stats.baseRules}, Hover: ${stats.hoverRules}, Focus: ${stats.focusRules}, Press: ${stats.pressRules}, Disabled: ${stats.disabledRules}${otherCount}, AtRules: ${stats.atRules})
 * ====================================================================
 */`)

    if (tokenLayer) {
        sections.push(`/* --------------------------------------------------------------------
 * [Layer 1] Token Variable Declarations (:host)
 * -------------------------------------------------------------------- */
${tokenLayer}`)
    }

    if (baseChunks.length > 0) {
        sections.push(`/* --------------------------------------------------------------------
 * [Layer 2] Base / Enabled State Rules
 * -------------------------------------------------------------------- */
${baseChunks.join('\n\n')}`)
    }

    deltaSections.forEach(({ state, rules }, index) => {
        const bucket = deltaBucketOf(state)
        const title = deltaLayerTitles[bucket] ?? `[Layer 2.${5 + index}] ${state} State Deltas`
        sections.push(`/* --------------------------------------------------------------------
 * ${title}
 * -------------------------------------------------------------------- */
${rules.join('\n\n')}`)
    })

    if (atRuleChunks.length > 0) {
        sections.push(`/* --------------------------------------------------------------------
 * [Layer 3] Media Queries, Keyframes & Accessibility Adaptations
 * -------------------------------------------------------------------- */
${atRuleChunks.join('\n\n')}`)
    }

    const compiledCss = sections.join('\n\n')

    const allDeltaRules: string[] = []
    for (const { rules } of deltaSections) allDeltaRules.push(...rules)

    return {
        exportName,
        definitionNames: uniqueDefNames,
        totalRules,
        stats,
        compiledCss,
        layers: {
            tokenLayer,
            stateSheetLayer: baseChunks.concat(allDeltaRules).join('\n\n'),
            staticLayer: atRuleChunks.join('\n\n'),
        },
    }
}

/**
 * Dynamically bundles and evaluates the exported CSSResult / CSSResult[] from a *.style.ts file
 * in a real VM environment, yielding the 100% genuine compiled CSS.
 * Gracefully falls back to static AST compilation if dynamic evaluation fails.
 */
export async function compileExportedStylesToCss(
    sourceText: string,
    definitionMetaMap?: Map<string, DefinitionMeta>,
    filePath: string = 'style.ts'
): Promise<CompilationResult> {
    const cleanFileName = filePath.split(/[/\\]/).pop() || filePath
    const absPath = path.isAbsolute(filePath) ? path.resolve(filePath) : path.resolve(process.cwd(), filePath)

    try {
        // 1. Bundle with Rolldown in Node environment
        const bundle = await rolldown({
            input: absPath,
            platform: 'node',
            external: ['lit'],
            plugins: [
                {
                    name: 'in-memory-source',
                    load(id: string) {
                        const normId = path.resolve(id).replace(/\\/g, '/').toLowerCase()
                        const normEntry = absPath.replace(/\\/g, '/').toLowerCase()
                        if (normId === normEntry && sourceText) {
                            return { code: sourceText }
                        }
                        return null
                    },
                },
            ],
        })

        const { output } = await bundle.generate({ format: 'cjs' })
        const code = output[0]?.code || ''

        // 2. Run inside VM Sandbox with real lit / unsafeCSS / CSSResult
        const modExports: Record<string, any> = {}
        const sandbox = {
            module: { exports: modExports },
            exports: modExports,
            require: (id: string) => {
                if (id === 'lit') return lit
                try {
                    return createRequire(absPath)(id)
                } catch {
                    throw new Error(`Cannot resolve module: ${id}`)
                }
            },
            console,
        }

        vm.createContext(sandbox)
        vm.runInContext(code, sandbox)

        const exported = sandbox.module.exports || {}
        const exportKeys = Object.keys(exported)
        const styleKey = exportKeys.find((k) => k.toLowerCase().includes('style')) || exportKeys[0] || 'Styles'
        const styleValue = exported[styleKey]

        // 3. Extract and concatenate all CSSResult items
        const rawCssParts: string[] = []
        const flattenItems = (items: any) => {
            if (!items) return
            if (Array.isArray(items)) {
                for (const item of items) flattenItems(item)
            } else if (typeof items === 'object' && items.cssText !== undefined) {
                rawCssParts.push(items.cssText)
            } else if (typeof items === 'string') {
                rawCssParts.push(items)
            } else {
                rawCssParts.push(String(items))
            }
        }
        flattenItems(styleValue)

        if (rawCssParts.length === 0) {
            throw new Error(`No CSSResult items found in export '${styleKey}'.`)
        }

        // 4. Format each CSS part
        const formattedParts = rawCssParts.map((part, idx) => {
            const formatted = formatCss(part)
            return `/* --------------------------------------------------------------------
 * [Part ${idx + 1}] CSSResult Chunk
 * -------------------------------------------------------------------- */
${formatted}`
        })

        const combinedRaw = rawCssParts.join('\n\n')
        const ruleCount = countCssRules(combinedRaw)
        const totalSize = (combinedRaw.length / 1024).toFixed(1)

        const header = `/**
 * ====================================================================
 * MDC Compiled Stylesheet Preview (Live)
 * Source: ${cleanFileName}
 * Export: ${styleKey} (${rawCssParts.length} CSSResult ${rawCssParts.length === 1 ? 'part' : 'parts'})
 * Size: ${totalSize} KB | Total Rules: ${ruleCount}
 * Status: Genuine CSSResult Compilation (100% Real Runtime Output)
 * ====================================================================
 */`

        const compiledCss = [header, ...formattedParts].join('\n\n')

        return {
            exportName: styleKey,
            definitionNames: Array.from(definitionMetaMap?.keys() || []),
            totalRules: ruleCount,
            stats: {
                baseRules: ruleCount,
                hoverRules: 0,
                focusRules: 0,
                pressRules: 0,
                disabledRules: 0,
                otherRules: 0,
                atRules: 0,
            },
            compiledCss,
            layers: {
                tokenLayer: rawCssParts[0] || '',
                stateSheetLayer: rawCssParts.slice(1).join('\n\n'),
                staticLayer: '',
            },
        }
    } catch (err: any) {
        // Fallback to static AST compiler
        const fallbackResult = compileExportedStylesToCssSync(sourceText, definitionMetaMap, filePath)
        const warnHeader = `/**
 * ====================================================================
 * MDC Compiled Stylesheet Preview (Live - Fallback Mode)
 * Source: ${cleanFileName}
 * Note: Dynamic CSSResult evaluation encountered a syntax/load error:
 *       ${err?.message || String(err)}
 * Displaying Static AST Differential Compilation below.
 * ====================================================================
 */`
        return {
            ...fallbackResult,
            compiledCss: `${warnHeader}\n\n${fallbackResult.compiledCss}`,
        }
    }
}


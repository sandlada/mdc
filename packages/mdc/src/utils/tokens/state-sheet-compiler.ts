/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import {
    StateTriggerRegistry,
    composeStateSelector,
    splitSelectorByComma,
    type StateTrigger,
} from './state-trigger'
import { normalizeStateTokenKey } from './create-style-definition'

export interface StateTokenMetadata {
    hasToken(name: string): boolean
    isStateToken(name: string): boolean
    hasStateToken(name: string, state: string): boolean
    allTokens: ReadonlySet<string>
    allStateTokens: ReadonlySet<string>
    allDefinedStates: ReadonlySet<string>
    getDefinedStates(name: string): ReadonlySet<string>
    resolveStateVarName(name: string, state: string): string
}

function splitStateVariant(stateVariant: string): string[] {
    if (stateVariant.includes(':')) {
        return stateVariant.split(':').filter(Boolean)
    }
    return [stateVariant]
}

function canonicalizeStateName(state: string): string {
    if (state === 'hovered') return 'hover'
    if (state === 'pressed') return 'active'
    if (state === 'focused') return 'focus'
    return state
}

/**
 * Extracts state token metadata and defined state variants from one or more ComponentDefinition objects.
 */
export function extractStateTokenMetadata(definition: any): StateTokenMetadata {
    const definitions = Array.isArray(definition) ? definition : [definition]
    const allTokens = new Set<string>()
    const stateTokens = new Set<string>()
    const allDefinedStates = new Set<string>()
    const definedStatesPerToken = new Map<string, Set<string>>()
    const stateVarMap = new Map<string, string>()

    for (const def of definitions) {
        if (!def || typeof def !== 'object') continue

        for (const key of Object.keys(def)) {
            const normalized = normalizeStateTokenKey(key)
            const { baseKey, states } = normalized

            if (!baseKey) continue

            allTokens.add(baseKey)

            if (states.length === 0) {
                // Eternal single-state / base token
                stateVarMap.set(`${baseKey}:base`, key)
                stateVarMap.set(`${baseKey}:enabled`, key)
                continue
            }

            if (states.length === 1 && states[0] === 'enabled') {
                // Enabled state token
                stateVarMap.set(`${baseKey}:enabled`, key)
                stateVarMap.set(`${baseKey}:base`, key)
                continue
            }

            // Interactive or modifier state token
            stateTokens.add(baseKey)

            let tokenStates = definedStatesPerToken.get(baseKey)
            if (!tokenStates) {
                tokenStates = new Set<string>()
                definedStatesPerToken.set(baseKey, tokenStates)
            }

            const canonicalStates = states.map(canonicalizeStateName)
            const canonicalIdentifier = canonicalStates.join(':')

            tokenStates.add(canonicalIdentifier)
            allDefinedStates.add(canonicalIdentifier)
            stateVarMap.set(`${baseKey}:${canonicalIdentifier}`, key)

            // Also record aliases if single state
            if (canonicalStates.length === 1) {
                const s = canonicalStates[0]
                if (s === 'hover') {
                    tokenStates.add('hovered')
                    stateVarMap.set(`${baseKey}:hovered`, key)
                } else if (s === 'active') {
                    tokenStates.add('pressed')
                    stateVarMap.set(`${baseKey}:pressed`, key)
                } else if (s === 'focus') {
                    tokenStates.add('focused')
                    stateVarMap.set(`${baseKey}:focused`, key)
                }
            }
        }
    }

    return {
        hasToken(name: string) {
            return allTokens.has(name)
        },
        isStateToken(name: string) {
            return stateTokens.has(name)
        },
        hasStateToken(name: string, state: string) {
            const states = definedStatesPerToken.get(name)
            if (!states) return false
            const canonical = canonicalizeStateName(state)
            return states.has(state) || states.has(canonical)
        },
        allTokens,
        allStateTokens: stateTokens,
        allDefinedStates,
        getDefinedStates(name: string) {
            return definedStatesPerToken.get(name) ?? new Set()
        },
        resolveStateVarName(name: string, state: string) {
            const canonical = canonicalizeStateName(state)
            const exact = stateVarMap.get(`${name}:${canonical}`) || stateVarMap.get(`${name}:${state}`)
            if (exact) return exact

            if (state === 'base' || state === 'enabled') {
                const baseVar = stateVarMap.get(`${name}:enabled`) || stateVarMap.get(`${name}:base`)
                if (baseVar) return baseVar
                return name
            }

            return `${state}-${name}`
        },
    }
}

interface Declaration {
    property: string
    value: string
    isStateful: boolean
    tokens: string[]
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
    whenCondition?: string
    declarations: Declaration[]
}

export type AstNode = WrapperAtRuleNode | KeyframesNode | StyleRuleNode

/**
 * Strips CSS comments.
 */
function stripComments(css: string): string {
    return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

function parseDeclarationString(raw: string, meta: StateTokenMetadata): Declaration | null {
    const colonIdx = raw.indexOf(':')
    if (colonIdx === -1) return null

    const property = raw.slice(0, colonIdx).trim()
    const value = raw.slice(colonIdx + 1).trim()
    if (!property || !value) return null

    const tokens: string[] = []
    const stateTokens: string[] = []
    const varMatches = value.matchAll(/var\(--_([a-zA-Z0-9_:-]+)\)/g)
    for (const match of varMatches) {
        const tokenName = match[1]
        if (meta.hasToken(tokenName) || meta.isStateToken(tokenName)) {
            tokens.push(tokenName)
        }
        if (meta.isStateToken(tokenName)) {
            stateTokens.push(tokenName)
        }
    }

    return {
        property,
        value,
        isStateful: stateTokens.length > 0,
        tokens,
        stateTokens,
    }
}

function findNextDelimiter(css: string, start: number): { type: ';' | '{'; index: number } | null {
    let inSingleQuote = false
    let inDoubleQuote = false
    let parenDepth = 0
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

        if (parenDepth === 0) {
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

/**
 * Recursive descent parser for nested CSS blocks supporting @anchor, @when, @layer, @keyframes, @media, etc.
 */
function parseCssRecursive(
    css: string,
    meta: StateTokenMetadata,
    currentAnchor: string = ':host',
    currentTarget: string = '',
    currentWhen?: string,
    isExplicitAnchor: boolean = false
): AstNode[] {
    const nodes: AstNode[] = []
    const currentDeclarations: Declaration[] = []

    let i = 0
    const len = css.length

    while (i < len) {
        // Skip whitespace
        while (i < len && /\s/.test(css[i])) i++
        if (i >= len) break

        const delim = findNextDelimiter(css, i)
        if (!delim) {
            const trailing = css.slice(i).trim()
            if (trailing) {
                const decl = parseDeclarationString(trailing, meta)
                if (decl) currentDeclarations.push(decl)
            }
            break
        }

        // Case 1: Declaration ';' encountered before any nested block '{'
        if (delim.type === ';') {
            const declChunk = css.slice(i, delim.index).trim()
            if (declChunk) {
                const decl = parseDeclarationString(declChunk, meta)
                if (decl) {
                    currentDeclarations.push(decl)
                }
            }
            i = delim.index + 1
            continue
        }

        // Case 2: Nested block encountered at '{'
        const header = css.slice(i, delim.index).trim()
        const openBrace = delim.index
        const closeBrace = findMatchingClosingBrace(css, openBrace)
        const body = css.slice(openBrace + 1, closeBrace).trim()
        i = closeBrace + 1

        if (!header) continue

        // Handle @anchor
        if (header.startsWith('@anchor')) {
            const anchorSelector = header.replace(/^@anchor\s+/, '').trim()
            const anchorParts = splitSelectorByComma(anchorSelector)
            for (const anc of anchorParts) {
                const childRules = parseCssRecursive(body, meta, anc, anc, currentWhen, true)
                nodes.push(...childRules)
            }
            continue
        }

        // Handle @when(...)
        if (header.startsWith('@when')) {
            const whenMatch = header.match(/^@when\((.*?)\)/)
            const whenConditionRaw = whenMatch ? whenMatch[1].trim() : ''
            const formattedWhen = whenConditionRaw.startsWith('.') || whenConditionRaw.startsWith('[') || whenConditionRaw.startsWith(':')
                ? whenConditionRaw
                : `.${whenConditionRaw}`
            const combinedWhen = currentWhen
                ? `${currentWhen}${formattedWhen}`
                : formattedWhen
            const childRules = parseCssRecursive(body, meta, currentAnchor, currentTarget, combinedWhen, isExplicitAnchor)
            nodes.push(...childRules)
            continue
        }

        // Handle @keyframes / @-webkit-keyframes
        if (isKeyframesAtRule(header)) {
            const steps = parseKeyframeSteps(body, meta)
            nodes.push({
                type: 'keyframes',
                header,
                steps,
            })
            continue
        }

        // Handle wrapper at-rules (@layer, @media, @supports, @container, @starting-style)
        if (isWrapperAtRule(header)) {
            const children = parseCssRecursive(body, meta, currentAnchor, currentTarget, currentWhen, isExplicitAnchor)
            nodes.push({
                type: 'wrapper-at-rule',
                atRuleHeader: header,
                children,
            })
            continue
        }

        // Host selector refinement (if not inside explicit @anchor, e.g. :host([variant="rail"]))
        let childAnchor = currentAnchor
        if (!isExplicitAnchor && header.startsWith(':host')) {
            childAnchor = header
        }

        // Normal selector / nested selector with comma nesting expansion
        let composedTarget = header
        if (currentTarget) {
            const parentParts = splitSelectorByComma(currentTarget)
            const headerParts = splitSelectorByComma(header)
            const combined: string[] = []

            for (const p of parentParts) {
                for (const h of headerParts) {
                    if (h.startsWith('&')) {
                        combined.push(h.replace(/^&/, p))
                    } else if (h.startsWith(':host')) {
                        if (!combined.includes(h)) {
                            combined.push(h)
                        }
                    } else {
                        combined.push(`${p} ${h}`)
                    }
                }
            }
            composedTarget = combined.join(', ')
        }

        const childRules = parseCssRecursive(body, meta, childAnchor, composedTarget, currentWhen, isExplicitAnchor)
        nodes.push(...childRules)
    }

    if (currentDeclarations.length > 0) {
        nodes.unshift({
            type: 'style-rule',
            selector: currentTarget || currentAnchor,
            anchor: currentAnchor,
            whenCondition: currentWhen,
            declarations: currentDeclarations,
        })
    }

    return nodes
}

/**
 * Formats a declaration value for a specific state variant.
 */
function resolveStateValue(
    decl: Declaration,
    state: string,
    meta: StateTokenMetadata
): string {
    let result = decl.value
    for (const token of decl.tokens) {
        if (state === 'enabled' || state === 'base') {
            const baseVarName = meta.resolveStateVarName(token, 'enabled')
            result = result.replaceAll(`var(--_${token})`, `var(--_${baseVarName})`)
        } else if (meta.hasStateToken(token, state)) {
            const stateVarName = meta.resolveStateVarName(token, state)
            result = result.replaceAll(`var(--_${token})`, `var(--_${stateVarName})`)
        } else {
            const fallbackVarName = meta.resolveStateVarName(token, 'enabled')
            result = result.replaceAll(`var(--_${token})`, `var(--_${fallbackVarName})`)
        }
    }
    return result
}

/**
 * Checks if a declaration has any state delta for a specific state variant based on definition metadata.
 */
function declHasStateDelta(
    decl: Declaration,
    state: string,
    meta: StateTokenMetadata
): boolean {
    if (!decl.isStateful) return false
    return decl.stateTokens.some((token) => meta.hasStateToken(token, state))
}

export interface CompileStateSheetOptions {
    registry?: StateTriggerRegistry
    triggers?: (StateTrigger | Record<string, StateTrigger | string>)[] | Record<string, StateTrigger | string>
}

interface CompiledChunks {
    base: string[]
    deltas: Map<string, string[]>
}

function getSortedStateVariants(allDefinedStates: ReadonlySet<string>): string[] {
    const standardOrder: Record<string, number> = {
        'hover': 10,
        'focus': 20,
        'active': 30,
        'disabled': 40,
    }

    const list = Array.from(allDefinedStates)
    return list.sort((a, b) => {
        const orderA = standardOrder[a] ?? 100
        const orderB = standardOrder[b] ?? 100
        if (orderA !== orderB) return orderA - orderB
        return a.localeCompare(b)
    })
}

function compileAstNodes(
    nodes: AstNode[],
    meta: StateTokenMetadata,
    registry: StateTriggerRegistry
): CompiledChunks {
    const chunks: CompiledChunks = {
        base: [],
        deltas: new Map<string, string[]>(),
    }

    const stateVariants = getSortedStateVariants(meta.allDefinedStates)
    for (const state of stateVariants) {
        chunks.deltas.set(state, [])
    }

    for (const node of nodes) {
        if (node.type === 'style-rule') {
            const { anchor, selector, whenCondition, declarations } = node

            // 1. Base Rule (Enabled / Default State)
            const baseDecls: string[] = []
            for (const decl of declarations) {
                const resolvedVal = resolveStateValue(decl, 'enabled', meta)
                baseDecls.push(`${decl.property}: ${resolvedVal};`)
            }

            if (baseDecls.length > 0) {
                const baseSel = composeStateSelector({
                    anchor,
                    targetSelector: selector,
                    whenCondition,
                    states: [],
                    registry,
                })
                chunks.base.push(`${baseSel} {\n    ${baseDecls.join('\n    ')}\n}`)
            }

            // 2. Delta Rules for all defined interactive / modifier states
            for (const state of stateVariants) {
                const stateDecls: string[] = []

                for (const decl of declarations) {
                    if (declHasStateDelta(decl, state, meta)) {
                        const resolvedVal = resolveStateValue(decl, state, meta)
                        stateDecls.push(`${decl.property}: ${resolvedVal};`)
                    }
                }

                if (stateDecls.length > 0) {
                    const stateSel = composeStateSelector({
                        anchor,
                        targetSelector: selector,
                        whenCondition,
                        states: splitStateVariant(state),
                        registry,
                    })
                    chunks.deltas.get(state)!.push(`${stateSel} {\n    ${stateDecls.join('\n    ')}\n}`)
                }
            }
        } else if (node.type === 'keyframes') {
            const stepStrings: string[] = []
            for (const step of node.steps) {
                const declStrings: string[] = []
                for (const decl of step.declarations) {
                    const resolvedVal = resolveStateValue(decl, 'enabled', meta)
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

            for (const state of stateVariants) {
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
 * Compiles an MDC CSS template string with token state awareness into standard CSS.
 */
export function compileStateSheet(
    definition: any,
    cssText: string,
    options?: CompileStateSheetOptions
): string {
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

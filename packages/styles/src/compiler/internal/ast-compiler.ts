/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { TriggerTables } from '../../triggers/tables'
import type { StateTokenMetadata } from '../extract-state-token-metadata'
import {
    splitSelectorByComma,
    appendToHostSelector,
    extractHostAndDescendant,
    composeStateSelector
} from '../compose-state-selector'
import { matchVariants } from '../match-variants'
import type {
    ASTNode,
    DeclarationNode,
    KeyframeStepNode,
    StyleDiagnosticWarning,
    CompileStateSheetOptions
} from '../compile-state-sheet'

export function emitWarning(options: CompileStateSheetOptions | undefined, warning: StyleDiagnosticWarning): void {
    if (options?.onWarn) {
        options.onWarn(warning)
    } else {
        console.warn(warning.message)
    }
}

/**
 * Depth-aware finder for the next top-level delimiter (';' or '{').
 */
export function findNextDelimiter(css: string, start: number): { type: ';' | '{'; index: number } | null {
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
export function findMatchingClosingBrace(css: string, openBraceIndex: number): number {
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
export function parseDeclarationString(raw: string, meta: StateTokenMetadata): DeclarationNode | null {
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

export function isWrapperAtRule(header: string): boolean {
    return /^@(layer|media|supports|container|starting-style)(\s|$)/i.test(header)
}

export function isKeyframesAtRule(header: string): boolean {
    return /^@(-webkit-)?keyframes(\s|$)/i.test(header)
}

export function parseKeyframeSteps(body: string, meta: StateTokenMetadata): KeyframeStepNode[] {
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

export function extractAtRuleParam(header: string, prefix: string): string {
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

export function normalizeTokenName(tokenName: string, statesList: readonly string[]): string {
    const statesToCheck = new Set([...statesList, 'enabled', 'hovered', 'hover', 'pressed', 'active', 'focused', 'focus', 'disabled'])
    for (const s of statesToCheck) {
        if (tokenName.startsWith(`${s}-`)) {
            return tokenName.slice(s.length + 1)
        }
    }
    return tokenName
}

export function checkDeclarationDiagnostics(
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

export function composeHostCondition(
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
export function parseCssRecursive(
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
export function resolveStateValue(
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
export function decomposeDeclarationForDelta(
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

export interface CompiledChunks {
    base: string[]
    deltas: Map<string, string[]>
}

export function compileAstNodes(
    nodes: readonly ASTNode[],
    meta: StateTokenMetadata,
    tables: TriggerTables
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
                    tables
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
                        tables
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
            const inner = compileAstNodes(node.children, meta, tables)

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

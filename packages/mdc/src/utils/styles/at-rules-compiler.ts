/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { StateTriggerRegistry } from './map-state-triggers'
import {
    splitSelectorByComma,
    appendToHostSelector,
    extractHostAndDescendant,
    stripComments,
    type CompileStateSheetOptions
} from './state-sheet-compiler'
import type { StateSchema } from './define-schema'

/**
 * Expands a11y macros into standard media query blocks.
 */
export const expandA11yPresets = (css: string): string => {
    return css
        .replace(/@reduced-motion\b/g, '@media (prefers-reduced-motion: reduce)')
        .replace(/@forced-colors\b/g, '@media (forced-colors: active)')
        .replace(/@contrast\s*\(\s*more\s*\)/g, '@media (prefers-contrast: more)')
        .replace(/@contrast\s*\(\s*less\s*\)/g, '@media (prefers-contrast: less)')
        .replace(/@reduced-transparency\b/g, '@media (prefers-reduced-transparency: reduce)')
}

/**
 * Splits a CSS property value string into whitespace-separated tokens at depth 0
 * (ignoring whitespace inside parentheses, brackets, and quotes, and stripping comments).
 */
export const splitCssValues = (val: string): string[] => {
    const tokens: string[] = []
    let current = ''
    let parenDepth = 0
    let bracketDepth = 0
    let inSingleQuote = false
    let inDoubleQuote = false
    let isEscaped = false

    const clean = stripComments(val).trim()

    for (let i = 0; i < clean.length; i++) {
        const ch = clean[i]

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

        if (parenDepth === 0 && bracketDepth === 0 && /\s/.test(ch)) {
            if (current.trim()) {
                tokens.push(current.trim())
                current = ''
            }
            continue
        }

        current += ch
    }

    if (current.trim()) {
        tokens.push(current.trim())
    }

    return tokens
}

/**
 * Expands property macros (shape:, padding:, margin:, typescale:).
 */
export const expandDeclaration = (prop: string, val: string): string => {
    const cleanVal = stripComments(val).trim().replace(/;$/, '').trim()
    const varMatch = cleanVal.match(/^var\(\s*(--[a-zA-Z0-9_-]+)\s*\)$/)

    if (prop === 'shape') {
        if (varMatch) {
            const prefix = varMatch[1]
            return `border-start-start-radius: var(${prefix}-start-start); border-start-end-radius: var(${prefix}-start-end); border-end-end-radius: var(${prefix}-end-end); border-end-start-radius: var(${prefix}-end-start);`
        }
        const parts = splitCssValues(cleanVal)
        if (parts.length === 1) {
            return `border-start-start-radius: ${parts[0]}; border-start-end-radius: ${parts[0]}; border-end-end-radius: ${parts[0]}; border-end-start-radius: ${parts[0]};`
        }
        if (parts.length === 2) {
            return `border-start-start-radius: ${parts[0]}; border-start-end-radius: ${parts[1]}; border-end-end-radius: ${parts[0]}; border-end-start-radius: ${parts[1]};`
        }
        if (parts.length === 3) {
            return `border-start-start-radius: ${parts[0]}; border-start-end-radius: ${parts[1]}; border-end-end-radius: ${parts[2]}; border-end-start-radius: ${parts[1]};`
        }
        if (parts.length === 4) {
            return `border-start-start-radius: ${parts[0]}; border-start-end-radius: ${parts[1]}; border-end-end-radius: ${parts[2]}; border-end-start-radius: ${parts[3]};`
        }
    }

    if (prop === 'padding' || prop === 'margin') {
        if (varMatch) {
            const prefix = varMatch[1]
            return `${prop}-inline-start: var(${prefix}-inline-start); ${prop}-inline-end: var(${prefix}-inline-end); ${prop}-block-start: var(${prefix}-block-start); ${prop}-block-end: var(${prefix}-block-end);`
        }
        const parts = splitCssValues(cleanVal)
        if (parts.length === 1) {
            return `${prop}: ${parts[0]};`
        }
        if (parts.length === 2) {
            return `${prop}-inline-start: ${parts[1]}; ${prop}-inline-end: ${parts[1]}; ${prop}-block-start: ${parts[0]}; ${prop}-block-end: ${parts[0]};`
        }
        if (parts.length === 3) {
            return `${prop}-inline-start: ${parts[1]}; ${prop}-inline-end: ${parts[1]}; ${prop}-block-start: ${parts[0]}; ${prop}-block-end: ${parts[2]};`
        }
        if (parts.length === 4) {
            return `${prop}-inline-start: ${parts[3]}; ${prop}-inline-end: ${parts[1]}; ${prop}-block-start: ${parts[0]}; ${prop}-block-end: ${parts[2]};`
        }
    }

    if (prop === 'typescale') {
        if (varMatch) {
            const prefix = varMatch[1]
            return `font-family: var(${prefix}-font); font-size: var(${prefix}-size); line-height: var(${prefix}-leading); font-weight: var(${prefix}-weight); letter-spacing: var(${prefix}-tracking);`
        }
    }

    return `${prop}: ${cleanVal};`
}

/**
 * Replaces all matched occurrences of target in a complex selector branch with modifier.
 */
export const replaceTargetInBranch = (
    branch: string,
    target: string,
    modifier: string
): { result: string; matched: boolean } => {
    if (!branch || !target) {
        return { result: branch, matched: false }
    }

    const trimmedTarget = target.trim()
    const trimmedBranch = branch.trim()

    // 1. Host targets (:host, :where(:host), :is(:host), etc.)
    if (
        trimmedTarget === ':host' ||
        trimmedTarget.startsWith(':host') ||
        trimmedTarget.startsWith(':where(:host') ||
        trimmedTarget.startsWith(':is(:host')
    ) {
        if (
            trimmedBranch.startsWith(':host') ||
            trimmedBranch.startsWith(':where(:host') ||
            trimmedBranch.startsWith(':is(:host')
        ) {
            if (!modifier) {
                return { result: trimmedBranch, matched: true }
            }

            let hostPart = ''
            let descendantPart = ''

            if (trimmedBranch.startsWith(':where(') || trimmedBranch.startsWith(':is(')) {
                const openIdx = trimmedBranch.indexOf('(')
                let depth = 0
                let closeIdx = -1
                for (let i = openIdx; i < trimmedBranch.length; i++) {
                    if (trimmedBranch[i] === '(') depth++
                    else if (trimmedBranch[i] === ')') {
                        depth--
                        if (depth === 0) {
                            closeIdx = i
                            break
                        }
                    }
                }
                if (closeIdx !== -1) {
                    hostPart = trimmedBranch.slice(0, closeIdx + 1).trim()
                    descendantPart = trimmedBranch.slice(closeIdx + 1).trim()
                } else {
                    hostPart = trimmedBranch
                }
            } else {
                const parts = extractHostAndDescendant(trimmedBranch)
                hostPart = parts.hostPart
                descendantPart = parts.descendantPart
            }

            const updatedHost = appendToHostSelector(hostPart, modifier)
            if (descendantPart) {
                const sep = descendantPart.startsWith('>') || descendantPart.startsWith('+') || descendantPart.startsWith('~') || descendantPart.startsWith('||')
                    ? ' '
                    : ' '
                return { result: `${updatedHost}${sep}${descendantPart}`, matched: true }
            }
            return { result: updatedHost, matched: true }
        }

        return { result: trimmedBranch, matched: false }
    }

    // 2. Element targets
    // Check if target ends with terminal pseudo-element
    const pseudoElemMatch = trimmedTarget.match(/(::[a-zA-Z0-9_-]+(?:\([^)]*\))?)$/)
    const hasPseudo = pseudoElemMatch !== null
    const targetPseudo = hasPseudo ? pseudoElemMatch[0] : ''

    // Build regex to match target in selector respecting combinators
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const combinatorPattern = trimmedTarget
        .split(/(\s*[>+~|]+\s*|\s+)/)
        .filter(Boolean)
        .map((part) => {
            const trimmedPart = part.trim()
            if (trimmedPart === '>' || trimmedPart === '+' || trimmedPart === '~' || trimmedPart === '||') {
                return `\\s*${escapeRegex(trimmedPart)}\\s*`
            }
            if (/^\s+$/.test(part)) {
                return '\\s+'
            }
            return escapeRegex(part)
        })
        .join('')

    const targetRegex = new RegExp(combinatorPattern, 'g')

    let result = ''
    let lastIndex = 0
    let matchedAny = false

    // Scanner tracking parenStack and bracketDepth
    const parenStack: ('slotted' | 'other')[] = []
    let bracketDepth = 0
    let inSingleQuote = false
    let inDoubleQuote = false
    let isEscaped = false

    // Precompute safe positions in branch (depth 0 or inside ::slotted)
    const isSafePosition: boolean[] = new Array(trimmedBranch.length).fill(false)
    for (let i = 0; i < trimmedBranch.length; i++) {
        const ch = trimmedBranch[i]

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
            const before = trimmedBranch.slice(0, i).trimEnd()
            if (before.endsWith('::slotted')) {
                parenStack.push('slotted')
            } else {
                parenStack.push('other')
            }
            continue
        }
        if (ch === ')') {
            if (parenStack.length > 0) {
                parenStack.pop()
            }
            continue
        }
        if (ch === '[') {
            if (trimmedTarget.startsWith('[')) {
                const isOnlySlotted = parenStack.every((t) => t === 'slotted')
                if (isOnlySlotted && bracketDepth === 0) {
                    isSafePosition[i] = true
                }
            }
            bracketDepth++
            continue
        }
        if (ch === ']') {
            if (bracketDepth > 0) bracketDepth--
            continue
        }

        const isOnlySlotted = parenStack.every((t) => t === 'slotted')
        if (isOnlySlotted && bracketDepth === 0) {
            isSafePosition[i] = true
        }
    }

    let match: RegExpExecArray | null
    while ((match = targetRegex.exec(trimmedBranch)) !== null) {
        const start = match.index
        const end = start + match[0].length

        if (!isSafePosition[start]) {
            continue
        }

        // Check left boundary
        if (start > 0) {
            const prev = trimmedBranch[start - 1]
            if (/[a-zA-Z0-9_]/.test(trimmedTarget[0])) {
                if (/[a-zA-Z0-9_.#:[\]\-]/.test(prev)) {
                    continue
                }
            } else if (trimmedTarget[0] === '*') {
                if (/[a-zA-Z0-9_.\-#:]/.test(prev)) {
                    continue
                }
            }
        }

        // Check right boundary
        if (end < trimmedBranch.length) {
            const next = trimmedBranch[end]
            const lastTargetChar = trimmedTarget[trimmedTarget.length - 1]
            if (/[a-zA-Z0-9_-]/.test(lastTargetChar)) {
                if (/[a-zA-Z0-9_-]/.test(next)) {
                    continue
                }
            }
        }

        matchedAny = true
        result += trimmedBranch.slice(lastIndex, start)

        const matchedText = match[0]
        if (hasPseudo && targetPseudo) {
            const baseText = matchedText.slice(0, -targetPseudo.length)
            result += `${baseText}${modifier}${targetPseudo}`
        } else {
            result += `${matchedText}${modifier}`
        }

        lastIndex = end
    }

    result += trimmedBranch.slice(lastIndex)
    return { result: matchedAny ? result : trimmedBranch, matched: matchedAny }
}

/**
 * Replaces target in selector with modifier across all comma branches.
 */
export const replaceTargetInSelector = (
    selector: string,
    target: string,
    modifier: string
): { result: string; matched: boolean } => {
    const branches = splitSelectorByComma(selector)
    let matchedAny = false

    const updatedBranches = branches.map((branch) => {
        const res = replaceTargetInBranch(branch, target, modifier)
        if (res.matched) matchedAny = true
        return res.result
    })

    return {
        result: updatedBranches.join(', '),
        matched: matchedAny
    }
}

interface ParsedStatement {
    readonly type: 'decl' | 'block'
    readonly header?: string
    readonly body?: string
    readonly property?: string
    readonly value?: string
}

function findMatchingBrace(css: string, openBraceIndex: number): number {
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
        if (inSingleQuote || inDoubleQuote) continue

        if (ch === '{') depth++
        else if (ch === '}') {
            depth--
            if (depth === 0) return i
        }
    }
    return css.length
}

function parseStatements(css: string): ParsedStatement[] {
    const statements: ParsedStatement[] = []
    let i = 0
    const len = css.length

    while (i < len) {
        while (i < len && /\s/.test(css[i])) i++
        if (i >= len) break

        let parenDepth = 0
        let bracketDepth = 0
        let inSingleQuote = false
        let inDoubleQuote = false
        let isEscaped = false
        let delimType: ';' | '{' | null = null
        let delimIdx = -1

        for (let j = i; j < len; j++) {
            const ch = css[j]
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
            if (inSingleQuote || inDoubleQuote) continue

            if (ch === '(') parenDepth++
            else if (ch === ')') {
                if (parenDepth > 0) parenDepth--
            } else if (ch === '[') bracketDepth++
            else if (ch === ']') {
                if (bracketDepth > 0) bracketDepth--
            }

            if (parenDepth === 0 && bracketDepth === 0) {
                if (ch === ';') {
                    delimType = ';'
                    delimIdx = j
                    break
                }
                if (ch === '{') {
                    delimType = '{'
                    delimIdx = j
                    break
                }
            }
        }

        if (!delimType) {
            const chunk = css.slice(i).trim()
            if (chunk) {
                const colonIdx = chunk.indexOf(':')
                if (colonIdx !== -1) {
                    statements.push({
                        type: 'decl',
                        property: chunk.slice(0, colonIdx).trim(),
                        value: chunk.slice(colonIdx + 1).trim()
                    })
                }
            }
            break
        }

        if (delimType === ';') {
            const chunk = css.slice(i, delimIdx).trim()
            if (chunk) {
                const colonIdx = chunk.indexOf(':')
                if (colonIdx !== -1) {
                    statements.push({
                        type: 'decl',
                        property: chunk.slice(0, colonIdx).trim(),
                        value: chunk.slice(colonIdx + 1).trim()
                    })
                }
            }
            i = delimIdx + 1
            continue
        }

        if (delimType === '{') {
            const header = css.slice(i, delimIdx).trim()
            const closeIdx = findMatchingBrace(css, delimIdx)
            const body = css.slice(delimIdx + 1, closeIdx).trim()
            statements.push({
                type: 'block',
                header,
                body
            })
            i = closeIdx + 1
            continue
        }
    }

    return statements
}

export interface StateDimensionItem {
    readonly name: string
    readonly modifier: string
    readonly target: 'self' | 'host'
}

export interface AtRulesCompilerContext {
    readonly states: readonly StateDimensionItem[] | readonly (readonly StateDimensionItem[])[]
    readonly isCombo: boolean
    readonly registry: StateTriggerRegistry
    readonly options?: CompileStateSheetOptions
    readonly ancestorPath: readonly string[]
    readonly variantSelector?: string
    readonly isolationContainer?: string
    readonly stateNestingDepth?: number
}

interface TransformResult {
    readonly baseRules: string[]
    readonly hoistedRules: string[]
}

function formatRule(selector: string, content: string): string {
    const trimmedContent = content.trim()
    if (!trimmedContent) {
        return `${selector} {}`
    }
    return `${selector} { ${trimmedContent} }`
}

export const removeAmpersandForHostSubtree = (selector: string): string => {
    const branches = splitSelectorByComma(selector)
    return branches.map((b) => {
        const trimmed = b.trim()
        if (trimmed === '&') return ''
        if (/^&\s+/.test(trimmed)) return trimmed.replace(/^&\s+/, '')
        return trimmed
    }).filter(Boolean).join(', ')
}

/**
 * Extracts balanced parentheses parameter for an at-rule header.
 * e.g. "@when(:host([checked]))" -> { param: ":host([checked])", rest: "" }
 * e.g. "@state(:where(:host)) :where(:host)" -> { param: ":where(:host)", rest: ":where(:host)" }
 */
export const extractAtRuleParams = (
    header: string,
    keyword: string
): { param: string; rest: string } | null => {
    const trimmed = header.trim()
    const prefixRegex = new RegExp(`^${keyword}\\s*\\(`)
    const match = trimmed.match(prefixRegex)
    if (!match) return null

    const startIdx = match[0].length
    let depth = 1
    let inSingleQuote = false
    let inDoubleQuote = false
    let isEscaped = false
    let endIdx = -1

    for (let i = startIdx; i < trimmed.length; i++) {
        const ch = trimmed[i]
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
        if (inSingleQuote || inDoubleQuote) continue

        if (ch === '(') {
            depth++
        } else if (ch === ')') {
            depth--
            if (depth === 0) {
                endIdx = i
                break
            }
        }
    }

    if (endIdx === -1) {
        return null
    }

    return {
        param: trimmed.slice(startIdx, endIdx).trim(),
        rest: trimmed.slice(endIdx + 1).trim()
    }
}

/**
 * Merges hoisted rules that share the exact same shell selector.
 */
export const mergeHoistedRules = (rules: readonly string[]): string[] => {
    const map = new Map<string, string[]>()
    const order: string[] = []

    for (const rule of rules) {
        const trimmed = rule.trim()
        if (!trimmed) continue

        const openIdx = trimmed.indexOf('{')
        const closeIdx = trimmed.lastIndexOf('}')
        if (openIdx !== -1 && closeIdx !== -1 && closeIdx > openIdx) {
            const sel = trimmed.slice(0, openIdx).trim()
            const body = trimmed.slice(openIdx + 1, closeIdx).trim()
            if (!map.has(sel)) {
                map.set(sel, [])
                order.push(sel)
            }
            if (body) {
                map.get(sel)!.push(body)
            }
        } else {
            order.push(trimmed)
            map.set(trimmed, [])
        }
    }

    return order.map((sel) => {
        const bodies = map.get(sel)
        if (!bodies || bodies.length === 0) {
            return `${sel} {}`
        }
        return `${sel} { ${bodies.join(' ')} }`
    })
}

function resolveStateModifiers(
    definition: any,
    registry: StateTriggerRegistry
): { states: StateDimensionItem[] | StateDimensionItem[][]; isCombo: boolean } {
    let schema: StateSchema<any> | undefined = definition?.schema
    if (!schema && Array.isArray(definition)) {
        for (const item of definition) {
            if (item?.schema) {
                schema = item.schema
                break
            }
        }
    }
    if (!schema && typeof definition === 'object' && definition !== null) {
        for (const val of Object.values(definition)) {
            if (val && typeof val === 'object' && (val as any).schema) {
                schema = (val as any).schema
                break
            }
        }
    }

    if (schema?.dimensions && schema.dimensions.length > 1) {
        // Cartesian combo
        const combos = schema.validCombinations as readonly (readonly string[])[]
        const comboItems: StateDimensionItem[][] = []

        for (const combo of combos) {
            const items: StateDimensionItem[] = []
            for (const sName of combo) {
                const resolved = registry.resolve(sName, { anchor: '', isHostAnchor: false })
                items.push({
                    name: sName,
                    modifier: resolved.modifier,
                    target: 'self'
                })
            }
            comboItems.push(items)
        }
        return { states: comboItems, isCombo: true }
    }

    const stateNames: string[] = schema?.states ? [...schema.states] : []
    if (stateNames.length === 0) {
        return {
            states: [
                { name: 'enabled', modifier: '', target: 'self' }
            ],
            isCombo: false
        }
    }

    const singleItems: StateDimensionItem[] = stateNames.map((sName) => {
        const resolved = registry.resolve(sName, { anchor: '', isHostAnchor: false })
        return {
            name: sName,
            modifier: resolved.modifier,
            target: resolved.target
        }
    })

    return { states: singleItems, isCombo: false }
}

function transformStatements(
    statements: readonly ParsedStatement[],
    ctx: AtRulesCompilerContext
): TransformResult {
    const baseParts: string[] = []
    const hoistedParts: string[] = []

    for (const stmt of statements) {
        if (stmt.type === 'decl') {
            const expanded = expandDeclaration(stmt.property!, stmt.value!)
            baseParts.push(expanded)
            continue
        }

        if (stmt.type === 'block') {
            const header = stmt.header!
            const body = stmt.body!

            // 1. Isolation container: @layer, @media, @supports, @scope
            if (
                header.startsWith('@layer') ||
                header.startsWith('@media') ||
                header.startsWith('@supports') ||
                header.startsWith('@scope')
            ) {
                const innerStmts = parseStatements(body)
                const innerCtx: AtRulesCompilerContext = {
                    ...ctx,
                    ancestorPath: [...ctx.ancestorPath],
                    isolationContainer: header
                }
                const innerRes = transformStatements(innerStmts, innerCtx)
                const innerCombined = [...innerRes.baseRules, ...innerRes.hoistedRules].join(' ')
                baseParts.push(formatRule(header, innerCombined))
                continue
            }

            // 2. @variant(...)
            if (header.startsWith('@variant')) {
                const extracted = extractAtRuleParams(header, '@variant')
                if (!extracted || !extracted.param) {
                    if (ctx.options?.onWarn) {
                        ctx.options.onWarn({
                            type: 'invalid-variant',
                            message: `Invalid @variant syntax: "${header}".`
                        })
                    }
                    baseParts.push(formatRule(header, body))
                    continue
                }

                const rawParam = extracted.param
                const variantNames = splitSelectorByComma(rawParam)
                    .map((v) => v.trim())
                    .filter(Boolean)

                if (variantNames.length === 0) {
                    if (ctx.options?.onWarn) {
                        ctx.options.onWarn({
                            type: 'invalid-variant',
                            message: `Empty @variant name list: "${header}".`
                        })
                    }
                    baseParts.push(formatRule(header, body))
                    continue
                }

                if (variantNames.some((v) => v === '*' || v.startsWith('!'))) {
                    if (ctx.options?.onWarn) {
                        ctx.options.onWarn({
                            type: 'invalid-variant-name',
                            message: `Wildcards and negations are not supported in @variant: "${rawParam}".`
                        })
                    }
                }

                const selectorFn = ctx.options?.variantSelector ?? ((v: string) => `:host([variant="${v}"])`)
                const variantShell = variantNames.map((v) => selectorFn(v)).join(', ')

                const innerStmts = parseStatements(body)
                const innerCtx: AtRulesCompilerContext = {
                    ...ctx,
                    ancestorPath: [variantShell],
                    variantSelector: variantShell
                }
                const innerRes = transformStatements(innerStmts, innerCtx)

                const baseContent = innerRes.baseRules.join(' ')
                baseParts.push(formatRule(variantShell, baseContent))
                hoistedParts.push(...innerRes.hoistedRules)
                continue
            }

            // 3. @when(...)
            if (header.startsWith('@when')) {
                const extracted = extractAtRuleParams(header, '@when')
                if (!extracted || !extracted.param) {
                    if (ctx.options?.onWarn) {
                        ctx.options.onWarn({
                            type: 'invalid-when',
                            message: `Invalid @when syntax: "${header}".`
                        })
                    }
                    baseParts.push(formatRule(header, body))
                    continue
                }

                const rawParam = extracted.param
                const whenConditions = splitSelectorByComma(rawParam)
                    .map((c) => c.trim())
                    .filter(Boolean)

                if (whenConditions.length === 0) {
                    if (ctx.options?.onWarn) {
                        ctx.options.onWarn({
                            type: 'invalid-when',
                            message: `Empty @when condition list: "${header}".`
                        })
                    }
                    baseParts.push(formatRule(header, body))
                    continue
                }

                const hasHost = whenConditions.some(
                    (c) =>
                        c.startsWith(':host') ||
                        c.startsWith(':where(:host') ||
                        c.startsWith(':is(:host')
                )

                const whenConditionSelector = whenConditions.join(', ')
                const innerStmts = parseStatements(body)
                const innerRes = transformStatements(innerStmts, {
                    ...ctx,
                    ancestorPath: []
                })
                const whenContent = innerRes.baseRules.join(' ')

                if (!hasHost) {
                    if (ctx.options?.onWarn) {
                        ctx.options.onWarn({
                            type: 'invalid-when-condition',
                            message: `@when condition "${rawParam}" must explicitly contain :host.`
                        })
                    }
                    baseParts.push(formatRule(whenConditionSelector, whenContent))
                    continue
                }

                // Hoisting logic:
                if (ctx.ancestorPath.length === 0) {
                    // Top-level @when
                    baseParts.push(formatRule(whenConditionSelector, whenContent))
                } else {
                    // Nested @when -> Hoist!
                    let hoistedShell = ''
                    const innerPath = [...ctx.ancestorPath]

                    if (ctx.variantSelector) {
                        hoistedShell = appendToHostSelector(ctx.variantSelector, whenConditionSelector)
                        innerPath.shift()
                    } else if (
                        innerPath.length > 0 &&
                        (innerPath[0] === ':host' ||
                            innerPath[0].startsWith(':host') ||
                            innerPath[0].startsWith(':where(:host') ||
                            innerPath[0].startsWith(':is(:host'))
                    ) {
                        hoistedShell = appendToHostSelector(innerPath[0], whenConditionSelector)
                        innerPath.shift()
                    } else {
                        hoistedShell = whenConditionSelector
                    }

                    let wrappedContent = whenContent
                    for (let p = innerPath.length - 1; p >= 0; p--) {
                        const sel = removeAmpersandForHostSubtree(innerPath[p])
                        if (sel) {
                            wrappedContent = formatRule(sel, wrappedContent)
                        }
                    }

                    hoistedParts.push(formatRule(hoistedShell, wrappedContent))
                }
                continue
            }

            // 4. @state(target) selector
            if (header.startsWith('@state')) {
                const extracted = extractAtRuleParams(header, '@state')
                if (!extracted || !extracted.param || !extracted.rest) {
                    if (ctx.options?.onWarn) {
                        ctx.options.onWarn({
                            type: 'invalid-state-syntax',
                            message: `Invalid @state syntax: "${header}". Target and selector are both required.`
                        })
                    }
                    baseParts.push(formatRule(header, body))
                    continue
                }

                const target = extracted.param
                let targetSelector = extracted.rest

                // Rule R7: & button -> button
                if (/^&\s+([a-zA-Z0-9_.#*\[])/.test(targetSelector)) {
                    targetSelector = targetSelector.replace(/^&\s+/, '')
                }

                // Rule R8: check if selector contains target
                const check = replaceTargetInSelector(targetSelector, target, '')
                if (!check.matched) {
                    if (ctx.options?.onWarn) {
                        ctx.options.onWarn({
                            type: 'invalid-state-target',
                            message: `Selector "${targetSelector}" does not contain target "${target}".`,
                            ruleSelector: targetSelector
                        })
                    }
                    baseParts.push(formatRule(targetSelector, body))
                    continue
                }

                const currentDepth = ctx.stateNestingDepth ?? 0
                if (currentDepth >= 3 && ctx.options?.onWarn) {
                    ctx.options.onWarn({
                        type: 'excessive-state-nesting',
                        message: `High-order nesting of @state blocks (depth ${currentDepth + 1}) exceeds recommended limit (3).`
                    })
                }

                // Check for @when inside body of @state
                const innerStmts = parseStatements(body)
                const whenStmts = innerStmts.filter((s) => s.type === 'block' && s.header!.startsWith('@when'))
                const nonWhenStmts = innerStmts.filter((s) => !(s.type === 'block' && s.header!.startsWith('@when')))

                // Expand states
                if (ctx.isCombo) {
                    const comboList = ctx.states as StateDimensionItem[][]
                    const expandedRules: string[] = []

                    for (const combo of comboList) {
                        const comboMod = combo.map((item) => item.modifier).join('')
                        const replaced = replaceTargetInSelector(targetSelector, target, comboMod)
                        const sel = replaced.result

                        const stateRes = transformStatements(nonWhenStmts, {
                            ...ctx,
                            ancestorPath: [...ctx.ancestorPath, sel],
                            stateNestingDepth: currentDepth + 1
                        })
                        expandedRules.push(formatRule(sel, stateRes.baseRules.join(' ')))
                    }

                    baseParts.push(expandedRules.join(' '))
                } else {
                    const stateList = ctx.states as StateDimensionItem[]
                    const outerHost = ctx.ancestorPath.length > 0 && (ctx.ancestorPath[0] === ':host' || ctx.ancestorPath[0].startsWith(':host') || ctx.ancestorPath[0].startsWith(':where(:host'))
                        ? ctx.ancestorPath[0]
                        : null

                    const baseRulesForStates: string[] = []
                    const splitShellRules = new Map<string, string[]>()

                    for (const s of stateList) {
                        if (s.target === 'host' && outerHost && target !== ':host') {
                            // H1 Shell Splitting: host modifier splits outer host shell
                            const splitHost = appendToHostSelector(outerHost, s.modifier)
                            const innerSel = targetSelector

                            const stateRes = transformStatements(nonWhenStmts, {
                                ...ctx,
                                ancestorPath: ctx.ancestorPath.slice(1).concat(innerSel),
                                stateNestingDepth: currentDepth + 1
                            })
                            const content = formatRule(innerSel, stateRes.baseRules.join(' '))

                            if (!splitShellRules.has(splitHost)) {
                                splitShellRules.set(splitHost, [])
                            }
                            splitShellRules.get(splitHost)!.push(content)
                        } else {
                            const replaced = replaceTargetInSelector(targetSelector, target, s.modifier)
                            const sel = replaced.result

                            const stateRes = transformStatements(nonWhenStmts, {
                                ...ctx,
                                ancestorPath: [...ctx.ancestorPath, sel],
                                stateNestingDepth: currentDepth + 1
                            })
                            baseRulesForStates.push(formatRule(sel, stateRes.baseRules.join(' ')))
                        }
                    }

                    baseParts.push(baseRulesForStates.join(' '))

                    for (const [splitHost, innerRules] of splitShellRules.entries()) {
                        let wrapped = innerRules.join(' ')
                        for (let p = ctx.ancestorPath.length - 1; p >= 1; p--) {
                            const sel = removeAmpersandForHostSubtree(ctx.ancestorPath[p])
                            if (sel) {
                                wrapped = formatRule(sel, wrapped)
                            }
                        }
                        hoistedParts.push(formatRule(splitHost, wrapped))
                    }
                }

                // Handle nested @when inside @state
                for (const ws of whenStmts) {
                    const extractedWhen = extractAtRuleParams(ws.header!, '@when')
                    if (!extractedWhen || !extractedWhen.param) {
                        continue
                    }
                    const rawParam = extractedWhen.param
                    const whenConditions = splitSelectorByComma(rawParam).map((c) => c.trim()).filter(Boolean)
                    const whenConditionSelector = whenConditions.join(', ')

                    const innerWhenStmts = parseStatements(ws.body!)

                    // Expand state inside when
                    const whenExpandedRules: string[] = []
                    if (ctx.isCombo) {
                        const comboList = ctx.states as StateDimensionItem[][]
                        for (const combo of comboList) {
                            const comboMod = combo.map((item) => item.modifier).join('')
                            const replaced = replaceTargetInSelector(targetSelector, target, comboMod)
                            const sel = replaced.result
                            const wsRes = transformStatements(innerWhenStmts, {
                                ...ctx,
                                ancestorPath: []
                            })
                            whenExpandedRules.push(formatRule(sel, wsRes.baseRules.join(' ')))
                        }
                    } else {
                        const stateList = ctx.states as StateDimensionItem[]
                        for (const s of stateList) {
                            const replaced = replaceTargetInSelector(targetSelector, target, s.modifier)
                            const sel = replaced.result
                            const wsRes = transformStatements(innerWhenStmts, {
                                ...ctx,
                                ancestorPath: []
                            })
                            whenExpandedRules.push(formatRule(sel, wsRes.baseRules.join(' ')))
                        }
                    }

                    let hoistedShell = ''
                    const innerPath = [...ctx.ancestorPath]

                    if (ctx.variantSelector) {
                        hoistedShell = appendToHostSelector(ctx.variantSelector, whenConditionSelector)
                        innerPath.shift()
                    } else if (
                        innerPath.length > 0 &&
                        (innerPath[0] === ':host' ||
                            innerPath[0].startsWith(':host') ||
                            innerPath[0].startsWith(':where(:host') ||
                            innerPath[0].startsWith(':is(:host'))
                    ) {
                        hoistedShell = appendToHostSelector(innerPath[0], whenConditionSelector)
                        innerPath.shift()
                    } else {
                        hoistedShell = whenConditionSelector
                    }

                    let wrappedContent = whenExpandedRules.join(' ')
                    for (let p = innerPath.length - 1; p >= 0; p--) {
                        const sel = removeAmpersandForHostSubtree(innerPath[p])
                        if (sel) {
                            wrappedContent = formatRule(sel, wrappedContent)
                        }
                    }

                    hoistedParts.push(formatRule(hoistedShell, wrappedContent))
                }

                continue
            }

            // 5. Standard CSS rule block
            const innerStmts = parseStatements(body)
            const innerCtx: AtRulesCompilerContext = {
                ...ctx,
                ancestorPath: [...ctx.ancestorPath, header]
            }
            const innerRes = transformStatements(innerStmts, innerCtx)

            const baseContent = innerRes.baseRules.join(' ')
            baseParts.push(formatRule(header, baseContent))
            hoistedParts.push(...innerRes.hoistedRules)
        }
    }

    return {
        baseRules: baseParts.filter(Boolean),
        hoistedRules: mergeHoistedRules(hoistedParts.filter(Boolean))
    }
}

/**
 * Checks whether the stylesheet uses unambiguous At-Rules syntax that definitely
 * belongs to the new style engine (independent of options.onWarn).
 */
export const hasDefiniteAtRules = (css: string): boolean => {
    if (css.includes('@anchor') || css.includes('@size')) return false
    return (
        css.includes('@state') ||
        css.includes('@when') ||
        css.includes('@reduced-motion') ||
        css.includes('@forced-colors') ||
        css.includes('@contrast') ||
        css.includes('@reduced-transparency') ||
        /\b(shape|typescale)\s*:/i.test(css) ||
        /\b(padding|margin)\s*:\s*(var\(|[^;{}]+[\s\n]+[^;{}]+;)/i.test(css)
    )
}

/**
 * Checks whether the stylesheet uses the new At-Rules syntax.
 */
export const isAtRulesStylesheet = (css: string): boolean => {
    if (css.includes('@size')) return false
    return (
        hasDefiniteAtRules(css) ||
        (css.includes('@variant') && !css.includes('*') && !css.includes('!') && !css.includes('@starting-style') && /\{\s*[^{}]*\{\s*\}/.test(css))
    )
}

/**
 * Main compilation entrypoint for the new At-Rules style engine.
 */
export const compileAtRulesSheet = (
    definition: any,
    cssText: string,
    options?: CompileStateSheetOptions
): string => {
    if (!cssText || typeof cssText !== 'string' || cssText.trim().length === 0) {
        return ''
    }

    const cleanCss = stripComments(cssText)
    const a11yExpanded = expandA11yPresets(cleanCss)

    if (/@contrast\b(?!\s*\(\s*(more|less)\s*\))/.test(a11yExpanded) && options?.onWarn) {
        options.onWarn({
            type: 'invalid-a11y-macro',
            message: 'Invalid @contrast syntax. Supported parameters are (more) or (less).'
        })
    }

    const registry = options?.registry
        ? options.registry.clone()
        : new StateTriggerRegistry(options?.triggers)

    if (options?.triggers && options.registry) {
        registry.registerAll(options.triggers)
    }

    const { states, isCombo } = resolveStateModifiers(definition, registry)

    if (isCombo) {
        const comboList = states as StateDimensionItem[][]
        if (comboList.length > 64 && options?.onWarn) {
            options.onWarn({
                type: 'explosive-cartesian-matrix',
                message: `State schema generated ${comboList.length} Cartesian combinations, exceeding the recommended limit of 64.`
            })
        }
    }

    const rootCtx: AtRulesCompilerContext = {
        states,
        isCombo,
        registry,
        options,
        ancestorPath: []
    }

    const stmts = parseStatements(a11yExpanded)
    const res = transformStatements(stmts, rootCtx)
    const mergedHoisted = mergeHoistedRules(res.hoistedRules)

    return [...res.baseRules, ...mergedHoisted].join(' ').trim()
}

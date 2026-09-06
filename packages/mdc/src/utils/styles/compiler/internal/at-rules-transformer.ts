/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { StateTriggerRegistry } from '../../map-state-triggers'
import type { StateSchema } from '../../define-schema'
import type { StateTokenMetadata } from '../extract-state-token-metadata'
import {
    splitSelectorByComma,
    appendToHostSelector
} from '../compose-state-selector'
import { expandDeclaration } from '../expand-declaration'
import { replaceTargetInSelector } from '../replace-target'
import {
    rewriteStateVariables,
    type StateDimensionItem
} from '../rewrite-state-variables'
import { removeAmpersandForHostSubtree } from '../remove-ampersand'
import { extractAtRuleParams } from '../extract-at-rule-params'
import { mergeHoistedRules } from '../merge-hoisted-rules'
import type { CompileStateSheetOptions } from '../compile-state-sheet'
import type { AtRulesCompilerContext } from '../compile-at-rules-sheet'

export interface ParsedStatement {
    readonly type: 'decl' | 'block'
    readonly header?: string
    readonly body?: string
    readonly property?: string
    readonly value?: string
}

export interface TransformResult {
    readonly baseRules: string[]
    readonly hoistedRules: string[]
}

export function findMatchingBrace(css: string, openBraceIndex: number): number {
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

export function parseStatements(css: string): ParsedStatement[] {
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

export function formatRule(selector: string, content: string): string {
    const trimmedContent = content.trim()
    if (!trimmedContent) {
        return `${selector} {}`
    }
    return `${selector} { ${trimmedContent} }`
}

export function filterRelevantCombos(
    comboList: readonly StateDimensionItem[][],
    schema: StateSchema<any> | undefined,
    meta: StateTokenMetadata | undefined,
    stmts: readonly ParsedStatement[]
): { combos: StateDimensionItem[][]; activeDimensions: Set<number> | null } {
    if (!schema?.dimensions || schema.dimensions.length <= 1 || !meta) {
        return { combos: comboList as StateDimensionItem[][], activeDimensions: null }
    }

    // 1. Collect all referenced tokens (expanding shorthand macro properties)
    const referencedTokens = new Set<string>()
    for (const stmt of stmts) {
        if (stmt.type === 'decl' && stmt.property && stmt.value) {
            const expanded = expandDeclaration(stmt.property, stmt.value)
            for (const m of expanded.matchAll(/var\(\s*--_([a-zA-Z0-9_-]+)/g)) {
                referencedTokens.add(m[1])
            }
        }
    }

    if (referencedTokens.size === 0) {
        return { combos: comboList as StateDimensionItem[][], activeDimensions: null }
    }

    // 2. Determine which dimensions are active for the referenced tokens
    const activeDimensions = new Set<number>()
    schema.dimensions.forEach((dim, dimIdx) => {
        const baseStateOfDim = dim[0]
        for (const token of referencedTokens) {
            const definedStates = meta.getDefinedStates(token)
            for (const s of definedStates) {
                if (dim.includes(s) && s !== baseStateOfDim && s !== 'enabled' && s !== 'base') {
                    activeDimensions.add(dimIdx)
                    break
                }
            }
            if (activeDimensions.has(dimIdx)) break
        }
    })

    // If all dimensions are active, no pruning needed
    if (activeDimensions.size === schema.dimensions.length) {
        return { combos: comboList as StateDimensionItem[][], activeDimensions: null }
    }

    // 3. Prune combos where inactive dimensions take non-base states
    const filtered = comboList.filter((combo) => {
        return combo.every((item, dimIdx) => {
            if (activeDimensions.has(dimIdx)) return true
            const dim = schema.dimensions[dimIdx]
            const baseStateOfDim = dim ? dim[0] : 'enabled'
            return item.name === baseStateOfDim || item.name === 'enabled' || item.name === 'base'
        })
    })

    return {
        combos: filtered.length > 0 ? filtered : (comboList as StateDimensionItem[][]),
        activeDimensions
    }
}

export function resolveStateModifiers(
    definition: any,
    registry: StateTriggerRegistry
): { states: StateDimensionItem[] | StateDimensionItem[][]; isCombo: boolean; schema?: StateSchema<any> } {
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
                    target: resolved.target
                })
            }
            comboItems.push(items)
        }
        return { states: comboItems, isCombo: true, schema }
    }

    const stateNames: string[] = schema?.states ? [...schema.states] : []
    if (stateNames.length === 0) {
        return {
            states: [
                { name: 'enabled', modifier: '', target: 'self' }
            ],
            isCombo: false,
            schema
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

    return { states: singleItems, isCombo: false, schema }
}

export function transformStatements(
    statements: readonly ParsedStatement[],
    ctx: AtRulesCompilerContext
): TransformResult {
    const baseParts: string[] = []
    const hoistedParts: string[] = []

    for (const stmt of statements) {
        if (stmt.type === 'decl') {
            const expanded = expandDeclaration(stmt.property!, stmt.value!)
            if (ctx.currentStates && ctx.currentStates.length > 0 && ctx.meta) {
                const rawDecls = expanded.split(';').map(d => d.trim()).filter(Boolean)
                const validDecls: string[] = []
                for (const singleDecl of rawDecls) {
                    const varMatches = [...singleDecl.matchAll(/var\(\s*--_([a-zA-Z0-9_-]+)/g)]
                    let isMissingStateToken = false
                    for (const m of varMatches) {
                        const tokenName = m[1]
                        if (ctx.meta.isStateToken(tokenName)) {
                            const hasInAnyState = ctx.currentStates.some(s => ctx.meta!.hasStateToken(tokenName, s))
                            if (!hasInAnyState) {
                                isMissingStateToken = true
                                break
                            }
                        }
                    }
                    if (!isMissingStateToken) {
                        validDecls.push(rewriteStateVariables(singleDecl, ctx.currentStates, ctx.meta) + ';')
                    }
                }
                if (validDecls.length > 0) {
                    baseParts.push(validDecls.join(' '))
                }
                continue
            }
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
                    const fullComboList = ctx.states as StateDimensionItem[][]
                    const { combos: comboList, activeDimensions } = filterRelevantCombos(fullComboList, ctx.schema, ctx.meta, nonWhenStmts)
                    const expandedRules: string[] = []
                    const seenRules = new Set<string>()

                    for (const combo of comboList) {
                        const comboMod = combo
                            .map((item, dimIdx) => (activeDimensions && !activeDimensions.has(dimIdx) ? '' : item.modifier))
                            .join('')
                        const replaced = replaceTargetInSelector(targetSelector, target, comboMod)
                        const sel = replaced.result

                        const stateRes = transformStatements(nonWhenStmts, {
                            ...ctx,
                            ancestorPath: [...ctx.ancestorPath, sel],
                            stateNestingDepth: currentDepth + 1,
                            currentStates: combo.map((item) => item.name)
                        })
                        const ruleBody = stateRes.baseRules.join(' ')
                        const ruleText = formatRule(sel, ruleBody)
                        if (!seenRules.has(ruleText)) {
                            seenRules.add(ruleText)
                            expandedRules.push(ruleText)
                        }
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
                                stateNestingDepth: currentDepth + 1,
                                currentStates: [s.name]
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
                                stateNestingDepth: currentDepth + 1,
                                currentStates: [s.name]
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
                        const fullComboList = ctx.states as StateDimensionItem[][]
                        const { combos: comboList, activeDimensions } = filterRelevantCombos(fullComboList, ctx.schema, ctx.meta, innerWhenStmts)
                        const seenRules = new Set<string>()
                        for (const combo of comboList) {
                            const comboMod = combo
                                .map((item, dimIdx) => (activeDimensions && !activeDimensions.has(dimIdx) ? '' : item.modifier))
                                .join('')
                            const replaced = replaceTargetInSelector(targetSelector, target, comboMod)
                            const sel = replaced.result
                            const wsRes = transformStatements(innerWhenStmts, {
                                ...ctx,
                                ancestorPath: [],
                                currentStates: combo.map((item) => item.name)
                            })
                            const ruleBody = wsRes.baseRules.join(' ')
                            const ruleText = formatRule(sel, ruleBody)
                            if (!seenRules.has(ruleText)) {
                                seenRules.add(ruleText)
                                whenExpandedRules.push(ruleText)
                            }
                        }
                    } else {
                        const stateList = ctx.states as StateDimensionItem[]
                        for (const s of stateList) {
                            const replaced = replaceTargetInSelector(targetSelector, target, s.modifier)
                            const sel = replaced.result
                            const wsRes = transformStatements(innerWhenStmts, {
                                ...ctx,
                                ancestorPath: [],
                                currentStates: [s.name]
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

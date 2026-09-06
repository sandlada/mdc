/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * `@state` handler (R1–R8, H1–H4): target/selector validation, state-matrix
 * expansion (single and Cartesian combo), host-shell splitting, and nested
 * `@when` hoisting (shell computation shared via hoist-helpers).
 */

import type { StateSchema } from '../../define-schema'
import type { AtRulesCompilerContext } from '../compile-at-rules-sheet'
import { appendToHostSelector, splitSelectorByComma } from '../compose-state-selector'
import { expandDeclaration } from '../expand-declaration'
import { extractAtRuleParams } from '../extract-at-rule-params'
import type { StateTokenMetadata } from '../extract-state-token-metadata'
import { formatRule, parseStatements, type ParsedStatement } from '../internal/at-rules-transformer'
import { replaceTargetInSelector } from '../replace-target'
import type { StateDimensionItem } from '../rewrite-state-variables'
import type { AtRuleHandlerResult, Recurse } from './at-rule-handler'
import { hoistCondition, wrapWithAncestorPath } from './hoist-helpers'

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

export function handleStateBlock(
    header: string,
    body: string,
    ctx: AtRulesCompilerContext,
    recurse: Recurse
): AtRuleHandlerResult {
    const extracted = extractAtRuleParams(header, '@state')
    if (!extracted || !extracted.param || !extracted.rest) {
        if (ctx.options?.onWarn) {
            ctx.options.onWarn({
                type: 'invalid-state-syntax',
                message: `Invalid @state syntax: "${header}". Target and selector are both required.`
            })
        }
        return { base: formatRule(header, body) }
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
        return { base: formatRule(targetSelector, body) }
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

    const bases: string[] = []
    const hoisted: string[] = []

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

            const stateRes = recurse(nonWhenStmts, {
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

        bases.push(expandedRules.join(' '))
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

                const stateRes = recurse(nonWhenStmts, {
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

                const stateRes = recurse(nonWhenStmts, {
                    ...ctx,
                    ancestorPath: [...ctx.ancestorPath, sel],
                    stateNestingDepth: currentDepth + 1,
                    currentStates: [s.name]
                })
                baseRulesForStates.push(formatRule(sel, stateRes.baseRules.join(' ')))
            }
        }

        bases.push(baseRulesForStates.join(' '))

        for (const [splitHost, innerRules] of splitShellRules.entries()) {
            const wrapped = wrapWithAncestorPath(ctx.ancestorPath.slice(1), innerRules.join(' '))
            hoisted.push(formatRule(splitHost, wrapped))
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
                const wsRes = recurse(innerWhenStmts, {
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
                const wsRes = recurse(innerWhenStmts, {
                    ...ctx,
                    ancestorPath: [],
                    currentStates: [s.name]
                })
                whenExpandedRules.push(formatRule(sel, wsRes.baseRules.join(' ')))
            }
        }

        hoisted.push(hoistCondition(ctx.variantSelector, ctx.ancestorPath, whenConditionSelector, whenExpandedRules.join(' ')))
    }

    return { base: bases.join(' '), hoisted }
}

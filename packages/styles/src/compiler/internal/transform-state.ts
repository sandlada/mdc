/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * `@state` handler (R1–R8): target/selector validation, state-matrix
 * expansion (single and Cartesian combo), in-place merging, and nested
 * `@when` hoisting (shell computation shared via hoist-helpers).
 * Per SPEC-at-rules.md §0: `@state` only rewrites its given target and
 * selector and never touches outer selectors (no outer-shell splitting).
 */

import type { StateSchema } from '../../schema'
import type { AtRulesCompilerContext } from '../compile-at-rules-sheet'
import { splitSelectorByComma } from '../compose-state-selector'
import { expandDeclaration } from '../expand-declaration'
import { extractAtRuleParams } from '../extract-at-rule-params'
import type { StateTokenMetadata } from '../extract-state-token-metadata'
import { formatRule, parseStatements, type ParsedStatement } from './at-rules-transformer'
import { replaceTargetInSelector } from '../replace-target'
import type { StateDimensionItem } from '../rewrite-state-variables'
import type { AtRuleHandlerResult, Recurse } from './at-rule-handler'
import { hoistCondition, isHostMountedSelector } from './hoist-helpers'
import { hasNestedWhen } from './transform-when'

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

/**
 * Transpiler emission rule (not an optimizer pass): a state with no definition
 * in `def` (null / missing) never emits its shell when there is nothing to write.
 * A rule with a non-empty body always emits; an empty body emits only when the
 * state owns at least one state token. Pure-static definitions (no state tokens
 * at all) and missing metadata are exempt and always emit.
 */
const hasAnyStateToken = (
    meta: StateTokenMetadata | undefined,
    stateName: string
): boolean => {
    if (!meta || meta.allStateTokens.size === 0) {
        return true
    }
    for (const token of meta.allStateTokens) {
        if (meta.hasStateToken(token, stateName)) {
            return true
        }
    }
    return false
}

const isBaseLikeState = (
    meta: StateTokenMetadata | undefined,
    stateName: string
): boolean => {
    return stateName === 'enabled' || stateName === 'base' || (meta !== undefined && stateName === meta.baseState)
}

/**
 * Single-state emission: a rule with content always emits. An empty result
 * emits only when the input was also empty AND the state owns at least one
 * state token in `def`. A non-empty input filtered down to nothing (all
 * declarations dropped as unresolvable for this state) never emits.
 * Base states are not exempt (e.g. schema [s, m, l] with size [null, ...]
 * never emits `.btn.s`).
 */
const shouldEmitSingleStateRule = (
    meta: StateTokenMetadata | undefined,
    stateName: string,
    ruleBody: string,
    hadStatements: boolean
): boolean => {
    if (ruleBody.trim().length > 0) {
        return true
    }
    if (hadStatements) {
        return false
    }
    return hasAnyStateToken(meta, stateName)
}

/**
 * Combo emission: same contract over a combination. An empty result from an
 * empty input emits only when every non-base member owns a token. Base
 * members (dimension base / enabled / base) never block emission on their own.
 */
const shouldEmitComboRule = (
    meta: StateTokenMetadata | undefined,
    stateNames: readonly string[],
    ruleBody: string,
    hadStatements: boolean
): boolean => {
    if (ruleBody.trim().length > 0) {
        return true
    }
    if (hadStatements) {
        return false
    }
    return stateNames.every((name) => isBaseLikeState(meta, name) || hasAnyStateToken(meta, name))
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
        // [D] 缺 selector / 缺 target 屬無效 DSL：丟棄整塊，不外洩 @state 包裝（R8 的合法 CSS 透傳不在此列）。
        return {}
    }

    const target = extracted.param
    const targetSelector = extracted.rest

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
        // [D] 全部分支零匹配：丟棄整塊。R5 部分分支保留走展開路徑，不受此分支影響。
        return {}
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
    const whenStmts = innerStmts.filter((s) => s.type === 'block' && /^@when(?![a-zA-Z0-9_-])/.test(s.header!))
    const nonWhenStmts = innerStmts.filter((s) => !(s.type === 'block' && /^@when(?![a-zA-Z0-9_-])/.test(s.header!)))

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
            if (!shouldEmitComboRule(ctx.meta, combo.map((item) => item.name), ruleBody, nonWhenStmts.length > 0)) {
                continue
            }
            const ruleText = formatRule(sel, ruleBody)
            if (!seenRules.has(ruleText)) {
                seenRules.add(ruleText)
                expandedRules.push(ruleText)
            }
        }

        bases.push(expandedRules.join(' '))
    } else {
        const stateList = ctx.states as StateDimensionItem[]
        const baseRulesForStates: string[] = []

        for (const s of stateList) {
            const replaced = replaceTargetInSelector(targetSelector, target, s.modifier)
            const sel = replaced.result

            const stateRes = recurse(nonWhenStmts, {
                ...ctx,
                ancestorPath: [...ctx.ancestorPath, sel],
                stateNestingDepth: currentDepth + 1,
                currentStates: [s.name]
            })
            const singleBody = stateRes.baseRules.join(' ')
            if (!shouldEmitSingleStateRule(ctx.meta, s.name, singleBody, nonWhenStmts.length > 0)) {
                continue
            }
            baseRulesForStates.push(formatRule(sel, singleBody))
        }

        bases.push(baseRulesForStates.join(' '))
    }

    // Handle nested @when inside @state
    for (const ws of whenStmts) {
        const extractedWhen = extractAtRuleParams(ws.header!, '@when')
        if (!extractedWhen || !extractedWhen.param) {
            if (ctx.options?.onWarn) {
                ctx.options.onWarn({
                    type: 'invalid-when',
                    message: !extractedWhen
                        ? `Invalid @when syntax: "${ws.header!}".`
                        : `Empty @when condition list: "${ws.header!}".`
                })
            }
            continue
        }
        const rawParam = extractedWhen.param
        const whenConditions = splitSelectorByComma(rawParam).map((c) => c.trim()).filter(Boolean)
        if (whenConditions.length === 0) {
            if (ctx.options?.onWarn) {
                ctx.options.onWarn({
                    type: 'invalid-when',
                    message: `Empty @when condition list: "${ws.header!}".`
                })
            }
            continue
        }
        if (!whenConditions.every(isHostMountedSelector)) {
            if (ctx.options?.onWarn) {
                ctx.options.onWarn({
                    type: 'invalid-when-condition',
                    message: `@when condition "${rawParam}" must be mounted on :host.`
                })
            }
            // [D] 非 host 掛載只跳過該 @when，保留 @state 展開。
            continue
        }
        const whenConditionSelector = whenConditions.join(', ')

        const innerWhenStmts = parseStatements(ws.body!)
        if (hasNestedWhen(innerWhenStmts)) {
            if (ctx.options?.onWarn) {
                ctx.options.onWarn({
                    type: 'nested-when',
                    message: 'Nested @when at-rules are not supported.'
                })
            }
            continue
        }

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
                if (!shouldEmitComboRule(ctx.meta, combo.map((item) => item.name), ruleBody, innerWhenStmts.length > 0)) {
                    continue
                }
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
                const whenBody = wsRes.baseRules.join(' ')
                if (!shouldEmitSingleStateRule(ctx.meta, s.name, whenBody, innerWhenStmts.length > 0)) {
                    continue
                }
                whenExpandedRules.push(formatRule(sel, whenBody))
            }
        }

        hoisted.push(hoistCondition(ctx.variantSelector, ctx.ancestorPath, whenConditionSelector, whenExpandedRules.join(' ')))
    }

    return { base: bases.join(' '), hoisted }
}

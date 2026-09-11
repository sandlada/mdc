/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * AST-based selector hoisting engine:
 * Operates directly on CSSTree Rule, SelectorList, and Selector AST nodes.
 * Hoists @when and @variant to top-level rules with :host(...) shells,
 * preserving @layer containers and wrapping ancestor paths cleanly.
 */

import {
    parse,
    generate,
    clone,
    List,
    type Rule,
    type SelectorList,
    type Selector,
    type CssNode,
    type Atrule
} from '../internal/csstree'
import {
    appendToHostSelector,
    extractHostAndDescendant,
    splitSelectorByComma,
    removeAmpersandForHostSubtree
} from '../selectors'

export interface HoistTarget {
    readonly shell: string
    readonly remainingPath: readonly string[]
}

function stripComments(css: string): string {
    return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

function isBalanced(text: string): boolean {
    let parenDepth = 0
    let bracketDepth = 0
    let inSingleQuote = false
    let inDoubleQuote = false
    let isEscaped = false
    for (const ch of text) {
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
        } else if (ch === ')') {
            if (parenDepth === 0) return false
            parenDepth--
        } else if (ch === '[') {
            bracketDepth++
        } else if (ch === ']') {
            if (bracketDepth === 0) return false
            bracketDepth--
        }
    }
    return parenDepth === 0 && bracketDepth === 0
}

function isSingleHostMounted(branch: string): boolean {
    const s = branch.trim()
    if (!s) return false
    if (s === ':host') return true
    if (s.startsWith(':where(') || s.startsWith(':is(')) {
        if (!s.endsWith(')')) return false
        const inner = s.startsWith(':where(') ? s.slice(7, -1) : s.slice(4, -1)
        if (!inner.trim()) return false
        const parts = splitSelectorByComma(inner)
            .map((p) => p.trim())
            .filter(Boolean)
        if (parts.length === 0) return false
        return parts.every(isSingleHostMounted)
    }
    if (!s.startsWith(':host')) return false
    const rest = s.slice(5)
    if (!rest) return true
    if (!['(', '[', '.', '#', ':'].includes(rest[0])) return false
    let parenDepth = 0
    let bracketDepth = 0
    let inSingleQuote = false
    let inDoubleQuote = false
    let isEscaped = false
    for (let i = 0; i < rest.length; i++) {
        const ch = rest[i]
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
            if (
                ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '\f' ||
                ch === '>' || ch === '+' || ch === '~' || ch === '|' || ch === ','
            ) {
                return false
            }
        }
    }
    return parenDepth === 0 && bracketDepth === 0
}

/**
 * Strict host-mounted check: every top-level comma branch must be `:host`
 * itself (subject), with only compound continuations.
 */
export function isHostMountedSelector(selector: string): boolean {
    const clean = selector.includes('/*') ? stripComments(selector) : selector
    const branches = splitSelectorByComma(clean)
        .map((s) => s.trim())
        .filter(Boolean)
    if (branches.length === 0) return false
    return branches.every(isSingleHostMounted)
}

export function isHostRootSelector(selector: string): boolean {
    if (!selector || selector !== selector.trim()) return false
    return isHostMountedSelector(selector)
}

function hostBranchToRelative(branch: string): string | null {
    const trimmed = branch.trim()
    if (!trimmed) return null
    if (trimmed === '&' || trimmed === ':host') return '&'
    if (trimmed.startsWith(':where(') || trimmed.startsWith(':is(')) {
        if (!trimmed.endsWith(')')) return null
        const inner = trimmed.startsWith(':where(') ? trimmed.slice(7, -1) : trimmed.slice(4, -1)
        const parts = splitSelectorByComma(inner)
            .map((p) => p.trim())
            .filter(Boolean)
        if (parts.length === 0) return null
        const relatives: string[] = []
        for (const part of parts) {
            const relative = hostBranchToRelative(part)
            if (relative === null) return null
            relatives.push(relative)
        }
        if (relatives.every((r) => r === '&')) return '&'
        return relatives.join(', ')
    }
    if (!trimmed.startsWith(':host')) return null
    const rest = trimmed.slice(5)
    if (rest && !['(', '[', '.', '#', ':'].includes(rest[0])) return null
    const { hostPart, descendantPart } = extractHostAndDescendant(trimmed)
    if (!hostPart || !isBalanced(hostPart)) return null
    let base: string
    if (hostPart === ':host') {
        base = '&'
    } else if (hostPart.startsWith(':host(') && hostPart.endsWith(')')) {
        const innerModifier = hostPart.slice(6, -1)
        base = innerModifier ? `&${innerModifier}` : '&'
    } else {
        base = `&${hostPart.slice(5)}`
    }
    if (descendantPart) {
        return descendantPart.startsWith(':')
            ? `${base}${descendantPart}`
            : `${base} ${descendantPart}`.replace(/\s+/g, ' ').trim()
    }
    return base
}

/**
 * Relativizes a host-leading selector to `&`-form for nesting inside a variant shell.
 */
export function toAmpersandRelative(selector: string): string | null {
    const branches = splitSelectorByComma(selector)
        .map((s) => s.trim())
        .filter(Boolean)
    if (branches.length === 0) return null
    const converted: string[] = []
    for (const branch of branches) {
        const relative = hostBranchToRelative(branch)
        if (relative === null) return null
        converted.push(relative)
    }
    if (converted.every((c) => c === '&')) return ''
    return converted.join(', ')
}

export function computeHoistedShell(
    variantSelector: string | undefined,
    ancestorPath: readonly string[],
    conditionSelector: string
): HoistTarget {
    const innerPath = [...ancestorPath]
    if (variantSelector) {
        innerPath.shift()
        const remaining: string[] = []
        const conditionLayer = toAmpersandRelative(conditionSelector)
        if (conditionLayer === null) {
            remaining.push(conditionSelector)
        } else if (conditionLayer) {
            remaining.push(conditionLayer)
        }
        let index = 0
        while (index < innerPath.length && isHostRootSelector(innerPath[index])) {
            const relative = toAmpersandRelative(innerPath[index])
            if (relative === null) break
            if (relative) remaining.push(relative)
            index++
        }
        remaining.push(...innerPath.slice(index))
        return { shell: variantSelector, remainingPath: remaining }
    }
    if (innerPath.length > 0 && isHostRootSelector(innerPath[0])) {
        const root = innerPath.shift()!
        return { shell: appendToHostSelector(root, conditionSelector), remainingPath: innerPath }
    }
    return { shell: conditionSelector, remainingPath: innerPath }
}

function formatRule(selector: string, body: string): string {
    const trimmed = body.trim()
    if (!trimmed) {
        return `${selector} {}`
    }
    return `${selector} { ${trimmed} }`
}

export function wrapWithAncestorPath(
    remainingPath: readonly string[],
    content: string
): string {
    let wrapped = content
    for (let p = remainingPath.length - 1; p >= 0; p--) {
        const sel = removeAmpersandForHostSubtree(remainingPath[p])
        if (sel) {
            wrapped = formatRule(sel, wrapped)
        }
    }
    return wrapped
}

export function hoistCondition(
    variantSelector: string | undefined,
    ancestorPath: readonly string[],
    conditionSelector: string,
    content: string
): string {
    const { shell, remainingPath } = computeHoistedShell(variantSelector, ancestorPath, conditionSelector)
    return formatRule(shell, wrapWithAncestorPath(remainingPath, content))
}

/**
 * Checks if a Selector AST node is a root host selector (:host or :host(...)) without combinators.
 */
export function isHostRootSelectorAst(selectorNode: Selector): boolean {
    if (!selectorNode || !selectorNode.children || selectorNode.children.isEmpty) {
        return false
    }
    const children = selectorNode.children.toArray()
    for (const node of children) {
        if (node.type === 'Combinator') {
            return false
        }
    }
    const first = children[0]
    return first.type === 'PseudoClassSelector' && first.name === 'host'
}

/**
 * Converts a Selector AST node to an ampersand-relative selector AST.
 */
export function toAmpersandRelativeAst(selectorNode: Selector): Selector | null {
    const rawText = generate(selectorNode)
    const relText = toAmpersandRelative(rawText)
    if (relText === null) return null
    if (!relText) {
        return {
            type: 'Selector',
            loc: undefined,
            children: new List()
        } as Selector
    }
    try {
        return parse(relText, { context: 'selector' }) as Selector
    } catch {
        return null
    }
}

/**
 * AST-level hoisting of a Rule node.
 */
export function hoistRuleAst(
    ruleNode: Rule,
    variantSelectorAst: SelectorList | null,
    conditionSelectorAst: SelectorList,
    ancestorPathAst: readonly SelectorList[],
    layerContainer?: Atrule | null
): Rule {
    const variantStr = variantSelectorAst ? generate(variantSelectorAst) : undefined
    const ancestorStrings = ancestorPathAst.map((a) => generate(a))
    const conditionStr = generate(conditionSelectorAst)
    const bodyStr = generate(ruleNode.block)

    const hoistedStr = hoistCondition(variantStr, ancestorStrings, conditionStr, bodyStr)
    const hoistedRule = parse(hoistedStr, { context: 'rule' }) as Rule

    return hoistedRule
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

/**
 * Merges hoisted Rule AST nodes that share the exact same shell selector AST.
 */
export function mergeHoistedRulesAst(rules: Rule[]): Rule[] {
    const map = new Map<string, Rule>()
    const result: Rule[] = []
    for (const rule of rules) {
        const selText = generate(rule.prelude)
        if (map.has(selText)) {
            const existing = map.get(selText)!
            if (rule.block && rule.block.children) {
                (rule.block.children as any).forEach((c: CssNode) => {
                    (existing.block.children as any).push(clone(c))
                })
            }
        } else {
            const copied = clone(rule) as Rule
            map.set(selText, copied)
            result.push(copied)
        }
    }
    return result
}

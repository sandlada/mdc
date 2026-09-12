/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * AST-based selector target replacement:
 * - 100% CSSTree AST-driven traversal and matching
 * - Tail-canonical insertion: modifier placed at compound tail (after function pseudo-classes, before ::pseudo-elements) for short targets
 * - Exact boundary insertion for compound/multi-part targets
 * - Recursive pseudo-class traversal (:has, :is, :not, :where, ::slotted)
 * - Strict :host validation
 * - Tolerant fallback for CSS Selectors 4 column combinators (||) and dirty input
 */

import {
    parse,
    generate,
    type Selector,
    type CssNode,
    type PseudoClassSelector,
    type PseudoElementSelector,
    type Combinator
} from '../internal/csstree'
import {
    extractHostAndDescendant,
    appendToHostSelector,
    splitSelectorByComma,
    isHostLeading
} from '../selectors'

/**
 * Host-like prefix check.
 */
const looksHostLike = (selector: string): boolean =>
    selector.startsWith(':host') ||
    selector.startsWith(':where(:host') ||
    selector.startsWith(':is(:host')

/**
 * Strict host-target check (BUG-01): :host with boundary validation,
 * plus :where(...) / :is(...) wrappers whose every branch is host-leading.
 */
export const isStrictHostTarget = (selector: string): boolean => {
    if (isHostLeading(selector)) {
        return true
    }
    if (selector.startsWith(':where(') || selector.startsWith(':is(')) {
        if (!selector.endsWith(')')) {
            return false
        }
        const inner = selector.startsWith(':where(') ? selector.slice(7, -1) : selector.slice(4, -1)
        if (!inner.trim()) {
            return false
        }
        return splitSelectorByComma(inner).every((part) => isStrictHostTarget(part.trim()))
    }
    return false
}

/**
 * Host-branch check.
 */
export const isHostBranch = (branch: string): boolean => {
    if (extractHostAndDescendant(branch).hostPart !== '') {
        return true
    }
    if (branch.startsWith(':where(') || branch.startsWith(':is(')) {
        const openIdx = branch.indexOf('(')
        let depth = 0
        let closeIdx = -1
        for (let i = openIdx; i < branch.length; i++) {
            if (branch[i] === '(') depth++
            else if (branch[i] === ')') {
                depth--
                if (depth === 0) {
                    closeIdx = i
                    break
                }
            }
        }
        if (closeIdx === -1) {
            return false
        }
        return isStrictHostTarget(branch.slice(0, closeIdx + 1).trim())
    }
    return false
}

function countTargetComponents(target: string): number {
    let count = 0
    let i = 0
    if (target.length > 0 && !/^[.#:\[]/.test(target)) {
        count++
    }
    let depth = 0
    let inQuote = false
    let quoteChar = ''
    while (i < target.length) {
        const ch = target[i]
        if (inQuote) {
            if (ch === '\\') {
                i += 2
                continue
            }
            if (ch === quoteChar) {
                inQuote = false
            }
            i++
            continue
        }
        if (ch === '"' || ch === "'") {
            inQuote = true
            quoteChar = ch
            i++
            continue
        }
        if (ch === '(' || ch === '[') {
            depth++
            if (ch === '[' && depth === 1) count++
            i++
            continue
        }
        if (ch === ')' || ch === ']') {
            if (depth > 0) depth--
            i++
            continue
        }
        if (depth === 0) {
            if (ch === '.' || ch === '#') {
                count++
            } else if (ch === ':') {
                count++
                if (target[i + 1] === ':') {
                    i++
                }
            } else if (ch === '>' || ch === '+' || ch === '~') {
                count++
            } else if (ch === '|' && target[i + 1] === '|') {
                count++
                i++
            } else if (/\s/.test(ch)) {
                while (i + 1 < target.length && /\s/.test(target[i + 1])) i++
                count++
            }
        }
        i++
    }
    return count
}

/**
 * Checks if two AST nodes match for target purposes.
 */
function nodeMatchesTarget(branchItem: CssNode, targetItem: CssNode): boolean {
    if (branchItem.type !== targetItem.type) {
        return false
    }

    switch (targetItem.type) {
        case 'TypeSelector':
            return (branchItem as any).name.toLowerCase() === (targetItem as any).name.toLowerCase()
        case 'ClassSelector':
        case 'IdSelector':
            return (branchItem as any).name === (targetItem as any).name
        case 'PseudoClassSelector': {
            const bp = branchItem as PseudoClassSelector
            const tp = targetItem as PseudoClassSelector
            if (bp.name !== tp.name) return false
            if (!tp.children) return true
            return generate(bp) === generate(tp)
        }
        case 'PseudoElementSelector': {
            const bp = branchItem as PseudoElementSelector
            const tp = targetItem as PseudoElementSelector
            if (bp.name !== tp.name) return false
            if (!tp.children) return true
            return generate(bp) === generate(tp)
        }
        case 'Combinator': {
            const bc = (branchItem as Combinator).name.trim()
            const tc = (targetItem as Combinator).name.trim()
            return bc === tc
        }
        case 'AttributeSelector':
            return generate(branchItem) === generate(targetItem)
        default:
            return generate(branchItem) === generate(targetItem)
    }
}

/**
 * Fallback regex replacement for non-standard / dirty selectors (e.g. column combinator ||).
 */
function replaceTargetFallback(
    branch: string,
    target: string,
    modifier: string
): { result: string; matched: boolean } {
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const combinatorPattern = target
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
    let match: RegExpExecArray | null
    let matchedAny = false
    const insertions: { insertAt: number; modifier: string }[] = []

    while ((match = targetRegex.exec(branch)) !== null) {
        const start = match.index
        const end = start + match[0].length

        // Check boundary
        if (start > 0) {
            const prev = branch[start - 1]
            if (/[a-zA-Z0-9_]/.test(target[0]) && /[a-zA-Z0-9_.#:[\]\-]/.test(prev)) {
                continue
            }
        }
        if (end < branch.length) {
            const next = branch[end]
            const lastTargetChar = target[target.length - 1]
            if (/[a-zA-Z0-9_-]/.test(lastTargetChar) && /[a-zA-Z0-9_-]/.test(next)) {
                continue
            }
        }

        matchedAny = true
        insertions.push({ insertAt: end, modifier })
    }

    if (insertions.length > 0) {
        insertions.sort((a, b) => b.insertAt - a.insertAt)
        let result = branch
        for (const ins of insertions) {
            result = result.slice(0, ins.insertAt) + ins.modifier + result.slice(ins.insertAt)
        }
        return { result, matched: true }
    }

    return { result: branch, matched: matchedAny }
}

/**
 * AST-based target replacement within a single selector branch string.
 */
export function replaceTargetInBranch(
    branch: string,
    target: string,
    modifier: string,
    isCombo?: boolean
): { result: string; matched: boolean } {
    if (!branch || !target) {
        return { result: branch, matched: false }
    }

    const trimmedTarget = target.trim()
    let trimmedBranch = branch.trim()

    // 1. Host targets (:host, :where(:host), :is(:host), etc.)
    if (looksHostLike(trimmedTarget)) {
        if (!isStrictHostTarget(trimmedTarget)) {
            return { result: trimmedBranch, matched: false }
        }
        if (isHostBranch(trimmedBranch)) {
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

            const updatedHost = isCombo !== undefined && (hostPart.startsWith(':where(') || hostPart.startsWith(':is('))
                ? `${hostPart}${modifier}`
                : appendToHostSelector(hostPart, modifier)
            if (descendantPart) {
                const sep = /^[>+~|][^\s]/.test(descendantPart) ? '' : ' '
                return { result: `${updatedHost}${sep}${descendantPart}`, matched: true }
            }
            return { result: updatedHost, matched: true }
        }

        return { result: trimmedBranch, matched: false }
    }

    // Parse target and branch with CSSTree
    let branchAst: Selector
    let targetAst: Selector
    try {
        branchAst = parse(trimmedBranch, { context: 'selector', positions: true }) as Selector
        targetAst = parse(trimmedTarget, { context: 'selector', positions: true }) as Selector
    } catch {
        return replaceTargetFallback(trimmedBranch, trimmedTarget, modifier)
    }

    let matchedAny = false

    // 2. Recursive traversal inside top-level functional pseudo-classes (:has, :is, :where, :not, ::slotted)
    if (!isCombo) {
        const topBranchNodes = branchAst.children.toArray()
        const innerReplacements: { start: number; end: number; replacement: string }[] = []

        for (const node of topBranchNodes) {
            if (node.type === 'PseudoClassSelector' || node.type === 'PseudoElementSelector') {
                const pNode = node as PseudoClassSelector | PseudoElementSelector
                const name = pNode.name.toLowerCase()
                if ((name === 'has' || name === 'is' || name === 'where' || name === 'not' || name === 'slotted') && pNode.children && pNode.loc) {
                    const openParen = trimmedBranch.indexOf('(', pNode.loc.start.offset)
                    const closeParen = pNode.loc.end.offset - 1
                    if (openParen !== -1 && closeParen > openParen) {
                        const innerText = trimmedBranch.slice(openParen + 1, closeParen)
                        const innerRes = replaceTargetInSelector(innerText, target, modifier, false)
                        if (innerRes.matched) {
                            matchedAny = true
                            innerReplacements.push({
                                start: openParen + 1,
                                end: closeParen,
                                replacement: innerRes.result
                            })
                        }
                    }
                }
            }
        }

        if (innerReplacements.length > 0) {
            innerReplacements.sort((a, b) => b.start - a.start)
            for (const rep of innerReplacements) {
                trimmedBranch = trimmedBranch.slice(0, rep.start) + rep.replacement + trimmedBranch.slice(rep.end)
            }
            // Re-parse with updated branch
            try {
                branchAst = parse(trimmedBranch, { context: 'selector', positions: true }) as Selector
            } catch {
                return { result: trimmedBranch, matched: matchedAny }
            }
        }
    }

    // 3. Match target at the current compound / complex selector level
    const targetNodes = targetAst.children.toArray().filter((c) => c.type !== 'Comment')
    const branchNodes = branchAst.children.toArray()

    if (targetNodes.length === 0 || branchNodes.length === 0) {
        return { result: trimmedBranch, matched: matchedAny }
    }

    const isLongTarget = countTargetComponents(trimmedTarget) > 1
    const targetEndsWithPseudo = targetNodes[targetNodes.length - 1].type === 'PseudoElementSelector'
    const insertions: { insertAt: number; modifier: string }[] = []

    for (let i = 0; i <= branchNodes.length - targetNodes.length; i++) {
        let matches = true
        for (let j = 0; j < targetNodes.length; j++) {
            if (!nodeMatchesTarget(branchNodes[i + j], targetNodes[j])) {
                matches = false
                break
            }
        }

        if (matches) {
            matchedAny = true

            let insertAt: number
            if (targetEndsWithPseudo) {
                // If target itself ends with ::pseudo, insert before ::pseudo
                const pseudoNode = branchNodes[i + targetNodes.length - 1]
                insertAt = pseudoNode.loc ? pseudoNode.loc.start.offset : trimmedBranch.length
            } else if (isLongTarget) {
                // Multi-component target: insert immediately at the end of the matched target
                const lastTargetNode = branchNodes[i + targetNodes.length - 1]
                insertAt = lastTargetNode.loc ? lastTargetNode.loc.end.offset : trimmedBranch.length
            } else {
                // Tail-canonical insertion: find the end of the compound selector (before ::pseudo or combinator)
                let compoundTailIdx = i + targetNodes.length - 1
                let pseudoElemStartOffset = -1

                for (let k = i + targetNodes.length; k < branchNodes.length; k++) {
                    const node = branchNodes[k]
                    if (node.type === 'Combinator') {
                        break
                    }
                    if (node.type === 'PseudoElementSelector') {
                        if (node.loc && pseudoElemStartOffset === -1) {
                            pseudoElemStartOffset = node.loc.start.offset
                        }
                        break
                    }
                    compoundTailIdx = k
                }

                if (pseudoElemStartOffset !== -1) {
                    insertAt = pseudoElemStartOffset
                } else {
                    const tailNode = branchNodes[compoundTailIdx]
                    insertAt = tailNode.loc ? tailNode.loc.end.offset : trimmedBranch.length
                }
            }

            insertions.push({ insertAt, modifier })
        }
    }

    if (insertions.length > 0) {
        insertions.sort((a, b) => b.insertAt - a.insertAt)
        let result = trimmedBranch
        for (const ins of insertions) {
            result = result.slice(0, ins.insertAt) + ins.modifier + result.slice(ins.insertAt)
        }
        return { result, matched: true }
    }

    return { result: trimmedBranch, matched: matchedAny }
}

/**
 * Replaces target in selector across all comma-separated branches.
 */
export function replaceTargetInSelector(
    selector: string,
    target: string,
    modifier: string,
    isCombo = false
): { result: string; matched: boolean } {
    const branches = splitSelectorByComma(selector)
    let matchedAny = false

    const updatedBranches = branches.map((branch) => {
        const res = replaceTargetInBranch(branch, target, modifier, isCombo)
        if (res.matched) matchedAny = true
        return res.result
    })

    return {
        result: updatedBranches.join(', '),
        matched: matchedAny
    }
}

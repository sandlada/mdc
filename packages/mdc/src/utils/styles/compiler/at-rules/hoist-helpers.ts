/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * Shared shell-hoisting primitives for `@when` and `@state`-nested `@when`.
 * Single implementation of the hoisted-shell computation previously
 * duplicated across both branches.
 */

import { appendToHostSelector, splitSelectorByComma } from '../compose-state-selector'
import { removeAmpersandForHostSubtree } from '../remove-ampersand'
import { formatRule } from '../internal/at-rules-transformer'
import { stripComments } from '../strip-comments'

/**
 * Strict host-mounted check: every top-level comma branch must be `:host`
 * itself (subject), with only compound continuations (`(...)`, `[...]`,
 * `.class`, `#id`, `:pseudo` / `::pseudo`, no whitespace / combinators).
 * `:where(...)` / `:is(...)` wrappers are unwrapped recursively; any trailing
 * descendant (e.g. `:host .container`, `:host([selected]) button`) is invalid.
 */
export function isHostMountedSelector(selector: string): boolean {
    const clean = selector.includes('/*') || selector.includes('//') ? stripComments(selector) : selector
    const branches = splitSelectorByComma(clean)
        .map((s) => s.trim())
        .filter(Boolean)
    if (branches.length === 0) {
        return false
    }
    return branches.every(isSingleHostMounted)
}

function isSingleHostMounted(branch: string): boolean {
    const s = branch.trim()
    if (!s) {
        return false
    }
    if (s === ':host') {
        return true
    }
    if (s.startsWith(':where(') || s.startsWith(':is(')) {
        if (!s.endsWith(')')) {
            return false
        }
        const inner = s.startsWith(':where(') ? s.slice(7, -1) : s.slice(4, -1)
        if (!inner.trim()) {
            return false
        }
        const parts = splitSelectorByComma(inner)
            .map((p) => p.trim())
            .filter(Boolean)
        if (parts.length === 0) {
            return false
        }
        return parts.every(isSingleHostMounted)
    }
    if (!s.startsWith(':host')) {
        return false
    }
    const rest = s.slice(5)
    if (!rest) {
        return true
    }
    if (!['(', '[', '.', '#', ':'].includes(rest[0])) {
        return false
    }
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
        if (inSingleQuote || inDoubleQuote) {
            continue
        }
        if (ch === '(') {
            parenDepth++
            continue
        }
        if (ch === ')') {
            if (parenDepth > 0) {
                parenDepth--
            }
            continue
        }
        if (ch === '[') {
            bracketDepth++
            continue
        }
        if (ch === ']') {
            if (bracketDepth > 0) {
                bracketDepth--
            }
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
    if (parenDepth !== 0 || bracketDepth !== 0) {
        return false
    }
    return true
}

export function isHostRootSelector(selector: string): boolean {
    if (!selector || selector !== selector.trim()) {
        return false
    }
    return isHostMountedSelector(selector)
}

export interface HoistTarget {
    readonly shell: string
    readonly remainingPath: readonly string[]
}

export function computeHoistedShell(
    variantSelector: string | undefined,
    ancestorPath: readonly string[],
    conditionSelector: string
): HoistTarget {
    const innerPath = [...ancestorPath]
    if (variantSelector) {
        innerPath.shift()
        return { shell: appendToHostSelector(variantSelector, conditionSelector), remainingPath: innerPath }
    }
    if (innerPath.length > 0 && isHostRootSelector(innerPath[0])) {
        const root = innerPath.shift()!
        return { shell: appendToHostSelector(root, conditionSelector), remainingPath: innerPath }
    }
    return { shell: conditionSelector, remainingPath: innerPath }
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

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * Shared shell-hoisting primitives for `@when` and `@state`-nested `@when`.
 * Single implementation of the hoisted-shell computation previously
 * duplicated across both branches.
 */

import { appendToHostSelector, extractHostAndDescendant, splitSelectorByComma } from '../compose-state-selector'
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
    const clean = selector.includes('/*') ? stripComments(selector) : selector
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

/**
 * Relativizes a host-leading selector to `&`-form for nesting inside a
 * variant shell (BUG-12): `:host([dense])` → `&[dense]`,
 * `:host(:hover)` → `&:hover`, `:where(:host([a]), :host([b]))` → `&[a], &[b]`.
 * Returns `null` when the selector is not host-leading (caller keeps it
 * as-is), `''` when the whole selector is a bare host (redundant layer,
 * caller drops it).
 */
export function toAmpersandRelative(selector: string): string | null {
    const branches = splitSelectorByComma(selector)
        .map((s) => s.trim())
        .filter(Boolean)
    if (branches.length === 0) {
        return null
    }
    const converted: string[] = []
    for (const branch of branches) {
        const relative = hostBranchToRelative(branch)
        if (relative === null) {
            return null
        }
        converted.push(relative)
    }
    if (converted.every((c) => c === '&')) {
        return ''
    }
    return converted.join(', ')
}

function hostBranchToRelative(branch: string): string | null {
    const trimmed = branch.trim()
    if (!trimmed) {
        return null
    }
    if (trimmed === '&' || trimmed === ':host') {
        return '&'
    }
    if (trimmed.startsWith(':where(') || trimmed.startsWith(':is(')) {
        if (!trimmed.endsWith(')')) {
            return null
        }
        const inner = trimmed.startsWith(':where(') ? trimmed.slice(7, -1) : trimmed.slice(4, -1)
        const parts = splitSelectorByComma(inner)
            .map((p) => p.trim())
            .filter(Boolean)
        if (parts.length === 0) {
            return null
        }
        const relatives: string[] = []
        for (const part of parts) {
            const relative = hostBranchToRelative(part)
            if (relative === null) {
                return null
            }
            relatives.push(relative)
        }
        if (relatives.every((r) => r === '&')) {
            return '&'
        }
        return relatives.join(', ')
    }
    if (!trimmed.startsWith(':host')) {
        return null
    }
    const rest = trimmed.slice(5)
    if (rest && !['(', '[', '.', '#', ':'].includes(rest[0])) {
        return null
    }
    const { hostPart, descendantPart } = extractHostAndDescendant(trimmed)
    if (!hostPart || !isBalanced(hostPart)) {
        return null
    }
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
            if (parenDepth === 0) {
                return false
            }
            parenDepth--
        } else if (ch === '[') {
            bracketDepth++
        } else if (ch === ']') {
            if (bracketDepth === 0) {
                return false
            }
            bracketDepth--
        }
    }
    return parenDepth === 0 && bracketDepth === 0
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
            if (relative === null) {
                break
            }
            if (relative) {
                remaining.push(relative)
            }
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

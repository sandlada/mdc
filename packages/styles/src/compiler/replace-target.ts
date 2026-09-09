/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import {
    extractHostAndDescendant,
    appendToHostSelector,
    splitSelectorByComma,
    isHostLeading
} from './compose-state-selector'

/**
 * Host-like prefix sniff (deliberately loose): true for `:host…`,
 * `:where(:host…` and `:is(:host…` including boundary-invalid `:hostx`.
 * Used only to decide the R8 short-circuit below, never as a match signal.
 */
const looksHostLike = (selector: string): boolean =>
    selector.startsWith(':host') ||
    selector.startsWith(':where(:host') ||
    selector.startsWith(':is(:host')

/**
 * Strict host-target check (BUG-01): `:host` with boundary validation,
 * plus `:where(...)` / `:is(...)` wrappers whose every branch is host-leading.
 * `:hostx` / `:where(:hostx)` → false.
 */
const isStrictHostTarget = (selector: string): boolean => {
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
 * Host-branch check (BUG-01 follow-up): the branch's *leading component* is
 * host, with an optional trailing descendant (`:host .label`,
 * `:where(:host) .label`). Unlike `isStrictHostTarget` (whole-selector,
 * used for targets), descendants are allowed here — the body below splits
 * them off via `extractHostAndDescendant` / paren scan. `:hostx` → false.
 */
const isHostBranch = (branch: string): boolean => {
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
    // BUG-01: host-like but boundary-invalid (`:hostx`) short-circuits to
    // no-match (R8 [D] upstream) instead of falling into the element path,
    // where it would literally match itself and wrongly report `matched: true`.
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

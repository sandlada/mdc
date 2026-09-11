/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { emptyTables, resolveState, type TriggerContext, type TriggerTables } from '../../schema'

export function canonicalizeState(state: string): string {
    if (state === 'hovered') return 'hover'
    if (state === 'pressed') return 'active'
    if (state === 'focused') return 'focus'
    return state
}

/**
 * Splits a selector on top-level commas respecting (), [], and quotes.
 */
export function splitSelectorByComma(selector: string): string[] {
    const parts: string[] = []
    let current = ''
    let parenDepth = 0
    let bracketDepth = 0
    let inSingleQuote = false
    let inDoubleQuote = false
    let isEscaped = false

    for (let i = 0; i < selector.length; i++) {
        const ch = selector[i]

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

        if (ch === ',' && parenDepth === 0 && bracketDepth === 0) {
            const trimmed = current.trim()
            if (trimmed) parts.push(trimmed)
            current = ''
            continue
        }

        current += ch
    }

    const trailing = current.trim()
    if (trailing) parts.push(trailing)

    return parts.length > 0 ? parts : [selector.trim()]
}

/**
 * Strict `:host` leading-edge check with boundary validation (BUG-01, E0 safe-set).
 * Allowlist-only: the char after `:host` must be end-of-input, a compound
 * opener (`(`/`[`/`.`/`#`/`:`), whitespace, a combinator (`>`/`+`/`~`/`|`/`,`)
 * or a universal descendant (`*`). Anything else — ASCII identifier
 * continuations (`:hostx`, `:host-foo`) AND non-ASCII (`:hosté`), `/`, etc. —
 * is not host. Expects trimmed input (mirrors `isHostRootSelector` strictness).
 */
export function isHostLeading(selector: string): boolean {
    if (selector === ':host') {
        return true
    }
    if (!selector.startsWith(':host')) {
        return false
    }
    const next = selector[5]
    return next === undefined ||
        next === '(' || next === '[' || next === '.' || next === '#' || next === ':' ||
        next === ' ' || next === '\t' || next === '\n' || next === '\r' || next === '\f' ||
        next === '>' || next === '+' || next === '~' || next === '|' || next === ',' || next === '*'
}

/**
 * Splits a selector into its leading host component and any trailing descendant/combinator part.
 * e.g. ':host(:not(.hidden)) .elevation::before' -> { hostPart: ':host(:not(.hidden))', descendantPart: '.elevation::before' }
 */
export function extractHostAndDescendant(selector: string): { hostPart: string; descendantPart: string } {
    const trimmed = selector.trim()
    if (!isHostLeading(trimmed)) {
        return { hostPart: '', descendantPart: trimmed }
    }

    let i = 5
    const len = trimmed.length

    if (i < len && trimmed[i] === '(') {
        let depth = 0
        while (i < len) {
            if (trimmed[i] === '(') depth++
            else if (trimmed[i] === ')') {
                depth--
                if (depth === 0) {
                    i++
                    break
                }
            }
            i++
        }
    }

    while (i < len) {
        if (trimmed[i] === ':' || trimmed[i] === '[' || trimmed[i] === '.') {
            const nextMatch = trimmed.slice(i).match(/^(:[a-zA-Z0-9_-]+(\([^)]*\))?|\[[^\]]*\]|\.[a-zA-Z0-9_-]+)/)
            if (nextMatch) {
                i += nextMatch[0].length
            } else {
                break
            }
        } else {
            break
        }
    }

    const hostPart = trimmed.slice(0, i).trim()
    const descendantPart = trimmed.slice(i).trim()
    return { hostPart, descendantPart }
}

/**
 * Appends a modifier to a :host selector, respecting depth-balanced parentheses and comma-separated selectors.
 */
export function appendToHostSelector(hostSelector: string, modifier: string): string {
    if (!modifier) return hostSelector
    if (!hostSelector) return modifier

    const modParts = splitSelectorByComma(modifier)
    if (modParts.length > 1) {
        return modParts.map((m) => appendToHostSelector(hostSelector, m)).join(', ')
    }

    const parts = splitSelectorByComma(hostSelector)
    if (parts.length > 1) {
        return parts.map((part) => appendToHostSelector(part, modifier)).join(', ')
    }

    const trimmedHost = hostSelector.trim()
    const trimmedMod = modifier.trim()

    if (!trimmedMod || trimmedMod === ':host') return trimmedHost

    // Handle :where(...) or :is(...) containing host selectors
    if (trimmedHost.startsWith(':where(') && trimmedHost.endsWith(')')) {
        const inner = trimmedHost.slice(7, -1)
        const innerParts = splitSelectorByComma(inner)
        const appended = innerParts.map((p) => appendToHostSelector(p, trimmedMod)).join(', ')
        return `:where(${appended})`
    }

    if (trimmedHost.startsWith(':is(') && trimmedHost.endsWith(')')) {
        const inner = trimmedHost.slice(4, -1)
        const innerParts = splitSelectorByComma(inner)
        const appended = innerParts.map((p) => appendToHostSelector(p, trimmedMod)).join(', ')
        return `:is(${appended})`
    }

    if (trimmedHost === ':host') {
        if (trimmedMod.startsWith(':where(') || trimmedMod.startsWith(':is(')) {
            return trimmedMod
        }
        if (trimmedMod.startsWith(':host')) {
            if (trimmedMod.startsWith(':host[') || trimmedMod.startsWith(':host.')) {
                const rest = trimmedMod.slice(5)
                const nextMatch = rest.match(/^[.\[][^\s>+~]*/)
                if (nextMatch) {
                    const hostInner = nextMatch[0]
                    const after = rest.slice(hostInner.length)
                    return `:host(${hostInner})${after}`
                }
            }
            return trimmedMod
        }
        if (trimmedMod.startsWith('(') && trimmedMod.endsWith(')')) {
            return `:host${trimmedMod}`
        }
        if (trimmedMod.startsWith('[') || trimmedMod.startsWith(':') || trimmedMod.startsWith('.')) {
            return `:host(${trimmedMod})`
        }
        return `:host(${trimmedMod})`
    }

    // When trimmedHost is not plain ':host' (e.g. :host([variant="filled"]))
    let modToAppend = trimmedMod
    let modDescendant = ''

    if (isHostLeading(trimmedMod)) {
        const { hostPart, descendantPart } = extractHostAndDescendant(trimmedMod)
        modDescendant = descendantPart
        if (hostPart.startsWith(':host(') && hostPart.endsWith(')')) {
            modToAppend = hostPart.slice(6, -1)
        } else if (hostPart.startsWith(':host')) {
            modToAppend = hostPart.slice(5)
        } else {
            modToAppend = hostPart
        }
    } else if (trimmedMod.startsWith('(') && trimmedMod.endsWith(')')) {
        modToAppend = trimmedMod.slice(1, -1)
    }

    if (!modToAppend && !modDescendant) return trimmedHost

    let resultHost = trimmedHost

    if (modToAppend) {
        if (trimmedHost.startsWith(':host(')) {
            let depth = 0
            let closeIdx = -1

            for (let i = 5; i < trimmedHost.length; i++) {
                if (trimmedHost[i] === '(') depth++
                else if (trimmedHost[i] === ')') {
                    depth--
                    if (depth === 0) {
                        closeIdx = i
                        break
                    }
                }
            }

            if (closeIdx !== -1) {
                const inner = trimmedHost.slice(6, closeIdx)
                const after = trimmedHost.slice(closeIdx + 1)
                resultHost = `:host(${inner}${modToAppend})${after}`
            }
        } else if (trimmedHost.startsWith(':host:')) {
            resultHost = `:host(${modToAppend})${trimmedHost.slice(5)}`
        } else {
            resultHost = `${trimmedHost}${modToAppend}`
        }
    }

    if (modDescendant) {
        return `${resultHost} ${modDescendant}`.replace(/\s+/g, ' ')
    }

    return resultHost
}

export interface ComposeSelectorOptions {
    readonly anchor: string
    readonly targetSelector: string
    readonly hostCondition?: string
    readonly whenCondition?: string
    readonly states?: readonly string[]
    readonly tables?: TriggerTables
}

/**
 * Composes a full CSS selector across host triggers, anchor triggers, @when conditions,
 * and pseudo-element attachments.
 */
export function composeStateSelector(options: ComposeSelectorOptions): string {
    const {
        anchor,
        targetSelector,
        hostCondition,
        whenCondition,
        states = [],
        tables = emptyTables
    } = options

    // If hostCondition has commas (e.g. :host([variant="filled"]), :host([variant="tonal"]))
    if (hostCondition) {
        const hostParts = splitSelectorByComma(hostCondition)
        if (hostParts.length > 1) {
            return hostParts.map((hPart) => composeStateSelector({
                ...options,
                hostCondition: hPart
            })).join(', ')
        }
    }

    if (targetSelector) {
        const targetParts = splitSelectorByComma(targetSelector)
        if (targetParts.length > 1) {
            return targetParts.map((part) => composeStateSelector({
                ...options,
                targetSelector: part
            })).join(', ')
        }
    }

    // Check if target is a standalone pseudo-element like ::slotted(...)
    if (targetSelector && targetSelector.startsWith('::slotted')) {
        return targetSelector
    }

    const isHostAnchor = isHostLeading(anchor) || anchor.startsWith(':where(') || anchor.startsWith(':is(')
    const triggerContext: TriggerContext = {
        anchor,
        isHostAnchor,
        whenCondition
    }

    const hostModifiers: string[] = []
    const selfClassModifiers: string[] = []
    const selfPseudoModifiers: string[] = []

    for (const stateName of states) {
        if (!stateName || stateName === 'enabled' || stateName === 'base') continue
        const resolved = resolveState(stateName, triggerContext)(tables)
        if (resolved.target === 'host' || isHostAnchor) {
            if (resolved.modifier && !hostModifiers.includes(resolved.modifier)) {
                hostModifiers.push(resolved.modifier)
            }
        } else {
            if (resolved.modifier) {
                if (resolved.modifier.startsWith('.')) {
                    if (!selfClassModifiers.includes(resolved.modifier)) {
                        selfClassModifiers.push(resolved.modifier)
                    }
                } else {
                    if (!selfPseudoModifiers.includes(resolved.modifier)) {
                        selfPseudoModifiers.push(resolved.modifier)
                    }
                }
            }
        }
    }

    // Split anchor for pseudo-elements (e.g. .container::after -> base: .container, pseudo: ::after)
    let anchorBase = anchor
    let anchorPseudo = ''
    const pseudoIndex = anchor.indexOf('::')
    if (pseudoIndex !== -1) {
        anchorBase = anchor.slice(0, pseudoIndex)
        anchorPseudo = anchor.slice(pseudoIndex)
    }

    let anchorCompoundMod = ''
    let descendantSelector = ''

    if (targetSelector && targetSelector !== anchor && targetSelector.startsWith(anchorBase)) {
        const after = targetSelector.slice(anchorBase.length)
        if (after.startsWith(' ') || after.startsWith('>') || after.startsWith('+') || after.startsWith('~')) {
            descendantSelector = after
        } else if (after.startsWith('::')) {
            anchorPseudo = after
        } else if (after.startsWith('.') || after.startsWith('[') || after.startsWith(':')) {
            const combinatorMatch = after.match(/[\s>+~]|::/)
            if (combinatorMatch && combinatorMatch.index !== undefined) {
                anchorCompoundMod = after.slice(0, combinatorMatch.index)
                descendantSelector = after.slice(combinatorMatch.index)
            } else {
                anchorCompoundMod = after
            }
        }
    }

    // 1. Compose Host Selector
    let composedHost = ''
    if (isHostAnchor) {
        if (hostCondition) {
            composedHost = (anchor === ':host' || anchor === hostCondition)
                ? hostCondition
                : appendToHostSelector(hostCondition, anchor.startsWith(':host(') ? anchor.slice(6, -1) : anchor)
        } else {
            composedHost = anchor
        }
    } else if (hostCondition) {
        composedHost = isHostLeading(hostCondition) || hostCondition.startsWith(':where(') || hostCondition.startsWith(':is(')
            ? hostCondition
            : `:host(${hostCondition})`
    } else if (hostModifiers.length > 0) {
        composedHost = ':host'
    }

    if (anchorCompoundMod && isHostAnchor) {
        composedHost = appendToHostSelector(composedHost, anchorCompoundMod)
    }

    for (const mod of hostModifiers) {
        composedHost = appendToHostSelector(composedHost || ':host', mod)
    }

    // 2. Compose Anchor Selector (when anchor is not host)
    let composedAnchor = isHostAnchor ? '' : anchorBase
    if (!isHostAnchor) {
        if (anchorCompoundMod) {
            composedAnchor = `${composedAnchor}${anchorCompoundMod}`
        }

        for (const mod of selfClassModifiers) {
            composedAnchor = `${composedAnchor}${mod}`
        }

        if (whenCondition) {
            if (isHostLeading(whenCondition)) {
                composedHost = composedHost
                    ? appendToHostSelector(composedHost, whenCondition.replace(/^:host\(?/, '').replace(/\)$/, ''))
                    : whenCondition
            } else if (whenCondition.startsWith('.') || whenCondition.startsWith('[') || whenCondition.startsWith(':')) {
                composedAnchor = `${composedAnchor}${whenCondition}`
            } else {
                composedAnchor = `${composedAnchor}.${whenCondition}`
            }
        }

        for (const mod of selfPseudoModifiers) {
            composedAnchor = `${composedAnchor}${mod}`
        }

        if (anchorPseudo) {
            composedAnchor = `${composedAnchor}${anchorPseudo}`
        }
    }

    // 3. Assemble base selector
    let fullBase = ''
    if (isHostAnchor) {
        fullBase = composedHost || ':host'
    } else if (composedHost) {
        fullBase = composedAnchor ? `${composedHost} ${composedAnchor}` : composedHost
    } else {
        fullBase = composedAnchor
    }

    // 4. Combine with descendant selector
    if (descendantSelector) {
        return `${fullBase}${descendantSelector}`
    }

    if (!targetSelector || targetSelector === anchor || targetSelector === anchorBase || anchorCompoundMod) {
        return fullBase
    }

    if (isHostLeading(targetSelector)) {
        return targetSelector
    }

    return fullBase ? `${fullBase} ${targetSelector}` : targetSelector
}

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * Shared shell-hoisting primitives for `@when` and `@state`-nested `@when`.
 * Single implementation of the hoisted-shell computation previously
 * duplicated across both branches.
 */

import { appendToHostSelector } from '../compose-state-selector'
import { removeAmpersandForHostSubtree } from '../remove-ampersand'
import { formatRule } from '../internal/at-rules-transformer'

export function isHostRootSelector(selector: string): boolean {
    return selector === ':host'
        || selector.startsWith(':host')
        || selector.startsWith(':where(:host')
        || selector.startsWith(':is(:host')
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

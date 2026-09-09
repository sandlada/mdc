/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { stripComments } from './strip-comments'
import { splitCssValues } from './split-css-values'

/**
 * A single px literal (`8px`, `1.5px`) or bare `0` (valid CSS zero).
 */
export type PxLiteral = `${number}px` | '0'

/**
 * BUG-09 type gate: values starting with four px tokens plus more are
 * unrepresentable (`never`), so pure-literal 5-value calls fail at compile
 * time. Dynamic strings (`var()`/`calc()`/interpolations), other units and
 * keywords never match the 4-px prefix and pass through.
 */
export type RejectPxOverflow<V extends string> =
    V extends `${PxLiteral} ${PxLiteral} ${PxLiteral} ${PxLiteral} ${string}` ? never : V

/**
 * Dynamic escape hatch (BUG-09): values containing `var()` / `calc()` /
 * `${interpolation}` skip arity checks at runtime.
 */
const isDynamicValue = (val: string): boolean =>
    val.includes('var(') || val.includes('calc(') || val.includes('${')

/**
 * Runtime arity enforcement (BUG-09): pure-literal values with more than 4
 * whitespace-separated parts are invalid CSS and throw (mirrors the token
 * path `expandPadding` / `expandShape`); dynamic strings are exempt.
 */
const assertArity = (prop: string, cleanVal: string, parts: readonly string[]): void => {
    if (parts.length > 4 && !isDynamicValue(cleanVal)) {
        throw new Error(
            `Invalid ${prop} value "${cleanVal}": at most 4 whitespace-separated values are allowed.`
        )
    }
}

/**
 * Expands property macros (shape:, padding:, margin:, typescale:).
 */
export const expandDeclaration = <V extends string>(prop: string, val: RejectPxOverflow<V>): string => {
    const cleanVal = stripComments(val).trim().replace(/;$/, '').trim()
    const varMatch = cleanVal.match(/^var\(\s*(--[a-zA-Z0-9_-]+)\s*\)$/)

    if (prop === 'shape') {
        if (varMatch) {
            const prefix = varMatch[1]
            return `border-start-start-radius: var(${prefix}-start-start); border-start-end-radius: var(${prefix}-start-end); border-end-end-radius: var(${prefix}-end-end); border-end-start-radius: var(${prefix}-end-start);`
        }
        const parts = splitCssValues(cleanVal)
        assertArity(prop, cleanVal, parts)
        if (parts.length === 1) {
            return `border-start-start-radius: ${parts[0]}; border-start-end-radius: ${parts[0]}; border-end-end-radius: ${parts[0]}; border-end-start-radius: ${parts[0]};`
        }
        if (parts.length === 2) {
            return `border-start-start-radius: ${parts[0]}; border-start-end-radius: ${parts[1]}; border-end-end-radius: ${parts[0]}; border-end-start-radius: ${parts[1]};`
        }
        if (parts.length === 3) {
            return `border-start-start-radius: ${parts[0]}; border-start-end-radius: ${parts[1]}; border-end-end-radius: ${parts[2]}; border-end-start-radius: ${parts[1]};`
        }
        if (parts.length === 4) {
            return `border-start-start-radius: ${parts[0]}; border-start-end-radius: ${parts[1]}; border-end-end-radius: ${parts[2]}; border-end-start-radius: ${parts[3]};`
        }
    }

    if (prop === 'padding' || prop === 'margin') {
        if (varMatch) {
            const prefix = varMatch[1]
            return `${prop}-inline-start: var(${prefix}-inline-start); ${prop}-inline-end: var(${prefix}-inline-end); ${prop}-block-start: var(${prefix}-block-start); ${prop}-block-end: var(${prefix}-block-end);`
        }
        const parts = splitCssValues(cleanVal)
        assertArity(prop, cleanVal, parts)
        if (parts.length === 1) {
            return `${prop}: ${parts[0]};`
        }
        if (parts.length === 2) {
            return `${prop}-inline-start: ${parts[1]}; ${prop}-inline-end: ${parts[1]}; ${prop}-block-start: ${parts[0]}; ${prop}-block-end: ${parts[0]};`
        }
        if (parts.length === 3) {
            return `${prop}-inline-start: ${parts[1]}; ${prop}-inline-end: ${parts[1]}; ${prop}-block-start: ${parts[0]}; ${prop}-block-end: ${parts[2]};`
        }
        if (parts.length === 4) {
            return `${prop}-inline-start: ${parts[3]}; ${prop}-inline-end: ${parts[1]}; ${prop}-block-start: ${parts[0]}; ${prop}-block-end: ${parts[2]};`
        }
    }

    if (prop === 'typescale') {
        if (varMatch) {
            const prefix = varMatch[1]
            return `font-family: var(${prefix}-font); font-size: var(${prefix}-size); line-height: var(${prefix}-leading); font-weight: var(${prefix}-weight); letter-spacing: var(${prefix}-tracking);`
        }
    }

    return `${prop}: ${cleanVal};`
}

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { stripComments } from './strip-comments'
import { splitCssValues } from './split-css-values'

/**
 * Expands property macros (shape:, padding:, margin:, typescale:).
 */
export const expandDeclaration = (prop: string, val: string): string => {
    const cleanVal = stripComments(val).trim().replace(/;$/, '').trim()
    const varMatch = cleanVal.match(/^var\(\s*(--[a-zA-Z0-9_-]+)\s*\)$/)

    if (prop === 'shape') {
        if (varMatch) {
            const prefix = varMatch[1]
            return `border-start-start-radius: var(${prefix}-start-start); border-start-end-radius: var(${prefix}-start-end); border-end-end-radius: var(${prefix}-end-end); border-end-start-radius: var(${prefix}-end-start);`
        }
        const parts = splitCssValues(cleanVal)
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

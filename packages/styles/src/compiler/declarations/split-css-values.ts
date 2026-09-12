/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { parse, generate, type Value } from '../internal/csstree'

/**
 * Splits a CSS property value string into whitespace-separated tokens at depth 0
 * using CSSTree AST traversal.
 */
export const splitCssValues = (val: string): string[] => {
    try {
        const clean = val.trim().replace(/;$/, '').trim()
        if (!clean) return []
        const ast = parse(clean, { context: 'value' }) as Value
        const tokens: string[] = []
        for (const child of ast.children) {
            if (child.type === 'Comment' || child.type === 'WhiteSpace') continue
            tokens.push(generate(child))
        }
        return tokens
    } catch {
        return []
    }
}

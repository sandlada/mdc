/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { CSSResult, unsafeCSS } from 'lit'

/**
 * A record object used to convert a component definition into a CSS-usable one.
 *
 * ```
 * {
 *      // Before:
 *     `container-color`: `red`
 * }
 * {
 *     // After:
 *     [`--_container-color`]: unsafeCSS(`var(--md-filled-button-container-color, red)`)
 * }
 * ```
 */
export function createWrappedTokens<T extends Record<PropertyKey, any>>(
    prefix: string,
    tokens: T
): { [P in keyof T as `--_${string & P}`]: CSSResult } {
    return Object
        .entries(tokens)
        .reduce((p, [k, v]) => ({ ...p, [`--_${k}`]: unsafeCSS(`var(${prefix}-${k}, ${v})`) }), {}) as { [P in keyof T as `--_${string & P}`]: CSSResult }
}

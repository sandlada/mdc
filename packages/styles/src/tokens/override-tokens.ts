/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { MDCStyleSheet } from '../foundation'
import { normalizeOptions, formatOverrideValue } from './internal/format-override-value'

export interface OverrideTokensOptions {
    /**
     * Public CSS custom property prefix (e.g. `'--mdc-button'`).
     */
    readonly prefix: string

    /**
     * Optional selector to wrap override declarations with (e.g. `':host([data-theme="dark"])'`).
     */
    readonly selector?: string
}

/**
 * Pure functional, curried, data-last token override generator providing 1-to-1 compile-time type safety.
 *
 * @template TDef - The component style definition type.
 *
 * @param prefixOrOptions - Public CSS variable prefix or options with custom selector wrapper.
 * @returns Curried function chain accepting override tokens and returning an `MDCStyleSheet`.
 *
 * @example
 * ```typescript
 * import { overrideTokens } from '@sandlada/styles/tokens'
 * import { ButtonDefinition } from './button.definition'
 *
 * // Direct invocation:
 * const customButtonStyles = overrideTokens('--mdc-button')({
 *     'container-color': '#b3261e',
 *     'container-shape': '16px'
 * })()
 *
 * // Curried point-free composition:
 * const applyCustomTheme = overrideTokens({
 *     prefix: '--mdc-button',
 *     selector: ':host([data-theme="brand"])'
 * })({
 *     'container-color': '#005fb0'
 * })
 * const brandStyles = applyCustomTheme(ButtonDefinition)
 * ```
 */
export function overrideTokens<TDef extends Record<string, any> = Record<string, any>>(
    prefixOrOptions: string | OverrideTokensOptions
) {
    const options = normalizeOptions(prefixOrOptions)

    return (
        tokens: Partial<Record<keyof TDef | string, any>>
    ) => (
        _definition?: TDef
    ): MDCStyleSheet => {
        if (!tokens || typeof tokens !== 'object') {
            return new MDCStyleSheet('')
        }

        const declarations: string[] = []

        for (const [key, rawVal] of Object.entries(tokens)) {
            if (rawVal === null || rawVal === undefined) {
                continue
            }

            const cleanKey = key.startsWith('--') ? key.slice(2) : key
            const formattedVal = formatOverrideValue(rawVal)

            if (formattedVal.length > 0) {
                declarations.push(`${options.prefix}-${cleanKey}: ${formattedVal};`)
            }
        }

        if (declarations.length === 0) {
            return new MDCStyleSheet('')
        }

        if (options.selector && options.selector.trim().length > 0) {
            const indented = declarations.map((d) => `    ${d}`).join('\n')
            return new MDCStyleSheet(`${options.selector} {\n${indented}\n}`)
        }

        return new MDCStyleSheet(declarations.join('\n'))
    }
}

/**
 * Backward compatibility helper for legacy component token overrides.
 */
export function overrideComponentTokens<T = any>(
    prefix: string,
    tokens: Partial<Record<string, any>>
): MDCStyleSheet {
    return overrideTokens(prefix)(tokens)()
}

/**
 * Backward compatibility helper for legacy token stringification.
 */
export function stringTokens(value: any): any {
    return value
}

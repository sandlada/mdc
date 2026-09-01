/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { unsafeCSS, type CSSResult } from 'lit'

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

function normalizeOptions(prefixOrOptions: string | OverrideTokensOptions): {
    prefix: string
    selector?: string
} {
    if (typeof prefixOrOptions === 'string') {
        const raw = prefixOrOptions.trim()
        const normalized = raw.startsWith('--') ? raw : `--${raw}`
        return {
            prefix: normalized.replace(/-+$/, '')
        }
    }

    const { prefix = '', selector } = prefixOrOptions ?? {}
    const raw = prefix.trim()
    const normalized = raw.startsWith('--') ? raw : `--${raw}`
    return {
        prefix: normalized.replace(/-+$/, ''),
        selector
    }
}

function formatOverrideValue(val: unknown): string {
    if (val === null || val === undefined) {
        return ''
    }
    if (typeof val === 'object' && val !== null) {
        if (typeof (val as any).ToCSSVariable === 'function') {
            return (val as any).ToCSSVariable()
        }
        if ('cssText' in val && typeof (val as any).cssText === 'string') {
            return (val as any).cssText
        }
        if ('rawVal' in val) {
            return formatOverrideValue((val as any).rawVal)
        }
    }
    return String(val)
}

/**
 * Pure functional, curried, data-last token override generator providing 1-to-1 compile-time type safety.
 *
 * @template TDef - The component style definition type.
 *
 * @param prefixOrOptions - Public CSS variable prefix or options with custom selector wrapper.
 * @returns Curried function chain accepting override tokens and returning a Lit `CSSResult`.
 *
 * @example
 * ```typescript
 * import { overrideTokens } from '@sandlada/mdc/utils/styles/override-tokens'
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
    ): CSSResult => {
        if (!tokens || typeof tokens !== 'object') {
            return unsafeCSS('')
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
            return unsafeCSS('')
        }

        if (options.selector && options.selector.trim().length > 0) {
            const indented = declarations.map((d) => `    ${d}`).join('\n')
            return unsafeCSS(`${options.selector} {\n${indented}\n}`)
        }

        return unsafeCSS(declarations.join('\n'))
    }
}

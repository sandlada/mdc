/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Token override helpers for `utils/style`: emit public
 * (`--mdc-<prefix>-*`) override declarations, optionally wrapped in a
 * selector. Pure string building without schema / at-rule logic.
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

const normalizeOptions = (prefixOrOptions: string | OverrideTokensOptions): {
    prefix: string
    selector?: string
} => {
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

const formatOverrideValue = (val: unknown): string => {
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
 * Pure functional, curried token override generator.
 *
 * @example
 * ```typescript
 * import { overrideTokens } from '../../utils/style'
 *
 * const brandStyles = overrideTokens('--mdc-button')({
 *     'container-color': '#005fb0'
 * })()
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

/**
 * Compatibility helper for component token overrides.
 */
export function overrideComponentTokens<T = any>(
    prefix: string,
    tokens: Partial<Record<string, any>>
): CSSResult {
    return overrideTokens(prefix)(tokens)()
}

/**
 * Compatibility helper for token stringification passthrough.
 */
export function stringTokens(value: any): any {
    return value
}

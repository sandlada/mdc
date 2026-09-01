/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { FORWARDED_TOKEN_META } from './create-style-definition'
import type { StateTuple } from './state'

type CleanKey<K extends string> = K extends `--${infer Rest}` ? Rest : K

type StripStatePrefix<K extends string> =
    K extends `${string}:${infer Rest}`
        ? StripStatePrefix<Rest>
        : K extends `enabled-${infer Rest}`
            ? Rest
            : K extends `hovered-${infer Rest}`
                ? Rest
                : K extends `pressed-${infer Rest}`
                    ? Rest
                    : K extends `focused-${infer Rest}`
                        ? Rest
                        : K extends `disabled-${infer Rest}`
                            ? Rest
                            : K

type ExtractBaseKeys<T> = T extends Record<string, any>
    ? {
        [K in keyof T & string]: StripStatePrefix<CleanKey<K>>
    }[keyof T & string]
    : string

export type ForwardTokenKey<T> = (keyof T & string) | ExtractBaseKeys<T>

export interface ForwardTokensOptions<TTargetDef> {
    /**
     * The CSS variable prefix the child component listens to (e.g. `'--mdc-icon'`, `'--mdc-ripple'`).
     */
    targetPrefix: string

    /**
     * The name/namespace used in the parent definition (defaults to clean targetPrefix, e.g. `'icon'`).
     * For example, with `name: 'icon'`, token `color` becomes `icon-color` in the parent definition.
     */
    name?: string

    /**
     * Token values to forward. Keys are type-checked against `TTargetDef`.
     * Values can be single values, state records, or 5-state tuples `[enabled, hovered, pressed, focused, disabled]`.
     */
    tokens: Partial<{
        [K in ForwardTokenKey<TTargetDef> | (string & {})]:
            | any
            | StateTuple<any>
            | readonly (any | null | undefined)[]
            | Record<string, any>
    }>
}

export interface ForwardMetaEntry {
    targetPrefix: string
    cleanKey: string
    parentKey: string
    targetDefKeys: string[]
}

function cleanPrefix(p: string): string {
    return p.replace(/^--/, '').replace(/^(mdc|md)-/, '').replace(/-$/, '')
}

/**
 * Forwards and namespaces child component tokens within a parent component definition.
 *
 * @example
 * ```typescript
 * export const ButtonDefinition = createStyleDefinition({
 *     'container-color': ['#primary', '#hover', ...],
 *
 *     ...forwardTokens(IconDefinition, {
 *         targetPrefix: '--mdc-icon',
 *         name: 'icon',
 *         tokens: {
 *             'color': ['#on-primary', '#on-hover', '#on-press', '#on-focus', '#on-disabled'],
 *             'size': '18px',
 *         },
 *     }),
 * })
 * ```
 */
export function forwardTokens<TTargetDef extends Record<string, any>>(
    targetDef: TTargetDef,
    options: ForwardTokensOptions<TTargetDef>
): Record<string, any> {
    const { targetPrefix, name, tokens } = options
    const targetPrefixNormalized = targetPrefix.startsWith('--') ? targetPrefix : `--${targetPrefix}`
    const parentNamespace = name ? cleanPrefix(name) : cleanPrefix(targetPrefix)

    const result: Record<string, any> = {}
    const targetDefKeys = targetDef && typeof targetDef === 'object' ? Object.keys(targetDef) : []

    for (const [rawKey, val] of Object.entries(tokens ?? {})) {
        if (val === null || val === undefined) continue

        const cleanKey = rawKey.startsWith('--') ? rawKey.replace(/^--/, '') : rawKey
        const parentKey = `${parentNamespace}-${cleanKey}`

        const meta: ForwardMetaEntry = {
            targetPrefix: targetPrefixNormalized,
            cleanKey,
            parentKey,
            targetDefKeys,
        }

        // Attach metadata directly to the value so object spread never loses it
        if (Array.isArray(val)) {
            const wrappedArray = [...val]
            Object.defineProperty(wrappedArray, FORWARDED_TOKEN_META, {
                value: meta,
                enumerable: false,
                configurable: true,
            })
            result[parentKey] = wrappedArray
        } else if (typeof val === 'object' && val !== null) {
            Object.defineProperty(val, FORWARDED_TOKEN_META, {
                value: meta,
                enumerable: false,
                configurable: true,
            })
            result[parentKey] = val
        } else {
            const primitiveWrapper = {
                valueOf: () => val,
                toString: () => String(val),
                [FORWARDED_TOKEN_META]: meta,
                __isForwardedPrimitive: true,
                rawVal: val,
            }
            result[parentKey] = primitiveWrapper
        }
    }

    return result
}

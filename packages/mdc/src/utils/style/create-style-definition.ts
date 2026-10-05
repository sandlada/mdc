/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Plain token definition factory for `utils/style`.
 *
 * Single-parameter only: accepts a token record and returns a frozen
 * definition. No schema, no Cartesian expansion, no at-rule metadata —
 * that logic stays in `@sandlada/styles`.
 */

import type { CSSLike, ToCSSVariableLike } from './css-like'

export type PrimitiveTokenValue = string | number | null | undefined | CSSLike | ToCSSVariableLike

export type TokenRecordValue = Record<string, PrimitiveTokenValue | null | undefined>

export type TokenValue =
    | PrimitiveTokenValue
    | ReadonlyArray<PrimitiveTokenValue | null | undefined>
    | TokenRecordValue

export interface ResolvedStyleDefinition<
    TTokens extends Record<string, any> = Record<string, any>
> {
    readonly __brand: 'ResolvedStyleDefinition'
    readonly tokens: Readonly<TTokens>
    readonly flatTokenKeys: readonly string[]
    readonly [key: string]: any
}

const isPlainObject = (value: unknown): value is Record<string, any> => {
    if (typeof value !== 'object' || value === null) {
        return false
    }
    const proto = Object.getPrototypeOf(value)
    return proto === Object.prototype || proto === null
}

const isLeafCapableObject = (value: unknown): boolean => {
    if (typeof value !== 'object' || value === null) {
        return false
    }
    const record = value as Record<string, unknown>
    return typeof record['ToCSSVariable'] === 'function' || '_$cssResult$' in record || 'cssText' in record
}

/**
 * Creates a frozen component token definition from a plain token record.
 *
 * Top-level `null` / `undefined` entries are dropped; arrays are frozen
 * as-is; plain record values are cleaned of `null` / `undefined` entries
 * and frozen. Class instances and CSS results pass through by identity.
 *
 * @example
 * ```typescript
 * import { createStyleDefinition } from '../../utils/style'
 *
 * export const DividerDefinition = createStyleDefinition({
 *     'thickness': '1px',
 *     'color': Color.OutlineVariant,
 * })
 * ```
 */
export function createStyleDefinition<const TTokens extends Record<string, TokenValue>>(
    tokens: TTokens
): ResolvedStyleDefinition<TTokens> {
    const normalized: Record<string, any> = {}

    for (const [key, val] of Object.entries(tokens ?? {})) {
        if (val === null || val === undefined) {
            continue
        }

        if (Array.isArray(val)) {
            normalized[key] = Object.freeze([...val])
            continue
        }

        if (isPlainObject(val) && !isLeafCapableObject(val)) {
            const cleaned: Record<string, any> = {}
            for (const [sKey, sVal] of Object.entries(val)) {
                if (sVal !== null && sVal !== undefined) {
                    cleaned[sKey] = sVal
                }
            }
            normalized[key] = Object.freeze(cleaned)
            continue
        }

        normalized[key] = val
    }

    const flatTokenKeys = Object.freeze(Object.keys(normalized))

    const result: any = { ...normalized }

    Object.defineProperties(result, {
        __brand: {
            value: 'ResolvedStyleDefinition',
            enumerable: false,
            writable: false,
            configurable: false
        },
        tokens: {
            value: Object.freeze({ ...normalized }),
            enumerable: false,
            writable: false,
            configurable: false
        },
        flatTokenKeys: {
            value: flatTokenKeys,
            enumerable: false,
            writable: false,
            configurable: false
        }
    })

    return Object.freeze(result) as unknown as ResolvedStyleDefinition<TTokens>
}

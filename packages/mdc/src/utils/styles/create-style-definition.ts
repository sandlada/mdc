/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { CSSResult } from 'lit'
import type { StateSchema } from './define-schema'

export const FORWARDED_TOKEN_META = Symbol.for('mdc.styles.forwarded_token_meta')

export type PrimitiveTokenValue = string | number | null | undefined | CSSResult | { ToCSSVariable: () => string }

export type StateTuple<TStates extends readonly string[], TValue = PrimitiveTokenValue> = {
    readonly [K in keyof TStates]: TValue
}

export type StateRecord<TStates extends readonly string[], TValue = PrimitiveTokenValue> = {
    readonly [K in TStates[number]]?: TValue
}

export type TokenValue<TStates extends readonly string[], TValue = PrimitiveTokenValue> =
    | TValue
    | StateTuple<TStates, TValue>
    | StateRecord<TStates, TValue>

export interface ForwardedTokenMeta {
    readonly targetPrefix: string
    readonly cleanKey: string
    readonly parentKey: string
    readonly targetDefKeys?: readonly string[]
    readonly state?: string
    readonly targetExpandedKey?: string
}

export interface ResolvedStyleDefinition<
    TSchema extends StateSchema<any> = StateSchema<any>,
    TTokens extends Record<string, TokenValue<any, PrimitiveTokenValue>> = Record<string, TokenValue<any, PrimitiveTokenValue>>
> {
    readonly __brand: 'ResolvedStyleDefinition'
    readonly schema: TSchema
    readonly tokens: TTokens
    readonly flatTokenKeys: readonly string[]
    readonly forwardedBridges?: Record<string, ForwardedTokenMeta>
    readonly [key: string]: any
}

function isPlainObject(value: unknown): value is Record<string, any> {
    if (typeof value !== 'object' || value === null) {
        return false
    }
    const proto = Object.getPrototypeOf(value)
    return proto === Object.prototype || proto === null
}

/**
 * Factory creating a component token definition with strict compile-time dimensional validation against a StateSchema.
 *
 * @template TStates - The tuple of state names constraining token tuple lengths.
 *
 * @param schema - The StateSchema instance created via `defineSchema(...)`.
 * @returns A curried function accepting a record of token definitions and returning a `ResolvedStyleDefinition`.
 *
 * @throws {Error} If schema is invalid or not an instance of StateSchema.
 *
 * @example
 * ```typescript
 * import { defineSchema } from '@sandlada/mdc/utils/styles/define-schema'
 * import { createStyleDefinition } from '@sandlada/mdc/utils/styles/create-style-definition'
 *
 * const ButtonSchema = defineSchema(['enabled', 'selected'] as const)
 *
 * export const ButtonDefinition = createStyleDefinition(ButtonSchema)({
 *     'container-shape': '8px',
 *     'container-color': ['#6750a4', '#e8def8'],
 *     'label-color': ['#ffffff', '#1d192b']
 * })
 * ```
 */
export function createStyleDefinition<const TStates extends readonly string[]>(
    schema: StateSchema<TStates>
) {
    if (!schema || typeof schema !== 'object' || schema.__brand !== 'StateSchema') {
        throw new Error('[createStyleDefinition] A valid StateSchema created via defineSchema is required.')
    }

    return <const TTokens extends Record<string, TokenValue<TStates, PrimitiveTokenValue>>>(
        tokens: TTokens
    ): ResolvedStyleDefinition<StateSchema<TStates>, TTokens> => {
        const normalizedTokens: Record<string, any> = {}
        const forwardedBridges: Record<string, ForwardedTokenMeta> = {}

        for (const [key, val] of Object.entries(tokens ?? {})) {
            if (val === null || val === undefined) {
                continue
            }

            const meta: ForwardedTokenMeta | undefined = (val as any)?.[FORWARDED_TOKEN_META]

            if ((val as any)?.__isForwardedPrimitive) {
                const rawVal = (val as any).rawVal
                normalizedTokens[key] = rawVal
                if (meta) {
                    forwardedBridges[key] = meta
                }
                continue
            }

            if (Array.isArray(val)) {
                if (meta) {
                    forwardedBridges[key] = meta
                }
                normalizedTokens[key] = Object.freeze([...val])
                continue
            }

            if (
                isPlainObject(val) &&
                typeof (val as any).ToCSSVariable !== 'function' &&
                !('_$cssResult$' in (val as any)) &&
                !('cssText' in (val as any))
            ) {
                if (meta) {
                    forwardedBridges[key] = meta
                }
                const cleanedRecord: Record<string, any> = {}
                for (const [sKey, sVal] of Object.entries(val)) {
                    if (sVal !== null && sVal !== undefined) {
                        cleanedRecord[sKey] = sVal
                    }
                }
                normalizedTokens[key] = Object.freeze(cleanedRecord)
                continue
            }

            if (meta) {
                forwardedBridges[key] = meta
            }
            normalizedTokens[key] = val
        }

        const flatTokenKeys = Object.freeze(Object.keys(normalizedTokens))

        const result: ResolvedStyleDefinition<StateSchema<TStates>, TTokens> = {
            __brand: 'ResolvedStyleDefinition',
            schema,
            tokens: Object.freeze(normalizedTokens) as unknown as TTokens,
            flatTokenKeys,
            ...(Object.keys(forwardedBridges).length > 0
                ? { forwardedBridges: Object.freeze(forwardedBridges) }
                : {})
        }

        return Object.freeze(result)
    }
}

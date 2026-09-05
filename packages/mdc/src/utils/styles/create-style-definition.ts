/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { CSSResult } from 'lit'
import { defineSchema, type StateSchema } from './define-schema'

export const FORWARDED_TOKEN_META = Symbol.for('mdc.styles.forwarded_token_meta')

export const DEFAULT_STYLE_SCHEMA = defineSchema(['enabled', 'hovered', 'focused', 'pressed', 'disabled'] as const)
export type DefaultStyleSchema = typeof DEFAULT_STYLE_SCHEMA

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

function buildResolvedStyleDefinition<
    TSchema extends StateSchema<any>,
    TTokens extends Record<string, any>
>(
    schema: TSchema,
    tokens: TTokens
): ResolvedStyleDefinition<TSchema, TTokens> {
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

    const result: any = {}

    for (const [key, val] of Object.entries(normalizedTokens)) {
        result[key] = val

        if (Array.isArray(val) && schema?.states) {
            for (let i = 0; i < schema.states.length; i++) {
                const sVal = val[i]
                if (sVal !== null && sVal !== undefined) {
                    const stateName = schema.states[i]
                    result[`${stateName}-${key}`] = sVal
                }
            }
        } else if (
            isPlainObject(val) &&
            typeof (val as any).ToCSSVariable !== 'function' &&
            !('_$cssResult$' in (val as any)) &&
            !('cssText' in (val as any))
        ) {
            for (const [sKey, sVal] of Object.entries(val)) {
                if (sVal !== null && sVal !== undefined) {
                    result[`${sKey}-${key}`] = sVal
                }
            }
        }
    }

    Object.defineProperties(result, {
        __brand: {
            value: 'ResolvedStyleDefinition',
            enumerable: false,
            writable: false,
            configurable: false
        },
        schema: {
            value: schema,
            enumerable: false,
            writable: false,
            configurable: false
        },
        tokens: {
            value: Object.freeze(normalizedTokens),
            enumerable: false,
            writable: false,
            configurable: false
        },
        flatTokenKeys: {
            value: flatTokenKeys,
            enumerable: false,
            writable: false,
            configurable: false
        },
        ...(Object.keys(forwardedBridges).length > 0
            ? {
                forwardedBridges: {
                    value: Object.freeze(forwardedBridges),
                    enumerable: false,
                    writable: false,
                    configurable: false
                }
            }
            : {})
    })

    return Object.freeze(result) as unknown as ResolvedStyleDefinition<TSchema, TTokens>
}

/**
 * Factory creating a component token definition with strict compile-time dimensional validation against a StateSchema.
 * Supports direct token object definition (using a 5-state default schema) or curried invocation with a StateSchema.
 *
 * @example
 * ```typescript
 * import { defineSchema } from '@sandlada/mdc/utils/styles/define-schema'
 * import { createStyleDefinition } from '@sandlada/mdc/utils/styles/create-style-definition'
 *
 * // Curried with schema:
 * const ButtonSchema = defineSchema(['enabled', 'selected'] as const)
 * export const ButtonDefinition = createStyleDefinition(ButtonSchema)({
 *     'container-shape': '8px',
 *     'container-color': ['#6750a4', '#e8def8']
 * })
 *
 * // Direct with default schema:
 * export const DialogDefinition = createStyleDefinition({
 *     'container-color': '#fff'
 * })
 * ```
 */
export function createStyleDefinition<const TStates extends readonly string[]>(
    schema: StateSchema<TStates>
): <const TTokens extends Record<string, TokenValue<TStates, PrimitiveTokenValue>>>(
    tokens: TTokens
) => ResolvedStyleDefinition<StateSchema<TStates>, TTokens>

export function createStyleDefinition<const TTokens extends Record<string, TokenValue<readonly ['enabled', 'hovered', 'focused', 'pressed', 'disabled'], PrimitiveTokenValue>>>(
    tokens: TTokens
): ResolvedStyleDefinition<DefaultStyleSchema, TTokens>

export function createStyleDefinition(schemaOrTokens: any): any {
    if (schemaOrTokens && typeof schemaOrTokens === 'object' && schemaOrTokens.__brand === 'StateSchema') {
        return (tokens: any) => buildResolvedStyleDefinition(schemaOrTokens, tokens)
    }

    if (
        !schemaOrTokens ||
        (typeof schemaOrTokens === 'object' && Array.isArray(schemaOrTokens.states) && schemaOrTokens.__brand !== 'StateSchema')
    ) {
        throw new Error('[createStyleDefinition] A valid StateSchema created via defineSchema is required.')
    }

    return buildResolvedStyleDefinition(DEFAULT_STYLE_SCHEMA, schemaOrTokens)
}

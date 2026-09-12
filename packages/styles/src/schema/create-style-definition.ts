/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { CSSLike } from '../foundation'
import { defineSchema, type FlattenDimensions, type StateSchema } from './define-schema'
import { buildResolvedStyleDefinition } from './internal/build-resolved-style-definition'

export const FORWARDED_TOKEN_META = Symbol.for('mdc.styles.forwarded_token_meta')

export const DEFAULT_STYLE_SCHEMA = defineSchema(['enabled', 'hovered', 'focused', 'pressed', 'disabled'] as const)
export type DefaultStyleSchema = typeof DEFAULT_STYLE_SCHEMA

export type PrimitiveTokenValue = string | number | null | undefined | CSSLike | { ToCSSVariable: () => string }

export type StateTuple<TStates extends readonly string[], TValue = PrimitiveTokenValue> = {
    readonly [K in keyof TStates]: TValue
}

export type StateRecord<TStates extends readonly string[], TValue = PrimitiveTokenValue> = {
    readonly [K in TStates[number]]?: TValue
}

/**
 * Loose recursive n-dimensional positional array (rank validated at runtime
 * against the schema topology; see `./internal/ndarray`).
 */
export interface NDTokenArray<TValue = PrimitiveTokenValue> extends ReadonlyArray<TValue | null | undefined | NDTokenArray<TValue>> {}

export type TokenValue<TStates extends readonly string[], TValue = PrimitiveTokenValue> =
    | TValue
    | StateTuple<TStates, TValue>
    | StateRecord<TStates, TValue>
    | NDTokenArray<TValue>

/**
 * Filters singleton dimensions (exactly one state) out of a dimensions tuple.
 */
export type EffectiveDimensions<TDimensions extends readonly (readonly string[])[]> =
    TDimensions extends readonly [infer First extends readonly string[], ...infer Rest extends readonly (readonly string[])[]]
        ? First['length'] extends 1
            ? EffectiveDimensions<Rest>
            : readonly [First, ...EffectiveDimensions<Rest>]
        : readonly []

/**
 * Precise positional array mirroring an effective dimensions tuple:
 * nesting depth and per-level lengths are enforced positionally.
 */
export type NDArrayValue<
    TDimensions extends readonly (readonly string[])[],
    TValue = PrimitiveTokenValue
> =
    TDimensions extends readonly [infer First extends readonly string[], ...infer Rest extends readonly (readonly string[])[]]
        ? { readonly [K in keyof First]: NDArrayValue<Rest, TValue> }
        : TValue | null

/**
 * Loose joint n-dimensional array (rank 2+): nesting depth and per-level
 * lengths are validated at runtime with exact-shape errors, so computed
 * construction (`.map` over scale tables) stays ergonomic. Literals that
 * match the precise {@link NDArrayValue} shape additionally enjoy
 * compile-time length checking.
 */
export type NDJointArray<TValue = PrimitiveTokenValue> = readonly NDTokenArray<TValue>[]

/**
 * Author-facing token value union for a concrete StateSchema: rank 0 admits
 * only stateless primitives, rank 1 admits legacy 1D tuples/records plus 1D
 * positional arrays, rank 2+ admits flat separable records plus joint
 * n-dimensional arrays (flat tuples are rejected: order would be ambiguous).
 */
export type TokenValueForSchema<
    TSchema extends StateSchema<any, any>,
    TValue = PrimitiveTokenValue
> = TSchema extends StateSchema<any, infer TDimensions>
    ? TDimensions extends readonly (readonly string[])[]
        ? EffectiveDimensions<TDimensions> extends infer TEff extends readonly (readonly string[])[]
            ? TEff['length'] extends 0
                ? TValue
                : TEff['length'] extends 1
                    ? TValue | StateTuple<FlattenDimensions<TEff>, TValue> | StateRecord<FlattenDimensions<TEff>, TValue> | NDArrayValue<TEff, TValue> | NDTokenArray<TValue>
                    : TValue | StateRecord<FlattenDimensions<TEff>, TValue> | NDArrayValue<TEff, TValue> | NDJointArray<TValue>
            : never
        : never
    : never

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

/**
 * Factory creating a component token definition with strict compile-time dimensional validation against a StateSchema.
 * Supports direct token object definition (using a 5-state default schema) or curried invocation with a StateSchema.
 *
 * @example
 * ```typescript
 * import { defineSchema } from '@sandlada/styles/define-schema'
 * import { createStyleDefinition } from '@sandlada/styles/create-style-definition'
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
export function createStyleDefinition<
    const TStates extends readonly string[],
    const TDimensions extends readonly (readonly string[])[]
>(
    schema: StateSchema<TStates, TDimensions>
): <const TTokens extends Record<string, TokenValueForSchema<StateSchema<TStates, TDimensions>, PrimitiveTokenValue>>>(
    tokens: TTokens
) => ResolvedStyleDefinition<StateSchema<TStates, TDimensions>, TTokens>

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

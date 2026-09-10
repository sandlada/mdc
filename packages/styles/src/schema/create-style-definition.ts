/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { CSSLike } from '../foundation'
import { defineSchema, type StateSchema } from './define-schema'
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

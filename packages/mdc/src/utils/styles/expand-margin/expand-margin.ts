/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Pure functional token transformer expanding margin definitions into 4 CSS logical edge properties:
 * - `${prefix}-margin-block-start`
 * - `${prefix}-margin-block-end`
 * - `${prefix}-margin-inline-start`
 * - `${prefix}-margin-inline-end`
 */

import type { CSSResult } from 'lit'
import {
    isMarginObject,
    isPrimitiveValue,
    resolveSingleMargin
} from './internal/resolve-margin'

/**
 * Supported primitive margin value types.
 */
export type PrimitiveMarginValue = string | number | CSSResult | { ToCSSVariable: () => string }

/**
 * 2-axis tuple representing `[block, inline]` margin.
 */
export type MarginAxisTuple<TValue = PrimitiveMarginValue> = readonly [
    block: TValue,
    inline: TValue
]

/**
 * 4-edge tuple representing `[block-start, block-end, inline-start, inline-end]` margin.
 */
export type MarginEdgeTuple<TValue = PrimitiveMarginValue> = readonly [
    blockStart: TValue,
    blockEnd: TValue,
    inlineStart: TValue,
    inlineEnd: TValue
]

/**
 * Object representation of margin allowing axis shorthands and individual edge overrides.
 */
export interface MarginObject<TValue = PrimitiveMarginValue> {
    readonly all?: TValue
    readonly block?: TValue
    readonly inline?: TValue
    readonly blockStart?: TValue
    readonly blockEnd?: TValue
    readonly inlineStart?: TValue
    readonly inlineEnd?: TValue
    readonly 'block-start'?: TValue
    readonly 'block-end'?: TValue
    readonly 'inline-start'?: TValue
    readonly 'inline-end'?: TValue
}

/**
 * Single-state margin definition.
 */
export type SingleMarginValue<TValue = PrimitiveMarginValue> =
    | TValue
    | MarginAxisTuple<TValue>
    | MarginEdgeTuple<TValue>
    | MarginObject<TValue>

/**
 * Multi-state array of margin definitions.
 */
export type MultiStateMarginTuple<TValue = PrimitiveMarginValue> = readonly SingleMarginValue<TValue>[]

/**
 * Multi-state record of margin definitions keyed by state name.
 */
export type MultiStateMarginRecord<TValue = PrimitiveMarginValue> = {
    readonly [state: string]: SingleMarginValue<TValue> | undefined | null
}

/**
 * All valid input formats accepted by `expandMargin`.
 */
export type ExpandMarginInput<TValue = PrimitiveMarginValue> =
    | SingleMarginValue<TValue>
    | MultiStateMarginTuple<TValue>
    | MultiStateMarginRecord<TValue>

/**
 * Helper removing leading hyphens at type level.
 */
type StripLeadingHyphens<T extends string> =
    T extends `--${infer Rest}` ? StripLeadingHyphens<Rest> : T

/**
 * Helper removing trailing hyphens at type level.
 */
type StripTrailingHyphens<T extends string> =
    T extends `${infer Rest}-` ? StripTrailingHyphens<Rest> : T

/**
 * Helper cleaning prefix of leading and trailing hyphens.
 */
export type CleanMarginPrefix<T extends string> =
    StripTrailingHyphens<StripLeadingHyphens<T>>

/**
 * Type-level normalization of prefix to ensure uniform `-margin` base.
 */
export type NormalizeMarginPrefix<TPrefix extends string> =
    CleanMarginPrefix<TPrefix> extends `${infer Base}-margin`
        ? `${Base}-margin`
        : CleanMarginPrefix<TPrefix> extends 'margin'
            ? 'margin'
            : `${CleanMarginPrefix<TPrefix>}-margin`

/**
 * 4 logical margin edge suffixes.
 */
export type MarginEdgeSuffix = 'block-start' | 'block-end' | 'inline-start' | 'inline-end'

/**
 * 4 margin token keys generated from a given prefix.
 */
export type MarginTokenKey<TPrefix extends string> = `${NormalizeMarginPrefix<TPrefix>}-${MarginEdgeSuffix}`

/**
 * Type-level check if an object is an axis or edge margin shorthand object.
 */
export type IsMarginObject<T> =
    T extends { block?: any } | { inline?: any } | { all?: any } | { blockStart?: any } | { blockEnd?: any } | { inlineStart?: any } | { inlineEnd?: any } | { 'block-start'?: any } | { 'block-end'?: any } | { 'inline-start'?: any } | { 'inline-end'?: any }
        ? keyof T extends 'all' | 'block' | 'inline' | 'blockStart' | 'blockEnd' | 'inlineStart' | 'inlineEnd' | 'block-start' | 'block-end' | 'inline-start' | 'inline-end'
            ? true
            : false
        : false

/**
 * Inferred single margin value extractor.
 */
export type ExtractSingleMarginValue<T> =
    T extends readonly [infer B, infer I] ? B | I :
    T extends readonly [infer BS, infer BE, infer IS, infer IE] ? BS | BE | IS | IE :
    T extends readonly (infer E)[] ? E :
    T extends MarginObject<infer V> ? V :
    T

/**
 * Inferred multi-state or single margin value type.
 */
export type ExtractMarginEdgeValue<T> =
    T extends readonly (infer Item)[]
        ? Item extends readonly any[]
            ? { readonly [I in keyof T]: ExtractSingleMarginValue<T[I]> }
            : ExtractSingleMarginValue<Item> extends infer S
                ? readonly S[]
                : never
        : IsMarginObject<T> extends true
            ? ExtractSingleMarginValue<T>
            : T extends Record<string, any>
                ? { readonly [K in keyof T]: ExtractSingleMarginValue<T[K]> }
                : T

/**
 * Result shape of expandMargin with 4 logical edge keys and strongly inferred value types.
 */
export type ExpandedMarginResult<TPrefix extends string, TValue = PrimitiveMarginValue> = {
    readonly [K in MarginTokenKey<TPrefix>]: ExtractMarginEdgeValue<TValue>
}

/**
 * Pure functional, curried, data-last token transformer that expands margin definitions into 4 CSS logical properties.
 *
 * @template TPrefix - String literal type of the token prefix.
 *
 * @param prefix - Base token prefix (e.g. `'container'`, `'container-margin'`, `'margin'`).
 * @returns A curried function accepting a margin value and returning a record containing the 4 expanded logical margin token properties.
 *
 * @throws {Error} If prefix is empty or invalid.
 * @throws {Error} If margin value is null, undefined, or contains an invalid array length (not 2 or 4).
 *
 * @example
 * ```typescript
 * import { expandMargin } from '@sandlada/mdc/utils/styles/expand-margin'
 *
 * // 1. Single scalar:
 * expandMargin('container')('16px')
 * // => {
 * //   'container-margin-block-start': '16px',
 * //   'container-margin-block-end': '16px',
 * //   'container-margin-inline-start': '16px',
 * //   'container-margin-inline-end': '16px'
 * // }
 * ```
 */
export function expandMargin<const TPrefix extends string>(prefix: TPrefix) {
    if (typeof prefix !== 'string' || prefix.trim().length === 0) {
        throw new Error('[expandMargin] Prefix must be a non-empty string.')
    }

    const cleanPrefix = prefix.trim().replace(/^--/, '').replace(/-+$/, '')
    if (cleanPrefix.length === 0) {
        throw new Error('[expandMargin] Prefix must be a non-empty string.')
    }

    const basePrefix = cleanPrefix.endsWith('-margin')
        ? cleanPrefix
        : cleanPrefix === 'margin'
            ? 'margin'
            : `${cleanPrefix}-margin`

    const keyBlockStart = `${basePrefix}-block-start`
    const keyBlockEnd = `${basePrefix}-block-end`
    const keyInlineStart = `${basePrefix}-inline-start`
    const keyInlineEnd = `${basePrefix}-inline-end`

    return <const TValue extends ExpandMarginInput>(marginValue: TValue): ExpandedMarginResult<TPrefix, TValue> => {
        if (marginValue === null || marginValue === undefined) {
            throw new Error('[expandMargin] Margin value cannot be null or undefined.')
        }

        // Case A: Multi-state Array (Array of tuples / objects)
        if (
            Array.isArray(marginValue) &&
            marginValue.some(item => Array.isArray(item) || (typeof item === 'object' && item !== null && isMarginObject(item)))
        ) {
            const blockStartList: any[] = []
            const blockEndList: any[] = []
            const inlineStartList: any[] = []
            const inlineEndList: any[] = []

            for (const item of marginValue) {
                const quad = resolveSingleMargin(item)
                blockStartList.push(quad.blockStart)
                blockEndList.push(quad.blockEnd)
                inlineStartList.push(quad.inlineStart)
                inlineEndList.push(quad.inlineEnd)
            }

            const result: Record<string, any> = {}
            if (blockStartList.some(v => v !== undefined)) result[keyBlockStart] = Object.freeze(blockStartList)
            if (blockEndList.some(v => v !== undefined)) result[keyBlockEnd] = Object.freeze(blockEndList)
            if (inlineStartList.some(v => v !== undefined)) result[keyInlineStart] = Object.freeze(inlineStartList)
            if (inlineEndList.some(v => v !== undefined)) result[keyInlineEnd] = Object.freeze(inlineEndList)

            return Object.freeze(result) as unknown as ExpandedMarginResult<TPrefix, TValue>
        }

        // Case B: Multi-state Record (Object without margin keys)
        if (
            typeof marginValue === 'object' &&
            !Array.isArray(marginValue) &&
            !isPrimitiveValue(marginValue) &&
            !isMarginObject(marginValue)
        ) {
            const keys = Object.keys(marginValue)
            if (keys.length === 0) {
                throw new Error('[expandMargin] Margin object cannot be empty.')
            }

            const blockStartRecord: Record<string, any> = {}
            const blockEndRecord: Record<string, any> = {}
            const inlineStartRecord: Record<string, any> = {}
            const inlineEndRecord: Record<string, any> = {}

            for (const [stateKey, stateVal] of Object.entries(marginValue)) {
                if (stateVal === null || stateVal === undefined) {
                    continue
                }
                const quad = resolveSingleMargin(stateVal)
                if (quad.blockStart !== undefined) blockStartRecord[stateKey] = quad.blockStart
                if (quad.blockEnd !== undefined) blockEndRecord[stateKey] = quad.blockEnd
                if (quad.inlineStart !== undefined) inlineStartRecord[stateKey] = quad.inlineStart
                if (quad.inlineEnd !== undefined) inlineEndRecord[stateKey] = quad.inlineEnd
            }

            const result: Record<string, any> = {}
            if (Object.keys(blockStartRecord).length > 0) result[keyBlockStart] = Object.freeze(blockStartRecord)
            if (Object.keys(blockEndRecord).length > 0) result[keyBlockEnd] = Object.freeze(blockEndRecord)
            if (Object.keys(inlineStartRecord).length > 0) result[keyInlineStart] = Object.freeze(inlineStartRecord)
            if (Object.keys(inlineEndRecord).length > 0) result[keyInlineEnd] = Object.freeze(inlineEndRecord)

            return Object.freeze(result) as unknown as ExpandedMarginResult<TPrefix, TValue>
        }

        // Case C: Single Margin Value (Scalar, 2-axis tuple, 4-edge tuple, MarginObject)
        const quad = resolveSingleMargin(marginValue)
        const result: Record<string, any> = {}

        if (quad.blockStart !== undefined) result[keyBlockStart] = quad.blockStart
        if (quad.blockEnd !== undefined) result[keyBlockEnd] = quad.blockEnd
        if (quad.inlineStart !== undefined) result[keyInlineStart] = quad.inlineStart
        if (quad.inlineEnd !== undefined) result[keyInlineEnd] = quad.inlineEnd

        return Object.freeze(result) as unknown as ExpandedMarginResult<TPrefix, TValue>
    }
}

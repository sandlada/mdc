/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Pure functional token transformer expanding padding definitions into 4 CSS logical edge properties:
 * - `${prefix}-padding-block-start`
 * - `${prefix}-padding-block-end`
 * - `${prefix}-padding-inline-start`
 * - `${prefix}-padding-inline-end`
 */

import type { CSSResult } from 'lit'

/**
 * Supported primitive padding value types.
 */
export type PrimitivePaddingValue = string | number | CSSResult | { ToCSSVariable: () => string }

/**
 * 2-axis tuple representing `[block, inline]` padding.
 */
export type PaddingAxisTuple<TValue = PrimitivePaddingValue> = readonly [
    block: TValue,
    inline: TValue
]

/**
 * 4-edge tuple representing `[block-start, block-end, inline-start, inline-end]` padding.
 */
export type PaddingEdgeTuple<TValue = PrimitivePaddingValue> = readonly [
    blockStart: TValue,
    blockEnd: TValue,
    inlineStart: TValue,
    inlineEnd: TValue
]

/**
 * Object representation of padding allowing axis shorthands and individual edge overrides.
 */
export interface PaddingObject<TValue = PrimitivePaddingValue> {
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
 * Single-state padding definition.
 */
export type SinglePaddingValue<TValue = PrimitivePaddingValue> =
    | TValue
    | PaddingAxisTuple<TValue>
    | PaddingEdgeTuple<TValue>
    | PaddingObject<TValue>

/**
 * Multi-state array of padding definitions.
 */
export type MultiStatePaddingTuple<TValue = PrimitivePaddingValue> = readonly SinglePaddingValue<TValue>[]

/**
 * Multi-state record of padding definitions keyed by state name.
 */
export type MultiStatePaddingRecord<TValue = PrimitivePaddingValue> = {
    readonly [state: string]: SinglePaddingValue<TValue> | undefined | null
}

/**
 * All valid input formats accepted by `expandPadding`.
 */
export type ExpandPaddingInput<TValue = PrimitivePaddingValue> =
    | SinglePaddingValue<TValue>
    | MultiStatePaddingTuple<TValue>
    | MultiStatePaddingRecord<TValue>

/**
 * Helper removing leading hyphens at type level.
 */
export type StripLeadingHyphens<T extends string> =
    T extends `--${infer Rest}` ? StripLeadingHyphens<Rest> : T

/**
 * Helper removing trailing hyphens at type level.
 */
export type StripTrailingHyphens<T extends string> =
    T extends `${infer Rest}-` ? StripTrailingHyphens<Rest> : T

/**
 * Helper cleaning prefix of leading and trailing hyphens.
 */
export type CleanPaddingPrefix<T extends string> =
    StripTrailingHyphens<StripLeadingHyphens<T>>

/**
 * Type-level normalization of prefix to ensure uniform `-padding` base.
 */
export type NormalizePaddingPrefix<TPrefix extends string> =
    CleanPaddingPrefix<TPrefix> extends `${infer Base}-padding`
        ? `${Base}-padding`
        : CleanPaddingPrefix<TPrefix> extends 'padding'
            ? 'padding'
            : `${CleanPaddingPrefix<TPrefix>}-padding`

/**
 * 4 logical padding edge suffixes.
 */
export type PaddingEdgeSuffix = 'block-start' | 'block-end' | 'inline-start' | 'inline-end'

/**
 * 4 padding token keys generated from a given prefix.
 */
export type PaddingTokenKey<TPrefix extends string> = `${NormalizePaddingPrefix<TPrefix>}-${PaddingEdgeSuffix}`

/**
 * Type-level check if an object is an axis or edge padding shorthand object.
 */
export type IsPaddingObject<T> =
    T extends { block?: any } | { inline?: any } | { all?: any } | { blockStart?: any } | { blockEnd?: any } | { inlineStart?: any } | { inlineEnd?: any } | { 'block-start'?: any } | { 'block-end'?: any } | { 'inline-start'?: any } | { 'inline-end'?: any }
        ? keyof T extends 'all' | 'block' | 'inline' | 'blockStart' | 'blockEnd' | 'inlineStart' | 'inlineEnd' | 'block-start' | 'block-end' | 'inline-start' | 'inline-end'
            ? true
            : false
        : false

/**
 * Inferred single padding value extractor.
 */
export type ExtractSinglePaddingValue<T> =
    T extends readonly [infer B, infer I] ? B | I :
    T extends readonly [infer BS, infer BE, infer IS, infer IE] ? BS | BE | IS | IE :
    T extends readonly (infer E)[] ? E :
    T extends PaddingObject<infer V> ? V :
    T

/**
 * Inferred multi-state or single padding value type.
 */
export type ExtractPaddingEdgeValue<T> =
    T extends readonly (infer Item)[]
        ? Item extends readonly any[]
            ? { readonly [I in keyof T]: ExtractSinglePaddingValue<T[I]> }
            : ExtractSinglePaddingValue<Item> extends infer S
                ? readonly S[]
                : never
        : IsPaddingObject<T> extends true
            ? ExtractSinglePaddingValue<T>
            : T extends Record<string, any>
                ? { readonly [K in keyof T]: ExtractSinglePaddingValue<T[K]> }
                : T

/**
 * Result shape of expandPadding with 4 logical edge keys and strongly inferred value types.
 */
export type ExpandedPaddingResult<TPrefix extends string, TValue = PrimitivePaddingValue> = {
    readonly [K in PaddingTokenKey<TPrefix>]: ExtractPaddingEdgeValue<TValue>
}

const PADDING_OBJECT_KEYS = new Set([
    'all',
    'block',
    'inline',
    'blockStart',
    'blockEnd',
    'inlineStart',
    'inlineEnd',
    'block-start',
    'block-end',
    'inline-start',
    'inline-end'
])

interface ResolvedEdgeQuad {
    blockStart?: any
    blockEnd?: any
    inlineStart?: any
    inlineEnd?: any
}

function isPaddingObject(val: unknown): val is PaddingObject<any> {
    if (typeof val !== 'object' || val === null || Array.isArray(val)) {
        return false
    }
    const keys = Object.keys(val)
    return keys.some(k => PADDING_OBJECT_KEYS.has(k))
}

function isPrimitiveValue(val: unknown): boolean {
    if (typeof val === 'string' || typeof val === 'number') {
        return true
    }
    if (typeof val === 'object' && val !== null) {
        if (typeof (val as any)['ToCSSVariable'] === 'function') {
            return true
        }
        if ('_$cssResult$' in (val as object) || 'cssText' in (val as object)) {
            return true
        }
    }
    return false
}

function resolveSinglePadding(val: unknown): ResolvedEdgeQuad {
    if (val === null || val === undefined) {
        throw new Error('[expandPadding] Padding value cannot be null or undefined.')
    }

    // 1. Primitive scalar
    if (isPrimitiveValue(val)) {
        return {
            blockStart: val,
            blockEnd: val,
            inlineStart: val,
            inlineEnd: val
        }
    }

    // 2. Tuple
    if (Array.isArray(val)) {
        if (val.length === 2) {
            return {
                blockStart: val[0],
                blockEnd: val[0],
                inlineStart: val[1],
                inlineEnd: val[1]
            }
        }
        if (val.length === 4) {
            return {
                blockStart: val[0],
                blockEnd: val[1],
                inlineStart: val[2],
                inlineEnd: val[3]
            }
        }
        throw new Error(
            `[expandPadding] Array input must have length 2 (axis [block, inline]) or 4 (edges [block-start, block-end, inline-start, inline-end]), got length ${val.length}.`
        )
    }

    // 3. Padding Object
    if (typeof val === 'object') {
        const keys = Object.keys(val)
        if (keys.length === 0) {
            throw new Error('[expandPadding] Padding object cannot be empty.')
        }

        const obj = val as Record<string, any>
        const defaultBlock = obj['block'] ?? obj['all']
        const defaultInline = obj['inline'] ?? obj['all']

        const blockStart = obj['block-start'] ?? obj['blockStart'] ?? defaultBlock
        const blockEnd = obj['block-end'] ?? obj['blockEnd'] ?? defaultBlock
        const inlineStart = obj['inline-start'] ?? obj['inlineStart'] ?? defaultInline
        const inlineEnd = obj['inline-end'] ?? obj['inlineEnd'] ?? defaultInline

        const result: ResolvedEdgeQuad = {}
        if (blockStart !== undefined) result.blockStart = blockStart
        if (blockEnd !== undefined) result.blockEnd = blockEnd
        if (inlineStart !== undefined) result.inlineStart = inlineStart
        if (inlineEnd !== undefined) result.inlineEnd = inlineEnd

        return result
    }

    throw new Error('[expandPadding] Invalid padding value.')
}

/**
 * Pure functional, curried, data-last token transformer that expands padding definitions into 4 CSS logical properties.
 *
 * @template TPrefix - String literal type of the token prefix.
 *
 * @param prefix - Base token prefix (e.g. `'container'`, `'container-padding'`, `'padding'`, `'extra-small-container'`).
 * @returns A curried function accepting a padding value and returning a record containing the 4 expanded logical padding token properties.
 *
 * @throws {Error} If prefix is empty or invalid.
 * @throws {Error} If padding value is null, undefined, or contains an invalid array length (not 2 or 4).
 *
 * @example
 * ```typescript
 * import { expandPadding } from '@sandlada/mdc/utils/styles/expand-padding'
 *
 * // 1. Single scalar:
 * expandPadding('container')('16px')
 * // => {
 * //   'container-padding-block-start': '16px',
 * //   'container-padding-block-end': '16px',
 * //   'container-padding-inline-start': '16px',
 * //   'container-padding-inline-end': '16px'
 * // }
 *
 * // 2. 2-axis tuple [block, inline]:
 * expandPadding('container')(['8px', '16px'])
 * // => {
 * //   'container-padding-block-start': '8px',
 * //   'container-padding-block-end': '8px',
 * //   'container-padding-inline-start': '16px',
 * //   'container-padding-inline-end': '16px'
 * // }
 *
 * // 3. 4-edge tuple [block-start, block-end, inline-start, inline-end]:
 * expandPadding('container')(['4px', '8px', '12px', '16px'])
 *
 * // 4. Padding object with overrides:
 * expandPadding('container')({ block: '8px', inlineStart: '12px', inlineEnd: '16px' })
 *
 * // 5. Multi-state tuple:
 * expandPadding('container')([
 *     ['0px', '12px'],
 *     ['0px', '16px']
 * ])
 * // => {
 * //   'container-padding-block-start': ['0px', '0px'],
 * //   'container-padding-block-end': ['0px', '0px'],
 * //   'container-padding-inline-start': ['12px', '16px'],
 * //   'container-padding-inline-end': ['12px', '16px']
 * // }
 * ```
 */
export function expandPadding<const TPrefix extends string>(prefix: TPrefix) {
    if (typeof prefix !== 'string' || prefix.trim().length === 0) {
        throw new Error('[expandPadding] Prefix must be a non-empty string.')
    }

    const cleanPrefix = prefix.trim().replace(/^--/, '').replace(/-+$/, '')
    if (cleanPrefix.length === 0) {
        throw new Error('[expandPadding] Prefix must be a non-empty string.')
    }

    const basePrefix = cleanPrefix.endsWith('-padding')
        ? cleanPrefix
        : cleanPrefix === 'padding'
            ? 'padding'
            : `${cleanPrefix}-padding`

    const keyBlockStart = `${basePrefix}-block-start`
    const keyBlockEnd = `${basePrefix}-block-end`
    const keyInlineStart = `${basePrefix}-inline-start`
    const keyInlineEnd = `${basePrefix}-inline-end`

    return <const TValue extends ExpandPaddingInput>(paddingValue: TValue): ExpandedPaddingResult<TPrefix, TValue> => {
        if (paddingValue === null || paddingValue === undefined) {
            throw new Error('[expandPadding] Padding value cannot be null or undefined.')
        }

        // Case A: Multi-state Array (Array of tuples / objects)
        if (
            Array.isArray(paddingValue) &&
            paddingValue.some(item => Array.isArray(item) || (typeof item === 'object' && item !== null && isPaddingObject(item)))
        ) {
            const blockStartList: any[] = []
            const blockEndList: any[] = []
            const inlineStartList: any[] = []
            const inlineEndList: any[] = []

            for (const item of paddingValue) {
                const quad = resolveSinglePadding(item)
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

            return Object.freeze(result) as unknown as ExpandedPaddingResult<TPrefix, TValue>
        }

        // Case B: Multi-state Record (Object without padding keys)
        if (
            typeof paddingValue === 'object' &&
            !Array.isArray(paddingValue) &&
            !isPrimitiveValue(paddingValue) &&
            !isPaddingObject(paddingValue)
        ) {
            const keys = Object.keys(paddingValue)
            if (keys.length === 0) {
                throw new Error('[expandPadding] Padding object cannot be empty.')
            }

            const blockStartRecord: Record<string, any> = {}
            const blockEndRecord: Record<string, any> = {}
            const inlineStartRecord: Record<string, any> = {}
            const inlineEndRecord: Record<string, any> = {}

            for (const [stateKey, stateVal] of Object.entries(paddingValue)) {
                if (stateVal === null || stateVal === undefined) {
                    continue
                }
                const quad = resolveSinglePadding(stateVal)
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

            return Object.freeze(result) as unknown as ExpandedPaddingResult<TPrefix, TValue>
        }

        // Case C: Single Padding Value (Scalar, 2-axis tuple, 4-edge tuple, PaddingObject)
        const quad = resolveSinglePadding(paddingValue)
        const result: Record<string, any> = {}

        if (quad.blockStart !== undefined) result[keyBlockStart] = quad.blockStart
        if (quad.blockEnd !== undefined) result[keyBlockEnd] = quad.blockEnd
        if (quad.inlineStart !== undefined) result[keyInlineStart] = quad.inlineStart
        if (quad.inlineEnd !== undefined) result[keyInlineEnd] = quad.inlineEnd

        return Object.freeze(result) as unknown as ExpandedPaddingResult<TPrefix, TValue>
    }
}

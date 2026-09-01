/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Pure functional token transformer expanding Typescale definitions into 5 typographic token properties:
 * - `${prefix}-font`
 * - `${prefix}-leading`
 * - `${prefix}-size`
 * - `${prefix}-tracking`
 * - `${prefix}-weight`
 */

/**
 * Shape representing a standard `@sandlada/mdk` Typescale instance or compatible duck-typed object.
 */
export interface MDKTypescaleLike {
    readonly Font?: unknown
    readonly FontSize?: unknown
    readonly Tracking?: unknown
    readonly LineHeight?: unknown
    readonly FontWeight?: unknown
}

/**
 * Shape representing a custom typography object supporting camelCase, snake_case, or alternative property names.
 */
export interface TypographyObject {
    readonly font?: unknown
    readonly fontFamily?: unknown
    readonly typeface?: unknown
    readonly fontSize?: unknown
    readonly size?: unknown
    readonly font_size?: unknown
    readonly lineHeight?: unknown
    readonly leading?: unknown
    readonly line_height?: unknown
    readonly tracking?: unknown
    readonly letterSpacing?: unknown
    readonly letter_spacing?: unknown
    readonly fontWeight?: unknown
    readonly weight?: unknown
    readonly font_weight?: unknown
    readonly [key: string]: unknown
}

/**
 * Union of single typescale inputs.
 */
export type SingleTypescaleValue = MDKTypescaleLike | TypographyObject

/**
 * Multi-state tuple of typescale values.
 */
export type TypescaleTuple<TValue = SingleTypescaleValue> = readonly TValue[]

/**
 * Multi-state record mapping state names to typescale values or tuples.
 */
export type TypescaleRecord<TValue = SingleTypescaleValue> = {
    readonly [state: string]: TValue | readonly TValue[] | undefined | null
}

/**
 * All supported input formats for expandTypescale.
 */
export type TypescaleValueInput =
    | SingleTypescaleValue
    | TypescaleTuple
    | TypescaleRecord

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
export type CleanTypescalePrefix<T extends string> =
    StripTrailingHyphens<StripLeadingHyphens<T>>

/**
 * Type-level normalization of prefix to ensure uniform base without suffix duplicates.
 */
export type NormalizeTypescalePrefix<TPrefix extends string> =
    CleanTypescalePrefix<TPrefix> extends `${infer Base}-${'typescale' | 'typography' | 'font' | 'leading' | 'size' | 'tracking' | 'weight'}`
        ? Base
        : CleanTypescalePrefix<TPrefix>

/**
 * 5 standard typographic property suffixes.
 */
export type TypescalePropSuffix = 'font' | 'leading' | 'size' | 'tracking' | 'weight'

/**
 * 5 typographic token property keys generated from a given prefix.
 */
export type TypescaleTokenKey<TPrefix extends string, TSuffix extends TypescalePropSuffix = TypescalePropSuffix> =
    `${NormalizeTypescalePrefix<TPrefix>}-${TSuffix}`

export type ExtractFont<T> =
    T extends { Font: infer V } ? V :
    T extends { font: infer V } ? V :
    T extends { fontFamily: infer V } ? V :
    T extends { typeface: infer V } ? V :
    string

export type ExtractLeading<T> =
    T extends { LineHeight: infer V } ? V :
    T extends { lineHeight: infer V } ? V :
    T extends { leading: infer V } ? V :
    T extends { line_height: infer V } ? V :
    string | number

export type ExtractSize<T> =
    T extends { FontSize: infer V } ? V :
    T extends { fontSize: infer V } ? V :
    T extends { size: infer V } ? V :
    T extends { font_size: infer V } ? V :
    string | number

export type ExtractTracking<T> =
    T extends { Tracking: infer V } ? V :
    T extends { tracking: infer V } ? V :
    T extends { letterSpacing: infer V } ? V :
    T extends { letter_spacing: infer V } ? V :
    string | number

export type ExtractWeight<T> =
    T extends { FontWeight: infer V } ? V :
    T extends { fontWeight: infer V } ? V :
    T extends { weight: infer V } ? V :
    T extends { font_weight: infer V } ? V :
    string | number

/**
 * Strongly typed record structure returned by expandTypescale.
 */
export type ExpandedTypescaleResult<TPrefix extends string, TValue> =
    TValue extends readonly (infer Item)[]
        ? {
            readonly [K in `${NormalizeTypescalePrefix<TPrefix>}-font`]: { readonly [I in keyof TValue]: ExtractFont<TValue[I]> }
        } & {
            readonly [K in `${NormalizeTypescalePrefix<TPrefix>}-leading`]: { readonly [I in keyof TValue]: ExtractLeading<TValue[I]> }
        } & {
            readonly [K in `${NormalizeTypescalePrefix<TPrefix>}-size`]: { readonly [I in keyof TValue]: ExtractSize<TValue[I]> }
        } & {
            readonly [K in `${NormalizeTypescalePrefix<TPrefix>}-tracking`]: { readonly [I in keyof TValue]: ExtractTracking<TValue[I]> }
        } & {
            readonly [K in `${NormalizeTypescalePrefix<TPrefix>}-weight`]: { readonly [I in keyof TValue]: ExtractWeight<TValue[I]> }
        }
        : TValue extends MDKTypescaleLike | TypographyObject
            ? {
                readonly [K in `${NormalizeTypescalePrefix<TPrefix>}-font`]: ExtractFont<TValue>
            } & {
                readonly [K in `${NormalizeTypescalePrefix<TPrefix>}-leading`]: ExtractLeading<TValue>
            } & {
                readonly [K in `${NormalizeTypescalePrefix<TPrefix>}-size`]: ExtractSize<TValue>
            } & {
                readonly [K in `${NormalizeTypescalePrefix<TPrefix>}-tracking`]: ExtractTracking<TValue>
            } & {
                readonly [K in `${NormalizeTypescalePrefix<TPrefix>}-weight`]: ExtractWeight<TValue>
            }
            : TValue extends Record<string, any>
                ? {
                    readonly [K in `${NormalizeTypescalePrefix<TPrefix>}-font`]: { readonly [S in keyof TValue]: ExtractFont<TValue[S]> }
                } & {
                    readonly [K in `${NormalizeTypescalePrefix<TPrefix>}-leading`]: { readonly [S in keyof TValue]: ExtractLeading<TValue[S]> }
                } & {
                    readonly [K in `${NormalizeTypescalePrefix<TPrefix>}-size`]: { readonly [S in keyof TValue]: ExtractSize<TValue[S]> }
                } & {
                    readonly [K in `${NormalizeTypescalePrefix<TPrefix>}-tracking`]: { readonly [S in keyof TValue]: ExtractTracking<TValue[S]> }
                } & {
                    readonly [K in `${NormalizeTypescalePrefix<TPrefix>}-weight`]: { readonly [S in keyof TValue]: ExtractWeight<TValue[S]> }
                }
                : {
                    readonly [K in TypescaleTokenKey<TPrefix>]: unknown
                }

/**
 * Record structure returned by expandTypescale (generic default).
 */
export type ExpandedTypescaleTokens<TPrefix extends string = string, TValue = any> = {
    readonly [K in TypescaleTokenKey<TPrefix>]: TValue
}

/**
 * Extracted typography properties normalized from any supported typography source.
 */
export interface ExtractedTypography {
    readonly font?: unknown
    readonly leading?: unknown
    readonly size?: unknown
    readonly tracking?: unknown
    readonly weight?: unknown
}

/**
 * Normalizes and extracts 5 typographic properties from a source object.
 */
function extractTypography(source: unknown): ExtractedTypography {
    if (source === null || typeof source !== 'object') {
        return {}
    }
    const src = source as Record<string, any>
    return {
        font: src['Font'] ?? src['font'] ?? src['fontFamily'] ?? src['typeface'],
        leading: src['LineHeight'] ?? src['lineHeight'] ?? src['leading'] ?? src['line_height'],
        size: src['FontSize'] ?? src['fontSize'] ?? src['size'] ?? src['font_size'],
        tracking: src['Tracking'] ?? src['tracking'] ?? src['letterSpacing'] ?? src['letter_spacing'],
        weight: src['FontWeight'] ?? src['fontWeight'] ?? src['weight'] ?? src['font_weight']
    }
}

/**
 * Normalizes the user-provided prefix by trimming whitespace and stripping redundant suffixes or hyphens.
 */
function normalizePrefix(prefix: unknown): string {
    if (typeof prefix !== 'string') {
        throw new TypeError('[expandTypescale] Prefix must be a non-empty string.')
    }
    const trimmed = prefix.trim()
    if (trimmed === '') {
        throw new TypeError('[expandTypescale] Prefix must be a non-empty string.')
    }
    const normalized = trimmed
        .replace(/^--/, '')
        .replace(/-(?:typescale|typography|font|leading|size|tracking|weight)$/i, '')
        .replace(/-+$/, '')

    if (normalized === '') {
        throw new TypeError('[expandTypescale] Prefix cannot be empty after normalization.')
    }
    return normalized
}

/**
 * Validates that typescaleValue is a non-null object.
 */
function validateTypescaleInput(value: unknown): void {
    if (value === null || value === undefined) {
        throw new TypeError('[expandTypescale] Typescale value cannot be null or undefined.')
    }
    if (typeof value !== 'object') {
        throw new TypeError('[expandTypescale] Invalid typescale value: expected a Typescale instance, typography object, tuple, or state record.')
    }
}

/**
 * Pure functional curried transformer that expands an MDK Typescale instance, typography object,
 * multi-state tuple, or multi-state record into 5 standard typographic token properties:
 * - `${prefix}-font`: Typeface / font family
 * - `${prefix}-leading`: Line height / leading
 * - `${prefix}-size`: Font size
 * - `${prefix}-tracking`: Letter spacing / tracking
 * - `${prefix}-weight`: Font weight
 *
 * @param prefix - The token key prefix (e.g. `'label'`, `'headline'`, `'extra-small-label'`).
 * @returns A data-last function accepting a Typescale instance, object, tuple, or state record with full type inference.
 *
 * @throws {TypeError} If prefix is invalid or empty.
 * @throws {TypeError} If typescaleValue is null, undefined, or not an object.
 * @throws {Error} If tuple is empty or object has no properties.
 *
 * @example Single MDK Typescale instance
 * ```typescript
 * import { Typescale } from '@sandlada/mdk'
 * import { expandTypescale } from '@sandlada/mdc/utils/styles/expand-typescale'
 *
 * const tokens = expandTypescale('label')(Typescale.LabelLarge)
 * // Inferred Type:
 * // {
 * //     readonly 'label-font': string
 * //     readonly 'label-leading': string
 * //     readonly 'label-size': string
 * //     readonly 'label-tracking': string
 * //     readonly 'label-weight': number
 * // }
 * ```
 *
 * @example Multi-state Tuple
 * ```typescript
 * import { Typescale } from '@sandlada/mdk'
 * import { expandTypescale } from '@sandlada/mdc/utils/styles/expand-typescale'
 *
 * const tokens = expandTypescale('label')([
 *     Typescale.LabelSmall,
 *     Typescale.LabelMedium
 * ])
 * ```
 *
 * @example Multi-state Record
 * ```typescript
 * import { Typescale } from '@sandlada/mdk'
 * import { expandTypescale } from '@sandlada/mdc/utils/styles/expand-typescale'
 *
 * const tokens = expandTypescale('headline')({
 *     enabled: Typescale.TitleMedium,
 *     selected: Typescale.TitleLarge
 * })
 * ```
 */
export const expandTypescale = <const TPrefix extends string>(prefix: TPrefix) => <const TValue extends TypescaleValueInput>(
    typescaleValue: TValue
): ExpandedTypescaleResult<TPrefix, TValue> => {
    const cleanPrefix = normalizePrefix(prefix)
    validateTypescaleInput(typescaleValue)

    if (Array.isArray(typescaleValue)) {
        if (typescaleValue.length === 0) {
            throw new Error('[expandTypescale] Tuple of typescale values cannot be empty.')
        }
        const extractedList = typescaleValue.map(item => extractTypography(item))
        return {
            [`${cleanPrefix}-font`]: extractedList.map(e => e.font),
            [`${cleanPrefix}-leading`]: extractedList.map(e => e.leading),
            [`${cleanPrefix}-size`]: extractedList.map(e => e.size),
            [`${cleanPrefix}-tracking`]: extractedList.map(e => e.tracking),
            [`${cleanPrefix}-weight`]: extractedList.map(e => e.weight)
        } as unknown as ExpandedTypescaleResult<TPrefix, TValue>
    }

    const extracted = extractTypography(typescaleValue)
    const hasTypographyProp =
        extracted.font !== undefined ||
        extracted.leading !== undefined ||
        extracted.size !== undefined ||
        extracted.tracking !== undefined ||
        extracted.weight !== undefined

    if (hasTypographyProp) {
        return {
            [`${cleanPrefix}-font`]: extracted.font,
            [`${cleanPrefix}-leading`]: extracted.leading,
            [`${cleanPrefix}-size`]: extracted.size,
            [`${cleanPrefix}-tracking`]: extracted.tracking,
            [`${cleanPrefix}-weight`]: extracted.weight
        } as unknown as ExpandedTypescaleResult<TPrefix, TValue>
    }

    const entries = Object.entries(typescaleValue as Record<string, any>)
    if (entries.length === 0) {
        throw new Error('[expandTypescale] Typescale value object cannot be empty.')
    }

    const fontRecord: Record<string, any> = {}
    const leadingRecord: Record<string, any> = {}
    const sizeRecord: Record<string, any> = {}
    const trackingRecord: Record<string, any> = {}
    const weightRecord: Record<string, any> = {}

    for (const [stateKey, stateVal] of entries) {
        if (Array.isArray(stateVal)) {
            const list = stateVal.map(item => extractTypography(item))
            fontRecord[stateKey] = list.map(e => e.font)
            leadingRecord[stateKey] = list.map(e => e.leading)
            sizeRecord[stateKey] = list.map(e => e.size)
            trackingRecord[stateKey] = list.map(e => e.tracking)
            weightRecord[stateKey] = list.map(e => e.weight)
        } else {
            const itemExtracted = extractTypography(stateVal)
            fontRecord[stateKey] = itemExtracted.font
            leadingRecord[stateKey] = itemExtracted.leading
            sizeRecord[stateKey] = itemExtracted.size
            trackingRecord[stateKey] = itemExtracted.tracking
            weightRecord[stateKey] = itemExtracted.weight
        }
    }

    return {
        [`${cleanPrefix}-font`]: fontRecord,
        [`${cleanPrefix}-leading`]: leadingRecord,
        [`${cleanPrefix}-size`]: sizeRecord,
        [`${cleanPrefix}-tracking`]: trackingRecord,
        [`${cleanPrefix}-weight`]: weightRecord
    } as unknown as ExpandedTypescaleResult<TPrefix, TValue>
}

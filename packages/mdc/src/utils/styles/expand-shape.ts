/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { CSSResult } from 'lit'

/**
 * Interface representing a CSS variable provider (e.g. MDK Shape enum).
 */
export interface CSSVariableProvider {
    ToCSSVariable: () => string
    [key: string]: any
}

/**
 * Supported scalar shape token values.
 */
export type ShapeScalarValue = string | number | CSSResult | CSSVariableProvider

/**
 * 4 logical corners object supporting both camelCase and kebab-case keys.
 */
export interface ShapeCornersObject<T = ShapeScalarValue | readonly ShapeScalarValue[] | Record<string, ShapeScalarValue | undefined | null>> {
    readonly startStart?: T
    readonly startEnd?: T
    readonly endStart?: T
    readonly endEnd?: T
    readonly 'start-start'?: T
    readonly 'start-end'?: T
    readonly 'end-start'?: T
    readonly 'end-end'?: T
}

/**
 * Multi-state shape tuple (e.g. `['8px', '12px']` or `[Shape.Small, Shape.Large]`).
 */
export type ShapeStateTuple<T = ShapeScalarValue> = readonly T[]

/**
 * Multi-state shape record mapping state names to shape values (e.g. `{ enabled: '8px', hovered: '12px' }`).
 */
export type ShapeStateRecord<T = ShapeScalarValue> = {
    readonly [state: string]: T | undefined | null
}

/**
 * Union of all valid input types for expandShape.
 */
export type ShapeValueInput =
    | ShapeScalarValue
    | ShapeCornersObject
    | ShapeStateTuple
    | ShapeStateRecord

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
export type CleanShapePrefix<T extends string> =
    StripTrailingHyphens<StripLeadingHyphens<T>>

/**
 * Type-level normalization of prefix to ensure uniform `-shape` base.
 */
export type NormalizeShapePrefix<TPrefix extends string> =
    CleanShapePrefix<TPrefix> extends `${infer Base}-shape`
        ? `${Base}-shape`
        : CleanShapePrefix<TPrefix> extends 'shape'
            ? 'shape'
            : `${CleanShapePrefix<TPrefix>}-shape`

/**
 * 4 standard logical corner suffixes.
 */
export type ShapeCornerSuffix = 'start-start' | 'start-end' | 'end-start' | 'end-end'

/**
 * 4 shape corner token keys generated from a given prefix.
 */
export type ShapeTokenKey<TPrefix extends string> = `${NormalizeShapePrefix<TPrefix>}-${ShapeCornerSuffix}`

/**
 * Inferred value type for expanded shape tokens.
 */
export type ExpandShapeValueType<TValue> =
    TValue extends ShapeCornersObject<infer V>
        ? V
        : TValue

/**
 * Strongly typed output structure of expandShape.
 */
export type ExpandedShapeResult<TPrefix extends string, TValue> = {
    readonly [K in ShapeTokenKey<TPrefix>]: ExpandShapeValueType<TValue>
}

const CORNER_KEYS = ['start-start', 'start-end', 'end-start', 'end-end'] as const

const CORNER_PROP_MAP: Record<
    typeof CORNER_KEYS[number],
    readonly ['startStart' | 'startEnd' | 'endStart' | 'endEnd', typeof CORNER_KEYS[number]]
> = {
    'start-start': ['startStart', 'start-start'],
    'start-end'  : ['startEnd', 'start-end'],
    'end-start'  : ['endStart', 'end-start'],
    'end-end'    : ['endEnd', 'end-end']
}

function isPlainObject(value: unknown): value is Record<string, any> {
    if (typeof value !== 'object' || value === null) {
        return false
    }
    const proto = Object.getPrototypeOf(value)
    return proto === Object.prototype || proto === null
}

function isCSSVariableProvider(value: unknown): value is CSSVariableProvider {
    return typeof value === 'object' && value !== null && typeof (value as any)['ToCSSVariable'] === 'function'
}

function isCSSResult(value: unknown): value is CSSResult {
    return typeof value === 'object' && value !== null && ('_$cssResult$' in (value as object) || 'cssText' in (value as object))
}

function normalizePrefix(prefix: unknown): string {
    if (typeof prefix !== 'string') {
        throw new Error('[expandShape] Prefix must be a non-empty string.')
    }
    const trimmed = prefix.trim()
    if (trimmed.length === 0) {
        throw new Error('[expandShape] Prefix must be a non-empty string.')
    }
    const clean = trimmed.replace(/^--/, '').replace(/-+$/, '')
    if (clean.length === 0) {
        throw new Error('[expandShape] Prefix must be a non-empty string.')
    }
    if (clean === 'shape' || clean.endsWith('-shape')) {
        return clean
    }
    return `${clean}-shape`
}

/**
 * Pure functional, curried token transformer expanding shape values into 4 logical corners.
 *
 * Expands tokens to `${prefix}-shape-start-start`, `${prefix}-shape-start-end`, `${prefix}-shape-end-start`, and `${prefix}-shape-end-end`.
 * Automatically normalizes prefix to avoid redundant `-shape-shape-*` suffixes.
 *
 * @param prefix - The base token prefix (e.g. `'container'`, `'container-shape'`, `'extra-small-container'`).
 * @returns A curried function accepting scalar values, corner objects, multi-state tuples, or multi-state records with strict return type inference.
 *
 * @throws {Error} If prefix is empty, non-string, or only hyphens/whitespace.
 * @throws {Error} If shapeValue is invalid, empty, NaN, or contains no defined corners/states.
 *
 * @example
 * ```typescript
 * import { Shape } from '@sandlada/mdk'
 * import { expandShape } from '@sandlada/mdc/utils/styles/expand-shape'
 * import { createStyleDefinition } from '@sandlada/mdc/utils/styles/create-style-definition'
 * import { defineSchema } from '@sandlada/mdc/utils/styles/define-schema'
 *
 * const ButtonSchema = defineSchema(['enabled', 'pressed'] as const)
 *
 * export const ButtonDefinition = createStyleDefinition(ButtonSchema)({
 *     // 1. Single scalar (Shape enum or string)
 *     ...expandShape('container')(Shape.Full),
 *
 *     // 2. Corner object (asymmetric corners)
 *     ...expandShape('card')({
 *         startStart: '16px',
 *         startEnd: '16px',
 *         endStart: '0px',
 *         endEnd: '0px'
 *     }),
 *
 *     // 3. Multi-state tuple (transposed across 4 corners)
 *     ...expandShape('fab')([Shape.Small, Shape.Large]),
 *
 *     // 4. Multi-state record (transposed across 4 corners)
 *     ...expandShape('chip')({
 *         enabled: '8px',
 *         pressed: '12px'
 *     })
 * })
 * ```
 */
export function expandShape<const TPrefix extends string>(prefix: TPrefix) {
    const baseKey = normalizePrefix(prefix)

    return <const TValue extends ShapeValueInput>(shapeValue: TValue): ExpandedShapeResult<TPrefix, TValue> => {
        if (shapeValue === null || shapeValue === undefined) {
            throw new Error('[expandShape] Invalid shape value provided.')
        }

        // 1. Multi-state Tuple (Array)
        if (Array.isArray(shapeValue)) {
            if (shapeValue.length === 0) {
                throw new Error('[expandShape] Invalid shape value provided.')
            }
            const tuple = Object.freeze([...shapeValue])
            return Object.freeze({
                [`${baseKey}-start-start`]: tuple,
                [`${baseKey}-start-end`]  : tuple,
                [`${baseKey}-end-start`]  : tuple,
                [`${baseKey}-end-end`]    : tuple
            }) as unknown as ExpandedShapeResult<TPrefix, TValue>
        }

        // 2. CSSVariableProvider (e.g. Shape.Full) or Lit CSSResult
        if (isCSSVariableProvider(shapeValue) || isCSSResult(shapeValue)) {
            return Object.freeze({
                [`${baseKey}-start-start`]: shapeValue,
                [`${baseKey}-start-end`]  : shapeValue,
                [`${baseKey}-end-start`]  : shapeValue,
                [`${baseKey}-end-end`]    : shapeValue
            }) as unknown as ExpandedShapeResult<TPrefix, TValue>
        }

        // 3. String Scalar
        if (typeof shapeValue === 'string') {
            const trimmed = shapeValue.trim()
            if (trimmed.length === 0) {
                throw new Error('[expandShape] Invalid shape value provided.')
            }
            return Object.freeze({
                [`${baseKey}-start-start`]: shapeValue,
                [`${baseKey}-start-end`]  : shapeValue,
                [`${baseKey}-end-start`]  : shapeValue,
                [`${baseKey}-end-end`]    : shapeValue
            }) as unknown as ExpandedShapeResult<TPrefix, TValue>
        }

        // 4. Number Scalar
        if (typeof shapeValue === 'number') {
            if (Number.isNaN(shapeValue)) {
                throw new Error('[expandShape] Invalid shape value provided.')
            }
            return Object.freeze({
                [`${baseKey}-start-start`]: shapeValue,
                [`${baseKey}-start-end`]  : shapeValue,
                [`${baseKey}-end-start`]  : shapeValue,
                [`${baseKey}-end-end`]    : shapeValue
            }) as unknown as ExpandedShapeResult<TPrefix, TValue>
        }

        // 5. Plain Object: Corner Object OR Multi-State Record
        if (isPlainObject(shapeValue)) {
            const keys = Object.keys(shapeValue)
            if (keys.length === 0) {
                throw new Error('[expandShape] Invalid shape value provided.')
            }

            const isCornerObj = keys.some(k =>
                k === 'startStart' || k === 'startEnd' || k === 'endStart' || k === 'endEnd' ||
                k === 'start-start' || k === 'start-end' || k === 'end-start' || k === 'end-end'
            )

            if (isCornerObj) {
                const result: Record<string, any> = {}
                let definedCornerCount = 0

                for (const corner of CORNER_KEYS) {
                    const [camelKey, kebabKey] = CORNER_PROP_MAP[corner]
                    const val = (shapeValue as any)[kebabKey] !== undefined
                        ? (shapeValue as any)[kebabKey]
                        : (shapeValue as any)[camelKey]

                    if (val !== undefined && val !== null) {
                        if (typeof val === 'string' && val.trim().length === 0) {
                            continue
                        }
                        result[`${baseKey}-${corner}`] = Array.isArray(val)
                            ? Object.freeze([...val])
                            : isPlainObject(val) && !isCSSVariableProvider(val) && !isCSSResult(val)
                                ? Object.freeze({ ...val })
                                : val
                        definedCornerCount++
                    }
                }

                if (definedCornerCount === 0) {
                    throw new Error('[expandShape] Invalid shape value provided.')
                }

                return Object.freeze(result) as unknown as ExpandedShapeResult<TPrefix, TValue>
            }

            // Multi-State Record
            const cleanedRecord: Record<string, any> = {}
            let stateCount = 0
            for (const [stateKey, stateVal] of Object.entries(shapeValue)) {
                if (stateVal !== null && stateVal !== undefined) {
                    if (typeof stateVal === 'string' && stateVal.trim().length === 0) {
                        continue
                    }
                    cleanedRecord[stateKey] = stateVal
                    stateCount++
                }
            }

            if (stateCount === 0) {
                throw new Error('[expandShape] Invalid shape value provided.')
            }

            const frozenRecord = Object.freeze(cleanedRecord)
            return Object.freeze({
                [`${baseKey}-start-start`]: frozenRecord,
                [`${baseKey}-start-end`]  : frozenRecord,
                [`${baseKey}-end-start`]  : frozenRecord,
                [`${baseKey}-end-end`]    : frozenRecord
            }) as unknown as ExpandedShapeResult<TPrefix, TValue>
        }

        throw new Error('[expandShape] Invalid shape value provided.')
    }
}

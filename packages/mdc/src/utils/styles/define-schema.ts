/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/**
 * A single orthogonal dimension containing mutually exclusive state names.
 */
export type StateDimension = readonly string[]

/**
 * 1D array of state names.
 */
export type SchemaInput1D = readonly string[]

/**
 * 2D array of orthogonal state dimensions.
 */
export type SchemaInput2D = readonly (readonly string[])[]

/**
 * Valid input formats for defineSchema.
 */
export type SchemaInput = SchemaInput1D | SchemaInput2D

/**
 * Type-level recursive flattening of a 2D tuple of dimensions into a 1D tuple of states.
 */
export type FlattenDimensions<T extends readonly (readonly string[])[]> =
    T extends readonly [infer First extends readonly string[], ...infer Rest extends readonly (readonly string[])[]]
        ? readonly [...First, ...FlattenDimensions<Rest>]
        : readonly []

/**
 * Determines whether an input tuple is 2D (array of arrays).
 */
export type Is2DInput<T extends SchemaInput> =
    T extends readonly [infer First, ...any[]]
        ? First extends readonly string[]
            ? true
            : false
        : T extends readonly (readonly string[])[]
            ? true
            : false

/**
 * Infers the dimensions tuple type from a SchemaInput.
 */
export type InferDimensions<T extends SchemaInput> =
    Is2DInput<T> extends true
        ? T extends readonly (readonly string[])[]
            ? T
            : readonly (readonly string[])[]
        : T extends readonly string[]
            ? readonly [T]
            : readonly (readonly string[])[]

/**
 * Infers the flat states tuple type from a SchemaInput.
 */
export type InferStates<T extends SchemaInput> =
    Is2DInput<T> extends true
        ? T extends readonly (readonly string[])[]
            ? FlattenDimensions<T>
            : readonly string[]
        : T extends readonly string[]
            ? T
            : readonly string[]

/**
 * Immutable, branded descriptor representing a component's state topology.
 *
 * @template TStates - Readonly tuple or array of unique state names across all dimensions.
 * @template TDimensions - Readonly tuple or array of orthogonal state dimensions.
 */
export interface StateSchema<
    TStates extends readonly string[] = readonly string[],
    TDimensions extends readonly (readonly string[])[] = readonly (readonly string[])[]
> {
    readonly __brand: 'StateSchema'
    readonly states: TStates
    readonly dimensions: TDimensions
    readonly validCombinations: readonly (readonly string[])[]
    readonly count: number
    readonly isValidCombination: (states: readonly string[]) => boolean
}

/**
 * Computes the Cartesian product across all dimensions.
 */
const computeCartesianProduct = (
    dimensions: readonly (readonly string[])[]
): readonly (readonly string[])[] => {
    if (dimensions.length === 0) {
        return Object.freeze([])
    }

    let combinations: string[][] = [[]]

    for (const dim of dimensions) {
        const next: string[][] = []
        for (const prev of combinations) {
            for (const state of dim) {
                next.push([...prev, state])
            }
        }
        combinations = next
    }

    return Object.freeze(combinations.map(combo => Object.freeze(combo)))
}

/**
 * Declares an immutable, strongly typed state schema descriptor for a component definition.
 * Supports both 1D state arrays and 2D orthogonal dimension arrays.
 *
 * @template TInput - The 1D or 2D state schema definition input tuple.
 *
 * @param input - A 1D array of state names (e.g. `['enabled', 'selected'] as const`) or a 2D array of orthogonal dimensions (e.g. `[['selected', 'unselected'], ['small', 'medium', 'large']] as const`).
 * @returns An immutable `StateSchema` descriptor carrying compile-time dimension metadata, flat states, valid combinations topology, and combination validator.
 *
 * @throws {Error} If input is empty, null/undefined, contains empty dimensions, non-string/empty strings, or duplicate state names.
 *
 * @example
 * ```typescript
 * import { defineSchema } from '@sandlada/mdc/utils/styles/define-schema'
 *
 * // 1. 1D Interaction Schema (Single Dimension)
 * export const ButtonSchema = defineSchema(['enabled', 'hovered', 'pressed', 'focused', 'disabled'] as const)
 *
 * // 2. 2D Multi-Dimension Orthogonal Schema
 * export const ChipSchema = defineSchema([
 *     ['selected', 'unselected'],          // Dimension 0: Selection state (mutually exclusive)
 *     ['small', 'medium', 'large'],        // Dimension 1: Size variant (mutually exclusive)
 *     ['morph']                            // Dimension 2: Visual feature
 * ] as const)
 *
 * // Querying Valid Combinations:
 * ChipSchema.isValidCombination(['selected', 'small', 'morph']) // true (1 from each dimension)
 * ChipSchema.isValidCombination(['selected', 'unselected'])     // false (conflict in Dimension 0)
 * ChipSchema.isValidCombination(['small', 'large'])            // false (conflict in Dimension 1)
 * ChipSchema.isValidCombination(['selected'])                  // true (valid partial subset)
 * ```
 */
export function defineSchema<const TInput extends SchemaInput>(
    input: TInput
): StateSchema<InferStates<TInput>, InferDimensions<TInput>> {
    if (!input || !Array.isArray(input) || input.length === 0) {
        throw new Error('[defineSchema] States array must contain at least 1 state name.')
    }

    const is2D = Array.isArray(input[0])

    const dimensions: string[][] = []
    const flatStates: string[] = []
    const seenStates = new Set<string>()
    const stateToDimensionIndex = new Map<string, number>()

    if (is2D) {
        for (let d = 0; d < input.length; d++) {
            const dim = input[d]
            if (!Array.isArray(dim)) {
                throw new Error('[defineSchema] State names must be non-empty strings.')
            }
            if (dim.length === 0) {
                throw new Error('[defineSchema] Dimension must contain at least 1 state name.')
            }

            const currentDim: string[] = []
            for (let s = 0; s < dim.length; s++) {
                const state = dim[s]
                if (typeof state !== 'string' || state.trim().length === 0) {
                    throw new Error('[defineSchema] State names must be non-empty strings.')
                }
                if (seenStates.has(state)) {
                    throw new Error('[defineSchema] Duplicate state names detected in schema definition.')
                }
                seenStates.add(state)
                stateToDimensionIndex.set(state, d)
                currentDim.push(state)
                flatStates.push(state)
            }
            dimensions.push(currentDim)
        }
    } else {
        const currentDim: string[] = []
        for (let s = 0; s < input.length; s++) {
            const state = input[s]
            if (Array.isArray(state)) {
                throw new Error('[defineSchema] State names must be non-empty strings.')
            }
            if (typeof state !== 'string' || state.trim().length === 0) {
                throw new Error('[defineSchema] State names must be non-empty strings.')
            }
            if (seenStates.has(state)) {
                throw new Error('[defineSchema] Duplicate state names detected in schema definition.')
            }
            seenStates.add(state)
            stateToDimensionIndex.set(state, 0)
            currentDim.push(state)
            flatStates.push(state)
        }
        dimensions.push(currentDim)
    }

    const frozenDimensions = Object.freeze(
        dimensions.map(dim => Object.freeze([...dim]))
    ) as unknown as InferDimensions<TInput>

    const frozenStates = Object.freeze([...flatStates]) as unknown as InferStates<TInput>

    const validCombinations = computeCartesianProduct(dimensions)

    const isValidCombination = (queryStates: readonly string[]): boolean => {
        if (!Array.isArray(queryStates)) {
            return false
        }
        const seenDimensions = new Set<number>()
        for (let i = 0; i < queryStates.length; i++) {
            const state = queryStates[i]
            const dimIndex = stateToDimensionIndex.get(state)
            if (dimIndex === undefined) {
                return false
            }
            if (seenDimensions.has(dimIndex)) {
                return false
            }
            seenDimensions.add(dimIndex)
        }
        return true
    }

    return Object.freeze({
        __brand: 'StateSchema',
        states: frozenStates,
        dimensions: frozenDimensions,
        validCombinations,
        count: validCombinations.length,
        isValidCombination
    })
}

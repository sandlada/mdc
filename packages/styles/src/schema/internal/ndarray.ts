/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * N-dimensional positional token values for multi-state schemas.
 *
 * A token value is either stateless (primitive), separable (1D tuple or flat
 * state record varying along a single dimension and composed by `@state`
 * Cartesian expansion), or joint (n-dimensional nested array varying jointly
 * across every non-singleton dimension).
 *
 * Shape contract (positional, dimension order, singleton dimensions omitted):
 * - rank 0 (every dimension holds a single state): only primitives allowed.
 * - rank 1 (`An`, `A1*Bn`, `An*B1`, or higher-D with a single non-singleton
 *   dimension): a 1D array whose length equals the sole non-singleton
 *   dimension size. `null` entries mark absent values.
 * - rank k > 1 (`An*Bn`, higher-D): a k-level nested array whose shape mirrors
 *   the non-singleton dimension sizes, e.g. `[5][3][2]`. `cell[i][j][l]`
 *   addresses the combination of those dimension states. `null` leaves mark
 *   absent values and emit nothing (same sparse semantics as 1D tuples).
 *
 * Canonical combo variable segments join non-singleton states in schema
 * dimension order (`display-small-regular`), so ordering is always controlled
 * by the schema and never by author hand-ordering.
 */

import type { StateSchema } from '../define-schema'
import { isPlainObject } from './is-plain-object'

export interface EffectiveTopology {
    readonly dims: readonly (readonly string[])[]
    readonly rank: number
    readonly sizes: readonly number[]
    readonly shape: string
}

const buildShape = (sizes: readonly number[]): string =>
    sizes.length === 0 ? '(scalar)' : sizes.map(n => `[${n}]`).join('')

/**
 * Derives the non-singleton dimension topology from a StateSchema.
 * Singleton dimensions carry no information and are omitted from both the
 * n-dimensional array shape and canonical combo names.
 */
export const getEffectiveTopology = (
    schema: StateSchema<any, any> | undefined | null
): EffectiveTopology => {
    const raw: readonly (readonly string[])[] = schema?.dimensions ?? []
    const dims = raw.filter(dim => dim.length > 1)
    const sizes = dims.map(dim => dim.length)
    return Object.freeze({
        dims: Object.freeze(dims.map(dim => Object.freeze([...dim]))),
        rank: dims.length,
        sizes: Object.freeze([...sizes]),
        shape: buildShape(sizes)
    })
}

/**
 * Returns the states of the sole non-singleton dimension when rank is 1.
 * Returns null for any other rank.
 */
export const getRank1States = (
    topology: EffectiveTopology
): readonly string[] | null =>
    topology.rank === 1 ? topology.dims[0]! : null

/**
 * Joins states into a canonical combo name in schema dimension order.
 * Every state must belong to a distinct effective dimension.
 *
 * @throws {Error} On unknown states or two states from the same dimension.
 */
export const canonicalComboName = (
    topology: EffectiveTopology,
    states: readonly string[]
): string => {
    const dimOf = new Map<string, number>()
    topology.dims.forEach((dim, dimIndex) => {
        for (const state of dim) {
            dimOf.set(state, dimIndex)
        }
    })
    const seen = new Set<number>()
    const ordered: string[] = new Array<string>(states.length)
    for (const state of states) {
        const dimIndex = dimOf.get(state)
        if (dimIndex === undefined) {
            throw new Error(`[ndarray] Unknown state '${state}' for schema dimensions.`)
        }
        if (seen.has(dimIndex)) {
            throw new Error(`[ndarray] States share dimension ${dimIndex}: combination must hold at most one state per dimension.`)
        }
        seen.add(dimIndex)
        ordered[dimIndex] = state
    }
    return ordered.filter(s => s !== undefined).join('-')
}

export interface NDCell {
    readonly canonical: string
    readonly states: readonly string[]
    readonly value: unknown
}

const isForwardedPrimitive = (val: unknown): boolean =>
    typeof val === 'object' && val !== null && (val as Record<string, unknown>)['__isForwardedPrimitive'] === true

const isLeafCapableObject = (val: unknown): boolean => {
    if (typeof val !== 'object' || val === null) {
        return false
    }
    if (isForwardedPrimitive(val)) {
        return true
    }
    const record = val as Record<string, unknown>
    return typeof record['ToCSSVariable'] === 'function' || '_$cssResult$' in record || 'cssText' in record
}

/**
 * Validates an n-dimensional joint token value against the topology and
 * flattens non-null leaves to canonical combo cells.
 *
 * @throws {Error} On depth/length shape mismatches, ragged levels, or nested
 * plain objects (state records stay top-level only; array leaves must be
 * primitives).
 */
export const flattenNDValue = (
    topology: EffectiveTopology,
    key: string,
    value: readonly unknown[]
): readonly NDCell[] => {
    if (topology.rank <= 1) {
        throw new Error(`[createStyleDefinition] Token '${key}' uses a nested array but schema rank is ${topology.rank}: nested arrays require at least 2 non-singleton dimensions, expected a flat value or 1D tuple instead.`)
    }
    if (value.length !== topology.sizes[0]) {
        throw new Error(`[createStyleDefinition] Token '${key}' expects shape ${topology.shape}, but dimension 0 holds ${value.length} entries (expected ${topology.sizes[0]}).`)
    }
    const cells: NDCell[] = []
    const walk = (node: unknown, depth: number, path: readonly string[]): void => {
        if (node === null || node === undefined) {
            return
        }
        if (Array.isArray(node)) {
            if (depth >= topology.rank) {
                throw new Error(`[createStyleDefinition] Token '${key}' exceeds rank ${topology.rank}: unexpected nested array at [${path.join(', ')}], expected shape ${topology.shape}.`)
            }
            const expected = topology.sizes[depth]!
            if (node.length !== expected) {
                throw new Error(`[createStyleDefinition] Token '${key}' expects shape ${topology.shape}, but dimension ${depth} at [${path.join(', ')}] holds ${node.length} entries (expected ${expected}).`)
            }
            for (let i = 0; i < node.length; i++) {
                walk(node[i], depth + 1, [...path, topology.dims[depth]![i]!])
            }
            return
        }
        if (depth !== topology.rank) {
            throw new Error(`[createStyleDefinition] Token '${key}' expects shape ${topology.shape}, but [${path.join(', ')}] holds a leaf above the final level: wrap it in nested arrays.`)
        }
        if (isPlainObject(node) && !isLeafCapableObject(node)) {
            throw new Error(`[createStyleDefinition] Token '${key}' holds a plain object at [${path.join(', ')}]: state records are only allowed at top level; n-dimensional array leaves must be primitives.`)
        }
        cells.push({ canonical: path.join('-'), states: path, value: node })
    }
    walk(value, 0, [])
    return cells
}

/**
 * Structural deep copy of an n-dimensional array preserving leaf identity
 * (class instances, CSSResults) while freezing every array level.
 */
export const deepFreezeNDCopy = (value: readonly unknown[]): readonly unknown[] => {
    const copy = (node: unknown): unknown => {
        if (Array.isArray(node)) {
            return Object.freeze(node.map(copy))
        }
        return node
    }
    return copy(value) as readonly unknown[]
}

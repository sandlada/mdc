/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/**
 * Computes the Cartesian product across all dimensions.
 */
export const computeCartesianProduct = (
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

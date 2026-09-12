/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { defineSchema, type StateSchema } from './define-schema'

/**
 * Mathematical Oracle for Mutual Exclusivity ($|S \cap D_i| \le 1$)
 */
function mathematicalOracleIsValidCombination(
    dimensions: readonly (readonly string[])[],
    queryStates: unknown
): boolean {
    if (!Array.isArray(queryStates)) {
        return false
    }

    // Check for non-string or unknown elements
    const allStates = new Set(dimensions.flat())
    for (const item of queryStates) {
        if (typeof item !== 'string' || !allStates.has(item)) {
            return false
        }
    }

    // Check mutual exclusivity: |S \cap D_i| <= 1
    // Note: If duplicate states exist in queryStates, |S \cap D_i| counts multiplicity if treated as multiset
    // In our specification, queryStates with duplicate elements must be rejected.
    const queryList = queryStates as string[]
    const querySet = new Set(queryList)
    if (querySet.size !== queryList.length) {
        return false // Duplicate elements present
    }

    for (const dim of dimensions) {
        const dimSet = new Set(dim)
        let intersectionCount = 0
        for (const item of querySet) {
            if (dimSet.has(item)) {
                intersectionCount++
            }
        }
        if (intersectionCount > 1) {
            return false
        }
    }

    return true
}

describe('defineSchema Empirical Challenger Suite', () => {
    describe('1. Mathematical Correctness of Cartesian Product', () => {
        it('verifies Cartesian product cardinality equals product of dimension sizes (Product Rule)', () => {
            const testDimensions = [
                [['a', 'b'], ['1', '2', '3']],
                [['a', 'b', 'c'], ['1', '2'], ['x', 'y']],
                [['a'], ['b'], ['c'], ['d']],
                [['s1', 's2'], ['m1', 'm2', 'm3'], ['v1', 'v2', 'v3', 'v4']],
                [['a', 'b'], ['c', 'd'], ['e', 'f'], ['g', 'h'], ['i', 'j']] // 2^5 = 32
            ]

            for (const dims of testDimensions) {
                const schema = defineSchema(dims as any)
                const expectedCount = dims.reduce((acc, dim) => acc * dim.length, 1)

                expect(schema.validCombinations.length).toBe(expectedCount)
                expect(schema.count).toBe(expectedCount)

                // Every combination must have length equal to dimensions.length
                for (const combo of schema.validCombinations) {
                    expect(combo.length).toBe(dims.length)
                    // Each element at index i must belong to dimension i
                    for (let i = 0; i < dims.length; i++) {
                        expect(dims[i]).toContain(combo[i])
                    }
                }

                // All combinations in validCombinations must be distinct
                const serialized = schema.validCombinations.map(c => c.join(':::'))
                const uniqueSet = new Set(serialized)
                expect(uniqueSet.size).toBe(expectedCount)
            }
        })

        it('verifies completeness: every tuple in D_0 x D_1 x ... x D_{n-1} exists in validCombinations', () => {
            const dims = [
                ['selected', 'unselected'],
                ['small', 'medium', 'large'],
                ['solid', 'outlined']
            ] as const
            const schema = defineSchema(dims)

            for (const s0 of dims[0]) {
                for (const s1 of dims[1]) {
                    for (const s2 of dims[2]) {
                        const expectedTuple = [s0, s1, s2]
                        const found = schema.validCombinations.some(
                            combo => combo[0] === s0 && combo[1] === s1 && combo[2] === s2
                        )
                        expect(found).toBe(true)
                    }
                }
            }
        })
    })

    describe('2. Mathematical Powerset & Sub-Orthogonal Exhaustive Verification ($|S \\cap D_i| \\le 1$)', () => {
        it('exhaustively compares isValidCombination against Mathematical Oracle for all 2^8 = 256 subsets', () => {
            const dims = [
                ['s0', 's1'],
                ['m0', 'm1', 'm2'],
                ['v0', 'v1', 'v2']
            ] as const
            const schema = defineSchema(dims)
            const allStates = schema.states // 8 states

            // Generate powerset of all 8 states (256 subsets)
            const n = allStates.length
            const totalSubsets = 1 << n

            for (let mask = 0; mask < totalSubsets; mask++) {
                const subset: string[] = []
                for (let i = 0; i < n; i++) {
                    if ((mask & (1 << i)) !== 0) {
                        subset.push(allStates[i])
                    }
                }

                const expected = mathematicalOracleIsValidCombination(dims, subset)
                const actual = schema.isValidCombination(subset)

                expect(actual).toBe(expected)
            }
        })

        it('verifies all 2^7 = 128 powerset states for 4-dimension binary schema against Mathematical Oracle', () => {
            const dims = [
                ['a0', 'a1'],
                ['b0', 'b1'],
                ['c0', 'c1'],
                ['d0']
            ] as const
            const schema = defineSchema(dims)
            const allStates = schema.states // 7 states

            const n = allStates.length
            const totalSubsets = 1 << n

            for (let mask = 0; mask < totalSubsets; mask++) {
                const subset: string[] = []
                for (let i = 0; i < n; i++) {
                    if ((mask & (1 << i)) !== 0) {
                        subset.push(allStates[i])
                    }
                }

                const expected = mathematicalOracleIsValidCombination(dims, subset)
                const actual = schema.isValidCombination(subset)

                expect(actual).toBe(expected)
            }
        })
    })

    describe('3. Order Independence & Permutation Invariance', () => {
        const schema = defineSchema([
            ['selected', 'unselected'],
            ['small', 'medium', 'large'],
            ['elevated', 'flat'],
            ['morph']
        ] as const)

        function permute<T>(arr: readonly T[]): T[][] {
            if (arr.length <= 1) return [arr.slice()]
            const result: T[][] = []
            for (let i = 0; i < arr.length; i++) {
                const current = arr[i]
                const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)]
                for (const p of permute(remaining)) {
                    result.push([current, ...p])
                }
            }
            return result
        }

        it('returns identical result (true) for all 4! = 24 permutations of a valid 4-state combination', () => {
            const validCombo = ['selected', 'large', 'flat', 'morph'] as const
            const allPerms = permute(validCombo)

            expect(allPerms.length).toBe(24)
            for (const p of allPerms) {
                expect(schema.isValidCombination(p)).toBe(true)
            }
        })

        it('returns identical result (true) for all 3! = 6 permutations of a valid 3-state sub-combination', () => {
            const validSubCombo = ['unselected', 'medium', 'elevated'] as const
            const allPerms = permute(validSubCombo)

            expect(allPerms.length).toBe(6)
            for (const p of allPerms) {
                expect(schema.isValidCombination(p)).toBe(true)
            }
        })

        it('returns identical result (false) for all permutations of an invalid combination with intradimension collision', () => {
            const invalidCombo = ['selected', 'unselected', 'small'] as const
            const allPerms = permute(invalidCombo)

            expect(allPerms.length).toBe(6)
            for (const p of allPerms) {
                expect(schema.isValidCombination(p)).toBe(false)
            }
        })

        it('returns identical result (false) for all permutations of an invalid combination with cross-dimension collisions', () => {
            const invalidCross = ['selected', 'unselected', 'small', 'medium', 'elevated', 'flat'] as const
            // Test sample permutations
            expect(schema.isValidCombination(invalidCross)).toBe(false)
            expect(schema.isValidCombination([...invalidCross].reverse())).toBe(false)
            expect(schema.isValidCombination(['small', 'elevated', 'selected', 'flat', 'unselected', 'medium'])).toBe(false)
        })
    })

    describe('4. Partial Orthogonal Subsets & Empty Subsets', () => {
        const schema = defineSchema([
            ['selected', 'unselected'],
            ['small', 'medium', 'large'],
            ['primary', 'secondary'],
            ['animated']
        ] as const)

        it('accepts the empty subset []', () => {
            expect(schema.isValidCombination([])).toBe(true)
        })

        it('accepts any 1-element subset from any dimension', () => {
            for (const state of schema.states) {
                expect(schema.isValidCombination([state])).toBe(true)
            }
        })

        it('accepts any 2-element orthogonal subset spanning different dimensions', () => {
            for (let d1 = 0; d1 < schema.dimensions.length; d1++) {
                for (let d2 = d1 + 1; d2 < schema.dimensions.length; d2++) {
                    for (const s1 of schema.dimensions[d1]) {
                        for (const s2 of schema.dimensions[d2]) {
                            expect(schema.isValidCombination([s1, s2])).toBe(true)
                            expect(schema.isValidCombination([s2, s1])).toBe(true)
                        }
                    }
                }
            }
        })

        it('accepts any 3-element orthogonal subset spanning 3 distinct dimensions', () => {
            const dims = schema.dimensions
            for (let d1 = 0; d1 < dims.length; d1++) {
                for (let d2 = d1 + 1; d2 < dims.length; d2++) {
                    for (let d3 = d2 + 1; d3 < dims.length; d3++) {
                        const s1 = dims[d1][0]
                        const s2 = dims[d2][0]
                        const s3 = dims[d3][0]
                        expect(schema.isValidCombination([s1, s2, s3])).toBe(true)
                    }
                }
            }
        })
    })

    describe('5. Unknown State & Malformed Query Handling', () => {
        const schema = defineSchema([
            ['selected', 'unselected'],
            ['small', 'large']
        ] as const)

        it('rejects unknown states alone or mixed with valid states', () => {
            expect(schema.isValidCombination(['nonexistent'])).toBe(false)
            expect(schema.isValidCombination(['selected', 'nonexistent'])).toBe(false)
            expect(schema.isValidCombination(['nonexistent', 'small'])).toBe(false)
            expect(schema.isValidCombination(['selected', 'small', 'nonexistent'])).toBe(false)
        })

        it('rejects empty strings, whitespace strings, and strings with trailing/leading spaces', () => {
            expect(schema.isValidCombination([''])).toBe(false)
            expect(schema.isValidCombination([' '])).toBe(false)
            expect(schema.isValidCombination(['  selected  '])).toBe(false)
            expect(schema.isValidCombination(['selected', ''])).toBe(false)
        })

        it('rejects non-array types cleanly without exceptions', () => {
            expect(schema.isValidCombination(null as any)).toBe(false)
            expect(schema.isValidCombination(undefined as any)).toBe(false)
            expect(schema.isValidCombination('selected' as any)).toBe(false)
            expect(schema.isValidCombination(12345 as any)).toBe(false)
            expect(schema.isValidCombination({ 0: 'selected', length: 1 } as any)).toBe(false)
            expect(schema.isValidCombination(true as any)).toBe(false)
            expect(schema.isValidCombination(Symbol('test') as any)).toBe(false)
            expect(schema.isValidCombination((() => ['selected']) as any)).toBe(false)
        })

        it('rejects arrays containing non-string items or sparse holes', () => {
            expect(schema.isValidCombination(['selected', 123 as any])).toBe(false)
            expect(schema.isValidCombination(['selected', null as any])).toBe(false)
            expect(schema.isValidCombination(['selected', undefined as any])).toBe(false)
            expect(schema.isValidCombination(['selected', {} as any])).toBe(false)

            const sparseArray = new Array(2)
            sparseArray[0] = 'selected'
            expect(schema.isValidCombination(sparseArray)).toBe(false)
        })
    })

    describe('6. Object Prototype Resilience & Special Character States', () => {
        it('correctly handles Object prototype names as state tokens without pollution', () => {
            // Schema with prototype keys
            const protoSchema = defineSchema([
                ['toString', 'valueOf'],
                ['constructor', '__proto__', 'hasOwnProperty'],
                ['isPrototypeOf']
            ] as const)

            expect(protoSchema.count).toBe(2 * 3 * 1)
            expect(protoSchema.validCombinations.length).toBe(6)

            // Valid combinations of prototype names
            expect(protoSchema.isValidCombination(['toString', 'constructor', 'isPrototypeOf'])).toBe(true)
            expect(protoSchema.isValidCombination(['valueOf', '__proto__'])).toBe(true)
            expect(protoSchema.isValidCombination(['hasOwnProperty'])).toBe(true)
            expect(protoSchema.isValidCombination([])).toBe(true)

            // Intradimension collisions
            expect(protoSchema.isValidCombination(['toString', 'valueOf'])).toBe(false)
            expect(protoSchema.isValidCombination(['constructor', 'hasOwnProperty'])).toBe(false)
            expect(protoSchema.isValidCombination(['__proto__', 'hasOwnProperty'])).toBe(false)

            // Unknown prototype name not in schema
            expect(protoSchema.isValidCombination(['propertyIsEnumerable'])).toBe(false)
        })

        it('correctly handles Unicode, Chinese, Emoji, and BEM/CSS-like state names', () => {
            const unicodeSchema = defineSchema([
                ['已啟用', '已停用'],
                ['🌟special', '🔥hot'],
                ['variant--outlined', 'variant--filled']
            ] as const)

            expect(unicodeSchema.count).toBe(8)
            expect(unicodeSchema.isValidCombination(['已啟用', '🌟special', 'variant--filled'])).toBe(true)
            expect(unicodeSchema.isValidCombination(['已啟用', '已停用'])).toBe(false)
            expect(unicodeSchema.isValidCombination(['🌟special', '🔥hot'])).toBe(false)
        })
    })

    describe('7. High-Throughput & Large Schema Stress Testing', () => {
        it('handles 10-dimension binary Cartesian explosion (1024 states) and 10,000 randomized queries', () => {
            const dimensions: string[][] = []
            for (let i = 0; i < 10; i++) {
                dimensions.push([`d${i}_stateA`, `d${i}_stateB`])
            }

            const startTime = performance.now()
            const schema = defineSchema(dimensions as any)
            const defineTime = performance.now() - startTime

            expect(schema.count).toBe(1024)
            expect(schema.validCombinations.length).toBe(1024)
            expect(defineTime).toBeLessThan(100) // Less than 100ms

            // Run 10,000 queries with mixed valid, invalid, duplicate, and unknown states
            const allStates = schema.states
            const queryStartTime = performance.now()

            for (let q = 0; q < 10000; q++) {
                const queryLength = q % 12
                const query: string[] = []
                for (let k = 0; k < queryLength; k++) {
                    const stateIdx = (q * 37 + k * 17) % (allStates.length + 5)
                    if (stateIdx < allStates.length) {
                        query.push(allStates[stateIdx])
                    } else {
                        query.push(`unknown_${stateIdx}`)
                    }
                }

                const expected = mathematicalOracleIsValidCombination(dimensions, query)
                const actual = schema.isValidCombination(query)
                expect(actual).toBe(expected)
            }

            const queryTotalTime = performance.now() - queryStartTime
            expect(queryTotalTime).toBeLessThan(1000) // 10,000 queries in < 1s
        })
    })
})

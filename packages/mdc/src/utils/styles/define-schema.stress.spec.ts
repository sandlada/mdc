/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { defineSchema } from './define-schema'

/**
 * Independent Reference Oracle for combination validity verification.
 */
function referenceOracleIsValidCombination(
    dimensions: readonly (readonly string[])[],
    query: unknown
): boolean {
    if (!Array.isArray(query)) {
        return false
    }

    const stateToDim = new Map<string, number>()
    for (let d = 0; d < dimensions.length; d++) {
        for (const state of dimensions[d]) {
            stateToDim.set(state, d)
        }
    }

    const seenDims = new Set<number>()
    const seenStates = new Set<string>()

    for (const item of query) {
        if (typeof item !== 'string') {
            return false
        }
        if (!stateToDim.has(item)) {
            return false
        }
        if (seenStates.has(item)) {
            return false
        }
        seenStates.add(item)

        const dimIndex = stateToDim.get(item)!
        if (seenDims.has(dimIndex)) {
            return false
        }
        seenDims.add(dimIndex)
    }

    return true
}

/**
 * Independent Cartesian Product Generator for Oracle cross-checking.
 */
function referenceOracleCartesianProduct(
    dimensions: readonly (readonly string[])[]
): string[][] {
    if (dimensions.length === 0) return []
    let result: string[][] = [[]]
    for (const dim of dimensions) {
        const next: string[][] = []
        for (const prev of result) {
            for (const item of dim) {
                next.push([...prev, item])
            }
        }
        result = next
    }
    return result
}

describe('defineSchema — Adversarial Empirical Stress & Invariant Test Suite', () => {
    describe('1. High-Dimensional Topologies (5D, 6D, 8D, 10D)', () => {
        it('handles 5-dimensional orthogonal schema (2x2x3x3x2 = 72 combinations)', () => {
            const schema = defineSchema([
                ['active', 'inactive'],
                ['selected', 'unselected'],
                ['small', 'medium', 'large'],
                ['primary', 'secondary', 'tertiary'],
                ['horizontal', 'vertical']
            ] as const)

            expect(schema.dimensions.length).toBe(5)
            expect(schema.states.length).toBe(2 + 2 + 3 + 3 + 2)
            expect(schema.count).toBe(72)
            expect(schema.validCombinations.length).toBe(72)

            const oracleCombinations = referenceOracleCartesianProduct(schema.dimensions)
            expect(schema.validCombinations).toEqual(oracleCombinations)

            // Verify sample combinations
            expect(schema.isValidCombination(['active', 'selected', 'small', 'primary', 'horizontal'])).toBe(true)
            expect(schema.isValidCombination(['inactive', 'unselected', 'large', 'tertiary', 'vertical'])).toBe(true)
            // Partial valid
            expect(schema.isValidCombination(['active', 'large', 'vertical'])).toBe(true)
            // Invalid collision in dimension 2 (size)
            expect(schema.isValidCombination(['active', 'selected', 'small', 'large', 'primary', 'horizontal'])).toBe(false)
            // Invalid collision in dimension 0 (active/inactive)
            expect(schema.isValidCombination(['active', 'inactive', 'horizontal'])).toBe(false)
        })

        it('handles 6-dimensional binary orthogonal schema (2^6 = 64 combinations)', () => {
            const schema = defineSchema([
                ['d1_a', 'd1_b'],
                ['d2_a', 'd2_b'],
                ['d3_a', 'd3_b'],
                ['d4_a', 'd4_b'],
                ['d5_a', 'd5_b'],
                ['d6_a', 'd6_b']
            ] as const)

            expect(schema.dimensions.length).toBe(6)
            expect(schema.states.length).toBe(12)
            expect(schema.count).toBe(64)
            expect(schema.validCombinations.length).toBe(64)

            // All combinations in validCombinations must validate
            for (const combo of schema.validCombinations) {
                expect(schema.isValidCombination(combo)).toBe(true)
            }
        })

        it('handles 8-dimensional binary orthogonal schema (2^8 = 256 combinations)', () => {
            const schema = defineSchema([
                ['b1_0', 'b1_1'],
                ['b2_0', 'b2_1'],
                ['b3_0', 'b3_1'],
                ['b4_0', 'b4_1'],
                ['b5_0', 'b5_1'],
                ['b6_0', 'b6_1'],
                ['b7_0', 'b7_1'],
                ['b8_0', 'b8_1']
            ] as const)

            expect(schema.dimensions.length).toBe(8)
            expect(schema.states.length).toBe(16)
            expect(schema.count).toBe(256)
            expect(schema.validCombinations.length).toBe(256)

            const oracleCombos = referenceOracleCartesianProduct(schema.dimensions)
            expect(schema.validCombinations).toEqual(oracleCombos)
        })

        it('handles 10-dimensional binary orthogonal schema (2^10 = 1024 combinations)', () => {
            const dimensions = Array.from({ length: 10 }, (_, i) => [`dim${i}_0`, `dim${i}_1`] as const)
            const schema = defineSchema(dimensions)

            expect(schema.dimensions.length).toBe(10)
            expect(schema.states.length).toBe(20)
            expect(schema.count).toBe(1024)
            expect(schema.validCombinations.length).toBe(1024)

            // Verify unique combinations
            const uniqueSet = new Set(schema.validCombinations.map(c => c.join('|')))
            expect(uniqueSet.size).toBe(1024)
        })
    })

    describe('2. Large Cartesian Product Space Stress (10,000+ Combinations & Complexity)', () => {
        it('efficiently computes 6^5 = 7,776 Cartesian product combinations', () => {
            const start = performance.now()
            const dims = Array.from({ length: 5 }, (_, d) =>
                Array.from({ length: 6 }, (_, s) => `d${d}_s${s}`)
            )
            const schema = defineSchema(dims)
            const elapsed = performance.now() - start

            expect(schema.count).toBe(7776)
            expect(schema.validCombinations.length).toBe(7776)
            expect(elapsed).toBeLessThan(500) // Must execute rapidly

            // Spot-check first, middle, last
            expect(schema.isValidCombination(schema.validCombinations[0])).toBe(true)
            expect(schema.isValidCombination(schema.validCombinations[3888])).toBe(true)
            expect(schema.isValidCombination(schema.validCombinations[7775])).toBe(true)
        })

        it('handles 10,000 combinations (100 x 100 2D space)', () => {
            const dim0 = Array.from({ length: 100 }, (_, i) => `x_${i}`)
            const dim1 = Array.from({ length: 100 }, (_, i) => `y_${i}`)

            const start = performance.now()
            const schema = defineSchema([dim0, dim1])
            const elapsed = performance.now() - start

            expect(schema.count).toBe(10000)
            expect(schema.validCombinations.length).toBe(10000)
            expect(schema.states.length).toBe(200)
            expect(elapsed).toBeLessThan(500)

            // Verify mutual exclusivity
            expect(schema.isValidCombination(['x_0', 'y_99'])).toBe(true)
            expect(schema.isValidCombination(['x_0', 'x_1'])).toBe(false)
            expect(schema.isValidCombination(['y_0', 'y_50'])).toBe(false)
        })
    })

    describe('3. Deep Runtime Immutability & Anti-Mutation Security', () => {
        const schema = defineSchema([
            ['stateA1', 'stateA2'],
            ['stateB1', 'stateB2', 'stateB3'],
            ['stateC1']
        ] as const)

        it('recursively freezes the schema and all nested structures', () => {
            expect(Object.isFrozen(schema)).toBe(true)
            expect(Object.isFrozen(schema.states)).toBe(true)
            expect(Object.isFrozen(schema.dimensions)).toBe(true)
            for (let i = 0; i < schema.dimensions.length; i++) {
                expect(Object.isFrozen(schema.dimensions[i])).toBe(true)
            }
            expect(Object.isFrozen(schema.validCombinations)).toBe(true)
            for (let j = 0; j < schema.validCombinations.length; j++) {
                expect(Object.isFrozen(schema.validCombinations[j])).toBe(true)
            }
        })

        it('prohibits mutation via index assignment', () => {
            expect(() => {
                ;(schema.states as any)[0] = 'evil'
            }).toThrow(TypeError)

            expect(() => {
                ;(schema.dimensions as any)[0] = ['evil']
            }).toThrow(TypeError)

            expect(() => {
                ;(schema.dimensions[0] as any)[0] = 'evil'
            }).toThrow(TypeError)

            expect(() => {
                ;(schema.validCombinations as any)[0] = ['evil']
            }).toThrow(TypeError)

            expect(() => {
                ;(schema.validCombinations[0] as any)[0] = 'evil'
            }).toThrow(TypeError)
        })

        it('prohibits mutation via mutating Array prototype methods', () => {
            const mutatingMethods = [
                (arr: any) => arr.push('x'),
                (arr: any) => arr.pop(),
                (arr: any) => arr.shift(),
                (arr: any) => arr.unshift('x'),
                (arr: any) => arr.splice(0, 1),
                (arr: any) => arr.reverse(),
                (arr: any) => arr.sort(),
                (arr: any) => arr.fill('x'),
                (arr: any) => arr.copyWithin(0, 1)
            ]

            const targets = [
                schema.states,
                schema.dimensions,
                schema.dimensions[0],
                schema.validCombinations,
                schema.validCombinations[0]
            ]

            for (const target of targets) {
                for (const method of mutatingMethods) {
                    expect(() => method(target as any)).toThrow(TypeError)
                }
            }
        })

        it('prohibits adding or deleting properties on schema and nested arrays', () => {
            expect(() => {
                ;(schema as any).injectedProperty = 'bad'
            }).toThrow(TypeError)

            expect(() => {
                delete (schema as any).states
            }).toThrow(TypeError)

            expect(() => {
                ;(schema.states as any).customProp = 123
            }).toThrow(TypeError)
        })
    })

    describe('4. Extreme Input Cases & Adversarial Boundary Rejection', () => {
        it('rejects sparse / holey arrays', () => {
            const holey1D = new Array(3)
            holey1D[0] = 'a'
            holey1D[2] = 'c'
            expect(() => defineSchema(holey1D as any)).toThrow('[defineSchema] State names must be non-empty strings.')

            const holey2D = [['a'], new Array(2)]
            expect(() => defineSchema(holey2D as any)).toThrow('[defineSchema] State names must be non-empty strings.')
        })

        it('rejects nested objects, symbols, functions, NaN, Infinity', () => {
            expect(() => defineSchema([Symbol('s')] as any)).toThrow('[defineSchema] State names must be non-empty strings.')
            expect(() => defineSchema([(() => {})] as any)).toThrow('[defineSchema] State names must be non-empty strings.')
            expect(() => defineSchema([NaN] as any)).toThrow('[defineSchema] State names must be non-empty strings.')
            expect(() => defineSchema([Infinity] as any)).toThrow('[defineSchema] State names must be non-empty strings.')
            expect(() => defineSchema([{} as any])).toThrow('[defineSchema] State names must be non-empty strings.')
            expect(() => defineSchema([[['deeply-nested']]] as any)).toThrow('[defineSchema] State names must be non-empty strings.')
        })

        it('rejects all forms of whitespace and zero-length strings', () => {
            const whitespaces = ['', ' ', '   ', '\t', '\n', '\r', '\r\n', '\u00A0', '\u2000', '\u3000']
            for (const ws of whitespaces) {
                expect(() => defineSchema([ws])).toThrow('[defineSchema] State names must be non-empty strings.')
                expect(() => defineSchema([['valid'], [ws]])).toThrow('[defineSchema] State names must be non-empty strings.')
            }
        })

        it('accepts Unicode, special characters, and hyphenated identifiers', () => {
            const specialStates = [
                'state-1',
                'state_2',
                'état-activé',
                '状態_選択',
                '🚀-rocket',
                'tag:selected',
                'item.active',
                'foo@bar',
                '$special'
            ]
            const schema = defineSchema([specialStates] as const)
            expect(schema.states).toEqual(specialStates)
            expect(schema.count).toBe(specialStates.length)
            for (const state of specialStates) {
                expect(schema.isValidCombination([state])).toBe(true)
            }
        })

        it('handles extremely long state identifiers without error', () => {
            const longState1 = 'a'.repeat(2048)
            const longState2 = 'b'.repeat(2048)
            const schema = defineSchema([[longState1], [longState2]] as const)
            expect(schema.count).toBe(1)
            expect(schema.validCombinations[0]).toEqual([longState1, longState2])
            expect(schema.isValidCombination([longState1, longState2])).toBe(true)
        })

        it('handles prototype pollution strings safely without prototype corruption', () => {
            const protoStates = ['__proto__', 'constructor', 'toString', 'valueOf', 'hasOwnProperty'] as const
            const schema = defineSchema(protoStates)
            expect(schema.count).toBe(5)
            expect(schema.states).toEqual(protoStates)
            expect(schema.isValidCombination(['__proto__'])).toBe(true)
            expect(schema.isValidCombination(['constructor'])).toBe(true)
            // 1D schema: pairwise collision
            expect(schema.isValidCombination(['__proto__', 'constructor'])).toBe(false)
        })
    })

    describe('5. Exhaustive Permutation & Oracle Fuzzing on isValidCombination', () => {
        const schema = defineSchema([
            ['selected', 'unselected'],
            ['small', 'medium', 'large'],
            ['primary', 'secondary']
        ] as const)

        it('matches Oracle for all 2^N (256) power-set sub-combinations and permutations', () => {
            const allStates = [...schema.states] // 7 states total: 2^7 = 128 combinations

            // Generate power set
            const powerSet: string[][] = [[]]
            for (const state of allStates) {
                const len = powerSet.length
                for (let i = 0; i < len; i++) {
                    powerSet.push([...powerSet[i], state])
                }
            }

            expect(powerSet.length).toBe(128)

            for (const subset of powerSet) {
                const expected = referenceOracleIsValidCombination(schema.dimensions, subset)
                const actual = schema.isValidCombination(subset)
                expect(actual).toBe(expected)

                // Test reverse permutation
                const reversed = [...subset].reverse()
                expect(schema.isValidCombination(reversed)).toBe(expected)
            }
        })

        it('fuzzes 20,000 randomized state queries with Oracle agreement', () => {
            const validPool = [...schema.states]
            const invalidPool = ['unknown1', 'unknown2', '', 'null', 'undefined', '__proto__', 'evilState']
            const mixedPool = [...validPool, ...invalidPool]

            const start = performance.now()
            for (let i = 0; i < 20000; i++) {
                // Generate random query length 0 to 6
                const length = Math.floor(Math.random() * 7)
                const query: string[] = []
                for (let j = 0; j < length; j++) {
                    const idx = Math.floor(Math.random() * mixedPool.length)
                    query.push(mixedPool[idx])
                }

                const expected = referenceOracleIsValidCombination(schema.dimensions, query)
                const actual = schema.isValidCombination(query)
                expect(actual).toBe(expected)
            }
            const elapsed = performance.now() - start
            expect(elapsed).toBeLessThan(2000) // 20,000 queries in < 2s
        })

        it('returns false safely for non-array and malformed queries', () => {
            const invalidQueries = [
                null,
                undefined,
                123,
                'selected',
                true,
                false,
                {},
                { length: 1, 0: 'selected' },
                new Set(['selected']),
                new Map(),
                () => {},
                Symbol('query')
            ]

            for (const invalid of invalidQueries) {
                expect(schema.isValidCombination(invalid as any)).toBe(false)
            }
        })

        it('returns false for queries containing non-string or unknown items inside the array', () => {
            expect(schema.isValidCombination(['selected', null as any])).toBe(false)
            expect(schema.isValidCombination(['selected', undefined as any])).toBe(false)
            expect(schema.isValidCombination(['selected', 123 as any])).toBe(false)
            expect(schema.isValidCombination(['selected', {} as any])).toBe(false)
            expect(schema.isValidCombination(['selected', [] as any])).toBe(false)
        })
    })
})

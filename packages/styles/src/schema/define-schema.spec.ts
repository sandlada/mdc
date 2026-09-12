/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { defineSchema } from './define-schema'

describe('defineSchema (Black-Box Specification Suite)', () => {
    describe('1D State Schema (Backward Compatibility)', () => {
        it('creates an immutable branded StateSchema descriptor for a single state', () => {
            const schema = defineSchema(['enabled'] as const)

            expect(schema.__brand).toBe('StateSchema')
            expect(schema.states).toEqual(['enabled'])
            expect(schema.dimensions).toEqual([['enabled']])
            expect(schema.validCombinations).toEqual([['enabled']])
            expect(schema.count).toBe(1)
            expect(schema.isValidCombination(['enabled'])).toBe(true)
            expect(schema.isValidCombination([])).toBe(true)
            expect(schema.isValidCombination(['disabled'])).toBe(false)
        })

        it('creates a 2-state 1D schema with single dimension and pairwise mutual exclusivity', () => {
            const schema = defineSchema(['enabled', 'selected'] as const)

            expect(schema.__brand).toBe('StateSchema')
            expect(schema.states).toEqual(['enabled', 'selected'])
            expect(schema.dimensions).toEqual([['enabled', 'selected']])
            expect(schema.validCombinations).toEqual([['enabled'], ['selected']])
            expect(schema.count).toBe(2)
            expect(schema.isValidCombination(['enabled'])).toBe(true)
            expect(schema.isValidCombination(['selected'])).toBe(true)
            expect(schema.isValidCombination(['enabled', 'selected'])).toBe(false)
            expect(schema.isValidCombination([])).toBe(true)
        })

        it('supports a 3-state 1D checkbox topology', () => {
            const schema = defineSchema(['enabled', 'checked', 'indeterminate'] as const)

            expect(schema.__brand).toBe('StateSchema')
            expect(schema.states).toEqual(['enabled', 'checked', 'indeterminate'])
            expect(schema.dimensions).toEqual([['enabled', 'checked', 'indeterminate']])
            expect(schema.validCombinations).toEqual([
                ['enabled'],
                ['checked'],
                ['indeterminate']
            ])
            expect(schema.count).toBe(3)
            expect(schema.isValidCombination(['checked'])).toBe(true)
            expect(schema.isValidCombination(['checked', 'indeterminate'])).toBe(false)
            expect(schema.isValidCombination(['enabled', 'checked'])).toBe(false)
        })

        it('supports a 5-state 1D standard interaction topology', () => {
            const schema = defineSchema(['enabled', 'hovered', 'pressed', 'focused', 'disabled'] as const)

            expect(schema.__brand).toBe('StateSchema')
            expect(schema.states).toEqual(['enabled', 'hovered', 'pressed', 'focused', 'disabled'])
            expect(schema.dimensions).toEqual([['enabled', 'hovered', 'pressed', 'focused', 'disabled']])
            expect(schema.validCombinations).toEqual([
                ['enabled'],
                ['hovered'],
                ['pressed'],
                ['focused'],
                ['disabled']
            ])
            expect(schema.count).toBe(5)
            expect(schema.isValidCombination(['hovered'])).toBe(true)
            expect(schema.isValidCombination(['hovered', 'pressed'])).toBe(false)
        })

        it('supports domain custom states (e.g. badge size schema)', () => {
            const schema = defineSchema(['small', 'large'] as const)

            expect(schema.__brand).toBe('StateSchema')
            expect(schema.states).toEqual(['small', 'large'])
            expect(schema.dimensions).toEqual([['small', 'large']])
            expect(schema.validCombinations).toEqual([['small'], ['large']])
            expect(schema.count).toBe(2)
        })
    })

    describe('2D Orthogonal Dimensions & Cartesian Product Combinations', () => {
        it('derives dimensions, flattened states, and Cartesian combinations for 3 orthogonal dimensions', () => {
            const schema = defineSchema([
                ['selected', 'unselected'],
                ['small', 'medium', 'large'],
                ['morph']
            ] as const)

            expect(schema.__brand).toBe('StateSchema')
            expect(schema.dimensions).toEqual([
                ['selected', 'unselected'],
                ['small', 'medium', 'large'],
                ['morph']
            ])
            expect(schema.states).toEqual([
                'selected', 'unselected',
                'small', 'medium', 'large',
                'morph'
            ])
            expect(schema.count).toBe(6)

            // 2 x 3 x 1 = 6 Cartesian product combinations
            expect(schema.validCombinations).toEqual([
                ['selected', 'small', 'morph'],
                ['selected', 'medium', 'morph'],
                ['selected', 'large', 'morph'],
                ['unselected', 'small', 'morph'],
                ['unselected', 'medium', 'morph'],
                ['unselected', 'large', 'morph']
            ])
        })

        it('derives Cartesian combinations for a 2x2 binary dimension schema', () => {
            const schema = defineSchema([
                ['enabled', 'disabled'],
                ['primary', 'secondary']
            ] as const)

            expect(schema.dimensions).toEqual([
                ['enabled', 'disabled'],
                ['primary', 'secondary']
            ])
            expect(schema.states).toEqual(['enabled', 'disabled', 'primary', 'secondary'])
            expect(schema.count).toBe(4)
            expect(schema.validCombinations).toEqual([
                ['enabled', 'primary'],
                ['enabled', 'secondary'],
                ['disabled', 'primary'],
                ['disabled', 'secondary']
            ])
        })

        it('handles single-state dimensions in 2D array input', () => {
            const schema = defineSchema([
                ['a'],
                ['b'],
                ['c']
            ] as const)

            expect(schema.dimensions).toEqual([['a'], ['b'], ['c']])
            expect(schema.states).toEqual(['a', 'b', 'c'])
            expect(schema.count).toBe(1)
            expect(schema.validCombinations).toEqual([['a', 'b', 'c']])
        })

        it('handles 2D array with a single dimension', () => {
            const schema = defineSchema([
                ['open', 'closed']
            ] as const)

            expect(schema.dimensions).toEqual([['open', 'closed']])
            expect(schema.states).toEqual(['open', 'closed'])
            expect(schema.count).toBe(2)
            expect(schema.validCombinations).toEqual([
                ['open'],
                ['closed']
            ])
        })

        it('derives combinations for higher-dimension schemas (e.g. 4 orthogonal dimensions)', () => {
            const schema = defineSchema([
                ['on', 'off'],
                ['active', 'inactive'],
                ['light', 'dark'],
                ['left', 'right']
            ] as const)

            expect(schema.dimensions.length).toBe(4)
            expect(schema.states.length).toBe(8)
            // 2 x 2 x 2 x 2 = 16 combinations
            expect(schema.count).toBe(16)
            expect(schema.validCombinations.length).toBe(16)
            expect(schema.validCombinations[0]).toEqual(['on', 'active', 'light', 'left'])
            expect(schema.validCombinations[15]).toEqual(['off', 'inactive', 'dark', 'right'])
        })
    })

    describe('Mutual Exclusivity & isValidCombination Validation', () => {
        const schema = defineSchema([
            ['selected', 'unselected'],
            ['small', 'medium', 'large'],
            ['morph']
        ] as const)

        it('returns true for complete orthogonal combinations', () => {
            expect(schema.isValidCombination(['selected', 'small', 'morph'])).toBe(true)
            expect(schema.isValidCombination(['unselected', 'medium', 'morph'])).toBe(true)
            expect(schema.isValidCombination(['unselected', 'large', 'morph'])).toBe(true)
        })

        it('returns true regardless of state array order', () => {
            expect(schema.isValidCombination(['morph', 'medium', 'selected'])).toBe(true)
            expect(schema.isValidCombination(['large', 'morph', 'unselected'])).toBe(true)
            expect(schema.isValidCombination(['morph', 'unselected', 'small'])).toBe(true)
        })

        it('returns true for valid partial subsets (sub-orthogonal combinations)', () => {
            expect(schema.isValidCombination([])).toBe(true)
            expect(schema.isValidCombination(['selected'])).toBe(true)
            expect(schema.isValidCombination(['small'])).toBe(true)
            expect(schema.isValidCombination(['morph'])).toBe(true)
            expect(schema.isValidCombination(['selected', 'large'])).toBe(true)
            expect(schema.isValidCombination(['unselected', 'morph'])).toBe(true)
            expect(schema.isValidCombination(['medium', 'morph'])).toBe(true)
        })

        it('returns false when 2 states from dimension 0 are present', () => {
            expect(schema.isValidCombination(['selected', 'unselected'])).toBe(false)
            expect(schema.isValidCombination(['selected', 'unselected', 'small', 'morph'])).toBe(false)
        })

        it('returns false when 2 or more states from dimension 1 are present', () => {
            expect(schema.isValidCombination(['small', 'medium'])).toBe(false)
            expect(schema.isValidCombination(['small', 'large'])).toBe(false)
            expect(schema.isValidCombination(['medium', 'large'])).toBe(false)
            expect(schema.isValidCombination(['small', 'medium', 'large'])).toBe(false)
            expect(schema.isValidCombination(['selected', 'small', 'medium', 'morph'])).toBe(false)
        })

        it('returns false when duplicate instances of the same state are provided', () => {
            expect(schema.isValidCombination(['selected', 'selected'])).toBe(false)
            expect(schema.isValidCombination(['morph', 'morph'])).toBe(false)
            expect(schema.isValidCombination(['small', 'selected', 'small'])).toBe(false)
        })

        it('returns false when unknown / un-registered states are included', () => {
            expect(schema.isValidCombination(['unknown'])).toBe(false)
            expect(schema.isValidCombination(['selected', 'unknown'])).toBe(false)
            expect(schema.isValidCombination([''])).toBe(false)
            expect(schema.isValidCombination(['   '])).toBe(false)
            expect(schema.isValidCombination(['selected', 'extra', 'morph'])).toBe(false)
        })

        it('returns false when multiple dimensions have collisions simultaneously', () => {
            expect(schema.isValidCombination(['selected', 'unselected', 'small', 'large'])).toBe(false)
        })

        it('returns false when input is not an array', () => {
            expect(schema.isValidCombination(null as unknown as readonly string[])).toBe(false)
            expect(schema.isValidCombination(undefined as unknown as readonly string[])).toBe(false)
            expect(schema.isValidCombination('selected' as unknown as readonly string[])).toBe(false)
            expect(schema.isValidCombination(123 as unknown as readonly string[])).toBe(false)
        })
    })

    describe('Error Handling & Boundary Edge Cases', () => {
        it('throws error when input is an empty array []', () => {
            expect(() => defineSchema([] as unknown as readonly string[])).toThrow(
                '[defineSchema] States array must contain at least 1 state name.'
            )
        })

        it('throws error when input is null or undefined', () => {
            expect(() => defineSchema(null as unknown as readonly string[])).toThrow(
                '[defineSchema] States array must contain at least 1 state name.'
            )
            expect(() => defineSchema(undefined as unknown as readonly string[])).toThrow(
                '[defineSchema] States array must contain at least 1 state name.'
            )
        })

        it('throws error when input is not an array', () => {
            expect(() => defineSchema(123 as unknown as readonly string[])).toThrow(
                '[defineSchema] States array must contain at least 1 state name.'
            )
            expect(() => defineSchema('invalid' as unknown as readonly string[])).toThrow(
                '[defineSchema] States array must contain at least 1 state name.'
            )
            expect(() => defineSchema({} as unknown as readonly string[])).toThrow(
                '[defineSchema] States array must contain at least 1 state name.'
            )
        })

        it('throws error when a 2D sub-dimension is an empty array', () => {
            expect(() => defineSchema([['a'], []] as unknown as readonly (readonly string[])[])).toThrow(
                '[defineSchema] Dimension must contain at least 1 state name.'
            )
            expect(() => defineSchema([[]] as unknown as readonly (readonly string[])[])).toThrow(
                '[defineSchema] Dimension must contain at least 1 state name.'
            )
            expect(() => defineSchema([[], ['b']] as unknown as readonly (readonly string[])[])).toThrow(
                '[defineSchema] Dimension must contain at least 1 state name.'
            )
        })

        it('throws error when duplicate state names exist in the same dimension (1D)', () => {
            expect(() => defineSchema(['a', 'a'] as const)).toThrow(
                '[defineSchema] Duplicate state names detected in schema definition.'
            )
            expect(() => defineSchema(['enabled', 'hovered', 'enabled'] as const)).toThrow(
                '[defineSchema] Duplicate state names detected in schema definition.'
            )
        })

        it('throws error when duplicate state names exist in the same sub-dimension (2D)', () => {
            expect(() => defineSchema([['a', 'a'], ['b']] as const)).toThrow(
                '[defineSchema] Duplicate state names detected in schema definition.'
            )
        })

        it('throws error when duplicate state names exist across different dimensions (2D)', () => {
            expect(() => defineSchema([['a', 'b'], ['a', 'c']] as const)).toThrow(
                '[defineSchema] Duplicate state names detected in schema definition.'
            )
            expect(() => defineSchema([['selected', 'unselected'], ['large', 'selected']] as const)).toThrow(
                '[defineSchema] Duplicate state names detected in schema definition.'
            )
        })

        it('throws error when 1D state name is an empty or whitespace-only string', () => {
            expect(() => defineSchema([''] as const)).toThrow(
                '[defineSchema] State names must be non-empty strings.'
            )
            expect(() => defineSchema(['enabled', '   '] as const)).toThrow(
                '[defineSchema] State names must be non-empty strings.'
            )
            expect(() => defineSchema([' \t\n '] as const)).toThrow(
                '[defineSchema] State names must be non-empty strings.'
            )
        })

        it('throws error when 2D state name is an empty or whitespace-only string', () => {
            expect(() => defineSchema([['a'], ['']] as const)).toThrow(
                '[defineSchema] State names must be non-empty strings.'
            )
            expect(() => defineSchema([['selected', '  '], ['small']] as const)).toThrow(
                '[defineSchema] State names must be non-empty strings.'
            )
        })

        it('throws error when state name is a non-string type in 1D or 2D', () => {
            expect(() => defineSchema(['enabled', 123 as unknown as string] as const)).toThrow(
                '[defineSchema] State names must be non-empty strings.'
            )
            expect(() => defineSchema(['enabled', null as unknown as string] as const)).toThrow(
                '[defineSchema] State names must be non-empty strings.'
            )
            expect(() => defineSchema(['enabled', false as unknown as string] as const)).toThrow(
                '[defineSchema] State names must be non-empty strings.'
            )
            expect(() => defineSchema([['a'], [true as unknown as string]] as const)).toThrow(
                '[defineSchema] State names must be non-empty strings.'
            )
        })

        it('throws error on mixed/heterogeneous dimension nesting', () => {
            expect(() => defineSchema(['a', ['b']] as unknown as readonly string[])).toThrow(
                '[defineSchema] State names must be non-empty strings.'
            )
            expect(() => defineSchema([['a'], 'b'] as unknown as readonly (readonly string[])[])).toThrow(
                '[defineSchema] State names must be non-empty strings.'
            )
        })
    })

    describe('Deep Immutability Verification (Object.isFrozen)', () => {
        it('deeply freezes 1D schema descriptor and nested structures', () => {
            const schema = defineSchema(['enabled', 'selected'] as const)

            expect(Object.isFrozen(schema)).toBe(true)
            expect(Object.isFrozen(schema.states)).toBe(true)
            expect(Object.isFrozen(schema.dimensions)).toBe(true)
            expect(Object.isFrozen(schema.dimensions[0])).toBe(true)
            expect(Object.isFrozen(schema.validCombinations)).toBe(true)
            for (const combo of schema.validCombinations) {
                expect(Object.isFrozen(combo)).toBe(true)
            }
        })

        it('deeply freezes 2D schema descriptor and all sub-dimensions and combination tuples', () => {
            const schema = defineSchema([
                ['selected', 'unselected'],
                ['small', 'medium', 'large'],
                ['morph']
            ] as const)

            expect(Object.isFrozen(schema)).toBe(true)
            expect(Object.isFrozen(schema.states)).toBe(true)
            expect(Object.isFrozen(schema.dimensions)).toBe(true)

            for (const dim of schema.dimensions) {
                expect(Object.isFrozen(dim)).toBe(true)
            }

            expect(Object.isFrozen(schema.validCombinations)).toBe(true)
            for (const combo of schema.validCombinations) {
                expect(Object.isFrozen(combo)).toBe(true)
            }
        })

        it('prevents runtime mutation in strict mode', () => {
            const schema = defineSchema([
                ['selected', 'unselected'],
                ['small', 'large']
            ] as const)

            expect(() => {
                ;(schema.states as any).push('mutated')
            }).toThrow(TypeError)

            expect(() => {
                ;(schema.dimensions as any).push(['mutated'])
            }).toThrow(TypeError)

            expect(() => {
                ;(schema.dimensions[0] as any).push('mutated')
            }).toThrow(TypeError)

            expect(() => {
                ;(schema.validCombinations as any).push(['mutated'])
            }).toThrow(TypeError)

            expect(() => {
                ;(schema.validCombinations[0] as any).push('mutated')
            }).toThrow(TypeError)
        })
    })
})

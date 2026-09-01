/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect } from 'vitest'
import { pipe } from './pipe'

describe('pipe', () => {
    it('returns the initial value when no functions are provided (identity)', () => {
        expect(pipe(42)).toBe(42)
        expect(pipe('hello')).toBe('hello')
        const obj = { key: 'value' }
        expect(pipe(obj)).toBe(obj)
    })

    it('applies a single unary function', () => {
        const double = (x: number) => x * 2
        expect(pipe(5, double)).toBe(10)
    })

    it('applies two unary functions left-to-right', () => {
        const add5 = (x: number) => x + 5
        const toString = (x: number) => `Count: ${x}`
        expect(pipe(10, add5, toString)).toBe('Count: 15')
    })

    it('applies three unary functions left-to-right', () => {
        const trim = (s: string) => s.trim()
        const toUpper = (s: string) => s.toUpperCase()
        const exclaim = (s: string) => `${s}!`
        expect(pipe('  hello world  ', trim, toUpper, exclaim)).toBe('HELLO WORLD!')
    })

    it('applies four unary functions with intermediate type transformations', () => {
        const toLength = (s: string) => s.length
        const square = (n: number) => n * n
        const isEven = (n: number) => n % 2 === 0
        const formatResult = (b: boolean) => ({ even: b })

        const result = pipe('test', toLength, square, isEven, formatResult)
        expect(result).toEqual({ even: true })
    })

    it('applies 5 to 9+ functions sequentially', () => {
        const step1 = (x: number) => x + 1 // 2
        const step2 = (x: number) => x * 2 // 4
        const step3 = (x: number) => x + 3 // 7
        const step4 = (x: number) => x * 2 // 14
        const step5 = (x: number) => x - 4 // 10
        const step6 = (x: number) => x / 2 // 5
        const step7 = (x: number) => x + 10 // 15
        const step8 = (x: number) => x * 3 // 45
        const step9 = (x: number) => `${x} points` // "45 points"
        const step10 = (s: string) => `Score: ${s}` // "Score: 45 points"

        const res9 = pipe(1, step1, step2, step3, step4, step5, step6, step7, step8, step9)
        expect(res9).toBe('45 points')

        const res10 = pipe(1, step1, step2, step3, step4, step5, step6, step7, step8, step9, step10)
        expect(res10).toBe('Score: 45 points')
    })

    it('preserves immutable object references without mutating input', () => {
        const initial = Object.freeze({ count: 1 })
        const increment = (state: typeof initial) => ({ count: state.count + 1 })
        const double = (state: { count: number }) => ({ count: state.count * 2 })

        const result = pipe(initial, increment, double)
        expect(result).toEqual({ count: 4 })
        expect(initial).toEqual({ count: 1 })
    })

    it('works with curried higher-order functions', () => {
        const multiply = (factor: number) => (val: number) => val * factor
        const offset = (amount: number) => (val: number) => val + amount

        const compute = pipe(
            10,
            multiply(3),
            offset(5)
        )
        expect(compute).toBe(35)
    })
})

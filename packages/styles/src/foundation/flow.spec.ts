/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version 2026.9.8
 *
 * @fileoverview
 * flow 規格：點自由左→右函數組合。與 `pipe(value, …fns)`（立即求值）
 * 互補：`flow` 先組裝可複用的一元函數，資料最後才給。
 */

import { describe, it, expect } from 'vitest'
import { flow } from './flow'

describe('flow', () => {
    it('returns identity when no functions are provided', () => {
        expect(flow()(42)).toBe(42)
        expect(flow()('hello')).toBe('hello')
    })

    it('composes left-to-right: flow(f, g)(x) equals g(f(x))', () => {
        const double = (x: number): number => x * 2
        const add5 = (x: number): number => x + 5
        expect(flow(double, add5)(10)).toBe(25)
        expect(flow(add5, double)(10)).toBe(30)
    })

    it('supports intermediate type transformations', () => {
        const toLength = (s: string): number => s.length
        const square = (n: number): number => n * n
        const isEven = (n: number): boolean => n % 2 === 0
        expect(flow(toLength, square, isEven)('test')).toBe(true)
    })

    it('composes curried higher-order functions data-last', () => {
        const multiply = (factor: number) => (val: number): number => val * factor
        const offset = (amount: number) => (val: number): number => val + amount
        const compute = flow(multiply(3), offset(5))
        expect(compute(10)).toBe(35)
        expect(compute(0)).toBe(5)
    })

    it('returns a reusable function without evaluating early', () => {
        let calls = 0
        const spy = (x: number): number => {
            calls += 1
            return x + 1
        }
        const run = flow(spy, spy)
        expect(calls).toBe(0)
        expect(run(1)).toBe(3)
        expect(calls).toBe(2)
    })

    it('throws fail-fast on non-function chain links', () => {
        expect(() => (flow as any)(42)).toThrow(TypeError)
        expect(() => (flow as any)((x: number) => x, null)).toThrow(TypeError)
    })
})

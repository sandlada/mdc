/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/**
 * Left-to-right function composition (point-free). Unlike `pipe(value, ...fns)`
 * which applies immediately, `flow` returns a reusable unary function:
 * `flow(f, g)(x)` equals `g(f(x))`.
 *
 * The single composition operator for trigger-table pipelines and other
 * higher-order chains. Data flows last: configuration first, value at the end.
 *
 * @example
 * ```typescript
 * import { flow } from '@sandlada/styles/pipe'
 * import { emptyTables, withState, withVariant } from '@sandlada/styles/triggers'
 *
 * const tables = flow(
 *     withState({ 'small': '.small' }),
 *     withVariant({ 'filled': ':host([variant="filled"])' })
 * )(emptyTables)
 * ```
 */
export function flow(): <T>(init: T) => T
export function flow<A, B>(fn1: (arg: A) => B): (init: A) => B
export function flow<A, B, C>(fn1: (arg: A) => B, fn2: (arg: B) => C): (init: A) => C
export function flow<A, B, C, D>(fn1: (arg: A) => B, fn2: (arg: B) => C, fn3: (arg: C) => D): (init: A) => D
export function flow<A, B, C, D, E>(fn1: (arg: A) => B, fn2: (arg: B) => C, fn3: (arg: C) => D, fn4: (arg: D) => E): (init: A) => E
export function flow<A, B, C, D, E, F>(fn1: (arg: A) => B, fn2: (arg: B) => C, fn3: (arg: C) => D, fn4: (arg: D) => E, fn5: (arg: E) => F): (init: A) => F
export function flow<A, B, C, D, E, F, G>(fn1: (arg: A) => B, fn2: (arg: B) => C, fn3: (arg: C) => D, fn4: (arg: D) => E, fn5: (arg: E) => F, fn6: (arg: F) => G): (init: A) => G
export function flow(...fns: Array<(arg: any) => any>): (init: any) => any {
    for (const fn of fns) {
        if (typeof fn !== 'function') {
            throw new TypeError('[mdc-styles] flow expects unary functions, received non-function in the chain')
        }
    }
    return (init: any): any => fns.reduce((acc, fn) => fn(acc), init)
}

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/**
 * Performs left-to-right functional composition across higher-order functions with strict type inference.
 *
 * Evaluates the initial `value` through each unary function in sequence, passing the output of each step
 * as the input argument to the next step.
 *
 * @param value - Initial input value passed to the first function.
 * @param fns - Unary functions to apply sequentially.
 * @returns Result of sequential function applications.
 *
 * @example
 * ```typescript
 * import { pipe } from '@sandlada/mdc/utils/styles/pipe'
 * import { mapStateTriggers } from '@sandlada/mdc/utils/styles/map-state-triggers'
 * import { hostTrigger } from '@sandlada/mdc/utils/styles/host-trigger'
 * import { createStyleSheet } from '@sandlada/mdc/utils/styles/create-style-sheet'
 *
 * const compileWithTriggers = pipe(
 *     mapStateTriggers({ 'selected': hostTrigger('[selected]') }),
 *     createStyleSheet
 * )
 * ```
 */
export function pipe<T>(value: T): T
export function pipe<T, A>(value: T, fn1: (arg: T) => A): A
export function pipe<T, A, B>(value: T, fn1: (arg: T) => A, fn2: (arg: A) => B): B
export function pipe<T, A, B, C>(value: T, fn1: (arg: T) => A, fn2: (arg: A) => B, fn3: (arg: B) => C): C
export function pipe<T, A, B, C, D>(value: T, fn1: (arg: T) => A, fn2: (arg: A) => B, fn3: (arg: B) => C, fn4: (arg: C) => D): D
export function pipe<T, A, B, C, D, E>(value: T, fn1: (arg: T) => A, fn2: (arg: A) => B, fn3: (arg: B) => C, fn4: (arg: C) => D, fn5: (arg: D) => E): E
export function pipe<T, A, B, C, D, E, F>(value: T, fn1: (arg: T) => A, fn2: (arg: A) => B, fn3: (arg: B) => C, fn4: (arg: C) => D, fn5: (arg: D) => E, fn6: (arg: E) => F): F
export function pipe<T, A, B, C, D, E, F, G>(value: T, fn1: (arg: T) => A, fn2: (arg: A) => B, fn3: (arg: B) => C, fn4: (arg: C) => D, fn5: (arg: D) => E, fn6: (arg: E) => F, fn7: (arg: F) => G): G
export function pipe<T, A, B, C, D, E, F, G, H>(value: T, fn1: (arg: T) => A, fn2: (arg: A) => B, fn3: (arg: B) => C, fn4: (arg: C) => D, fn5: (arg: D) => E, fn6: (arg: E) => F, fn7: (arg: F) => G, fn8: (arg: G) => H): H
export function pipe<T, A, B, C, D, E, F, G, H, I>(value: T, fn1: (arg: T) => A, fn2: (arg: A) => B, fn3: (arg: B) => C, fn4: (arg: C) => D, fn5: (arg: D) => E, fn6: (arg: E) => F, fn7: (arg: F) => G, fn8: (arg: G) => H, fn9: (arg: H) => I): I
export function pipe<T, A, B, C, D, E, F, G, H, I, J>(value: T, fn1: (arg: T) => A, fn2: (arg: A) => B, fn3: (arg: B) => C, fn4: (arg: C) => D, fn5: (arg: D) => E, fn6: (arg: E) => F, fn7: (arg: F) => G, fn8: (arg: G) => H, fn9: (arg: H) => I, fn10: (arg: I) => J): J
export function pipe(value: any, ...fns: ((arg: any) => any)[]): any {
    return fns.reduce((acc, fn) => fn(acc), value)
}

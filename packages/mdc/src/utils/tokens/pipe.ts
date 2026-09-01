/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

export function pipe<T>(value: T): T
export function pipe<T, A>(value: T, fn1: (arg: T) => A): A
export function pipe<T, A, B>(value: T, fn1: (arg: T) => A, fn2: (arg: A) => B): B
export function pipe<T, A, B, C>(value: T, fn1: (arg: T) => A, fn2: (arg: A) => B, fn3: (arg: B) => C): C
export function pipe<T, A, B, C, D>(
    value: T,
    fn1: (arg: T) => A,
    fn2: (arg: A) => B,
    fn3: (arg: B) => C,
    fn4: (arg: C) => D
): D
export function pipe<T, A, B, C, D, E>(
    value: T,
    fn1: (arg: T) => A,
    fn2: (arg: A) => B,
    fn3: (arg: B) => C,
    fn4: (arg: C) => D,
    fn5: (arg: D) => E
): E
export function pipe<T, A, B, C, D, E, F>(
    value: T,
    fn1: (arg: T) => A,
    fn2: (arg: A) => B,
    fn3: (arg: B) => C,
    fn4: (arg: C) => D,
    fn5: (arg: D) => E,
    fn6: (arg: E) => F
): F
export function pipe<T, A, B, C, D, E, F, G>(
    value: T,
    fn1: (arg: T) => A,
    fn2: (arg: A) => B,
    fn3: (arg: B) => C,
    fn4: (arg: C) => D,
    fn5: (arg: D) => E,
    fn6: (arg: E) => F,
    fn7: (arg: F) => G
): G

export function pipe(value: any, ...fns: ((arg: any) => any)[]): any {
    return fns.reduce((acc, fn) => fn(acc), value)
}

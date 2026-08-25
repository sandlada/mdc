/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import {
    STATE_NAMES,
    type HasToCSSVariable,
    type Nil,
    type StateTuple,
} from './state'

export type { HasToCSSVariable, StateTuple }

type ResolveValue<V> = V extends HasToCSSVariable
    ? ReturnType<V['ToCSSVariable']>
    : V

type Prettify<T> = {
    [K in keyof T]: T[K]
} & {}

type UnionToIntersection<U> = (
    U extends any
        ? [U] extends [undefined]
            ? never
            : (k: U) => void
        : never
) extends (k: infer I) => void
    ? I
    : never

type IsAny<T> = 0 extends (1 & T) ? true : false

type ExpandTupleEntry<K extends string, V extends readonly any[]> =
    (Exclude<V[0], Nil> extends never ? {} : { [P in `enabled-${K}`]: ResolveValue<Exclude<V[0], Nil>> }) &
    (Exclude<V[1], Nil> extends never ? {} : { [P in `hovered-${K}`]: ResolveValue<Exclude<V[1], Nil>> }) &
    (Exclude<V[2], Nil> extends never ? {} : { [P in `pressed-${K}`]: ResolveValue<Exclude<V[2], Nil>> }) &
    (Exclude<V[3], Nil> extends never ? {} : { [P in `focused-${K}`]: ResolveValue<Exclude<V[3], Nil>> }) &
    (Exclude<V[4], Nil> extends never ? {} : { [P in `disabled-${K}`]: ResolveValue<Exclude<V[4], Nil>> })

type ExpandEntry<K extends string, V> = IsAny<V> extends true
    ? { [P in K]: any }
    : V extends readonly any[]
        ? ExpandTupleEntry<K, V>
        : { [P in K]: ResolveValue<V> }

export type ResolvedStyleDefinition<T> = [keyof T] extends [never]
    ? {}
    : Prettify<
        UnionToIntersection<
            {
                [K in keyof T & string]-?: ExpandEntry<K, NonNullable<T[K]>>
            }[keyof T & string]
        >
    >

export type ResolvedStyle<T> = {
    [K in keyof T]: T[K] extends HasToCSSVariable
        ? ReturnType<T[K]['ToCSSVariable']>
        : T[K]
}
/**
 * Creates a style definition mapping state tuples to expanded token records.
 *
 * Each tuple entry `[enabled, hovered, pressed, focused, disabled]` will be expanded
 * into prefixed token keys (`enabled-*`, `hovered-*`, `pressed-*`, `focused-*`, `disabled-*`).
 * Elements that are `null`, `undefined`, or `void 0` are omitted.
 */
export function createStyleDefinition<const T extends Record<string, any>>(
    record: T
): ResolvedStyleDefinition<T>

export function createStyleDefinition(record: any): any {
    const result: Record<string, any> = {}

    for (const [k, v] of Object.entries(record ?? {})) {
        if (Array.isArray(v)) {
            for (let i = 0; i < STATE_NAMES.length; i++) {
                const stateVal = v[i]
                if (stateVal !== null && stateVal !== undefined) {
                    result[`${STATE_NAMES[i]}-${k}`] = typeof (stateVal as any)?.ToCSSVariable === 'function'
                        ? (stateVal as any).ToCSSVariable()
                        : stateVal
                }
            }
        } else {
            result[k] = typeof (v as any)?.ToCSSVariable === 'function'
                ? (v as any).ToCSSVariable()
                : v
        }
    }

    return result
}

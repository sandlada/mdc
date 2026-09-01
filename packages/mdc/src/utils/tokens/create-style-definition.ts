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

export type ResolveValue<V> = V extends HasToCSSVariable
    ? ReturnType<V['ToCSSVariable']>
    : V extends string
        ? V
        : V extends number
            ? number
            : string

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

type ExpandRecordEntry<K extends string, V extends Record<string, any>> =
    UnionToIntersection<{
        [S in keyof V & string]: S extends '' | 'base'
            ? { [P in K]: ResolveValue<Exclude<V[S], Nil>> }
            : S extends 'enabled'
                ? { [P in `enabled-${K}`]: ResolveValue<Exclude<V[S], Nil>> } & { [P in K]: ResolveValue<Exclude<V[S], Nil>> }
                : { [P in `${S}:${K}`]: ResolveValue<Exclude<V[S], Nil>> }
    }[keyof V & string]>

type ExpandEntry<K extends string, V> = IsAny<V> extends true
    ? { [P in K]: any }
    : V extends readonly any[]
        ? ExpandTupleEntry<K, V>
        : V extends HasToCSSVariable
            ? { [P in K]: ResolveValue<V> }
            : V extends Record<string, any>
                ? ExpandRecordEntry<K, V>
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

export const FORWARDED_TOKEN_META = Symbol.for('mdc.forwarded_token_meta')

export interface NormalizedStateKey {
    baseKey: string
    states: string[]
    canonicalKey: string
    isLegacyHyphen: boolean
}

/**
 * Normalizes any token key (legacy `hovered-*`, colon `hover:*`, compound `checked:hover:*`, or eternal single-state)
 * into canonical representation.
 */
export function normalizeStateTokenKey(key: string): NormalizedStateKey {
    // 1. Colon-prefixed state syntax (e.g. 'hover:color', 'checked:hover:container-color')
    if (key.includes(':')) {
        const parts = key.split(':')
        const baseKey = parts.pop()!
        const canonicalStateMap: Record<string, string> = {
            'hovered': 'hover',
            'pressed': 'active',
            'focused': 'focus',
        }
        const states = parts.filter(Boolean).map((s) => canonicalStateMap[s] || s)
        return {
            baseKey,
            states,
            canonicalKey: states.length === 0 ? baseKey : `${states.join(':')}:${baseKey}`,
            isLegacyHyphen: false,
        }
    }

    // 2. Legacy hyphen prefixes (e.g. 'enabled-color', 'hovered-container-color', 'pressed-container-color')
    const legacyMap: Record<string, string> = {
        'enabled-': 'enabled',
        'hovered-': 'hover',
        'focused-': 'focus',
        'pressed-': 'active',
        'disabled-': 'disabled',
    }

    for (const [prefix, state] of Object.entries(legacyMap)) {
        if (key.startsWith(prefix)) {
            const baseKey = key.slice(prefix.length)
            if (baseKey.length > 0) {
                return {
                    baseKey,
                    states: [state],
                    canonicalKey: state === 'enabled' ? baseKey : `${state}:${baseKey}`,
                    isLegacyHyphen: true,
                }
            }
        }
    }

    // 3. Eternal single-state token (no state prefix)
    return {
        baseKey: key,
        states: [],
        canonicalKey: key,
        isLegacyHyphen: false,
    }
}

/**
 * Creates a style definition mapping arbitrary state tokens, nested state objects, or state tuples
 * to an expanded token record.
 */
export function createStyleDefinition<const T extends Record<string, any>>(
    record: T
): ResolvedStyleDefinition<T>

export function createStyleDefinition(record: any): any {
    const result: Record<string, any> = {}
    const metaMap = new Map<string, any>()

    for (const [k, v] of Object.entries(record ?? {})) {
        if (v === null || v === undefined) continue

        const meta = (v as any)?.[FORWARDED_TOKEN_META] as any | undefined

        // Case 1: 5-state tuple [enabled, hovered, pressed, focused, disabled]
        if (Array.isArray(v)) {
            for (let i = 0; i < STATE_NAMES.length; i++) {
                const stateVal = v[i]
                if (stateVal !== null && stateVal !== undefined) {
                    const expandedKey = `${STATE_NAMES[i]}-${k}`
                    result[expandedKey] = typeof (stateVal as any)?.ToCSSVariable === 'function'
                        ? (stateVal as any).ToCSSVariable()
                        : stateVal

                    if (meta) {
                        metaMap.set(expandedKey, {
                            ...meta,
                            state: STATE_NAMES[i],
                            targetExpandedKey: `${STATE_NAMES[i]}-${meta.cleanKey}`,
                        })
                    }
                }
            }
            continue
        }

        // Case 2: Nested state record { '': val, 'hover': val, 'checked:hover': val }
        // (Only when v is a plain object and not a CSS custom variable / wrapper / primitive)
        if (
            typeof v === 'object' &&
            v !== null &&
            !(v as any).__isForwardedPrimitive &&
            typeof (v as any).ToCSSVariable !== 'function' &&
            !('cssText' in (v as any))
        ) {
            const entries = Object.entries(v)
            for (const [state, stateVal] of entries) {
                if (stateVal === null || stateVal === undefined) continue

                const resolvedVal = typeof (stateVal as any)?.ToCSSVariable === 'function'
                    ? (stateVal as any).ToCSSVariable()
                    : stateVal

                let targetKey = k
                if (state === '' || state === 'base') {
                    targetKey = k
                } else if (state === 'enabled') {
                    targetKey = `enabled-${k}`
                    result[k] = resolvedVal
                } else {
                    targetKey = `${state}:${k}`
                }

                result[targetKey] = resolvedVal

                if (meta) {
                    metaMap.set(targetKey, {
                        ...meta,
                        state: state || undefined,
                        targetExpandedKey: state ? `${state}:${meta.cleanKey}` : meta.cleanKey,
                    })
                }
            }
            continue
        }

        // Case 3: Single value / Flat key (e.g. 'container-height', 'hover:color', 'checked:hover:container-color')
        const actualVal = (v as any)?.__isForwardedPrimitive ? (v as any).rawVal : v
        result[k] = typeof (actualVal as any)?.ToCSSVariable === 'function'
            ? (actualVal as any).ToCSSVariable()
            : actualVal

        if (meta) {
            metaMap.set(k, {
                ...meta,
                state: undefined,
                targetExpandedKey: meta.cleanKey,
            })
        }
    }

    if (metaMap.size > 0) {
        Object.defineProperty(result, FORWARDED_TOKEN_META, {
            value: metaMap,
            enumerable: false,
            configurable: true,
        })
    }

    return result
}

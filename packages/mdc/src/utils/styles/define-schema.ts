/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/**
 * Immutable, branded descriptor representing a component's state topology.
 *
 * @template TStates - Readonly array of unique state names.
 */
export interface StateSchema<TStates extends readonly string[]> {
    readonly __brand: 'StateSchema'
    readonly states: TStates
    readonly count: TStates['length']
}

/**
 * Declares an immutable, strongly typed state schema tuple for a component definition.
 *
 * @template TStates - Readonly array of unique state names (e.g. `['enabled', 'selected'] as const`).
 *
 * @param states - The array of state names. The first element is treated as the base state.
 * @returns An immutable `StateSchema<TStates>` descriptor object carrying compile-time dimension metadata.
 *
 * @throws {Error} If states array is empty or contains duplicate state names.
 *
 * @example
 * ```typescript
 * import { defineSchema } from '@sandlada/mdc/utils/styles/define-schema'
 *
 * export const ButtonSchema = defineSchema(['enabled', 'selected'] as const)
 * export const CheckboxSchema = defineSchema(['enabled', 'checked', 'indeterminate'] as const)
 * ```
 */
export function defineSchema<const TStates extends readonly string[]>(
    states: TStates
): StateSchema<TStates> {
    if (!states || !Array.isArray(states) || states.length === 0) {
        throw new Error('[defineSchema] States array must contain at least 1 state name.')
    }

    const unique = new Set<string>()
    for (let i = 0; i < states.length; i++) {
        const state = states[i]
        if (typeof state !== 'string' || state.trim().length === 0) {
            throw new Error('[defineSchema] State names must be non-empty strings.')
        }
        if (unique.has(state)) {
            throw new Error('[defineSchema] Duplicate state names detected in schema definition.')
        }
        unique.add(state)
    }

    return Object.freeze({
        __brand: 'StateSchema',
        states: Object.freeze([...states]) as unknown as TStates,
        count: states.length as TStates['length']
    })
}

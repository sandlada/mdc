/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Pure functional trigger tables: methodless frozen data plus data-last
 * curried helpers. The single source of truth mapping abstract state and
 * variant names to concrete CSS selector strings.
 *
 * Responsibilities (single-purpose per export):
 * - `TriggerTables` / `emptyTables`: the only data shape.
 * - `withState` / `withVariant`: HOF config mergers, composable in `flow`.
 * - `resolveState` / `resolveVariant`: pure resolvers (no methods, no `this`).
 * - `isTriggerTables`: structural guard for the `createStyleSheet` boundary.
 */

import { createDefaultTriggers } from './internal/create-default-triggers'

export type TriggerTarget = 'host' | 'self'

export interface TriggerContext {
    readonly anchor?: string
    readonly isHostAnchor?: boolean
    readonly whenCondition?: string
}

export interface ResolvedTrigger {
    readonly target: TriggerTarget
    readonly modifier: string
}

/**
 * Methodless frozen holder for state modifiers and variant mount selectors.
 */
export interface TriggerTables {
    readonly states: Readonly<Record<string, string>>
    readonly variants: Readonly<Record<string, string>>
}

const freezeRecord = (record: Record<string, string>): Readonly<Record<string, string>> =>
    Object.freeze({ ...record })

const freezeTables = (states: Record<string, string>, variants: Record<string, string>): TriggerTables =>
    Object.freeze({ states: freezeRecord(states), variants: freezeRecord(variants) })

/**
 * Canonical empty tables. Frozen; every merger returns a new frozen object
 * and never mutates its input. Resolution over empty tables still honors the
 * built-in defaults (`:hover`, `[disabled]`, ...) and heuristic fallback.
 */
export const emptyTables: TriggerTables = freezeTables({}, {})

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Structural guard distinguishing `TriggerTables` from style definitions
 * (whose `states` is an array when present) and from compiler options
 * (which carry `variantSelector` / `onWarn` keys).
 */
export function isTriggerTables(value: unknown): value is TriggerTables {
    if (!isPlainRecord(value)) return false
    const states = (value as Record<string, unknown>)['states']
    const variants = (value as Record<string, unknown>)['variants']
    return isPlainRecord(states) && isPlainRecord(variants)
}

const sanitizeMapping = (mapping: Record<string, string>, source: string): Record<string, string> => {
    if (!isPlainRecord(mapping)) {
        throw new TypeError(`[mdc-styles] ${source} expects a plain object mapping, received ${String(mapping)}`)
    }
    const clean: Record<string, string> = {}
    for (const [key, val] of Object.entries(mapping)) {
        if (val === null || val === undefined) continue
        if (typeof val !== 'string') {
            throw new TypeError(`[mdc-styles] ${source} expects string selectors, key '${key}' received ${typeof val}`)
        }
        clean[key] = val.trim()
    }
    return clean
}

/**
 * HOF config merger for state modifiers. Data-last: `withState(m)(t)`.
 *
 * @example
 * ```typescript
 * import { flow } from '@sandlada/styles/foundation'
 * import { emptyTables, withState, withVariant } from '@sandlada/styles/schema'
 *
 * const tables = flow(
 *     withState({ 'small': '.small' }),
 *     withVariant({ 'filled': ':host([variant="filled"])' })
 * )(emptyTables)
 * ```
 */
export const withState = (mapping: Record<string, string> = {}) => (tables: TriggerTables = emptyTables): TriggerTables => {
    const clean = sanitizeMapping(mapping, 'withState')
    return freezeTables({ ...(tables?.states ?? {}), ...clean }, { ...(tables?.variants ?? {}) })
}

/**
 * HOF config merger for variant mount selectors. Data-last: `withVariant(m)(t)`.
 */
export const withVariant = (mapping: Record<string, string> = {}) => (tables: TriggerTables = emptyTables): TriggerTables => {
    const clean = sanitizeMapping(mapping, 'withVariant')
    return freezeTables({ ...(tables?.states ?? {}) }, { ...(tables?.variants ?? {}), ...clean })
}

const lookupOf = (tables: TriggerTables): Map<string, string> => {
    const lookup = createDefaultTriggers()
    for (const [key, val] of Object.entries(tables.states)) {
        lookup.set(key, val)
    }
    return lookup
}

/**
 * Pure state resolver: explicit entries win, then built-in defaults, then
 * heuristic fallback. Data-last: `resolveState(name, ctx)(tables)`.
 */
export const resolveState = (name: string, context?: TriggerContext) => (tables: TriggerTables = emptyTables): ResolvedTrigger => {
    const isHostAnchor = context?.isHostAnchor ?? false
    const registered = lookupOf(tables).get(name)

    if (registered !== undefined) {
        const modifier = registered
        if (!modifier || name === 'enabled') {
            return Object.freeze({ target: 'self', modifier: '' })
        }
        if (modifier.startsWith('[') || modifier.startsWith(':host')) {
            return Object.freeze({ target: 'host', modifier })
        }
        if (modifier.startsWith(':') || modifier.startsWith('.')) {
            return Object.freeze({
                target: (isHostAnchor ? 'host' : 'self') as TriggerTarget,
                modifier
            })
        }
        return Object.freeze({
            target: (isHostAnchor ? 'host' : 'self') as TriggerTarget,
            modifier
        })
    }

    if (!name || name === 'enabled') {
        return Object.freeze({ target: 'self', modifier: '' })
    }
    if (name.startsWith('[') || name.startsWith(':host')) {
        return Object.freeze({ target: 'host', modifier: name })
    }
    if (name.startsWith(':')) {
        return Object.freeze({
            target: (isHostAnchor ? 'host' : 'self') as TriggerTarget,
            modifier: name
        })
    }
    if (name.startsWith('.')) {
        return Object.freeze({ target: 'self', modifier: name })
    }
    if (isHostAnchor) {
        return Object.freeze({ target: 'host', modifier: `[${name}]` })
    }
    return Object.freeze({ target: 'self', modifier: `.${name}` })
}

/**
 * Pure variant resolver. Unmapped names resolve to `undefined`
 * (compile layer drops them `[D]`). Data-last: `resolveVariant(name)(tables)`.
 */
export const resolveVariant = (name: string) => (tables: TriggerTables = emptyTables): string | undefined =>
    tables.variants[name]

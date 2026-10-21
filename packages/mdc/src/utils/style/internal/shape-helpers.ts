/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { CSSLike } from '../css-like'
import type { CSSVariableProvider } from '../expand-shape'

export const CORNER_KEYS = ['start-start', 'start-end', 'end-start', 'end-end'] as const

export const CORNER_PROP_MAP: Record<
    typeof CORNER_KEYS[number],
    readonly ['startStart' | 'startEnd' | 'endStart' | 'endEnd', typeof CORNER_KEYS[number]]
> = {
    'start-start': ['startStart', 'start-start'],
    'start-end'  : ['startEnd', 'start-end'],
    'end-start'  : ['endStart', 'end-start'],
    'end-end'    : ['endEnd', 'end-end']
}

export function isPlainObject(value: unknown): value is Record<string, any> {
    if (typeof value !== 'object' || value === null) {
        return false
    }
    const proto = Object.getPrototypeOf(value)
    return proto === Object.prototype || proto === null
}

export function isCSSVariableProvider(value: unknown): value is CSSVariableProvider {
    return typeof value === 'object' && value !== null && typeof (value as any)['ToCSSVariable'] === 'function'
}

export function isCSSResult(value: unknown): value is CSSLike {
    return typeof value === 'object' && value !== null && ('_$cssResult$' in (value as object) || 'cssText' in (value as object))
}

/**
 * Normalizes the user-provided prefix into the `-shape` base.
 *
 * An empty prefix is a valid input: it yields the bare `shape` base, which
 * produces `shape-*` keys (e.g. `shape-start-start`).
 */
export function normalizePrefix(prefix: unknown): string {
    if (typeof prefix !== 'string') {
        throw new Error('[expandShape] Prefix must be a string.')
    }
    const clean = prefix.trim().replace(/^--/, '').replace(/-+$/, '')
    if (clean === 'shape' || clean.endsWith('-shape')) {
        return clean
    }
    return clean.length === 0 ? 'shape' : `${clean}-shape`
}

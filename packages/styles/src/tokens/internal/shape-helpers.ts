/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { CSSLike } from '../../foundation'
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

export function normalizePrefix(prefix: unknown): string {
    if (typeof prefix !== 'string') {
        throw new Error('[expandShape] Prefix must be a non-empty string.')
    }
    const trimmed = prefix.trim()
    if (trimmed.length === 0) {
        throw new Error('[expandShape] Prefix must be a non-empty string.')
    }
    const clean = trimmed.replace(/^--/, '').replace(/-+$/, '')
    if (clean.length === 0) {
        throw new Error('[expandShape] Prefix must be a non-empty string.')
    }
    if (clean === 'shape' || clean.endsWith('-shape')) {
        return clean
    }
    return `${clean}-shape`
}

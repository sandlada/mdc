/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { StringifyPrefixOrOptions } from '../stringify-tokens'

export function normalizeOptions(prefixOrOptions: StringifyPrefixOrOptions): {
    prefix: string
    includePublicVars: boolean
    selector?: string
} {
    if (typeof prefixOrOptions === 'string') {
        const rawPrefix = prefixOrOptions.trim()
        const normalizedPrefix = rawPrefix.startsWith('--') ? rawPrefix : `--${rawPrefix}`
        return {
            prefix: normalizedPrefix.replace(/-+$/, ''),
            includePublicVars: true
        }
    }

    const { prefix = '', includePublicVars = true, selector } = prefixOrOptions ?? {}
    const rawPrefix = prefix.trim()
    const normalizedPrefix = rawPrefix.startsWith('--') ? rawPrefix : `--${rawPrefix}`
    return {
        prefix: normalizedPrefix.replace(/-+$/, ''),
        includePublicVars,
        selector
    }
}

export function formatTokenValue(val: unknown): string {
    if (val === null || val === undefined) {
        return ''
    }
    if (typeof val === 'object' && val !== null) {
        if (typeof (val as any).ToCSSVariable === 'function') {
            return (val as any).ToCSSVariable()
        }
        if ('cssText' in val && typeof (val as any).cssText === 'string') {
            return (val as any).cssText
        }
        if ('rawVal' in val) {
            return formatTokenValue((val as any).rawVal)
        }
    }
    return String(val)
}

export function isPlainObject(value: unknown): value is Record<string, any> {
    if (typeof value !== 'object' || value === null) {
        return false
    }
    const proto = Object.getPrototypeOf(value)
    return proto === Object.prototype || proto === null
}

export const RESERVED_DEF_KEYS = new Set(['__brand', 'schema', 'tokens', 'flatTokenKeys', 'forwardedBridges'])

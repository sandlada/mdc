/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

export const RESERVED_DEF_KEYS = new Set(['__brand', 'schema', 'tokens', 'flatTokenKeys', 'forwardedBridges'])

export function formatValueString(val: unknown): string {
    if (val === null || val === undefined) return ''
    if (typeof val === 'object' && val !== null) {
        if (typeof (val as any).ToCSSVariable === 'function') {
            return (val as any).ToCSSVariable()
        }
        if ('cssText' in val && typeof (val as any).cssText === 'string') {
            return (val as any).cssText
        }
        if ('rawVal' in val) {
            return formatValueString((val as any).rawVal)
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

export function isVariantDictionary(definition: unknown): definition is Record<string, any> {
    if (!definition || typeof definition !== 'object' || Array.isArray(definition)) {
        return false
    }
    const obj = definition as Record<string, any>
    if ('__brand' in obj && obj['__brand'] === 'ResolvedStyleDefinition') {
        return false
    }
    if ('schema' in obj && obj['schema'] && typeof obj['schema'] === 'object' && obj['schema']['__brand'] === 'StateSchema') {
        return false
    }
    if ('tokens' in obj && obj['tokens'] && typeof obj['tokens'] === 'object') {
        return false
    }
    const entries = Object.entries(obj)
    if (entries.length === 0) {
        return false
    }
    return entries.every(([_, val]) =>
        val && typeof val === 'object' && !Array.isArray(val) && !('_$cssResult$' in val) && !('ToCSSVariable' in val)
    )
}

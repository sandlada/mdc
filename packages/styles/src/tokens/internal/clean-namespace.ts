/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

export function isPlainObject(value: unknown): value is Record<string, any> {
    if (typeof value !== 'object' || value === null) {
        return false
    }
    const proto = Object.getPrototypeOf(value)
    return proto === Object.prototype || proto === null
}

export function cleanNamespace(targetPrefix: string, name?: string): string {
    if (name && name.trim().length > 0) {
        return name.replace(/^--/, '').replace(/^(mdc|md)-/, '').replace(/-+$/, '')
    }
    return targetPrefix.replace(/^--/, '').replace(/^(mdc|md)-/, '').replace(/-+$/, '')
}

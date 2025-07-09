/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

export function excludeTokens<T extends Record<PropertyKey, string | null>>(
    tokens: T,
    excludeTokens: Array<keyof T>
) {
    return Object
        .entries(tokens)
        .filter(([k, _]) => !excludeTokens.includes(k))
        .reduce((p, [k, v]) => ({ ...p, [k]: v }), {})
}

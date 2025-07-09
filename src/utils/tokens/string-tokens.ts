/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { CSSResult } from 'lit'

/**
 * Stringify the record object and separate it with semicolons.
 *
 * Note that the return value does not have a closing semicolon.
 *
 * @param tokens A record object. It is best to use the creation functions provided in `utils/tokens/*`.
 * @returns CSS string.
 */
export function stringTokens(tokens: Record<string, CSSResult>) {
    return Object.entries(tokens).map(([k, v]) => `${k}: ${v}`).join(`;`)
}

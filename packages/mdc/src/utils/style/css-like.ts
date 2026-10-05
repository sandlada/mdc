/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Framework-agnostic CSS value contracts for `utils/style`.
 *
 * Mirrors the pure token layer of `@sandlada/styles` without the
 * schema / at-rule compiler. Lit's `CSSResult` structurally satisfies
 * `CSSLike` (`{ cssText }`).
 */

/**
 * Minimal structural contract for a compiled CSS value.
 */
export interface CSSLike {
    readonly cssText: string
}

/**
 * Minimal structural contract for MDK variable providers (e.g. `Shape.Full`).
 */
export interface ToCSSVariableLike {
    ToCSSVariable: () => string
}

/**
 * Framework-agnostic compiled stylesheet.
 */
export class MDCStyleSheet implements CSSLike {
    public readonly cssText: string

    public constructor(cssText: string) {
        this.cssText = cssText
    }

    public toString(): string {
        return this.cssText
    }
}

/**
 * Type guard for `CSSLike` values (Lit `CSSResult` included).
 */
export function isCSSLike(value: unknown): value is CSSLike {
    return (
        typeof value === 'object' &&
        value !== null &&
        'cssText' in value &&
        typeof (value as { cssText: unknown }).cssText === 'string'
    )
}

/**
 * Extracts raw CSS text from a `CSSLike` or plain string.
 */
export function cssTextOf(value: CSSLike | string | null | undefined): string {
    if (value === null || value === undefined) {
        return ''
    }
    if (typeof value === 'string') {
        return value
    }
    if (isCSSLike(value)) {
        return value.cssText
    }
    return String(value)
}

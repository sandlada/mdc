/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Framework-agnostic CSS value contracts for `@sandlada/mdc/utils/styles`.
 *
 * This module is the single decoupling point between the pure style engine
 * and renderers such as Lit. It MUST NOT import `lit` (neither runtime nor
 * types). Lit's `CSSResult` structurally satisfies `CSSLike` (`{ cssText }`),
 * so all core functions accept Lit values via duck-typing and return
 * `MDCStyleSheet`, which Lit call-sites embed through `toString()` or
 * convert explicitly via `utils/styles/lit`.
 */

/**
 * Minimal structural contract for a compiled CSS value.
 * Satisfied by Lit `CSSResult`, `MDCStyleSheet`, and any `{ cssText }` holder.
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
 * Anything the template/style compilers know how to stringify.
 */
export type StyleTemplateValue =
    | string
    | number
    | CSSLike
    | ToCSSVariableLike
    | ReadonlyArray<unknown>
    | null
    | undefined

/**
 * Framework-agnostic compiled stylesheet.
 *
 * `toString()` returns `cssText` so instances interpolate seamlessly inside
 * Lit `css` tagged templates (`css`:host {${sheet}}``) without importing Lit
 * here. For `static styles` arrays, convert once via `toLit()` in
 * `utils/styles/lit`.
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

/**
 * Wraps raw CSS text in an `MDCStyleSheet`.
 */
export function sheetOf(cssText: string): MDCStyleSheet {
    return new MDCStyleSheet(cssText)
}

/**
 * Shared empty stylesheet singleton factory (returns a fresh instance to
 * avoid accidental cross-test mutation via subclassing).
 */
export function emptySheet(): MDCStyleSheet {
    return new MDCStyleSheet('')
}

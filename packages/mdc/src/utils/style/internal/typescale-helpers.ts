/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

export interface ExtractedTypography {
    readonly font?: unknown
    readonly leading?: unknown
    readonly size?: unknown
    readonly tracking?: unknown
    readonly weight?: unknown
}

/**
 * Normalizes and extracts 5 typographic properties from a source object.
 */
export function extractTypography(source: unknown): ExtractedTypography {
    if (source === null || typeof source !== 'object') {
        return {}
    }
    const src = source as Record<string, any>
    return {
        font: src['Font'] ?? src['font'] ?? src['fontFamily'] ?? src['font-family'] ?? src['typeface'],
        leading: src['LineHeight'] ?? src['lineHeight'] ?? src['line-height'] ?? src['leading'] ?? src['line_height'],
        size: src['FontSize'] ?? src['fontSize'] ?? src['size'] ?? src['font-size'] ?? src['font_size'],
        tracking: src['Tracking'] ?? src['tracking'] ?? src['letterSpacing'] ?? src['letter-space'] ?? src['letter-spacing'] ?? src['letter_spacing'],
        weight: src['FontWeight'] ?? src['fontWeight'] ?? src['weight'] ?? src['font_weight'] ?? src['font-weight']
    }
}

/**
 * Normalizes the user-provided prefix by trimming whitespace and stripping redundant suffixes or hyphens.
 *
 * An empty prefix is a valid input: it yields an empty base, which produces
 * unprefixed token keys (e.g. `font` instead of `-font`).
 */
export function normalizePrefix(prefix: unknown): string {
    if (typeof prefix !== 'string') {
        throw new Error('[expandTypescale] Prefix must be a string.')
    }
    return prefix
        .trim()
        .replace(/^--/, '')
        .replace(/-(?:typescale|typography|font|leading|size|tracking|weight)$/i, '')
        .replace(/-+$/, '')
}

/**
 * Builds a typographic token key from a normalized prefix and a property suffix.
 *
 * An empty prefix yields the bare suffix (e.g. `font`) instead of a
 * leading-hyphen key (e.g. `-font`).
 */
export function typescaleTokenKey(prefix: string, suffix: string): string {
    return prefix.length === 0 ? suffix : `${prefix}-${suffix}`
}

/**
 * Validates that typescaleValue is a non-null object.
 */
export function validateTypescaleInput(value: unknown): void {
    if (value === null || value === undefined) {
        throw new Error('[expandTypescale] Typescale value cannot be null or undefined.')
    }
    if (typeof value !== 'object') {
        throw new Error('[expandTypescale] Invalid typescale value: expected a Typescale instance, typography object, tuple, or state record.')
    }
}

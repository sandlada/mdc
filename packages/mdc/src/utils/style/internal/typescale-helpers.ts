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
 */
export function normalizePrefix(prefix: unknown): string {
    if (typeof prefix !== 'string') {
        throw new TypeError('[expandTypescale] Prefix must be a non-empty string.')
    }
    const trimmed = prefix.trim()
    if (trimmed === '') {
        throw new TypeError('[expandTypescale] Prefix must be a non-empty string.')
    }
    const normalized = trimmed
        .replace(/^--/, '')
        .replace(/-(?:typescale|typography|font|leading|size|tracking|weight)$/i, '')
        .replace(/-+$/, '')

    if (normalized === '') {
        throw new TypeError('[expandTypescale] Prefix cannot be empty after normalization.')
    }
    return normalized
}

/**
 * Validates that typescaleValue is a non-null object.
 */
export function validateTypescaleInput(value: unknown): void {
    if (value === null || value === undefined) {
        throw new TypeError('[expandTypescale] Typescale value cannot be null or undefined.')
    }
    if (typeof value !== 'object') {
        throw new TypeError('[expandTypescale] Invalid typescale value: expected a Typescale instance, typography object, tuple, or state record.')
    }
}

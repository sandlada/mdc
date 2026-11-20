/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

const GraphemeSegmenter = typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null

function splitGraphemes(input: string): string[] {
    if (!input) return []
    if (GraphemeSegmenter) {
        return Array.from(GraphemeSegmenter.segment(input), (item) => item.segment)
    }
    return Array.from(input)
}

/**
 * Extracts safe monogram initials from a display name using grapheme segmentation.
 *
 * Rules:
 * - Throws when `maxLength` is not a positive integer.
 * - Multiple whitespace-separated tokens: takes the first grapheme of the first token
 *   and (when `maxLength >= 2`) the first grapheme of the last token, uppercased.
 * - Single token: takes up to `maxLength` graphemes (1 by default when single Latin word?
 *   Wait: for single word like "Alice" -> "A", for CJK "张三" with maxLength=2 -> "张三" or
 *   when maxLength=1 -> "张"). Specifically: if single token is purely ASCII letters,
 *   uses 1 initial ("Alice" -> "A"); otherwise takes up to `maxLength` graphemes.
 */
export const extractAvatarInitials = (maxLength: number = 2) => (name: string): string => {
    if (!Number.isInteger(maxLength) || maxLength < 1) {
        throw new Error(`extractAvatarInitials: maxLength must be a positive integer, got ${maxLength}`)
    }

    const trimmed = name.trim()
    if (!trimmed) return ''

    const tokens = trimmed.split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return ''

    if (tokens.length === 1) {
        const graphemes = splitGraphemes(tokens[0])
        if (graphemes.length === 0) return ''
        const isAsciiWord = /^[A-Za-z0-9._-]+$/.test(tokens[0])
        const count = isAsciiWord ? 1 : Math.min(maxLength, graphemes.length)
        return graphemes.slice(0, count).join('').toUpperCase()
    }

    const first = splitGraphemes(tokens[0])[0] ?? ''
    if (maxLength === 1) {
        return first.toUpperCase()
    }
    const last = splitGraphemes(tokens[tokens.length - 1])[0] ?? ''
    return `${first}${last}`.toUpperCase()
}

/**
 * Deterministic FNV-1a 32-bit hash mapping a seed string to a palette index in `[0, paletteCount - 1]`.
 */
export const resolveAvatarPaletteIndex = (paletteCount: number) => (seed: string): number => {
    if (!Number.isInteger(paletteCount) || paletteCount < 1) {
        throw new Error(`resolveAvatarPaletteIndex: paletteCount must be a positive integer, got ${paletteCount}`)
    }

    const normalized = seed.trim()
    if (!normalized) return 0

    let hash = 0x811c9dc5
    for (let i = 0; i < normalized.length; i++) {
        hash ^= normalized.charCodeAt(i)
        hash = Math.imul(hash, 0x01000193)
    }

    return (hash >>> 0) % paletteCount
}

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { AvatarAutoColorPaletteCount } from './avatar.definition'
import { extractAvatarInitials, resolveAvatarPaletteIndex } from './internal/avatar-initials'

describe('extractAvatarInitials', () => {
    it('extracts first and last initials for multi-word Latin names', () => {
        expect(extractAvatarInitials(2)('Kai Orion')).toBe('KO')
        expect(extractAvatarInitials(2)('Ada Lovelace Byron')).toBe('AB')
        expect(extractAvatarInitials(1)('Kai Orion')).toBe('K')
    })

    it('extracts single initial for single ASCII words', () => {
        expect(extractAvatarInitials(2)('Alice')).toBe('A')
        expect(extractAvatarInitials(2)('bob')).toBe('B')
    })

    it('handles CJK names without breaking characters', () => {
        expect(extractAvatarInitials(2)('张三')).toBe('张三')
        expect(extractAvatarInitials(1)('张三')).toBe('张')
        expect(extractAvatarInitials(2)('欧阳修')).toBe('欧阳')
    })

    it('handles empty or whitespace-only inputs', () => {
        expect(extractAvatarInitials(2)('')).toBe('')
        expect(extractAvatarInitials(2)('   ')).toBe('')
    })

    it('handles emoji and multi-codepoint graphemes safely', () => {
        const result = extractAvatarInitials(2)('👩‍🚀 Astro')
        expect(result).toBe('👩‍🚀A')
    })

    it('throws on invalid maxLength', () => {
        expect(() => extractAvatarInitials(0)('Alice')).toThrow()
        expect(() => extractAvatarInitials(-1)('Alice')).toThrow()
        expect(() => extractAvatarInitials(1.5)('Alice')).toThrow()
    })

    it('satisfies grapheme-length upper bound for arbitrary strings', () => {
        const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
        fc.assert(
            fc.property(fc.string(), fc.integer({ min: 1, max: 4 }), (name, maxLen) => {
                const initials = extractAvatarInitials(maxLen)(name)
                const graphemes = Array.from(segmenter.segment(initials))
                expect(graphemes.length).toBeLessThanOrEqual(maxLen)
            })
        )
    })
})

describe('resolveAvatarPaletteIndex', () => {
    it('returns deterministic indices within [0, paletteCount - 1]', () => {
        const pick = resolveAvatarPaletteIndex(AvatarAutoColorPaletteCount)
        const a = pick('Kai Orion')
        const b = pick('Kai Orion')
        expect(a).toBe(b)
        expect(a).toBeGreaterThanOrEqual(0)
        expect(a).toBeLessThan(AvatarAutoColorPaletteCount)
    })

    it('returns 0 for empty seeds', () => {
        expect(resolveAvatarPaletteIndex(6)('')).toBe(0)
        expect(resolveAvatarPaletteIndex(6)('   ')).toBe(0)
    })

    it('throws on invalid paletteCount', () => {
        expect(() => resolveAvatarPaletteIndex(0)('a')).toThrow()
        expect(() => resolveAvatarPaletteIndex(-2)('a')).toThrow()
    })
})

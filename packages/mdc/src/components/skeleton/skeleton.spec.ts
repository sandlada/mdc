/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import {
    assertValidLineCount,
    computeSkeletonLines,
    normalizeCssDimension,
} from './internal/skeleton-layout'
import { SkeletonGroupDefinition } from './skeleton-group.definition'
import { SkeletonDefinition } from './skeleton.definition'

describe('assertValidLineCount', () => {
    it('accepts positive integers', () => {
        expect(assertValidLineCount(1)).toBe(1)
        expect(assertValidLineCount(5)).toBe(5)
    })

    it('throws on zero, negative, non-integer, or non-finite values', () => {
        expect(() => assertValidLineCount(0)).toThrow()
        expect(() => assertValidLineCount(-3)).toThrow()
        expect(() => assertValidLineCount(1.5)).toThrow()
        expect(() => assertValidLineCount(Number.NaN)).toThrow()
        expect(() => assertValidLineCount(Number.POSITIVE_INFINITY)).toThrow()
    })
})

describe('normalizeCssDimension', () => {
    it('trims valid CSS dimensions and returns null for blank strings', () => {
        expect(normalizeCssDimension('  120px ')).toBe('120px')
        expect(normalizeCssDimension('16 / 9')).toBe('16 / 9')
        expect(normalizeCssDimension('60%')).toBe('60%')
        expect(normalizeCssDimension('')).toBeNull()
        expect(normalizeCssDimension('   ')).toBeNull()
    })

    it('throws on disallowed CSS injection characters', () => {
        expect(() => normalizeCssDimension('100px; color: red')).toThrow()
        expect(() => normalizeCssDimension('100px}')).toThrow()
        expect(() => normalizeCssDimension('<script>')).toThrow()
    })
})

describe('computeSkeletonLines', () => {
    it('returns a single full-width line when lines === 1 even if lastLineWidth is provided', () => {
        const result = computeSkeletonLines('50%')(1)
        expect(result).toHaveLength(1)
        expect(result[0]).toEqual({ index: 0, isLast: true, width: null })
    })

    it('applies lastLineWidth only to the final line when lines > 1', () => {
        const result = computeSkeletonLines('45%')(3)
        expect(result).toEqual([
            { index: 0, isLast: false, width: null },
            { index: 1, isLast: false, width: null },
            { index: 2, isLast: true, width: '45%' },
        ])
    })

    it('leaves final line width as null when lastLineWidth is empty (falls back to CSS token)', () => {
        const result = computeSkeletonLines('')(2)
        expect(result).toEqual([
            { index: 0, isLast: false, width: null },
            { index: 1, isLast: true, width: null },
        ])
    })

    it('always produces exact line count with exactly one last line for arbitrary valid counts', () => {
        fc.assert(
            fc.property(fc.integer({ min: 1, max: 20 }), (count) => {
                const lines = computeSkeletonLines('70%')(count)
                expect(lines).toHaveLength(count)
                expect(lines.filter((l) => l.isLast)).toHaveLength(1)
                expect(lines[count - 1].isLast).toBe(true)
                if (count > 1) {
                    expect(lines[count - 1].width).toBe('70%')
                    expect(lines.slice(0, -1).every((l) => l.width === null)).toBe(true)
                }
            })
        )
    })
})

describe('Skeleton definitions', () => {
    it('exposes core color, motion, size, and shape tokens', () => {
        expect(SkeletonDefinition.flatTokenKeys).toContain('enabled-container-color')
        expect(SkeletonDefinition.flatTokenKeys).toContain('enabled-shimmer-color')
        expect(SkeletonDefinition.flatTokenKeys).toContain('shimmer-duration')
        expect(SkeletonDefinition.flatTokenKeys).toContain('pulse-duration')
        expect(SkeletonDefinition.flatTokenKeys).toContain('text-height')
        expect(SkeletonDefinition.flatTokenKeys).toContain('circular-size')
        expect(SkeletonDefinition.flatTokenKeys).toContain('rounded-container-shape-start-start')
        expect(SkeletonGroupDefinition.flatTokenKeys).toContain('gap')
    })
})

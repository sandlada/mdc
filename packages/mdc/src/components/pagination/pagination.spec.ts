/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import {
    clampPage,
    computeDotsWindow,
    computeItemRange,
    computePaginationItems,
    resolveTotalPages,
} from './internal/pagination-range'

describe('pagination-range pure functions', () => {
    describe('resolveTotalPages', () => {
        it('derives pages from totalItems and pageSize when totalItems is provided', () => {
            expect(resolveTotalPages(1, 0, 10)).toBe(0)
            expect(resolveTotalPages(1, 1, 10)).toBe(1)
            expect(resolveTotalPages(1, 10, 10)).toBe(1)
            expect(resolveTotalPages(1, 11, 10)).toBe(2)
            expect(resolveTotalPages(1, 95, 10)).toBe(10)
        })

        it('uses totalPages when totalItems is null', () => {
            expect(resolveTotalPages(12, null, 10)).toBe(12)
            expect(resolveTotalPages(0, null, 10)).toBe(0)
        })

        it('throws on invalid pageSize, totalItems, or totalPages', () => {
            expect(() => resolveTotalPages(5, null, 0)).toThrow()
            expect(() => resolveTotalPages(5, null, -5)).toThrow()
            expect(() => resolveTotalPages(5, -1, 10)).toThrow()
            expect(() => resolveTotalPages(-1, null, 10)).toThrow()
        })
    })

    describe('clampPage & computeItemRange', () => {
        it('clamps page into [1, totalPages]', () => {
            expect(clampPage(10)(0)).toBe(1)
            expect(clampPage(10)(-5)).toBe(1)
            expect(clampPage(10)(5)).toBe(5)
            expect(clampPage(10)(99)).toBe(10)
            expect(clampPage(0)(3)).toBe(1)
        })

        it('computes 1-based item range', () => {
            expect(computeItemRange(10, 0)(1)).toEqual({ start: 0, end: 0, total: 0 })
            expect(computeItemRange(10, 95)(1)).toEqual({ start: 1, end: 10, total: 95 })
            expect(computeItemRange(10, 95)(10)).toEqual({ start: 91, end: 95, total: 95 })
        })
    })

    describe('computePaginationItems', () => {
        it('returns empty array when totalPages is 0', () => {
            expect(computePaginationItems({ page: 1, totalPages: 0 })).toEqual([])
        })

        it('renders all pages without ellipsis when totalPages is small', () => {
            const items = computePaginationItems({ page: 3, totalPages: 5 })
            expect(items.map((i) => (i.type === 'page' ? i.page : '...'))).toEqual([1, 2, 3, 4, 5])
            expect(items[2]).toEqual({ type: 'page', page: 3, selected: true })
        })

        it('never renders redundant ellipsis for a single skipped page', () => {
            const items = computePaginationItems({ page: 4, totalPages: 10, siblingCount: 1, boundaryCount: 1 })
            const labels = items.map((i) => (i.type === 'page' ? i.page : '...'))
            expect(labels).toEqual([1, 2, 3, 4, 5, '...', 10])
        })

        it('renders both ellipses when current page is centered in large range', () => {
            const items = computePaginationItems({ page: 10, totalPages: 20, siblingCount: 1, boundaryCount: 1 })
            const labels = items.map((i) => (i.type === 'page' ? i.page : '...'))
            expect(labels).toEqual([1, '...', 9, 10, 11, '...', 20])
        })

        it('throws on negative counts', () => {
            expect(() => computePaginationItems({ page: 1, totalPages: -1 })).toThrow()
            expect(() => computePaginationItems({ page: 1, totalPages: 10, siblingCount: -1 })).toThrow()
            expect(() => computePaginationItems({ page: 1, totalPages: 10, boundaryCount: -1 })).toThrow()
        })

        it('maintains strict monotonicity, uniqueness, and bounded item count for arbitrary inputs', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 500 }),
                    fc.integer({ min: 1, max: 500 }),
                    fc.integer({ min: 0, max: 3 }),
                    fc.integer({ min: 0, max: 3 }),
                    (totalPages, rawPage, siblingCount, boundaryCount) => {
                        const page = Math.min(rawPage, totalPages)
                        const items = computePaginationItems({ page, totalPages, siblingCount, boundaryCount })
                        const pages = items
                            .filter((i): i is Extract<typeof i, { type: 'page' }> => i.type === 'page')
                            .map((i) => i.page)

                        // Strictly increasing & unique
                        for (let i = 1; i < pages.length; i++) {
                            expect(pages[i]).toBeGreaterThan(pages[i - 1])
                        }

                        // Exactly one selected page matching `page`
                        const selected = items.filter((i) => i.type === 'page' && i.selected)
                        expect(selected).toHaveLength(1)
                        expect((selected[0] as { page: number }).page).toBe(page)

                        // No 1-page gap replaced by ellipsis
                        for (let i = 0; i < items.length; i++) {
                            if (items[i].type === 'ellipsis') {
                                const prev = items[i - 1]
                                const next = items[i + 1]
                                if (prev?.type === 'page' && next?.type === 'page') {
                                    expect(next.page - prev.page).toBeGreaterThan(2)
                                }
                            }
                        }
                    }
                )
            )
        })
    })

    describe('computeDotsWindow', () => {
        it('returns all dots as normal/active when totalPages <= maxDots', () => {
            const dots = computeDotsWindow(7)({ page: 2, totalPages: 4 })
            expect(dots).toEqual([
                { page: 1, active: false, scale: 'normal' },
                { page: 2, active: true, scale: 'normal' === 'normal' ? 'active' : 'normal' },
                { page: 3, active: false, scale: 'normal' },
                { page: 4, active: false, scale: 'normal' },
            ])
        })

        it('applies progressive edge scaling when totalPages > maxDots', () => {
            const dots = computeDotsWindow(7)({ page: 6, totalPages: 12 })
            expect(dots).toHaveLength(7)
            expect(dots[0]).toEqual({ page: 3, active: false, scale: 'small' })
            expect(dots[1]).toEqual({ page: 4, active: false, scale: 'medium' })
            expect(dots[3]).toEqual({ page: 6, active: true, scale: 'active' })
            expect(dots[5]).toEqual({ page: 8, active: false, scale: 'medium' })
            expect(dots[6]).toEqual({ page: 9, active: false, scale: 'small' })
        })

        it('throws when maxDots < 3', () => {
            expect(() => computeDotsWindow(2)({ page: 1, totalPages: 5 })).toThrow()
        })
    })
})

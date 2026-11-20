/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

export type PaginationItem =
    | {
        type: 'page'
        page: number
        selected: boolean
    }
    | {
        type: 'ellipsis'
        position: 'start' | 'end'
    }

export type PaginationDotScale = 'active' | 'normal' | 'medium' | 'small'

export interface IPaginationDotItem {
    page: number
    active: boolean
    scale: PaginationDotScale
}

export interface IPaginationRangeOptions {
    page: number
    totalPages: number
    siblingCount?: number
    boundaryCount?: number
}

function createNumberRange(start: number, end: number): number[] {
    if (end < start) return []
    const length = end - start + 1
    return Array.from({ length }, (_, index) => start + index)
}

/**
 * Resolves total pages from explicit `totalPages` or `totalItems` + `pageSize`.
 */
export function resolveTotalPages(
    totalPages: number,
    totalItems: number | null,
    pageSize: number
): number {
    if (!Number.isFinite(pageSize) || pageSize <= 0) {
        throw new Error(`resolveTotalPages: pageSize must be > 0, got ${pageSize}`)
    }

    if (totalItems !== null) {
        if (!Number.isFinite(totalItems) || totalItems < 0) {
            throw new Error(`resolveTotalPages: totalItems must be >= 0, got ${totalItems}`)
        }
        if (totalItems === 0) return 0
        return Math.ceil(totalItems / pageSize)
    }

    if (!Number.isFinite(totalPages) || totalPages < 0) {
        throw new Error(`resolveTotalPages: totalPages must be >= 0, got ${totalPages}`)
    }
    return Math.floor(totalPages)
}

/**
 * Clamps a 1-based page number into `[1, Math.max(1, totalPages)]`.
 */
export const clampPage = (totalPages: number) => (page: number): number => {
    const safeTotal = Math.max(1, Math.floor(totalPages))
    if (!Number.isFinite(page)) return 1
    return Math.min(Math.max(1, Math.floor(page)), safeTotal)
}

/**
 * Computes 1-based item range `{ start, end, total }` for the current page.
 */
export const computeItemRange = (pageSize: number, totalItems: number) => (
    page: number
): { start: number; end: number; total: number } => {
    if (!Number.isFinite(pageSize) || pageSize <= 0) {
        throw new Error(`computeItemRange: pageSize must be > 0, got ${pageSize}`)
    }
    if (!Number.isFinite(totalItems) || totalItems < 0) {
        throw new Error(`computeItemRange: totalItems must be >= 0, got ${totalItems}`)
    }

    const total = Math.floor(totalItems)
    if (total === 0) {
        return { start: 0, end: 0, total: 0 }
    }

    const totalPages = Math.ceil(total / pageSize)
    const current = clampPage(totalPages)(page)
    const start = (current - 1) * pageSize + 1
    const end = Math.min(current * pageSize, total)
    return { start, end, total }
}

/**
 * Computes ordered page buttons and smart ellipsis items without 1-page redundant gaps.
 */
export function computePaginationItems(options: IPaginationRangeOptions): PaginationItem[] {
    const { page, totalPages, siblingCount = 1, boundaryCount = 1 } = options

    if (!Number.isFinite(totalPages) || totalPages < 0) {
        throw new Error(`computePaginationItems: totalPages must be >= 0, got ${totalPages}`)
    }
    if (!Number.isInteger(siblingCount) || siblingCount < 0) {
        throw new Error(`computePaginationItems: siblingCount must be a non-negative integer, got ${siblingCount}`)
    }
    if (!Number.isInteger(boundaryCount) || boundaryCount < 0) {
        throw new Error(`computePaginationItems: boundaryCount must be a non-negative integer, got ${boundaryCount}`)
    }

    const count = Math.floor(totalPages)
    if (count === 0) return []

    const current = clampPage(count)(page)
    const startPages = createNumberRange(1, Math.min(boundaryCount, count))
    const endPages = createNumberRange(
        Math.max(count - boundaryCount + 1, boundaryCount + 1),
        count
    )

    const siblingsStart = Math.max(
        Math.min(
            current - siblingCount,
            count - boundaryCount - siblingCount * 2 - 1
        ),
        boundaryCount + 2
    )

    const siblingsEnd = Math.min(
        Math.max(
            current + siblingCount,
            boundaryCount + siblingCount * 2 + 2
        ),
        endPages.length > 0 ? endPages[0] - 2 : count - 1
    )

    const items: PaginationItem[] = []

    for (const p of startPages) {
        items.push({ type: 'page', page: p, selected: p === current })
    }

    if (siblingsStart > boundaryCount + 2) {
        items.push({
            type: 'ellipsis',
            position: 'start',
        })
    } else if (boundaryCount + 1 < count - boundaryCount) {
        const bridge = boundaryCount + 1
        if (bridge < siblingsStart) {
            items.push({ type: 'page', page: bridge, selected: bridge === current })
        }
    }

    for (const p of createNumberRange(siblingsStart, siblingsEnd)) {
        items.push({ type: 'page', page: p, selected: p === current })
    }

    if (siblingsEnd < count - boundaryCount - 1) {
        items.push({
            type: 'ellipsis',
            position: 'end',
        })
    } else if (count - boundaryCount > boundaryCount) {
        const bridge = count - boundaryCount
        if (bridge > siblingsEnd) {
            items.push({ type: 'page', page: bridge, selected: bridge === current })
        }
    }

    for (const p of endPages) {
        items.push({ type: 'page', page: p, selected: p === current })
    }

    return items
}

/**
 * Computes visible indicator dots for `'dots'` variant (Android HorizontalPager style),
 * applying progressive edge scaling when `totalPages > maxDots`.
 */
export const computeDotsWindow = (maxDots: number = 7) => (state: {
    page: number
    totalPages: number
}): IPaginationDotItem[] => {
    if (!Number.isInteger(maxDots) || maxDots < 3) {
        throw new Error(`computeDotsWindow: maxDots must be an integer >= 3, got ${maxDots}`)
    }

    const total = Math.floor(state.totalPages)
    if (total <= 0) return []

    const current = clampPage(total)(state.page)

    if (total <= maxDots) {
        return createNumberRange(1, total).map((p) => ({
            page: p,
            active: p === current,
            scale: p === current ? 'active' : 'normal',
        }))
    }

    const half = Math.floor(maxDots / 2)
    let start = current - half
    let end = start + maxDots - 1

    if (start < 1) {
        start = 1
        end = maxDots
    } else if (end > total) {
        end = total
        start = total - maxDots + 1
    }

    const hasHiddenStart = start > 1
    const hasHiddenEnd = end < total

    return createNumberRange(start, end).map((p, index, list) => {
        if (p === current) {
            return { page: p, active: true, scale: 'active' }
        }

        const isFirst = index === 0
        const isSecond = index === 1
        const isLast = index === list.length - 1
        const isSecondLast = index === list.length - 2

        if ((hasHiddenStart && isFirst) || (hasHiddenEnd && isLast)) {
            return { page: p, active: false, scale: 'small' }
        }
        if ((hasHiddenStart && isSecond) || (hasHiddenEnd && isSecondLast)) {
            return { page: p, active: false, scale: 'medium' }
        }
        return { page: p, active: false, scale: 'normal' }
    })
}

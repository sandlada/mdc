/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Visual & layout variants for `<mdc-pagination>`:
 * - `standard`: Numbered page buttons with smart ellipsis, optional edges, range summary, page-size selector, and quick jumper.
 * - `compact`: Data-table footer layout (`Rows per page`, `1–10 of 200`, edge & step icon buttons).
 * - `simple`: Minimalist mobile stepper (`< 5 / 20 >`).
 * - `dots`: Android `HorizontalPager` / Material 3 Expressive morphing pill & dot indicator.
 */
export const PaginationVariant = {
    Standard: 'standard',
    Compact: 'compact',
    Simple: 'simple',
    Dots: 'dots',
} as const
export type PaginationVariant = (typeof PaginationVariant)[keyof typeof PaginationVariant]

/**
 * Size scale for `<mdc-pagination>` controls.
 */
export const PaginationSize = {
    Small: 'small',
    Medium: 'medium',
    Large: 'large',
} as const
export type PaginationSize = (typeof PaginationSize)[keyof typeof PaginationSize]

/**
 * Corner shape axis for `<mdc-pagination>` buttons.
 */
export const PaginationShape = {
    Round: 'round',
    Square: 'square',
} as const
export type PaginationShape = (typeof PaginationShape)[keyof typeof PaginationShape]

export const PaginationPageChangeEvent = 'page-change'
export const PaginationPageSizeChangeEvent = 'page-size-change'

export interface IMDCPaginationPageChangeDetail {
    page: number
    oldPage: number
    pageSize: number
    totalPages: number
}

export interface IMDCPaginationPageSizeChangeDetail {
    pageSize: number
    oldPageSize: number
    page: number
    totalPages: number
}

export interface IPaginationRangeInfo {
    start: number
    end: number
    total: number
    page: number
    totalPages: number
    pageSize: number
}

export type PaginationRangeFormatter = (info: IPaginationRangeInfo) => string
export type PaginationPageAriaLabelFormatter = (page: number, selected: boolean, totalPages: number) => string
export type PaginationPageTextFormatter = (page: number) => string

export interface IMDCPaginationAttributes {
    /** Layout variant (`'standard'` | `'compact'` | `'simple'` | `'dots'`). */
    variant: PaginationVariant
    /** Control size (`'small'` | `'medium'` | `'large'`). */
    size: PaginationSize
    /** Corner shape (`'round'` | `'square'`). */
    shape: PaginationShape
    /** Current 1-based page number. Defaults to `1`. */
    page: number
    /** Total number of pages (when `totalItems` is `null`). Defaults to `1`. */
    totalPages: number
    /** Total item count; when non-null, `effectiveTotalPages` is derived from `Math.ceil(totalItems / pageSize)`. */
    totalItems: number | null
    /** Number of items per page. Defaults to `10`. */
    pageSize: number
    /** Available options for the page-size `<mdc-select>`. Defaults to `[10, 25, 50, 100]`. */
    pageSizeOptions: number[]
    /** Number of sibling pages displayed on each side of the current page. Defaults to `1`. */
    siblingCount: number
    /** Number of boundary pages displayed at the start and end. Defaults to `1`. */
    boundaryCount: number
    /** Maximum visible dots in `'dots'` variant before window scaling kicks in. Defaults to `7`. */
    maxDots: number
    /** Shows First / Last edge buttons. */
    showEdges: boolean
    /** Shows Previous / Next step buttons. Defaults to `true`. */
    showControls: boolean
    /** Shows item range summary (e.g., `1–10 of 200`). */
    showRange: boolean
    /** Shows page-size selector (`<mdc-select>`). */
    showPageSize: boolean
    /** Shows quick-jump page input (`standard` variant). */
    showQuickJumper: boolean
    /** Disables all pagination controls. */
    disabled: boolean
    /** Accessible `aria-label` on the `<nav>` landmark. */
    label: string
    /** Accessible label for the previous-page button. */
    prevLabel: string
    /** Accessible label for the next-page button. */
    nextLabel: string
    /** Accessible label for the first-page button. */
    firstLabel: string
    /** Accessible label for the last-page button. */
    lastLabel: string
    /** Label text for the page-size selector. */
    itemsPerPageLabel: string
    /** Label text for the quick-jumper input. */
    goToLabel: string
    /** Custom formatter for range summary text. */
    rangeFormatter: PaginationRangeFormatter | null
    /** Custom formatter for page button `aria-label`. */
    pageAriaLabelFormatter: PaginationPageAriaLabelFormatter | null
    /** Custom formatter for page button visible text. */
    pageTextFormatter: PaginationPageTextFormatter | null
}

export interface IMDCPaginationEvents {
    'page-change': CustomEvent<IMDCPaginationPageChangeDetail>
    'page-size-change': CustomEvent<IMDCPaginationPageSizeChangeDetail>
}

export interface IMDCPagination extends LitElement, IMDCPaginationAttributes {
    /** Resolved total pages from `totalItems`/`pageSize` or `totalPages`. */
    readonly effectiveTotalPages: number
    /** Whether a previous page exists (`page > 1`). */
    readonly hasPreviousPage: boolean
    /** Whether a next page exists (`page < effectiveTotalPages`). */
    readonly hasNextPage: boolean
    /** Navigates to a specific 1-based page if valid and not canceled. */
    goToPage(page: number): boolean
    /** Navigates to the previous page. */
    previous(): boolean
    /** Navigates to the next page. */
    next(): boolean
    /** Navigates to the first page (`1`). */
    first(): boolean
    /** Navigates to the last page (`effectiveTotalPages`). */
    last(): boolean
}

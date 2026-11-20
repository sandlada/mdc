/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement, nothing, TemplateResult } from 'lit'
import type {
    IMDCPaginationPageChangeDetail,
    IMDCPaginationPageSizeChangeDetail,
} from '../pagination/pagination.interface'

/**
 * Container surface variant for `<mdc-data-table>`.
 */
export const DataTableVariant = {
    Outlined: 'outlined',
    Filled: 'filled',
    Elevated: 'elevated',
} as const
export type DataTableVariant = (typeof DataTableVariant)[keyof typeof DataTableVariant]

/**
 * Row and header density size for `<mdc-data-table>`.
 */
export const DataTableSize = {
    Small: 'small',
    Medium: 'medium',
    Large: 'large',
} as const
export type DataTableSize = (typeof DataTableSize)[keyof typeof DataTableSize]

/**
 * Row selection mode for `<mdc-data-table>`.
 */
export const DataTableSelectionMode = {
    None: 'none',
    Single: 'single',
    Multiple: 'multiple',
} as const
export type DataTableSelectionMode = (typeof DataTableSelectionMode)[keyof typeof DataTableSelectionMode]

/**
 * Sort direction state matching ARIA `aria-sort` values.
 */
export const DataTableSortDirection = {
    None: 'none',
    Ascending: 'ascending',
    Descending: 'descending',
} as const
export type DataTableSortDirection = (typeof DataTableSortDirection)[keyof typeof DataTableSortDirection]

/**
 * Horizontal alignment of a table column.
 */
export const DataTableColumnAlign = {
    Start: 'start',
    Center: 'center',
    End: 'end',
} as const
export type DataTableColumnAlign = (typeof DataTableColumnAlign)[keyof typeof DataTableColumnAlign]

export const DataTableSortChangeEvent = 'sort-change'
export const DataTableSelectionChangeEvent = 'selection-change'
export const DataTableRowClickEvent = 'row-click'
export const DataTableExpandChangeEvent = 'expand-change'

export type DataTableRowRecord = Record<string, unknown>

export interface IDataTableColumn<T extends DataTableRowRecord = DataTableRowRecord> {
    /** Property key in the row object and unique column identifier. */
    key: string
    /** Column header text. */
    label: string
    /** Marks the column as numeric (defaults alignment to `end` and enables tabular numerals). */
    numeric?: boolean
    /** Explicit horizontal alignment (`'start'` | `'center'` | `'end'`). */
    align?: DataTableColumnAlign
    /** Enables sorting on this column header. */
    sortable?: boolean
    /** Custom comparator used for client-side sorting. */
    sortFn?: (a: T, b: T, direction: DataTableSortDirection) => number
    /** Explicit CSS width (e.g., `'120px'`, `'20%'`). */
    width?: string
    /** Explicit CSS min-width (e.g., `'96px'`). */
    minWidth?: string
    /** Explicit CSS max-width (e.g., `'240px'`). */
    maxWidth?: string
    /** Truncates overflowing cell text with an ellipsis. */
    ellipsis?: boolean
    /** Pins the column to the inline start or end edge during horizontal scroll. */
    sticky?: 'start' | 'end'
    /** Hides this column from rendering while keeping its definition. */
    hidden?: boolean
    /** Formats cell value as plain text when `renderCell` is not provided. */
    format?: (value: unknown, row: T, index: number) => string
    /** Custom cell renderer returning a Lit `TemplateResult` or primitive. */
    renderCell?: (value: unknown, row: T, index: number) => TemplateResult | string | number | typeof nothing
    /** Custom header cell renderer. */
    renderHeader?: (column: IDataTableColumn<T>) => TemplateResult | string
}

export interface IMDCDataTableSortChangeDetail {
    sortBy: string
    sortDirection: DataTableSortDirection
    oldSortBy: string
    oldSortDirection: DataTableSortDirection
}

export interface IMDCDataTableSelectionChangeDetail<T extends DataTableRowRecord = DataTableRowRecord> {
    selectedKeys: string[]
    selectedRows: T[]
}

export interface IMDCDataTableRowClickDetail<T extends DataTableRowRecord = DataTableRowRecord> {
    row: T
    rowKey: string
    index: number
    originalEvent: MouseEvent
}

export interface IMDCDataTableExpandChangeDetail<T extends DataTableRowRecord = DataTableRowRecord> {
    expandedKeys: string[]
    expandedRows: T[]
    key: string
    expanded: boolean
}

export interface IMDCDataTableAttributes<T extends DataTableRowRecord = DataTableRowRecord> {
    /** Container visual variant (`'outlined'` | `'filled'` | `'elevated'`). */
    variant: DataTableVariant
    /** Density size (`'small'` | `'medium'` | `'large'`). */
    size: DataTableSize
    /** Column definitions. */
    columns: IDataTableColumn<T>[]
    /** Data rows. */
    rows: T[]
    /** Property name or callback used to derive a unique string key per row. Defaults to `'id'`. */
    rowKey: string | ((row: T, index: number) => string)
    /** Optional predicate to disable selection/interaction for specific rows. */
    isRowDisabled: ((row: T, index: number) => boolean) | null
    /** Selection mode (`'none'` | `'single'` | `'multiple'`). */
    selectionMode: DataTableSelectionMode
    /** Selected row keys. */
    selectedKeys: string[]
    /** Allows clicking anywhere on a row to toggle selection when `selectionMode` is active. */
    rowSelectable: boolean
    /** Active sorted column key. */
    sortBy: string
    /** Active sort direction (`'none'` | `'ascending'` | `'descending'`). */
    sortDirection: DataTableSortDirection
    /** Disables built-in client-side sorting so consumers can handle sorting server-side. */
    manualSort: boolean
    /** Enables built-in `<mdc-pagination variant="compact">` footer. */
    paginated: boolean
    /** Current 1-based page number when `paginated` is true. */
    page: number
    /** Rows per page when `paginated` is true. */
    pageSize: number
    /** Available page size options in the pagination footer. */
    pageSizeOptions: number[]
    /** Total item count for server-side pagination; defaults to `rows.length` when `null`. */
    totalItems: number | null
    /** Disables built-in client-side slicing when `paginated` is true. */
    manualPagination: boolean
    /** Shows an indeterminate linear progress indicator below the header row. */
    loading: boolean
    /** Sticks the header row to the top of the scrollable table container. */
    stickyHeader: boolean
    /** Enables hover highlight on body rows. Defaults to `true`. */
    hoverable: boolean
    /** Enables alternating subtle row striping. */
    striped: boolean
    /** Optional table title rendered in the top toolbar. */
    title: string
    /** Text displayed when `rows` is empty and no `empty` slot is provided. */
    emptyText: string
    /** Accessible `aria-label` applied to the inner `<table>`. */
    label: string
    /** Accessible `aria-label` for the select-all header checkbox. */
    selectAllLabel: string
    /** Accessible `aria-label` for the clear-selection button in the contextual bar. */
    clearSelectionLabel: string
    /** Custom formatter for the selected-row count text in the contextual bar. */
    selectedCountFormatter: ((count: number) => string) | null
    /** Enables expandable detail rows. */
    expandable: boolean
    /** Keys of currently expanded rows. */
    expandedKeys: string[]
    /** Custom renderer for the expanded detail row content. */
    renderExpandedRow: ((row: T, index: number) => TemplateResult | string | typeof nothing) | null
    /** Case-insensitive search query used to filter rows when `manualFilter` is false. */
    filterText: string
    /** Custom row filter predicate. */
    filterFn: ((row: T, filterText: string, columns: readonly IDataTableColumn<T>[]) => boolean) | null
    /** Disables built-in client-side filtering so consumers can filter server-side. */
    manualFilter: boolean
    /** Optional CSS max-height for the scrollable table body (e.g. `'360px'`). */
    maxHeight: string
}

export interface IMDCDataTableEvents<T extends DataTableRowRecord = DataTableRowRecord> {
    'sort-change': CustomEvent<IMDCDataTableSortChangeDetail>
    'selection-change': CustomEvent<IMDCDataTableSelectionChangeDetail<T>>
    'row-click': CustomEvent<IMDCDataTableRowClickDetail<T>>
    'expand-change': CustomEvent<IMDCDataTableExpandChangeDetail<T>>
    'page-change': CustomEvent<IMDCPaginationPageChangeDetail>
    'page-size-change': CustomEvent<IMDCPaginationPageSizeChangeDetail>
}

export interface IMDCDataTable<T extends DataTableRowRecord = DataTableRowRecord>
    extends LitElement, IMDCDataTableAttributes<T> {
    clearSelection(): void
    selectAll(): void
    getSelectedRows(): T[]
    expandRow(key: string): void
    collapseRow(key: string): void
    toggleRowExpansion(key: string): void
}

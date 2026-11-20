/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import {
    DataTableColumnAlign,
    DataTableSelectionMode,
    DataTableSortDirection,
    type IDataTableColumn,
    type DataTableRowRecord,
} from '../data-table.interface'

/**
 * Resolves a stable string key for a data row.
 */
export const resolveRowKey =
    <T extends DataTableRowRecord>(
        rowKey: string | ((row: T, index: number) => string),
        index: number,
    ) =>
    (row: T): string => {
        if (typeof rowKey === 'function') {
            const key = rowKey(row, index)
            if (typeof key !== 'string' || key.length === 0) {
                throw new Error(`Invalid rowKey returned at index ${index}: expected non-empty string`)
            }
            return key
        }
        const raw = row[rowKey]
        if (raw === undefined || raw === null || raw === '') {
            return String(index)
        }
        return String(raw)
    }

/**
 * Resolves effective horizontal alignment for a column.
 */
export const resolveColumnAlign = <T extends DataTableRowRecord>(
    column: IDataTableColumn<T>,
): DataTableColumnAlign => {
    if (column.align) return column.align
    return column.numeric ? DataTableColumnAlign.End : DataTableColumnAlign.Start
}

/**
 * Computes the next sort direction when a sortable column header is activated.
 * Cycles `none -> ascending -> descending -> none` on the active column,
 * or starts at `ascending` when switching to a different column.
 */
export const nextSortDirection = (
    currentDirection: DataTableSortDirection,
    isSameColumn: boolean,
): DataTableSortDirection => {
    if (!isSameColumn) {
        return DataTableSortDirection.Ascending
    }
    if (currentDirection === DataTableSortDirection.None) {
        return DataTableSortDirection.Ascending
    }
    if (currentDirection === DataTableSortDirection.Ascending) {
        return DataTableSortDirection.Descending
    }
    return DataTableSortDirection.None
}

const compareValues = (a: unknown, b: unknown): number => {
    if (a === b) return 0
    if (a === null || a === undefined) return 1
    if (b === null || b === undefined) return -1
    if (typeof a === 'number' && typeof b === 'number') {
        return a - b
    }
    if (a instanceof Date && b instanceof Date) {
        return a.getTime() - b.getTime()
    }
    if (typeof a === 'boolean' && typeof b === 'boolean') {
        return Number(a) - Number(b)
    }
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

/**
 * Returns a new sorted array of rows without mutating the input array.
 */
export const sortRows =
    <T extends DataTableRowRecord>(
        sortBy: string,
        sortDirection: DataTableSortDirection,
        columns: readonly IDataTableColumn<T>[],
    ) =>
    (rows: readonly T[]): T[] => {
        if (!sortBy || sortDirection === DataTableSortDirection.None) {
            return [...rows]
        }
        const column = columns.find((col) => col.key === sortBy)
        const factor = sortDirection === DataTableSortDirection.Descending ? -1 : 1
        return [...rows].sort((a, b) => {
            if (column?.sortFn) {
                return column.sortFn(a, b, sortDirection)
            }
            return compareValues(a[sortBy], b[sortBy]) * factor
        })
    }

/**
 * Slices rows for a 1-based page and positive pageSize.
 */
export const paginateRows =
    (page: number, pageSize: number) =>
    <T>(rows: readonly T[]): T[] => {
        if (!Number.isInteger(page) || page < 1) {
            throw new Error(`Invalid page "${page}": expected integer >= 1`)
        }
        if (!Number.isInteger(pageSize) || pageSize < 1) {
            throw new Error(`Invalid pageSize "${pageSize}": expected integer >= 1`)
        }
        const start = (page - 1) * pageSize
        return rows.slice(start, start + pageSize)
    }

/**
 * Toggles selection for a single row key according to selectionMode.
 */
export const toggleRowSelection =
    (selectionMode: DataTableSelectionMode, key: string, disabled = false) =>
    (selectedKeys: readonly string[]): string[] => {
        if (disabled || selectionMode === DataTableSelectionMode.None) {
            return [...selectedKeys]
        }
        if (selectionMode === DataTableSelectionMode.Single) {
            return selectedKeys.includes(key) ? [] : [key]
        }
        return selectedKeys.includes(key)
            ? selectedKeys.filter((k) => k !== key)
            : [...selectedKeys, key]
    }

/**
 * Computes header select-all checkbox checked & indeterminate state
 * against the currently selectable visible row keys.
 */
export const computeSelectAllState = (
    selectableVisibleKeys: readonly string[],
    selectedKeys: readonly string[],
): { allSelected: boolean; indeterminate: boolean } => {
    if (selectableVisibleKeys.length === 0) {
        return { allSelected: false, indeterminate: false }
    }
    const selectedSet = new Set(selectedKeys)
    let matched = 0
    for (const key of selectableVisibleKeys) {
        if (selectedSet.has(key)) matched++
    }
    return {
        allSelected: matched === selectableVisibleKeys.length,
        indeterminate: matched > 0 && matched < selectableVisibleKeys.length,
    }
}

/**
 * Toggles selection for all `selectableVisibleKeys` while preserving selections
 * on other pages.
 */
export const toggleSelectAll =
    (selectableVisibleKeys: readonly string[], allSelected: boolean) =>
    (selectedKeys: readonly string[]): string[] => {
        const visibleSet = new Set(selectableVisibleKeys)
        if (allSelected) {
            return selectedKeys.filter((key) => !visibleSet.has(key))
        }
        const next = new Set(selectedKeys)
        for (const key of selectableVisibleKeys) {
            next.add(key)
        }
        return [...next]
    }

/**
 * Filters rows by `filterText` across visible columns (or custom `filterFn`).
 */
export const filterRows =
    <T extends DataTableRowRecord>(
        filterText: string,
        columns: readonly IDataTableColumn<T>[],
        customFilterFn?: ((row: T, filterText: string, columns: readonly IDataTableColumn<T>[]) => boolean) | null,
    ) =>
    (rows: readonly T[]): T[] => {
        const query = filterText.trim()
        if (!query) return [...rows]
        if (customFilterFn) {
            return rows.filter((row) => customFilterFn(row, query, columns))
        }
        const normalized = query.toLowerCase()
        const searchableColumns = columns.filter((col) => !col.hidden)
        return rows.filter((row, index) =>
            searchableColumns.some((col) => {
                const raw = row[col.key]
                const text = col.format ? col.format(raw, row, index) : raw
                if (text === null || text === undefined) return false
                return String(text).toLowerCase().includes(normalized)
            }),
        )
    }

/**
 * Toggles a row key in `expandedKeys`, or forces an explicit `forceExpanded` state.
 */
export const toggleExpandedKey =
    (key: string, forceExpanded?: boolean) =>
    (expandedKeys: readonly string[]): string[] => {
        const currentlyExpanded = expandedKeys.includes(key)
        const targetExpanded = forceExpanded ?? !currentlyExpanded
        if (targetExpanded === currentlyExpanded) {
            return [...expandedKeys]
        }
        if (targetExpanded) {
            return [...expandedKeys, key]
        }
        return expandedKeys.filter((k) => k !== key)
    }

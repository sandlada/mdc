/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import {
    DataTableColumnAlign,
    DataTableSelectionMode,
    DataTableSortDirection,
    type IDataTableColumn,
} from './data-table.interface'
import {
    computeSelectAllState,
    filterRows,
    nextSortDirection,
    paginateRows,
    resolveColumnAlign,
    resolveRowKey,
    sortRows,
    toggleExpandedKey,
    toggleRowSelection,
    toggleSelectAll,
} from './internal/data-table-utils'

describe('data-table pure functions', () => {
    describe('resolveRowKey', () => {
        it('resolves string property key and falls back to index string', () => {
            expect(resolveRowKey('id', 0)({ id: 42 })).toBe('42')
            expect(resolveRowKey('id', 3)({ name: 'Missing' })).toBe('3')
        })

        it('uses custom callback and throws on empty key', () => {
            expect(resolveRowKey((row) => `k-${row.code}`, 0)({ code: 'A' })).toBe('k-A')
            expect(() => resolveRowKey(() => '', 1)({ code: 'B' })).toThrow()
        })
    })

    describe('resolveColumnAlign', () => {
        it('defaults numeric columns to end and others to start unless align is specified', () => {
            expect(resolveColumnAlign({ key: 'name', label: 'Name' })).toBe(DataTableColumnAlign.Start)
            expect(resolveColumnAlign({ key: 'count', label: 'Count', numeric: true })).toBe(DataTableColumnAlign.End)
            expect(resolveColumnAlign({ key: 'count', label: 'Count', numeric: true, align: 'center' })).toBe(DataTableColumnAlign.Center)
        })
    })

    describe('nextSortDirection', () => {
        it('cycles none -> ascending -> descending -> none on same column', () => {
            expect(nextSortDirection('none', true)).toBe(DataTableSortDirection.Ascending)
            expect(nextSortDirection('ascending', true)).toBe(DataTableSortDirection.Descending)
            expect(nextSortDirection('descending', true)).toBe(DataTableSortDirection.None)
        })

        it('resets to ascending when switching columns', () => {
            expect(nextSortDirection('descending', false)).toBe(DataTableSortDirection.Ascending)
        })
    })

    describe('sortRows', () => {
        const columns: IDataTableColumn<{ id: string; name: string; calories: number }>[] = [
            { key: 'name', label: 'Name', sortable: true },
            { key: 'calories', label: 'Calories', numeric: true, sortable: true },
        ]
        const rows = [
            { id: '1', name: 'Eclair', calories: 262 },
            { id: '2', name: 'Cupcake', calories: 305 },
            { id: '3', name: 'Frozen yogurt', calories: 159 },
        ]

        it('sorts numerically and alphabetically without mutating source', () => {
            const asc = sortRows('calories', 'ascending', columns)(rows)
            expect(asc.map((r) => r.id)).toEqual(['3', '1', '2'])
            expect(rows.map((r) => r.id)).toEqual(['1', '2', '3'])

            const desc = sortRows('name', 'descending', columns)(rows)
            expect(desc.map((r) => r.name)).toEqual(['Frozen yogurt', 'Eclair', 'Cupcake'])
        })

        it('supports custom sortFn on column', () => {
            const customCols: IDataTableColumn<{ id: string; priority: number }>[] = [
                {
                    key: 'priority',
                    label: 'Priority',
                    sortFn: (a, b) => a.priority - b.priority,
                },
            ]
            const result = sortRows('priority', 'ascending', customCols)([
                { id: 'a', priority: 3 },
                { id: 'b', priority: 1 },
            ])
            expect(result.map((r) => r.id)).toEqual(['b', 'a'])
        })
    })

    describe('paginateRows', () => {
        it('slices rows for valid page and pageSize', () => {
            const items = [1, 2, 3, 4, 5]
            expect(paginateRows(1, 2)(items)).toEqual([1, 2])
            expect(paginateRows(3, 2)(items)).toEqual([5])
        })

        it('throws on invalid page or pageSize', () => {
            expect(() => paginateRows(0, 10)([1])).toThrow()
            expect(() => paginateRows(1, 0)([1])).toThrow()
        })
    })

    describe('selection helpers', () => {
        it('toggles single and multiple selections', () => {
            expect(toggleRowSelection(DataTableSelectionMode.None, '1')([])).toEqual([])
            expect(toggleRowSelection(DataTableSelectionMode.Single, '1')(['2'])).toEqual(['1'])
            expect(toggleRowSelection(DataTableSelectionMode.Single, '1')(['1'])).toEqual([])
            expect(toggleRowSelection(DataTableSelectionMode.Multiple, '2')(['1'])).toEqual(['1', '2'])
            expect(toggleRowSelection(DataTableSelectionMode.Multiple, '1')(['1', '2'])).toEqual(['2'])
            expect(toggleRowSelection(DataTableSelectionMode.Multiple, '1', true)(['2'])).toEqual(['2'])
        })

        it('computes select-all state and toggles visible keys while preserving other pages', () => {
            expect(computeSelectAllState(['1', '2'], ['1', '99'])).toEqual({
                allSelected: false,
                indeterminate: true,
            })
            expect(computeSelectAllState(['1', '2'], ['1', '2', '99'])).toEqual({
                allSelected: true,
                indeterminate: false,
            })

            expect(toggleSelectAll(['1', '2'], false)(['1', '99'])).toEqual(['1', '99', '2'])
            expect(toggleSelectAll(['1', '2'], true)(['1', '2', '99'])).toEqual(['99'])
        })
    })

    describe('filterRows & toggleExpandedKey', () => {
        const columns: IDataTableColumn<{ id: string; name: string; secret?: string }>[] = [
            { key: 'name', label: 'Name' },
            { key: 'secret', label: 'Secret', hidden: true },
        ]
        const rows = [
            { id: '1', name: 'Frozen yogurt', secret: 'alpha' },
            { id: '2', name: 'Cupcake', secret: 'beta' },
        ]

        it('filters case-insensitively across visible columns and ignores hidden columns', () => {
            expect(filterRows('yogurt', columns)(rows).map((r) => r.id)).toEqual(['1'])
            expect(filterRows('alpha', columns)(rows)).toEqual([])
            expect(filterRows('', columns)(rows)).toHaveLength(2)
        })

        it('toggles and forces expanded row keys', () => {
            expect(toggleExpandedKey('1')([])).toEqual(['1'])
            expect(toggleExpandedKey('1')(['1', '2'])).toEqual(['2'])
            expect(toggleExpandedKey('1', true)(['1'])).toEqual(['1'])
            expect(toggleExpandedKey('1', false)(['1', '2'])).toEqual(['2'])
        })
    })
})

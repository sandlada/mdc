// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html } from 'lit'
import { describe, expect, it } from 'vitest'
import { fixture, oneEvent } from '../../utils/testing/fixture'
import './index'
import type { MDCDataTable } from './data-table'
import type {
    IDataTableColumn,
    IMDCDataTableExpandChangeDetail,
    IMDCDataTableSelectionChangeDetail,
    IMDCDataTableSortChangeDetail,
} from './data-table.interface'

interface Dessert {
    id: string
    name: string
    calories: number
    fat: number
}

const Columns: IDataTableColumn<Dessert>[] = [
    { key: 'name', label: 'Dessert', sortable: true },
    { key: 'calories', label: 'Calories', numeric: true, sortable: true },
    { key: 'fat', label: 'Fat (g)', numeric: true, format: (v) => Number(v).toFixed(1) },
]

const Rows: Dessert[] = [
    { id: '1', name: 'Frozen yogurt', calories: 159, fat: 6 },
    { id: '2', name: 'Ice cream sandwich', calories: 237, fat: 9 },
    { id: '3', name: 'Eclair', calories: 262, fat: 16 },
    { id: '4', name: 'Cupcake', calories: 305, fat: 3.7 },
]

describe('mdc-data-table (DOM)', () => {
    it('renders headers, formatted cells, and numeric alignment classes', async () => {
        const el = await fixture<MDCDataTable<Dessert>>(html`
            <mdc-data-table title="Nutrition" .columns=${Columns} .rows=${Rows}></mdc-data-table>
        `)

        const title = el.shadowRoot?.querySelector('.toolbar-title')
        expect(title?.textContent?.trim()).toBe('Nutrition')

        const headers = Array.from(el.shadowRoot?.querySelectorAll('thead th') ?? [])
        expect(headers).toHaveLength(3)
        expect(headers[0].classList.contains('align-start')).toBe(true)
        expect(headers[1].classList.contains('align-end')).toBe(true)
        expect(headers[1].classList.contains('is-numeric')).toBe(true)

        const firstRowCells = Array.from(el.shadowRoot?.querySelectorAll('tbody tr:first-child td') ?? [])
        expect(firstRowCells[0].textContent?.trim()).toBe('Frozen yogurt')
        expect(firstRowCells[1].textContent?.trim()).toBe('159')
        expect(firstRowCells[2].textContent?.trim()).toBe('6.0')
    })

    it('sorts rows on sortable header click and cycles direction', async () => {
        const el = await fixture<MDCDataTable<Dessert>>(html`
            <mdc-data-table .columns=${Columns} .rows=${Rows}></mdc-data-table>
        `)

        const sortBtn = el.shadowRoot?.querySelector('thead th:nth-child(2) .sort-button') as HTMLButtonElement
        const eventPromise = oneEvent<CustomEvent<IMDCDataTableSortChangeDetail>>(el, 'sort-change')
        sortBtn.click()
        const event = await eventPromise
        await el.updateComplete

        expect(event.detail.sortBy).toBe('calories')
        expect(event.detail.sortDirection).toBe('ascending')
        const firstCell = el.shadowRoot?.querySelector('tbody tr:first-child td:first-child')
        expect(firstCell?.textContent?.trim()).toBe('Frozen yogurt')

        sortBtn.click()
        await el.updateComplete
        expect(el.sortDirection).toBe('descending')
        const updatedFirstCell = el.shadowRoot?.querySelector('tbody tr:first-child td:first-child')
        expect(updatedFirstCell?.textContent?.trim()).toBe('Cupcake')
    })

    it('supports multiple selection, select-all checkbox, contextual selection bar, and clearSelection()', async () => {
        const el = await fixture<MDCDataTable<Dessert>>(html`
            <mdc-data-table
                selection-mode="multiple"
                row-selectable
                .columns=${Columns}
                .rows=${Rows}
            ></mdc-data-table>
        `)

        const firstRow = el.shadowRoot?.querySelector('tbody tr:first-child') as HTMLTableRowElement
        const selPromise = oneEvent<CustomEvent<IMDCDataTableSelectionChangeDetail<Dessert>>>(el, 'selection-change')
        firstRow.click()
        const selEvent = await selPromise
        await el.updateComplete

        expect(selEvent.detail.selectedKeys).toEqual(['1'])
        expect(el.shadowRoot?.querySelector('.selection-count')?.textContent?.trim()).toBe('1 selected')

        const headerCheckbox = el.shadowRoot?.querySelector('thead .checkbox-cell mdc-checkbox') as HTMLElement & {
            checked: boolean
            indeterminate: boolean
        }
        expect(headerCheckbox.indeterminate).toBe(true)

        el.selectAll()
        await el.updateComplete
        expect(el.selectedKeys).toEqual(['1', '2', '3', '4'])
        expect(headerCheckbox.checked).toBe(true)
        expect(headerCheckbox.indeterminate).toBe(false)

        el.clearSelection()
        await el.updateComplete
        expect(el.selectedKeys).toEqual([])
    })

    it('renders compact pagination footer and slices rows by page', async () => {
        const el = await fixture<MDCDataTable<Dessert>>(html`
            <mdc-data-table
                paginated
                page="1"
                page-size="2"
                .columns=${Columns}
                .rows=${Rows}
            ></mdc-data-table>
        `)

        let renderedRows = el.shadowRoot?.querySelectorAll('tbody tr')
        expect(renderedRows).toHaveLength(2)

        const pagination = el.shadowRoot?.querySelector('mdc-pagination') as HTMLElement & { next(): void }
        expect(pagination).not.toBeNull()

        pagination.next()
        await el.updateComplete

        expect(el.page).toBe(2)
        renderedRows = el.shadowRoot?.querySelectorAll('tbody tr')
        expect(renderedRows).toHaveLength(2)
        expect(renderedRows?.[0].querySelector('td')?.textContent?.trim()).toBe('Eclair')
    })

    it('renders loading bar and empty state when rows are empty', async () => {
        const el = await fixture<MDCDataTable<Dessert>>(html`
            <mdc-data-table
                loading
                empty-text="Nothing here"
                .columns=${Columns}
                .rows=${[]}
            ></mdc-data-table>
        `)

        expect(el.shadowRoot?.querySelector('mdc-progress-indicator.loading-bar')).not.toBeNull()
        const emptyCell = el.shadowRoot?.querySelector('.empty-cell')
        expect(emptyCell?.textContent?.trim()).toBe('Nothing here')
    })

    it('supports expandable rows, renderExpandedRow, and expand-change event', async () => {
        const el = await fixture<MDCDataTable<Dessert>>(html`
            <mdc-data-table
                expandable
                .columns=${Columns}
                .rows=${Rows}
                .renderExpandedRow=${(row: Dessert) => html`<div class="detail">${row.name} details</div>`}
            ></mdc-data-table>
        `)

        const expandBtn = el.shadowRoot?.querySelector('tbody tr:first-child .expand-button') as HTMLElement
        const eventPromise = oneEvent<CustomEvent<IMDCDataTableExpandChangeDetail<Dessert>>>(el, 'expand-change')
        expandBtn.click()
        const event = await eventPromise
        await el.updateComplete

        expect(event.detail.key).toBe('1')
        expect(event.detail.expanded).toBe(true)
        expect(el.expandedKeys).toEqual(['1'])
        expect(el.shadowRoot?.querySelector('tr.expanded-row .detail')?.textContent?.trim()).toBe('Frozen yogurt details')

        el.collapseRow('1')
        await el.updateComplete
        expect(el.expandedKeys).toEqual([])
        expect(el.shadowRoot?.querySelector('tr.expanded-row')).toBeNull()
    })

    it('filters rows by filterText, hides hidden columns, and supports getSelectedRows()', async () => {
        const colsWithHidden: IDataTableColumn<Dessert>[] = [
            ...Columns,
            { key: 'id', label: 'ID', hidden: true, sticky: 'end' },
        ]
        const el = await fixture<MDCDataTable<Dessert>>(html`
            <mdc-data-table
                selection-mode="single"
                filter-text="cup"
                .columns=${colsWithHidden}
                .rows=${Rows}
                .selectedKeys=${['4']}
            ></mdc-data-table>
        `)

        expect(el.shadowRoot?.querySelectorAll('thead th')).toHaveLength(3)
        const renderedRows = el.shadowRoot?.querySelectorAll('tbody tr')
        expect(renderedRows).toHaveLength(1)
        expect(renderedRows?.[0].querySelector('td')?.textContent?.trim()).toBe('Cupcake')
        expect(el.getSelectedRows().map((r) => r.name)).toEqual(['Cupcake'])
    })
})

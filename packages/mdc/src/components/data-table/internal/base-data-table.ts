/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, nothing, type TemplateResult } from 'lit'
import { property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { styleMap } from 'lit/directives/style-map.js'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { mixinElementInternals } from '../../../utils/behaviors/element-internals'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import '../../checkbox/checkbox'
import type { MDCCheckbox } from '../../checkbox/checkbox'
import '../../elevation/elevation'
import '../../icon/icon'
import '../../icon-button/icon-button'
import '../../pagination/pagination'
import type {
    IMDCPaginationPageChangeDetail,
    IMDCPaginationPageSizeChangeDetail,
} from '../../pagination/pagination.interface'
import '../../progress-indicator/progress-indicator'
import {
    DataTableExpandChangeEvent,
    DataTableRowClickEvent,
    DataTableSelectionChangeEvent,
    DataTableSelectionMode,
    DataTableSortChangeEvent,
    DataTableSortDirection,
    type DataTableRowRecord,
    type DataTableSize,
    type DataTableVariant,
    type IDataTableColumn,
    type IMDCDataTable,
    type IMDCDataTableExpandChangeDetail,
    type IMDCDataTableRowClickDetail,
    type IMDCDataTableSelectionChangeDetail,
    type IMDCDataTableSortChangeDetail,
} from '../data-table.interface'
import { DataTableStyles } from '../data-table.style'
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
} from './data-table-utils'

const DefaultPageSizeOptions = [10, 25, 50, 100]

export abstract class BaseDataTable<T extends DataTableRowRecord = DataTableRowRecord>
    extends composeMixin(mixinDelegatesAria, mixinElementInternals)(LitElement)
    implements IMDCDataTable<T> {

    public static override styles = DataTableStyles

    @property({ type: String, reflect: true })
    public variant: DataTableVariant = 'outlined'

    @property({ type: String, reflect: true })
    public size: DataTableSize = 'medium'

    @property({ attribute: false })
    public columns: IDataTableColumn<T>[] = []

    @property({ attribute: false })
    public rows: T[] = []

    @property({ attribute: false })
    public rowKey: string | ((row: T, index: number) => string) = 'id'

    @property({ attribute: false })
    public isRowDisabled: ((row: T, index: number) => boolean) | null = null

    @property({ type: String, attribute: 'selection-mode', reflect: true })
    public selectionMode: DataTableSelectionMode = 'none'

    @property({ attribute: false })
    public selectedKeys: string[] = []

    @property({ type: Boolean, attribute: 'row-selectable', reflect: true })
    public rowSelectable: boolean = false

    @property({ type: String, attribute: 'sort-by', reflect: true })
    public sortBy: string = ''

    @property({ type: String, attribute: 'sort-direction', reflect: true })
    public sortDirection: DataTableSortDirection = 'none'

    @property({ type: Boolean, attribute: 'manual-sort', reflect: true })
    public manualSort: boolean = false

    @property({ type: Boolean, reflect: true })
    public paginated: boolean = false

    @property({ type: Number, reflect: true })
    public page: number = 1

    @property({ type: Number, attribute: 'page-size', reflect: true })
    public pageSize: number = 10

    @property({
        type: Array,
        attribute: 'page-size-options',
        converter: {
            fromAttribute: (value: string | null): number[] => {
                if (!value) return DefaultPageSizeOptions
                return value
                    .split(',')
                    .map((v) => Number(v.trim()))
                    .filter((n) => Number.isFinite(n) && n > 0)
            },
        },
    })
    public pageSizeOptions: number[] = DefaultPageSizeOptions

    @property({ type: Number, attribute: 'total-items', reflect: true })
    public totalItems: number | null = null

    @property({ type: Boolean, attribute: 'manual-pagination', reflect: true })
    public manualPagination: boolean = false

    @property({ type: Boolean, reflect: true })
    public loading: boolean = false

    @property({ type: Boolean, attribute: 'sticky-header', reflect: true })
    public stickyHeader: boolean = false

    @property({ type: Boolean, reflect: true })
    public hoverable: boolean = true

    @property({ type: Boolean, reflect: true })
    public striped: boolean = false

    @property({ type: String, reflect: true })
    public override title: string = ''

    @property({ type: String, attribute: 'empty-text' })
    public emptyText: string = 'No data available'

    @property({ type: String })
    public label: string = ''

    @property({ type: String, attribute: 'select-all-label' })
    public selectAllLabel: string = 'Select all rows'

    @property({ type: String, attribute: 'clear-selection-label' })
    public clearSelectionLabel: string = 'Clear selection'

    @property({ attribute: false })
    public selectedCountFormatter: ((count: number) => string) | null = null

    @property({ type: Boolean, reflect: true })
    public expandable: boolean = false

    @property({ attribute: false })
    public expandedKeys: string[] = []

    @property({ attribute: false })
    public renderExpandedRow: ((row: T, index: number) => TemplateResult | string | typeof nothing) | null = null

    @property({ type: String, attribute: 'filter-text', reflect: true })
    public filterText: string = ''

    @property({ attribute: false })
    public filterFn: ((row: T, filterText: string, columns: readonly IDataTableColumn<T>[]) => boolean) | null = null

    @property({ type: Boolean, attribute: 'manual-filter', reflect: true })
    public manualFilter: boolean = false

    @property({ type: String, attribute: 'max-height', reflect: true })
    public maxHeight: string = ''

    @state()
    private hasHeaderSlot: boolean = false

    @state()
    private hasHeaderActionsSlot: boolean = false

    /**
     * Clears all selected row keys and dispatches a `selection-change` event.
     */
    public clearSelection(): void {
        if (this.selectedKeys.length === 0) return
        this.commitSelection([])
    }

    /**
     * Selects all non-disabled rows in the current dataset.
     */
    public selectAll(): void {
        if (this.selectionMode !== DataTableSelectionMode.Multiple) return
        const keys: string[] = []
        this.rows.forEach((row, index) => {
            if (this.isRowDisabled?.(row, index)) return
            keys.push(resolveRowKey(this.rowKey, index)(row))
        })
        this.commitSelection(keys)
    }

    /**
     * Returns the currently selected row objects.
     */
    public getSelectedRows(): T[] {
        const keySet = new Set(this.selectedKeys)
        return this.rows.filter((row, index) =>
            keySet.has(resolveRowKey(this.rowKey, index)(row)),
        )
    }

    /**
     * Expands the detail row for `key`.
     */
    public expandRow(key: string): void {
        this.commitExpansion(key, true)
    }

    /**
     * Collapses the detail row for `key`.
     */
    public collapseRow(key: string): void {
        this.commitExpansion(key, false)
    }

    /**
     * Toggles the detail row expansion state for `key`.
     */
    public toggleRowExpansion(key: string): void {
        this.commitExpansion(key)
    }

    protected override render(): TemplateResult {
        const visibleColumns = this.columns.filter((col) => !col.hidden)
        const { displayRows, filteredCount } = this.getProcessedRows()
        const resolvedRows = displayRows.map((row, index) => ({
            row,
            index,
            key: resolveRowKey(this.rowKey, index)(row),
            disabled: Boolean(this.isRowDisabled?.(row, index)),
        }))
        const selectableVisibleKeys = resolvedRows
            .filter((item) => !item.disabled)
            .map((item) => item.key)
        const selectAllState = computeSelectAllState(selectableVisibleKeys, this.selectedKeys)
        const hasSelection = this.selectionMode !== DataTableSelectionMode.None && this.selectedKeys.length > 0
        const showToolbar = Boolean(this.title) || this.hasHeaderSlot || this.hasHeaderActionsSlot || hasSelection

        return html`
            <div class=${classMap({
                'container': true,
                'is-hoverable': this.hoverable,
            })}>
                ${this.variant === 'elevated' ? html`<mdc-elevation></mdc-elevation>` : nothing}
                ${showToolbar ? this.renderToolbar(hasSelection) : nothing}
                <div
                    class="scroll-area"
                    style=${styleMap({
                        maxHeight: this.maxHeight || '',
                    })}
                >
                    ${this.loading
                        ? html`<mdc-progress-indicator class="loading-bar" variant="linear" indeterminate></mdc-progress-indicator>`
                        : nothing}
                    <table aria-label=${this.label || nothing}>
                        <thead>
                            <tr>
                                ${this.expandable ? html`<th class="expand-cell"></th>` : nothing}
                                ${this.selectionMode === DataTableSelectionMode.Multiple
                                    ? html`
                                        <th class="checkbox-cell">
                                            <mdc-checkbox
                                                aria-label=${this.selectAllLabel}
                                                .checked=${selectAllState.allSelected}
                                                .indeterminate=${selectAllState.indeterminate}
                                                ?disabled=${selectableVisibleKeys.length === 0}
                                                @change=${(e: Event) => this.handleSelectAllChange(e, selectableVisibleKeys, selectAllState.allSelected)}
                                            ></mdc-checkbox>
                                        </th>
                                    `
                                    : nothing}
                                ${visibleColumns.map((column) => this.renderHeaderCell(column))}
                            </tr>
                        </thead>
                        <tbody>
                            ${resolvedRows.length === 0
                                ? this.renderEmptyRow(visibleColumns.length)
                                : resolvedRows.map((item) => this.renderBodyRowGroup(item.row, item.key, item.index, item.disabled, visibleColumns))}
                        </tbody>
                    </table>
                </div>
                ${this.renderFooter(filteredCount)}
            </div>
        `
    }

    private renderToolbar(hasSelection: boolean): TemplateResult {
        const selectedLabel = this.selectedCountFormatter
            ? this.selectedCountFormatter(this.selectedKeys.length)
            : `${this.selectedKeys.length} selected`

        return html`
            <div class=${classMap({
                'toolbar': true,
                'is-selection-active': hasSelection,
            })}>
                <div class="toolbar-start">
                    ${hasSelection
                        ? html`<span class="selection-count">${selectedLabel}</span>`
                        : html`
                            ${this.title ? html`<h2 class="toolbar-title">${this.title}</h2>` : nothing}
                            <slot name="header" @slotchange=${this.handleHeaderSlotChange}></slot>
                        `}
                </div>
                <div class="toolbar-end">
                    ${hasSelection
                        ? html`
                            <slot name="selection-actions"></slot>
                            <mdc-icon-button
                                aria-label=${this.clearSelectionLabel}
                                @click=${() => this.clearSelection()}
                            >
                                <mdc-icon name="close"></mdc-icon>
                            </mdc-icon-button>
                        `
                        : html`<slot name="header-actions" @slotchange=${this.handleHeaderActionsSlotChange}></slot>`}
                </div>
            </div>
        `
    }

    private renderHeaderCell(column: IDataTableColumn<T>): TemplateResult {
        const align = resolveColumnAlign(column)
        const isSorted = this.sortBy === column.key && this.sortDirection !== DataTableSortDirection.None
        const ariaSort = column.sortable
            ? (isSorted ? this.sortDirection : DataTableSortDirection.None)
            : nothing
        const headerContent = column.renderHeader ? column.renderHeader(column) : column.label

        return html`
            <th
                scope="col"
                aria-sort=${ariaSort}
                class=${classMap({
                    [`align-${align}`]: true,
                    'is-numeric': Boolean(column.numeric),
                    'is-sorted': isSorted,
                    [`sort-${this.sortDirection}`]: isSorted,
                    'sticky-start': column.sticky === 'start',
                    'sticky-end': column.sticky === 'end',
                })}
                style=${styleMap({
                    width: column.width ?? '',
                    minWidth: column.minWidth ?? '',
                    maxWidth: column.maxWidth ?? '',
                })}
            >
                ${column.sortable
                    ? html`
                        <button
                            type="button"
                            class="sort-button"
                            @click=${() => this.handleSortClick(column)}
                        >
                            <span>${headerContent}</span>
                            <mdc-icon class="sort-icon" name="arrow_upward" aria-hidden="true"></mdc-icon>
                        </button>
                    `
                    : headerContent}
            </th>
        `
    }

    private renderBodyRowGroup(
        row: T,
        key: string,
        index: number,
        disabled: boolean,
        visibleColumns: readonly IDataTableColumn<T>[],
    ): TemplateResult {
        const selected = this.selectionMode !== DataTableSelectionMode.None && this.selectedKeys.includes(key)
        const canSelectByRow = this.selectionMode !== DataTableSelectionMode.None &&
            (this.rowSelectable || this.selectionMode === DataTableSelectionMode.Single) &&
            !disabled
        const expanded = this.expandable && this.expandedKeys.includes(key)
        const totalCols = visibleColumns.length +
            (this.selectionMode === DataTableSelectionMode.Multiple ? 1 : 0) +
            (this.expandable ? 1 : 0)

        return html`
            <tr
                class=${classMap({
                    'is-selected': selected,
                    'is-disabled': disabled,
                    'is-selectable': canSelectByRow,
                })}
                tabindex=${canSelectByRow ? '0' : nothing}
                aria-selected=${this.selectionMode !== DataTableSelectionMode.None ? String(selected) : nothing}
                @click=${(e: MouseEvent) => this.handleRowClick(e, row, key, index, disabled)}
                @keydown=${(e: KeyboardEvent) => this.handleRowKeyDown(e, key, disabled, canSelectByRow)}
            >
                ${this.expandable
                    ? html`
                        <td class="expand-cell" @click=${(e: Event) => e.stopPropagation()}>
                            <mdc-icon-button
                                class=${classMap({
                                    'expand-button': true,
                                    'is-expanded': expanded,
                                })}
                                aria-label=${expanded ? `Collapse row ${key}` : `Expand row ${key}`}
                                aria-expanded=${String(expanded)}
                                ?disabled=${disabled}
                                @click=${() => this.toggleRowExpansion(key)}
                            >
                                <mdc-icon class="expand-icon" name="keyboard_arrow_down"></mdc-icon>
                            </mdc-icon-button>
                        </td>
                    `
                    : nothing}
                ${this.selectionMode === DataTableSelectionMode.Multiple
                    ? html`
                        <td class="checkbox-cell" @click=${(e: Event) => e.stopPropagation()}>
                            <mdc-checkbox
                                aria-label=${`Select row ${key}`}
                                .checked=${selected}
                                ?disabled=${disabled}
                                @change=${() => this.handleRowCheckboxChange(key, disabled)}
                            ></mdc-checkbox>
                        </td>
                    `
                    : nothing}
                ${visibleColumns.map((column) => this.renderBodyCell(column, row, index))}
            </tr>
            ${expanded
                ? html`
                    <tr class="expanded-row">
                        <td class="expanded-cell" colspan=${Math.max(1, totalCols)}>
                            ${this.renderExpandedRow ? this.renderExpandedRow(row, index) : nothing}
                        </td>
                    </tr>
                `
                : nothing}
        `
    }

    private renderBodyCell(column: IDataTableColumn<T>, row: T, index: number): TemplateResult {
        const align = resolveColumnAlign(column)
        const rawValue = row[column.key]
        const content = column.renderCell
            ? column.renderCell(rawValue, row, index)
            : column.format
                ? column.format(rawValue, row, index)
                : (rawValue ?? '')

        return html`
            <td
                class=${classMap({
                    [`align-${align}`]: true,
                    'is-numeric': Boolean(column.numeric),
                    'is-ellipsis': Boolean(column.ellipsis),
                    'sticky-start': column.sticky === 'start',
                    'sticky-end': column.sticky === 'end',
                })}
                style=${styleMap({
                    width: column.width ?? '',
                    minWidth: column.minWidth ?? '',
                    maxWidth: column.maxWidth ?? '',
                })}
            >
                ${content}
            </td>
        `
    }

    private renderEmptyRow(visibleColumnCount: number): TemplateResult {
        const colSpan = visibleColumnCount +
            (this.selectionMode === DataTableSelectionMode.Multiple ? 1 : 0) +
            (this.expandable ? 1 : 0)
        return html`
            <tr class="empty-row">
                <td class="empty-cell" colspan=${Math.max(1, colSpan)}>
                    <slot name="empty">${this.emptyText}</slot>
                </td>
            </tr>
        `
    }

    private renderFooter(filteredCount: number): TemplateResult {
        if (!this.paginated) {
            return html`<div class="footer"><slot name="footer"></slot></div>`
        }
        const total = this.totalItems !== null ? this.totalItems : filteredCount
        return html`
            <div class="footer">
                <slot name="footer"></slot>
                <mdc-pagination
                    variant="compact"
                    .page=${this.page}
                    .pageSize=${this.pageSize}
                    .pageSizeOptions=${this.pageSizeOptions}
                    .totalItems=${total}
                    @page-change=${this.handlePaginationPageChange}
                    @page-size-change=${this.handlePaginationPageSizeChange}
                ></mdc-pagination>
            </div>
        `
    }

    private getProcessedRows(): { displayRows: T[]; filteredCount: number } {
        const filtered = (!this.manualFilter && this.filterText.trim())
            ? filterRows(this.filterText, this.columns, this.filterFn)(this.rows)
            : this.rows

        const sorted = (!this.manualSort && this.sortBy && this.sortDirection !== DataTableSortDirection.None)
            ? sortRows(this.sortBy, this.sortDirection, this.columns)(filtered)
            : filtered

        if (!this.paginated || this.manualPagination) {
            return { displayRows: sorted, filteredCount: sorted.length }
        }
        const safePageSize = Math.max(1, Math.floor(this.pageSize) || 10)
        const maxPage = Math.max(1, Math.ceil(sorted.length / safePageSize))
        const clampedPage = Math.min(Math.max(1, Math.floor(this.page) || 1), maxPage)
        return {
            displayRows: paginateRows(clampedPage, safePageSize)(sorted),
            filteredCount: sorted.length,
        }
    }

    private handleRowKeyDown(
        e: KeyboardEvent,
        key: string,
        disabled: boolean,
        canSelectByRow: boolean,
    ): void {
        if (!canSelectByRow || disabled) return
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            const nextKeys = toggleRowSelection(this.selectionMode, key, disabled)(this.selectedKeys)
            this.commitSelection(nextKeys)
        }
    }

    private commitExpansion(key: string, forceExpanded?: boolean): void {
        const nextKeys = toggleExpandedKey(key, forceExpanded)(this.expandedKeys)
        if (nextKeys.length === this.expandedKeys.length &&
            nextKeys.every((k, i) => k === this.expandedKeys[i])) {
            return
        }
        const expanded = nextKeys.includes(key)
        const keySet = new Set(nextKeys)
        const expandedRows = this.rows.filter((row, index) =>
            keySet.has(resolveRowKey(this.rowKey, index)(row)),
        )
        const detail: IMDCDataTableExpandChangeDetail<T> = {
            expandedKeys: nextKeys,
            expandedRows,
            key,
            expanded,
        }
        const event = new CustomEvent<IMDCDataTableExpandChangeDetail<T>>(DataTableExpandChangeEvent, {
            detail,
            bubbles: true,
            composed: true,
            cancelable: true,
        })
        if (!this.dispatchEvent(event)) return
        this.expandedKeys = nextKeys
    }

    private handleHeaderSlotChange(e: Event): void {
        const slot = e.target as HTMLSlotElement
        this.hasHeaderSlot = slot.assignedNodes({ flatten: true }).length > 0
    }

    private handleHeaderActionsSlotChange(e: Event): void {
        const slot = e.target as HTMLSlotElement
        this.hasHeaderActionsSlot = slot.assignedNodes({ flatten: true }).length > 0
    }

    private handleSortClick(column: IDataTableColumn<T>): void {
        if (!column.sortable) return
        const isSameColumn = this.sortBy === column.key
        const nextDirection = nextSortDirection(this.sortDirection, isSameColumn)
        const nextBy = nextDirection === DataTableSortDirection.None ? '' : column.key

        const detail: IMDCDataTableSortChangeDetail = {
            sortBy: nextBy,
            sortDirection: nextDirection,
            oldSortBy: this.sortBy,
            oldSortDirection: this.sortDirection,
        }
        const event = new CustomEvent<IMDCDataTableSortChangeDetail>(DataTableSortChangeEvent, {
            detail,
            bubbles: true,
            composed: true,
            cancelable: true,
        })
        if (!this.dispatchEvent(event)) return

        this.sortBy = nextBy
        this.sortDirection = nextDirection
    }

    private handleSelectAllChange(
        e: Event,
        selectableVisibleKeys: readonly string[],
        currentlyAllSelected: boolean,
    ): void {
        const checkbox = e.target as MDCCheckbox
        const nextKeys = toggleSelectAll(selectableVisibleKeys, currentlyAllSelected)(this.selectedKeys)
        if (!this.commitSelection(nextKeys)) {
            checkbox.checked = currentlyAllSelected
        }
    }

    private handleRowCheckboxChange(key: string, disabled: boolean): void {
        const nextKeys = toggleRowSelection(this.selectionMode, key, disabled)(this.selectedKeys)
        this.commitSelection(nextKeys)
    }

    private handleRowClick(
        e: MouseEvent,
        row: T,
        key: string,
        index: number,
        disabled: boolean,
    ): void {
        const clickDetail: IMDCDataTableRowClickDetail<T> = {
            row,
            rowKey: key,
            index,
            originalEvent: e,
        }
        this.dispatchEvent(
            new CustomEvent<IMDCDataTableRowClickDetail<T>>(DataTableRowClickEvent, {
                detail: clickDetail,
                bubbles: true,
                composed: true,
            }),
        )

        if (disabled || this.selectionMode === DataTableSelectionMode.None) return
        if (!this.rowSelectable && this.selectionMode !== DataTableSelectionMode.Single) return

        const target = e.target as HTMLElement | null
        if (target?.closest('a, button, input, select, textarea, mdc-checkbox, mdc-button, mdc-icon-button')) {
            return
        }

        const nextKeys = toggleRowSelection(this.selectionMode, key, disabled)(this.selectedKeys)
        this.commitSelection(nextKeys)
    }

    private commitSelection(nextKeys: string[]): boolean {
        const keySet = new Set(nextKeys)
        const selectedRows = this.rows.filter((row, index) =>
            keySet.has(resolveRowKey(this.rowKey, index)(row)),
        )
        const detail: IMDCDataTableSelectionChangeDetail<T> = {
            selectedKeys: nextKeys,
            selectedRows,
        }
        const event = new CustomEvent<IMDCDataTableSelectionChangeDetail<T>>(DataTableSelectionChangeEvent, {
            detail,
            bubbles: true,
            composed: true,
            cancelable: true,
        })
        if (!this.dispatchEvent(event)) return false
        this.selectedKeys = nextKeys
        return true
    }

    private handlePaginationPageChange(e: CustomEvent<IMDCPaginationPageChangeDetail>): void {
        e.stopPropagation()
        const forwarded = new CustomEvent<IMDCPaginationPageChangeDetail>('page-change', {
            detail: e.detail,
            bubbles: true,
            composed: true,
            cancelable: true,
        })
        if (!this.dispatchEvent(forwarded)) {
            e.preventDefault()
            return
        }
        this.page = e.detail.page
    }

    private handlePaginationPageSizeChange(e: CustomEvent<IMDCPaginationPageSizeChangeDetail>): void {
        e.stopPropagation()
        const forwarded = new CustomEvent<IMDCPaginationPageSizeChangeDetail>('page-size-change', {
            detail: e.detail,
            bubbles: true,
            composed: true,
            cancelable: true,
        })
        if (!this.dispatchEvent(forwarded)) {
            e.preventDefault()
            return
        }
        this.pageSize = e.detail.pageSize
        this.page = e.detail.page
    }
}

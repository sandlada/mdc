/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import type { DataTableRowRecord } from './data-table.interface'
import { BaseDataTable } from './internal/base-data-table'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-data-table': MDCDataTable
    }
}

/**
 * Material Design 3 Data Table (`<mdc-data-table>`).
 *
 * Displays structured tabular data with sorting, single/multiple row selection,
 * contextual selection bar, loading progress indicator, sticky headers, and
 * integrated `<mdc-pagination variant="compact">` footer.
 *
 * @element mdc-data-table
 * @slot header - Custom leading content in the table toolbar when no rows are selected.
 * @slot header-actions - Trailing actions in the table toolbar when no rows are selected.
 * @slot selection-actions - Contextual actions shown in the selection bar when rows are selected.
 * @slot empty - Custom empty-state content when `rows` is empty.
 * @slot footer - Custom footer content placed before the pagination control.
 *
 * @fires sort-change - Cancelable event dispatched when a sortable column header is clicked.
 * @fires selection-change - Cancelable event dispatched when row selection changes.
 * @fires row-click - Dispatched when a body row is clicked.
 * @fires expand-change - Cancelable event dispatched when a row is expanded or collapsed.
 * @fires page-change - Cancelable event dispatched when pagination page changes.
 * @fires page-size-change - Cancelable event dispatched when pagination page size changes.
 *
 * @version
 * Material Design 3
 */
@customElement('mdc-data-table')
export class MDCDataTable<T extends DataTableRowRecord = DataTableRowRecord> extends BaseDataTable<T> {}

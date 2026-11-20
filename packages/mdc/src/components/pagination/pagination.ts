/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BasePagination } from './internal/base-pagination'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-pagination': MDCPagination
    }
}

/**
 * Material Design 3 Expressive Pagination (`<mdc-pagination>`).
 *
 * Supports four layout variants:
 * - `standard` (default): Numbered page buttons with smart ellipsis, optional edges, range summary, page-size selector, and quick jumper.
 * - `compact`: Data-table footer with page-size selector, range summary, and navigation icon buttons.
 * - `simple`: Compact stepper (`< 5 / 20 >`).
 * - `dots`: Android `HorizontalPager` / Expressive morphing pill & dot indicator.
 *
 * @element mdc-pagination
 * @fires page-change - Cancelable event dispatched before committing a page change.
 * @fires page-size-change - Dispatched when `pageSize` changes via the selector.
 *
 * @version
 * Material Design 3 - Expressive
 */
@customElement('mdc-pagination')
export class MDCPagination extends BasePagination {}

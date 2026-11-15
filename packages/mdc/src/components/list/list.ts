/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseList } from './internal/base-list'

/**
 * A Material Design 3 Expressive list container.
 *
 * Supports `standard` and `segmented` visual variants, optional `single` / `multiple`
 * selection management, and roving tabindex keyboard navigation across its
 * `mdc-list-item` children:
 *
 * - `ArrowUp` / `ArrowDown` (and `ArrowLeft` / `ArrowRight` in RTL) move focus,
 * - `Home` / `End` jump to the first / last focusable item,
 * - disabled and `type="text"` items are skipped,
 * - exactly one interactive item is kept in the tab order.
 *
 * @element mdc-list
 * @slot - slotted `mdc-list-item` children (optionally separated by `mdc-divider`)
 *
 * @fires list-selection-change - Dispatched when selection changes in `single` or `multiple` mode.
 *
 * @cssproperty --mdc-list-enabled-standard-gap
 * @cssproperty --mdc-list-enabled-segmented-gap
 * @cssproperty --mdc-list-enabled-divider-color
 *
 * @link
 * https://m3.material.io/components/lists/specs
 *
 * @example
 * ```html
 * <mdc-list variant="segmented" selection-mode="single" aria-label="Settings">
 *     <mdc-list-item type="button" selected>Wi-Fi</mdc-list-item>
 *     <mdc-list-item type="button">Bluetooth</mdc-list-item>
 * </mdc-list>
 * ```
 */
@customElement('mdc-list')
export class MDCList extends BaseList {
}

declare global {
    interface HTMLElementTagNameMap {
        'mdc-list': MDCList
    }
}

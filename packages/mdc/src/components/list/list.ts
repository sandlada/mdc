/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseList } from './internal/base-list'

/**
 * A Material Design 3 list container.
 *
 * Owns roving tabindex and keyboard navigation across its `mdc-list-item`
 * children:
 *
 * - `ArrowUp` / `ArrowDown` (and `ArrowLeft` / `ArrowRight` in RTL) move focus,
 * - `Home` / `End` jump to the first / last focusable item,
 * - disabled and `type="text"` items are skipped,
 * - exactly one interactive item is kept in the tab order.
 *
 * @element mdc-list
 * @slot - slotted `mdc-list-item` children
 *
 * @example
 * ```html
 * <mdc-list aria-label="Settings">
 *     <mdc-list-item type="button">Account</mdc-list-item>
 *     <mdc-list-item type="button">Security</mdc-list-item>
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

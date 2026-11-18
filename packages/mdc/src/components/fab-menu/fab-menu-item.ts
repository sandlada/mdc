/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { FabMenuItemStyles } from './fab-menu-item.style'
import { BaseFabMenuItem } from './internal/base-fab-menu-item'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-fab-menu-item': MDCFabMenuItem
    }
}

/**
 * An action item inside `<mdc-fab-menu>`.
 *
 * Uses the Material Design 3 Expressive medium pill button metrics (56dp
 * height, full corner radius, 24dp horizontal padding, 24dp leading icon,
 * TitleMedium label).
 *
 * @element mdc-fab-menu-item
 *
 * @slot - The item label text.
 * @slot icon - Optional leading 24dp icon.
 *
 * @fires fab-menu-item-select - Dispatched when the item is activated (bubbles, composed, cancelable).
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/fab-menu/specs
 */
@customElement('mdc-fab-menu-item')
export class MDCFabMenuItem extends BaseFabMenuItem {
    static override styles = FabMenuItemStyles
}

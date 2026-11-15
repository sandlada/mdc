/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseMenuItem } from './internal/base-menu-item'

/**
 * A Material Design 3 Expressive menu row (static render shell).
 *
 * Renders `link` → `<a>`, `button` → `<button>`, `text` → `<li>`; setting
 * `href` forces `type` to `link`. The 48dp row uses label-large with 20dp
 * icons; `selected` applies the tertiary-container highlight in both
 * color-styles (selected through the reflected `variant` attribute).
 *
 * @element mdc-menu-item
 * @slot - The item label.
 * @slot leading - Leading icon / check mark.
 * @slot trailing - Trailing icon / shortcut / badge.
 * @slot supporting - Supporting text under the label.
 *
 * @fires request-activation - Dispatched when the item is activated
 * (bubbles + composed), asking the parent `mdc-menu` to promote it to the
 * roving tabindex slot.
 * @fires item-activated - Dispatched when the item is activated
 * (bubbles + composed).
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/menus/specs
 */
@customElement('mdc-menu-item')
export class MDCMenuItem extends BaseMenuItem {

    protected override getHostClasses(): Record<string, boolean> {
        return {
            ...super.getHostClasses(),
            [`variant-${this.variant}`]: true,
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mdc-menu-item': MDCMenuItem
    }
}

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseListItem } from './internal/base-list-item'

/**
 * A Material Design 3 list row.
 *
 * The item renders one of three native roots depending on `type`:
 * `link` → `<a>`, `button` → `<button>`, `text` → `<li>`. Setting `href`
 * forces `type` to `link`. Interactive items show a ripple and focus-ring;
 * `text` items are non-interactive and host a `control` slot (e.g. checkbox).
 *
 * @element mdc-list-item
 * @slot - The primary headline text.
 * @slot start - Leading element (icon / avatar), button & link items.
 * @slot control - Leading control (checkbox / radio / switch), text items.
 * @slot overline - Overline text above the headline (three-line items).
 * @slot headline - Explicit headline text (overrides the default slot).
 * @slot supporting-text - Supporting text below the headline.
 * @slot trailing-supporting-text - Trailing supporting text (right column).
 * @slot end - Trailing element (icon / menu / chevron).
 *
 * @fires request-activation - Dispatched when the item is activated
 * (bubbles + composed), asking the parent `mdc-list` to promote it to the
 * roving tabindex slot.
 *
 * @cssproperty --mdc-list-item-one-line-container-height
 * @cssproperty --mdc-list-item-two-line-container-height
 * @cssproperty --mdc-list-item-three-line-container-height
 * @cssproperty --mdc-list-item-enabled-container-color
 * @cssproperty --mdc-list-item-enabled-container-color-selected
 * @cssproperty --mdc-list-item-enabled-label-color
 * @cssproperty --mdc-list-item-enabled-label-color-selected
 * @cssproperty --mdc-list-item-leading-icon-size
 * @cssproperty --mdc-list-item-hovered-state-layer-color
 * @cssproperty --mdc-list-item-hovered-state-layer-opacity
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/lists/overview
 */
@customElement('mdc-list-item')
export class MDCListItem extends BaseListItem {
}

declare global {
    interface HTMLElementTagNameMap {
        'mdc-list-item': MDCListItem
    }
}

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseListItem } from './internal/base-list-item'

/**
 * A Material Design 3 Expressive list row.
 *
 * The item renders one of three native roots depending on `type`:
 * `link` → `<a>`, `button` → `<button>`, `text` → `<li>`. Setting `href`
 * forces `type` to `link`. Interactive items show a ripple, focus-ring,
 * and expressive corner morphing in `segmented` lists.
 *
 * @element mdc-list-item
 * @slot - The primary headline text.
 * @slot start - Leading element (icon / avatar / image / video).
 * @slot control - Leading control (checkbox / radio / switch), text items.
 * @slot overline - Overline text above the headline (three-line items).
 * @slot headline - Explicit headline text (overrides the default slot).
 * @slot supporting-text - Supporting text below the headline.
 * @slot trailing-supporting-text - Trailing supporting text (right column).
 * @slot end - Trailing element (icon / menu / chevron).
 * @slot swipe-start - Action elements revealed when swiping toward inline-end.
 * @slot swipe-end - Action elements revealed when swiping toward inline-start.
 * @slot children - Nested `mdc-list-item` children revealed when `expanded` is true.
 *
 * @fires request-activation - Dispatched when the item is activated
 * (bubbles + composed), asking the parent `mdc-list` to promote it to the
 * roving tabindex slot and update selection.
 * @fires list-item-expand-change - Dispatched when an expandable item toggles `expanded`.
 * @fires list-item-swipe-change - Dispatched when swipe reveal state changes (`closed`, `open-start`, `open-end`).
 * @fires list-item-swipe-action - Dispatched when a swipe-to-reveal action is triggered by full-swipe or click.
 *
 * @link
 * https://m3.material.io/components/lists/specs
 */
@customElement('mdc-list-item')
export class MDCListItem extends BaseListItem {
}

declare global {
    interface HTMLElementTagNameMap {
        'mdc-list-item': MDCListItem
    }
}

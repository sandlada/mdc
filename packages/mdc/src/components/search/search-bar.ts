/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseSearchBar } from './internal/base-search-bar'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-search-bar': MDCSearchBar
    }
}

/**
 * @element mdc-search-bar
 *
 * Material Design 3 pill-shaped search bar.
 * Coordinates with `mdc-search-view` via `for` or `searchView` / `setupWithSearchBar()`,
 * or operates standalone for inline search input.
 *
 * @slot leading-icon — Optional leading icon button (e.g., `search` or `menu`).
 * @slot trailing-icon — Optional trailing icon buttons (e.g., `mic`, `tune`).
 * @slot avatar — Optional custom avatar element; defaults to an account icon button.
 *
 * @fires input — Fired when the query value changes (standalone mode).
 * @fires change — Fired when the input commits a change (standalone mode).
 * @fires search — Fired when the user submits with Enter (standalone mode).
 * @fires avatar-click — Fired when the default avatar button is clicked.
 */
@customElement('mdc-search-bar')
export class MDCSearchBar extends BaseSearchBar {}

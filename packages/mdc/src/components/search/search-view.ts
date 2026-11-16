/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseSearchView } from './internal/base-search-view'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-search-view': MDCSearchView
    }
}

/**
 * @element mdc-search-view
 *
 * Material Design 3 expanded search view (`fullscreen` or `docked`).
 * Coordinates with `mdc-search-bar` via `for`, `searchBar`, or `setupWithSearchBar()`.
 *
 * @slot — Search suggestions, recent history, or results (e.g. `mdc-list`).
 * @slot leading-icon — Optional custom back/navigation icon button.
 * @slot trailing-icon — Optional trailing icon buttons (e.g. `mic`, `more_vert`).
 *
 * @fires open — Cancelable event fired before opening.
 * @fires opened — Fired after opening.
 * @fires close — Cancelable event fired before closing.
 * @fires closed — Fired after closing.
 * @fires input — Fired when the query value changes.
 * @fires change — Fired when the input commits a change.
 * @fires search — Fired when the user submits with Enter.
 * @fires clear — Fired when the clear button is clicked.
 */
@customElement('mdc-search-view')
export class MDCSearchView extends BaseSearchView {}

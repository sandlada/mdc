/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/** Layout variants for `mdc-search-view`, matching Material Design 3 / Android. */
export const SearchViewVariant = {
    Fullscreen: 'fullscreen',
    Docked: 'docked',
} as const
export type SearchViewVariant = (typeof SearchViewVariant)[keyof typeof SearchViewVariant]

export interface ISearchValueEventDetail {
    value: string
}

export interface ISearchAvatarClickDetail {
    target: HTMLElement | null
    currentTarget: IMDCSearchBar
}

/** Input attributes for `mdc-search-bar`. */
export interface IMDCSearchBarAttributes {
    /** Placeholder / supporting text displayed when `value` is empty. */
    supportingText: string
    /** Hides the default leading search icon when no custom `leading-icon` is slotted. */
    hideLeadingIcon: boolean
    /** Hides the trailing avatar button/slot when true. */
    hideAvatar: boolean
    /** Current query text. Syncs bidirectionally with a linked `mdc-search-view`. */
    value: string
    /** ID of an `mdc-search-view` in the same root node to coordinate with. */
    for: string
    /** Disables user interaction with the search bar. */
    disabled: boolean
}

/** Custom events emitted by `mdc-search-bar`. */
export interface IMDCSearchBarEvents {
    'input': CustomEvent<ISearchValueEventDetail>
    'change': CustomEvent<ISearchValueEventDetail>
    'search': CustomEvent<ISearchValueEventDetail>
    'avatar-click': CustomEvent<ISearchAvatarClickDetail>
}

/**
 * `mdc-search-bar` — Material Design 3 pill-shaped search bar.
 *
 * Works standalone for inline search input, or coordinates with an
 * `mdc-search-view` (via `for` or `searchView` / `setupWithSearchBar()`)
 * to expand into a full-screen or docked search view on activation.
 */
export interface IMDCSearchBar extends LitElement, IMDCSearchBarAttributes {
    /** Linked `mdc-search-view` instance, if any. */
    searchView: IMDCSearchView | null
    /** Notifies the bar that its linked `SearchView` state changed. */
    syncFromSearchView(value: string, open: boolean): void
}

/** Input attributes for `mdc-search-view`. */
export interface IMDCSearchViewAttributes {
    /** Whether the search view is currently open. */
    open: boolean
    /** Presentation mode: `'fullscreen'` (default) or `'docked'`. */
    variant: SearchViewVariant
    /** Placeholder text inside the search view input. */
    supportingText: string
    /** Current query text. Syncs bidirectionally with a linked `mdc-search-bar`. */
    value: string
    /** ID of an `mdc-search-bar` in the same root node to bind to. */
    for: string
    /** Skips open/close motion transitions when true. */
    quick: boolean
}

/** Custom events emitted by `mdc-search-view`. */
export interface IMDCSearchViewEvents {
    'open': Event
    'opened': Event
    'close': Event
    'closed': Event
    'input': CustomEvent<ISearchValueEventDetail>
    'change': CustomEvent<ISearchValueEventDetail>
    'search': CustomEvent<ISearchValueEventDetail>
    'clear': CustomEvent<ISearchValueEventDetail>
}

/**
 * `mdc-search-view` — Material Design 3 expanded search view (fullscreen or docked).
 */
export interface IMDCSearchView extends LitElement, IMDCSearchViewAttributes {
    /** Linked `mdc-search-bar` instance, if any. */
    searchBar: IMDCSearchBar | null
    /** Opens the search view and focuses its input. */
    show(): void
    /** Closes the search view and restores focus to its linked `mdc-search-bar`. */
    close(): void
    /** Binds this search view to a `SearchBar` instance (Android `setupWithSearchBar` parity). */
    setupWithSearchBar(searchBar: IMDCSearchBar | null): void
}

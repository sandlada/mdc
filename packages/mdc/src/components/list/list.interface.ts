/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Visual variants of `mdc-list`.
 *
 * - `standard`  — continuous vertical list without inter-item gaps.
 * - `segmented` — MD3 Expressive segmented list with 2dp gaps and position-aware
 *                 corner morphing (`16dp` outer, `4dp` inner).
 */
export const ListVariants = ['standard', 'segmented'] as const
export type ListVariant = (typeof ListVariants)[number]

/**
 * Selection models enforced by `mdc-list`.
 *
 * - `none`     — action list without automatic selection management.
 * - `single`   — single-selection (`role="listbox"` / `role="option"`).
 * - `multiple` — multi-selection (`aria-multiselectable="true"`).
 */
export const ListSelectionModes = ['none', 'single', 'multiple'] as const
export type ListSelectionMode = (typeof ListSelectionModes)[number]

/**
 * The interactive role of an `mdc-list-item`.
 *
 * - `text`   — non-interactive label row (may host a `control` slot, e.g. checkbox).
 * - `button` — native `<button>` root, activates on Enter / Space / click.
 * - `link`   — native `<a>` root, navigates to `href`. Forced automatically when
 *              `href` is set, and never disabled.
 */
export const ListItemTypes = ['text', 'button', 'link'] as const
export type ListItemType = (typeof ListItemTypes)[number]

/**
 * Structural position of an `mdc-list-item` within a contiguous segmented run.
 */
export const ListItemPositions = ['single', 'first', 'middle', 'last'] as const
export type ListItemPosition = (typeof ListItemPositions)[number]

/**
 * The element name of list items, used by `mdc-list` to discover slotted children.
 */
export const ListItemSelector = 'mdc-list-item'

/**
 * Dispatched (bubbles + composed) when a button / link item is activated (clicked or
 * Enter / Space). The list listens, promotes the activating item to the roving
 * tabindex slot, and updates selection when `selectionMode` is not `none`.
 */
export const ListItemRequestActivationEvent = 'request-activation'

/**
 * Dispatched (bubbles + composed) when selection changes within an `mdc-list`.
 */
export const ListSelectionChangeEvent = 'list-selection-change'

/**
 * Dispatched (bubbles + composed) when an expandable `mdc-list-item` toggles its
 * `expanded` state.
 */
export const ListItemExpandChangeEvent = 'list-item-expand-change'

export interface IMDCListSelectionChangeDetail {
    /** The item whose selection changed. */
    item: IMDCListItem
    /** Whether the item is now selected. */
    selected: boolean
    /** Zero-based index of the item within `items`. */
    index: number
    /** All currently selected items in the list. */
    selectedItems: IMDCListItem[]
    /** All currently selected indices in the list. */
    selectedIndexes: number[]
}

export interface IMDCListAttributes {
    /** Visual variant: `'standard'` | `'segmented'`. */
    variant: ListVariant
    /** Selection mode: `'none'` | `'single'` | `'multiple'`. */
    selectionMode: ListSelectionMode
    /** When true in single-selection mode, prevents deselecting the active item. */
    selectionRequired: boolean
    /** Disables all interactive items in the list. */
    disabled: boolean
}

export interface IMDCListEvents {
    [ListSelectionChangeEvent]: CustomEvent<IMDCListSelectionChangeDetail>
}

export interface IMDCList extends LitElement, IMDCListAttributes {
    /** The slotted `mdc-list-item` children, flattened. */
    readonly items: IMDCListItem[]
    /** Currently selected `mdc-list-item` children. */
    readonly selectedItems: IMDCListItem[]
    /** Zero-based indices of currently selected items. */
    readonly selectedIndexes: number[]

    /** Focuses the next focusable item (wrap-around). */
    activateNextItem(): void

    /** Focuses the previous focusable item (wrap-around). */
    activatePreviousItem(): void
}

export interface IMDCListItemAttributes {
    /** The interactive role of the item. */
    type: ListItemType
    /** Disables the item. Link items are never disabled. */
    disabled: boolean
    /** The destination URL. Forces `type` to `link` when set. */
    href: string
    /** The target of the link (e.g. `_blank`). */
    target: string
    /** Marks the item as selected (MD3 secondary-container highlight). */
    selected: boolean
    /** Visual variant synced from parent `mdc-list` or set directly. */
    variant: ListVariant
    /** Position within a contiguous segmented run (`single`, `first`, `middle`, `last`). */
    position: ListItemPosition
    /** Selection mode synced from parent `mdc-list` for ARIA role projection. */
    selectionMode: ListSelectionMode
    /** Whether the item can expand/collapse child items. */
    expandable: boolean
    /** Whether the item's `children` slot is currently expanded. */
    expanded: boolean
    /** Roving tabindex value assigned by the parent `mdc-list`. */
    listTabIndex: number
}

export interface IMDCListItemRequestActivationEventDetail {
    item: IMDCListItem
}

export interface IMDCListItemExpandChangeDetail {
    item: IMDCListItem
    expanded: boolean
}

export interface IMDCListItemEvents {
    [ListItemRequestActivationEvent]: CustomEvent<IMDCListItemRequestActivationEventDetail>
    [ListItemExpandChangeEvent]: CustomEvent<IMDCListItemExpandChangeDetail>
}

export interface IMDCListItem extends LitElement, IMDCListItemAttributes {
    /** Slotted child `mdc-list-item` elements in the `children` slot. */
    readonly childItems: IMDCListItem[]

    /** Whether the item can expand (`expandable` attribute or has child items). */
    readonly isExpandable: boolean

    /** Whether the item is interactive (`button` or `link` type). */
    readonly isInteractive: boolean

    /** Whether the item is disabled (always false for `link` items). */
    readonly isDisabled: boolean

    /** Focuses the item's root element. */
    focus(): void

    /** Clicks the item's root element. */
    click(): void
}

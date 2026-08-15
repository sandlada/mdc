/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * The interactive role of an `mdc-list-item`.
 *
 * - `text`    — non-interactive label row (may host a `control` slot, e.g. checkbox).
 * - `button`  — native `<button>` root, activates on Enter / Space / click.
 * - `link`    — native `<a>` root, navigates to `href`. Forced automatically when
 *               `href` is set, and never disabled.
 */
export type ListItemType = 'text' | 'button' | 'link'

export const LIST_ITEM_TYPE = {
    TEXT: 'text',
    BUTTON: 'button',
    LINK: 'link',
} as const

/**
 * The element name of list items, used by `mdc-list` to discover slotted children.
 */
export const LIST_ITEM_SELECTOR = 'mdc-list-item'

/**
 * Dispatched (bubbles + composed) when a button / link item is activated (clicked or
 * Enter / Space). The list listens and promotes the activating item to the roving
 * tabindex slot.
 */
export const LIST_ITEM_REQUEST_ACTIVATION_EVENT = 'request-activation'

export interface IList extends LitElement {
    /** The slotted `mdc-list-item` children, flattened. */
    readonly items: IListItem[]

    /** Focuses the next focusable item (wrap-around). */
    activateNextItem(): void

    /** Focuses the previous focusable item (wrap-around). */
    activatePreviousItem(): void
}

export interface IListItem extends LitElement {
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

    /** Roving tabindex value assigned by the parent `mdc-list`. */
    listTabIndex: number

    /** Whether the item is interactive (`button` or `link` type). */
    readonly isInteractive: boolean

    /** Whether the item is disabled (always false for `link` items). */
    readonly isDisabled: boolean

    /** Focuses the item's root element. */
    focus(): void

    /** Clicks the item's root element. */
    click(): void
}

export interface IListItemRequestActivationEventDetail {
    item: IListItem
}

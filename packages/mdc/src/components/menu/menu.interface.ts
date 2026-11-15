/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Expressive color-style axis for `mdc-menu` and its trio.
 *
 * - `standard` — surface-container-low container, on-surface content.
 * - `vibrant`   — tertiary-container container, on-tertiary-container content.
 */
export const MenuColorStyle = {
    Standard: 'standard',
    Vibrant: 'vibrant',
} as const
export type MenuColorStyle = (typeof MenuColorStyle)[keyof typeof MenuColorStyle]

/**
 * Expressive layout axis for `mdc-menu`.
 *
 * - `standard` — single flat item list.
 * - `grouped`  — web grouped = single surface with divider / label slots.
 *                There are no gap surfaces on web; inset gaps are Android-only.
 */
export const MenuLayout = {
    Standard: 'standard',
    Grouped: 'grouped',
} as const
export type MenuLayout = (typeof MenuLayout)[keyof typeof MenuLayout]

/**
 * Placement of the menu surface relative to its anchor.
 * Mirrors @floating-ui/dom Placement values.
 */
export type MenuPlacement =
    | 'top' | 'top-start' | 'top-end'
    | 'bottom' | 'bottom-start' | 'bottom-end'
    | 'left' | 'left-start' | 'left-end'
    | 'right' | 'right-start' | 'right-end'

/**
 * The interactive role of an `mdc-menu-item`.
 *
 * - `text`   — non-interactive label row.
 * - `button` — native `<button>` root, activates on Enter / Space / click.
 * - `link`   — native `<a>` root, navigates to `href`. Forced automatically when
 *              `href` is set, and never disabled.
 */
export const MenuItemType = {
    Text: 'text',
    Button: 'button',
    Link: 'link',
} as const
export type MenuItemType = (typeof MenuItemType)[keyof typeof MenuItemType]

/**
 * Dispatched (bubbles + composed) when a button / link item is activated
 * (clicked or Enter / Space). The menu listens and promotes the activating
 * item to the roving tabindex slot.
 */
export const MenuRequestActivationEvent = 'request-activation'

export interface IMDCMenuAttributes {
    /** Whether the menu surface is open. */
    open: boolean
    /** Skips opening and closing animations. */
    quick: boolean
    /** Preferred placement of the surface relative to the anchor. */
    placement: MenuPlacement
    /** Expressive color-style axis. Defaults to `standard`. */
    colorStyle: MenuColorStyle
    /** Expressive layout axis. Defaults to `standard`. */
    layout: MenuLayout
    /** Accessible name of the menu (aria-label). */
    label: string | null
}

export interface IMDCMenuSelectDetail {
    item: IMDCMenuItem
}

export interface IMDCMenuOpenedDetail {
    menu: IMDCMenu
}

export interface IMDCMenuClosedDetail {
    menu: IMDCMenu
}

export interface IMDCMenuRequestActivationDetail {
    item: IMDCMenuItem
}

export interface IMDCMenuEvents {
    'opened': CustomEvent<IMDCMenuOpenedDetail>
    'closed': CustomEvent<IMDCMenuClosedDetail>
    'select': CustomEvent<IMDCMenuSelectDetail>
    'request-activation': CustomEvent<IMDCMenuRequestActivationDetail>
}

/**
 * Expressive menu component contract.
 *
 * Material Design 3 Expressive.
 *
 * @slot - The `mdc-menu-item` / `mdc-menu-submenu` children.
 * @slot trigger - The anchor element that toggles the menu.
 * @slot surface - The menu surface wrapper (optional override).
 * @slot section-label - Group labels, only used when `layout` is `grouped`.
 *
 * @link
 * https://m3.material.io/components/menus/specs
 */
export interface IMDCMenu extends LitElement, IMDCMenuAttributes {
    /** The slotted `mdc-menu-item` children, flattened. */
    readonly items: IMDCMenuItem[]
    /** Opens the menu. */
    show(): Promise<void>
    /** Closes the menu. */
    hide(): Promise<void>
    /** Closes the menu (alias to hide for @material/web parity). */
    close(): Promise<void>
    /** Toggles the menu between open and closed. */
    toggle(): Promise<void>
    /** Focuses the next focusable item (wrap-around). */
    activateNextItem(): void
    /** Focuses the previous focusable item (wrap-around). */
    activatePreviousItem(): void
}

export interface IMDCMenuItemAttributes {
    /** The interactive role of the item. Defaults to `button`. */
    type: MenuItemType
    /** Disables the item. Link items are never disabled. */
    disabled: boolean
    /** The destination URL. Forces `type` to `link` when set. */
    href: string
    /** The target of the link (e.g. `_blank`). */
    target: string
    /** Marks the item as selected (M3E tertiary-container highlight). */
    selected: boolean
    /** Whether the item is checkable (menuitemcheckbox role). */
    checkable: boolean
    /** Whether the item is a radio option (menuitemradio role). */
    radio: boolean
    /** Selection value emitted with activation. */
    value: string
    /** Keyboard shortcut hint (aria-keyshortcuts). */
    shortcut: string | null
    /** Badge text displayed in the trailing slot. */
    badge: string | number | null
    /** Roving tabindex value assigned by the parent `mdc-menu`. */
    listTabIndex: number
}

export interface IMDCMenuItemActivatedDetail {
    item: IMDCMenuItem
    /** Selection value emitted with activation. */
    value: string
}

export interface IMDCMenuItemRequestActivationDetail {
    item: IMDCMenuItem
}

export interface IMDCMenuItemEvents {
    'request-activation': CustomEvent<IMDCMenuItemRequestActivationDetail>
    'item-activated': CustomEvent<IMDCMenuItemActivatedDetail>
}

/**
 * Expressive menu-item component contract.
 *
 * Material Design 3 Expressive.
 *
 * @slot - The item label.
 * @slot leading - Leading icon / check mark.
 * @slot trailing - Trailing icon / shortcut / badge.
 * @slot supporting - Supporting text under the label.
 *
 * @link
 * https://m3.material.io/components/menus/specs
 */
export interface IMDCMenuItem extends LitElement, IMDCMenuItemAttributes {
    /** Whether the item is interactive (`button` or `link` type). */
    readonly isInteractive: boolean
    /** Whether the item is disabled (always false for `link` items). */
    readonly isDisabled: boolean
    /** Focuses the item's root element. */
    focus(): void
    /** Clicks the item's root element. */
    click(): void
}

export interface IMDCMenuSubmenuAttributes {
    /** Visible label of the submenu trigger item. */
    label: string
    /** Disables the submenu trigger. */
    disabled: boolean
    /** Skips opening and closing animations. */
    quick: boolean
    /** Preferred placement of the nested surface. Defaults to `right-start`. */
    placement: MenuPlacement
    /** Whether the nested surface is open. */
    open: boolean
    /**
     * Hover-intent delay in ms before opening.
     * Defaults to 120. Spec-TODO(C4): no M3 value, pending sign-off.
     */
    openDelay: number
    /**
     * Hover-intent delay in ms before closing.
     * Defaults to 220. Spec-TODO(C4): no M3 value, pending sign-off.
     */
    closeDelay: number
}

export interface IMDCMenuSubmenuOpenedDetail {
    submenu: IMDCMenuSubmenu
}

export interface IMDCMenuSubmenuClosedDetail {
    submenu: IMDCMenuSubmenu
}

export interface IMDCMenuSubmenuEvents {
    'submenu-opened': CustomEvent<IMDCMenuSubmenuOpenedDetail>
    'submenu-closed': CustomEvent<IMDCMenuSubmenuClosedDetail>
}

/**
 * Expressive menu-submenu component contract.
 *
 * Right / Enter opens, Left / Escape closes and refocuses the trigger.
 * RTL mirrors the default `right-start` placement.
 *
 * Material Design 3 Expressive.
 *
 * @link
 * https://m3.material.io/components/menus/specs
 */
export interface IMDCMenuSubmenu extends LitElement, IMDCMenuSubmenuAttributes {
    /** Opens the nested surface. */
    show(): Promise<void>
    /** Closes the nested surface. */
    hide(): Promise<void>
}

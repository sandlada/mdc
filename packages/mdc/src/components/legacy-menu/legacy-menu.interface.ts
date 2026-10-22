/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Color style of an `mdc-legacy-menu`.
 *
 * Legacy MD3 Baseline menus support only `standard`. Assigning any other
 * color style (e.g. `vibrant`) must throw via `assertLegacyMenuVariant` —
 * never fall back silently.
 */
export type LegacyMenuColorStyle = 'standard'

export const LEGACY_MENU_COLOR_STYLE = {
    STANDARD: 'standard',
} as const satisfies Record<string, LegacyMenuColorStyle>

/**
 * Layout of an `mdc-legacy-menu`.
 *
 * Legacy MD3 Baseline menus support only `standard`. Assigning any other
 * layout (e.g. `grouped`) must throw via `assertLegacyMenuLayout` — never
 * fall back silently. On web, grouped content is expressed with divider and
 * label slots inside a single standard surface.
 */
export type LegacyMenuLayout = 'standard'

export const LEGACY_MENU_LAYOUT = {
    STANDARD: 'standard',
} as const satisfies Record<string, LegacyMenuLayout>

/**
 * Placement of the legacy menu surface relative to its anchor.
 * Mirrors @floating-ui/dom Placement values.
 */
export type LegacyMenuPlacement =
    | 'top' | 'top-start' | 'top-end'
    | 'bottom' | 'bottom-start' | 'bottom-end'
    | 'left' | 'left-start' | 'left-end'
    | 'right' | 'right-start' | 'right-end'

/**
 * The interactive role of an `mdc-legacy-menu-item`.
 *
 * - `text`   — non-interactive label row.
 * - `button` — native `<button>` root, activates on Enter / Space / click.
 * - `link`   — native `<a>` root, navigates to `href`. Forced automatically
 *              when `href` is set, and never disabled.
 */
export type LegacyMenuItemType = 'text' | 'button' | 'link'

export const LEGACY_MENU_ITEM_TYPE = {
    TEXT  : 'text',
    BUTTON: 'button',
    LINK  : 'link',
} as const satisfies Record<string, LegacyMenuItemType>

/**
 * Element names of the legacy menu trio, used to discover slotted children.
 */
export const LEGACY_MENU_ELEMENT          = 'mdc-legacy-menu'
export const LEGACY_MENU_ITEM_ELEMENT     = 'mdc-legacy-menu-item'
export const LEGACY_MENU_SUBMENU_ELEMENT  = 'mdc-legacy-menu-submenu'

/**
 * Dispatched (bubbles + composed) when a button / link item is activated
 * (clicked or Enter / Space). The menu listens and promotes the activating
 * item to the roving tabindex slot.
 */
export const LEGACY_MENU_REQUEST_ACTIVATION_EVENT = 'request-activation'

export interface IMDCLegacyMenuAttributes {
    /** Whether the menu surface is open. */
    open: boolean

    /** Reduces motion for open / close transitions. */
    quick: boolean

    /** Floating-UI placement of the surface relative to the trigger. */
    placement: LegacyMenuPlacement

    /**
     * Fixed `standard` color style (MD3 Baseline). Any other assignment
     * throws — see `assertLegacyMenuVariant`.
     */
    colorStyle: LegacyMenuColorStyle

    /**
     * Fixed `standard` layout (MD3 Baseline). Any other assignment throws —
     * see `assertLegacyMenuLayout`.
     */
    layout: LegacyMenuLayout

    /** Accessible label of the menu. */
    label: string | null

    /**
     * The ID of the element in the same root node in which the menu should align
     * to.
     */
    anchor: string

    /**
     * An HTML element to anchor the menu to. Overrides `anchor` ID if set.
     */
    anchorElement: HTMLElement | null

    /** Keeps the menu open when user clicks outside. */
    stayOpenOnOutsideClick: boolean

    /** Keeps the menu open when focus leaves the menu subtree. */
    stayOpenOnFocusout: boolean

    /** After closing, does not restore focus to the last focused element. */
    skipRestoreFocus: boolean

    /** Displays overflow content like a submenu without clipping. */
    hasOverflow: boolean

    /** Offsets inline alignment in pixels. */
    xOffset: number

    /** Offsets block alignment in pixels. */
    yOffset: number

    /** Delay in ms before resetting typeahead buffer. */
    typeaheadDelay: number

    /** The element to focus by default when opened. */
    defaultFocus: 'first-item' | 'last-item' | 'none' | 'root'

    /** Disables horizontal flipping when outside viewport. */
    noHorizontalFlip: boolean

    /** Disables vertical flipping when outside viewport. */
    noVerticalFlip: boolean
}

export interface IMDCLegacyMenuSelectDetail {
    item: IMDCLegacyMenuItem
}

export interface IMDCLegacyMenuEvents {
    'showing'            : CustomEvent<void>
    'hiding'             : CustomEvent<void>
    'opened'             : CustomEvent<void>
    'closed'             : CustomEvent<void>
    'select'             : CustomEvent<IMDCLegacyMenuSelectDetail>
    'request-activation' : CustomEvent<IMDCLegacyMenuItemRequestActivationDetail>
}

/**
 * `mdc-legacy-menu` — MD3 Baseline standard menu.
 *
 * Slots: default (items / dividers), trigger (anchor), surface (override).
 */
export interface IMDCLegacyMenu extends LitElement, IMDCLegacyMenuAttributes {
    /** The slotted `mdc-legacy-menu-item` / `mdc-legacy-menu-submenu` children, flattened. */
    readonly items: IMDCLegacyMenuItem[]

    /** Opens the menu surface. */
    show(): Promise<void>

    /** Closes the menu surface. */
    hide(): Promise<void>

    /** Closes the menu surface (alias to hide for @material/web parity). */
    close(): Promise<void>

    /** Toggles the menu surface between open and closed states. */
    toggle(): Promise<void>

    /** Recomputes the floating-ui position of the surface against the anchor. */
    updatePosition(): Promise<void>

    /** Recomputes the floating-ui position (alias to updatePosition for @material/web parity). */
    reposition(): Promise<void>

    /** Focuses the next focusable item (wrap-around). */
    activateNextItem(): void

    /** Focuses the previous focusable item (wrap-around). */
    activatePreviousItem(): void
}

export interface IMDCLegacyMenuItemAttributes {
    /** The interactive role of the item. */
    type: LegacyMenuItemType

    /** Disables the item. Link items are never disabled. */
    disabled: boolean

    /** The destination URL. Forces `type` to `link` when set. */
    href: string

    /** The target of the link (e.g. `_blank`). */
    target: string

    /** Marks the item as selected (secondary-container highlight). */
    selected: boolean

    /** Renders the item with a checkbox role (`menuitemcheckbox`). */
    checkable: boolean

    /** Renders the item with a radio role (`menuitemradio`). */
    radio: boolean

    /** The selection value reported on activation. */
    value: string

    /** Trailing keyboard-shortcut hint (empty when absent). */
    shortcut: string

    /** Trailing badge text (`null` when absent). */
    badge: string | number | null

    /** Roving tabindex value assigned by the parent `mdc-legacy-menu`. */
    listTabIndex: number

    /** Whether selecting this item keeps the parent menu open. */
    keepOpen: boolean

    /** Group name for mutually-exclusive radio items. */
    name?: string

    /** Explicit text label of the item. */
    label?: string

    /** Custom text used for typeahead matching (defaults to label or textContent). */
    typeaheadText?: string
}

export interface IMDCLegacyMenuItemRequestActivationDetail {
    item: IMDCLegacyMenuItem
}

export interface IMDCLegacyMenuItemActivatedDetail {
    item : IMDCLegacyMenuItem
    value: string
}

export interface IMDCLegacyMenuItemEvents {
    'request-activation' : CustomEvent<IMDCLegacyMenuItemRequestActivationDetail>
    'item-activated'     : CustomEvent<IMDCLegacyMenuItemActivatedDetail>
}

/**
 * `mdc-legacy-menu-item` — MD3 Baseline standard menu item.
 *
 * Slots: default (label), leading (icon), trailing (icon / shortcut),
 * supporting (supporting text).
 */
export interface IMDCLegacyMenuItem extends LitElement, IMDCLegacyMenuItemAttributes {
    /** Whether the item is interactive (`button` or `link` type). */
    readonly isInteractive: boolean

    /** Whether the item is disabled (always false for `link` items). */
    readonly isDisabled: boolean

    /** Focuses the item's root element. */
    focus(): void

    /** Clicks the item's root element. */
    click(): void
}

export interface IMDCLegacyMenuSubmenuAttributes {
    /** Accessible label of the submenu trigger. */
    label: string

    /** Disables the submenu trigger. */
    disabled: boolean

    /** Reduces motion for open / close transitions. */
    quick: boolean

    /** Floating-UI placement of the nested surface. Defaults to `right-start`. */
    placement: LegacyMenuPlacement

    /**
     * Hover-intent delay in ms before opening.
     * Defaults to 120. Spec-TODO: no M3 value, pending sign-off.
     */
    openDelay: number

    /**
     * Hover-intent delay in ms before closing.
     * Defaults to 220. Spec-TODO: no M3 value, pending sign-off.
     */
    closeDelay: number

    /** Whether the nested submenu surface is open. */
    open: boolean

    /** Roving tabindex value assigned by the parent menu or submenu. */
    listTabIndex: number

    /** Delay in ms before resetting typeahead buffer. */
    typeaheadDelay: number
}

export interface IMDCLegacyMenuSubmenuEvents {
    'submenu-opened': CustomEvent<void>
    'submenu-closed': CustomEvent<void>
}

/**
 * `mdc-legacy-menu-submenu` — MD3 Baseline standard submenu.
 *
 * Slots: default (nested items), trigger (defaults to a menu-item-like row),
 * surface (nested surface override). Right / Enter opens, Left / Escape
 * closes and refocuses the trigger.
 */
export interface IMDCLegacyMenuSubmenu extends LitElement, IMDCLegacyMenuSubmenuAttributes {
    /** Opens the nested surface. */
    show(): Promise<void>

    /** Closes the nested surface. */
    hide(): Promise<void>

    /** Closes the nested surface (alias to hide for @material/web parity). */
    close(): Promise<void>

    /** Toggles the nested submenu surface between open and closed states. */
    toggle(): Promise<void>

    /** Recomputes the floating-ui position of the nested surface against the trigger. */
    updatePosition(): Promise<void>

    /** Recomputes the floating-ui position (alias to updatePosition for @material/web parity). */
    reposition(): Promise<void>

    /** Focuses the first interactive nested child. */
    focusFirstItem(): void
}


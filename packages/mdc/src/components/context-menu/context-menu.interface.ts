/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import type { PopoverDismissReasons, PopoverPlacements } from '../popover/popover.interface'

/**
 * Expressive color-style axis for `mdc-context-menu`.
 */
export const ContextMenuVariants = {
    Standard: 'standard',
    Vibrant: 'vibrant',
} as const
export type ContextMenuVariants = (typeof ContextMenuVariants)[keyof typeof ContextMenuVariants]

/**
 * Discriminator for declarative `ContextMenuEntry` items.
 */
export const ContextMenuEntryTypes = {
    Item: 'item',
    Checkbox: 'checkbox',
    Radio: 'radio',
    Divider: 'divider',
    Label: 'label',
    Submenu: 'submenu',
} as const
export type ContextMenuEntryTypes = (typeof ContextMenuEntryTypes)[keyof typeof ContextMenuEntryTypes]

/**
 * How the context menu was triggered.
 */
export const ContextMenuTriggerSources = {
    ContextMenu: 'contextmenu',
    LongPress: 'long-press',
    Keyboard: 'keyboard',
    Programmatic: 'programmatic',
} as const
export type ContextMenuTriggerSources = (typeof ContextMenuTriggerSources)[keyof typeof ContextMenuTriggerSources]

/**
 * Trigger mode for `mdc-context-menu`.
 *
 * - `auto`        — Right-click (`contextmenu`), Android touch long-press, and keyboard (`Shift+F10` / `ContextMenu`).
 * - `contextmenu` — Right-click and keyboard only (disables touch long-press).
 * - `long-press`  — Touch/pointer long-press only.
 * - `manual`      — Controlled programmatically via `showAt(x, y)`, `show()`, or `hide()`.
 */
export const ContextMenuTriggerModes = {
    Auto: 'auto',
    ContextMenu: 'contextmenu',
    LongPress: 'long-press',
    Manual: 'manual',
} as const
export type ContextMenuTriggerModes = (typeof ContextMenuTriggerModes)[keyof typeof ContextMenuTriggerModes]

export interface IContextMenuBaseEntry {
    readonly id: string
    readonly label: string
    readonly disabled?: boolean
    readonly icon?: string
    readonly shortcut?: string
    readonly destructive?: boolean
    readonly value?: string
}

export interface IContextMenuItemEntry extends IContextMenuBaseEntry {
    readonly type?: typeof ContextMenuEntryTypes.Item
}

export interface IContextMenuCheckboxEntry extends IContextMenuBaseEntry {
    readonly type: typeof ContextMenuEntryTypes.Checkbox
    readonly checked: boolean
}

export interface IContextMenuRadioEntry extends IContextMenuBaseEntry {
    readonly type: typeof ContextMenuEntryTypes.Radio
    readonly checked: boolean
    readonly group?: string
}

export interface IContextMenuDividerEntry {
    readonly type: typeof ContextMenuEntryTypes.Divider
    readonly id?: string
}

export interface IContextMenuLabelEntry {
    readonly type: typeof ContextMenuEntryTypes.Label
    readonly label: string
    readonly id?: string
}

export interface IContextMenuSubmenuEntry extends IContextMenuBaseEntry {
    readonly type: typeof ContextMenuEntryTypes.Submenu
    readonly children: ReadonlyArray<ContextMenuEntry>
}

export type ContextMenuEntry =
    | IContextMenuItemEntry
    | IContextMenuCheckboxEntry
    | IContextMenuRadioEntry
    | IContextMenuDividerEntry
    | IContextMenuLabelEntry
    | IContextMenuSubmenuEntry

export type ContextMenuInteractiveEntry =
    | IContextMenuItemEntry
    | IContextMenuCheckboxEntry
    | IContextMenuRadioEntry
    | IContextMenuSubmenuEntry

export interface IMDCContextMenuAttributes {
    /** Whether the context menu surface is open. */
    open: boolean
    /** Declarative menu entries (data-driven mode). */
    items: ReadonlyArray<ContextMenuEntry>
    /** Expressive color-style variant (`standard` or `vibrant`). */
    variant: ContextMenuVariants
    /** Preferred placement relative to the trigger point. */
    placement: PopoverPlacements
    /** Trigger mode (`auto`, `contextmenu`, `long-press`, `manual`). */
    trigger: ContextMenuTriggerModes
    /** Delay in ms for Android-style long-press activation. */
    longPressDelay: number
    /** Disables open/close animations. */
    quick: boolean
    /** Closes the menu when an item is selected (checkable/radio items stay open by default unless `closeOnSelect` is forced). */
    closeOnSelect: boolean
    /** Closes the menu on window/ancestor scroll. */
    closeOnScroll: boolean
    /** ID of an external target element in the same root node. */
    for: string
    /** Accessible label for the menu surface. */
    label: string | null
    /** Whether a long-press gesture is currently in progress. */
    pressing: boolean
}

export interface IMDCContextMenuSelectDetail {
    readonly menu: IMDCContextMenu
    readonly item: ContextMenuInteractiveEntry
    readonly items: ReadonlyArray<ContextMenuEntry>
}

export interface IMDCContextMenuLifecycleDetail {
    readonly menu: IMDCContextMenu
    readonly source?: ContextMenuTriggerSources
    readonly x?: number
    readonly y?: number
    readonly reason?: PopoverDismissReasons
}

export interface IMDCContextMenuEvents {
    'context-menu-showing': CustomEvent<IMDCContextMenuLifecycleDetail>
    'context-menu-opened': CustomEvent<IMDCContextMenuLifecycleDetail>
    'context-menu-hiding': CustomEvent<IMDCContextMenuLifecycleDetail>
    'context-menu-closed': CustomEvent<IMDCContextMenuLifecycleDetail>
    'context-menu-select': CustomEvent<IMDCContextMenuSelectDetail>
}

export const ContextMenuShowingEvent = 'context-menu-showing'
export const ContextMenuOpenedEvent = 'context-menu-opened'
export const ContextMenuHidingEvent = 'context-menu-hiding'
export const ContextMenuClosedEvent = 'context-menu-closed'
export const ContextMenuSelectEvent = 'context-menu-select'

/**
 * Material Design 3 Context Menu component contract.
 *
 * @slot - Target region wrapped by the context menu (optional when `for` or `showAt()` is used).
 * @slot menu - Optional custom menu content overriding the data-driven `items` renderer.
 */
export interface IMDCContextMenu extends LitElement, IMDCContextMenuAttributes {
    /** Opens the context menu at explicit viewport coordinates `(x, y)`. */
    showAt(x: number, y: number, source?: ContextMenuTriggerSources): Promise<void>
    /** Opens the context menu anchored to the target element. */
    show(): Promise<void>
    /** Closes the context menu. */
    hide(reason?: PopoverDismissReasons): Promise<void>
}

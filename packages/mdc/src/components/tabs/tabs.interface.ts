/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import type { IMDCTab, TabVariant } from './tab.interface'

/**
 * Layout / overflow mode of `mdc-tabs`, aligned with Android
 * `TabLayout.MODE_FIXED` / `MODE_SCROLLABLE` and Compose `PrimaryTabRow` /
 * `PrimaryScrollableTabRow`.
 *
 * - `fixed`: Tabs share available width equally across the container.
 * - `scrollable`: Tabs size to content with horizontal scrolling and 52dp leading edge padding.
 */
export const TabsMode = {
    Fixed: 'fixed',
    Scrollable: 'scrollable',
} as const
export type TabsMode = (typeof TabsMode)[keyof typeof TabsMode]

/**
 * Input attributes for `mdc-tabs`.
 */
export interface IMDCTabsAttributes {
    /** Zero-based index of the active tab. */
    activeTabIndex: number
    /** When `true` (default), arrow-key navigation immediately activates the focused tab. */
    autoActivate: boolean
    /** Layout mode (`fixed` | `scrollable`). Defaults to `fixed`. */
    mode: TabsMode
    /** Optional bar-level variant propagated to child `mdc-tab` elements that omit `variant`. */
    variant?: TabVariant
    /** Hides the trailing divider below the tab bar. */
    noDivider: boolean
    /** Accessible name (`aria-label`) forwarded to the `tablist` element. */
    label: string
}

/**
 * Custom events emitted by `mdc-tabs`.
 */
export interface IMDCTabsEvents {
    /** Cancelable event fired before a tab selection commits. */
    'change': Event
}

/**
 * Public interface of `mdc-tabs`.
 */
export interface IMDCTabs extends LitElement, IMDCTabsAttributes {
    /** Currently active tab element, or `null` when empty. */
    readonly activeTab: IMDCTab | null
    /** Smoothly scrolls `tabToScrollTo` (defaults to `activeTab`) into view. */
    scrollToTab(tabToScrollTo?: IMDCTab | null): Promise<void>
}

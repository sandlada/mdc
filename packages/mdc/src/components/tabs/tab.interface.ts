/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import type { IMixinFocusRingAttributes } from '../focus-ring/focus-ring-options.mixin'
import type { IMixinRippleAttributes } from '../ripple/ripple-options.mixin'

/**
 * Tab variant axis per Material Design 3 & MD3 Expressive specifications.
 *
 * - `primary`: Top-level navigation tab (`PrimaryTabRow` / `PrimaryNavigationTabTokens`).
 *   Stacked icon + label (64dp height when both are present, 48dp otherwise),
 *   3dp content-fitted active indicator with 3dp top-corner radius.
 * - `secondary`: Sub-level content tab (`SecondaryTabRow` / `SecondaryNavigationTabTokens`).
 *   Inline icon + label (48dp height), 2dp full-width square active indicator.
 * - `floating`: MD3 Expressive floating pill tab (56dp height, full-pill
 *   `SecondaryContainer` active indicator).
 */
export const TabVariant = {
    Primary: 'primary',
    Secondary: 'secondary',
    Floating: 'floating',
} as const
export type TabVariant = (typeof TabVariant)[keyof typeof TabVariant]

/**
 * Input attributes for `mdc-tab`.
 */
export interface IMDCTabAttributes {
    /** Whether this tab is currently selected. */
    active: boolean
    /** Whether this tab is disabled and non-interactive. */
    disabled: boolean
    /** Keeps a disabled tab focusable in roving tabindex order. */
    alwaysFocusable: boolean
    /** Visual variant of the tab (`primary` | `secondary` | `floating`). */
    variant: TabVariant
    /** Set automatically when the `icon` slot is populated. */
    hasIcon: boolean
    /** Set automatically when the default label slot has no content. */
    iconOnly: boolean
    /** Set automatically when the `badge` slot is populated. */
    hasBadge: boolean
    /** Optional fallback label text when the default slot is empty; also used for `aria-label`. */
    label: string
}

/**
 * Custom events emitted by `mdc-tab`.
 */
export interface IMDCTabEvents {}

/**
 * Public interface of `mdc-tab`.
 */
export interface IMDCTab
    extends LitElement,
        IMDCTabAttributes,
        IMixinRippleAttributes,
        IMixinFocusRingAttributes {
    /** Marker attribute used by `mdc-tabs` to discover child tabs. */
    readonly isTab: boolean
    /** Zero-based index assigned by the parent `mdc-tabs` bar. */
    index: number
}

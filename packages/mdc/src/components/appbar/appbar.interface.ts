/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Material Design 3 / M3 Expressive App Bar variants.
 *
 * - `small`: 64px single-row app bar
 * - `center-aligned`: 64px single-row app bar with centered headline
 * - `medium-flexible` / `medium`: Multi-line flexible medium app bar (112px min-height)
 * - `large-flexible` / `large`: Multi-line flexible large app bar (120px min-height)
 * - `search`: 64px app bar with embedded pill search container
 */
export const AppBarVariant = {
    Small         : 'small',
    CenterAligned : 'center-aligned',
    MediumFlexible: 'medium-flexible',
    LargeFlexible : 'large-flexible',
    Medium        : 'medium',
    Large         : 'large',
    Search        : 'search',
} as const
export type AppBarVariant = (typeof AppBarVariant)[keyof typeof AppBarVariant]

/** Headline and subtitle alignment within the app bar. */
export const AppBarAlignment = {
    Start : 'start',
    Center: 'center',
} as const
export type AppBarAlignment = (typeof AppBarAlignment)[keyof typeof AppBarAlignment]

/** Scroll response behavior for the app bar. */
export const AppBarScrollBehavior = {
    Pinned  : 'pinned',
    Collapse: 'collapse',
} as const
export type AppBarScrollBehavior = (typeof AppBarScrollBehavior)[keyof typeof AppBarScrollBehavior]

export interface IAppBarSearchClickDetail {
    target: HTMLElement | null
}

export interface IAppBarScrollStateChangeDetail {
    scrolled: boolean
    collapsed: boolean
    progress: number
}

/** Input attributes for `mdc-appbar`. */
export interface IMDCAppBarAttributes {
    /** Visual layout variant. */
    variant: AppBarVariant
    /** Text alignment for headline, subtitle, and search placeholder. */
    alignment: AppBarAlignment
    /** How the app bar responds to scroll events on `scrollTarget`. */
    scrollBehavior: AppBarScrollBehavior
    /** Primary title text (or placeholder text in `search` variant). */
    headline: string
    /** Optional supporting subtitle text. */
    subtitle: string
    /** Whether the associated content is scrolled past the top edge. */
    scrolled: boolean
    /** Whether a flexible app bar is collapsed into its 64px single-row state. */
    collapsed: boolean
    /** Element, `'window'`, or CSS selector whose scroll position drives `scrolled`/`collapsed`. */
    scrollTarget: HTMLElement | Window | string | null
    /** ID of an `mdc-search-view` in the same root node to open when `search` variant is clicked. */
    for: string
}

/** Custom events emitted by `mdc-appbar`. */
export interface IMDCAppBarEvents {
    'search-click': CustomEvent<IAppBarSearchClickDetail>
    'scroll-state-change': CustomEvent<IAppBarScrollStateChangeDetail>
}

/**
 * `mdc-appbar` — Material Design 3 & M3 Expressive App Bar component.
 */
export interface IMDCAppBar extends LitElement, IMDCAppBarAttributes {}

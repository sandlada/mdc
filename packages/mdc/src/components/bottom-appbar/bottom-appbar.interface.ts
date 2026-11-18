/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import type { IMixinElevationAttributes } from '../elevation/elevation-options.mixin'

/**
 * Scroll response behavior for `mdc-bottom-appbar`.
 * - `pinned`: stays anchored at the bottom (default).
 * - `exit-always`: slides out of view when scrolling down and returns when scrolling up.
 */
export const BottomAppBarScrollBehavior = {
    Pinned    : 'pinned',
    ExitAlways: 'exit-always',
} as const
export type BottomAppBarScrollBehavior = (typeof BottomAppBarScrollBehavior)[keyof typeof BottomAppBarScrollBehavior]

/**
 * Event fired when `mdc-bottom-appbar` visibility changes during scroll.
 */
export const BottomAppBarVisibilityChangeEvent = 'bottom-appbar-visibility-change'

/**
 * Detail payload for `bottom-appbar-visibility-change`.
 */
export interface IBottomAppBarVisibilityChangeDetail {
    collapsed: boolean
}

/**
 * Pure input attributes contract for `mdc-bottom-appbar`.
 */
export interface IMDCBottomAppBarAttributes {
    /** Scroll response behavior (`pinned` | `exit-always`). */
    scrollBehavior: BottomAppBarScrollBehavior
    /** Whether the bar is currently slid out of view. */
    collapsed     : boolean
    /** Element, `'window'`, or CSS selector whose scroll position drives `exit-always`. */
    scrollTarget  : HTMLElement | Window | string | null
    /** Accessible label for the toolbar landmark. */
    label         : string
}

/**
 * Custom events map for `mdc-bottom-appbar`.
 */
export interface IMDCBottomAppBarEvents {
    [BottomAppBarVisibilityChangeEvent]: CustomEvent<IBottomAppBarVisibilityChangeDetail>
}

/**
 * Material Design 3 Bottom App Bar contract.
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/bottom-app-bar/overview
 * https://m3.material.io/components/bottom-app-bar/specs
 */
export interface IMDCBottomAppBar extends LitElement, IMDCBottomAppBarAttributes, IMixinElevationAttributes {
    /** Reveal the bottom app bar if hidden by scroll. */
    show(): void
    /** Hide the bottom app bar (slide down). */
    hide(): void
}

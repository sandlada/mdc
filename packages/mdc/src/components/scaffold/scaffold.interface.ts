/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Anchor position for the floating action button (FAB).
 */
export const ScaffoldFabPosition = {
    BottomEnd   : 'bottom-end',
    BottomCenter: 'bottom-center',
    BottomStart : 'bottom-start',
    DockedEnd   : 'docked-end',
    DockedCenter: 'docked-center',
} as const
export type ScaffoldFabPosition = (typeof ScaffoldFabPosition)[keyof typeof ScaffoldFabPosition]

/**
 * Scroll management mode for the scaffold.
 * - `body`: `<main class="body-area">` is the primary scroll container. App bar & rail are fixed/sticky.
 * - `window`: The whole window / viewport scrolls.
 */
export const ScaffoldScrollMode = {
    Body  : 'body',
    Window: 'window',
} as const
export type ScaffoldScrollMode = (typeof ScaffoldScrollMode)[keyof typeof ScaffoldScrollMode]

/**
 * Layout relationship between side rails/drawers and the top app bar.
 * - `full-height`: Rail/Drawer spans from top:0 to bottom:0 (full height), flush with App Bar (MD3 Adaptive default).
 * - `below-appbar`: Top App Bar spans full width across the top, Rail/Drawer is placed below it.
 */
export const ScaffoldRailLayout = {
    FullHeight : 'full-height',
    BelowAppbar: 'below-appbar',
} as const
export type ScaffoldRailLayout = (typeof ScaffoldRailLayout)[keyof typeof ScaffoldRailLayout]

/**
 * Responsive layout mode.
 */
export const ScaffoldLayoutMode = {
    Auto    : 'auto',
    Compact : 'compact',
    Medium  : 'medium',
    Expanded: 'expanded',
} as const
export type ScaffoldLayoutMode = (typeof ScaffoldLayoutMode)[keyof typeof ScaffoldLayoutMode]

/**
 * Scaffold component interface for Material Design 3 adaptive screen layouts.
 */
export interface IScaffold extends LitElement {
    /** Layout relationship between rails/drawers and top app bar. */
    railLayout: ScaffoldRailLayout
    /** Floating action button position. */
    fabPosition: ScaffoldFabPosition
    /** Scroll container mode. */
    scrollMode: ScaffoldScrollMode
    /** Responsive layout mode. */
    layoutMode: ScaffoldLayoutMode
    /** Whether to adapt for safe-area insets. */
    avoidSafeArea: boolean

    /** Slot presence state */
    hasAppbar: boolean
    hasRail: boolean
    hasDrawer: boolean
    hasEndRail: boolean
    hasEndDrawer: boolean
    hasBottomBar: boolean
    hasBottomSheet: boolean
    hasFab: boolean
}

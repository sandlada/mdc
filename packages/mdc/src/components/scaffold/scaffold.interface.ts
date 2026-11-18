/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Anchor position for the floating action button (FAB).
 *
 * Mirrors Android Jetpack Compose Material 3 `FabPosition`:
 * - `start`: above the bottom bar (or scaffold bottom), inline-start by `FabSpacing` (16dp).
 * - `center`: above the bottom bar (or scaffold bottom), horizontally centered.
 * - `end`: above the bottom bar (or scaffold bottom), inline-end by `FabSpacing` (16dp) (default).
 * - `end-overlay`: overlaying the bottom bar, 16dp above the scaffold bottom (`FabPosition.EndOverlay`).
 */
export const ScaffoldFabPosition = {
    Start     : 'start',
    Center    : 'center',
    End       : 'end',
    EndOverlay: 'end-overlay',
} as const
export type ScaffoldFabPosition = (typeof ScaffoldFabPosition)[keyof typeof ScaffoldFabPosition]

/**
 * Scroll management mode for the scaffold.
 * - `body`: `<main class="body-area">` is the primary scroll container. App bar & rail are fixed.
 * - `window`: the whole window / viewport scrolls. App bar sticks to top, bottom bar & overlays stick to bottom.
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
 * Responsive width layout mode.
 *
 * Breakpoints follow Material Design 3 window size classes
 * (`WindowWidthSizeClass`, 1dp = 1px at baseline density):
 * - `compact`: width < 600 (phone portrait -> NavigationBar)
 * - `medium`: 600 <= width < 840 (foldable/tablet portrait -> NavigationRail)
 * - `expanded`: 840 <= width < 1200 (tablet landscape -> NavigationRail/Drawer)
 * - `large`: 1200 <= width < 1600 (desktop)
 * - `extra-large`: width >= 1600 (ultra-wide desktop)
 * - `auto`: resolved from the scaffold width via `ResizeObserver`
 *   into {@link IMDCScaffold.effectiveLayoutMode}.
 */
export const ScaffoldLayoutMode = {
    Auto      : 'auto',
    Compact   : 'compact',
    Medium    : 'medium',
    Expanded  : 'expanded',
    Large     : 'large',
    ExtraLarge: 'extra-large',
} as const
export type ScaffoldLayoutMode = (typeof ScaffoldLayoutMode)[keyof typeof ScaffoldLayoutMode]

/**
 * Responsive height size class.
 *
 * Breakpoints follow Android `WindowHeightSizeClass` (`HEIGHT_DP_*_LOWER_BOUND`):
 * - `compact`: height < 480 (e.g. phone landscape / short split-screen)
 * - `medium`: 480 <= height < 900
 * - `expanded`: height >= 900
 */
export const ScaffoldHeightMode = {
    Compact : 'compact',
    Medium  : 'medium',
    Expanded: 'expanded',
} as const
export type ScaffoldHeightMode = (typeof ScaffoldHeightMode)[keyof typeof ScaffoldHeightMode]

/**
 * Resolved adaptive navigation chrome type (`NavigationSuiteType`).
 */
export const ScaffoldNavigationType = {
    None            : 'none',
    NavigationBar   : 'navigation-bar',
    NavigationRail  : 'navigation-rail',
    NavigationDrawer: 'navigation-drawer',
} as const
export type ScaffoldNavigationType = (typeof ScaffoldNavigationType)[keyof typeof ScaffoldNavigationType]

/**
 * Controls how `mdc-scaffold` coordinates `navigation-bar`, `rail`/`start-rail`,
 * and `drawer`/`start-drawer` slots across window size classes.
 * - `auto`: automatically switches navigation chrome using width & height classes
 *   (`NavigationSuiteScaffoldDefaults.calculateFromAdaptiveInfo`).
 * - `off`: disables automatic hiding/switching; all slotted chrome renders simultaneously.
 * - `'none' | 'navigation-bar' | 'navigation-rail' | 'navigation-drawer'`: forces a specific navigation chrome.
 */
export const ScaffoldAdaptiveNavigation = {
    Auto            : 'auto',
    Off             : 'off',
    None            : 'none',
    NavigationBar   : 'navigation-bar',
    NavigationRail  : 'navigation-rail',
    NavigationDrawer: 'navigation-drawer',
} as const
export type ScaffoldAdaptiveNavigation = (typeof ScaffoldAdaptiveNavigation)[keyof typeof ScaffoldAdaptiveNavigation]

/**
 * Controls how Compose-style `innerPadding` is applied to `<main class="body-area">`.
 * - `inset` (default): `.body-area` spans `1 / -1` behind `appbar` and `bottom-bar` with
 *   automatic `padding-block-start` / `padding-block-end` and `scroll-padding-*`, enabling
 *   translucent/blurred bars while keeping initial content unobscured.
 * - `docked`: `.body-area` occupies the `[body] 1fr` grid row between `appbar` and `bottom-bar`.
 * - `manual`: `.body-area` spans `1 / -1` with zero automatic padding; consumers read
 *   `--mdc-scaffold-inner-padding-*`, `getInnerPadding()`, or `scaffold-layout-change`.
 */
export const ScaffoldContentPaddingMode = {
    Inset : 'inset',
    Docked: 'docked',
    Manual: 'manual',
} as const
export type ScaffoldContentPaddingMode = (typeof ScaffoldContentPaddingMode)[keyof typeof ScaffoldContentPaddingMode]

/**
 * Width breakpoints (px) for {@link ScaffoldLayoutMode}.
 * Mirrors Android `WindowSizeClass.WIDTH_DP_*_LOWER_BOUND`.
 */
export const ScaffoldBreakpoints = {
    Medium    : 600,
    Expanded  : 840,
    Large     : 1200,
    ExtraLarge: 1600,
} as const
export type ScaffoldBreakpoints = typeof ScaffoldBreakpoints

/**
 * Height breakpoints (px) for {@link ScaffoldHeightMode}.
 * Mirrors Android `WindowSizeClass.HEIGHT_DP_*_LOWER_BOUND`.
 */
export const ScaffoldHeightBreakpoints = {
    Medium  : 480,
    Expanded: 900,
} as const
export type ScaffoldHeightBreakpoints = typeof ScaffoldHeightBreakpoints

/**
 * Padding values equivalent to Compose `PaddingValues`.
 */
export interface IScaffoldPaddingValues {
    top   : number
    bottom: number
    left  : number
    right : number
}

/**
 * Detail payload for the `scaffold-layout-change` event.
 */
export interface IMDCScaffoldLayoutChangeDetail {
    layoutMode    : Exclude<ScaffoldLayoutMode, 'auto'>
    heightMode    : ScaffoldHeightMode
    navigationType: ScaffoldNavigationType
    innerPadding  : IScaffoldPaddingValues
}

/** Event fired when effective layout mode, height mode, navigation type, or inner padding changes. */
export const ScaffoldLayoutChangeEvent = 'scaffold-layout-change'

/**
 * Resolve an effective (non-`auto`) layout mode from a scaffold width.
 * Pure function of the Android window-size-class breakpoints; testable in Node.
 */
export const resolveScaffoldLayoutMode = (width: number): Exclude<ScaffoldLayoutMode, 'auto'> => {
    if (!Number.isFinite(width) || width < ScaffoldBreakpoints.Medium) return 'compact'
    if (width < ScaffoldBreakpoints.Expanded) return 'medium'
    if (width < ScaffoldBreakpoints.Large) return 'expanded'
    if (width < ScaffoldBreakpoints.ExtraLarge) return 'large'
    return 'extra-large'
}

/**
 * Resolve an effective height size class from a scaffold height.
 * Pure function of Android `HEIGHT_DP_*_LOWER_BOUND`; testable in Node.
 */
export const resolveScaffoldHeightMode = (height: number): ScaffoldHeightMode => {
    if (!Number.isFinite(height) || height < ScaffoldHeightBreakpoints.Medium) return 'compact'
    if (height < ScaffoldHeightBreakpoints.Expanded) return 'medium'
    return 'expanded'
}

/**
 * Resolve the active navigation chrome from width & height window size classes,
 * mirroring Android `NavigationSuiteScaffoldDefaults.calculateFromAdaptiveInfo`.
 */
export const resolveScaffoldNavigationType = (
    widthMode: Exclude<ScaffoldLayoutMode, 'auto'>,
    heightMode: ScaffoldHeightMode,
    options: {
        hasDrawer?       : boolean
        hasRail?         : boolean
        hasNavigationBar?: boolean
    } = {},
): ScaffoldNavigationType => {
    const { hasDrawer = false, hasRail = false, hasNavigationBar = false } = options
    if (!hasDrawer && !hasRail && !hasNavigationBar) return 'none'

    if (widthMode === 'compact' || heightMode === 'compact') {
        if (hasNavigationBar) return 'navigation-bar'
        if (hasRail) return 'navigation-rail'
        return 'navigation-drawer'
    }

    if (widthMode === 'large' || widthMode === 'extra-large') {
        if (hasDrawer) return 'navigation-drawer'
        if (hasRail) return 'navigation-rail'
        return 'navigation-bar'
    }

    if (hasRail) return 'navigation-rail'
    if (hasDrawer) return 'navigation-drawer'
    return 'navigation-bar'
}

/**
 * Normalize any accepted `fab-position` value to a canonical Android `FabPosition`.
 * Unknown values fall back to `'end'` (`FabPosition.End` default).
 */
export const normalizeScaffoldFabPosition = (value: unknown): ScaffoldFabPosition => {
    switch (value) {
        case 'start':
            return 'start'
        case 'center':
            return 'center'
        case 'end-overlay':
            return 'end-overlay'
        case 'end':
        default:
            return 'end'
    }
}

/**
 * Whether the FAB is horizontally centered.
 */
export const isScaffoldFabCentered = (position: ScaffoldFabPosition): boolean =>
    position === 'center'

/**
 * Whether the FAB overlays the bottom bar (M3 `EndOverlay`).
 */
export const isScaffoldFabOverlay = (position: ScaffoldFabPosition): boolean =>
    position === 'end-overlay'

/**
 * Pure Android `ScaffoldLayout` bottom offset calculation for FAB and Snackbar.
 */
export const computeScaffoldBottomOffsets = (params: {
    hasFab         : boolean
    fabHeight      : number
    fabPosition    : ScaffoldFabPosition
    fabSpacing     : number
    hasBottomBar   : boolean
    bottomBarHeight: number
    snackbarSpacing: number
}): {
    fabBottom             : number
    snackbarBottom        : number
    fabUsesSafeBottom     : boolean
    snackbarUsesSafeBottom: boolean
} => {
    const {
        hasFab,
        fabHeight,
        fabPosition,
        fabSpacing,
        hasBottomBar,
        bottomBarHeight,
        snackbarSpacing,
    } = params

    const visibleBarHeight = hasBottomBar && bottomBarHeight > 0 ? bottomBarHeight : 0
    const visibleFabHeight = hasFab && fabHeight > 0 ? fabHeight : 0

    let fabBottom = 0
    let fabUsesSafeBottom = false

    if (hasFab) {
        if (fabPosition === 'end-overlay') {
            fabBottom = fabSpacing
            fabUsesSafeBottom = true
        } else if (visibleBarHeight > 0) {
            fabBottom = visibleBarHeight + fabSpacing
            fabUsesSafeBottom = false
        } else {
            fabBottom = fabSpacing
            fabUsesSafeBottom = true
        }
    }

    let snackbarBottom = 0
    let snackbarUsesSafeBottom = false

    if (visibleFabHeight > 0) {
        const fabTop = fabBottom + visibleFabHeight
        if (fabPosition === 'end-overlay' && visibleBarHeight > 0) {
            snackbarBottom = Math.max(visibleBarHeight, fabTop) + snackbarSpacing
            snackbarUsesSafeBottom = fabTop > visibleBarHeight
        } else {
            snackbarBottom = fabTop + snackbarSpacing
            snackbarUsesSafeBottom = fabUsesSafeBottom
        }
    } else if (visibleBarHeight > 0) {
        snackbarBottom = visibleBarHeight + snackbarSpacing
        snackbarUsesSafeBottom = false
    } else {
        snackbarBottom = snackbarSpacing
        snackbarUsesSafeBottom = true
    }

    return {
        fabBottom,
        snackbarBottom,
        fabUsesSafeBottom,
        snackbarUsesSafeBottom,
    }
}

/**
 * Pure input attributes contract for `mdc-scaffold`.
 */
export interface IMDCScaffoldAttributes {
    /** Layout relationship between rails/drawers and top app bar. */
    railLayout        : ScaffoldRailLayout
    /** Floating action button position. */
    fabPosition       : ScaffoldFabPosition
    /** Scroll container mode. */
    scrollMode        : ScaffoldScrollMode
    /** Responsive layout mode. `auto` resolves via width breakpoints. */
    layoutMode        : ScaffoldLayoutMode
    /** Adaptive navigation chrome coordination mode. */
    adaptiveNavigation: ScaffoldAdaptiveNavigation
    /** How Compose-style `innerPadding` is applied to body content. */
    contentPaddingMode: ScaffoldContentPaddingMode
    /** Whether to adapt for safe-area insets (`contentWindowInsets`). */
    avoidSafeArea     : boolean
}

/**
 * Custom events map for `mdc-scaffold`.
 */
export interface IMDCScaffoldEvents {
    [ScaffoldLayoutChangeEvent]: CustomEvent<IMDCScaffoldLayoutChangeDetail>
}

/**
 * Scaffold component contract for Material Design 3 adaptive screen layouts.
 *
 * Web equivalent of Jetpack Compose Material 3 `Scaffold` +
 * `NavigationSuiteScaffold` window-size-class behaviour.
 */
export interface IMDCScaffold extends LitElement, IMDCScaffoldAttributes {
    /** Effective (resolved, never `auto`) width layout mode. */
    readonly effectiveLayoutMode    : Exclude<ScaffoldLayoutMode, 'auto'>
    /** Effective height size class. */
    readonly effectiveHeightMode    : ScaffoldHeightMode
    /** Effective adaptive navigation chrome type. */
    readonly effectiveNavigationType: ScaffoldNavigationType

    /** Slot presence state */
    hasAppbar      : boolean
    hasRail        : boolean
    hasDrawer      : boolean
    hasEndRail     : boolean
    hasEndDrawer   : boolean
    hasBottomBar   : boolean
    hasBottomSheet : boolean
    hasFab         : boolean
    hasSnackbarHost: boolean

    /** Force a layout refresh and recompute slot presence, breakpoints, and measurements. */
    refreshLayout(): void
    /** Return measured `innerPadding` values (`PaddingValues`). */
    getInnerPadding(): IScaffoldPaddingValues
}

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Visual color variants for Material 3 Expressive toolbars.
 * - `standard`: Low-emphasis surface container (`surface-container`).
 * - `vibrant`: High-emphasis accent container (`primary-container`).
 */
export const ToolbarVariants = ['standard', 'vibrant'] as const
export type ToolbarVariant = (typeof ToolbarVariants)[number]

/**
 * Layout orientations for `mdc-floating-toolbar`.
 */
export const ToolbarOrientations = ['horizontal', 'vertical'] as const
export type ToolbarOrientation = (typeof ToolbarOrientations)[number]

/**
 * Alignment options for `mdc-docked-toolbar` actions.
 */
export const DockedToolbarAlignments = ['space-between', 'space-around', 'space-evenly', 'center', 'start', 'end'] as const
export type DockedToolbarAlignment = (typeof DockedToolbarAlignments)[number]

/**
 * Paired FAB placement relative to the floating toolbar pill.
 */
export const FloatingToolbarFabPositions = ['end', 'start'] as const
export type FloatingToolbarFabPosition = (typeof FloatingToolbarFabPositions)[number]

/**
 * Scroll response behavior for toolbars.
 * - `pinned`: stays visible regardless of scroll (default; auto scroll-hide disabled).
 * - `exit-always`: slides out of view when scrolling down and returns when scrolling up.
 */
export const ToolbarScrollBehavior = {
    Pinned    : 'pinned',
    ExitAlways: 'exit-always',
} as const
export type ToolbarScrollBehavior = (typeof ToolbarScrollBehavior)[keyof typeof ToolbarScrollBehavior]

/**
 * Event fired when a toolbar's `collapsed` visibility state changes.
 */
export const ToolbarVisibilityChangeEvent = 'toolbar-visibility-change'

/**
 * Detail payload for `toolbar-visibility-change`.
 */
export interface IToolbarVisibilityChangeDetail {
    collapsed: boolean
}

/**
 * Event fired when `mdc-floating-toolbar` expands or collapses.
 */
export const ToolbarExpandedChangeEvent = 'toolbar-expanded-change'

/**
 * Detail payload for `toolbar-expanded-change`.
 */
export interface IToolbarExpandedChangeEventDetail {
    expanded: boolean
}

/**
 * Pure input attributes contract for `mdc-docked-toolbar`.
 */
export interface IMDCDockedToolbarAttributes {
    /** Visual color emphasis: 'standard' | 'vibrant'. */
    variant: ToolbarVariant

    /** Horizontal distribution of slotted actions. */
    alignment: DockedToolbarAlignment

    /** Scroll response behavior (`pinned` by default). */
    scrollBehavior: ToolbarScrollBehavior

    /** Whether the toolbar is currently slid out of view. */
    collapsed: boolean

    /** Element, `'window'`, or CSS selector whose scroll position drives `exit-always`. */
    scrollTarget: HTMLElement | Window | string | null
}

/**
 * Events map for `mdc-docked-toolbar`.
 */
export interface IMDCDockedToolbarEvents {
    [ToolbarVisibilityChangeEvent]: CustomEvent<IToolbarVisibilityChangeDetail>
}

/**
 * Public interface contract for `mdc-docked-toolbar`.
 */
export interface IMDCDockedToolbar extends LitElement, IMDCDockedToolbarAttributes {
    /** Reveal the toolbar. */
    show(): void

    /** Hide the toolbar (slide out). */
    hide(): void

    /** Toggle toolbar visibility. */
    toggle(): void
}

/**
 * Pure input attributes contract for `mdc-floating-toolbar`.
 */
export interface IMDCFloatingToolbarAttributes {
    /** Visual color emphasis: 'standard' | 'vibrant'. */
    variant: ToolbarVariant

    /** Layout orientation: 'horizontal' | 'vertical'. */
    orientation: ToolbarOrientation

    /** Whether the floating toolbar actions container is expanded. */
    expanded: boolean

    /** Placement of the paired `slot="fab"` relative to the toolbar pill. */
    fabPosition: FloatingToolbarFabPosition

    /** Scroll response behavior (`pinned` by default). */
    scrollBehavior: ToolbarScrollBehavior

    /** Whether the toolbar is currently slid out of view. */
    collapsed: boolean

    /** Element, `'window'`, or CSS selector whose scroll position drives `exit-always`. */
    scrollTarget: HTMLElement | Window | string | null
}

/**
 * Events map for `mdc-floating-toolbar`.
 */
export interface IMDCFloatingToolbarEvents {
    [ToolbarExpandedChangeEvent]: CustomEvent<IToolbarExpandedChangeEventDetail>
    [ToolbarVisibilityChangeEvent]: CustomEvent<IToolbarVisibilityChangeDetail>
}

/**
 * Public interface contract for `mdc-floating-toolbar`.
 */
export interface IMDCFloatingToolbar extends LitElement, IMDCFloatingToolbarAttributes {
    /** Expands the floating toolbar container. */
    expand(): void

    /** Collapses the floating toolbar container. */
    collapse(): void

    /** Toggles the expanded state of the floating toolbar container. */
    toggle(): void

    /** Reveal the floating toolbar. */
    show(): void

    /** Hide the floating toolbar (slide out). */
    hide(): void

    /** Toggle floating toolbar visibility. */
    toggleVisibility(): void
}

/**
 * Pure input attributes contract for `mdc-docked-toolbar-action`.
 */
export interface IMDCDockedToolbarActionAttributes {
    /** Visual color emphasis inherited or set on the action: 'standard' | 'vibrant'. */
    variant: ToolbarVariant

    /** Whether the action is in a selected / active state. */
    selected: boolean

    /** Whether the action is disabled. */
    disabled: boolean

    /** Optional label text rendered alongside or below the icon. */
    label: string
}

/**
 * Public interface contract for `mdc-docked-toolbar-action`.
 */
export interface IMDCDockedToolbarAction extends LitElement, IMDCDockedToolbarActionAttributes {}

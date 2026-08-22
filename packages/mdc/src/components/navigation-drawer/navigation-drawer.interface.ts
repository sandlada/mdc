/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Visual variant of the navigation drawer:
 * - `modal`: floating overlay above content with a scrim backdrop (mobile/tablet standard).
 * - `standard`: in-flow collapsible drawer sharing screen space with content.
 * - `permanent`: persistent fixed drawer always visible in flow (desktop/large screen).
 */
export type NavigationDrawerVariant = 'modal' | 'standard' | 'permanent'
export const NavigationDrawerVariant = {
    Modal: 'modal',
    Standard: 'standard',
    Permanent: 'permanent',
} as const satisfies Record<string, NavigationDrawerVariant>

/**
 * Viewport edge the drawer docks to. RTL-aware: in `dir="rtl"`, the visual
 * mapping follows `inset-inline-start` / `inset-inline-end` automatically.
 */
export type NavigationDrawerEdge = 'start' | 'end'
export const NavigationDrawerEdge = {
    Start: 'start',
    End: 'end',
} as const satisfies Record<string, NavigationDrawerEdge>

/**
 * Reason why the drawer is closing.
 * - `programmatic`: consumer called `hide()` / `close()` or changed `open`
 * - `escape`: modal's Esc key
 * - `scrim`: modal's scrim tap
 * - `drag`: swipe-to-dismiss drag gesture
 */
export type NavigationDrawerCloseReason =
    | 'programmatic'
    | 'escape'
    | 'scrim'
    | 'drag'

/**
 * Snap target decided on release of a drag gesture.
 */
export type NavigationDrawerDragTarget = 'closed' | 'open'

/**
 * Detail payload of the `navigation-drawer-closed` event.
 */
export interface INavigationDrawerClosedEventDetail {
    returnValue: string
    reason: NavigationDrawerCloseReason
}

/**
 * Detail payload of the `navigation-drawer-cancel` event (modal only).
 * Fires before `closing` when the user attempts to dismiss via Esc or scrim tap.
 */
export interface INavigationDrawerCancelEventDetail {
    reason: 'escape' | 'scrim'
}

/**
 * Detail payload of the `navigation-drawer-drag-start` event.
 */
export interface INavigationDrawerDragStartEventDetail {
    drawerEdge: NavigationDrawerEdge
}

/**
 * Detail payload of the `navigation-drawer-drag` event.
 */
export interface INavigationDrawerDragEventDetail {
    /** Live horizontal delta (px) from resting position. */
    dx: number
    /** Fractional progress [0..1] towards dismiss. */
    progress: number
}

/**
 * Detail payload of the `navigation-drawer-drag-end` event.
 */
export interface INavigationDrawerDragEndEventDetail {
    /** True when the drag decided to commit a dismiss. */
    committed: boolean
    /** Snap target decided by the release heuristics. */
    target: NavigationDrawerDragTarget
    /** Whether committed via velocity or distance. */
    reason?: 'distance' | 'velocity' | 'cancel'
    /** The horizontal translation at the instant of release. */
    dx: number
}

/**
 * Navigation drawer component contract.
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/navigation-drawer/overview
 * https://m3.material.io/components/navigation-drawer/specs
 */
export interface INavigationDrawer extends LitElement {
    /** Visual variant: modal, standard, or permanent. */
    variant: NavigationDrawerVariant
    /** Visibility driver. In permanent mode, always true. */
    open: boolean
    /** Viewport edge the drawer docks to: 'start' or 'end'. */
    drawerEdge: NavigationDrawerEdge
    /** Title/headline string rendered at the top of destinations list. */
    headline: string
    /** Skip opening/closing animations. */
    quick: boolean
    /** Modal only — allows Esc and scrim-tap dismissal. */
    cancelable: boolean
    /** Enable swipe-to-dismiss drag gesture. */
    draggable: boolean
    /** Disable focus traps when modal is open. */
    noFocusTrap: boolean
    /** Round-tripped return value. */
    returnValue: string
    /** Shared navigation scope for cross-container tab synchronization. */
    navigationScope: string

    /** Open the drawer and resolve when the entrance animation completes. */
    show(): Promise<void>
    /** Close the drawer and resolve when the exit animation completes. */
    hide(): Promise<void>
    /** Close the drawer with an optional return value. */
    close(returnValue?: string): Promise<void>
    /** Toggle open state. */
    toggle(): Promise<void>
}

/** Fired when the drawer begins to open. */
export const NAVIGATION_DRAWER_OPENING_EVENT = 'navigation-drawer-opening'
/** Fired when the drawer has finished opening. */
export const NAVIGATION_DRAWER_OPENED_EVENT = 'navigation-drawer-opened'
/** Fired when the drawer begins to close. */
export const NAVIGATION_DRAWER_CLOSING_EVENT = 'navigation-drawer-closing'
/** Fired when the drawer has finished closing. */
export const NAVIGATION_DRAWER_CLOSED_EVENT = 'navigation-drawer-closed'
/** Modal only — fired when Esc or scrim tap occurs. Cancelable. */
export const NAVIGATION_DRAWER_CANCEL_EVENT = 'navigation-drawer-cancel'
/** Fired when a pointer drag gesture engages. */
export const NAVIGATION_DRAWER_DRAG_START_EVENT = 'navigation-drawer-drag-start'
/** Fired on pointer movement during drag. */
export const NAVIGATION_DRAWER_DRAG_EVENT = 'navigation-drawer-drag'
/** Fired when the drag gesture is released. */
export const NAVIGATION_DRAWER_DRAG_END_EVENT = 'navigation-drawer-drag-end'

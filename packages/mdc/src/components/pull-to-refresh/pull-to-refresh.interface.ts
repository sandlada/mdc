/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Indicator visual style for `<mdc-pull-to-refresh>`:
 * - `expressive`: Android Material 3 Expressive morphing `<mdc-loading-indicator contained>`.
 * - `circular`: Classic Material 3 / Flutter elevated circular `<mdc-progress-indicator variant="circular">`.
 */
export const PullToRefreshIndicator = {
    Expressive: 'expressive',
    Circular: 'circular',
} as const
export type PullToRefreshIndicator = (typeof PullToRefreshIndicator)[keyof typeof PullToRefreshIndicator]

/**
 * Color-role variant for the pull-to-refresh indicator.
 */
export const PullToRefreshVariant = {
    Primary: 'primary',
    Secondary: 'secondary',
    Tertiary: 'tertiary',
    Surface: 'surface',
} as const
export type PullToRefreshVariant = (typeof PullToRefreshVariant)[keyof typeof PullToRefreshVariant]

/**
 * Content layout mode during pull & refresh:
 * - `overlay`: Indicator floats over the content (Android `PullToRefreshBox` & Flutter `RefreshIndicator` default).
 * - `push`: Content translates down together with the pull distance.
 */
export const PullToRefreshMode = {
    Overlay: 'overlay',
    Push: 'push',
} as const
export type PullToRefreshMode = (typeof PullToRefreshMode)[keyof typeof PullToRefreshMode]

/**
 * Lifecycle state of `<mdc-pull-to-refresh>`.
 */
export const PullToRefreshState = {
    Idle: 'idle',
    Pulling: 'pulling',
    Ready: 'ready',
    Refreshing: 'refreshing',
} as const
export type PullToRefreshState = (typeof PullToRefreshState)[keyof typeof PullToRefreshState]

export const PullToRefreshEvent = 'refresh'
export const PullToRefreshStateChangeEvent = 'pull-state-change'
export const PullToRefreshProgressEvent = 'pull-progress'

export interface IMDCPullToRefreshEventDetail {
    state: PullToRefreshState
    progress: number
    distance: number
}

export interface IMDCPullToRefreshStateChangeDetail {
    state: PullToRefreshState
    previousState: PullToRefreshState
    progress: number
    distance: number
}

export interface IMDCPullToRefreshProgressDetail {
    progress: number
    distance: number
    state: PullToRefreshState
}

export interface IMDCPullToRefreshAttributes {
    /** Whether a refresh operation is currently active. Reflects to `refreshing`. */
    refreshing: boolean
    /** Disables pull-to-refresh gesture handling. Reflects to `disabled`. */
    disabled: boolean
    /** Indicator style (`'expressive'` | `'circular'`). Defaults to `'expressive'`. */
    indicator: PullToRefreshIndicator
    /** Color-role variant (`'primary'` | `'secondary'` | `'tertiary'` | `'surface'`). */
    variant: PullToRefreshVariant
    /** Layout mode (`'overlay'` | `'push'`). Defaults to `'overlay'`. */
    mode: PullToRefreshMode
    /** Pull distance in px required to trigger refresh. Defaults to `80` (Android 80dp). */
    threshold: number
    /** Maximum damped pull distance in px. Defaults to `144`. */
    maxPullDistance: number
    /** Top resting offset in px for the indicator. Defaults to `16`. */
    indicatorOffset: number
    /** Drag resistance multiplier before threshold (0–1). Defaults to `0.5`. */
    dragMultiplier: number
    /** Enables pointer pull with mouse in addition to touch/pen. Defaults to `true`. */
    enableMouse: boolean
    /** Optional external scroll container selector or element. */
    scrollTarget: string | HTMLElement | null
    /** Accessible live announcement when pulling. */
    pullLabel: string
    /** Accessible live announcement when threshold is reached. */
    releaseLabel: string
    /** Accessible live announcement while refreshing. */
    refreshingLabel: string
}

export interface IMDCPullToRefreshEvents {
    'refresh': CustomEvent<IMDCPullToRefreshEventDetail>
    'pull-state-change': CustomEvent<IMDCPullToRefreshStateChangeDetail>
    'pull-progress': CustomEvent<IMDCPullToRefreshProgressDetail>
}

export interface IMDCPullToRefresh extends LitElement, IMDCPullToRefreshAttributes {
    /** Current gesture/refresh state. */
    readonly pullState: PullToRefreshState
    /** Current damped pull distance in px. */
    readonly pullDistance: number
    /** Normalized pull progress (`0`–`1`). */
    readonly progress: number
    /** Programmatically enters the `refreshing` state and dispatches `refresh`. */
    triggerRefresh(): void
    /** Programmatically exits the `refreshing` state (`refreshing = false`). */
    complete(): void
}

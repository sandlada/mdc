/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import type { SnackbarAnimationMode, SnackbarDuration, SnackbarVariant } from './snackbar.interface'

/**
 * Screen placement for the snackbar host.
 */
export type SnackbarPlacement =
    | 'bottom-center'
    | 'bottom-start'
    | 'bottom-end'
    | 'top-center'
    | 'top-start'
    | 'top-end'

export const SnackbarPlacement = {
    BottomCenter: 'bottom-center',
    BottomStart : 'bottom-start',
    BottomEnd   : 'bottom-end',
    TopCenter   : 'top-center',
    TopStart    : 'top-start',
    TopEnd      : 'top-end',
} as const satisfies Record<string, SnackbarPlacement>

/**
 * Reason/result when a snackbar closes or is dismissed.
 * - `action`: user clicked the action button
 * - `close`: user clicked the close icon button
 * - `timeout`: duration expired
 * - `dismiss`: programmatically dismissed or replaced
 */
export type SnackbarResult = 'action' | 'close' | 'timeout' | 'dismiss'

export const SnackbarResult = {
    Action : 'action',
    Close  : 'close',
    Timeout: 'timeout',
    Dismiss: 'dismiss',
} as const satisfies Record<string, SnackbarResult>

/**
 * Options for showing a snackbar through the host.
 */
export interface SnackbarShowOptions {
    /** Main text message to display. */
    message: string
    /** Optional action button text. */
    action?: string
    /** Duration before auto-dismiss. */
    duration?: SnackbarDuration
    /** Visual color variant. */
    variant?: SnackbarVariant
    /** Entrance/exit animation mode. */
    animationMode?: SnackbarAnimationMode
    /** Whether message allows multiple lines. */
    multiline?: boolean
    /** Whether to show a close icon button. */
    hasCloseIcon?: boolean
}

/**
 * Internal queue item.
 */
export interface ISnackbarQueueItem {
    id: string
    options: SnackbarShowOptions
    resolve: (result: SnackbarResult) => void
}

/**
 * Detail payload for the `mdc-snackbar-show` event.
 */
export interface ISnackbarShowEventDetail extends SnackbarShowOptions {
    resolve?: (result: SnackbarResult) => void
}

/** Name of the event dispatched to request a snackbar display from any child element. */
export const MDC_SNACKBAR_SHOW_EVENT = 'mdc-snackbar-show'

/**
 * Snackbar Host component interface.
 */
export interface ISnackbarHost extends LitElement {
    /** Placement of the snackbar on the screen/container. */
    placement: SnackbarPlacement

    /** Show a snackbar and await the user interaction or dismiss result. */
    show(options: SnackbarShowOptions | string): Promise<SnackbarResult>

    /** Dismiss currently showing snackbar. */
    dismissCurrent(reason?: SnackbarResult): void

    /** Clear all queued snackbars. */
    clearQueue(): void
}

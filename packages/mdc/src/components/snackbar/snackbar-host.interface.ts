/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import {
    SnackbarResult,
    type SnackbarAnimationMode,
    type SnackbarDuration,
    type SnackbarVariant,
} from './snackbar.interface'

export { SnackbarResult }

/**
 * Screen placement for the snackbar host.
 */
export const SnackbarPlacement = {
    BottomCenter: 'bottom-center',
    BottomStart : 'bottom-start',
    BottomEnd   : 'bottom-end',
    TopCenter   : 'top-center',
    TopStart    : 'top-start',
    TopEnd      : 'top-end',
} as const
export type SnackbarPlacement = (typeof SnackbarPlacement)[keyof typeof SnackbarPlacement]

/**
 * Options for showing a snackbar through the host.
 */
export interface SnackbarShowOptions {
    /** Main text message to display. */
    message: string
    /** Optional action button text. */
    action?: string
    /** Duration before auto-dismiss (preset or custom milliseconds). */
    duration?: SnackbarDuration | number
    /** Visual color variant. */
    variant?: SnackbarVariant
    /** Entrance/exit animation mode. */
    animationMode?: SnackbarAnimationMode
    /** Whether message allows multiple lines. */
    multiline?: boolean
    /** Places the action button on a separate line below the message. */
    actionOnNewLine?: boolean
    /** Allows horizontal swipe-to-dismiss gesture. */
    swipeToDismiss?: boolean
    /** Whether to show a close icon button. */
    hasCloseIcon?: boolean
    /** Optional coalescing tag. If an active or queued snackbar has the same tag, it is updated in place. */
    tag?: string
    /** If true, dismisses the currently visible snackbar immediately and shows this one next. */
    replace?: boolean
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
export const MdcSnackbarShowEvent = 'mdc-snackbar-show'

/**
 * Snackbar Host component interface.
 */
export interface ISnackbarHost extends LitElement {
    /** Placement of the snackbar on the screen/container. */
    placement: SnackbarPlacement

    /** Maximum number of simultaneously visible snackbars (1 = strict MD3 sequential; >1 = stacked). */
    maxVisible: number

    /** Show a snackbar and await the user interaction or dismiss result. */
    show(options: SnackbarShowOptions | string): Promise<SnackbarResult>

    /** Dismiss currently showing snackbar. */
    dismissCurrent(reason?: SnackbarResult): void

    /** Dismiss all currently showing snackbars. */
    dismissAll(reason?: SnackbarResult): void

    /** Clear all queued snackbars. */
    clearQueue(): void
}

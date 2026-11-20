/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Duration of the snackbar display.
 * - `short`: 4 seconds
 * - `long`: 10 seconds
 * - `indefinite`: remains until dismissed
 */
export const SnackbarDuration = {
    Short     : 'short',
    Long      : 'long',
    Indefinite: 'indefinite',
} as const
export type SnackbarDuration = (typeof SnackbarDuration)[keyof typeof SnackbarDuration]

/**
 * Animation mode for snackbar entrance/exit.
 * - `slide`: translates from bottom (or top when top-placed)
 * - `fade`: opacity and scale transition
 */
export const SnackbarAnimationMode = {
    Slide: 'slide',
    Fade : 'fade',
} as const
export type SnackbarAnimationMode = (typeof SnackbarAnimationMode)[keyof typeof SnackbarAnimationMode]

/**
 * Color variant of the snackbar.
 * Controls the background, label, action, icon, and close-icon colors.
 */
export const SnackbarVariant = {
    Surface           : 'surface',
    InverseSurface    : 'inverse-surface',
    Primary           : 'primary',
    Secondary         : 'secondary',
    Tertiary          : 'tertiary',
    Error             : 'error',
    PrimaryContainer  : 'primary-container',
    SecondaryContainer: 'secondary-container',
    TertiaryContainer : 'tertiary-container',
    ErrorContainer    : 'error-container',
} as const
export type SnackbarVariant = (typeof SnackbarVariant)[keyof typeof SnackbarVariant]

/**
 * Reason/result when a snackbar closes or is dismissed.
 * - `action`: user clicked the action button
 * - `close`: user clicked the close icon button
 * - `timeout`: duration expired
 * - `swipe`: user swiped the snackbar away
 * - `dismiss`: programmatically dismissed or replaced
 */
export const SnackbarResult = {
    Action : 'action',
    Close  : 'close',
    Timeout: 'timeout',
    Swipe  : 'swipe',
    Dismiss: 'dismiss',
} as const
export type SnackbarResult = (typeof SnackbarResult)[keyof typeof SnackbarResult]

/**
 * A brief message displayed at the bottom (or top) of the screen.
 */
export interface ISnackbar extends LitElement {
    /** Controls the visibility of the snackbar. */
    open: boolean
    /** Duration before auto-dismiss (preset or custom milliseconds). */
    duration: SnackbarDuration | number
    /** Animation mode for entrance/exit. */
    animationMode: SnackbarAnimationMode
    /** Color variant of the snackbar. */
    variant: SnackbarVariant
    /** Whether the snackbar allows multiple lines of text. */
    multiline: boolean
    /** Places the action button on a separate line below the message (MD3 two-line/long-action layout). */
    actionOnNewLine: boolean
    /** Allows horizontal swipe-to-dismiss gesture (Android `SwipeDismissBehavior`). */
    swipeToDismiss: boolean
    /** Whether the snackbar has a close icon button. */
    hasCloseIcon: boolean
    /** Whether the snackbar has an action button. */
    hasAction: boolean
    /** Whether the snackbar has a leading icon. */
    hasIcon: boolean
}

/**
 * Detail payload of the `snackbar-action` event.
 */
export interface ISnackbarActionEventDetail {
    action: string
}

/**
 * Detail payload of the `snackbar-closing` and `snackbar-closed` events.
 */
export interface ISnackbarCloseEventDetail {
    reason: SnackbarResult
}

/** Name of the event fired when the snackbar starts opening. */
export const SnackbarOpeningEvent = 'snackbar-opening'
/** Name of the event fired when the snackbar is fully open. */
export const SnackbarOpenedEvent = 'snackbar-opened'
/** Name of the event fired when the snackbar starts closing. */
export const SnackbarClosingEvent = 'snackbar-closing'
/** Name of the event fired when the snackbar is fully closed. */
export const SnackbarClosedEvent = 'snackbar-closed'
/** Name of the event fired when the action button is clicked. */
export const SnackbarActionEvent = 'snackbar-action'

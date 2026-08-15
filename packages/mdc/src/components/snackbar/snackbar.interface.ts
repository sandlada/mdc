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
export type SnackbarDuration = 'short' | 'long' | 'indefinite'

/**
 * Animation mode for snackbar entrance/exit.
 * - `slide`: translates from bottom
 * - `fade`: opacity transition
 */
export type SnackbarAnimationMode = 'slide' | 'fade'

/**
 * Color variant of the snackbar.
 * Controls the background, label, action, icon, and close-icon colors.
 */
export type SnackbarVariant =
    | 'surface' | 'inverse-surface'
    | 'primary' | 'secondary' | 'tertiary' | 'error'
    | 'primary-container' | 'secondary-container' | 'tertiary-container' | 'error-container'

/**
 * A brief message displayed at the bottom of the screen.
 */
export interface ISnackbar extends LitElement {
    /** Controls the visibility of the snackbar. */
    open: boolean
    /** Duration before auto-dismiss. */
    duration: SnackbarDuration
    /** Animation mode for entrance/exit. */
    animationMode: SnackbarAnimationMode
    /** Color variant of the snackbar. */
    variant: SnackbarVariant
    /** Whether the snackbar has multiple lines of text. */
    multiline: boolean
    /** Whether the snackbar has an action button. */
    hasAction: boolean
    /** Whether the snackbar has a close icon. */
    hasCloseIcon: boolean
    /** Whether the snackbar has a leading icon. */
    hasIcon: boolean
}

/**
 * Detail payload of the `snackbar-action` event.
 */
export interface ISnackbarActionEventDetail {
    action: string
}

/** Name of the event fired when the snackbar starts opening. */
export const SNACKBAR_OPENING_EVENT = 'snackbar-opening'
/** Name of the event fired when the snackbar is fully open. */
export const SNACKBAR_OPENED_EVENT = 'snackbar-opened'
/** Name of the event fired when the snackbar starts closing. */
export const SNACKBAR_CLOSING_EVENT = 'snackbar-closing'
/** Name of the event fired when the snackbar is fully closed. */
export const SNACKBAR_CLOSED_EVENT = 'snackbar-closed'
/** Name of the event fired when the action button is clicked. */
export const SNACKBAR_ACTION_EVENT = 'snackbar-action'

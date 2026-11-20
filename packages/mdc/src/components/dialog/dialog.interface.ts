/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Dialog semantic type.
 * - `''`: standard dialog (`role="dialog"`)
 * - `'alert'`: alert dialog (`role="alertdialog"`)
 */
export const DialogType = {
    Standard: '',
    Alert   : 'alert',
} as const
export type DialogType = (typeof DialogType)[keyof typeof DialogType]

/**
 * Dialog input attributes.
 */
export interface IDialogAttributes {
    /** Whether the dialog is open. */
    open: boolean
    /** Skips opening and closing animations. */
    quick: boolean
    /** The dialog's return value. */
    returnValue: string
    /** The type of dialog for accessibility ('alert' sets role="alertdialog"). */
    type: DialogType
    /** Disables focus trapping within the dialog. */
    noFocusTrap: boolean
    /** Whether clicking outside the dialog (on the scrim) dismisses it. */
    dismissOnClickOutside: boolean
    /** Whether pressing the Escape key dismisses the dialog. */
    dismissOnEscape: boolean
}

/**
 * Dialog DOM events map.
 */
export interface IDialogEvents {
    'open'  : Event
    'opened': Event
    'close' : Event
    'closed': Event
    'cancel': Event
}

/**
 * Dialog component contract.
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/dialogs/specs
 */
export interface IDialog extends LitElement, IDialogAttributes {
    /** Opens the dialog. */
    show(): Promise<void>
    /** Closes the dialog. */
    close(returnValue?: string): Promise<void>
}

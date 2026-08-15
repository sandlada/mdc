/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Dialog component contract.
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/dialogs/specs
 */
export interface IDialog extends LitElement {
    /** Whether the dialog is open. */
    open: boolean
    /** Skips opening and closing animations. */
    quick: boolean
    /** The dialog's return value. */
    returnValue: string
    /** The type of dialog for accessibility ('alert' sets role="alertdialog"). */
    type: 'alert' | ''
    /** Disables focus trapping within the dialog. */
    noFocusTrap: boolean
    /** Opens the dialog. */
    show(): Promise<void>
    /** Closes the dialog. */
    close(returnValue?: string): Promise<void>
}

/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Visual variant of the side sheet. Standard co-exists with main UI;
 * modal blocks interaction via a scrim.
 */
export type SideSheetVariant = 'standard' | 'modal'

/**
 * Viewport edge the sheet docks to. RTL-aware: in `dir="rtl"`, the visual
 * mapping follows `inset-inline-end` / `inset-inline-start` automatically.
 */
export type SideSheetEdge = 'start' | 'end'

/**
 * Why the sheet is closing. Reported via the `side-sheet-closed` event detail.
 * - `programmatic`: consumer called `hide()` or `close()`
 * - `escape`: modal's Esc key (when `cancelable=true`)
 * - `scrim`: modal's scrim tap (when `cancelable=true`)
 * - `close-button`: the close icon-button was clicked
 * - `back-button`: the back icon-button was clicked (modal + `show-back-button`)
 */
export type SideSheetCloseReason =
    | 'programmatic'
    | 'escape'
    | 'scrim'
    | 'close-button'
    | 'back-button'

/**
 * Detail payload of the `side-sheet-closed` event.
 */
export interface ISideSheetClosedEventDetail {
    returnValue: string
    reason: SideSheetCloseReason
}

/**
 * Detail payload of the `side-sheet-cancel` event (modal only).
 * Fires before `side-sheet-closing` when the user attempted to dismiss
 * the sheet via Esc or by tapping the scrim.
 */
export interface ISideSheetCancelEventDetail {
    reason: 'escape' | 'scrim'
}

/**
 * Detail payload of the `side-sheet-action` event.
 * The action source distinguishes whether the close or back icon was clicked.
 */
export interface ISideSheetActionEventDetail {
    source: 'close' | 'back'
}

/**
 * Side sheet component contract.
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/side-sheets/guidelines
 */
export interface ISideSheet extends LitElement {
    /** Visual variant. */
    variant: SideSheetVariant
    /** Visibility driver. */
    open: boolean
    /** Edge the sheet docks to. */
    sheetEdge: SideSheetEdge
    /** Hard ceiling on panel width in CSS px. */
    maxWidth: number
    /** Skip opening/closing animations. */
    quick: boolean
    /** Modal only — drives Esc and outside-tap dismissal. Ignored when `variant='standard'`. */
    cancelable: boolean
    /** Disable focus traps. */
    noFocusTrap: boolean
    /** Round-tripped in `side-sheet-closed` event detail. */
    returnValue: string
    /** Modal only — surface a back icon-button in the headline row. */
    showBackButton: boolean
    /** Reserved for v2 drag gesture. Recognized but no handler installed in v1. */
    draggable: boolean

    /** Open the sheet and resolve when the entrance transition completes. */
    show(): Promise<void>
    /** Close the sheet and resolve when the exit transition completes. */
    hide(): Promise<void>
    /** Close the sheet with a return value. */
    close(returnValue?: string): Promise<void>
}

/** Fired when the sheet begins to open. */
export const SIDE_SHEET_OPENING_EVENT = 'side-sheet-opening'
/** Fired when the sheet has finished opening. */
export const SIDE_SHEET_OPENED_EVENT = 'side-sheet-opened'
/** Fired when the sheet begins to close. */
export const SIDE_SHEET_CLOSING_EVENT = 'side-sheet-closing'
/** Fired when the sheet has finished closing. */
export const SIDE_SHEET_CLOSED_EVENT = 'side-sheet-closed'
/** Modal only — fired before `closing` when Esc or scrim is invoked. */
export const SIDE_SHEET_CANCEL_EVENT = 'side-sheet-cancel'
/** Fired when the default close or back icon-button is clicked. */
export const SIDE_SHEET_ACTION_EVENT = 'side-sheet-action'
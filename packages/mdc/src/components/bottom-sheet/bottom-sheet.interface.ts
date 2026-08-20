/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Visual variant of the bottom sheet. Standard co-exists with main UI;
 * modal blocks interaction via a scrim.
 */
export type BottomSheetVariant = 'standard' | 'modal'

/**
 * Vertical snap position for the modal variant. Ignored when
 * `variant='standard'`.
 */
export type BottomSheetDetent = 'peek' | 'full'

/**
 * Why the sheet is closing. Reported via the `bottom-sheet-closed` event detail.
 * - `programmatic`  : consumer called `hide()` or `close()`
 * - `escape`       : modal's Esc key (when `cancelable=true`)
 * - `scrim`        : modal's scrim tap (when `cancelable=true`)
 * - `drag`         : drag gesture committed close (when `draggable=true`)
 */
export type BottomSheetCloseReason =
    | 'programmatic'
    | 'escape'
    | 'scrim'
    | 'drag'

/**
 * Detail payload of the `bottom-sheet-closed` event.
 */
export interface IBottomSheetClosedEventDetail {
    returnValue: string
    reason: BottomSheetCloseReason
}

/**
 * Detail payload of the `bottom-sheet-cancel` event (modal only).
 * Fires before `bottom-sheet-closing` when the user attempted to dismiss
 * the sheet via Esc or by tapping the scrim.
 */
export interface IBottomSheetCancelEventDetail {
    reason: 'escape' | 'scrim'
}

/**
 * Detail payload of the `bottom-sheet-drag-start` event.
 * `detent` is the snap position the sheet was at when the drag engaged.
 */
export interface IBottomSheetDragStartEventDetail {
    detent: BottomSheetDetent
}

/**
 * Detail payload of the `bottom-sheet-drag` event.
 * `dy` is the live drag offset in CSS px (>= 0 for bottom-sheet).
 * `progress` is `clamp(dy / containerHeight, 0, 1)`.
 */
export interface IBottomSheetDragEventDetail {
    dy: number
    progress: number
}

/**
 * Detail payload of the `bottom-sheet-drag-end` event.
 * `committed=true` means the drag triggered a close. `reason` distinguishes
 * which threshold triggered the close (only present when `committed=true`).
 */
export interface IBottomSheetDragEndEventDetail {
    committed: boolean
    reason?: 'distance' | 'velocity' | 'cancel'
}

/**
 * Bottom sheet component contract.
 *
 * The element renders two things only: a drag handle (for swipe-to-dismiss)
 * and a content panel for the default slot. Header titles, close buttons,
 * and action rows are intentionally NOT provided — developers compose those
 * inside the default slot.
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/bottom-sheets/overview
 */
export interface IBottomSheet extends LitElement {
    /** Visual variant. */
    variant: BottomSheetVariant
    /** Visibility driver. */
    open: boolean
    /** Modal only — vertical snap position. Ignored when `variant='standard'`. */
    detent: BottomSheetDetent
    /** Skip opening/closing animations. */
    quick: boolean
    /** Modal only — drives Esc and outside-tap dismissal. Ignored when `variant='standard'`. */
    cancelable: boolean
    /** Disable focus traps. */
    noFocusTrap: boolean
    /** Round-tripped in `bottom-sheet-closed` event detail. */
    returnValue: string
    /**
     * When `true` (default), pointer-down on the drag handle initiates a
     * vertical swipe-to-dismiss gesture. The handle is the swipe affordance;
     * the rest of the container does NOT start a drag.
     */
    draggable: boolean
    /**
     * Hide the drag handle's visual bar (the handle element remains in the
     * shadow DOM so swipe-to-dismiss continues to work from its position).
     */
    hideDragHandle: boolean
    /** Hard ceiling on container height in CSS px. `0` (default) means no ceiling. */
    maxHeight: number

    /** Open the sheet and resolve when the entrance transition completes. */
    show(): Promise<void>
    /** Close the sheet and resolve when the exit transition completes. */
    hide(): Promise<void>
    /** Close the sheet with a return value. */
    close(returnValue?: string): Promise<void>
}

/** Fired when the sheet begins to open. */
export const BOTTOM_SHEET_OPENING_EVENT = 'bottom-sheet-opening'
/** Fired when the sheet has finished opening. */
export const BOTTOM_SHEET_OPENED_EVENT = 'bottom-sheet-opened'
/** Fired when the sheet begins to close. */
export const BOTTOM_SHEET_CLOSING_EVENT = 'bottom-sheet-closing'
/** Fired when the sheet has finished closing. */
export const BOTTOM_SHEET_CLOSED_EVENT = 'bottom-sheet-closed'
/** Modal only — fired before `closing` when Esc or scrim is invoked. */
export const BOTTOM_SHEET_CANCEL_EVENT = 'bottom-sheet-cancel'
/** Fired when a drag gesture engages. Only when `draggable=true`. */
export const BOTTOM_SHEET_DRAG_START_EVENT = 'bottom-sheet-drag-start'
/** Fired (throttled to rAF) during an active drag. Only when `draggable=true`. */
export const BOTTOM_SHEET_DRAG_EVENT = 'bottom-sheet-drag'
/** Fired when a drag gesture ends. Only when `draggable=true`. */
export const BOTTOM_SHEET_DRAG_END_EVENT = 'bottom-sheet-drag-end'

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
 * Physical viewport edge the sheet docks to. Physical — `left` anchors to
 * the viewport's left edge and `right` to its right edge regardless of the
 * `dir` context. Flip-driven drag relocation swaps this value.
 */
export type SideSheetPosition = 'left' | 'right'

/**
 * Drag-handle presentation of the side sheet.
 * - `open-only` (default): the handle renders on the open sheet only;
 *   a closed sheet exposes nothing and cannot be dragged out.
 * - `peek`: a closed sheet stays as a docked sliver exposing the handle;
 *   dragging the handle pulls the sheet out (open) or pushes it back
 *   (close). Requires `variant='standard'` and `draggable`.
 */
export type SideSheetHandleMode = 'open-only' | 'peek'

/**
 * Why the sheet is closing. Reported via the `side-sheet-closed` event detail.
 * - `programmatic`: consumer called `hide()` or `close()`
 * - `escape`: modal's Esc key (when `cancelable=true`)
 * - `scrim`: modal's scrim tap (when `cancelable=true`)
 * - `close-button`: the close icon-button was clicked
 * - `back-button`: the back icon-button was clicked (modal + `show-back-button`)
 * - `drag`: the handle drag committed a dismissal
 */
export type SideSheetCloseReason =
    | 'programmatic'
    | 'escape'
    | 'scrim'
    | 'close-button'
    | 'back-button'
    | 'drag'

/**
 * Snap target decided on release of a drag gesture.
 * - `closed`: commit the dismissal.
 * - `open`: snap back to the open resting position.
 * - `peek`: snap back to the peek sliver (peek mode, closed sheet).
 * - `reveal`: commit opening from the peek sliver.
 * - `relocate`: re-dock to the opposite edge (see `relocateTo` in the
 *   drag-end detail).
 */
export type SideSheetDragTarget = 'closed' | 'open' | 'peek' | 'reveal' | 'relocate'

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
 * Detail payload of the `side-sheet-drag-start` event.
 */
export interface ISideSheetDragStartEventDetail {
    /** Physical side the sheet is docked to when the gesture engages. */
    position: SideSheetPosition
}

/**
 * Detail payload of the `side-sheet-drag` event.
 */
export interface ISideSheetDragEventDetail {
    /** Live horizontal delta (px) from resting position. */
    dx: number
    /** Fractional progress [0..1] towards dismiss / reveal. */
    progress: number
}

/**
 * Detail payload of the `side-sheet-drag-end` event.
 */
export interface ISideSheetDragEndEventDetail {
    /** True when the drag decided to commit a state change. */
    committed: boolean
    /** Snap target decided by the release heuristics. */
    target: SideSheetDragTarget
    /** Whether committed via velocity or distance. */
    reason?: 'distance' | 'velocity' | 'cancel'
    /** The horizontal translation at the instant of release. */
    dx: number
    /** When `target === 'relocate'`: the physical side to re-dock to. */
    relocateTo?: SideSheetPosition
}

/**
 * Detail payload of the `side-sheet-relocate` event. Fired after a
 * handle-driven drag crosses the viewport midline and the sheet has
 * re-docked to the opposite edge with its transition.
 */
export interface ISideSheetRelocateEventDetail {
    position: SideSheetPosition
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
    /** Physical edge the sheet docks to. */
    position: SideSheetPosition
    /** Drag-handle presentation. */
    handleMode: SideSheetHandleMode
    /**
     * Hard ceiling on panel width in CSS px.
     * `0` (default) means no ceiling — width is driven solely by the
     * `--mdc-side-sheet-enabled-container-width` token.
     */
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
    /** Handle-drag gestures (dismiss / relocate / peek reveal). */
    draggable: boolean

    /** Open the sheet and resolve when the entrance transition completes. */
    show(): Promise<void>
    /** Close the sheet and resolve when the exit transition completes. */
    hide(): Promise<void>
    /** Close the sheet with a return value. */
    close(returnValue?: string): Promise<void>
    /**
     * Relocate the sheet to the given physical edge with a transition.
     * Resolves when the relocation transition completes.
     */
    relocate(position: SideSheetPosition): Promise<void>
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
/** Fired when a pointer drag engages. */
export const SIDE_SHEET_DRAG_START_EVENT = 'side-sheet-drag-start'
/** Fired on every pointer move while a drag is active. */
export const SIDE_SHEET_DRAG_EVENT = 'side-sheet-drag'
/** Fired when the pointer is released after an active drag. */
export const SIDE_SHEET_DRAG_END_EVENT = 'side-sheet-drag-end'
/** Fired after a handle drag relocated the sheet to the opposite edge. */
export const SIDE_SHEET_RELOCATE_EVENT = 'side-sheet-relocate'

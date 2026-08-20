/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import type { IMixinElevationAttributes } from '../elevation/elevation-options.mixin'

/**
 * Visual variant of the bottom sheet. Standard co-exists with main UI;
 * modal blocks interaction via a scrim.
 */
export type BottomSheetVariant = 'standard' | 'modal'

/**
 * Vertical snap position (detent). Supported for both standard and modal variants
 * per Material Design 3 guidelines:
 * - 'peek' : Peek state (Peek態) — resting compact height (e.g. mini-player, preview, header only)
 * - 'full' : Full / Expanded state (完全態) — expanded maximum height (header + content)
 * Combined with `open=false` (關閉態 / Closed), both standard and modal bottom sheets support all 3 stages.
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
 * Snap target decided upon drag release:
 * - 'full'   : Snap to full / expanded state (完全態)
 * - 'peek'   : Snap to peek / collapsed state (Peek態)
 * - 'closed' : Commit close / hidden state (關閉態)
 */
export type BottomSheetDragTarget = 'full' | 'peek' | 'closed'

/**
 * Detail payload of the `bottom-sheet-drag-end` event.
 * `committed=true` means the drag triggered a close (`target === 'closed'`).
 * `target` specifies the 3-state snap target ('full' | 'peek' | 'closed').
 * `reason` distinguishes which threshold triggered the decision.
 */
export interface IBottomSheetDragEndEventDetail {
    committed: boolean
    target?: BottomSheetDragTarget
    reason?: 'distance' | 'velocity' | 'cancel'
    dy?: number
}

/**
 * Bottom sheet component contract.
 *
 * The element provides a two-slot layout:
 * - `slot="header"` (upper slot) : displayed in both 'peek' and 'full' states.
 *   Ideal for titles, mini-players, search bars, or compact action bars.
 * - default slot (lower slot / body content) : displayed only in 'full' state;
 *   hidden in 'peek' state.
 *
 * Variants:
 * - `standard`: co-exists with main UI, renders NO scrim, supports 3-stage
 *   display (closed, peek, full) and single-step drag transitions.
 * - `modal`: displays a scrim backdrop, traps focus, dismissible via Esc or scrim tap,
 *   supports 3-stage display (closed, peek, full) and single-step drag transitions.
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/bottom-sheets/overview
 */
export interface IBottomSheet extends LitElement, IMixinElevationAttributes {
    /** Visual variant ('standard' | 'modal'). */
    variant: BottomSheetVariant
    /** Visibility driver. */
    open: boolean
    /** Vertical snap position ('peek' | 'full'). Supported in both standard and modal variants. */
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

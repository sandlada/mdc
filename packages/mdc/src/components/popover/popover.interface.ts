/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Visual variant of `mdc-popover`.
 *
 * - `standard` — `surface-container-low` surface with Level2 elevation.
 * - `outlined` — `surface` with `outline-variant` border and Level1 elevation.
 * - `vibrant`  — `tertiary-container` expressive surface with Level2 elevation.
 */
export const PopoverVariants = {
    Standard: 'standard',
    Outlined: 'outlined',
    Vibrant: 'vibrant',
} as const
export type PopoverVariants = (typeof PopoverVariants)[keyof typeof PopoverVariants]

/**
 * Trigger mode for `mdc-popover`.
 *
 * - `click`  — Toggle on anchor click.
 * - `hover`  — Open on pointer enter / focus, close on pointer leave / blur.
 * - `focus`  — Open on focusin, close on focusout.
 * - `manual` — Controlled programmatically via `open`, `show()`, `hide()`, or `showAt(x, y)`.
 */
export const PopoverTriggerModes = {
    Click: 'click',
    Hover: 'hover',
    Focus: 'focus',
    Manual: 'manual',
} as const
export type PopoverTriggerModes = (typeof PopoverTriggerModes)[keyof typeof PopoverTriggerModes]

/**
 * Placement of the popover surface relative to its anchor.
 * Mirrors `@floating-ui/dom` Placement values.
 */
export const PopoverPlacements = {
    Top: 'top',
    TopStart: 'top-start',
    TopEnd: 'top-end',
    Bottom: 'bottom',
    BottomStart: 'bottom-start',
    BottomEnd: 'bottom-end',
    Left: 'left',
    LeftStart: 'left-start',
    LeftEnd: 'left-end',
    Right: 'right',
    RightStart: 'right-start',
    RightEnd: 'right-end',
} as const
export type PopoverPlacements = (typeof PopoverPlacements)[keyof typeof PopoverPlacements]

/**
 * Reason why a popover was dismissed.
 */
export const PopoverDismissReasons = {
    OutsideClick: 'outside-click',
    Escape: 'escape',
    AnchorClick: 'anchor-click',
    PointerLeave: 'pointer-leave',
    Scroll: 'scroll',
    Programmatic: 'programmatic',
    Exclusive: 'exclusive',
} as const
export type PopoverDismissReasons = (typeof PopoverDismissReasons)[keyof typeof PopoverDismissReasons]

/**
 * Virtual anchor coordinates for positioning a popover at an arbitrary point.
 */
export interface IPopoverPoint {
    readonly x: number
    readonly y: number
}

export interface IMDCPopoverAttributes {
    /** Whether the popover surface is open. */
    open: boolean
    /** Visual variant (`standard`, `outlined`, `vibrant`). */
    variant: PopoverVariants
    /** Preferred placement relative to the anchor. */
    placement: PopoverPlacements
    /** How the popover is triggered (`click`, `hover`, `focus`, `manual`). */
    trigger: PopoverTriggerModes
    /** Gap in pixels between the anchor and the popover surface. */
    offset: number
    /** Whether to display a directional arrow pointing toward the anchor. */
    arrow: boolean
    /** Whether to show a modal backdrop scrim behind the popover. */
    modal: boolean
    /** Disables open/close animations. */
    quick: boolean
    /** Disables `@floating-ui/dom` flip middleware. */
    disableFlip: boolean
    /** Closes the popover when an ancestor or window scrolls. */
    closeOnScroll: boolean
    /** ID of an external anchor element in the same root node. */
    for: string
    /** Accessible label for the popover dialog surface. */
    label: string | null
    /** Whether to display a close icon button in the header. */
    closable: boolean
    /** Delay in ms before showing on hover. */
    showDelay: number
    /** Delay in ms before hiding on hover leave. */
    hideDelay: number
}

export interface IMDCPopoverLifecycleDetail {
    popover: IMDCPopover
    reason?: PopoverDismissReasons
}

export interface IMDCPopoverEvents {
    'popover-showing': CustomEvent<IMDCPopoverLifecycleDetail>
    'popover-opened': CustomEvent<IMDCPopoverLifecycleDetail>
    'popover-hiding': CustomEvent<IMDCPopoverLifecycleDetail>
    'popover-closed': CustomEvent<IMDCPopoverLifecycleDetail>
}

export const PopoverShowingEvent = 'popover-showing'
export const PopoverOpenedEvent = 'popover-opened'
export const PopoverHidingEvent = 'popover-hiding'
export const PopoverClosedEvent = 'popover-closed'

/**
 * Material Design 3 Popover component contract.
 *
 * @slot - Rich content rendered inside the popover surface.
 * @slot trigger - The anchor element that triggers the popover.
 * @slot header - Optional header content inside the popover surface.
 * @slot footer - Optional footer/actions content inside the popover surface.
 */
export interface IMDCPopover extends LitElement, IMDCPopoverAttributes {
    /** Opens the popover relative to its anchor element. */
    show(): Promise<void>
    /** Opens the popover at explicit viewport coordinates `(x, y)`. */
    showAt(x: number, y: number): Promise<void>
    /** Closes the popover. */
    hide(reason?: PopoverDismissReasons): Promise<void>
    /** Toggles the popover open state. */
    toggle(): Promise<void>
}

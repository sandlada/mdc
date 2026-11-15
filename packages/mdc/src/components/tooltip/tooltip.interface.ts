/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Position of the tooltip relative to its anchor.
 */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

/**
 * A tooltip adds context to an element.
 * Supports plain and rich variants via slots.
 */
export interface ITooltip extends LitElement {
    /** Position of the tooltip. */
    position: TooltipPosition
    /** Whether the tooltip is visible. */
    open: boolean
    /** Whether this is a plain tooltip (auto-detected from slots). */
    plain: boolean
    /** Whether the tooltip has content. */
    hasContent: boolean
    /** Whether the tooltip has action buttons (rich only). */
    hasActions: boolean
}

/**
 * Detail payload of tooltip events.
 */
export interface ITooltipShowEventDetail {
    tooltip: ITooltip
}

/** Name of the event fired when the tooltip starts showing. */
export const TooltipShowingEvent = 'tooltip-showing'
/** Name of the event fired when the tooltip is fully visible. */
export const TooltipShownEvent = 'tooltip-shown'
/** Name of the event fired when the tooltip starts hiding. */
export const TooltipHidingEvent = 'tooltip-hiding'
/** Name of the event fired when the tooltip is fully hidden. */
export const TooltipHiddenEvent = 'tooltip-hidden'

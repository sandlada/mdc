/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Placement of the tooltip relative to its anchor.
 * Mirrors @floating-ui/dom Placement values.
 */
export type TooltipBoxPlacement =
    | 'top' | 'top-start' | 'top-end'
    | 'bottom' | 'bottom-start' | 'bottom-end'
    | 'left' | 'left-start' | 'left-end'
    | 'right' | 'right-start' | 'right-end'

/**
 * What triggers the tooltip to show/hide.
 */
export type TooltipBoxTriggerMode = 'hover' | 'focus' | 'manual'

/**
 * A tooltip-box manages the display and positioning of a tooltip
 * relative to its anchor content. Modeled after Jetpack Compose's TooltipBox.
 *
 * @slot - The anchor content (e.g., a button or icon-button).
 * @slot tooltip - The mdc-tooltip element to display.
 */
export interface ITooltipBox extends LitElement {
    /** Preferred placement of the tooltip relative to the anchor. */
    placement: TooltipBoxPlacement
    /** Gap in pixels between the anchor and the tooltip surface. */
    offset: number
    /** Delay in ms before showing the tooltip on hover. */
    showDelay: number
    /** Delay in ms before hiding the tooltip after pointer leaves. */
    hideDelay: number
    /** What triggers the tooltip to show/hide. */
    trigger: TooltipBoxTriggerMode
    /** Whether the tooltip is currently visible. */
    open: boolean
    /** Disables floating-ui flip middleware. */
    disableFlip: boolean
    /** Disables open/close animations. */
    quick: boolean
    /** Programmatically show the tooltip. */
    show(): Promise<void>
    /** Programmatically hide the tooltip. */
    hide(): Promise<void>
}

/**
 * Detail payload of tooltip-box events.
 */
export interface ITooltipBoxEventDetail {
    tooltipBox: ITooltipBox
}

/** Name of the event fired when the tooltip starts showing. */
export const TOOLTIP_BOX_SHOWING_EVENT = 'tooltip-box-showing'
/** Name of the event fired when the tooltip is fully visible. */
export const TOOLTIP_BOX_SHOWN_EVENT = 'tooltip-box-shown'
/** Name of the event fired when the tooltip starts hiding. */
export const TOOLTIP_BOX_HIDING_EVENT = 'tooltip-box-hiding'
/** Name of the event fired when the tooltip is fully hidden. */
export const TOOLTIP_BOX_HIDDEN_EVENT = 'tooltip-box-hidden'

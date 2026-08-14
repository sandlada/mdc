/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * A single selectable segment inside an `mdc-segmented-button-set`.
 *
 * The segment is a pure view: it renders its label / icon / checkmark and
 * reports pointer activation via the `segmented-button-interaction` event.
 * Selection state is owned by the parent set, so a segment is only meaningful
 * inside an `mdc-segmented-button-set`.
 */
export interface ISegmentedButton extends LitElement {
    /** Whether this segment is currently selected. */
    selected: boolean
    /** When `true` the segment is non-interactive and dimmed. */
    disabled: boolean
    /** When `true`, the checkmark is hidden on the selected state. */
    noCheckmark: boolean
    /** Tab stop of the inner button: `0` when enabled, `-1` when disabled. */
    tabIndex: number
    /** Set when the `icon` slot is populated. */
    hasIcon: boolean
    /** Set when the default (label) slot is populated. */
    hasLabel: boolean
}

/**
 * The parent container that owns selection across its `mdc-segmented-button`
 * children, mirroring the `SegmentedButton` / `ButtonSegment` API shape of the
 * Flutter Material implementation and the Material Web set semantics.
 */
export interface ISegmentedButtonSet extends LitElement {
    /** When `true` any number of segments may be selected (checkbox semantics). */
    multiselect: boolean
    getButtonDisabled(index: number): boolean
    setButtonDisabled(index: number, disabled: boolean): void
    getButtonSelected(index: number): boolean
    setButtonSelected(index: number, selected: boolean): void
    toggleSelection(index: number): void
}

/**
 * `detail` payload of the `segmented-button-set-selection` event.
 */
export interface ISegmentedButtonSetSelectionEventDetail {
    button: ISegmentedButton
    selected: boolean
    index: number
}

/** Name of the event a segment dispatches on activation. */
export const SEGMENTED_BUTTON_INTERACTION_EVENT = 'segmented-button-interaction'
/** Name of the event the set dispatches when a selection changes. */
export const SEGMENTED_BUTTON_SET_SELECTION_EVENT = 'segmented-button-set-selection'

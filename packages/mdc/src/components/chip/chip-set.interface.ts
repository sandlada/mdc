/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import type { IMDCChip } from './chip.interface'

/** Name of the event fired when a chip's selection changes within `mdc-chip-set`. */
export const ChipSetSelectionEvent = 'chip-set-selection'

/**
 * Detail payload of the `chip-set-selection` event.
 */
export interface IMDCChipSetSelectionEventDetail {
    chip: IMDCChip
    selected: boolean
    index: number
}

/**
 * Input attributes for `mdc-chip-set`.
 */
export interface IMDCChipSetAttributes {
    /** When `true`, at most one chip in the set may be selected at a time. */
    singleSelect: boolean
    /** Prevents deselecting the last remaining selected chip (mirrors Android `selectionRequired`). */
    selectionRequired: boolean
    /** Renders chips in a single horizontally scrollable row instead of wrapping. */
    singleLine: boolean
}

/**
 * Custom events emitted by `mdc-chip-set`.
 */
export interface IMDCChipSetEvents {
    'chip-set-selection': CustomEvent<IMDCChipSetSelectionEventDetail>
}

/**
 * A container that groups `mdc-chip` elements, manages roving tabindex,
 * optional single-select / selection-required rules, and single-line or
 * multi-row layout.
 */
export interface IMDCChipSet extends LitElement, IMDCChipSetAttributes {
    /** The `mdc-chip` children in document order. */
    readonly chips: IMDCChip[]
    /** Currently selected `mdc-chip` children. */
    readonly selectedChips: IMDCChip[]
    /** Resolved values of currently selected chips. */
    readonly selectedValues: string[]
}

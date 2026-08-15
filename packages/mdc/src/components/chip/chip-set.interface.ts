/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import type { IChip } from './chip.interface'

/**
 * A container that groups `mdc-chip` elements and manages their roving
 * tabindex and optional single-select mutex.
 */
export interface IChipSet extends LitElement {
    /** When `true`, at most one chip may be selected at a time. */
    singleSelect: boolean
    /** The `mdc-chip` children in document order. */
    readonly chips: IChip[]
}

/**
 * Detail payload of the `chip-set-selection` event.
 */
export interface IChipSetSelectionEventDetail {
    chip: IChip
    selected: boolean
    index: number
}

/** Name of the event fired when a chip's selection changes within the set. */
export const CHIP_SET_SELECTION_EVENT = 'chip-set-selection'

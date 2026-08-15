/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Chip variant type.
 * - `assist`: Guides user during a task with a leading icon
 * - `filter`: Refine content from a set of options (selectable)
 * - `input`: Represents user-provided information (selectable)
 * - `suggestion`: Recommendations based on recent activity
 */
export type ChipVariant = 'assist' | 'filter' | 'input' | 'suggestion'

/**
 * A compact UI element representing complex entities.
 */
export interface IChip extends LitElement {
    /** The chip variant. */
    variant: ChipVariant
    /** Selection state (filter/input only). */
    selected: boolean
    /** Whether the chip is disabled. */
    disabled: boolean
    /** Whether the chip has a leading icon. */
    hasIcon: boolean
    /** Whether the chip has an avatar (input only). */
    hasAvatar: boolean
    /** Whether the chip has a trailing icon (input only). */
    hasTrailingIcon: boolean
    /** Whether the chip has a label. */
    hasLabel: boolean
}

/**
 * Detail payload of the `chip-toggle` event.
 */
export interface IChipToggleEventDetail {
    selected: boolean
    chip: IChip
}

/**
 * Detail payload of the `chip-navigate` event.
 */
export interface IChipNavigateEventDetail {
    chip: IChip
}

/**
 * Detail payload of the `chip-close` event.
 */
export interface IChipCloseEventDetail {
    chip: IChip
}

/** Name of the event fired when selection changes (filter/input). */
export const CHIP_TOGGLE_EVENT = 'chip-toggle'
/** Name of the event fired on assist/suggestion click. */
export const CHIP_NAVIGATE_EVENT = 'chip-navigate'
/** Name of the event fired when close icon is clicked (input). */
export const CHIP_CLOSE_EVENT = 'chip-close'

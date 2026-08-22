/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Visual variant of the button group.
 * - `connected`: Buttons are visually docked side-by-side with 2px spacing and cohesive corner radii.
 * - `standard`: Buttons are separated with standard spacing (8px) and independent shapes.
 */
export type ButtonGroupVariant = 'connected' | 'standard'

/**
 * Selection model enforced by the button group:
 * - `none`: Action group without selection management.
 * - `single`: Radio semantics (at most one item selected).
 * - `multiple`: Checkbox semantics (multiple items can be selected).
 */
export type ButtonGroupSelectionMode = 'none' | 'single' | 'multiple'

/**
 * Size scale matching Material 3 Expressive buttons.
 */
export type ButtonGroupSize = 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'

/**
 * Corner shape variant for button group.
 */
export type ButtonGroupShape = 'round' | 'square'

/**
 * Layout orientation for the button group.
 */
export type ButtonGroupOrientation = 'horizontal' | 'vertical'

/**
 * Event fired when a selection change occurs within the button group.
 */
export const BUTTON_GROUP_SELECTION_EVENT = 'button-group-selection-change'

/**
 * Event fired on any user click / interaction with a child button in the group.
 */
export const BUTTON_GROUP_INTERACTION_EVENT = 'button-group-interaction'

/**
 * Detail payload for the `button-group-selection-change` event.
 */
export interface IButtonGroupSelectionEventDetail {
    /** The element whose selection changed. */
    item: HTMLElement
    /** Whether the item is now selected. */
    selected: boolean
    /** Zero-based index of the item within the button group. */
    index: number
    /** Optional value associated with the item. */
    value?: string
    /** All currently selected elements in the button group. */
    selectedItems: HTMLElement[]
    /** All currently selected indices in the button group. */
    selectedIndexes: number[]
}

/**
 * Public interface contract for `mdc-button-group`.
 */
export interface IButtonGroup extends LitElement {
    /** Visual variant: 'connected' | 'standard'. */
    variant: ButtonGroupVariant

    /** Selection mode: 'none' | 'single' | 'multiple'. */
    selectionMode: ButtonGroupSelectionMode

    /** Size applied to the button group. */
    size: ButtonGroupSize

    /** Shape style: 'round' | 'square'. */
    shape: ButtonGroupShape

    /** Layout orientation: 'horizontal' | 'vertical'. */
    orientation: ButtonGroupOrientation

    /** When true, disables expressive shape morphing on active/selected items. */
    disableMorph: boolean

    /** When true, active/pressed items dynamically expand in width. */
    expandOnActive: boolean

    /** When true, disables all buttons in the group. */
    disabled: boolean

    /** Returns all interactive child buttons in the group. */
    getItems(): HTMLElement[]

    /** Returns all currently selected child items. */
    getSelectedItems(): HTMLElement[]

    /** Returns indices of all currently selected child items. */
    getSelectedIndexes(): number[]

    /** Programmatically sets the selection state of a child at a given index. */
    setIndexSelected(index: number, selected: boolean): void

    /** Programmatically toggles the selection state of a child at a given index. */
    toggleIndexSelected(index: number): void

    /** Sets the disabled state of a child at a given index. */
    setIndexDisabled(index: number, disabled: boolean): void
}

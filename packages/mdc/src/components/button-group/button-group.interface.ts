/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Visual variants of the button group.
 * - `connected`: Buttons are visually docked side-by-side with 2px spacing and cohesive corner radii.
 * - `standard`: Buttons are separated with size-scaled spacing and independent shapes.
 */
export const ButtonGroupVariants = ['connected', 'standard'] as const
export type ButtonGroupVariant = (typeof ButtonGroupVariants)[number]

/**
 * Selection models enforced by the button group:
 * - `none`: Action group without selection management.
 * - `single`: Radio semantics (at most one item selected).
 * - `multiple`: Checkbox semantics (multiple items can be selected).
 */
export const ButtonGroupSelectionModes = ['none', 'single', 'multiple'] as const
export type ButtonGroupSelectionMode = (typeof ButtonGroupSelectionModes)[number]

/**
 * Size scale matching Material 3 Expressive buttons.
 */
export const ButtonGroupSizes = ['extra-small', 'small', 'medium', 'large', 'extra-large'] as const
export type ButtonGroupSize = (typeof ButtonGroupSizes)[number]

/**
 * Corner shape variants for button group.
 */
export const ButtonGroupShapes = ['round', 'square'] as const
export type ButtonGroupShape = (typeof ButtonGroupShapes)[number]

/**
 * Layout orientations for the button group.
 */
export const ButtonGroupOrientations = ['horizontal', 'vertical'] as const
export type ButtonGroupOrientation = (typeof ButtonGroupOrientations)[number]

/**
 * Event fired when a selection change occurs within the button group.
 */
export const ButtonGroupSelectionEvent = 'button-group-selection-change'

/**
 * Event fired on any user click / interaction with a child button in the group.
 */
export const ButtonGroupInteractionEvent = 'button-group-interaction'

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
 * Detail payload for the `button-group-interaction` event.
 */
export interface IButtonGroupInteractionEventDetail {
    /** The interacted element. */
    item: HTMLElement
    /** Zero-based index of the item within the button group. */
    index: number
}

/**
 * Pure input attributes contract for `mdc-button-group`.
 */
export interface IMDCButtonGroupAttributes {
    /** Visual variant: 'connected' | 'standard'. */
    variant: ButtonGroupVariant

    /** Selection mode: 'none' | 'single' | 'multiple'. */
    selectionMode: ButtonGroupSelectionMode

    /** When true in single-selection mode, prevents deselecting the last selected item. */
    selectionRequired: boolean

    /** Size applied to the button group. */
    size: ButtonGroupSize

    /** Shape style: 'round' | 'square'. */
    shape: ButtonGroupShape

    /** Layout orientation: 'horizontal' | 'vertical'. */
    orientation: ButtonGroupOrientation

    /** When true, disables expressive shape morphing on active/selected items. */
    disableMorph: boolean

    /** When true, active/pressed items dynamically expand in width (with neighbor compression in standard variant). */
    expandOnActive: boolean

    /** When true, disables all buttons in the group. */
    disabled: boolean
}

/**
 * Events map for `mdc-button-group`.
 */
export interface IMDCButtonGroupEvents {
    [ButtonGroupSelectionEvent]: CustomEvent<IButtonGroupSelectionEventDetail>
    [ButtonGroupInteractionEvent]: CustomEvent<IButtonGroupInteractionEventDetail>
}

/**
 * Public interface contract for `mdc-button-group`.
 */
export interface IMDCButtonGroup extends LitElement, IMDCButtonGroupAttributes {
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

export type IButtonGroup = IMDCButtonGroup

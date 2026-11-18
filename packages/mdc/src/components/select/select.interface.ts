/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import type { FieldVariant, FloatingLabelBehavior } from '../field/field.interface'

export type { FieldVariant, FloatingLabelBehavior }

/**
 * Placement of the select dropdown menu relative to the field anchor.
 * Mirrors @floating-ui/dom vertical-aligned placements.
 */
export const SelectMenuPlacement = {
    BottomStart: 'bottom-start',
    BottomEnd: 'bottom-end',
    TopStart: 'top-start',
    TopEnd: 'top-end',
} as const
export type SelectMenuPlacement = (typeof SelectMenuPlacement)[keyof typeof SelectMenuPlacement]

/**
 * Color style of the select dropdown menu surface.
 * - `standard` — surface-container-low container, on-surface content.
 * - `vibrant`  — tertiary-container container, on-tertiary-container content.
 */
export const SelectMenuColorStyle = {
    Standard: 'standard',
    Vibrant: 'vibrant',
} as const
export type SelectMenuColorStyle = (typeof SelectMenuColorStyle)[keyof typeof SelectMenuColorStyle]

/**
 * Dispatched (bubbles + composed) when an `mdc-select-option` is activated
 * by click or keyboard selection.
 */
export const SelectOptionRequestSelectionEvent = 'request-selection'

export interface IMDCSelectMenuEventDetail {
    select: IMDCSelect
}

export interface IMDCSelectOptionAttributes {
    /** Value associated with this option. */
    value: string
    /** Whether the option is disabled and cannot be selected. */
    disabled: boolean
    /** Whether the option is currently selected. */
    selected: boolean
    /** Optional override text shown in the select field when this option is selected. */
    displayText: string
    /** Optional supporting text shown below the option label. */
    supportingText: string
    /** Active keyboard-focus highlight state managed by the parent `mdc-select`. */
    active: boolean
    /** Color style inherited from the parent `mdc-select`. */
    variant: SelectMenuColorStyle
}

export interface IMDCSelectOptionEvents {
    'request-selection': CustomEvent<{ option: IMDCSelectOption }>
}

/**
 * Select option component contract (`mdc-select-option`).
 *
 * Represents a single selectable option inside an `mdc-select` dropdown.
 *
 * @slot - The primary option label (headline).
 * @slot start - Leading icon or avatar.
 * @slot end - Trailing icon or metadata.
 * @slot supporting-text - Secondary supporting text below the label.
 */
export interface IMDCSelectOption extends LitElement, IMDCSelectOptionAttributes {
    /** Computed text shown in the select trigger when this option is selected. */
    readonly headlineText: string
    /** Updates the internal text/display cache if needed. */
    focus(options?: FocusOptions): void
}

export interface IMDCSelectAttributes {
    /** Visual variant ('filled' | 'outlined'). Default 'filled'. */
    variant: FieldVariant
    /** Current selected value. */
    value: string
    /** Zero-based index of the currently selected option, or `-1` when none. */
    selectedIndex: number
    /** Name of the select control for form submission. */
    name: string
    /** Floating label text. */
    label: string
    /** Placeholder text shown when empty and the label is floating. */
    placeholder: string
    /** Helper text shown below the field. */
    supportingText: string
    /** Error text shown below the field when invalid. */
    errorText: string
    /** Manual error override flag. */
    error: boolean
    /** Inline prefix text rendered before the selected value. */
    prefixText: string
    /** Inline suffix text rendered after the selected value. */
    suffixText: string
    /** Whether the select control is disabled. */
    disabled: boolean
    /** Whether a selection is required for form validation. */
    required: boolean
    /** Suppresses the required asterisk (*) in the label. */
    noAsterisk: boolean
    /** Whether the dropdown menu is currently open. */
    open: boolean
    /** Skips menu open/close animations. */
    quick: boolean
    /** Controls when the label floats ('auto' | 'always' | 'never'). */
    floatingLabelBehavior: FloatingLabelBehavior
    /** Aligns the display text and tokens to the end of the field. */
    alignEnd: boolean
    /** Clamps the dropdown menu width to match the trigger field width. */
    clampMenuWidth: boolean
    /** Preferred placement of the dropdown menu relative to the field. */
    menuPlacement: SelectMenuPlacement
    /** Color style of the dropdown menu surface ('standard' | 'vibrant'). */
    menuColorStyle: SelectMenuColorStyle
    /** Delay in milliseconds before the typeahead search buffer resets. */
    typeaheadDelay: number
    /** Automatically runs constraint validation on blur/change. */
    autoValidate: boolean
}

export interface IMDCSelectEvents {
    'input': Event
    'change': Event
    'opening': CustomEvent<IMDCSelectMenuEventDetail>
    'opened': CustomEvent<IMDCSelectMenuEventDetail>
    'closing': CustomEvent<IMDCSelectMenuEventDetail>
    'closed': CustomEvent<IMDCSelectMenuEventDetail>
}

/**
 * Material Design 3 Select component contract (`mdc-select`).
 *
 * Exposed dropdown menu combining `mdc-field` chrome with a floating
 * `role="listbox"` menu of `mdc-select-option` items. Participates in HTML
 * `<form>` submission and constraint validation.
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/menus/overview
 */
export interface IMDCSelect extends LitElement, IMDCSelectAttributes {
    /** All `mdc-select-option` children. */
    readonly options: IMDCSelectOption[]
    /** Currently selected `mdc-select-option` children. */
    readonly selectedOptions: IMDCSelectOption[]
    /** Display text of the currently selected option. */
    readonly displayText: string
    /** Opens the dropdown menu. */
    show(): Promise<void>
    /** Closes the dropdown menu. */
    close(): Promise<void>
    /** Selects an option by zero-based index. */
    selectIndex(index: number): void
    /** Selects the first option matching the given value. */
    select(value: string): void
    /** Resets the selection to its initial state. */
    reset(): void
}

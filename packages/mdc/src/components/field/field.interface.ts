/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Visual variant of the field container.
 * - `filled`   : filled background with a bottom-indicator underline.
 * - `outlined` : transparent background with a 4-sided outline and a notch for the label.
 */
export type FieldVariant = 'filled' | 'outlined'

export const FieldVariant = {
    Filled: 'filled',
    Outlined: 'outlined',
} as const satisfies Record<string, FieldVariant>

/**
 * Controls when the label floats.
 * - `auto`  : label floats when the field is focused or populated.
 * - `always`: label always floats (even when empty and unfocused).
 * - `never` : label never floats; rendered as a placeholder inside the input area.
 */
export type FloatingLabelBehavior = 'auto' | 'always' | 'never'

export const FloatingLabelBehavior = {
    Auto: 'auto',
    Always: 'always',
    Never: 'never',
} as const satisfies Record<string, FloatingLabelBehavior>

/**
 * Field component contract.
 *
 * The element is the chrome-only container for text inputs. It renders the
 * visible bounding box, floating label, supporting text, error text, prefix /
 * suffix tokens, and leading / trailing icon slots. The actual input
 * (`<input>`, `<textarea>`, `<select>`, or custom widget) is provided by the
 * consumer in the default slot.
 *
 * Variants:
 * - `filled`   : filled background (SurfaceContainerHighest), bottom indicator underline.
 * - `outlined` : transparent background, 4-sided outline, label notch.
 *
 * State is **manual** — consumers (e.g. `mdc-textfield`) set `populated`,
 * `focused`, `invalid`, and `disabled` in response to events from the input
 * child. `mdc-field` deliberately does not listen to focus / input / invalid
 * events itself, so it remains agnostic to what kind of element sits in the
 * default slot.
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/text-fields/overview
 */
export interface IField extends LitElement {
    /** Visual variant ('filled' | 'outlined'). */
    variant: FieldVariant
    /** Floating label text. */
    label: string
    /** Helper text shown below the field. Replaced by `errorText` when `invalid=true`. */
    supportingText: string
    /** Error text shown below the field when `invalid=true`. */
    errorText: string
    /** Inline prefix text. Renders alongside the `prefix` slot. */
    prefixText: string
    /** Inline suffix text. Renders alongside the `suffix` slot. */
    suffixText: string
    /** Character counter text (e.g. '12 / 50') shown below the field on the trailing side. */
    counterText: string
    /** Whether the field is disabled. Set by the consumer in sync with the input child's disabled state. */
    disabled: boolean
    /** Whether the field is marked as required. Drives the asterisk in the label. */
    required: boolean
    /** Suppresses the required asterisk in the label. */
    noAsterisk: boolean
    /** Whether the input has a value. Drives the floating label animation and the idle stroke color. */
    populated: boolean
    /** Whether the input child has focus. Drives the floating label animation and the focused stroke color. */
    focused: boolean
    /** Whether the input child is invalid. Drives the error color on the label, indicator, and supporting text. */
    invalid: boolean
    /** When the label floats. */
    floatingLabelBehavior: FloatingLabelBehavior
    /** Aligns the prefix / input / suffix to the end of the field. */
    alignEnd: boolean
    /** Whether the field is formatted for a multi-line input (textarea). */
    multiline: boolean
    /** Whether the field is user-resizable. */
    resizable: boolean
}

/** Fired when the user clicks / touches the floating label. */
export const FIELD_LABEL_POINTER_EVENT = 'field-label-pointer'


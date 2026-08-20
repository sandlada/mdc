/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import type { FieldVariant, FloatingLabelBehavior } from '../field/field.interface'

export type { FieldVariant, FloatingLabelBehavior }

/**
 * Input type supported by `mdc-text-field`.
 */
export type TextFieldType =
    | 'email'
    | 'number'
    | 'password'
    | 'search'
    | 'tel'
    | 'text'
    | 'url'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'month'
    | 'time'
    | 'week'
    | 'textarea'

export const TextFieldType = {
    Email: 'email',
    Number: 'number',
    Password: 'password',
    Search: 'search',
    Tel: 'tel',
    Text: 'text',
    Url: 'url',
    Color: 'color',
    Date: 'date',
    DatetimeLocal: 'datetime-local',
    Month: 'month',
    Time: 'time',
    Week: 'week',
    Textarea: 'textarea',
} as const satisfies Record<string, TextFieldType>

/**
 * Text field component contract.
 *
 * `mdc-text-field` is a full form-associated Web Component implementing
 * Material Design 3 Text Fields. It renders a real native `<input>` or
 * `<textarea>` child hosted inside an `mdc-field` container, participates in
 * HTML `<form>` submission and constraint validation, and exposes standard
 * input IDL properties and selection methods.
 *
 * Variants:
 * - `filled`   : filled background container with bottom-indicator underline.
 * - `outlined` : transparent container with 4-sided outline and label notch.
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/text-fields/overview
 */
export interface ITextField extends LitElement {
    /** Visual variant ('filled' | 'outlined'). Default 'filled'. */
    variant: FieldVariant
    /** Current value of the text field. */
    value: string
    /** Input type (e.g. 'text', 'password', 'email', 'textarea'). Default 'text'. */
    type: TextFieldType
    /** Name of the field for form submission. */
    name: string
    /** Floating label text. */
    label: string
    /** Placeholder text shown inside the input when empty. */
    placeholder: string
    /** Helper text shown below the field. */
    supportingText: string
    /** Error text shown below the field when in error state. */
    errorText: string
    /** Manual error override flag. When true, the field enters error state. */
    error: boolean
    /** Inline prefix text rendered at the start of the input area. */
    prefixText: string
    /** Inline suffix text rendered at the end of the input area. */
    suffixText: string
    /** Whether the field is disabled. */
    disabled: boolean
    /** Whether the field is marked as required. */
    required: boolean
    /** Suppresses the required asterisk (*) in the label. */
    noAsterisk: boolean
    /** Whether the field is read-only. */
    readOnly: boolean
    /** Minimum numeric or date value. */
    min: string
    /** Maximum numeric or date value. */
    max: string
    /** Step interval for numeric or date inputs. */
    step: string
    /** Regex pattern the value must match for validity. */
    pattern: string
    /** Minimum length of the input value. */
    minLength: number
    /** Maximum length of the input value. */
    maxLength: number
    /** Browser autocomplete hint. */
    autocomplete: string
    /** Whether the input should automatically receive focus on page load. */
    autofocus: boolean
    /** Virtual keyboard input mode hint (e.g. 'numeric', 'decimal'). */
    inputMode: string
    /** Number of visible text lines when `type="textarea"`. */
    rows: number
    /** Number of visible character columns when `type="textarea"`. */
    cols: number
    /** Whether to show a clear button when the field has text. */
    clearable: boolean
    /** Whether to show the character counter automatically (e.g. '12 / 50'). */
    counter: boolean
    /** Custom counter text override. */
    counterText: string
    /** Controls when the label floats ('auto' | 'always' | 'never'). */
    floatingLabelBehavior: FloatingLabelBehavior
    /** Aligns the input text and tokens to the end of the field. */
    alignEnd: boolean

    /** Selects all text in the field. */
    select(): void
    /** Sets the text selection range. */
    setSelectionRange(start: number, end: number, direction?: 'forward' | 'backward' | 'none'): void
    /** Replaces a range of text with a new string. */
    setRangeText(replacement: string, start?: number, end?: number, selectionMode?: 'select' | 'start' | 'end' | 'preserve'): void
    /** Increments the value of a numeric or date input. */
    stepUp(n?: number): void
    /** Decrements the value of a numeric or date input. */
    stepDown(n?: number): void
    /** Shows the browser picker for date/time/color inputs. */
    showPicker(): void
    /** Resets the value to empty string or default-value. */
    reset(): void
}

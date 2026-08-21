/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseField } from './internal/base-field'
import { fieldStyles } from './field.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-field': MDCField
    }
}

/**
 * Material Design 3 Field.
 *
 * The chrome-only container for text inputs. Renders the visible bounding
 * box, floating label, supporting text, error text, prefix / suffix tokens,
 * and leading / trailing icon slots. The input child (typically `<input>`,
 * `<textarea>`, or a custom widget) is provided by the consumer in the
 * default slot.
 *
 * This is the foundation for `mdc-textfield` (and `mdc-textarea`, `mdc-select`
 * in future releases). `mdc-field` itself is **not** form-associated and
 * **does not** re-dispatch native input events — the consumer is responsible
 * for wiring input events to the field's `focused`, `populated`, `invalid`,
 * and `disabled` properties.
 *
 * Variants:
 * - `filled`   : filled background with a bottom-indicator underline.
 * - `outlined` : transparent background with a 4-sided outline and a label notch.
 *
 * @slot - The input child (`<input>`, `<textarea>`, etc.).
 * @slot leading-icon - Icon rendered at the start of the field.
 * @slot trailing-icon - Icon rendered at the end of the field.
 * @slot prefix - Rich leading content rendered alongside `prefix-text`.
 * @slot suffix - Rich trailing content rendered alongside `suffix-text`.
 *
 * @fires field-label-pointer - Fired when the user clicks / touches the floating label.
 *
 * @cssproperty --mdc-field-container-height
 * @cssproperty --mdc-field-container-shape-start-start
 * @cssproperty --mdc-field-container-shape-start-end
 * @cssproperty --mdc-field-container-shape-end-start
 * @cssproperty --mdc-field-container-shape-end-end
 * @cssproperty --mdc-field-enabled-container-color
 * @cssproperty --mdc-field-hovered-container-color
 * @cssproperty --mdc-field-focused-container-color
 * @cssproperty --mdc-field-disabled-container-color
 * @cssproperty --mdc-field-enabled-active-indicator-color
 * @cssproperty --mdc-field-hovered-active-indicator-color
 * @cssproperty --mdc-field-focused-active-indicator-color
 * @cssproperty --mdc-field-invalid-active-indicator-color
 * @cssproperty --mdc-field-disabled-active-indicator-color
 * @cssproperty --mdc-field-enabled-active-indicator-height
 * @cssproperty --mdc-field-focused-active-indicator-height
 * @cssproperty --mdc-field-invalid-active-indicator-height
 * @cssproperty --mdc-field-outline-width
 * @cssproperty --mdc-field-enabled-outline-color
 * @cssproperty --mdc-field-hovered-outline-color
 * @cssproperty --mdc-field-focused-outline-color
 * @cssproperty --mdc-field-invalid-outline-color
 * @cssproperty --mdc-field-disabled-outline-color
 * @cssproperty --mdc-field-enabled-label-color
 * @cssproperty --mdc-field-focused-label-color
 * @cssproperty --mdc-field-invalid-label-color
 * @cssproperty --mdc-field-disabled-label-color
 * @cssproperty --mdc-field-enabled-label-font
 * @cssproperty --mdc-field-enabled-label-size
 * @cssproperty --mdc-field-enabled-label-weight
 * @cssproperty --mdc-field-enabled-label-tracking
 * @cssproperty --mdc-field-enabled-label-line-height
 * @cssproperty --mdc-field-floating-label-font
 * @cssproperty --mdc-field-floating-label-size
 * @cssproperty --mdc-field-floating-label-weight
 * @cssproperty --mdc-field-floating-label-tracking
 * @cssproperty --mdc-field-floating-label-line-height
 * @cssproperty --mdc-field-enabled-supporting-text-color
 * @cssproperty --mdc-field-invalid-supporting-text-color
 * @cssproperty --mdc-field-disabled-supporting-text-color
 * @cssproperty --mdc-field-enabled-icon-color
 * @cssproperty --mdc-field-disabled-icon-color
 * @cssproperty --mdc-field-disabled-label-opacity
 * @cssproperty --mdc-field-disabled-supporting-text-opacity
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/text-fields/overview
 *
 * @example
 * ```html
 * <mdc-field variant="filled" label="Email">
 *     <input type="email" />
 * </mdc-field>
 *
 * <mdc-field variant="outlined" label="Search" supporting-text="Enter a search term">
 *     <mdc-icon slot="leading-icon">search</mdc-icon>
 *     <input type="search" />
 *     <mdc-icon slot="trailing-icon">clear</mdc-icon>
 * </mdc-field>
 * ```
 */
@customElement('mdc-field')
export class MDCField extends BaseField {
    public static override styles = fieldStyles
}

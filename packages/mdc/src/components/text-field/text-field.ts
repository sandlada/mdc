/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseTextField } from './internal/base-text-field'
import { baseTextFieldStyles } from './internal/base-text-field.style'
import { textFieldStyles } from './text-field.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-text-field': MDCTextField
    }
}

/**
 * Material Design 3 Text Field.
 *
 * Text fields let users enter and edit text. They typically appear in forms
 * and dialogs.
 *
 * Variants:
 * - `filled`   : filled container with active indicator underline.
 * - `outlined` : transparent container with 4-sided outline and label notch.
 *
 * @slot leading-icon - Icon placed before the input text.
 * @slot trailing-icon - Icon placed after the input text.
 * @slot prefix - Custom prefix element before input text.
 * @slot suffix - Custom suffix element after input text.
 * @slot supporting-text - Custom supporting text below container.
 * @slot counter - Custom character counter element.
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/text-fields/overview
 *
 * @example
 * ```html
 * <!-- Filled variant (default) -->
 * <mdc-text-field label="Email" type="email" required></mdc-text-field>
 *
 * <!-- Outlined variant -->
 * <mdc-text-field variant="outlined" label="Username" clearable></mdc-text-field>
 *
 * <!-- Multiline textarea -->
 * <mdc-text-field variant="outlined" label="Comments" type="textarea" rows="4"></mdc-text-field>
 * ```
 */
@customElement('mdc-text-field')
export class MDCTextField extends BaseTextField {
    public static override styles = [baseTextFieldStyles, ...textFieldStyles]
}

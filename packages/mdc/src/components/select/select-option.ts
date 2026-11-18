/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseSelectOption } from './internal/base-select-option'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-select-option': MDCSelectOption
    }
}

/**
 * Material Design 3 Select Option (`mdc-select-option`).
 *
 * A selectable option item inside `<mdc-select>`.
 *
 * @element mdc-select-option
 * @slot - The primary option label.
 * @slot start - Leading icon or avatar.
 * @slot end - Trailing icon or metadata (defaults to checkmark when selected).
 * @slot supporting-text - Secondary supporting text below the label.
 *
 * @fires request-selection - Dispatched when the option is clicked or activated.
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/menus/overview
 */
@customElement('mdc-select-option')
export class MDCSelectOption extends BaseSelectOption {}

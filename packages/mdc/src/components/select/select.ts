/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseSelect } from './internal/base-select'
import { SelectStyles } from './select.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-select': MDCSelect
    }
}

/**
 * Material Design 3 Select (`mdc-select`).
 *
 * Exposed dropdown menu combining `mdc-field` chrome (`filled` / `outlined`)
 * with a floating `role="listbox"` menu of `<mdc-select-option>` items.
 *
 * @element mdc-select
 * @slot - The `<mdc-select-option>` children.
 * @slot leading-icon - Icon placed before the selected value.
 * @slot trailing-icon - Custom icon replacing the default dropdown arrow.
 * @slot prefix - Custom prefix element before the selected value.
 * @slot suffix - Custom suffix element after the selected value.
 * @slot supporting-text - Custom supporting text below the container.
 *
 * @fires input - Dispatched when the user selects a new option.
 * @fires change - Dispatched when the user selects a new option.
 * @fires opening - Cancelable event dispatched before the dropdown opens.
 * @fires opened - Dispatched after the dropdown opens.
 * @fires closing - Cancelable event dispatched before the dropdown closes.
 * @fires closed - Dispatched after the dropdown closes.
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/menus/overview
 */
@customElement('mdc-select')
export class MDCSelect extends BaseSelect {
    public static override styles = SelectStyles
}

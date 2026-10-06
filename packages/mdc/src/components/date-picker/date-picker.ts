/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseDatePicker } from './internal/base-date-picker'
import { DatePickerStyles } from './date-picker.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-date-picker': DatePicker
    }
}

export * from './date-picker.interface'

@customElement('mdc-date-picker')
export class DatePicker extends BaseDatePicker {
    public static override styles = DatePickerStyles
}

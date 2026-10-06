/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseTimePicker } from './internal/base-time-picker'
import { TimePickerStyles } from './time-picker.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-time-picker': TimePicker
    }
}

export * from './time-picker.interface'

@customElement('mdc-time-picker')
export class TimePicker extends BaseTimePicker {
    public static override styles = TimePickerStyles
}

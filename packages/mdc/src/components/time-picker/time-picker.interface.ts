/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import type { IMixinElevationAttributes } from '../elevation/elevation-options.mixin'
import type { DayPeriod } from './internal/time-utils'

export type TimePickerVariant = 'dial' | 'input'

export type TimePickerOrientation = 'vertical' | 'horizontal'

export type TimeSelection = 'hour' | 'minute'

export interface IMDCTimePickerAttributes extends IMixinElevationAttributes {
    variant: TimePickerVariant
    orientation: TimePickerOrientation
    open: boolean
    quick: boolean
    headline: string
    confirmLabel: string
    dismissLabel: string
    hour: number
    minute: number
    is24Hour: boolean
    selection: TimeSelection
    period: DayPeriod
    disabled: boolean
    name: string
    noFocusTrap: boolean
}

export interface IMDCTimePickerEvents {
    'time-change': CustomEvent<{ hour: number, minute: number }>
    'confirm': CustomEvent<{ hour: number, minute: number }>
    'dismiss': CustomEvent<Record<string, never>>
    'entry-mode-change': CustomEvent<{ variant: TimePickerVariant }>
    'open': CustomEvent<Record<string, never>>
    'opened': CustomEvent<Record<string, never>>
    'close': CustomEvent<Record<string, never>>
    'closed': CustomEvent<Record<string, never>>
}

/**
 * Time picker component contract.
 *
 * `mdc-time-picker` implements Material Design 3 Time pickers: dial and
 * input, vertical and horizontal, 12h and 24h. Hour is always 0..23.
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/time-pickers/specs
 */
export interface IMDCTimePicker extends LitElement, IMDCTimePickerAttributes {
    show(): Promise<void>
    close(returnValue?: string): Promise<void>
    confirm(): Promise<void>
}

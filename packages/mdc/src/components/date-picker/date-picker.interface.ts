/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import type { IMixinElevationAttributes } from '../elevation/elevation-options.mixin'

export type DatePickerVariant = 'docked' | 'modal' | 'modal-input' | 'fullscreen'

export type DateSelectionMode = 'single' | 'range'

export type DateDisplayMode = 'calendar' | 'input' | 'year'

export interface IDateRange {
    start: number | null
    end: number | null
}

export interface IMDCDatePickerAttributes extends IMixinElevationAttributes {
    variant: DatePickerVariant
    selection: DateSelectionMode
    displayMode: DateDisplayMode
    open: boolean
    quick: boolean
    headline: string
    supportingText: string
    confirmLabel: string
    dismissLabel: string
    clearLabel: string
    value: number | null
    rangeStart: number | null
    rangeEnd: number | null
    displayedMonth: number | null
    min: number | null
    max: number | null
    disabled: boolean
    required: boolean
    name: string
    firstDayOfWeek: number
    showModeToggle: boolean
    noFocusTrap: boolean
}

export interface IMDCDatePickerEvents {
    'date-change': CustomEvent<{ value: number | null }>
    'range-change': CustomEvent<{ start: number | null, end: number | null }>
    'confirm': CustomEvent<{ value: number | null, start: number | null, end: number | null }>
    'dismiss': CustomEvent<Record<string, never>>
    'open': CustomEvent<Record<string, never>>
    'opened': CustomEvent<Record<string, never>>
    'close': CustomEvent<Record<string, never>>
    'closed': CustomEvent<Record<string, never>>
}

/**
 * Date picker component contract.
 *
 * `mdc-date-picker` implements Material Design 3 Expressive Date pickers:
 * docked, modal (calendar / year), fullscreen range, and modal input
 * (manual entry), with single and range selection.
 * Dates are UTC-midnight millis.
 *
 * @version
 * Material Design 3 Expressive
 *
 * @link
 * https://m3.material.io/components/date-pickers/specs
 */
export interface IMDCDatePicker extends LitElement, IMDCDatePickerAttributes {
    show(): Promise<void>
    close(returnValue?: string): Promise<void>
    confirm(): Promise<void>
}

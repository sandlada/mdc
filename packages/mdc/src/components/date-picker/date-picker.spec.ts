/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { DatePicker } from './date-picker'
import { DatePickerDockedDefinition, DatePickerInputDefinition, DatePickerModalDefinition } from './date-picker.definition'

describe('mdc-date-picker component', () => {
    it('initializes with MD3 defaults', () => {
        const el = new DatePicker()
        expect(el.variant).toBe('modal')
        expect(el.selection).toBe('single')
        expect(el.displayMode).toBe('calendar')
        expect(el.open).toBe(false)
        expect(el.supportingText).toBe('Select date')
        expect(el.confirmLabel).toBe('OK')
        expect(el.dismissLabel).toBe('Cancel')
        expect(el.clearLabel).toBe('Clear')
        expect(el.firstDayOfWeek).toBe(0)
    })

    it('exposes modal tokens with day, range and docked widths', () => {
        expect(DatePickerModalDefinition['container-shape-start-start']).toBeDefined()
        expect(DatePickerModalDefinition['day-container-size']).toBe('48px')
        expect(DatePickerModalDefinition['day-node-size']).toBe('40px')
        expect(DatePickerModalDefinition['enabled-selected-day-label-color']).toBeDefined()
        expect(DatePickerModalDefinition['enabled-range-container-color']).toBeDefined()
        expect(DatePickerDockedDefinition['container-min-width']).toBe('360px')
        expect(DatePickerInputDefinition['enabled-container-color']).toBeDefined()
    })

    it('rejects confirm when required value missing', async () => {
        const el = new DatePicker()
        el.required = true
        el.selection = 'single'
        await expect(el.confirm()).rejects.toThrowError()
    })

    it('exposes keyboard nav and focus-trap handlers', () => {
        const el = new DatePicker()
        expect(typeof (el as unknown as Record<string, unknown>)['handleGridKeydown']).toBe('function')
        expect(typeof (el as unknown as Record<string, unknown>)['handleDialogKeydown']).toBe('function')
        expect(typeof (el as unknown as Record<string, unknown>)['handleDayClick']).toBe('function')
    })

    it('falls back to month headline instead of duplicating supporting text', () => {
        const el = new DatePicker()
        el.supportingText = 'Select date'
        el.headline = ''
        const text = (el as unknown as { renderHeadlineText: () => string }).renderHeadlineText()
        expect(text.length).toBeGreaterThan(0)
        expect(text).not.toBe('Select date')
    })

    it('renders MD3E headlines without a year', () => {
        const el = new DatePicker()
        const single = Date.UTC(2025, 7, 17)
        ;(el as unknown as { pendingValue: number | null }).pendingValue = single
        const singleText = (el as unknown as { renderHeadlineText: () => string }).renderHeadlineText()
        expect(singleText).toContain('Aug 17')
        expect(singleText).not.toContain('2025')
        el.selection = 'range'
        ;(el as unknown as { pendingStart: number | null }).pendingStart = single
        ;(el as unknown as { pendingEnd: number | null }).pendingEnd = Date.UTC(2025, 7, 23)
        expect((el as unknown as { renderHeadlineText: () => string }).renderHeadlineText()).toBe('Aug 17 – Aug 23')
    })

    it('labels manual entry per MD3E and clears pending dates', () => {
        const el = new DatePicker()
        el.selection = 'range'
        expect((el as unknown as { renderInputHeadlineText: () => string }).renderInputHeadlineText()).toBe('Enter dates')
        el.selection = 'single'
        expect((el as unknown as { renderInputHeadlineText: () => string }).renderInputHeadlineText()).toBe('Enter date')
        ;(el as unknown as { pendingValue: number | null }).pendingValue = Date.UTC(2025, 7, 17)
        ;(el as unknown as { handleClear: () => void }).handleClear()
        expect((el as unknown as { pendingValue: number | null }).pendingValue).toBeNull()
        expect((el as unknown as { shouldShowClear: () => boolean }).shouldShowClear()).toBe(true)
        el.variant = 'docked'
        expect((el as unknown as { shouldShowClear: () => boolean }).shouldShowClear()).toBe(false)
    })

    it('participates in form association with ISO submit value', () => {
        expect((DatePicker as unknown as { formAssociated: boolean }).formAssociated).toBe(true)
        const el = new DatePicker()
        expect(el.name).toBe('')
        expect((el as unknown as { getSubmitValue: () => string | null }).getSubmitValue()).toBeNull()
        el.value = Date.UTC(2026, 9, 5)
        expect((el as unknown as { getSubmitValue: () => string | null }).getSubmitValue()).toBe('2026-10-05')
    })

    it('renders elevation and supports disabling it', () => {
        const el = new DatePicker()
        expect(typeof (el as unknown as Record<string, unknown>)['renderElevation']).toBe('function')
        expect(el.disableElevation).toBe(false)
        el.disableElevation = true
        expect(el.disableElevation).toBe(true)
    })
})

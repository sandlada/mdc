/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { TimePicker } from './time-picker'
import { TimePickerDialDefinition, TimePickerInputDefinition } from './time-picker.definition'

describe('mdc-time-picker component', () => {
    it('initializes with MD3 defaults', () => {
        const el = new TimePicker()
        expect(el.variant).toBe('dial')
        expect(el.orientation).toBe('vertical')
        expect(el.headline).toBe('Select time')
        expect(el.hour).toBe(12)
        expect(el.minute).toBe(0)
        expect(el.is24Hour).toBe(false)
        expect(el.selection).toBe('hour')
    })

    it('exposes dial tokens with 256px dial and 48px handle', () => {
        expect(TimePickerDialDefinition['dial-container-size']).toBe('256px')
        expect(TimePickerDialDefinition['dial-selector-handle-size']).toBe('48px')
        expect(TimePickerDialDefinition['dial-selector-center-size']).toBe('8px')
        expect(TimePickerDialDefinition['dial-selector-track-width']).toBe('2px')
        expect(TimePickerDialDefinition['time-selector-container-width']).toBe('96px')
        expect(TimePickerDialDefinition['period-selector-vertical-container-width']).toBe('52px')
        expect(TimePickerDialDefinition['period-selector-horizontal-container-width']).toBe('216px')
        expect(TimePickerInputDefinition['input-container-width']).toBe('96px')
    })

    it('rejects confirm when disabled', async () => {
        const el = new TimePicker()
        el.disabled = true
        await expect(el.confirm()).rejects.toThrowError()
    })

    it('participates in form association with HH:MM submit value', () => {
        expect((TimePicker as unknown as { formAssociated: boolean }).formAssociated).toBe(true)
        const el = new TimePicker()
        expect(el.name).toBe('')
        el.hour = 9
        el.minute = 5
        expect((el as unknown as { getSubmitValue: () => string }).getSubmitValue()).toBe('09:05')
    })

    it('renders elevation and traps tab focus', () => {
        const el = new TimePicker()
        expect(typeof (el as unknown as Record<string, unknown>)['renderElevation']).toBe('function')
        expect(typeof (el as unknown as Record<string, unknown>)['handleDialogKeydown']).toBe('function')
        expect(el.disableElevation).toBe(false)
    })
})

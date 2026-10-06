/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { angleForHour, angleForMinute, angleFromOffset, formatTimeOfDay, hourFromAngle, hourOfPeriod, isValidHourInput, isValidMinuteInput, minuteFromAngle, pad2, periodOf, withPeriod } from './internal/time-utils'

describe('time-utils', () => {
    it('derives period and 12h hour', () => {
        expect(periodOf(0)).toBe('am')
        expect(periodOf(11)).toBe('am')
        expect(periodOf(12)).toBe('pm')
        expect(periodOf(23)).toBe('pm')
        expect(hourOfPeriod(0)).toBe(12)
        expect(hourOfPeriod(13)).toBe(1)
        expect(hourOfPeriod(12)).toBe(12)
    })

    it('toggles period preserving minute', () => {
        expect(withPeriod({ hour: 9, minute: 30 })('pm')).toEqual({ hour: 21, minute: 30 })
        expect(withPeriod({ hour: 21, minute: 5 })('am')).toEqual({ hour: 9, minute: 5 })
    })

    it('maps angles to minutes and hours', () => {
        expect(angleForMinute(0)).toBe(0)
        expect(angleForMinute(15)).toBe(90)
        expect(minuteFromAngle(90)).toBe(15)
        expect(minuteFromAngle(359)).toBe(0)
        expect(angleForHour(3)(false)).toBe(90)
        expect(hourFromAngle(90)(false, false)).toBe(3)
        expect(hourFromAngle(0)(true, false)).toBe(0)
        expect(hourFromAngle(90)(true, false)).toBe(15)
        expect(hourFromAngle(90)(true, true)).toBe(3)
    })

    it('places 24h outer and inner rings on 12 dial slots', () => {
        expect(angleForHour(0)(true, false)).toBe(0)
        expect(angleForHour(13)(true, false)).toBe(30)
        expect(angleForHour(18)(true, false)).toBe(180)
        expect(angleForHour(23)(true, false)).toBe(330)
        expect(angleForHour(12)(true, true)).toBe(0)
        expect(angleForHour(1)(true, true)).toBe(30)
        expect(angleForHour(6)(true, true)).toBe(180)
        expect(hourFromAngle(angleForHour(15)(true, false))(true, false)).toBe(15)
        expect(hourFromAngle(angleForHour(5)(true, true))(true, true)).toBe(5)
    })

    it('computes pointer angle with 12 oclock at 0', () => {
        expect(angleFromOffset(0)(-100)).toBeCloseTo(0, 5)
        expect(angleFromOffset(100)(0)).toBeCloseTo(90, 5)
        expect(angleFromOffset(0)(100)).toBeCloseTo(180, 5)
    })

    it('validates hour and minute inputs', () => {
        expect(isValidHourInput(0)(true)).toBe(true)
        expect(isValidHourInput(24)(true)).toBe(false)
        expect(isValidHourInput(0)(false)).toBe(false)
        expect(isValidHourInput(12)(false)).toBe(true)
        expect(isValidMinuteInput(59)).toBe(true)
        expect(isValidMinuteInput(60)).toBe(false)
    })

    it('formats time of day', () => {
        expect(formatTimeOfDay({ hour: 13, minute: 5 })(true)).toBe('13:05')
        expect(formatTimeOfDay({ hour: 13, minute: 5 })(false)).toBe('1:05 PM')
        expect(pad2(5)).toBe('05')
    })

    it('rejects invalid time explicitly', () => {
        expect(() => withPeriod({ hour: 25, minute: 0 })('am')).toThrowError()
        expect(() => angleFromOffset(Number.NaN)(0)).toThrowError()
    })
})

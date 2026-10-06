/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { addMonths, buildMonthGrid, buildYearList, daysInMonth, formatISODate, formatLocaleDate, fromUTCMidnight, isInRange, isLeapYear, parseDateInput, parseISODate, parseLocaleDate, toUTCMidnight } from './internal/date-utils'

describe('date-utils', () => {
    it('detects leap years per Gregorian rules', () => {
        expect(isLeapYear(2024)).toBe(true)
        expect(isLeapYear(1900)).toBe(false)
        expect(isLeapYear(2000)).toBe(true)
        expect(isLeapYear(2025)).toBe(false)
    })

    it('computes days in month including February leap', () => {
        expect(daysInMonth(2024)(2)).toBe(29)
        expect(daysInMonth(2025)(2)).toBe(28)
        expect(daysInMonth(2026)(10)).toBe(31)
        expect(daysInMonth(2026)(9)).toBe(30)
    })

    it('round-trips UTC midnight millis', () => {
        const millis = toUTCMidnight({ year: 2026, month: 10, day: 5 })
        expect(millis).toBe(Date.UTC(2026, 9, 5))
        expect(fromUTCMidnight(millis)).toEqual({ year: 2026, month: 10, day: 5 })
    })

    it('rejects invalid dates explicitly', () => {
        expect(() => toUTCMidnight({ year: 2026, month: 13, day: 1 })).toThrowError()
        expect(() => toUTCMidnight({ year: 2026, month: 2, day: 30 })).toThrowError()
        expect(() => parseISODate('not-a-date')).toThrowError()
    })

    it('adds months with end-of-month clamping', () => {
        const jan31 = toUTCMidnight({ year: 2026, month: 1, day: 31 })
        expect(formatISODate(addMonths(jan31)(1))).toBe('2026-02-28')
        const dec = toUTCMidnight({ year: 2026, month: 12, day: 15 })
        expect(formatISODate(addMonths(dec)(1))).toBe('2027-01-15')
    })

    it('builds 6x7 grid starting on firstDayOfWeek', () => {
        const oct2026 = toUTCMidnight({ year: 2026, month: 10, day: 1 })
        const grid = buildMonthGrid(oct2026)(0)(() => false)
        expect(grid.length).toBe(6)
        expect(grid[0]?.length).toBe(7)
        const flat = grid.flat()
        expect(flat.filter((c) => c.inMonth).length).toBe(31)
    })

    it('builds year list inclusively', () => {
        expect(buildYearList(2020)(2022)).toEqual([2020, 2021, 2022])
        expect(() => buildYearList(2025)(2020)).toThrowError()
    })

    it('checks range inclusion with null bounds', () => {
        const day = toUTCMidnight({ year: 2026, month: 6, day: 15 })
        expect(isInRange(day)(null, null)).toBe(true)
        expect(isInRange(day)(day, day)).toBe(true)
        expect(isInRange(day)(day + 1, null)).toBe(false)
    })

    it('formats and parses ISO dates', () => {
        const millis = toUTCMidnight({ year: 2026, month: 1, day: 9 })
        expect(formatISODate(millis)).toBe('2026-01-09')
        expect(parseISODate('2026-01-09')).toBe(millis)
    })

    it('formats zero-padded locale dates for MD3E fields', () => {
        const millis = toUTCMidnight({ year: 2025, month: 8, day: 17 })
        expect(formatLocaleDate(millis)).toBe('08/17/2025')
        expect(parseLocaleDate('08/17/2025')).toBe(millis)
        expect(() => parseLocaleDate('2025-08-17')).toThrowError()
        expect(() => parseLocaleDate('13/01/2025')).toThrowError()
    })

    it('accepts locale input with ISO fallback', () => {
        const millis = toUTCMidnight({ year: 2025, month: 8, day: 17 })
        expect(parseDateInput('08/17/2025')).toBe(millis)
        expect(parseDateInput('2025-08-17')).toBe(millis)
        expect(() => parseDateInput('')).toThrowError()
        expect(() => parseDateInput('tomorrow')).toThrowError()
    })
})

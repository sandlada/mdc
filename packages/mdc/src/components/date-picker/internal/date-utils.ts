/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * Pure date math for `mdc-date-picker`. UTC-midnight domain, data-last currying.
 */

export interface IDateParts {
    year: number
    month: number
    day: number
}

export const isLeapYear = (year: number): boolean => {
    if (!Number.isInteger(year)) throw new Error('Year must be an integer')
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export const daysInMonth = (year: number) => (month: number): number => {
    if (!Number.isInteger(year) || !Number.isInteger(month)) throw new Error('Year and month must be integers')
    if (month < 1 || month > 12) throw new Error('Month must be in 1..12')
    return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

export const toUTCMidnight = (parts: IDateParts): number => {
    if (!Number.isInteger(parts.year) || !Number.isInteger(parts.month) || !Number.isInteger(parts.day)) throw new Error('Date parts must be integers')
    if (parts.month < 1 || parts.month > 12) throw new Error('Month must be in 1..12')
    const dim = daysInMonth(parts.year)(parts.month)
    if (parts.day < 1 || parts.day > dim) throw new Error('Day out of range for month')
    return Date.UTC(parts.year, parts.month - 1, parts.day)
}

export const fromUTCMidnight = (millis: number): IDateParts => {
    if (!Number.isInteger(millis)) throw new Error('Millis must be an integer')
    const d = new Date(millis)
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() }
}

export const addMonths = (millis: number) => (delta: number): number => {
    if (!Number.isInteger(millis) || !Number.isInteger(delta)) throw new Error('Millis and delta must be integers')
    const parts = fromUTCMidnight(millis)
    const total = (parts.year * 12 + (parts.month - 1)) + delta
    const year = Math.floor(total / 12)
    const month = (total % 12) + 1
    const dim = daysInMonth(year)(month)
    return toUTCMidnight({ year, month, day: Math.min(parts.day, dim) })
}

export const isSameDay = (a: number) => (b: number): boolean => {
    if (!Number.isInteger(a) || !Number.isInteger(b)) throw new Error('Millis must be integers')
    return a === b
}

export const isInRange = (millis: number) => (start: number | null, end: number | null): boolean => {
    if (!Number.isInteger(millis)) throw new Error('Millis must be an integer')
    if (start !== null && millis < start) return false
    if (end !== null && millis > end) return false
    return true
}

export const clampDay = (millis: number) => (min: number | null, max: number | null): number => {
    if (min !== null && millis < min) return min
    if (max !== null && millis > max) return max
    return millis
}

export interface ICalendarCell {
    millis: number
    inMonth: boolean
    disabled: boolean
}

/**
 * Builds 6x7 calendar grid for the displayed month. Weeks start on
 * `firstDayOfWeek` (0 = Sunday .. 6 = Saturday, CLDR locale driven).
 */
export const buildMonthGrid = (displayedMillis: number) => (firstDayOfWeek: number) => (isDisabled: (millis: number) => boolean): ICalendarCell[][] => {
    if (!Number.isInteger(displayedMillis)) throw new Error('Displayed millis must be an integer')
    if (!Number.isInteger(firstDayOfWeek) || firstDayOfWeek < 0 || firstDayOfWeek > 6) throw new Error('firstDayOfWeek must be 0..6')
    const parts = fromUTCMidnight(displayedMillis)
    const firstOfMonth = toUTCMidnight({ year: parts.year, month: parts.month, day: 1 })
    const firstWeekday = new Date(firstOfMonth).getUTCDay()
    const lead = (firstWeekday - firstDayOfWeek + 7) % 7
    const startMillis = firstOfMonth - lead * 86400000
    const weeks: ICalendarCell[][] = []
    for (let w = 0; w < 6; w++) {
        const row: ICalendarCell[] = []
        for (let d = 0; d < 7; d++) {
            const millis = startMillis + (w * 7 + d) * 86400000
            const cellParts = fromUTCMidnight(millis)
            row.push({ millis, inMonth: cellParts.month === parts.month, disabled: isDisabled(millis) })
        }
        weeks.push(row)
    }
    return weeks
}

export const buildYearList = (minYear: number) => (maxYear: number): number[] => {
    if (!Number.isInteger(minYear) || !Number.isInteger(maxYear)) throw new Error('Years must be integers')
    if (maxYear < minYear) throw new Error('maxYear must be >= minYear')
    const years: number[] = []
    for (let y = minYear; y <= maxYear; y++) years.push(y)
    return years
}

export const formatISODate = (millis: number): string => {
    const parts = fromUTCMidnight(millis)
    const m = String(parts.month).padStart(2, '0')
    const d = String(parts.day).padStart(2, '0')
    return `${parts.year}-${m}-${d}`
}

export const parseISODate = (value: string): number => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
    if (!match) throw new Error('Date must be YYYY-MM-DD')
    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])
    return toUTCMidnight({ year, month, day })
}

/**
 * Formats UTC-midnight millis as zero-padded `MM/DD/YYYY`, the visible
 * MD3E field/headline format (submit values stay ISO via `formatISODate`).
 */
export const formatLocaleDate = (millis: number): string => {
    const parts = fromUTCMidnight(millis)
    const m = String(parts.month).padStart(2, '0')
    const d = String(parts.day).padStart(2, '0')
    return `${m}/${d}/${parts.year}`
}

export const parseLocaleDate = (value: string): number => {
    const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim())
    if (!match) throw new Error('Date must be MM/DD/YYYY')
    const month = Number(match[1])
    const day = Number(match[2])
    const year = Number(match[3])
    return toUTCMidnight({ year, month, day })
}

/**
 * Accepts MD3E visible `MM/DD/YYYY` first, falls back to ISO `YYYY-MM-DD`
 * so existing programmatic values keep working.
 */
export const parseDateInput = (value: string): number => {
    const trimmed = value.trim()
    if (trimmed === '') throw new Error('Date must not be empty')
    if (trimmed.includes('/')) return parseLocaleDate(trimmed)
    return parseISODate(trimmed)
}

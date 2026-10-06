/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * Pure time math for `mdc-time-picker`. Hour always 0..23, minute 0..59.
 */

export type DayPeriod = 'am' | 'pm'

export interface ITimeOfDay {
    hour: number
    minute: number
}

export const assertTimeOfDay = (time: ITimeOfDay): ITimeOfDay => {
    if (!Number.isInteger(time.hour) || time.hour < 0 || time.hour > 23) throw new Error('Hour must be 0..23')
    if (!Number.isInteger(time.minute) || time.minute < 0 || time.minute > 59) throw new Error('Minute must be 0..59')
    return time
}

export const periodOf = (hour: number): DayPeriod => {
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) throw new Error('Hour must be 0..23')
    return hour < 12 ? 'am' : 'pm'
}

export const hourOfPeriod = (hour: number): number => {
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) throw new Error('Hour must be 0..23')
    const h = hour % 12
    return h === 0 ? 12 : h
}

export const withPeriod = (time: ITimeOfDay) => (period: DayPeriod): ITimeOfDay => {
    assertTimeOfDay(time)
    if (period !== 'am' && period !== 'pm') throw new Error('Period must be am or pm')
    const base = time.hour % 12
    return { hour: period === 'am' ? base : base + 12, minute: time.minute }
}

export const withHourOfPeriod = (time: ITimeOfDay) => (hour12: number): ITimeOfDay => {
    assertTimeOfDay(time)
    if (!Number.isInteger(hour12) || hour12 < 1 || hour12 > 12) throw new Error('12h hour must be 1..12')
    const period = periodOf(time.hour)
    const normalized = hour12 % 12
    return { hour: period === 'am' ? normalized : normalized + 12, minute: time.minute }
}

/**
 * Clock angle in degrees, 0 at 12 o'clock, clockwise positive.
 */
export const angleForMinute = (minute: number): number => {
    if (!Number.isInteger(minute) || minute < 0 || minute > 59) throw new Error('Minute must be 0..59')
    return (minute * 6) % 360
}

export const angleForHour = (hour: number) => (is24Hour: boolean, isInnerRing = false): number => {
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) throw new Error('Hour must be 0..23')
    if (!is24Hour) return ((hour % 12) * 30) % 360
    if (isInnerRing) return ((hour % 12) * 30) % 360
    if (hour === 0) return 0
    return ((((hour - 12) % 12) + 12) % 12 * 30) % 360
}

export const minuteFromAngle = (angle: number): number => {
    if (!Number.isFinite(angle)) throw new Error('Angle must be finite')
    const normalized = ((angle % 360) + 360) % 360
    return Math.round(normalized / 6) % 60
}

export const hourFromAngle = (angle: number) => (is24Hour: boolean, isInnerRing: boolean): number => {
    if (!Number.isFinite(angle)) throw new Error('Angle must be finite')
    const normalized = ((angle % 360) + 360) % 360
    if (!is24Hour) {
        const h = Math.round(normalized / 30) % 12
        return h === 0 ? 12 : h
    }
    if (isInnerRing) {
        const h = Math.round(normalized / 30) % 12
        return h === 0 ? 12 : h
    }
    const stepped = Math.round(normalized / 30) % 12
    const map = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
    return map[stepped] ?? 0
}

/**
 * Computes pointer angle from dial center. `x` right-positive, `y` down-positive.
 */
export const angleFromOffset = (x: number) => (y: number): number => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('Offset must be finite')
    const rad = Math.atan2(x, -y)
    return ((rad * 180) / Math.PI + 360) % 360
}

export const isValidHourInput = (value: number) => (is24Hour: boolean): boolean => {
    if (!Number.isInteger(value)) return false
    return is24Hour ? value >= 0 && value <= 23 : value >= 1 && value <= 12
}

export const isValidMinuteInput = (value: number): boolean => {
    return Number.isInteger(value) && value >= 0 && value <= 59
}

export const pad2 = (value: number): string => {
    if (!Number.isInteger(value) || value < 0 || value > 99) throw new Error('Value must be 0..99')
    return String(value).padStart(2, '0')
}

export const formatTimeOfDay = (time: ITimeOfDay) => (is24Hour: boolean): string => {
    assertTimeOfDay(time)
    if (is24Hour) return `${pad2(time.hour)}:${pad2(time.minute)}`
    return `${hourOfPeriod(time.hour)}:${pad2(time.minute)} ${periodOf(time.hour).toUpperCase()}`
}

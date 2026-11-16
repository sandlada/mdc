/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

export interface ITickMark {
    fraction      : number
    visualFraction: number
    active        : boolean
}

const MaxRenderedTicks = 200

const getDecimalPlaces = (num: number): number => {
    if (!Number.isFinite(num)) return 0
    const str = num.toString()
    const eIndex = str.indexOf('e-')
    if (eIndex !== -1) {
        return Number.parseInt(str.slice(eIndex + 2), 10)
    }
    const dotIndex = str.indexOf('.')
    return dotIndex === -1 ? 0 : str.length - dotIndex - 1
}

export const clamp = (min: number, max: number) => (value: number): number => {
    if (max <= min) return min
    return Math.min(max, Math.max(min, value))
}

export const roundToPrecision = (precision: number) => (value: number): number => {
    const factor = 10 ** Math.min(precision, 10)
    return Math.round(value * factor) / factor
}

export const snapValue = (min: number, max: number, step: number) => (rawValue: number): number => {
    const safeMax = Math.max(min, max)
    const clamped = clamp(min, safeMax)(Number.isFinite(rawValue) ? rawValue : min)
    if (step <= 0 || !Number.isFinite(step) || safeMax === min) {
        return clamped
    }
    const precision = Math.max(getDecimalPlaces(min), getDecimalPlaces(step))
    const stepsFromMin = Math.round((clamped - min) / step)
    const snapped = roundToPrecision(precision)(min + stepsFromMin * step)
    if (snapped > safeMax) {
        const prevStep = roundToPrecision(precision)(min + (stepsFromMin - 1) * step)
        return clamp(min, safeMax)(prevStep)
    }
    return clamp(min, safeMax)(snapped)
}

export const valueToFraction = (min: number, max: number) => (value: number): number => {
    if (max <= min) return 0
    return clamp(0, 1)((value - min) / (max - min))
}

export const fractionToValue = (min: number, max: number, step: number) => (fraction: number): number => {
    const safeFraction = clamp(0, 1)(fraction)
    const raw = min + safeFraction * Math.max(0, max - min)
    return snapValue(min, max, step)(raw)
}

export const toVisualFraction = (reversed: boolean) => (fraction: number): number => {
    const clamped = clamp(0, 1)(fraction)
    return reversed ? 1 - clamped : clamped
}

export const computeStepDelta = (min: number, max: number, step: number): number => {
    const span = Math.max(0, max - min)
    if (span === 0) return 0
    if (step > 0 && Number.isFinite(step)) return step
    return span / 100
}

export interface IComputeTicksOptions {
    min           : number
    max           : number
    step          : number
    reversed      : boolean
    activeStartVf : number
    activeEndVf   : number
    handleCenters : number[]
    trackLength   : number
    edgeInset     : number
    handleHalf    : number
    gap           : number
    tickRadius    : number
    hideStartEdge?: boolean
    hideEndEdge?  : boolean
}

/**
 * Compute visible tick marks along the slider track, excluding ticks
 * occluded by a handle gap or overlapping a terminal stop indicator.
 */
export const computeTicks = ({
    min,
    max,
    step,
    reversed,
    activeStartVf,
    activeEndVf,
    handleCenters,
    trackLength,
    edgeInset,
    handleHalf,
    gap,
    tickRadius,
    hideStartEdge = false,
    hideEndEdge = false,
}: IComputeTicksOptions): ITickMark[] => {
    if (step <= 0 || max <= min) return []
    const count = Math.floor((max - min) / step + 1e-9)
    if (count <= 0 || count > MaxRenderedTicks) return []

    const travel = Math.max(0, trackLength - 2 * edgeInset)
    const occlusionRadius = handleHalf + gap + tickRadius
    const marks: ITickMark[] = []

    for (let i = 0; i <= count; i++) {
        const value = Math.min(max, min + i * step)
        const fraction = valueToFraction(min, max)(value)
        const vf = toVisualFraction(reversed)(fraction)

        if (hideStartEdge && vf < 1e-4) continue
        if (hideEndEdge && vf > 1 - 1e-4) continue

        const centerPx = edgeInset + vf * travel
        const occluded = handleCenters.some((hc) => Math.abs(centerPx - hc) <= occlusionRadius)
        if (occluded) continue

        const active = vf >= activeStartVf - 1e-4 && vf <= activeEndVf + 1e-4
        marks.push({ fraction, visualFraction: vf, active })
    }

    return marks
}

/**
 * @license
 * Copyright 2020 The Android Open Source Project
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: Apache-2.0
 */
export const unitBezier = (first: number, second: number) => (t: number) => {
    const inverse = 1 - t
    return 3 * inverse * inverse * t * first + 3 * inverse * t * t * second + t ** 3
}

export const invertUnitCurve = (sample: (t: number) => number) => (value: number): number => {
    let low = 0
    let high = 1
    for (let step = 0; step < 18; step++) {
        const middle = (low + high) / 2
        if (sample(middle) < value) low = middle
        else high = middle
    }
    return (low + high) / 2
}

const BackGestureParameter = invertUnitCurve(unitBezier(0.1, 0))
const BackGesturePosition = unitBezier(0.1, 1)

export const backGestureProgress = (expandedPanes: number) => (progress: number): number => {
    if (!Number.isFinite(progress) || progress < 0 || progress > 1) throw new Error('Back gesture progress must be between 0 and 1')
    const limit = expandedPanes === 1 ? 0.1 : expandedPanes === 2 ? 0.15 : 0.2
    const eased = progress === 0 || progress === 1 ? progress : BackGesturePosition(BackGestureParameter(progress))
    return eased * limit
}

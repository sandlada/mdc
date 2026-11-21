/**
 * @license
 * Copyright 2019 The Android Open Source Project
 * SPDX-License-Identifier: Apache-2.0
 *
 * [Modified By Kai-Orion & Sandlada]
 *
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * TypeScript port of `androidx.compose.animation.core.SpringSimulation`,
 * `estimateAnimationDurationMillis`, and `androidx.compose.material3.MotionScheme`
 * (`ExpressiveMotionTokens` and `StandardMotionTokens`).
 *
 * @link https://android.googlesource.com/platform/frameworks/support/+/androidx-main/compose/animation/animation-core/src/commonMain/kotlin/androidx/compose/animation/core/SpringSimulation.kt
 * @link https://android.googlesource.com/platform/frameworks/support/+/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/MotionScheme.kt
 */

import type { ShapeMotionScheme, ShapeMotionSpeed } from '../shape.interface'

/** Stiffness / damping-ratio parameters of a spring (mass is always 1). */
export interface SpringParameters {
    readonly stiffness: number
    readonly dampingRatio: number
}

/** A spring's value and velocity at a point in time. */
export interface SpringMotion {
    readonly value: number
    readonly velocity: number
}

/** Options of {@link estimateAnimationDurationMillis}. */
export interface SpringDurationEstimate {
    readonly stiffness: number
    readonly dampingRatio: number
    readonly initialVelocity: number
    readonly initialDisplacement: number
    readonly delta: number
}

/**
 * Exact Material 3 `MotionScheme` spring presets (`ExpressiveMotionTokens` and
 * `StandardMotionTokens`).
 */
export const MotionScheme = {
    Expressive: {
        FastSpatial: { stiffness: 800, dampingRatio: 0.6 },
        DefaultSpatial: { stiffness: 380, dampingRatio: 0.8 },
        SlowSpatial: { stiffness: 200, dampingRatio: 0.8 },
        FastEffects: { stiffness: 3800, dampingRatio: 1.0 },
        DefaultEffects: { stiffness: 1600, dampingRatio: 1.0 },
        SlowEffects: { stiffness: 800, dampingRatio: 1.0 },
    },
    Standard: {
        FastSpatial: { stiffness: 1400, dampingRatio: 0.9 },
        DefaultSpatial: { stiffness: 700, dampingRatio: 0.9 },
        SlowSpatial: { stiffness: 300, dampingRatio: 0.9 },
        FastEffects: { stiffness: 3800, dampingRatio: 1.0 },
        DefaultEffects: { stiffness: 1600, dampingRatio: 1.0 },
        SlowEffects: { stiffness: 800, dampingRatio: 1.0 },
    },
} as const

/** Resolves the spatial spring parameters for a scheme + speed pair. */
export const resolveMotionSpring = (
    scheme: ShapeMotionScheme,
    speed: ShapeMotionSpeed,
): SpringParameters => {
    const group = scheme === 'standard' ? MotionScheme.Standard : MotionScheme.Expressive
    switch (speed) {
        case 'fast':
            return group.FastSpatial
        case 'slow':
            return group.SlowSpatial
        case 'default':
            return group.DefaultSpatial
    }
}

const MaxLongMillis = Number.MAX_SAFE_INTEGER

const assertSpringParameters = ({ stiffness, dampingRatio }: SpringParameters): void => {
    if (!Number.isFinite(stiffness) || !(stiffness > 0)) {
        throw new Error('Spring stiffness constant must be positive.')
    }
    if (!Number.isFinite(dampingRatio) || !(dampingRatio >= 0)) {
        throw new Error('Damping ratio must be non-negative')
    }
}

/**
 * Evaluates the analytic solution of a 1-mass spring at `timeElapsedMs`.
 */
export const springMotionAt =
    (spring: SpringParameters) =>
    (lastValue: number, lastVelocity: number, timeElapsedMs: number, finalPosition: number): SpringMotion => {
        assertSpringParameters(spring)
        const naturalFrequency = Math.sqrt(spring.stiffness)
        const { dampingRatio } = spring
        const adjustedDisplacement = lastValue - finalPosition
        const deltaT = Math.max(0, timeElapsedMs) / 1000
        const dampingRatioSquared = dampingRatio * dampingRatio
        const r = -dampingRatio * naturalFrequency

        let displacement: number
        let currentVelocity: number

        if (dampingRatio > 1) {
            const s = naturalFrequency * Math.sqrt(dampingRatioSquared - 1)
            const gammaPlus = r + s
            const gammaMinus = r - s
            const coeffB = (gammaMinus * adjustedDisplacement - lastVelocity) / (gammaMinus - gammaPlus)
            const coeffA = adjustedDisplacement - coeffB
            displacement = coeffA * Math.exp(gammaMinus * deltaT) + coeffB * Math.exp(gammaPlus * deltaT)
            currentVelocity =
                coeffA * gammaMinus * Math.exp(gammaMinus * deltaT) + coeffB * gammaPlus * Math.exp(gammaPlus * deltaT)
        } else if (dampingRatio === 1) {
            const coeffA = adjustedDisplacement
            const coeffB = lastVelocity + naturalFrequency * adjustedDisplacement
            const nFdT = -naturalFrequency * deltaT
            displacement = (coeffA + coeffB * deltaT) * Math.exp(nFdT)
            currentVelocity = (coeffA + coeffB * deltaT) * Math.exp(nFdT) * -naturalFrequency + coeffB * Math.exp(nFdT)
        } else {
            const dampedFrequency = naturalFrequency * Math.sqrt(1 - dampingRatioSquared)
            const cosCoeff = adjustedDisplacement
            const sinCoeff = (1 / dampedFrequency) * (-r * adjustedDisplacement + lastVelocity)
            const dFdT = dampedFrequency * deltaT
            displacement = Math.exp(r * deltaT) * (cosCoeff * Math.cos(dFdT) + sinCoeff * Math.sin(dFdT))
            currentVelocity =
                displacement * r +
                Math.exp(r * deltaT) *
                    (-dampedFrequency * cosCoeff * Math.sin(dFdT) + dampedFrequency * sinCoeff * Math.cos(dFdT))
        }

        return { value: displacement + finalPosition, velocity: currentVelocity }
    }

/**
 * Estimated time (in whole milliseconds, truncated) the spring will last until
 * it stays within `delta` of the final position.
 */
export const estimateAnimationDurationMillis = (estimate: SpringDurationEstimate): number => {
    const { stiffness, dampingRatio, initialVelocity, initialDisplacement, delta } = estimate
    assertSpringParameters({ stiffness, dampingRatio })
    if (dampingRatio === 0) return MaxLongMillis

    const dampingCoefficient = 2 * dampingRatio * Math.sqrt(stiffness)
    const partialRoot = dampingCoefficient * dampingCoefficient - 4 * stiffness
    const partialRootReal = partialRoot < 0 ? 0 : Math.sqrt(partialRoot)
    const partialRootImaginary = partialRoot < 0 ? Math.sqrt(Math.abs(partialRoot)) : 0
    const firstRootReal = (-dampingCoefficient + partialRootReal) * 0.5
    const firstRootImaginary = partialRootImaginary * 0.5
    const secondRootReal = (-dampingCoefficient - partialRootReal) * 0.5

    return estimateDurationInternal(
        firstRootReal,
        firstRootImaginary,
        secondRootReal,
        dampingRatio,
        initialVelocity,
        initialDisplacement,
        delta,
    )
}

const estimateDurationInternal = (
    firstRootReal: number,
    firstRootImaginary: number,
    secondRootReal: number,
    dampingRatio: number,
    initialVelocity: number,
    initialPosition: number,
    delta: number,
): number => {
    if (initialPosition === 0 && initialVelocity === 0) return 0
    const v0 = initialPosition < 0 ? -initialVelocity : initialVelocity
    const p0 = Math.abs(initialPosition)

    const seconds =
        dampingRatio > 1
            ? estimateOverDamped(firstRootReal, secondRootReal, p0, v0, delta)
            : dampingRatio < 1
              ? estimateUnderDamped(firstRootReal, firstRootImaginary, p0, v0, delta)
              : estimateCriticallyDamped(firstRootReal, p0, v0, delta)

    return Math.trunc(seconds * 1000)
}

const iterateNewtonsMethod = (x: number, fn: (t: number) => number, fnPrime: (t: number) => number): number =>
    x - fn(x) / fnPrime(x)

const estimateUnderDamped = (
    firstRootReal: number,
    firstRootImaginary: number,
    p0: number,
    v0: number,
    delta: number,
): number => {
    const r = firstRootReal
    const c1 = p0
    const c2 = (v0 - r * c1) / firstRootImaginary
    const c = Math.sqrt(c1 * c1 + c2 * c2)
    return Math.log(delta / c) / r
}

const estimateCriticallyDamped = (firstRootReal: number, p0: number, v0: number, delta: number): number => {
    const r = firstRootReal
    const c1 = p0
    const c2 = v0 - r * c1

    const t1 = Math.log(Math.abs(delta / c1)) / r
    const t2 =
        ((): number => {
            const guess = Math.log(Math.abs(delta / c2))
            let t = guess
            for (let i = 0; i <= 5; i++) t = guess - Math.log(Math.abs(t / r))
            return t
        })() / r
    let tCurrent = Number.isFinite(t1) ? (Number.isFinite(t2) ? Math.max(t1, t2) : t1) : t2

    const tInflection = -(r * c1 + c2) / (r * c2)
    const xInflection = c1 * Math.exp(r * tInflection) + c2 * tInflection * Math.exp(r * tInflection)

    let signedDelta: number
    if (Number.isNaN(tInflection) || tInflection <= 0) {
        signedDelta = -delta
    } else if (-xInflection < delta) {
        if (c2 < 0 && c1 > 0) tCurrent = 0
        signedDelta = -delta
    } else {
        tCurrent = -(2 / r) - c1 / c2
        signedDelta = delta
    }

    let tDelta = Number.MAX_VALUE
    let iterations = 0
    while (tDelta > 0.001 && iterations < 100) {
        iterations++
        const tLast = tCurrent
        tCurrent = iterateNewtonsMethod(
            tCurrent,
            t => (c1 + c2 * t) * Math.exp(r * t) + signedDelta,
            t => (c2 * (r * t + 1) + c1 * r) * Math.exp(r * t),
        )
        tDelta = Math.abs(tLast - tCurrent)
    }
    return tCurrent
}

const estimateOverDamped = (
    firstRootReal: number,
    secondRootReal: number,
    p0: number,
    v0: number,
    delta: number,
): number => {
    const r1 = firstRootReal
    const r2 = secondRootReal
    const c2 = (r1 * p0 - v0) / (r1 - r2)
    const c1 = p0 - c2

    const t1 = Math.log(Math.abs(delta / c1)) / r1
    const t2 = Math.log(Math.abs(delta / c2)) / r2
    let tCurrent = Number.isFinite(t1) ? (Number.isFinite(t2) ? Math.max(t1, t2) : t1) : t2

    const tInflection = Math.log((c1 * r1) / (-c2 * r2)) / (r2 - r1)
    const xInflection = (): number => c1 * Math.exp(r1 * tInflection) + c2 * Math.exp(r2 * tInflection)

    let signedDelta: number
    if (Number.isNaN(tInflection) || tInflection <= 0) {
        signedDelta = -delta
    } else if (-xInflection() < delta) {
        if (c2 > 0 && c1 < 0) tCurrent = 0
        signedDelta = -delta
    } else {
        tCurrent = Math.log(-(c2 * r2 * r2) / (c1 * r1 * r1)) / (r1 - r2)
        signedDelta = delta
    }

    if (Math.abs(c1 * r1 * Math.exp(r1 * tCurrent) + c2 * r2 * Math.exp(r2 * tCurrent)) < 0.0001) {
        return tCurrent
    }

    let tDelta = Number.MAX_VALUE
    let iterations = 0
    while (tDelta > 0.001 && iterations < 100) {
        iterations++
        const tLast = tCurrent
        tCurrent = iterateNewtonsMethod(
            tCurrent,
            t => c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t) + signedDelta,
            t => c1 * r1 * Math.exp(r1 * t) + c2 * r2 * Math.exp(r2 * t),
        )
        tDelta = Math.abs(tLast - tCurrent)
    }
    return tCurrent
}

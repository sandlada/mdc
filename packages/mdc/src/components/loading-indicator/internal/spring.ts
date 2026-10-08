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
 * TypeScript port of `androidx.compose.animation.core.SpringSimulation`
 * (analytic spring motion) and `estimateAnimationDurationMillis`
 * (`SpringEstimation.kt`) — the exact physics behind the morph animation of
 * the MD3 Expressive loading indicator.
 *
 * @link https://android.googlesource.com/platform/frameworks/support/+/androidx-main/compose/animation/animation-core/src/commonMain/kotlin/androidx/compose/animation/core/SpringSimulation.kt
 * @link https://android.googlesource.com/platform/frameworks/support/+/androidx-main/compose/animation/animation-core/src/commonMain/kotlin/androidx/compose/animation/core/SpringEstimation.kt
 */

/** Stiffness / damping-ratio parameters of a spring (mass is always 1). */
export interface SpringParameters {
    /** Spring constant; stiffer springs move faster. Must be positive. */
    readonly stiffness: number
    /** Damping ratio: < 1 underdamped (overshoots), 1 critical, > 1 overdamped. */
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
    /** Distance from the final position that counts as "arrived". */
    readonly delta: number
}

const MAX_LONG_MILLIS = Number.MAX_SAFE_INTEGER

/** Validates spring parameters. */
const assertSpringParameters = ({ stiffness, dampingRatio }: SpringParameters): void => {
    if (!(stiffness > 0)) throw new Error('Spring stiffness constant must be positive.')
    if (!(dampingRatio >= 0)) throw new Error('Damping ratio must be non-negative')
}

/**
 * Creates a spring motion function: evaluates the analytic solution of the
 * 1-mass spring at `timeElapsedMs` after the given start state, for the given
 * final position.
 *
 * @example
 * ```typescript
 * const spring = springMotionAt({ stiffness: 200, dampingRatio: 0.6 })
 * const { value, velocity } = spring(0, 0, 100, 1)
 * ```
 */
export const springMotionAt =
    (spring: SpringParameters) =>
    (lastValue: number, lastVelocity: number, timeElapsedMs: number, finalPosition: number): SpringMotion => {
        assertSpringParameters(spring)
        const naturalFrequency = Math.sqrt(spring.stiffness)
        const { dampingRatio } = spring
        const adjustedDisplacement = lastValue - finalPosition
        const deltaT = timeElapsedMs / 1000 // seconds
        const dampingRatioSquared = dampingRatio * dampingRatio
        const r = -dampingRatio * naturalFrequency

        let displacement: number
        let currentVelocity: number

        if (dampingRatio > 1) {
            // Over-damped.
            const s = naturalFrequency * Math.sqrt(dampingRatioSquared - 1)
            const gammaPlus = r + s
            const gammaMinus = r - s
            const coeffB = (gammaMinus * adjustedDisplacement - lastVelocity) / (gammaMinus - gammaPlus)
            const coeffA = adjustedDisplacement - coeffB
            displacement = coeffA * Math.exp(gammaMinus * deltaT) + coeffB * Math.exp(gammaPlus * deltaT)
            currentVelocity =
                coeffA * gammaMinus * Math.exp(gammaMinus * deltaT) + coeffB * gammaPlus * Math.exp(gammaPlus * deltaT)
        } else if (dampingRatio === 1) {
            // Critically damped.
            const coeffA = adjustedDisplacement
            const coeffB = lastVelocity + naturalFrequency * adjustedDisplacement
            const nFdT = -naturalFrequency * deltaT
            displacement = (coeffA + coeffB * deltaT) * Math.exp(nFdT)
            currentVelocity = (coeffA + coeffB * deltaT) * Math.exp(nFdT) * -naturalFrequency + coeffB * Math.exp(nFdT)
        } else {
            // Under-damped.
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
 * it stays within `delta` of the final position — the same estimate Compose's
 * `FloatSpringSpec.getDurationNanos` uses to end a spring animation.
 */
export const estimateAnimationDurationMillis = (estimate: SpringDurationEstimate): number => {
    const { stiffness, dampingRatio, initialVelocity, initialDisplacement, delta } = estimate
    if (dampingRatio === 0) {
        // No damping: the spring never settles.
        return MAX_LONG_MILLIS
    }

    // Roots of the characteristic polynomial x² + c·x + k (a folded into the
    // other computations).
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

    // The system is manipulated such that p0 is always positive.
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

/**
 * Under-damped estimate: the motion is `x(t) = c·e^(r·t)·cos(…)`, so `c·e^(r·t)`
 * is its envelope and the time at which it decays to `delta` can be computed
 * directly.
 */
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

/** Critically-damped estimate: Newton-Raphson on `x(t) = (c1 + c2·t)·e^(r·t)`. */
const estimateCriticallyDamped = (firstRootReal: number, p0: number, v0: number, delta: number): number => {
    const r = firstRootReal
    const c1 = p0
    const c2 = v0 - r * c1

    // Initial guess: max t of c1·e^(r·t) = delta and c2·t·e^(r·t) = delta (the
    // latter via Lambert's W function).
    const t1 = Math.log(Math.abs(delta / c1)) / r
    const t2 =
        ((): number => {
            const guess = Math.log(Math.abs(delta / c2))
            let t = guess
            for (let i = 0; i <= 5; i++) t = guess - Math.log(Math.abs(t / r))
            return t
        })() / r
    let tCurrent = Number.isFinite(t1) ? (Number.isFinite(t2) ? Math.max(t1, t2) : t1) : t2

    // Inflection time matters when it lands in t > 0.
    const tInflection = -(r * c1 + c2) / (r * c2)
    const xInflection = c1 * Math.exp(r * tInflection) + c2 * tInflection * Math.exp(r * tInflection)

    // For an inflection that does not exist in real time, solve x(t) = delta.
    let signedDelta: number
    if (Number.isNaN(tInflection) || tInflection <= 0) {
        signedDelta = -delta
    } else if (-xInflection < delta) {
        // The first crossing with the threshold; search from the left.
        if (c2 < 0 && c1 > 0) tCurrent = 0
        signedDelta = -delta
    } else {
        // Three threshold crossings: find the final one by starting between
        // the concavity change and the inflection point.
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

/** Over-damped estimate: Newton-Raphson on `x(t) = c1·e^(r1·t) + c2·e^(r2·t)`. */
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

    // Initial guess: max t of c1·e^(r1·t) = delta and c2·e^(r2·t) = delta.
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

    // A good initial guess is simply returned.
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

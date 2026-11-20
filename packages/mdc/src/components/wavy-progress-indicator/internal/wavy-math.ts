/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { WavyAmplitudeProvider, WavyProgressIndicatorStrokeCaps } from '../wavy-progress-indicator.interface'

/** State of a 1D critically-damped spring integrator. */
export interface SpringState {
    value: number
    velocity: number
}

/** State of an interruptible eased amplitude transition. */
export interface AmplitudeTransition {
    from: number
    target: number
    current: number
    elapsedMs: number
}

/** Normalized [tail, head] range in [0, 1] for an indeterminate linear segment. */
export interface LinearSegment {
    tail: number
    head: number
}

/** Start angle and sweep angle (in radians) for an indeterminate circular arc. */
export interface CircularArc {
    startAngleRad: number
    sweepAngleRad: number
}

/** Jetpack Compose `LinearAnimationDuration = 1750` (ms). */
export const LinearIndeterminateDurationMs = 1750

/** Jetpack Compose `CircularAnimationDuration = 6000` (ms). */
export const CircularIndeterminateDurationMs = 6000

/** Default amplitude transition duration matching Compose `500ms` tween. */
export const AmplitudeTransitionDurationMs = 500

/** Clamps a finite number to `[0, 1]` (non-finite inputs clamp to `0`). */
export function clamp01(value: number): number {
    if (!Number.isFinite(value)) {
        return 0
    }
    return Math.min(1, Math.max(0, value))
}

/** Wraps `value` into `[0, period)` cleanly for both positive and negative values. */
export function wrapPositiveModulo(value: number, period: number): number {
    if (period <= 0 || !Number.isFinite(value)) {
        return 0
    }
    return ((value % period) + period) % period
}

/**
 * Returns how far a stroke cap protrudes past its path endpoint (`strokeWidth / 2`
 * for `'round'` and `'square'`, `0` for `'butt'`).
 */
export function computeCapProtrusion(
    strokeWidth: number,
    cap: WavyProgressIndicatorStrokeCaps,
): number {
    if (cap === 'butt' || strokeWidth <= 0) {
        return 0
    }
    return strokeWidth / 2
}

/**
 * Computes the target normalized amplitude `[0, 1]` using Jetpack Compose's
 * `WavyProgressIndicatorDefaults.indicatorAmplitude(progress)` curve:
 * - `0` when `progress <= 0.1` or `progress >= 0.95`
 * - `1` in between
 * - Always `1` when `indeterminate` is `true`
 */
export function computeTargetAmplitude(
    fraction: number,
    indeterminate: boolean,
    customAmplitude: WavyAmplitudeProvider,
): number {
    if (typeof customAmplitude === 'function') {
        return clamp01(customAmplitude(fraction))
    }
    if (customAmplitude !== null && Number.isFinite(customAmplitude)) {
        return clamp01(customAmplitude)
    }
    if (indeterminate) {
        return 1
    }
    return fraction <= 0.1 || fraction >= 0.95 ? 0 : 1
}

/**
 * Integrates a 1D spring approximating Jetpack Compose's
 * `SpringSpec(dampingRatio = DampingRatioNoBouncy (1), stiffness = StiffnessVeryLow (50))`.
 * Uses fixed sub-stepping so large frame deltas remain unconditionally stable.
 */
export function stepSpring(
    state: SpringState,
    target: number,
    dtSec: number,
    stiffness = 50,
    dampingRatio = 1,
): SpringState {
    if (dtSec <= 0) {
        return { ...state }
    }

    const clampedDt = Math.min(dtSec, 0.1)
    const maxStep = 1 / 120
    const steps = Math.max(1, Math.ceil(clampedDt / maxStep))
    const h = clampedDt / steps
    const damping = 2 * dampingRatio * Math.sqrt(stiffness)

    let x = state.value
    let v = state.velocity

    for (let i = 0; i < steps; i++) {
        const accel = -stiffness * (x - target) - damping * v
        v += accel * h
        x += v * h
    }

    if (Math.abs(x - target) < 0.0005 && Math.abs(v) < 0.0005) {
        return { value: target, velocity: 0 }
    }

    return { value: x, velocity: v }
}

/**
 * Evaluates a cubic-bezier easing curve `(p1x, p1y, p2x, p2y)` at progress `x` in `[0, 1]`.
 */
export function sampleCubicBezier(
    p1x: number,
    p1y: number,
    p2x: number,
    p2y: number,
    x: number,
): number {
    if (x <= 0) return 0
    if (x >= 1) return 1

    const cx = 3 * p1x
    const bx = 3 * (p2x - p1x) - cx
    const ax = 1 - cx - bx

    const cy = 3 * p1y
    const by = 3 * (p2y - p1y) - cy
    const ay = 1 - cy - by

    let t = x
    for (let i = 0; i < 6; i++) {
        const currentX = ((ax * t + bx) * t + cx) * t - x
        if (Math.abs(currentX) < 1e-6) break
        const dx = (3 * ax * t + 2 * bx) * t + cx
        if (Math.abs(dx) < 1e-6) break
        t -= currentX / dx
    }

    if (t < 0 || t > 1) {
        let lo = 0
        let hi = 1
        t = x
        for (let i = 0; i < 12; i++) {
            const currentX = ((ax * t + bx) * t + cx) * t
            if (Math.abs(currentX - x) < 1e-6) break
            if (x > currentX) lo = t
            else hi = t
            t = 0.5 * (lo + hi)
        }
    }

    return ((ay * t + by) * t + cy) * t
}

/**
 * Advances an interruptible amplitude transition using Material's standard
 * easing (`cubic-bezier(0.4, 0, 0.2, 1)`).
 */
export function stepAmplitudeTransition(
    transition: AmplitudeTransition,
    dtMs: number,
    durationMs = AmplitudeTransitionDurationMs,
): AmplitudeTransition {
    if (transition.elapsedMs >= durationMs || dtMs <= 0) {
        return {
            ...transition,
            current: transition.target,
            elapsedMs: durationMs,
        }
    }

    const nextElapsed = Math.min(durationMs, transition.elapsedMs + dtMs)
    const t = nextElapsed / durationMs
    const eased = sampleCubicBezier(0.4, 0, 0.2, 1, t)
    const current = transition.from + (transition.target - transition.from) * eased

    return {
        ...transition,
        current,
        elapsedMs: nextElapsed,
    }
}

/**
 * Computes the two indeterminate linear active segments using Jetpack Compose's
 * `LinearAnimationDuration = 1750ms` head/tail keyframes.
 */
export function computeLinearIndeterminateSegments(cycleTimeMs: number): [LinearSegment, LinearSegment] {
    const t = ((cycleTimeMs % LinearIndeterminateDurationMs) + LinearIndeterminateDurationMs) % LinearIndeterminateDurationMs

    const evalWindow = (
        delay: number,
        duration: number,
        p1x: number,
        p1y: number,
        p2x: number,
        p2y: number,
    ): number => {
        if (t <= delay) return 0
        const progress = Math.min(1, (t - delay) / duration)
        return sampleCubicBezier(p1x, p1y, p2x, p2y, progress)
    }

    // Compose Line 1: Head 0..750ms, Tail 333..1183ms
    const line1Head = evalWindow(0, 750, 0.2, 0.0, 0.8, 1.0)
    const line1Tail = evalWindow(333, 850, 0.4, 0.0, 1.0, 1.0)

    // Compose Line 2: Head 1000..1567ms, Tail 1267..1800ms (clamped at 1750ms)
    const line2Head = evalWindow(1000, 567, 0.0, 0.0, 0.65, 1.0)
    const line2Tail = evalWindow(1267, 483, 0.1, 0.0, 0.45, 1.0)

    return [
        { tail: line1Tail, head: line1Head },
        { tail: line2Tail, head: line2Head },
    ]
}

/**
 * Computes the indeterminate circular arc start and sweep angles (in radians)
 * matching Jetpack Compose's `CircularAnimationDuration = 6000ms` spinner:
 * - Rotates `1440deg` (`8π` rad) over `6000ms`
 * - Sweeps between `0.1` (`36deg`) and `0.87` (`313.2deg`) with standard easing
 */
export function computeCircularIndeterminateArc(cycleTimeMs: number): CircularArc {
    const t = ((cycleTimeMs % CircularIndeterminateDurationMs) + CircularIndeterminateDurationMs) % CircularIndeterminateDurationMs
    const normalized = t / CircularIndeterminateDurationMs

    // Base rotation: -90deg top + 1440deg over 6000ms
    const rotationRad = -Math.PI / 2 + normalized * 8 * Math.PI

    // Sweep oscillates 0.1 -> 0.87 -> 0.1 over 6000ms
    const halfPhase = normalized < 0.5 ? normalized * 2 : (normalized - 0.5) * 2
    const eased = sampleCubicBezier(0.4, 0, 0.2, 1, halfPhase)
    const sweepFraction = normalized < 0.5
        ? 0.1 + (0.87 - 0.1) * eased
        : 0.87 - (0.87 - 0.1) * eased

    return {
        startAngleRad: rotationRad,
        sweepAngleRad: sweepFraction * 2 * Math.PI,
    }
}

/**
 * Computes the angular gap (in radians) between the circular active arc and
 * track arc, matching Compose's `adjustedGapSize = gap + strokeWidth`.
 */
export function computeCircularTrackGapAngle(
    radius: number,
    strokeWidth: number,
    gap: number,
): number {
    if (radius <= 0) return 0
    return ((gap + strokeWidth) / (2 * Math.PI * radius)) * 2 * Math.PI
}

/**
 * Builds an SVG `<path d>` string for a linear horizontal segment that smoothly
 * morphs between a straight line (`amplitude === 0`) and a sinusoidal wave.
 */
export function buildLinearWavyPath(
    startX: number,
    endX: number,
    centerY: number,
    amplitude: number,
    wavelength: number,
    phasePx: number,
): string {
    if (endX < startX) {
        return ''
    }

    if (endX - startX < 0.01) {
        const x = startX.toFixed(2)
        const y = centerY.toFixed(2)
        return `M ${x} ${y} L ${x} ${y}`
    }

    if (amplitude <= 0.001 || wavelength <= 0) {
        return `M ${startX.toFixed(2)} ${centerY.toFixed(2)} L ${endX.toFixed(2)} ${centerY.toFixed(2)}`
    }

    const step = 2
    const twoPiOverLambda = (2 * Math.PI) / wavelength
    const parts: string[] = []

    for (let x = startX; x < endX; x += step) {
        const y = centerY + amplitude * Math.sin((x - phasePx) * twoPiOverLambda)
        parts.push(`${x === startX ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
    }

    const endY = centerY + amplitude * Math.sin((endX - phasePx) * twoPiOverLambda)
    parts.push(`L ${endX.toFixed(2)} ${endY.toFixed(2)}`)

    return parts.join(' ')
}

/**
 * Builds an SVG `<path d>` string for a circular arc that smoothly morphs
 * between a true circle (`amplitude === 0`) and a sinusoidal radial wave.
 */
export function buildCircularWavyPath(
    cx: number,
    cy: number,
    radius: number,
    startAngleRad: number,
    sweepAngleRad: number,
    amplitude: number,
    waveCount: number,
    phaseRad: number,
): string {
    if (sweepAngleRad <= 0.0001 || radius <= 0) {
        return ''
    }

    if (amplitude <= 0.001 || waveCount <= 0) {
        if (sweepAngleRad >= 2 * Math.PI - 0.001) {
            const r = radius.toFixed(2)
            return `M ${(cx + radius).toFixed(2)} ${cy.toFixed(2)} A ${r} ${r} 0 1 1 ${(cx - radius).toFixed(2)} ${cy.toFixed(2)} A ${r} ${r} 0 1 1 ${(cx + radius).toFixed(2)} ${cy.toFixed(2)}`
        }
        const endAngle = startAngleRad + sweepAngleRad
        const x1 = cx + radius * Math.cos(startAngleRad)
        const y1 = cy + radius * Math.sin(startAngleRad)
        const x2 = cx + radius * Math.cos(endAngle)
        const y2 = cy + radius * Math.sin(endAngle)
        const largeArc = sweepAngleRad > Math.PI ? 1 : 0
        const r = radius.toFixed(2)
        return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
    }

    const sweepDeg = (sweepAngleRad * 180) / Math.PI
    const segments = Math.max(12, Math.ceil(sweepDeg / 2))
    const parts: string[] = []

    for (let i = 0; i <= segments; i++) {
        const angle = startAngleRad + (i / segments) * sweepAngleRad
        const r = radius + amplitude * Math.sin(angle * waveCount - phaseRad)
        const x = cx + r * Math.cos(angle)
        const y = cy + r * Math.sin(angle)
        parts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
    }

    return parts.join(' ')
}

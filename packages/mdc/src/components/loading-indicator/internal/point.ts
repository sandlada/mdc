/**
 * @license
 * Copyright 2022 The Android Open Source Project
 * SPDX-License-Identifier: Apache-2.0
 *
 * [Modified By Kai-Orion & Sandlada]
 *
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * TypeScript port of the `androidx.graphics.shapes` point / vector primitives
 * (`Point.kt` + `Utils.kt`). Pure functions only (Data-Last friendly); every
 * value is immutable.
 *
 * @link https://android.googlesource.com/platform/frameworks/support/+/androidx-main/graphics/graphics-shapes/src/main/java/androidx/graphics/shapes/Point.kt
 * @link https://android.googlesource.com/platform/frameworks/support/+/androidx-main/graphics/graphics-shapes/src/main/java/androidx/graphics/shapes/Utils.kt
 */

/** Immutable 2D point (mirrors the `FloatFloatPair` based `Point` of the source). */
export interface Point {
    readonly x: number
    readonly y: number
}

/** Creates a point from its coordinates. */
export const point = (x: number, y: number): Point => ({ x, y })

/**
 * Distance below which two points are considered the same, within reasonable
 * roundoff — intended to stay sub-pixel on any reasonable display.
 */
export const DISTANCE_EPSILON = 1e-4

/** Epsilon used for angle / outline-progress comparisons. */
export const ANGLE_EPSILON = 1e-6

/**
 * Relaxed epsilon for comparisons that people perceive more leniently than the
 * exact math (used by the collinearity checks).
 */
export const RELAXED_DISTANCE_EPSILON = 5e-3

/** Distance of (x, y) from the origin. */
export const distance = (x: number, y: number): number => Math.hypot(x, y)

/** Squared distance of (x, y) from the origin; cheaper than {@link distance}. */
export const distanceSquared = (x: number, y: number): number => x * x + y * y

/** Squares a scalar. */
export const square = (x: number): number => x * x

/**
 * Unit vector pointing in the direction of (x, y).
 *
 * @throws If (x, y) is the zero vector.
 */
export const directionVector = (x: number, y: number): Point => {
    const d = distance(x, y)
    if (!(d > 0)) throw new Error('Required distance greater than zero')
    return point(x / d, y / d)
}

/** Unit vector at the given angle in radians (`x = cos`, `y = sin`). */
export const directionVectorAtAngle = (angleRadians: number): Point =>
    point(Math.cos(angleRadians), Math.sin(angleRadians))

/** Point at `radius` from `center`, in the direction of `angleRadians`. */
export const radialToCartesian = (
    radius: number,
    angleRadians: number,
    center: Point = point(0, 0),
): Point => {
    const direction = directionVectorAtAngle(angleRadians)
    return point(direction.x * radius + center.x, direction.y * radius + center.y)
}

/** Rotates a vector 90° (unnormalized perpendicular, `(-y, x)`). */
export const rotate90 = (p: Point): Point => point(-p.y, p.x)

/** `a - b`. */
export const subtractPoints = (a: Point, b: Point): Point => point(a.x - b.x, a.y - b.y)

/** `a + b`. */
export const addPoints = (a: Point, b: Point): Point => point(a.x + b.x, a.y + b.y)

/** `p * factor`. */
export const scalePoint = (p: Point, factor: number): Point => point(p.x * factor, p.y * factor)

/** Dot product of two vectors. */
export const dotProduct = (a: Point, b: Point): number => a.x * b.x + a.y * b.y

/** Distance between two points. */
export const pointDistance = (a: Point, b: Point): number => distance(a.x - b.x, a.y - b.y)

/** Squared distance between two points. */
export const pointDistanceSquared = (a: Point, b: Point): number => distanceSquared(a.x - b.x, a.y - b.y)

/** Whether vector `a` runs clockwise (y-down) compared with vector `b`. */
export const clockwise = (a: Point, b: Point): boolean => a.x * b.y - a.y * b.x > 0

/** Linear interpolation between two scalars (extrapolation allowed outside `[0, 1]`). */
export const interpolate = (start: number, stop: number, fraction: number): number =>
    (1 - fraction) * start + fraction * stop

/** Linear interpolation between two points (extrapolation allowed outside `[0, 1]`). */
export const interpolatePoints = (start: Point, stop: Point, fraction: number): Point =>
    point(interpolate(start.x, stop.x, fraction), interpolate(start.y, stop.y, fraction))

/** Positive modulo: `positiveModulo(-4, 3)` is `2`, unlike `-4 % 3`. */
export const positiveModulo = (num: number, mod: number): number => ((num % mod) + mod) % mod

/** Whether C lies on the line through A and B, within `tolerance`. */
export const collinearIsh = (
    aX: number,
    aY: number,
    bX: number,
    bY: number,
    cX: number,
    cY: number,
    tolerance = DISTANCE_EPSILON,
): boolean => {
    const ab = rotate90(point(bX - aX, bY - aY))
    const ac = point(cX - aX, cY - aY)
    const product = Math.abs(dotProduct(ab, ac))
    const relativeTolerance = tolerance * distance(ab.x, ab.y) * distance(ac.x, ac.y)
    return product < tolerance || product < relativeTolerance
}

/**
 * Approximates whether the corner at `current` is concave or convex, based on
 * the relationship of the prev→curr / curr→next vectors.
 */
export const convex = (previous: Point, current: Point, next: Point): boolean =>
    clockwise(subtractPoints(current, previous), subtractPoints(next, current))

/**
 * Distance between two progress values. Progress wraps around, so a numeric
 * difference of `0.99` counts as a distance of `0.01`.
 */
export const progressDistance = (p1: number, p2: number): number => {
    const d = Math.abs(p1 - p2)
    return Math.min(d, 1 - d)
}

/**
 * Whether `progress` is inside the (possibly wrapping) range
 * `[progressFrom, progressTo]`. For example, for the range 0.7 → 0.2 both 0.8
 * and 0.1 are inside and 0.5 is outside.
 */
export const progressInRange = (progress: number, progressFrom: number, progressTo: number): boolean =>
    progressTo >= progressFrom
        ? progress >= progressFrom && progress <= progressTo
        : progress >= progressFrom || progress <= progressTo

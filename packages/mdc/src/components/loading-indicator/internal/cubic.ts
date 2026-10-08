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
 * TypeScript port of `androidx.graphics.shapes.Cubic`: a single cubic Bézier
 * curve (two anchors + two controls), the atom of the morphing-shape engine.
 * Instances are immutable; point data lives in a plain `Float64Array(8)`.
 *
 * @link https://android.googlesource.com/platform/frameworks/support/+/androidx-main/graphics/graphics-shapes/src/main/java/androidx/graphics/shapes/Cubic.kt
 */

import {
    DISTANCE_EPSILON,
    directionVector,
    distance,
    dotProduct,
    interpolate,
    point,
    rotate90,
    type Point,
} from './point'

/** Transforms (rotate / scale / translate / …) a point, returning a new point. */
export type PointTransformer = (p: Point) => Point

const ZERO_ISH = (value: number): boolean => Math.abs(value) < DISTANCE_EPSILON

/**
 * A single cubic Bézier curve with anchor points `(anchor0X, anchor0Y)` /
 * `(anchor1X, anchor1Y)` and control points `(control0X, control0Y)` /
 * `(control1X, control1Y)` determining the slope between the anchors.
 */
export class Cubic {
    /**
     * The 8 curve values, in order: anchor0 (x, y), control0 (x, y),
     * control1 (x, y), anchor1 (x, y).
     */
    public readonly points: Float64Array

    public constructor(points: Float64Array) {
        if (points.length !== 8) throw new Error('Points array size should be 8')
        this.points = points
    }

    /** First anchor point x coordinate. */
    public get anchor0X(): number {
        return this.points[0]
    }

    /** First anchor point y coordinate. */
    public get anchor0Y(): number {
        return this.points[1]
    }

    /** First control point x coordinate. */
    public get control0X(): number {
        return this.points[2]
    }

    /** First control point y coordinate. */
    public get control0Y(): number {
        return this.points[3]
    }

    /** Second control point x coordinate. */
    public get control1X(): number {
        return this.points[4]
    }

    /** Second control point y coordinate. */
    public get control1Y(): number {
        return this.points[5]
    }

    /** Second anchor point x coordinate. */
    public get anchor1X(): number {
        return this.points[6]
    }

    /** Second anchor point y coordinate. */
    public get anchor1Y(): number {
        return this.points[7]
    }

    /**
     * Point on the curve at parameter `t` (`0` = anchor0, `1` = anchor1).
     */
    public pointOnCurve(t: number): Point {
        const u = 1 - t
        return point(
            this.anchor0X * (u * u * u) +
                this.control0X * (3 * t * u * u) +
                this.control1X * (3 * t * t * u) +
                this.anchor1X * (t * t * t),
            this.anchor0Y * (u * u * u) +
                this.control0Y * (3 * t * u * u) +
                this.control1Y * (3 * t * t * u) +
                this.anchor1Y * (t * t * t),
        )
    }

    /** Whether both anchors coincide (within epsilon). */
    public zeroLength(): boolean {
        return (
            Math.abs(this.anchor0X - this.anchor1X) < DISTANCE_EPSILON &&
            Math.abs(this.anchor0Y - this.anchor1Y) < DISTANCE_EPSILON
        )
    }

    /**
     * Fills `bounds` with the axis-aligned bounding box values for left, top,
     * right and bottom, in that order.
     *
     * @param approximate When set, uses the bounding box of the anchors and
     * controls (Skia "fast" bounds); otherwise solves the derivative for the
     * true extremal points.
     */
    public calculateBounds(bounds: Float64Array, approximate = false): void {
        // A zero-length curve simply returns its shared anchor.
        if (this.zeroLength()) {
            bounds[0] = this.anchor0X
            bounds[1] = this.anchor0Y
            bounds[2] = this.anchor0X
            bounds[3] = this.anchor0Y
            return
        }

        let minX = Math.min(this.anchor0X, this.anchor1X)
        let minY = Math.min(this.anchor0Y, this.anchor1Y)
        let maxX = Math.max(this.anchor0X, this.anchor1X)
        let maxY = Math.max(this.anchor0Y, this.anchor1Y)

        if (approximate) {
            bounds[0] = Math.min(minX, Math.min(this.control0X, this.control1X))
            bounds[1] = Math.min(minY, Math.min(this.control0Y, this.control1Y))
            bounds[2] = Math.max(maxX, Math.max(this.control0X, this.control1X))
            bounds[3] = Math.max(maxY, Math.max(this.control0Y, this.control1Y))
            return
        }

        // The derivative is a quadratic Bézier; solve it with the quadratic
        // formula for the x coordinate…
        const xa = -this.anchor0X + 3 * this.control0X - 3 * this.control1X + this.anchor1X
        const xb = 2 * this.anchor0X - 4 * this.control0X + 2 * this.control1X
        const xc = -this.anchor0X + this.control0X

        if (ZERO_ISH(xa)) {
            // When a is 0 the formula degenerates to a linear root.
            if (xb !== 0) {
                const t = (2 * xc) / (-2 * xb)
                if (t >= 0 && t <= 1) {
                    const value = this.pointOnCurve(t).x
                    if (value < minX) minX = value
                    if (value > maxX) maxX = value
                }
            }
        } else {
            const xs = xb * xb - 4 * xa * xc
            if (xs >= 0) {
                const t1 = (-xb + Math.sqrt(xs)) / (2 * xa)
                if (t1 >= 0 && t1 <= 1) {
                    const value = this.pointOnCurve(t1).x
                    if (value < minX) minX = value
                    if (value > maxX) maxX = value
                }
                const t2 = (-xb - Math.sqrt(xs)) / (2 * xa)
                if (t2 >= 0 && t2 <= 1) {
                    const value = this.pointOnCurve(t2).x
                    if (value < minX) minX = value
                    if (value > maxX) maxX = value
                }
            }
        }

        // …and repeat for the y coordinate.
        const ya = -this.anchor0Y + 3 * this.control0Y - 3 * this.control1Y + this.anchor1Y
        const yb = 2 * this.anchor0Y - 4 * this.control0Y + 2 * this.control1Y
        const yc = -this.anchor0Y + this.control0Y

        if (ZERO_ISH(ya)) {
            if (yb !== 0) {
                const t = (2 * yc) / (-2 * yb)
                if (t >= 0 && t <= 1) {
                    const value = this.pointOnCurve(t).y
                    if (value < minY) minY = value
                    if (value > maxY) maxY = value
                }
            }
        } else {
            const ys = yb * yb - 4 * ya * yc
            if (ys >= 0) {
                const t1 = (-yb + Math.sqrt(ys)) / (2 * ya)
                if (t1 >= 0 && t1 <= 1) {
                    const value = this.pointOnCurve(t1).y
                    if (value < minY) minY = value
                    if (value > maxY) maxY = value
                }
                const t2 = (-yb - Math.sqrt(ys)) / (2 * ya)
                if (t2 >= 0 && t2 <= 1) {
                    const value = this.pointOnCurve(t2).y
                    if (value < minY) minY = value
                    if (value > maxY) maxY = value
                }
            }
        }

        bounds[0] = minX
        bounds[1] = minY
        bounds[2] = maxX
        bounds[3] = maxY
    }

    /**
     * Splits this curve in two at parameter `t`, returning the two halves.
     */
    public split(t: number): [Cubic, Cubic] {
        const u = 1 - t
        const onCurve = this.pointOnCurve(t)
        const first = new Cubic(
            new Float64Array([
                this.anchor0X,
                this.anchor0Y,
                this.anchor0X * u + this.control0X * t,
                this.anchor0Y * u + this.control0Y * t,
                this.anchor0X * (u * u) + this.control0X * (2 * u * t) + this.control1X * (t * t),
                this.anchor0Y * (u * u) + this.control0Y * (2 * u * t) + this.control1Y * (t * t),
                onCurve.x,
                onCurve.y,
            ]),
        )
        const second = new Cubic(
            new Float64Array([
                onCurve.x,
                onCurve.y,
                this.control0X * (u * u) + this.control1X * (2 * u * t) + this.anchor1X * (t * t),
                this.control0Y * (u * u) + this.control1Y * (2 * u * t) + this.anchor1Y * (t * t),
                this.control1X * u + this.anchor1X * t,
                this.control1Y * u + this.anchor1Y * t,
                this.anchor1X,
                this.anchor1Y,
            ]),
        )
        return [first, second]
    }

    /** Reverses the control / anchor order of this curve. */
    public reverse(): Cubic {
        return new Cubic(
            new Float64Array([
                this.anchor1X,
                this.anchor1Y,
                this.control1X,
                this.control1Y,
                this.control0X,
                this.control0Y,
                this.anchor0X,
                this.anchor0Y,
            ]),
        )
    }

    /** Transforms all four points with `f`, returning a new cubic. */
    public transformed(f: PointTransformer): Cubic {
        const result = Float64Array.from(this.points)
        for (const i of [0, 2, 4, 6]) {
            const transformed = f(point(result[i], result[i + 1]))
            result[i] = transformed.x
            result[i + 1] = transformed.y
        }
        return new Cubic(result)
    }

    /**
     * Generates a cubic that is a straight line between the given anchors; the
     * control points lie 1/3 and 2/3 along the way.
     */
    public static straightLine(x0: number, y0: number, x1: number, y1: number): Cubic {
        return new Cubic(
            new Float64Array([
                x0,
                y0,
                interpolate(x0, x1, 1 / 3),
                interpolate(y0, y1, 1 / 3),
                interpolate(x0, x1, 2 / 3),
                interpolate(y0, y1, 2 / 3),
                x1,
                y1,
            ]),
        )
    }

    /**
     * Generates a cubic approximating a circular arc between `(x0, y0)` and
     * `(x1, y1)` (the smallest of the two possible arcs; both points should be
     * equidistant from the center).
     */
    public static circularArc(
        centerX: number,
        centerY: number,
        x0: number,
        y0: number,
        x1: number,
        y1: number,
    ): Cubic {
        const p0d = directionVector(x0 - centerX, y0 - centerY)
        const p1d = directionVector(x1 - centerX, y1 - centerY)
        const rotatedP0 = rotate90(p0d)
        const rotatedP1 = rotate90(p1d)
        const isClockwise = dotProduct(rotatedP0, point(x1 - centerX, y1 - centerY)) >= 0
        const cosa = dotProduct(p0d, p1d)
        if (cosa > 0.999) {
            // p0 ~= p1
            return Cubic.straightLine(x0, y0, x1, y1)
        }
        const k =
            distance(x0 - centerX, y0 - centerY) *
            (4 / 3) *
            ((Math.sqrt(2 * (1 - cosa)) - Math.sqrt(1 - cosa * cosa)) / (1 - cosa)) *
            (isClockwise ? 1 : -1)
        return new Cubic(
            new Float64Array([
                x0,
                y0,
                x0 + rotatedP0.x * k,
                y0 + rotatedP0.y * k,
                x1 - rotatedP1.x * k,
                y1 - rotatedP1.y * k,
                x1,
                y1,
            ]),
        )
    }
}

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
 * TypeScript port of `androidx.graphics.shapes.Morph`: matches the cubics of
 * two `RoundedPolygon`s (cutting curves as needed until the two outlines align
 * one-to-one) so the intermediate shape at any progress is a per-curve linear
 * interpolation. Also holds the small SVG serialization helpers used by the
 * loading indicator renderer.
 *
 * @link https://android.googlesource.com/platform/frameworks/support/+/androidx-main/graphics/graphics-shapes/src/main/java/androidx/graphics/shapes/Morph.kt
 */

import { Cubic } from './cubic'
import { featureMapper } from './feature-mapping'
import { LengthMeasurer, MeasuredPolygon, type MeasuredCubic } from './measure'
import { AngleEpsilon, interpolate, point, positiveModulo, type Point } from './point'
import type { RoundedPolygon } from './rounded-polygon'

/**
 * Morphs between two polygons: the start/end curves are pre-matched (cutting
 * curves where the shapes' structures differ), then interpolated towards each
 * other for any progress value.
 */
export class Morph {
    private readonly morphMatch: ReadonlyArray<[Cubic, Cubic]>
    private readonly startCenter: Point
    private readonly endCenter: Point

    public constructor(start: RoundedPolygon, end: RoundedPolygon) {
        this.morphMatch = matchCubics(start, end)
        this.startCenter = cubicsAreaCentroid(start.cubics)
        this.endCenter = cubicsAreaCentroid(end.cubics)
    }

    /** Number of matched curve pairs. */
    public get curveCount(): number {
        return this.morphMatch.length
    }

    /**
     * Interpolated rotational/design center of the morphed shape at
     * `progress`, matching the linear interpolation of {@link asCubics}.
     */
    public centerAt(progress: number): Point {
        return point(
            interpolate(this.startCenter.x, this.endCenter.x, progress),
            interpolate(this.startCenter.y, this.endCenter.y, progress),
        )
    }

    /**
     * The morphed shape at `progress` as a closed list of cubics. `0` yields
     * the start shape, `1` the end shape; values slightly outside `[0, 1]`
     * extrapolate (used for the spring overshoot).
     */
    public asCubics(progress: number): Cubic[] {
        const result: Cubic[] = []
        let firstCubic: Cubic | null = null
        let lastCubic: Cubic | null = null
        for (const [start, end] of this.morphMatch) {
            const points = new Float64Array(8)
            for (let i = 0; i < 8; i++) points[i] = interpolate(start.points[i], end.points[i], progress)
            const cubic = new Cubic(points)
            if (firstCubic === null) firstCubic = cubic
            if (lastCubic !== null) result.push(lastCubic)
            lastCubic = cubic
        }
        if (lastCubic !== null && firstCubic !== null) {
            // Ensure the final anchor matches the first one exactly; slight
            // mismatches introduce visible rendering artifacts.
            result.push(
                new Cubic(
                    new Float64Array([
                        lastCubic.anchor0X,
                        lastCubic.anchor0Y,
                        lastCubic.control0X,
                        lastCubic.control0Y,
                        lastCubic.control1X,
                        lastCubic.control1Y,
                        firstCubic.anchor0X,
                        firstCubic.anchor0Y,
                    ]),
                ),
            )
        }
        return result
    }
}

/**
 * Matches the geometry of two polygons: the curves of both shapes are measured
 * along their outline, a feature mapping decides how the two shapes' corners
 * correspond, the end shape is cut + shifted to align with the start, and then
 * both curve lists are walked in parallel, cutting curves as necessary until
 * everything is consumed. The result is a list of one-to-one curve pairs.
 */
const matchCubics = (p1: RoundedPolygon, p2: RoundedPolygon): Array<[Cubic, Cubic]> => {
    const measuredPolygon1 = MeasuredPolygon.measure(new LengthMeasurer(), p1)
    const measuredPolygon2 = MeasuredPolygon.measure(new LengthMeasurer(), p2)

    // Map the corners of both shapes onto each other; the double mapper then
    // translates any progress in one shape to the corresponding progress in
    // the other (in both directions).
    const doubleMapper = featureMapper(measuredPolygon1.features, measuredPolygon2.features)

    // The cut point on polygon 2 is the mapping of the 0 point on polygon 1:
    // cut and rotate polygon 2 there so both shapes start at aligned points.
    const polygon2CutPoint = doubleMapper.map(0)
    const bs1 = measuredPolygon1
    const bs2 = measuredPolygon2.cutAndShift(polygon2CutPoint)

    const result: Array<[Cubic, Cubic]> = []
    // i1 / i2 are the indices of the current cubic on the start (1) / end (2)
    // shape; b1 / b2 are the current measured cubics.
    let i1 = 0
    let i2 = 0
    let b1: MeasuredCubic | null = bs1.getOrNull(i1++)
    let b2: MeasuredCubic | null = bs2.getOrNull(i2++)
    while (b1 !== null && b2 !== null) {
        // Progresses are viewed from shape 1's perspective; b1a / b2a are the
        // ending progress values of the current cubics in the [0, 1] range.
        const b1a = i1 === bs1.size ? 1 : b1.endOutlineProgress
        const b2a =
            i2 === bs2.size
                ? 1
                : doubleMapper.mapBack(positiveModulo(b2.endOutlineProgress + polygon2CutPoint, 1))
        // The progress at which the first of the two curves ends: when both
        // curves end roughly there, they match without cutting; otherwise the
        // longer curve is cut.
        const minb = Math.min(b1a, b2a)

        let seg1: MeasuredCubic
        let nextB1: MeasuredCubic | null
        if (b1a > minb + AngleEpsilon) {
            const cut = b1.cutAtProgress(minb)
            seg1 = cut[0]
            nextB1 = cut[1]
        } else {
            seg1 = b1
            nextB1 = bs1.getOrNull(i1++)
        }

        let seg2: MeasuredCubic
        let nextB2: MeasuredCubic | null
        if (b2a > minb + AngleEpsilon) {
            const cut = b2.cutAtProgress(positiveModulo(doubleMapper.map(minb) - polygon2CutPoint, 1))
            seg2 = cut[0]
            nextB2 = cut[1]
        } else {
            seg2 = b2
            nextB2 = bs2.getOrNull(i2++)
        }

        result.push([seg1.cubic, seg2.cubic])
        b1 = nextB1
        b2 = nextB2
    }
    if (b1 !== null || b2 !== null) throw new Error("Expected both Polygon's Cubic to be fully matched")
    return result
}

/** Number formatter for SVG path data (5 decimals ≈ sub-micron at component scale). */
const format = (value: number): string => value.toFixed(5)

/** Serializes a closed cubic list into SVG path data (`M` + `C`s + `Z`). */
export const cubicsToPathData = (cubics: readonly Cubic[]): string => {
    if (cubics.length === 0) return ''
    let d = ''
    for (let i = 0; i < cubics.length; i++) {
        const cubic = cubics[i]
        if (i === 0) d += `M${format(cubic.anchor0X)} ${format(cubic.anchor0Y)}`
        d += `C${format(cubic.control0X)} ${format(cubic.control0Y)} ${format(cubic.control1X)} ${format(cubic.control1Y)} ${format(cubic.anchor1X)} ${format(cubic.anchor1Y)}`
    }
    return `${d}Z`
}

/**
 * Center of the control-point (approximate) bounds of a cubic list — the same
 * bounds `Skia`'s `Path.getBounds()` returns, which the reference
 * implementation uses to re-center the morphed path every frame.
 */
export const cubicsBoundsCenter = (cubics: readonly Cubic[]): Point => {
    if (cubics.length === 0) throw new Error('Cannot compute bounds of an empty cubic list')
    let minX = Number.MAX_VALUE
    let minY = Number.MAX_VALUE
    let maxX = -Number.MAX_VALUE
    let maxY = -Number.MAX_VALUE
    for (const cubic of cubics) {
        minX = Math.min(minX, cubic.anchor0X, cubic.control0X, cubic.control1X, cubic.anchor1X)
        minY = Math.min(minY, cubic.anchor0Y, cubic.control0Y, cubic.control1Y, cubic.anchor1Y)
        maxX = Math.max(maxX, cubic.anchor0X, cubic.control0X, cubic.control1X, cubic.anchor1X)
        maxY = Math.max(maxY, cubic.anchor0Y, cubic.control0Y, cubic.control1Y, cubic.anchor1Y)
    }
    return point((minX + maxX) / 2, (minY + maxY) / 2)
}

/**
 * Area centroid of a closed cubic outline (computed via Green's theorem on a
 * subdivided polyline). Unlike the control-point bounding-box center, the
 * area centroid stays invariant under rotation and prevents odd-symmetric
 * shapes (such as Pentagon and Cookie9Sided) from orbiting when spun.
 */
export const cubicsAreaCentroid = (cubics: readonly Cubic[], stepsPerCubic = 8): Point => {
    if (cubics.length === 0) throw new Error('Cannot compute centroid of an empty cubic list')
    let twiceArea = 0
    let cx = 0
    let cy = 0
    for (const cubic of cubics) {
        let prevX = cubic.anchor0X
        let prevY = cubic.anchor0Y
        for (let step = 1; step <= stepsPerCubic; step++) {
            const p = cubic.pointOnCurve(step / stepsPerCubic)
            const cross = prevX * p.y - p.x * prevY
            twiceArea += cross
            cx += (prevX + p.x) * cross
            cy += (prevY + p.y) * cross
            prevX = p.x
            prevY = p.y
        }
    }
    if (Math.abs(twiceArea) < 1e-12) return cubicsBoundsCenter(cubics)
    const factor = 1 / (3 * twiceArea)
    return point(cx * factor, cy * factor)
}

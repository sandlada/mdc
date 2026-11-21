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
 * TypeScript port of `androidx.graphics.shapes.Morph` and `ShapeUtil.kt` path
 * serialization, extended with `toPolygon(progress)` for seamless mid-flight
 * morph interruption.
 *
 * @link https://android.googlesource.com/platform/frameworks/support/+/androidx-main/graphics/graphics-shapes/src/commonMain/kotlin/androidx/graphics/shapes/Morph.kt
 * @link https://android.googlesource.com/platform/frameworks/support/+/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/internal/ShapeUtil.kt
 */

import { Cubic } from './cubic'
import { FeatureCorner, FeatureEdge, type Feature } from './feature'
import { featureMapper } from './feature-mapping'
import { LengthMeasurer, MeasuredPolygon, type MeasuredCubic } from './measure'
import {
    AngleEpsilon,
    RelaxedDistanceEpsilon,
    collinearIsh,
    convex,
    interpolate,
    point,
    positiveModulo,
    rotateDegrees,
    type Point,
} from './point'
import { RoundedPolygon } from './rounded-polygon'

export interface CubicsPathOptions {
    /** Extra clockwise rotation around the shape center, in degrees. */
    readonly rotation?: number
    /**
     * Compose `startAngle` parameter (degrees). When non-zero, rotates the
     * outline so the first cubic anchor starts at `startAngle` around
     * `(rotationPivotX, rotationPivotY)`.
     */
    readonly startAngle?: number
    readonly rotationPivotX?: number
    readonly rotationPivotY?: number
    /** Horizontal scale applied around the container center (or after centering). */
    readonly scaleX?: number
    readonly scaleY?: number
    /** Center X in target coordinate space (used when scaling into a box). */
    readonly centerX?: number
    readonly centerY?: number
    /** Source pivot center X (defaults to shape bounds/area center). */
    readonly sourceCenterX?: number
    readonly sourceCenterY?: number
    /** Repeats the path twice before closing (matches `ShapeUtil.toPath`). */
    readonly repeatPath?: boolean
    /** Closes the SVG path with `Z` (default `true`). */
    readonly closePath?: boolean
    /** Decimal precision for formatted coordinates (default `4`). */
    readonly precision?: number
}

/**
 * Morphs between two `RoundedPolygon`s by matching their corners and cutting
 * cubics until both outlines align one-to-one.
 */
export class Morph {
    private readonly start: RoundedPolygon
    private readonly end: RoundedPolygon
    private readonly morphMatch: ReadonlyArray<[Cubic, Cubic]>
    private readonly startCenter: Point
    private readonly endCenter: Point

    public constructor(start: RoundedPolygon, end: RoundedPolygon) {
        this.start = start
        this.end = end
        this.morphMatch = matchCubics(start, end)
        this.startCenter = cubicsAreaCentroid(start.cubics)
        this.endCenter = cubicsAreaCentroid(end.cubics)
    }

    /** Number of matched curve pairs. */
    public get curveCount(): number {
        return this.morphMatch.length
    }

    /**
     * Calculates the union axis-aligned bounds of `start` and `end`.
     */
    public calculateBounds(bounds: Float64Array = new Float64Array(4), approximate = true): Float64Array {
        if (bounds.length < 4) throw new Error('Required bounds size of 4')
        this.start.calculateBounds(bounds, approximate)
        const minX = bounds[0]
        const minY = bounds[1]
        const maxX = bounds[2]
        const maxY = bounds[3]
        this.end.calculateBounds(bounds, approximate)
        bounds[0] = Math.min(minX, bounds[0])
        bounds[1] = Math.min(minY, bounds[1])
        bounds[2] = Math.max(maxX, bounds[2])
        bounds[3] = Math.max(maxY, bounds[3])
        return bounds
    }

    /**
     * Calculates the union rotation-safe max bounds of `start` and `end`.
     */
    public calculateMaxBounds(bounds: Float64Array = new Float64Array(4)): Float64Array {
        if (bounds.length < 4) throw new Error('Required bounds size of 4')
        this.start.calculateMaxBounds(bounds)
        const minX = bounds[0]
        const minY = bounds[1]
        const maxX = bounds[2]
        const maxY = bounds[3]
        this.end.calculateMaxBounds(bounds)
        bounds[0] = Math.min(minX, bounds[0])
        bounds[1] = Math.min(minY, bounds[1])
        bounds[2] = Math.max(maxX, bounds[2])
        bounds[3] = Math.max(maxY, bounds[3])
        return bounds
    }

    /**
     * Interpolated area centroid at `progress`.
     */
    public centerAt(progress: number): Point {
        return point(
            interpolate(this.startCenter.x, this.endCenter.x, progress),
            interpolate(this.startCenter.y, this.endCenter.y, progress),
        )
    }

    /**
     * Returns the morphed shape at `progress` as a closed list of cubics.
     * Values outside `[0, 1]` extrapolate (for spring overshoot).
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

    /**
     * Captures the exact live intermediate shape at `progress` as a
     * `RoundedPolygon` so an interrupted morph can transition smoothly to a
     * new target without snapping.
     */
    public toPolygon(progress: number): RoundedPolygon {
        if (progress === 0) return this.start
        if (progress === 1) return this.end

        const rawCubics = this.asCubics(progress).filter(cubic => !cubic.zeroLength())
        if (rawCubics.length === 0) {
            return progress < 0.5 ? this.start : this.end
        }

        // Re-snap consecutive anchors after dropping zero-length segments.
        const cubics: Cubic[] = rawCubics.map((cubic, index) => {
            const next = rawCubics[(index + 1) % rawCubics.length]
            if (cubic.anchor1X === next.anchor0X && cubic.anchor1Y === next.anchor0Y) {
                return cubic
            }
            return new Cubic(
                new Float64Array([
                    cubic.anchor0X,
                    cubic.anchor0Y,
                    cubic.control0X,
                    cubic.control0Y,
                    cubic.control1X,
                    cubic.control1Y,
                    next.anchor0X,
                    next.anchor0Y,
                ]),
            )
        })

        const features: Feature[] = []
        for (let i = 0; i < cubics.length; i++) {
            const prev = cubics[(i + cubics.length - 1) % cubics.length]
            const curr = cubics[i]
            const isStraight =
                collinearIsh(
                    curr.anchor0X,
                    curr.anchor0Y,
                    curr.control0X,
                    curr.control0Y,
                    curr.anchor1X,
                    curr.anchor1Y,
                    RelaxedDistanceEpsilon,
                ) &&
                collinearIsh(
                    curr.anchor0X,
                    curr.anchor0Y,
                    curr.control1X,
                    curr.control1Y,
                    curr.anchor1X,
                    curr.anchor1Y,
                    RelaxedDistanceEpsilon,
                )

            if (isStraight) {
                if (
                    !collinearIsh(
                        prev.anchor0X,
                        prev.anchor0Y,
                        curr.anchor0X,
                        curr.anchor0Y,
                        curr.anchor1X,
                        curr.anchor1Y,
                        RelaxedDistanceEpsilon,
                    )
                ) {
                    const isConvex = convex(
                        point(prev.anchor0X, prev.anchor0Y),
                        point(curr.anchor0X, curr.anchor0Y),
                        point(curr.anchor1X, curr.anchor1Y),
                    )
                    features.push(new FeatureCorner([Cubic.empty(curr.anchor0X, curr.anchor0Y)], isConvex))
                }
                features.push(new FeatureEdge([curr]))
            } else {
                const mid = curr.pointOnCurve(0.5)
                const isConvex = convex(point(curr.anchor0X, curr.anchor0Y), mid, point(curr.anchor1X, curr.anchor1Y))
                features.push(new FeatureCorner([curr], isConvex))
            }
        }

        return new RoundedPolygon(features, this.centerAt(progress))
    }
}

const matchCubics = (p1: RoundedPolygon, p2: RoundedPolygon): Array<[Cubic, Cubic]> => {
    const measuredPolygon1 = MeasuredPolygon.measure(new LengthMeasurer(), p1)
    const measuredPolygon2 = MeasuredPolygon.measure(new LengthMeasurer(), p2)
    const doubleMapper = featureMapper(measuredPolygon1.features, measuredPolygon2.features)

    const polygon2CutPoint = doubleMapper.map(0)
    const bs1 = measuredPolygon1
    const bs2 = measuredPolygon2.cutAndShift(polygon2CutPoint)

    const result: Array<[Cubic, Cubic]> = []
    let i1 = 0
    let i2 = 0
    let b1: MeasuredCubic | null = bs1.getOrNull(i1++)
    let b2: MeasuredCubic | null = bs2.getOrNull(i2++)
    while (b1 !== null && b2 !== null) {
        const b1a = i1 === bs1.size ? 1 : b1.endOutlineProgress
        const b2a =
            i2 === bs2.size
                ? 1
                : doubleMapper.mapBack(positiveModulo(b2.endOutlineProgress + polygon2CutPoint, 1))
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

/**
 * Serializes a closed cubic list into SVG path data (`M` + `C`s + `Z`),
 * optionally applying Compose `startAngle`, `rotation`, and target box
 * `scale`/`translate` transforms directly into path coordinates.
 */
export const cubicsToPathData = (cubics: readonly Cubic[], options: CubicsPathOptions = {}): string => {
    if (cubics.length === 0) return ''

    const {
        rotation = 0,
        startAngle = 0,
        rotationPivotX = 0.5,
        rotationPivotY = 0.5,
        scaleX = 1,
        scaleY = 1,
        centerX,
        centerY,
        sourceCenterX,
        sourceCenterY,
        repeatPath = false,
        closePath = true,
        precision = 4,
    } = options

    const format = (value: number): string => value.toFixed(precision)

    let effectiveRotation = rotation
    if (startAngle !== 0) {
        const angleToFirstCubic =
            (Math.atan2(cubics[0].anchor0Y - rotationPivotY, cubics[0].anchor0X - rotationPivotX) * 180) / Math.PI
        effectiveRotation += -angleToFirstCubic + startAngle
    }

    const pivotX = sourceCenterX ?? rotationPivotX
    const pivotY = sourceCenterY ?? rotationPivotY
    const targetCenterX = centerX ?? pivotX * scaleX
    const targetCenterY = centerY ?? pivotY * scaleY
    const pivot = point(pivotX, pivotY)

    const transformPoint = (x: number, y: number): Point => {
        const rotated = effectiveRotation !== 0 ? rotateDegrees(point(x, y), effectiveRotation, pivot) : point(x, y)
        return point(
            (rotated.x - pivotX) * scaleX + targetCenterX,
            (rotated.y - pivotY) * scaleY + targetCenterY,
        )
    }

    let d = ''
    for (let i = 0; i < cubics.length; i++) {
        const cubic = cubics[i]
        if (i === 0) {
            const a0 = transformPoint(cubic.anchor0X, cubic.anchor0Y)
            d += `M${format(a0.x)} ${format(a0.y)}`
        }
        const c0 = transformPoint(cubic.control0X, cubic.control0Y)
        const c1 = transformPoint(cubic.control1X, cubic.control1Y)
        const a1 = transformPoint(cubic.anchor1X, cubic.anchor1Y)
        d += `C${format(c0.x)} ${format(c0.y)} ${format(c1.x)} ${format(c1.y)} ${format(a1.x)} ${format(a1.y)}`
    }

    if (repeatPath) {
        for (let i = 0; i < cubics.length; i++) {
            const cubic = cubics[i]
            if (i === 0) {
                const a0 = transformPoint(cubic.anchor0X, cubic.anchor0Y)
                d += `L${format(a0.x)} ${format(a0.y)}`
            }
            const c0 = transformPoint(cubic.control0X, cubic.control0Y)
            const c1 = transformPoint(cubic.control1X, cubic.control1Y)
            const a1 = transformPoint(cubic.anchor1X, cubic.anchor1Y)
            d += `C${format(c0.x)} ${format(c0.y)} ${format(c1.x)} ${format(c1.y)} ${format(a1.x)} ${format(a1.y)}`
        }
    }

    return closePath ? `${d}Z` : d
}

/**
 * Center of the control-point (approximate) bounds of a cubic list.
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
 * Area centroid of a closed cubic outline via Green's theorem.
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

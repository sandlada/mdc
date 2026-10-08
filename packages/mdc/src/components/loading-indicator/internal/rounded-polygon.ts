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
 * TypeScript port of `androidx.graphics.shapes.RoundedPolygon` (plus the
 * `Shapes.kt` builders needed by the loading indicator): polygonal shapes with
 * optional rounding / smoothing at the vertices, described as a closed list of
 * `Cubic` curves grouped into `Feature`s.
 *
 * @link https://android.googlesource.com/platform/frameworks/support/+/androidx-main/graphics/graphics-shapes/src/main/java/androidx/graphics/shapes/RoundedPolygon.kt
 * @link https://android.googlesource.com/platform/frameworks/support/+/androidx-main/graphics/graphics-shapes/src/main/java/androidx/graphics/shapes/Shapes.kt
 */

import { Cubic, type PointTransformer } from './cubic'
import { Feature, FeatureCorner, FeatureEdge } from './feature'
import {
    DISTANCE_EPSILON,
    addPoints,
    convex,
    directionVector,
    distanceSquared,
    dotProduct,
    interpolatePoints,
    point,
    pointDistance,
    radialToCartesian,
    rotate90,
    scalePoint,
    square,
    subtractPoints,
    type Point,
} from './point'

/**
 * Corner rounding options for a polygon vertex, mirroring `CornerRounding`.
 *
 * `radius` is the radius of the circle forming the rounding; `smoothing`
 * extends the curve from that circular arc toward the edge between vertices
 * (`0` = pure circular arc, `1` = maximally smoothed flanking curves).
 */
export interface RoundedCornerSpec {
    readonly radius: number
    readonly smoothing: number
}

/** Sharp corner (radius 0, no smoothing). */
export const UNROUNDED: RoundedCornerSpec = { radius: 0, smoothing: 0 }

/** Creates a corner rounding spec. */
export const cornerRounding = (radius: number, smoothing = 0): RoundedCornerSpec => ({ radius, smoothing })

/**
 * A polygonal shape with (optional) rounded corners. Holds the feature list
 * and the design center; the flattened cubic outline is derived once.
 */
export class RoundedPolygon {
    /** The features (corners and edges) describing the outline. */
    public readonly features: readonly Feature[]

    /** The flattened closed list of cubics of the outline. */
    public readonly cubics: readonly Cubic[]

    private readonly designCenter: Point

    public constructor(features: readonly Feature[], center: Point) {
        this.features = features
        this.designCenter = center
        this.cubics = flattenCubics(features, center)
    }

    /** X coordinate of this polygon's center. */
    public get centerX(): number {
        return this.designCenter.x
    }

    /** Y coordinate of this polygon's center. */
    public get centerY(): number {
        return this.designCenter.y
    }

    /** The design center of this polygon. */
    public get center(): Point {
        return this.designCenter
    }

    /** Transforms (scales / rotates / translates) this polygon. */
    public transformed(f: PointTransformer): RoundedPolygon {
        return new RoundedPolygon(
            this.features.map(feature => feature.transformed(f)),
            f(this.designCenter),
        )
    }

    /**
     * Returns a new polygon moved and resized so it exactly fits the
     * `(0, 0) → (1, 1)` square, centered when there is extra room in one
     * direction.
     */
    public normalized(): RoundedPolygon {
        const bounds = this.calculateBounds(new Float64Array(4))
        const width = bounds[2] - bounds[0]
        const height = bounds[3] - bounds[1]
        const side = Math.max(width, height)
        const offsetX = (side - width) / 2 - bounds[0]
        const offsetY = (side - height) / 2 - bounds[1]
        return this.transformed(p => point((p.x + offsetX) / side, (p.y + offsetY) / side))
    }

    /**
     * Fills `bounds` with the axis-aligned max bounding box: the square around
     * the center that holds this shape under any rotation (distances are
     * measured from the center to the start and midpoint of every curve).
     */
    public calculateMaxBounds(bounds: Float64Array): Float64Array {
        if (bounds.length < 4) throw new Error('Required bounds size of 4')
        let maxDistSquared = 0
        for (const cubic of this.cubics) {
            const anchorDistance = distanceSquared(
                cubic.anchor0X - this.centerX,
                cubic.anchor0Y - this.centerY,
            )
            const middlePoint = cubic.pointOnCurve(0.5)
            const middleDistance = distanceSquared(
                middlePoint.x - this.centerX,
                middlePoint.y - this.centerY,
            )
            maxDistSquared = Math.max(maxDistSquared, Math.max(anchorDistance, middleDistance))
        }
        const maxDistance = Math.sqrt(maxDistSquared)
        bounds[0] = this.centerX - maxDistance
        bounds[1] = this.centerY - maxDistance
        bounds[2] = this.centerX + maxDistance
        bounds[3] = this.centerY + maxDistance
        return bounds
    }

    /**
     * Fills `bounds` with the axis-aligned bounding box of the outline.
     *
     * @param approximate When set (the default), uses the faster control-point
     * bounds; otherwise computes the true curve extrema.
     */
    public calculateBounds(bounds: Float64Array, approximate = true): Float64Array {
        if (bounds.length < 4) throw new Error('Required bounds size of 4')
        let minX = Number.MAX_VALUE
        let minY = Number.MAX_VALUE
        let maxX = -Number.MAX_VALUE
        let maxY = -Number.MAX_VALUE
        const cubicBounds = new Float64Array(4)
        for (const cubic of this.cubics) {
            cubic.calculateBounds(cubicBounds, approximate)
            minX = Math.min(minX, cubicBounds[0])
            minY = Math.min(minY, cubicBounds[1])
            maxX = Math.max(maxX, cubicBounds[2])
            maxY = Math.max(maxY, cubicBounds[3])
        }
        bounds[0] = minX
        bounds[1] = minY
        bounds[2] = maxX
        bounds[3] = maxY
        return bounds
    }
}

/**
 * Flattens the features into the final closed cubic list (mirrors the
 * `RoundedPolygon.cubics` property of the source, including the first-feature
 * split that keeps the start anchor stable and the zero-length curve
 * filtering).
 */
const flattenCubics = (features: readonly Feature[], center: Point): readonly Cubic[] => {
    const result: Cubic[] = []
    let firstCubic: Cubic | null = null
    let lastCubic: Cubic | null = null
    let firstFeatureSplitStart: Cubic[] | null = null
    let firstFeatureSplitEnd: Cubic[] | null = null
    if (features.length > 0 && features[0].cubics.length === 3) {
        const centerCubic = features[0].cubics[1]
        const [start, end] = centerCubic.split(0.5)
        firstFeatureSplitStart = [features[0].cubics[0], start]
        firstFeatureSplitEnd = [end, features[0].cubics[2]]
    }
    // Iterating one past the features list allows the initial split cubics of
    // the first feature to be re-inserted at the end of the outline.
    for (let i = 0; i <= features.length; i++) {
        let featureCubics: readonly Cubic[]
        if (i === 0 && firstFeatureSplitEnd !== null) {
            featureCubics = firstFeatureSplitEnd
        } else if (i === features.length) {
            if (firstFeatureSplitStart !== null) featureCubics = firstFeatureSplitStart
            else break
        } else {
            featureCubics = features[i].cubics
        }
        for (const cubic of featureCubics) {
            if (!cubic.zeroLength()) {
                if (lastCubic !== null) result.push(lastCubic)
                lastCubic = cubic
                if (firstCubic === null) firstCubic = cubic
            } else if (lastCubic !== null) {
                // Dropping zero-ish curves can leave the previous curve
                // slightly off the latest anchor; snap it, avoiding rendering
                // artifacts.
                const patched = new Cubic(Float64Array.from(lastCubic.points))
                patched.points[6] = cubic.anchor1X
                patched.points[7] = cubic.anchor1Y
                lastCubic = patched
            }
        }
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
    } else {
        // Empty / 0-sized polygon.
        result.push(
            new Cubic(
                new Float64Array([center.x, center.y, center.x, center.y, center.x, center.y, center.x, center.y]),
            ),
        )
    }
    return result
}

/**
 * Builds a `RoundedPolygon` from an ordered list of vertices (pairs of x/y
 * values) and per-vertex or shared rounding parameters.
 *
 * @param perVertexRounding When given, must hold one entry per vertex.
 * @param centerX When `null`, the center is estimated as the average of all
 * vertices (same for `centerY`).
 */
export const roundedPolygonFromVertices = (
    vertices: readonly number[],
    rounding: RoundedCornerSpec = UNROUNDED,
    perVertexRounding: readonly RoundedCornerSpec[] | null = null,
    centerX: number | null = null,
    centerY: number | null = null,
): RoundedPolygon => {
    if (vertices.length < 6) throw new Error('Polygons must have at least 3 vertices')
    if (vertices.length % 2 === 1) throw new Error('The vertices array should have even size')
    if (perVertexRounding !== null && perVertexRounding.length * 2 !== vertices.length) {
        throw new Error(
            'perVertexRounding list should be either null or the same size as the number of vertices (vertices.size / 2)',
        )
    }

    const vertexCount = vertices.length / 2
    const roundedCorners: RoundedCorner[] = []
    for (let i = 0; i < vertexCount; i++) {
        const vertexRounding = perVertexRounding !== null ? perVertexRounding[i] : rounding
        const prevIndex = ((i + vertexCount - 1) % vertexCount) * 2
        const nextIndex = ((i + 1) % vertexCount) * 2
        roundedCorners.push(
            new RoundedCorner(
                point(vertices[prevIndex], vertices[prevIndex + 1]),
                point(vertices[i * 2], vertices[i * 2 + 1]),
                point(vertices[nextIndex], vertices[nextIndex + 1]),
                vertexRounding,
            ),
        )
    }

    // For each side, check whether there is enough room for the cuts the
    // rounding needs; split the available space for rounding first, then
    // smoothing. Each entry is [roundCutRatio, smoothingCutRatio].
    const cutAdjusts: Array<[number, number]> = []
    for (let ix = 0; ix < vertexCount; ix++) {
        const expectedRoundCut =
            roundedCorners[ix].expectedRoundCut + roundedCorners[(ix + 1) % vertexCount].expectedRoundCut
        const expectedCut = roundedCorners[ix].expectedCut + roundedCorners[(ix + 1) % vertexCount].expectedCut
        const vtxX = vertices[ix * 2]
        const vtxY = vertices[ix * 2 + 1]
        const nextVtxX = vertices[((ix + 1) % vertexCount) * 2]
        const nextVtxY = vertices[((ix + 1) % vertexCount) * 2 + 1]
        const sideSize = pointDistance(point(vtxX, vtxY), point(nextVtxX, nextVtxY))
        if (expectedRoundCut > sideSize) {
            cutAdjusts.push([sideSize / expectedRoundCut, 0])
        } else if (expectedCut > sideSize) {
            cutAdjusts.push([1, (sideSize - expectedRoundCut) / (expectedCut - expectedRoundCut)])
        } else {
            cutAdjusts.push([1, 1])
        }
    }

    const cornerCubics: Cubic[][] = []
    for (let i = 0; i < vertexCount; i++) {
        const allowedCuts: number[] = []
        for (let delta = 0; delta <= 1; delta++) {
            // allowedCuts[0] belongs to the side from the previous corner to
            // this one; allowedCuts[1] to the side from this corner onward.
            const [roundCutRatio, cutRatio] = cutAdjusts[(i + vertexCount - 1 + delta) % vertexCount]
            allowedCuts.push(
                roundedCorners[i].expectedRoundCut * roundCutRatio +
                    (roundedCorners[i].expectedCut - roundedCorners[i].expectedRoundCut) * cutRatio,
            )
        }
        cornerCubics.push(roundedCorners[i].getCubics(allowedCuts[0], allowedCuts[1]))
    }

    const features: Feature[] = []
    for (let i = 0; i < vertexCount; i++) {
        const prevVertexIndex = (i + vertexCount - 1) % vertexCount
        const nextVertexIndex = (i + 1) % vertexCount
        const currentVertex = point(vertices[i * 2], vertices[i * 2 + 1])
        const previousVertex = point(vertices[prevVertexIndex * 2], vertices[prevVertexIndex * 2 + 1])
        const nextVertex = point(vertices[nextVertexIndex * 2], vertices[nextVertexIndex * 2 + 1])
        const isConvex = convex(previousVertex, currentVertex, nextVertex)
        features.push(new FeatureCorner(cornerCubics[i], isConvex))
        const cornerEnd = cornerCubics[i][cornerCubics[i].length - 1]
        const nextCornerStart = cornerCubics[(i + 1) % vertexCount][0]
        features.push(
            new FeatureEdge([
                Cubic.straightLine(cornerEnd.anchor1X, cornerEnd.anchor1Y, nextCornerStart.anchor0X, nextCornerStart.anchor0Y),
            ]),
        )
    }

    const estimatedCenter = calculateCenter(vertices)
    const cx = centerX !== null && centerY !== null ? centerX : estimatedCenter[0]
    const cy = centerX !== null && centerY !== null ? centerY : estimatedCenter[1]
    return new RoundedPolygon(features, point(cx, cy))
}

/** Builds a regular polygon with `numVertices` vertices on a circle. */
export const roundedPolygonFromNumVertices = (
    numVertices: number,
    radius: number,
    centerX: number,
    centerY: number,
    rounding: RoundedCornerSpec = UNROUNDED,
): RoundedPolygon => {
    const vertices: number[] = []
    for (let i = 0; i < numVertices; i++) {
        const vertex = addPoints(radialToCartesian(radius, (Math.PI / numVertices) * 2 * i), point(centerX, centerY))
        vertices.push(vertex.x, vertex.y)
    }
    return roundedPolygonFromVertices(vertices, rounding, null, centerX, centerY)
}

/**
 * Builds a circular shape approximating the rounding of the shape around the
 * underlying polygon vertices (mirrors `RoundedPolygon.circle`).
 */
export const circlePolygon = (numVertices = 8, radius = 1, centerX = 0, centerY = 0): RoundedPolygon => {
    if (numVertices < 3) throw new Error('Circle must have at least three vertices')
    // Half of the angle between two adjacent polygon vertices.
    const theta = Math.PI / numVertices
    // Radius of the underlying polygon for the desired circle radius.
    const polygonRadius = radius / Math.cos(theta)
    return roundedPolygonFromNumVertices(numVertices, polygonRadius, centerX, centerY, cornerRounding(radius))
}

/**
 * Builds a star polygon: every other vertex lies on the inner radius (mirrors
 * `RoundedPolygon.star`).
 */
export const starPolygon = (
    numVerticesPerRadius: number,
    radius = 1,
    innerRadius = 0.5,
    rounding: RoundedCornerSpec = UNROUNDED,
    centerX = 0,
    centerY = 0,
): RoundedPolygon => {
    if (radius <= 0 || innerRadius <= 0) throw new Error('Star radii must both be greater than 0')
    if (innerRadius >= radius) throw new Error('innerRadius must be less than radius')
    const vertices: number[] = []
    for (let i = 0; i < numVerticesPerRadius; i++) {
        const outer = radialToCartesian(radius, (Math.PI / numVerticesPerRadius) * 2 * i)
        vertices.push(outer.x + centerX, outer.y + centerY)
        const inner = radialToCartesian(innerRadius, (Math.PI / numVerticesPerRadius) * (2 * i + 1))
        vertices.push(inner.x + centerX, inner.y + centerY)
    }
    return roundedPolygonFromVertices(vertices, rounding, null, centerX, centerY)
}

/** Estimated center of a polygon: the average of all cubic anchor points. */
const calculateCenter = (vertices: readonly number[]): [number, number] => {
    let cumulativeX = 0
    let cumulativeY = 0
    let index = 0
    while (index < vertices.length) {
        cumulativeX += vertices[index++]
        cumulativeY += vertices[index++]
    }
    return [cumulativeX / (vertices.length / 2), cumulativeY / (vertices.length / 2)]
}

/**
 * Holds the per-corner state needed to generate its cubics: first the desired
 * cuts are computed, then the actual allowed cuts arrive (because of space
 * restrictions from the neighbouring corners).
 */
class RoundedCorner {
    public readonly p0: Point
    public readonly p1: Point
    public readonly p2: Point
    public readonly d1: Point
    public readonly d2: Point
    public readonly cornerRadius: number
    public readonly smoothing: number
    public readonly cosAngle: number
    public readonly sinAngle: number
    public readonly expectedRoundCut: number

    private center: Point = point(0, 0)

    public constructor(p0: Point, p1: Point, p2: Point, rounding: RoundedCornerSpec) {
        this.p0 = p0
        this.p1 = p1
        this.p2 = p2
        const v01 = subtractPoints(p0, p1)
        const v21 = subtractPoints(p2, p1)
        const d01 = pointDistance(p0, p1)
        const d21 = pointDistance(p2, p1)
        if (d01 > 0 && d21 > 0) {
            this.d1 = scalePoint(v01, 1 / d01)
            this.d2 = scalePoint(v21, 1 / d21)
            this.cornerRadius = rounding.radius
            this.smoothing = rounding.smoothing
            // Cosine of the angle at p1 is the dot product of the unit
            // vectors toward the neighbouring vertices.
            this.cosAngle = dotProduct(this.d1, this.d2)
            this.sinAngle = Math.sqrt(1 - square(this.cosAngle))
            // How much to cut (measured on a side) to fit the required
            // radius, from tan(A/2) = sinA / (1 + cosA).
            this.expectedRoundCut =
                this.sinAngle > 1e-3 ? (this.cornerRadius * (this.cosAngle + 1)) / this.sinAngle : 0
        } else {
            // One (or both) sides is empty; there is nothing to round.
            this.d1 = point(0, 0)
            this.d2 = point(0, 0)
            this.cornerRadius = 0
            this.smoothing = 0
            this.cosAngle = 0
            this.sinAngle = 0
            this.expectedRoundCut = 0
        }
    }

    /** The cut needed once smoothing is applied (smoothing 1 doubles it). */
    public get expectedCut(): number {
        return (1 + this.smoothing) * this.expectedRoundCut
    }

    /**
     * Returns the cubics (1 or 3, per the rounding smoothness) describing this
     * corner, using the given allowed cuts.
     */
    public getCubics(allowedCut0: number, allowedCut1 = allowedCut0): Cubic[] {
        // The radius is driven by the minimum of both cuts; extra room on one
        // side is used for smoothing.
        const allowedCut = Math.min(allowedCut0, allowedCut1)
        if (
            this.expectedRoundCut < DISTANCE_EPSILON ||
            allowedCut < DISTANCE_EPSILON ||
            this.cornerRadius < DISTANCE_EPSILON
        ) {
            this.center = this.p1
            return [Cubic.straightLine(this.p1.x, this.p1.y, this.p1.x, this.p1.y)]
        }
        // How much of the cut belongs to the rounding itself.
        const actualRoundCut = Math.min(allowedCut, this.expectedRoundCut)
        // Space is used for rounding first; smoothing uses what remains.
        const actualSmoothing0 = this.calculateActualSmoothingValue(allowedCut0)
        const actualSmoothing1 = this.calculateActualSmoothingValue(allowedCut1)
        // Scale the radius when the available cut is smaller than desired.
        const actualRadius = (this.cornerRadius * actualRoundCut) / this.expectedRoundCut
        const centerDistance = Math.sqrt(square(actualRadius) + square(actualRoundCut))
        // Center of the arc used for rounding.
        const midDirection = point((this.d1.x + this.d2.x) / 2, (this.d1.y + this.d2.y) / 2)
        this.center = addPoints(
            this.p1,
            scalePoint(directionVector(midDirection.x, midDirection.y), centerDistance),
        )
        const circleIntersection0 = addPoints(this.p1, scalePoint(this.d1, actualRoundCut))
        const circleIntersection2 = addPoints(this.p1, scalePoint(this.d2, actualRoundCut))
        const flanking0 = this.computeFlankingCurve(
            actualRoundCut,
            actualSmoothing0,
            this.p1,
            this.p0,
            circleIntersection0,
            circleIntersection2,
            this.center,
            actualRadius,
        )
        const flanking2 = this.computeFlankingCurve(
            actualRoundCut,
            actualSmoothing1,
            this.p1,
            this.p2,
            circleIntersection2,
            circleIntersection0,
            this.center,
            actualRadius,
        ).reverse()
        return [
            flanking0,
            Cubic.circularArc(
                this.center.x,
                this.center.y,
                flanking0.anchor1X,
                flanking0.anchor1Y,
                flanking2.anchor0X,
                flanking2.anchor0Y,
            ),
            flanking2,
        ]
    }

    /**
     * If the allowed cut exceeds the expected cut, there is room to apply
     * smoothing; scale it down when only part of that room is available.
     */
    private calculateActualSmoothingValue(allowedCut: number): number {
        if (allowedCut > this.expectedCut) return this.smoothing
        if (allowedCut > this.expectedRoundCut) {
            return (this.smoothing * (allowedCut - this.expectedRoundCut)) / (this.expectedCut - this.expectedRoundCut)
        }
        return 0
    }

    /**
     * Computes the Bézier connecting the (cut) linear side to the (cut)
     * circular segment in a smooth way.
     */
    private computeFlankingCurve(
        actualRoundCut: number,
        actualSmoothing: number,
        corner: Point,
        sideStart: Point,
        circleSegmentIntersection: Point,
        otherCircleSegmentIntersection: Point,
        circleCenter: Point,
        actualRadius: number,
    ): Cubic {
        const sideDirection = directionVector(sideStart.x - corner.x, sideStart.y - corner.y)
        const curveStart = addPoints(corner, scalePoint(sideDirection, actualRoundCut * (1 + actualSmoothing)))
        // Approximate cutting a part of the circle section proportional to
        // `1 - smoothing`: smoothing 0 keeps the full section, smoothing 1
        // takes none of it.
        const p = interpolatePoints(
            circleSegmentIntersection,
            point(
                (circleSegmentIntersection.x + otherCircleSegmentIntersection.x) / 2,
                (circleSegmentIntersection.y + otherCircleSegmentIntersection.y) / 2,
            ),
            actualSmoothing,
        )
        const curveEnd = addPoints(
            circleCenter,
            scalePoint(directionVector(p.x - circleCenter.x, p.y - circleCenter.y), actualRadius),
        )
        // The flanking curve ends on the circle; its second control point is
        // the intersection between the circle tangent there and the side line.
        const circleTangent = rotate90(subtractPoints(curveEnd, circleCenter))
        const anchorEnd =
            this.lineIntersection(sideStart, sideDirection, curveEnd, circleTangent) ?? circleSegmentIntersection
        // 2/3 seems to come from the design tools.
        const anchorStart = scalePoint(addPoints(curveStart, scalePoint(anchorEnd, 2)), 1 / 3)
        return new Cubic(
            new Float64Array([curveStart.x, curveStart.y, anchorStart.x, anchorStart.y, anchorEnd.x, anchorEnd.y, curveEnd.x, curveEnd.y]),
        )
    }

    /**
     * Intersection of the lines `p0 → p0 + d0` and `p1 → p1 + d1`, or `null`
     * when they (nearly) don't intersect.
     */
    private lineIntersection(p0: Point, d0: Point, p1: Point, d1: Point): Point | null {
        const rotatedD1 = rotate90(d1)
        const den = dotProduct(d0, rotatedD1)
        if (Math.abs(den) < DISTANCE_EPSILON) return null
        const num = dotProduct(subtractPoints(p1, p0), rotatedD1)
        // Equivalent to `|den / num| < DistanceEpsilon` without dividing.
        if (Math.abs(den) < DISTANCE_EPSILON * Math.abs(num)) return null
        const k = num / den
        return addPoints(p0, scalePoint(d0, k))
    }
}

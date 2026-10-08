/**
 * @license
 * Copyright 2024 The Android Open Source Project
 * SPDX-License-Identifier: Apache-2.0
 *
 * [Modified By Kai-Orion & Sandlada]
 *
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * TypeScript port of the `MaterialShapes` definitions used by the MD3
 * Expressive loading indicator (SoftBurst, Cookie9Sided, Pentagon, Pill,
 * Sunny, Cookie4Sided, Oval, Circle) plus the shape sequence and scale-factor
 * helpers of `LoadingIndicatorDefaults`.
 *
 * @link https://android.googlesource.com/platform/frameworks/support/+/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/MaterialShapes.kt
 * @link https://android.googlesource.com/platform/frameworks/support/+/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/LoadingIndicator.kt
 */

import { Morph } from './morph'
import { addPoints, point, pointDistance, scalePoint, subtractPoints, type Point } from './point'
import {
    RoundedPolygon,
    UNROUNDED,
    circlePolygon,
    cornerRounding,
    roundedPolygonFromVertices,
    starPolygon,
    type RoundedCornerSpec,
} from './rounded-polygon'

/** Cached roundings, matching the companion object of the source. */
const CORNER_ROUND_15 = cornerRounding(0.15)
const CORNER_ROUND_50 = cornerRounding(0.5)

/** A vertex with its own corner rounding. */
interface ShapePoint {
    readonly o: Point
    readonly r: RoundedCornerSpec
}

/** Degrees → radians (`(d / 360) * 2π`, as in the source). */
const toRadians = (degrees: number): number => (degrees / 360) * 2 * Math.PI

/** Angle of a vector in degrees (`atan2`). */
const angleDegrees = (p: Point): number => (Math.atan2(p.y, p.x) * 180) / Math.PI

/** Rotates a point `angle` degrees (clockwise, y-down) around `center`. */
const rotateDegrees = (p: Point, angle: number, center: Point = point(0, 0)): Point => {
    const radians = toRadians(angle)
    const offset = subtractPoints(p, center)
    return addPoints(
        point(
            offset.x * Math.cos(radians) - offset.y * Math.sin(radians),
            offset.x * Math.sin(radians) + offset.y * Math.cos(radians),
        ),
        center,
    )
}

/**
 * Repeats a set of shape points around the center, either rotating them
 * (`mirroring: false`) or mirroring odd repetitions (`mirroring: true`).
 */
const doRepeat = (shapePoints: readonly ShapePoint[], reps: number, center: Point, mirroring: boolean): ShapePoint[] => {
    if (mirroring) {
        const angles = shapePoints.map(shapePoint => angleDegrees(subtractPoints(shapePoint.o, center)))
        const distances = shapePoints.map(shapePoint => pointDistance(shapePoint.o, center))
        const actualReps = reps * 2
        const sectionAngle = 360 / actualReps
        const result: ShapePoint[] = []
        for (let repetition = 0; repetition < actualReps; repetition++) {
            shapePoints.forEach((_, index) => {
                const i = repetition % 2 === 0 ? index : shapePoints.length - 1 - index
                if (i > 0 || repetition % 2 === 0) {
                    const angle =
                        sectionAngle * repetition +
                        (repetition % 2 === 0 ? angles[i] : sectionAngle - angles[i] + 2 * angles[0])
                    const finalPoint = addPoints(
                        scalePoint(point(Math.cos(toRadians(angle)), Math.sin(toRadians(angle))), distances[i]),
                        center,
                    )
                    result.push({ o: finalPoint, r: shapePoints[i].r })
                }
            })
        }
        return result
    }
    const result: ShapePoint[] = []
    const pointCount = shapePoints.length
    for (let index = 0; index < pointCount * reps; index++) {
        const source = shapePoints[index % pointCount]
        result.push({
            o: rotateDegrees(source.o, (Math.floor(index / pointCount) * 360) / reps, center),
            r: source.r,
        })
    }
    return result
}

/** Builds a polygon from shape points, repeated around `center`. */
const customPolygon = (
    shapePoints: readonly ShapePoint[],
    reps: number,
    center: Point = point(0.5, 0.5),
    mirroring = false,
): RoundedPolygon => {
    const actualPoints = doRepeat(shapePoints, reps, center, mirroring)
    const vertices: number[] = []
    const perVertexRounding: RoundedCornerSpec[] = []
    for (const actualPoint of actualPoints) {
        vertices.push(actualPoint.o.x, actualPoint.o.y)
        perVertexRounding.push(actualPoint.r)
    }
    return roundedPolygonFromVertices(vertices, UNROUNDED, perVertexRounding, center.x, center.y)
}

/** A soft 10-armed burst (the first shape of the indeterminate sequence). */
export const softBurst = (): RoundedPolygon =>
    customPolygon(
        [
            { o: point(0.193, 0.277), r: cornerRounding(0.053) },
            { o: point(0.176, 0.055), r: cornerRounding(0.053) },
        ],
        10,
    )

/** A 9-sided cookie (stars rounded by half the radius), rotated −90°. */
export const cookie9 = (): RoundedPolygon =>
    starPolygon(9, 1, 0.8, CORNER_ROUND_50, 0, 0).transformed(p => rotateDegrees(p, -90))

/** A rounded pentagon. */
export const pentagon = (): RoundedPolygon =>
    customPolygon(
        [
            { o: point(0.5, -0.009), r: cornerRounding(0.172) },
            { o: point(1.03, 0.365), r: cornerRounding(0.164) },
            { o: point(0.828, 0.97), r: cornerRounding(0.169) },
        ],
        1,
        point(0.5, 0.5),
        true,
    )

/** A horizontal pill. */
export const pill = (): RoundedPolygon =>
    customPolygon(
        [
            { o: point(0.961, 0.039), r: cornerRounding(0.426) },
            { o: point(1.001, 0.428), r: UNROUNDED },
            { o: point(1, 0.609), r: cornerRounding(1) },
        ],
        2,
        point(0.5, 0.5),
        true,
    )

/** An 8-armed sunny star. */
export const sunny = (): RoundedPolygon => starPolygon(8, 1, 0.8, CORNER_ROUND_15, 0, 0)

/** A 4-sided cookie. */
export const cookie4 = (): RoundedPolygon =>
    customPolygon(
        [
            { o: point(1.237, 1.236), r: cornerRounding(0.258) },
            { o: point(0.5, 0.918), r: cornerRounding(0.233) },
        ],
        4,
    )

/** An 8-vertex circle squashed to an oval and rotated −45°. */
export const oval = (): RoundedPolygon =>
    circlePolygon(8, 1, 0, 0)
        .transformed(p => point(p.x, p.y * 0.64))
        .transformed(p => rotateDegrees(p, -45))

/** A 10-vertex circle (used by the determinate indicator). */
export const circle = (): RoundedPolygon => circlePolygon(10, 1, 0, 0)

let indeterminatePolygons: readonly RoundedPolygon[] | null = null
let indeterminateMorphs: readonly Morph[] | null = null
let determinatePolygons: readonly RoundedPolygon[] | null = null
let determinateMorphs: readonly Morph[] | null = null

/**
 * The indeterminate shape sequence, each shape normalized into the unit
 * square: SoftBurst → Cookie9Sided → Pentagon → Pill → Sunny → Cookie4Sided →
 * Oval.
 */
export const getIndeterminatePolygons = (): readonly RoundedPolygon[] =>
    (indeterminatePolygons ??= [softBurst(), cookie9(), pentagon(), pill(), sunny(), cookie4(), oval()].map(polygon =>
        polygon.normalized(),
    ))

/**
 * The determinate shape sequence: a circle rotated 18° (half the vertex
 * spacing, for a smoother morph to the burst) into the SoftBurst.
 */
export const getDeterminatePolygons = (): readonly RoundedPolygon[] =>
    (determinatePolygons ??= [circle().normalized().transformed(p => rotateDegrees(p, 360 / 20)), softBurst().normalized()])

/**
 * Builds the morph sequence for a polygon list (a circular sequence adds the
 * final shape → first shape morph). Polygons are normalized inside the morph,
 * as in the source.
 */
const buildMorphs = (polygons: readonly RoundedPolygon[], circularSequence: boolean): readonly Morph[] => {
    const morphs: Morph[] = []
    for (let i = 0; i < polygons.length; i++) {
        if (i + 1 < polygons.length) {
            morphs.push(new Morph(polygons[i].normalized(), polygons[i + 1].normalized()))
        } else if (circularSequence) {
            morphs.push(new Morph(polygons[i].normalized(), polygons[0].normalized()))
        }
    }
    return morphs
}

/** The seven indeterminate morphs (including Oval → SoftBurst). */
export const getIndeterminateMorphs = (): readonly Morph[] =>
    (indeterminateMorphs ??= buildMorphs(getIndeterminatePolygons(), true))

/** The single determinate morph (Circle → SoftBurst). */
export const getDeterminateMorphs = (): readonly Morph[] =>
    (determinateMorphs ??= buildMorphs(getDeterminatePolygons(), false))

/**
 * Computes a uniform scale factor for a polygon sequence: the smallest ratio
 * of a shape's bounds to its rotation-safe max bounds (using the wider axis of
 * each, which handles e.g. the pill shape), so the shape is never clipped at
 * any rotation. Kept as the reference helper of `LoadingIndicatorDefaults`;
 * the indicator itself draws the shapes at the video-calibrated uniform
 * `SHAPE_DRAW_SCALE`.
 */
export const calculateScaleFactor = (polygons: readonly RoundedPolygon[]): number => {
    let scaleFactor = 1
    const bounds = new Float64Array(4)
    const maxBounds = new Float64Array(4)
    for (const polygon of polygons) {
        polygon.calculateBounds(bounds)
        polygon.calculateMaxBounds(maxBounds)
        const scaleX = (bounds[2] - bounds[0]) / (maxBounds[2] - maxBounds[0])
        const scaleY = (bounds[3] - bounds[1]) / (maxBounds[3] - maxBounds[1])
        scaleFactor = Math.min(scaleFactor, Math.max(scaleX, scaleY))
    }
    return scaleFactor
}

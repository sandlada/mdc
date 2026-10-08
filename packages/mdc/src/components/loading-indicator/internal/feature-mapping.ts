/**
 * @license
 * Copyright 2023 The Android Open Source Project
 * SPDX-License-Identifier: Apache-2.0
 *
 * [Modified By Kai-Orion & Sandlada]
 *
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * TypeScript port of `androidx.graphics.shapes.FeatureMapping` +
 * `FloatMapping`: maps the features (rounded corners) of two shapes onto each
 * other, producing a progress-to-progress `DoubleMapper` that the Morph uses
 * to align the two outlines.
 *
 * @link https://android.googlesource.com/platform/frameworks/support/+/androidx-main/graphics/graphics-shapes/src/main/java/androidx/graphics/shapes/FeatureMapping.kt
 * @link https://android.googlesource.com/platform/frameworks/support/+/androidx-main/graphics/graphics-shapes/src/main/java/androidx/graphics/shapes/FloatMapping.kt
 */

import { FeatureCorner, type Feature } from './feature'
import { DISTANCE_EPSILON, point, pointDistanceSquared, positiveModulo, progressDistance, progressInRange, type Point } from './point'
import type { ProgressableFeature } from './measure'

/** A mapping from a feature in one shape to a feature in the other. */
interface DistanceVertex {
    readonly distance: number
    readonly f1: ProgressableFeature
    readonly f2: ProgressableFeature
}

/** Identity mapping used when there is nothing to map. */
const IDENTITY_MAPPING: ReadonlyArray<[number, number]> = [
    [0, 0],
    [0.5, 0.5],
]

/**
 * Maps from one set of progress values to another along a piecewise-linear
 * wrapping mapping.
 */
export const linearMap = (xValues: readonly number[], yValues: readonly number[], x: number): number => {
    if (!(x >= 0 && x <= 1)) throw new Error(`Invalid progress: ${x}`)
    const segmentStartIndex = xValues.findIndex((value, index) =>
        progressInRange(x, value, xValues[(index + 1) % xValues.length]),
    )
    const segmentEndIndex = (segmentStartIndex + 1) % xValues.length
    const segmentSizeX = positiveModulo(xValues[segmentEndIndex] - xValues[segmentStartIndex], 1)
    const segmentSizeY = positiveModulo(yValues[segmentEndIndex] - yValues[segmentStartIndex], 1)
    const positionInSegment = segmentSizeX < 0.001 ? 0.5 : positiveModulo(x - xValues[segmentStartIndex], 1) / segmentSizeX
    return positiveModulo(yValues[segmentStartIndex] + segmentSizeY * positionInSegment, 1)
}

/**
 * Maps values in a `[0, 1)` source space to values in a `[0, 1)` target space
 * (and back), given a finite list of representative mappings that is extended
 * to the whole interval by linear interpolation with wrapping.
 */
export class DoubleMapper {
    private readonly sourceValues: number[]
    private readonly targetValues: number[]

    public constructor(mappings: ReadonlyArray<[number, number]>) {
        this.sourceValues = mappings.map(mapping => mapping[0])
        this.targetValues = mappings.map(mapping => mapping[1])
        // Both value sets must be monotonically increasing, except for at most
        // one wrap-around.
        validateProgress(this.sourceValues)
        validateProgress(this.targetValues)
    }

    /** Maps `x` from the source space to the target space. */
    public map(x: number): number {
        return linearMap(this.sourceValues, this.targetValues, x)
    }

    /** Maps `x` from the target space back to the source space. */
    public mapBack(x: number): number {
        return linearMap(this.targetValues, this.sourceValues, x)
    }
}

/**
 * Verifies that a list of progress values is in `[0, 1)` and monotonically
 * increasing apart from at most one wrap-around (including the last-to-first
 * pair).
 */
export const validateProgress = (progressValues: readonly number[]): void => {
    let previous = progressValues[progressValues.length - 1]
    let wraps = 0
    for (const current of progressValues) {
        if (!(current >= 0 && current < 1)) {
            throw new Error(`FloatMapping - Progress outside of range: ${progressValues.join()}`)
        }
        if (!(progressDistance(current, previous) > DISTANCE_EPSILON)) {
            throw new Error(`FloatMapping - Progress repeats a value: ${progressValues.join()}`)
        }
        if (current < previous) {
            wraps++
            if (wraps > 1) {
                throw new Error(`FloatMapping - Progress wraps more than once: ${progressValues.join()}`)
            }
        }
        previous = current
    }
}

/**
 * Creates the mapping between the features of two shapes: the list of
 * `[progress1, progress2]` pairs is sorted by the first element, and the
 * mapping walks both shapes in the same order.
 */
export const featureMapper = (
    features1: readonly ProgressableFeature[],
    features2: readonly ProgressableFeature[],
): DoubleMapper => {
    // Only corners are used for this mapping.
    const filteredFeatures1 = features1.filter(feature => feature.feature instanceof FeatureCorner)
    const filteredFeatures2 = features2.filter(feature => feature.feature instanceof FeatureCorner)
    const featureProgressMapping = doMapping(filteredFeatures1, filteredFeatures2)
    return new DoubleMapper(featureProgressMapping)
}

/**
 * Maps the features of two shapes: computes the distance of all feature pairs,
 * sorts ascending, then greedily adds mappings from smallest to largest while
 * ensuring no feature is used twice and no crossing is introduced.
 */
export const doMapping = (
    features1: readonly ProgressableFeature[],
    features2: readonly ProgressableFeature[],
): ReadonlyArray<[number, number]> => {
    const distanceVertexList: DistanceVertex[] = []
    for (const f1 of features1) {
        for (const f2 of features2) {
            const d = featureDistSquared(f1.feature, f2.feature)
            if (d !== Number.MAX_VALUE) distanceVertexList.push({ distance: d, f1, f2 })
        }
    }
    distanceVertexList.sort((a, b) => a.distance - b.distance)

    // Special cases.
    if (distanceVertexList.length === 0) return IDENTITY_MAPPING
    if (distanceVertexList.length === 1) {
        const { f1, f2 } = distanceVertexList[0]
        return [
            [f1.progress, f2.progress],
            [(f1.progress + 0.5) % 1, (f2.progress + 0.5) % 1],
        ]
    }

    const helper = new MappingHelper()
    for (const distanceVertex of distanceVertexList) helper.addMapping(distanceVertex.f1, distanceVertex.f2)
    return helper.mapping
}

/**
 * Binary search over the first elements of a sorted mapping list: returns the
 * element index when found, otherwise `-(insertionPoint) - 1`.
 */
const binarySearchByFirst = (mapping: ReadonlyArray<[number, number]>, value: number): number => {
    let low = 0
    let high = mapping.length - 1
    while (low <= high) {
        const mid = (low + high) >> 1
        const comparison = mapping[mid][0] - value
        if (comparison < 0) low = mid + 1
        else if (comparison > 0) high = mid - 1
        else return mid
    }
    return -(low + 1)
}

/** Incrementally builds a sorted, non-crossing feature mapping. */
class MappingHelper {
    /** The mappings from the start shape's progress to the end shape's. */
    public readonly mapping: Array<[number, number]> = []

    private readonly usedF1 = new Set<ProgressableFeature>()
    private readonly usedF2 = new Set<ProgressableFeature>()

    public addMapping(f1: ProgressableFeature, f2: ProgressableFeature): void {
        // No feature may be mapped twice.
        if (this.usedF1.has(f1) || this.usedF2.has(f2)) return

        // The mapping stays sorted; find where this new entry belongs.
        const index = binarySearchByFirst(this.mapping, f1.progress)
        if (index >= 0) throw new Error("There can't be two features with the same progress")
        const insertionIndex = -index - 1
        const n = this.mapping.length

        if (n >= 1) {
            const [before1, before2] = this.mapping[(insertionIndex + n - 1) % n]
            const [after1, after2] = this.mapping[insertionIndex % n]

            // Features that are too close together make the DoubleMapper
            // unstable.
            if (
                progressDistance(f1.progress, before1) < DISTANCE_EPSILON ||
                progressDistance(f1.progress, after1) < DISTANCE_EPSILON ||
                progressDistance(f2.progress, before2) < DISTANCE_EPSILON ||
                progressDistance(f2.progress, after2) < DISTANCE_EPSILON
            ) {
                return
            }

            // With two or more entries, ensure no extra crossing is added.
            if (n > 1 && !progressInRange(f2.progress, before2, after2)) return
        }

        this.mapping.splice(insertionIndex, 0, [f1.progress, f2.progress])
        this.usedF1.add(f1)
        this.usedF2.add(f2)
    }
}

/**
 * Distance between two features of two different shapes, used to decide how
 * features map. Corners of opposite concavity never map (infinite distance).
 */
export const featureDistSquared = (f1: Feature, f2: Feature): number => {
    if (f1 instanceof FeatureCorner && f2 instanceof FeatureCorner && f1.convex !== f2.convex) {
        return Number.MAX_VALUE
    }
    return pointDistanceSquared(featureRepresentativePoint(f1), featureRepresentativePoint(f2))
}

/** The point representing a feature: midway between its end anchors. */
export const featureRepresentativePoint = (feature: Feature): Point => {
    const first = feature.cubics[0]
    const last = feature.cubics[feature.cubics.length - 1]
    return point((first.anchor0X + last.anchor1X) / 2, (first.anchor0Y + last.anchor1Y) / 2)
}

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
 * TypeScript port of `androidx.graphics.shapes.PolygonMeasure`: measures cubics
 * along the outline (approximated by arc length) and can cut + shift a polygon
 * so a given outline progress becomes the new start.
 *
 * @link https://android.googlesource.com/platform/frameworks/support/+/androidx-main/graphics/graphics-shapes/src/main/java/androidx/graphics/shapes/PolygonMeasure.kt
 */

import type { Cubic } from './cubic'
import { FeatureCorner, type Feature } from './feature'
import { DISTANCE_EPSILON, point, pointDistance, positiveModulo } from './point'
import type { RoundedPolygon } from './rounded-polygon'

/** A feature together with the outline progress at which it sits. */
export interface ProgressableFeature {
    readonly progress: number
    readonly feature: Feature
}

/**
 * Measures a cubic: produces a size for it (arc length, angle, …) and finds
 * the parameter `t` at which a given measure is reached.
 */
export interface Measurer {
    /** Size of the given cubic according to this measurer (must be >= 0). */
    measureCubic(cubic: Cubic): number
    /** Parameter `t` of the cubic at which `measure` of it is reached. */
    findCubicCutPoint(cubic: Cubic, measure: number): number
}

/**
 * Approximates the arc length of cubics by splitting the arc into segments.
 * With three segments the accuracy is at least 98.5% on a circular arc (the
 * worst case for the standard shapes).
 */
export class LengthMeasurer implements Measurer {
    private static readonly SEGMENTS = 3

    public measureCubic(cubic: Cubic): number {
        return this.closestProgressTo(cubic, Number.POSITIVE_INFINITY)[1]
    }

    public findCubicCutPoint(cubic: Cubic, measure: number): number {
        return this.closestProgressTo(cubic, measure)[0]
    }

    private closestProgressTo(cubic: Cubic, threshold: number): [number, number] {
        let total = 0
        let remainder = threshold
        let previous = point(cubic.anchor0X, cubic.anchor0Y)
        for (let i = 1; i <= LengthMeasurer.SEGMENTS; i++) {
            const progress = i / LengthMeasurer.SEGMENTS
            const current = cubic.pointOnCurve(progress)
            const segment = pointDistance(current, previous)
            if (segment >= remainder) {
                return [progress - (1 - remainder / segment) / LengthMeasurer.SEGMENTS, threshold]
            }
            remainder -= segment
            total += segment
            previous = current
        }
        return [1, total]
    }
}

/**
 * A cubic annotated with its outline progress range and measured size.
 * Outline progress is a value in `[0, 1)` giving the distance traveled along
 * the overall outline path.
 */
export class MeasuredCubic {
    /** The raw cubic. */
    public readonly cubic: Cubic

    /** Measured size of the cubic (per the measurer that created it). */
    public readonly measuredSize: number

    /** Outline progress at the start of this cubic. */
    public startOutlineProgress: number

    /** Outline progress at the end of this cubic. */
    public endOutlineProgress: number

    private readonly measurer: Measurer

    public constructor(cubic: Cubic, startOutlineProgress: number, endOutlineProgress: number, measurer: Measurer) {
        if (endOutlineProgress < startOutlineProgress) {
            throw new Error('endOutlineProgress is expected to be equal or greater than startOutlineProgress')
        }
        this.cubic = cubic
        this.startOutlineProgress = startOutlineProgress
        this.endOutlineProgress = endOutlineProgress
        this.measurer = measurer
        this.measuredSize = measurer.measureCubic(cubic)
    }

    /** Adjusts the progress range of this cubic (used to pin the last one at 1). */
    public updateProgressRange(startOutlineProgress = this.startOutlineProgress, endOutlineProgress = this.endOutlineProgress): void {
        if (endOutlineProgress < startOutlineProgress) {
            throw new Error('endOutlineProgress is expected to be equal or greater than startOutlineProgress')
        }
        this.startOutlineProgress = startOutlineProgress
        this.endOutlineProgress = endOutlineProgress
    }

    /** Cuts this measured cubic in two at the given outline progress. */
    public cutAtProgress(cutOutlineProgress: number): [MeasuredCubic, MeasuredCubic] {
        // Floating point errors upstream can push the cut slightly outside the
        // range, so it is bounded here.
        const boundedCut = Math.min(this.endOutlineProgress, Math.max(this.startOutlineProgress, cutOutlineProgress))
        const outlineProgressSize = this.endOutlineProgress - this.startOutlineProgress
        const progressFromStart = boundedCut - this.startOutlineProgress
        const relativeProgress = progressFromStart / outlineProgressSize
        const t = this.measurer.findCubicCutPoint(this.cubic, relativeProgress * this.measuredSize)
        if (!(t >= 0 && t <= 1)) throw new Error('Cubic cut point is expected to be between 0 and 1')
        const [first, second] = this.cubic.split(t)
        return [
            new MeasuredCubic(first, this.startOutlineProgress, boundedCut, this.measurer),
            new MeasuredCubic(second, boundedCut, this.endOutlineProgress, this.measurer),
        ]
    }
}

/**
 * A polygon whose cubics are annotated with their measured size and outline
 * progress, with the feature representatives kept alongside.
 */
export class MeasuredPolygon {
    /** The features with their outline progress. */
    public readonly features: readonly ProgressableFeature[]

    private readonly measurer: Measurer
    private readonly measuredCubics: readonly MeasuredCubic[]

    private constructor(
        measurer: Measurer,
        features: readonly ProgressableFeature[],
        cubics: readonly Cubic[],
        outlineProgress: readonly number[],
    ) {
        if (outlineProgress.length !== cubics.length + 1) {
            throw new Error('Outline progress size is expected to be the cubics size + 1')
        }
        if (outlineProgress[0] !== 0) throw new Error('First outline progress value is expected to be zero')
        if (outlineProgress[outlineProgress.length - 1] !== 1) {
            throw new Error('Last outline progress value is expected to be one')
        }
        this.measurer = measurer
        this.features = features
        const measuredCubics: MeasuredCubic[] = []
        let startOutlineProgress = 0
        for (let index = 0; index < cubics.length; index++) {
            // Filter out "empty" cubics.
            if (outlineProgress[index + 1] - outlineProgress[index] > DISTANCE_EPSILON) {
                measuredCubics.push(new MeasuredCubic(cubics[index], startOutlineProgress, outlineProgress[index + 1], measurer))
                // The next measured cubic starts exactly where this one ends.
                startOutlineProgress = outlineProgress[index + 1]
            }
        }
        // Empty cubics may have been removed at the end; pin the last
        // measured range's end to exactly 1 (its start is kept).
        const lastMeasured = measuredCubics[measuredCubics.length - 1]
        lastMeasured.updateProgressRange(lastMeasured.startOutlineProgress, 1)
        this.measuredCubics = measuredCubics
    }

    /** Number of measured cubics. */
    public get size(): number {
        return this.measuredCubics.length
    }

    /** The measured cubic at `index`. */
    public get(index: number): MeasuredCubic {
        return this.measuredCubics[index]
    }

    /** The measured cubic at `index`, or `null` when out of range. */
    public getOrNull(index: number): MeasuredCubic | null {
        return index >= 0 && index < this.measuredCubics.length ? this.measuredCubics[index] : null
    }

    /**
     * Cuts and rotates this polygon so it starts at `cuttingPoint`. The cubic
     * crossing that progress is split; the two halves wrap around so the new
     * list starts at the cut. Outline progress values are shifted so the new
     * list starts at 0.
     */
    public cutAndShift(cuttingPoint: number): MeasuredPolygon {
        if (!(cuttingPoint >= 0 && cuttingPoint <= 1)) {
            throw new Error('Cutting point is expected to be between 0 and 1')
        }
        if (cuttingPoint < DISTANCE_EPSILON) return this

        const targetIndex = this.measuredCubics.findIndex(
            measured => cuttingPoint >= measured.startOutlineProgress && cuttingPoint <= measured.endOutlineProgress,
        )
        const target = this.measuredCubics[targetIndex]
        const [beforeCut, afterCut] = target.cutAtProgress(cuttingPoint)

        // New cubic order: [after the cut, …every cubic after target…, …every
        // cubic before target…, before the cut].
        const retCubics: Cubic[] = [afterCut.cubic]
        for (let i = 1; i < this.measuredCubics.length; i++) {
            retCubics.push(this.measuredCubics[(i + targetIndex) % this.measuredCubics.length].cubic)
        }
        retCubics.push(beforeCut.cubic)

        const retOutlineProgress: number[] = []
        for (let index = 0; index < this.measuredCubics.length + 2; index++) {
            if (index === 0) {
                retOutlineProgress.push(0)
            } else if (index === this.measuredCubics.length + 1) {
                retOutlineProgress.push(1)
            } else {
                const cubicIndex = (targetIndex + index - 1) % this.measuredCubics.length
                retOutlineProgress.push(positiveModulo(this.measuredCubics[cubicIndex].endOutlineProgress - cuttingPoint, 1))
            }
        }

        const shiftedFeatures = this.features.map(feature => ({
            progress: positiveModulo(feature.progress - cuttingPoint, 1),
            feature: feature.feature,
        }))

        return new MeasuredPolygon(this.measurer, shiftedFeatures, retCubics, retOutlineProgress)
    }

    /**
     * Measures a polygon: flattens its features into a cubic list while
     * remembering the representative (middle) cubic of every corner, then
     * computes the outline progress of each cubic.
     */
    public static measure(measurer: Measurer, polygon: RoundedPolygon): MeasuredPolygon {
        const cubics: Cubic[] = []
        const featureToCubic: Array<{ feature: Feature; index: number }> = []
        for (const feature of polygon.features) {
            for (let cubicIndex = 0; cubicIndex < feature.cubics.length; cubicIndex++) {
                if (feature instanceof FeatureCorner && cubicIndex === Math.floor(feature.cubics.length / 2)) {
                    featureToCubic.push({ feature, index: cubics.length })
                }
                cubics.push(feature.cubics[cubicIndex])
            }
        }

        const measures: number[] = [0]
        let totalMeasure = 0
        for (const cubic of cubics) {
            const measured = measurer.measureCubic(cubic)
            if (!(measured >= 0)) throw new Error('Measured cubic is expected to be greater or equal to zero')
            totalMeasure += measured
            measures.push(totalMeasure)
        }

        const outlineProgress = measures.map(measure => measure / totalMeasure)

        const features = featureToCubic.map(({ feature, index }) => ({
            progress: positiveModulo((outlineProgress[index] + outlineProgress[index + 1]) / 2, 1),
            feature,
        }))

        return new MeasuredPolygon(measurer, features, cubics, outlineProgress)
    }
}

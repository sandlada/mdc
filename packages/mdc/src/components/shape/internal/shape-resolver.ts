/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { MaterialShape, ParametricShape, type ShapeKind } from '../shape.interface'
import { AllMaterialShapeNames, getMaterialShapePolygon } from './material-shapes'
import {
    RoundedPolygon,
    cornerRounding,
    pillStarPolygon,
    rectanglePolygon,
    roundedPolygonFromNumVertices,
    roundedPolygonFromVertices,
    starPolygon,
} from './rounded-polygon'

export interface ShapeResolutionParams {
    readonly shape: ShapeKind
    readonly polygon: RoundedPolygon | null
    readonly vertices: readonly number[] | null
    readonly sides: number
    readonly innerRadius: number
    readonly cornerRadius: number
    readonly innerCornerRadius: number | null
    readonly smoothing: number
    readonly aspectRatio: number
    readonly vertexSpacing: number
}

const MaterialShapeSet = new Set<string>(AllMaterialShapeNames)
const PolygonIdMap = new WeakMap<RoundedPolygon, number>()
let NextPolygonId = 1

const getPolygonId = (polygon: RoundedPolygon): number => {
    let id = PolygonIdMap.get(polygon)
    if (id === undefined) {
        id = NextPolygonId++
        PolygonIdMap.set(polygon, id)
    }
    return id
}

const clampPositive = (value: number, min: number, fallback: number): number =>
    Number.isFinite(value) && value >= min ? value : fallback

const clampUnitRange = (value: number, fallback: number): number =>
    Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback

const clampInnerRadius = (value: number): number => {
    if (!Number.isFinite(value)) return 0.5
    return Math.min(0.99, Math.max(0.01, value))
}

/**
 * Computes a deterministic cache key for the resolved shape target.
 */
export const computeShapeTargetKey = (
    activeShape: ShapeKind,
    params: Omit<ShapeResolutionParams, 'shape'>,
): string => {
    if (params.polygon !== null) {
        return `polygon-instance:${getPolygonId(params.polygon)}`
    }
    if (params.vertices !== null && params.vertices.length >= 6) {
        return `vertices:${params.vertices.join(',')}:${params.cornerRadius}:${params.smoothing}`
    }
    if (
        activeShape === ParametricShape.Polygon ||
        activeShape === ParametricShape.Star ||
        activeShape === ParametricShape.Rectangle ||
        activeShape === ParametricShape.PillStar
    ) {
        return (
            `parametric:${activeShape}:${params.sides}:${params.innerRadius}:` +
            `${params.cornerRadius}:${params.innerCornerRadius ?? 'null'}:` +
            `${params.smoothing}:${params.aspectRatio}:${params.vertexSpacing}`
        )
    }
    return `material:${activeShape}`
}

/**
 * Resolves a named `ShapeKind` (MaterialShape or ParametricShape) or custom
 * `RoundedPolygon`/`vertices` into a normalized `[0, 1]^2` `RoundedPolygon`.
 */
export const resolveShapePolygon = (params: ShapeResolutionParams): RoundedPolygon => {
    if (params.polygon !== null) {
        return params.polygon.normalized()
    }

    const rounding = cornerRounding(
        clampPositive(params.cornerRadius, 0, 0),
        clampUnitRange(params.smoothing, 0),
    )

    if (params.vertices !== null) {
        if (params.vertices.length < 6 || params.vertices.length % 2 !== 0) {
            throw new Error('Custom vertices must contain an even number of at least 6 numbers.')
        }
        return roundedPolygonFromVertices(params.vertices, rounding).normalized()
    }

    if (MaterialShapeSet.has(params.shape)) {
        return getMaterialShapePolygon(params.shape as MaterialShape)
    }

    const sides = Math.max(2, Math.round(clampPositive(params.sides, 2, 5)))
    const innerRadius = clampInnerRadius(params.innerRadius)
    const innerRounding =
        params.innerCornerRadius !== null
            ? cornerRounding(
                  clampPositive(params.innerCornerRadius, 0, 0),
                  clampUnitRange(params.smoothing, 0),
              )
            : null
    const aspectRatio = clampPositive(params.aspectRatio, 0.05, 1)
    const vertexSpacing = clampUnitRange(params.vertexSpacing, 0.5)

    switch (params.shape) {
        case ParametricShape.Polygon:
            return roundedPolygonFromNumVertices(Math.max(3, sides), 1, 0, 0, rounding).normalized()
        case ParametricShape.Star:
            return starPolygon(sides, 1, innerRadius, rounding, innerRounding).normalized()
        case ParametricShape.Rectangle:
            return rectanglePolygon(aspectRatio, 1, rounding).normalized()
        case ParametricShape.PillStar:
            return pillStarPolygon(
                aspectRatio,
                1,
                sides,
                innerRadius,
                rounding,
                innerRounding,
                null,
                vertexSpacing,
            ).normalized()
        default:
            throw new Error(`Unknown shape kind: "${String(params.shape)}"`)
    }
}

/**
 * Parses a comma- or whitespace-separated sequence string into `ShapeKind[]`.
 */
export const parseShapeSequence = (sequence: string): ShapeKind[] =>
    sequence
        .split(/[\s,]+/)
        .map(token => token.trim())
        .filter((token): token is ShapeKind => token.length > 0)

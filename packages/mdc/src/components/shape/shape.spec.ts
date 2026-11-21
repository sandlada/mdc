/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import {
    AllMaterialShapeNames,
    MaterialShapes,
    Morph,
    MotionScheme,
    RoundedPolygon,
    ShapeDefinition,
    circlePolygon,
    cornerRounding,
    cubicsToPathData,
    estimateAnimationDurationMillis,
    getMaterialShapePolygon,
    pillPolygon,
    pillStarPolygon,
    rectanglePolygon,
    resolveMotionSpring,
    roundedPolygonFromNumVertices,
    roundedPolygonFromVertices,
    springMotionAt,
    starPolygon,
} from './index'
import { resolveShapePolygon } from './internal/shape-resolver'

const assertClosedAndNormalized = (polygon: RoundedPolygon): void => {
    const bounds = polygon.calculateBounds(new Float64Array(4))
    const width = bounds[2] - bounds[0]
    const height = bounds[3] - bounds[1]
    expect(Math.max(width, height)).toBeCloseTo(1, 4)
    expect((bounds[0] + bounds[2]) / 2).toBeCloseTo(0.5, 4)
    expect((bounds[1] + bounds[3]) / 2).toBeCloseTo(0.5, 4)

    const cubics = polygon.cubics
    expect(cubics.length).toBeGreaterThan(0)
    for (let i = 1; i < cubics.length; i++) {
        expect(cubics[i].anchor0X).toBeCloseTo(cubics[i - 1].anchor1X, 4)
        expect(cubics[i].anchor0Y).toBeCloseTo(cubics[i - 1].anchor1Y, 4)
    }
    const last = cubics[cubics.length - 1]
    expect(last.anchor1X).toBeCloseTo(cubics[0].anchor0X, 4)
    expect(last.anchor1Y).toBeCloseTo(cubics[0].anchor0Y, 4)
}

describe('MaterialShapes (all 35 Jetpack Compose shapes)', () => {
    it('defines all 35 MaterialShapes and normalizes each into [0, 1]^2', () => {
        expect(AllMaterialShapeNames).toHaveLength(35)
        for (const name of AllMaterialShapeNames) {
            const polygon = getMaterialShapePolygon(name)
            assertClosedAndNormalized(polygon)
            const path = cubicsToPathData(polygon.cubics)
            expect(path.startsWith('M')).toBe(true)
            expect(path.endsWith('Z')).toBe(true)
        }
    })

    it('exposes cached getters on MaterialShapes matching named lookup', () => {
        expect(MaterialShapes.Circle).toBe(getMaterialShapePolygon('circle'))
        expect(MaterialShapes.Heart).toBe(getMaterialShapePolygon('heart'))
        expect(MaterialShapes.PuffyDiamond).toBe(getMaterialShapePolygon('puffy-diamond'))
        expect(MaterialShapes.Cookie12Sided).toBe(getMaterialShapePolygon('cookie-12-sided'))
        expect(MaterialShapes.PixelTriangle).toBe(getMaterialShapePolygon('pixel-triangle'))
    })

    it('morphs cleanly between any pair of the 35 MaterialShapes', () => {
        const polygons = AllMaterialShapeNames.map(name => getMaterialShapePolygon(name))
        for (let i = 0; i < polygons.length; i++) {
            for (let j = 0; j < polygons.length; j++) {
                const morph = new Morph(polygons[i], polygons[j])
                const mid = morph.asCubics(0.5)
                expect(mid.length).toBeGreaterThan(0)
                const last = mid[mid.length - 1]
                expect(last.anchor1X).toBeCloseTo(mid[0].anchor0X, 6)
                expect(last.anchor1Y).toBeCloseTo(mid[0].anchor0Y, 6)
            }
        }
    })
})

describe('androidx.graphics.shapes builders (Shapes.kt)', () => {
    it('builds circle, rectangle, star, pill, and pillStar polygons', () => {
        assertClosedAndNormalized(circlePolygon(10, 1).normalized())
        assertClosedAndNormalized(rectanglePolygon(2, 1, cornerRounding(0.2, 0.5)).normalized())
        assertClosedAndNormalized(
            starPolygon(5, 1, 0.45, cornerRounding(0.15), cornerRounding(0.05)).normalized(),
        )
        assertClosedAndNormalized(pillPolygon(2, 1, 0.2).normalized())
        assertClosedAndNormalized(
            pillStarPolygon(2, 1, 8, 0.6, cornerRounding(0.1), cornerRounding(0.05), null, 0.5).normalized(),
        )
    })

    it('supports perVertexRounding on regular polygons', () => {
        const poly = roundedPolygonFromNumVertices(4, 1, 0, 0, undefined, [
            cornerRounding(1),
            cornerRounding(1),
            cornerRounding(0.2),
            cornerRounding(0.2),
        ]).normalized()
        assertClosedAndNormalized(poly)
    })

    it('throws fast on invalid geometric inputs', () => {
        expect(() => circlePolygon(2)).toThrow()
        expect(() => rectanglePolygon(0, 1)).toThrow()
        expect(() => starPolygon(5, 1, 1.1)).toThrow()
        expect(() => starPolygon(5, -1, 0.5)).toThrow()
        expect(() => pillPolygon(2, 0)).toThrow()
        expect(() => pillStarPolygon(2, 1, 6, 1.5)).toThrow()
        expect(() => roundedPolygonFromVertices([0, 0, 1, 1])).toThrow()
        expect(() => roundedPolygonFromVertices([0, 0, 1, 0, 1])).toThrow()
    })
})

describe('Morph mid-flight interruption & path serialization', () => {
    it('produces valid closed intermediate polygons across arbitrary progress values', () => {
        const pairs: Array<[RoundedPolygon, RoundedPolygon]> = [
            [MaterialShapes.Circle, MaterialShapes.Heart],
            [MaterialShapes.PixelCircle, MaterialShapes.Sunny],
            [MaterialShapes.Square, MaterialShapes.Cookie12Sided],
            [MaterialShapes.Triangle, MaterialShapes.Clover4Leaf],
        ]

        for (const [a, b] of pairs) {
            const morph = new Morph(a, b)
            for (const p of [0.1, 0.25, 0.5, 0.75, 0.9, 1.05]) {
                const midPoly = morph.toPolygon(p)
                expect(midPoly.cubics.length).toBeGreaterThan(0)
                // Must be morphable immediately to a 3rd shape C without throwing.
                const nextMorph = new Morph(midPoly, MaterialShapes.PuffyDiamond)
                const cubics = nextMorph.asCubics(0.5)
                expect(cubics.length).toBeGreaterThan(0)
            }
        }
    })

    it('computes union bounds and maxBounds on Morph', () => {
        const morph = new Morph(MaterialShapes.Pill, MaterialShapes.Square)
        const bounds = morph.calculateBounds()
        const maxBounds = morph.calculateMaxBounds()
        expect(bounds[2] - bounds[0]).toBeCloseTo(1, 3)
        expect(maxBounds[2] - maxBounds[0]).toBeGreaterThanOrEqual(bounds[2] - bounds[0])
    })

    it('supports Compose startAngle, rotation, and box scaling in cubicsToPathData', () => {
        const pathA = cubicsToPathData(MaterialShapes.Triangle.cubics, { scaleX: 100, scaleY: 100 })
        const pathB = cubicsToPathData(MaterialShapes.Triangle.cubics, {
            scaleX: 100,
            scaleY: 100,
            rotation: 90,
        })
        const pathC = cubicsToPathData(MaterialShapes.Triangle.cubics, {
            scaleX: 100,
            scaleY: 100,
            startAngle: 90,
        })
        const pathSame = cubicsToPathData(MaterialShapes.Triangle.cubics, {
            scaleX: 100,
            scaleY: 100,
            startAngle: 270,
        })
        expect(pathA).not.toBe(pathB)
        expect(pathA).not.toBe(pathC)
        expect(pathSame).toBe(pathA)
        expect(pathB.startsWith('M')).toBe(true)
        expect(pathB.endsWith('Z')).toBe(true)
    })

    it('supports fast-check arbitrary parametric shapes without crashing', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 3, max: 14 }),
                fc.double({ min: 0.2, max: 0.9, noNaN: true }),
                fc.double({ min: 0, max: 0.5, noNaN: true }),
                (sides, innerRadius, cornerRadius) => {
                    const poly = resolveShapePolygon({
                        shape: 'star',
                        polygon: null,
                        vertices: null,
                        sides,
                        innerRadius,
                        cornerRadius,
                        innerCornerRadius: null,
                        smoothing: 0,
                        aspectRatio: 1,
                        vertexSpacing: 0.5,
                    })
                    const morph = new Morph(poly, MaterialShapes.Circle)
                    expect(morph.asCubics(0.5).length).toBeGreaterThan(0)
                },
            ),
        )
    })
})

describe('Compose MotionScheme & SpringSimulation', () => {
    it('matches Expressive and Standard MotionScheme spring tokens', () => {
        expect(resolveMotionSpring('expressive', 'fast')).toEqual(MotionScheme.Expressive.FastSpatial)
        expect(resolveMotionSpring('expressive', 'default')).toEqual(MotionScheme.Expressive.DefaultSpatial)
        expect(resolveMotionSpring('expressive', 'slow')).toEqual(MotionScheme.Expressive.SlowSpatial)
        expect(resolveMotionSpring('standard', 'fast')).toEqual(MotionScheme.Standard.FastSpatial)
        expect(resolveMotionSpring('standard', 'default')).toEqual(MotionScheme.Standard.DefaultSpatial)
        expect(resolveMotionSpring('standard', 'slow')).toEqual(MotionScheme.Standard.SlowSpatial)
    })

    it('overshoots underdamped expressive fast spatial spring and settles to target', () => {
        const spring = springMotionAt(MotionScheme.Expressive.FastSpatial)
        let peak = 0
        for (let t = 0; t <= 400; t += 4) {
            peak = Math.max(peak, spring(0, 0, t, 1).value)
        }
        expect(peak).toBeGreaterThan(1.05)
        expect(spring(0, 0, 1000, 1).value).toBeCloseTo(1, 4)

        const duration = estimateAnimationDurationMillis({
            ...MotionScheme.Expressive.FastSpatial,
            initialVelocity: 0,
            initialDisplacement: -10,
            delta: 1,
        })
        expect(duration).toBeGreaterThan(100)
        expect(duration).toBeLessThan(400)
    })
})

describe('ShapeDefinition', () => {
    it('exposes size, outline, variant, and color role tokens', () => {
        expect(ShapeDefinition.flatTokenKeys).toContain('container-size')
        expect(ShapeDefinition.flatTokenKeys).toContain('enabled-filled-container-color')
        expect(ShapeDefinition.flatTokenKeys).toContain('enabled-tonal-container-color')
        expect(ShapeDefinition.flatTokenKeys).toContain('enabled-outlined-outline-color')
        expect(ShapeDefinition.flatTokenKeys).toContain('enabled-elevated-container-color')
        expect(ShapeDefinition.flatTokenKeys).toContain('focus-outline-width')
    })
})

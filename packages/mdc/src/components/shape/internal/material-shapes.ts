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
 * Complete 1:1 TypeScript port of `androidx.compose.material3.MaterialShapes`
 * (all 35 Material Design 3 Expressive predefined shapes), normalized into the
 * `[0, 1] x [0, 1]` unit square.
 *
 * @link https://android.googlesource.com/platform/frameworks/support/+/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/MaterialShapes.kt
 */

import { MaterialShape } from '../shape.interface'
import {
    addPoints,
    angleDegrees,
    point,
    pointDistance,
    rotateDegrees,
    scalePoint,
    subtractPoints,
    toRadians,
    type Point,
} from './point'
import {
    RoundedPolygon,
    Unrounded,
    circlePolygon,
    cornerRounding,
    rectanglePolygon,
    roundedPolygonFromNumVertices,
    roundedPolygonFromVertices,
    starPolygon,
    type RoundedCornerSpec,
} from './rounded-polygon'

const CornerRound15 = cornerRounding(0.15)
const CornerRound20 = cornerRounding(0.2)
const CornerRound30 = cornerRounding(0.3)
const CornerRound50 = cornerRounding(0.5)
const CornerRound100 = cornerRounding(1)

const RotateNeg45 = (p: Point): Point => rotateDegrees(p, -45)
const RotateNeg90 = (p: Point): Point => rotateDegrees(p, -90)
const RotateNeg135 = (p: Point): Point => rotateDegrees(p, -135)

interface ShapePoint {
    readonly o: Point
    readonly r: RoundedCornerSpec
}

const pt = (x: number, y: number, r: RoundedCornerSpec = Unrounded): ShapePoint => ({
    o: point(x, y),
    r,
})

const doRepeat = (shapePoints: readonly ShapePoint[], reps: number, center: Point, mirroring: boolean): ShapePoint[] => {
    if (mirroring) {
        const angles = shapePoints.map(sp => angleDegrees(subtractPoints(sp.o, center)))
        const distances = shapePoints.map(sp => pointDistance(sp.o, center))
        const actualReps = reps * 2
        const sectionAngle = 360 / actualReps
        const result: ShapePoint[] = []
        for (let rep = 0; rep < actualReps; rep++) {
            for (let index = 0; index < shapePoints.length; index++) {
                const i = rep % 2 === 0 ? index : shapePoints.length - 1 - index
                if (i > 0 || rep % 2 === 0) {
                    const angle =
                        sectionAngle * rep + (rep % 2 === 0 ? angles[i] : sectionAngle - angles[i] + 2 * angles[0])
                    const finalPoint = addPoints(
                        scalePoint(point(Math.cos(toRadians(angle)), Math.sin(toRadians(angle))), distances[i]),
                        center,
                    )
                    result.push({ o: finalPoint, r: shapePoints[i].r })
                }
            }
        }
        return result
    }
    const result: ShapePoint[] = []
    const np = shapePoints.length
    for (let it = 0; it < np * reps; it++) {
        const source = shapePoints[it % np]
        result.push({
            o: rotateDegrees(source.o, (Math.floor(it / np) * 360) / reps, center),
            r: source.r,
        })
    }
    return result
}

const customPolygon = (
    shapePoints: readonly ShapePoint[],
    reps: number,
    center: Point = point(0.5, 0.5),
    mirroring = false,
): RoundedPolygon => {
    const actualPoints = doRepeat(shapePoints, reps, center, mirroring)
    const vertices: number[] = []
    const perVertexRounding: RoundedCornerSpec[] = []
    for (const p of actualPoints) {
        vertices.push(p.o.x, p.o.y)
        perVertexRounding.push(p.r)
    }
    return roundedPolygonFromVertices(vertices, Unrounded, perVertexRounding, center.x, center.y)
}

const Cache = new Map<MaterialShape, RoundedPolygon>()

const cached = (key: MaterialShape, factory: () => RoundedPolygon): RoundedPolygon => {
    let existing = Cache.get(key)
    if (!existing) {
        existing = factory().normalized()
        Cache.set(key, existing)
    }
    return existing
}

/**
 * Predefined Material Design 3 Expressive shapes as normalized `RoundedPolygon`s,
 * mirroring `androidx.compose.material3.MaterialShapes`.
 */
export const MaterialShapes = {
    /** A circle shape. */
    get Circle(): RoundedPolygon {
        return cached(MaterialShape.Circle, () => circlePolygon(10))
    },

    /** A rounded square shape. */
    get Square(): RoundedPolygon {
        return cached(MaterialShape.Square, () => rectanglePolygon(1, 1, CornerRound30))
    },

    /** A slanted square shape. */
    get Slanted(): RoundedPolygon {
        return cached(MaterialShape.Slanted, () =>
            customPolygon(
                [pt(0.926, 0.97, cornerRounding(0.189, 0.811)), pt(-0.021, 0.967, cornerRounding(0.187, 0.057))],
                2,
            ),
        )
    },

    /** An arch shape. */
    get Arch(): RoundedPolygon {
        return cached(MaterialShape.Arch, () =>
            roundedPolygonFromNumVertices(4, 1, 0, 0, Unrounded, [
                CornerRound100,
                CornerRound100,
                CornerRound20,
                CornerRound20,
            ]).transformed(RotateNeg135),
        )
    },

    /** A fan shape. */
    get Fan(): RoundedPolygon {
        return cached(MaterialShape.Fan, () =>
            customPolygon(
                [
                    pt(1.004, 1.0, cornerRounding(0.148, 0.417)),
                    pt(0.0, 1.0, cornerRounding(0.151)),
                    pt(0.0, -0.003, cornerRounding(0.148)),
                    pt(0.978, 0.02, cornerRounding(0.803)),
                ],
                1,
            ),
        )
    },

    /** An arrow shape. */
    get Arrow(): RoundedPolygon {
        return cached(MaterialShape.Arrow, () =>
            customPolygon(
                [
                    pt(0.5, 0.892, cornerRounding(0.313)),
                    pt(-0.216, 1.05, cornerRounding(0.207)),
                    pt(0.499, -0.16, cornerRounding(0.215, 1.0)),
                    pt(1.225, 1.06, cornerRounding(0.211)),
                ],
                1,
            ),
        )
    },

    /** A semi-circle shape. */
    get SemiCircle(): RoundedPolygon {
        return cached(MaterialShape.SemiCircle, () =>
            rectanglePolygon(1.6, 1, Unrounded, [CornerRound20, CornerRound20, CornerRound100, CornerRound100]),
        )
    },

    /** An oval shape. */
    get Oval(): RoundedPolygon {
        return cached(MaterialShape.Oval, () =>
            circlePolygon()
                .transformed(p => point(p.x, p.y * 0.64))
                .transformed(RotateNeg45),
        )
    },

    /** A pill shape. */
    get Pill(): RoundedPolygon {
        return cached(MaterialShape.Pill, () =>
            customPolygon(
                [pt(0.961, 0.039, cornerRounding(0.426)), pt(1.001, 0.428), pt(1.0, 0.609, cornerRounding(1.0))],
                2,
                point(0.5, 0.5),
                true,
            ),
        )
    },

    /** A rounded triangle shape. */
    get Triangle(): RoundedPolygon {
        return cached(MaterialShape.Triangle, () =>
            roundedPolygonFromNumVertices(3, 1, 0, 0, CornerRound20).transformed(RotateNeg90),
        )
    },

    /** A diamond shape. */
    get Diamond(): RoundedPolygon {
        return cached(MaterialShape.Diamond, () =>
            customPolygon(
                [pt(0.5, 1.096, cornerRounding(0.151, 0.524)), pt(0.04, 0.5, cornerRounding(0.159))],
                2,
            ),
        )
    },

    /** A clam-shell shape. */
    get ClamShell(): RoundedPolygon {
        return cached(MaterialShape.ClamShell, () =>
            customPolygon(
                [
                    pt(0.171, 0.841, cornerRounding(0.159)),
                    pt(-0.02, 0.5, cornerRounding(0.14)),
                    pt(0.17, 0.159, cornerRounding(0.159)),
                ],
                2,
            ),
        )
    },

    /** A pentagon shape. */
    get Pentagon(): RoundedPolygon {
        return cached(MaterialShape.Pentagon, () =>
            customPolygon(
                [
                    pt(0.5, -0.009, cornerRounding(0.172)),
                    pt(1.03, 0.365, cornerRounding(0.164)),
                    pt(0.828, 0.97, cornerRounding(0.169)),
                ],
                1,
                point(0.5, 0.5),
                true,
            ),
        )
    },

    /** A gem shape. */
    get Gem(): RoundedPolygon {
        return cached(MaterialShape.Gem, () =>
            customPolygon(
                [
                    pt(0.499, 1.023, cornerRounding(0.241, 0.778)),
                    pt(-0.005, 0.792, cornerRounding(0.208)),
                    pt(0.073, 0.258, cornerRounding(0.228)),
                    pt(0.433, -0.0, cornerRounding(0.491)),
                ],
                1,
                point(0.5, 0.5),
                true,
            ),
        )
    },

    /** A sunny shape. */
    get Sunny(): RoundedPolygon {
        return cached(MaterialShape.Sunny, () => starPolygon(8, 1, 0.8, CornerRound15))
    },

    /** A very-sunny shape. */
    get VerySunny(): RoundedPolygon {
        return cached(MaterialShape.VerySunny, () =>
            customPolygon([pt(0.5, 1.08, cornerRounding(0.085)), pt(0.358, 0.843, cornerRounding(0.085))], 8),
        )
    },

    /** A 4-sided cookie shape. */
    get Cookie4Sided(): RoundedPolygon {
        return cached(MaterialShape.Cookie4Sided, () =>
            customPolygon([pt(1.237, 1.236, cornerRounding(0.258)), pt(0.5, 0.918, cornerRounding(0.233))], 4),
        )
    },

    /** A 6-sided cookie shape. */
    get Cookie6Sided(): RoundedPolygon {
        return cached(MaterialShape.Cookie6Sided, () =>
            customPolygon([pt(0.723, 0.884, cornerRounding(0.394)), pt(0.5, 1.099, cornerRounding(0.398))], 6),
        )
    },

    /** A 7-sided cookie shape. */
    get Cookie7Sided(): RoundedPolygon {
        return cached(MaterialShape.Cookie7Sided, () =>
            starPolygon(7, 1, 0.75, CornerRound50).transformed(RotateNeg90),
        )
    },

    /** A 9-sided cookie shape. */
    get Cookie9Sided(): RoundedPolygon {
        return cached(MaterialShape.Cookie9Sided, () =>
            starPolygon(9, 1, 0.8, CornerRound50).transformed(RotateNeg90),
        )
    },

    /** A 12-sided cookie shape. */
    get Cookie12Sided(): RoundedPolygon {
        return cached(MaterialShape.Cookie12Sided, () =>
            starPolygon(12, 1, 0.8, CornerRound50).transformed(RotateNeg90),
        )
    },

    /** A ghost-ish shape. */
    get Ghostish(): RoundedPolygon {
        return cached(MaterialShape.Ghostish, () =>
            customPolygon(
                [
                    pt(0.5, 0, cornerRounding(1.0)),
                    pt(1, 0, cornerRounding(1.0)),
                    pt(1, 1.14, cornerRounding(0.254, 0.106)),
                    pt(0.575, 0.906, cornerRounding(0.253)),
                ],
                1,
                point(0.5, 0.5),
                true,
            ),
        )
    },

    /** A 4-leaf clover shape. */
    get Clover4Leaf(): RoundedPolygon {
        return cached(MaterialShape.Clover4Leaf, () =>
            customPolygon([pt(0.5, 0.074), pt(0.725, -0.099, cornerRounding(0.476))], 4, point(0.5, 0.5), true),
        )
    },

    /** An 8-leaf clover shape. */
    get Clover8Leaf(): RoundedPolygon {
        return cached(MaterialShape.Clover8Leaf, () =>
            customPolygon([pt(0.5, 0.036), pt(0.758, -0.101, cornerRounding(0.209))], 8),
        )
    },

    /** A burst shape. */
    get Burst(): RoundedPolygon {
        return cached(MaterialShape.Burst, () =>
            customPolygon([pt(0.5, -0.006, cornerRounding(0.006)), pt(0.592, 0.158, cornerRounding(0.006))], 12),
        )
    },

    /** A soft-burst shape. */
    get SoftBurst(): RoundedPolygon {
        return cached(MaterialShape.SoftBurst, () =>
            customPolygon([pt(0.193, 0.277, cornerRounding(0.053)), pt(0.176, 0.055, cornerRounding(0.053))], 10),
        )
    },

    /** A boom shape. */
    get Boom(): RoundedPolygon {
        return cached(MaterialShape.Boom, () =>
            customPolygon([pt(0.457, 0.296, cornerRounding(0.007)), pt(0.5, -0.051, cornerRounding(0.007))], 15),
        )
    },

    /** A soft-boom shape. */
    get SoftBoom(): RoundedPolygon {
        return cached(MaterialShape.SoftBoom, () =>
            customPolygon(
                [
                    pt(0.733, 0.454),
                    pt(0.839, 0.437, cornerRounding(0.532)),
                    pt(0.949, 0.449, cornerRounding(0.439, 1.0)),
                    pt(0.998, 0.478, cornerRounding(0.174)),
                ],
                16,
                point(0.5, 0.5),
                true,
            ),
        )
    },

    /** A flower shape. */
    get Flower(): RoundedPolygon {
        return cached(MaterialShape.Flower, () =>
            customPolygon(
                [
                    pt(0.37, 0.187),
                    pt(0.416, 0.049, cornerRounding(0.381)),
                    pt(0.479, 0.001, cornerRounding(0.095)),
                ],
                8,
                point(0.5, 0.5),
                true,
            ),
        )
    },

    /** A puffy shape. */
    get Puffy(): RoundedPolygon {
        return cached(MaterialShape.Puffy, () =>
            customPolygon(
                [
                    pt(0.5, 0.053),
                    pt(0.545, -0.04, cornerRounding(0.405)),
                    pt(0.67, -0.035, cornerRounding(0.426)),
                    pt(0.717, 0.066, cornerRounding(0.574)),
                    pt(0.722, 0.128),
                    pt(0.777, 0.002, cornerRounding(0.36)),
                    pt(0.914, 0.149, cornerRounding(0.66)),
                    pt(0.926, 0.289, cornerRounding(0.66)),
                    pt(0.881, 0.346),
                    pt(0.94, 0.344, cornerRounding(0.126)),
                    pt(1.003, 0.437, cornerRounding(0.255)),
                ],
                2,
                point(0.5, 0.5),
                true,
            ).transformed(p => point(p.x, p.y * 0.742)),
        )
    },

    /** A puffy-diamond shape. */
    get PuffyDiamond(): RoundedPolygon {
        return cached(MaterialShape.PuffyDiamond, () =>
            customPolygon(
                [
                    pt(0.87, 0.13, cornerRounding(0.146)),
                    pt(0.818, 0.357),
                    pt(1.0, 0.332, cornerRounding(0.853)),
                ],
                4,
                point(0.5, 0.5),
                true,
            ),
        )
    },

    /** A pixel-circle shape. */
    get PixelCircle(): RoundedPolygon {
        return cached(MaterialShape.PixelCircle, () =>
            customPolygon(
                [
                    pt(0.5, 0.0),
                    pt(0.704, 0.0),
                    pt(0.704, 0.065),
                    pt(0.843, 0.065),
                    pt(0.843, 0.148),
                    pt(0.926, 0.148),
                    pt(0.926, 0.296),
                    pt(1.0, 0.296),
                ],
                2,
                point(0.5, 0.5),
                true,
            ),
        )
    },

    /** A pixel-triangle shape. */
    get PixelTriangle(): RoundedPolygon {
        return cached(MaterialShape.PixelTriangle, () =>
            customPolygon(
                [
                    pt(0.11, 0.5),
                    pt(0.113, 0.0),
                    pt(0.287, 0.0),
                    pt(0.287, 0.087),
                    pt(0.421, 0.087),
                    pt(0.421, 0.17),
                    pt(0.56, 0.17),
                    pt(0.56, 0.265),
                    pt(0.674, 0.265),
                    pt(0.675, 0.344),
                    pt(0.789, 0.344),
                    pt(0.789, 0.439),
                    pt(0.888, 0.439),
                ],
                1,
                point(0.5, 0.5),
                true,
            ),
        )
    },

    /** A bun shape. */
    get Bun(): RoundedPolygon {
        return cached(MaterialShape.Bun, () =>
            customPolygon(
                [
                    pt(0.796, 0.5),
                    pt(0.853, 0.518, cornerRounding(1)),
                    pt(0.992, 0.631, cornerRounding(1)),
                    pt(0.968, 1.0, cornerRounding(1)),
                ],
                2,
                point(0.5, 0.5),
                true,
            ),
        )
    },

    /** A heart shape. */
    get Heart(): RoundedPolygon {
        return cached(MaterialShape.Heart, () =>
            customPolygon(
                [
                    pt(0.5, 0.268, cornerRounding(0.016)),
                    pt(0.792, -0.066, cornerRounding(0.958)),
                    pt(1.064, 0.276, cornerRounding(1.0)),
                    pt(0.501, 0.946, cornerRounding(0.129)),
                ],
                1,
                point(0.5, 0.5),
                true,
            ),
        )
    },
} as const

const MaterialShapeLookup: Record<MaterialShape, () => RoundedPolygon> = {
    [MaterialShape.Circle]: () => MaterialShapes.Circle,
    [MaterialShape.Square]: () => MaterialShapes.Square,
    [MaterialShape.Slanted]: () => MaterialShapes.Slanted,
    [MaterialShape.Arch]: () => MaterialShapes.Arch,
    [MaterialShape.Fan]: () => MaterialShapes.Fan,
    [MaterialShape.Arrow]: () => MaterialShapes.Arrow,
    [MaterialShape.SemiCircle]: () => MaterialShapes.SemiCircle,
    [MaterialShape.Oval]: () => MaterialShapes.Oval,
    [MaterialShape.Pill]: () => MaterialShapes.Pill,
    [MaterialShape.Triangle]: () => MaterialShapes.Triangle,
    [MaterialShape.Diamond]: () => MaterialShapes.Diamond,
    [MaterialShape.ClamShell]: () => MaterialShapes.ClamShell,
    [MaterialShape.Pentagon]: () => MaterialShapes.Pentagon,
    [MaterialShape.Gem]: () => MaterialShapes.Gem,
    [MaterialShape.Sunny]: () => MaterialShapes.Sunny,
    [MaterialShape.VerySunny]: () => MaterialShapes.VerySunny,
    [MaterialShape.Cookie4Sided]: () => MaterialShapes.Cookie4Sided,
    [MaterialShape.Cookie6Sided]: () => MaterialShapes.Cookie6Sided,
    [MaterialShape.Cookie7Sided]: () => MaterialShapes.Cookie7Sided,
    [MaterialShape.Cookie9Sided]: () => MaterialShapes.Cookie9Sided,
    [MaterialShape.Cookie12Sided]: () => MaterialShapes.Cookie12Sided,
    [MaterialShape.Ghostish]: () => MaterialShapes.Ghostish,
    [MaterialShape.Clover4Leaf]: () => MaterialShapes.Clover4Leaf,
    [MaterialShape.Clover8Leaf]: () => MaterialShapes.Clover8Leaf,
    [MaterialShape.Burst]: () => MaterialShapes.Burst,
    [MaterialShape.SoftBurst]: () => MaterialShapes.SoftBurst,
    [MaterialShape.Boom]: () => MaterialShapes.Boom,
    [MaterialShape.SoftBoom]: () => MaterialShapes.SoftBoom,
    [MaterialShape.Flower]: () => MaterialShapes.Flower,
    [MaterialShape.Puffy]: () => MaterialShapes.Puffy,
    [MaterialShape.PuffyDiamond]: () => MaterialShapes.PuffyDiamond,
    [MaterialShape.PixelCircle]: () => MaterialShapes.PixelCircle,
    [MaterialShape.PixelTriangle]: () => MaterialShapes.PixelTriangle,
    [MaterialShape.Bun]: () => MaterialShapes.Bun,
    [MaterialShape.Heart]: () => MaterialShapes.Heart,
}

/** Ordered list of all 35 `MaterialShape` names. */
export const AllMaterialShapeNames: readonly MaterialShape[] = Object.values(MaterialShape)

/** Resolves a `MaterialShape` slug into its cached normalized `RoundedPolygon`. */
export const getMaterialShapePolygon = (name: MaterialShape): RoundedPolygon => {
    const resolver = MaterialShapeLookup[name]
    if (!resolver) {
        throw new Error(`Unknown MaterialShape: "${String(name)}"`)
    }
    return resolver()
}

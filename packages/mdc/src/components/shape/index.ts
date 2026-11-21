/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

export * from './shape'
export * from './shape.interface'
export * from './shape.definition'

export { BaseShape } from './internal/base-shape'

export {
    MaterialShapes,
    AllMaterialShapeNames,
    getMaterialShapePolygon,
} from './internal/material-shapes'

export {
    RoundedPolygon,
    Unrounded,
    cornerRounding,
    roundedPolygonFromVertices,
    roundedPolygonFromNumVertices,
    circlePolygon,
    rectanglePolygon,
    starPolygon,
    pillPolygon,
    pillStarPolygon,
    type RoundedCornerSpec,
} from './internal/rounded-polygon'

export {
    Morph,
    cubicsToPathData,
    cubicsAreaCentroid,
    cubicsBoundsCenter,
    type CubicsPathOptions,
} from './internal/morph'

export { Cubic, type PointTransformer } from './internal/cubic'
export { Feature, FeatureCorner, FeatureEdge } from './internal/feature'
export {
    DoubleMapper,
    linearMap,
    featureMapper,
    doMapping,
    featureDistSquared,
    featureRepresentativePoint,
} from './internal/feature-mapping'
export {
    LengthMeasurer,
    MeasuredCubic,
    MeasuredPolygon,
    type Measurer,
    type ProgressableFeature,
} from './internal/measure'
export { point, type Point } from './internal/point'
export {
    MotionScheme,
    resolveMotionSpring,
    springMotionAt,
    estimateAnimationDurationMillis,
    type SpringParameters,
    type SpringMotion,
    type SpringDurationEstimate,
} from './internal/spring'
